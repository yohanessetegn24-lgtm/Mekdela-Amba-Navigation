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

    // 1. 🚀 ሁሉንም የመንገድ መረብ ዳታ ማምጫ
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

    // 2. 🛠️ የመንገድ መረብን መመዝገቢያ
    [HttpPost("save-network")]
    public async Task<IActionResult> SaveNetwork([FromBody] RoadNetworkDto networkDto)
    {
        if (networkDto == null || networkDto.Nodes == null || networkDto.Nodes.Count < 2)
            return BadRequest(new { message = "ቢያንስ 2 ነጥቦች ያስፈልጋሉ!" });

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var createdNodes = new List<MapNode>();
            foreach (var nodeDto in networkDto.Nodes)
            {
                var node = new MapNode
                {
                    Latitude = nodeDto.Latitude,
                    Longitude = nodeDto.Longitude,
                    CampusId = networkDto.CampusId,
                    Name = "Road Node"
                };
                _context.MapNodes.Add(node);
                createdNodes.Add(node);
            }
            await _context.SaveChangesAsync();

            for (int i = 0; i < createdNodes.Count - 1; i++)
            {
                var nodeA = createdNodes[i];
                var nodeB = createdNodes[i + 1];
                var dist = CalculateHaversine(nodeA, nodeB);

                var edgeForward = new MapEdge 
                { 
                    StartNodeId = nodeA.Id, 
                    EndNodeId = nodeB.Id, 
                    Distance = dist,
                    RoadName = networkDto.RoadName ?? "Internal Campus Road",
                    RoadCode = networkDto.RoadCode ?? $"R-{new Random().Next(100, 999)}",
                    Status = networkDto.Status,
                    Type = networkDto.Type      
                };

                var edgeBackward = new MapEdge 
                { 
                    StartNodeId = nodeB.Id, 
                    EndNodeId = nodeA.Id, 
                    Distance = dist,
                    RoadName = edgeForward.RoadName,
                    RoadCode = edgeForward.RoadCode,
                    Status = edgeForward.Status,
                    Type = edgeForward.Type
                };

                _context.MapEdges.Add(edgeForward);
                _context.MapEdges.Add(edgeBackward);
            }

            await AutoLinkIntersections(createdNodes);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "የመንገድ መረብ በስኬት ተመዝግቧል! 🚀", nodesCount = createdNodes.Count });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "ስህተት ተፈጥሯል!", detail = ex.Message });
        }
    }

    // 3. 🔴 የመንገድ ሁኔታን መለወጫ
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

    // 4. 📝 የመንገድ መረጃዎችን ማስተካከያ (Edit Road)
    // 🚀 ለውጥ፦ 405 ስህተትን ለመከላከል ስሙ 'update-segment' ሆኗል
    [HttpPost("update-segment/{edgeId}")] 
    public async Task<IActionResult> EditRoadSegment(int edgeId, [FromBody] RoadUpdateDto updateDto)
    {
        if (updateDto == null) return BadRequest(new { message = "መረጃው አልተሟላም!" });

        var edge = await _context.MapEdges.FindAsync(edgeId);
        if (edge == null) return NotFound(new { message = "መንገዱ አልተገኘም!" });

        // ዋናውን መንገድ ማዘመን
        edge.RoadName = updateDto.RoadName;
        edge.Status = updateDto.Status;
        edge.Type = updateDto.RoadType; 
        edge.UpdatedAt = DateTime.UtcNow;

        // 🚀 አብሮት ያለውን ተመላላሽ መንገድ (Backward Edge) አብሮ ማዘመን
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

    // 5. 🗑️ አንድን የመንገድ segment ማጥፋት
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

    private async Task AutoLinkIntersections(List<MapNode> newNodes)
    {
        for (int i = 0; i < newNodes.Count; i++)
        {
            for (int j = i + 1; j < newNodes.Count; j++)
            {
                var d = CalculateHaversine(newNodes[i], newNodes[j]);
                if (d < 1.5)
                {
                    _context.MapEdges.Add(new MapEdge { StartNodeId = newNodes[i].Id, EndNodeId = newNodes[j].Id, Distance = d });
                    _context.MapEdges.Add(new MapEdge { StartNodeId = newNodes[j].Id, EndNodeId = newNodes[i].Id, Distance = d });
                }
            }
        }
    }

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

    private double CalculateHaversine(MapNode n1, MapNode n2)
    {
        var R = 6371000; 
        var dLat = (n2.Latitude - n1.Latitude) * Math.PI / 180;
        var dLon = (n2.Longitude - n1.Longitude) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(n1.Latitude * Math.PI / 180) * Math.Cos(n2.Latitude * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
}

// 🚀 ለዝመና የሚያገለግል DTO (ሁልጊዜ ከ Controller ውጭ ወይም በተለየ ፋይል ቢቀመጥ ይመረጣል)
public class RoadUpdateDto
{
    public string RoadName { get; set; }
    public RoadStatus Status { get; set; }
    public RoadType RoadType { get; set; }
}