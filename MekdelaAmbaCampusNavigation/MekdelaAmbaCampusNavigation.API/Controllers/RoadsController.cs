using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RoadsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public RoadsController(ApplicationDbContext context) => _context = context;

    [HttpPost("save-network")]
    public async Task<IActionResult> SaveNetwork([FromBody] RoadNetworkDto networkDto)
    {
        if (networkDto.Nodes.Count < 2) return BadRequest("ቢያንስ 2 ነጥቦች ያስፈልጋሉ!");

        var createdNodes = new List<MapNode>();

        // 1. ነጥቦቹን (Nodes) መመዝገብ
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

        // 2. ነጥቦቹን እርስ በርስ ማገናኘት (Edges መፍጠር)
        for (int i = 0; i < createdNodes.Count - 1; i++)
        {
            var edge = new MapEdge
            {
                StartNodeId = createdNodes[i].Id,
                EndNodeId = createdNodes[i + 1].Id,
                // 🚀 እውነተኛውን ርቀት በሜትር እናስላ
                Distance = CalculateHaversine(createdNodes[i], createdNodes[i + 1])
            };
            _context.MapEdges.Add(edge);
        }
        await _context.SaveChangesAsync();

        return Ok(new { message = "የመንገድ መረብ በስኬት ተመዝግቧል! 🚀" });
    }

    // ርቀት ማስያ (Haversine Formula)
    private double CalculateHaversine(MapNode n1, MapNode n2)
    {
        var R = 6371000; // የምድር ራዲየስ በሜትር
        var dLat = (n2.Latitude - n1.Latitude) * Math.PI / 180;
        var dLon = (n2.Longitude - n1.Longitude) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(n1.Latitude * Math.PI / 180) * Math.Cos(n2.Latitude * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2); // 👈 እዚህ ጋር 'S' መሆኑን አረጋግጥ
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
}