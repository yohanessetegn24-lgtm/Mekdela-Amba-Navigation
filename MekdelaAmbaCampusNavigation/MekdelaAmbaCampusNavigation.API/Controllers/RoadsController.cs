using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using MekdelaAmbaCampusNavigation.Domain.Enums; 
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RoadsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public RoadsController(ApplicationDbContext context) => _context = context;

    // 1. 🚀 ሁሉንም የመንገድ መረብ ዳታ ማምጫ (ያልተነካ)
    [HttpGet("network/{campusId}")]
    public async Task<IActionResult> GetNetwork(int campusId)
    {
        var nodes = await _context.MapNodes
            .AsNoTracking()
            .Where(n => n.CampusId == campusId)
            .Include(n => n.Edges) 
            .ToListAsync();

        return Ok(nodes);
    }

    // 2. 🛠️ የመንገድ መረብን መመዝገቢያ (UPDATED for Phase 1)
    [HttpPost("save-network")]
    public async Task<IActionResult> SaveNetwork([FromBody] RoadNetworkDto networkDto)
    {
        if (networkDto == null || networkDto.Nodes == null || networkDto.Nodes.Count < 2)
            return BadRequest(new { message = "ቢያንስ 2 ነጥቦች ያስፈልጋሉ!" });

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // የካምፓሱን ነባር ኖዶች መጫን (ለማነጻጸር)
            var existingCampusNodes = await _context.MapNodes
                .Where(n => n.CampusId == networkDto.CampusId)
                .ToListAsync();

            var resolvedNodeIds = new List<int>();

            // ኖዶችን የማጣራት እና የመመዝገብ ሂደት
            foreach (var nodeDto in networkDto.Nodes)
            {
                // በ 0.5 ሜትር ክልል ውስጥ ተመሳሳይ ኖድ ካለ እሱን ይጠቀማል (Node Reuse)
                var existingNode = existingCampusNodes.FirstOrDefault(n => 
                    CalculateHaversineRaw(n.Latitude, n.Longitude, nodeDto.Latitude, nodeDto.Longitude) < 0.5);

                if (existingNode != null)
                {
                    resolvedNodeIds.Add(existingNode.Id);
                }
                else
                {
                    var newNode = new MapNode
                    {
                        Latitude = nodeDto.Latitude,
                        Longitude = nodeDto.Longitude,
                        CampusId = networkDto.CampusId,
                        Name = "Road Node"
                    };
                    _context.MapNodes.Add(newNode);
                    await _context.SaveChangesAsync(); // ID እንዲወጣለት
                    
                    resolvedNodeIds.Add(newNode.Id);
                    existingCampusNodes.Add(newNode); // ለቀጣይ loop እንዲያገኘው
                }
            }

            // በመካከላቸው Edge መፍጠር
            for (int i = 0; i < resolvedNodeIds.Count - 1; i++)
            {
                int startId = resolvedNodeIds[i];
                int endId = resolvedNodeIds[i + 1];

                // ርቀቱ 0 ከሆነ (ተመሳሳይ ነጥብ) መንገድ አይፈጠርም (Zero-distance Guard)
                if (startId == endId) continue;

                // መንገዱ ቀድሞ ካለ በድጋሚ እንዳይፈጠር ቼክ እናደርጋለን
                var edgeExists = await _context.MapEdges.AnyAsync(e => 
                    (e.StartNodeId == startId && e.EndNodeId == endId) || 
                    (e.StartNodeId == endId && e.EndNodeId == startId));

                if (!edgeExists)
                {
                    var nodeA = existingCampusNodes.First(n => n.Id == startId);
                    var nodeB = existingCampusNodes.First(n => n.Id == endId);
                    var dist = CalculateHaversineRaw(nodeA.Latitude, nodeA.Longitude, nodeB.Latitude, nodeB.Longitude);

                    var edgeForward = new MapEdge 
                    { 
                        StartNodeId = startId, 
                        EndNodeId = endId, 
                        Distance = dist,
                        RoadName = networkDto.RoadName ?? "Internal Campus Road",
                        RoadCode = networkDto.RoadCode ?? $"R-{new Random().Next(100, 999)}",
                        Status = networkDto.Status,
                        Type = networkDto.Type,
                        TrafficFactor = 1.0      
                    };

                    var edgeBackward = new MapEdge 
                    { 
                        StartNodeId = endId, 
                        EndNodeId = startId, 
                        Distance = dist,
                        RoadName = edgeForward.RoadName,
                        RoadCode = edgeForward.RoadCode,
                        Status = edgeForward.Status,
                        Type = edgeForward.Type,
                        TrafficFactor = 1.0
                    };

                    _context.MapEdges.Add(edgeForward);
                    _context.MapEdges.Add(edgeBackward);
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "የመንገድ መረብ በስኬት ተመዝግቧል! 🚀" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "ስህተት ተፈጥሯል!", detail = ex.Message });
        }
    }

    // 3. 🔴 የመንገድ ሁኔታን መለወጫ (ያልተነካ)
    [HttpPut("update-status/{edgeId}")]
    public async Task<IActionResult> UpdateStatus(int edgeId, [FromBody] RoadStatus status)
    {
        var edge = await _context.MapEdges.FindAsync(edgeId);
        if (edge == null) return NotFound();

        edge.Status = status;
        edge.UpdatedAt = DateTime.UtcNow;

        var reverseEdge = await _context.MapEdges
            .FirstOrDefaultAsync(e => e.StartNodeId == edge.EndNodeId && e.EndNodeId == edge.StartNodeId);
        if (reverseEdge != null) reverseEdge.Status = status;

        await _context.SaveChangesAsync();
        return Ok(new { message = $"የመንገዱ ሁኔታ ወደ {status} ተቀይሯል!" });
    }

    // 4. 📝 የመንገድ መረጃዎችን ማስተካከያ (ያልተነካ)
    [HttpPost("update-segment/{edgeId}")] 
    public async Task<IActionResult> EditRoadSegment(int edgeId, [FromBody] RoadUpdateDto updateDto)
    {
        if (updateDto == null) return BadRequest(new { message = "መረጃው አልተሟላም!" });

        var edge = await _context.MapEdges.FindAsync(edgeId);
        if (edge == null) return NotFound(new { message = "መንገዱ አልተገኘም!" });

        edge.RoadName = updateDto.RoadName;
        edge.Status = updateDto.Status;
        edge.Type = updateDto.RoadType; 
        edge.UpdatedAt = DateTime.UtcNow;

        var reverseEdge = await _context.MapEdges
            .FirstOrDefaultAsync(e => e.StartNodeId == edge.EndNodeId && e.EndNodeId == edge.StartNodeId);
        
        if (reverseEdge != null)
        {
            reverseEdge.RoadName = updateDto.RoadName;
            reverseEdge.Status = updateDto.Status;
            reverseEdge.Type = updateDto.RoadType;
            reverseEdge.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "የመንገዱ መረጃ በስኬት ተዘምኗል! ✅" });
    }

    // 5. 🗑️ አንድን የመንገድ segment ማጥፋት (ያልተነካ)
    [HttpDelete("segment/{edgeId}")]
    public async Task<IActionResult> DeleteSegment(int edgeId)
    {
        var edge = await _context.MapEdges.FindAsync(edgeId);
        if (edge == null) return NotFound();

        var reverseEdge = await _context.MapEdges
            .FirstOrDefaultAsync(e => e.StartNodeId == edge.EndNodeId && e.EndNodeId == edge.StartNodeId);
        
        if (reverseEdge != null) _context.MapEdges.Remove(reverseEdge);
        _context.MapEdges.Remove(edge);

        await _context.SaveChangesAsync();
        return Ok(new { message = "የመንገዱ ክፍል ተሰርዟል።" });
    }

    // 6. 🧹 ካምፓስን የማጽዳት ስራ
    [HttpDelete("clear-network/{campusId}")]
    public async Task<IActionResult> ClearNetwork(int campusId)
    {
        var nodes = await _context.MapNodes.Where(n => n.CampusId == campusId).ToListAsync();
        var nodeIds = nodes.Select(n => n.Id).ToList();
        var edges = await _context.MapEdges.Where(e => nodeIds.Contains(e.StartNodeId)).ToListAsync();

        _context.MapEdges.RemoveRange(edges);
        _context.MapNodes.RemoveRange(nodes);
        await _context.SaveChangesAsync();
        return Ok(new { message = "የካምፓሱ መንገዶች በሙሉ ተሰርዘዋል።" });
    }

    // 📐 የርቀት ማስያ Helper (Raw coordinates version)
    private double CalculateHaversineRaw(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371000; 
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}

public class RoadUpdateDto
{
    public string RoadName { get; set; }
    public RoadStatus Status { get; set; }
    public RoadType RoadType { get; set; }
}