using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Domain.Entities;
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

    // 1. 🚀 አዲስ፡ ለተማሪው ካርታ የመንገድ መረብን የሚልክ (GET)
    [HttpGet("network/{campusId}")]
    public async Task<IActionResult> GetNetwork(int campusId)
    {
        // በካምፓሱ ውስጥ ያሉትን ነጥቦች ከነ ትስስሮቻቸው (Edges) አምጣ
        var nodes = await _context.MapNodes
            .Where(n => n.CampusId == campusId)
            .Include(n => n.Edges)
            .ToListAsync();

        return Ok(nodes);
    }

    // 2. መንገዶችን በጅምላ መመዝገቢያ (POST)
    [HttpPost("save-network")]
    public async Task<IActionResult> SaveNetwork([FromBody] RoadNetworkDto networkDto)
    {
        if (networkDto.Nodes == null || networkDto.Nodes.Count < 2) 
            return BadRequest("ቢያንስ 2 ነጥቦች ያስፈልጋሉ!");

        var createdNodes = new List<MapNode>();

        // ነጥቦቹን (Nodes) መመዝገብ
        foreach (var nodeDto in networkDto.Nodes)
        {
            var node = new MapNode
            {
                Latitude = nodeDto.Latitude,
                Longitude = nodeDto.Longitude,
                CampusId = networkDto.CampusId,
                Name = "Path Point"
            };
            _context.MapNodes.Add(node);
            createdNodes.Add(node);
        }
        await _context.SaveChangesAsync();

        // ነጥቦቹን እርስ በርስ ማገናኘት (Edges መፍጠር)
        for (int i = 0; i < createdNodes.Count - 1; i++)
        {
            var edge = new MapEdge
            {
                StartNodeId = createdNodes[i].Id,
                EndNodeId = createdNodes[i + 1].Id,
                Distance = CalculateHaversine(createdNodes[i], createdNodes[i + 1])
            };
            _context.MapEdges.Add(edge);
        }
        await _context.SaveChangesAsync();

        return Ok(new { message = "የመንገድ መረብ በስኬት ተመዝግቧል! 🚀" });
    }

    // 3. 🚀 አዲስ፡ አድሚኑ መንገዶችን ድጋሚ ለመሳል ከፈለገ ለማጽዳት (DELETE)
    [HttpDelete("clear-network/{campusId}")]
    public async Task<IActionResult> ClearNetwork(int campusId)
    {
        var edges = await _context.MapEdges.Where(e => e.StartNode.CampusId == campusId).ToListAsync();
        var nodes = await _context.MapNodes.Where(n => n.CampusId == campusId).ToListAsync();

        _context.MapEdges.RemoveRange(edges);
        _context.MapNodes.RemoveRange(nodes);
        
        await _context.SaveChangesAsync();
        return Ok(new { message = "የካምፓሱ መንገዶች በሙሉ ተሰርዘዋል። አዲስ መሳል ይችላሉ።" });
    }

    // ርቀት ማስያ (Haversine Formula)
    private double CalculateHaversine(MapNode n1, MapNode n2)
    {
        var R = 6371000; // የምድር ራዲየስ በሜትር
        var dLat = (n2.Latitude - n1.Latitude) * Math.PI / 180;
        var dLon = (n2.Longitude - n1.Longitude) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(n1.Latitude * Math.PI / 180) * Math.Cos(n2.Latitude * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
}