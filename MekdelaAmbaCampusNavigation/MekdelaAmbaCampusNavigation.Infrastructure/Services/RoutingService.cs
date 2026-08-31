using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using MekdelaAmbaCampusNavigation.Domain.Enums;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Services;

public class RoutingService
{
    private readonly ApplicationDbContext _context;

    public RoutingService(ApplicationDbContext context)
    {
        _context = context;
    }

    // 🧠 ዋናው የናቪጌሽን ስሌት (The Navigation Heart)
    public async Task<NavigationResultDto?> CalculateRoute(CalculateRouteRequestDto request)
    {
        // 1. መድረሻ ህንጻውን ማግኘት
        var building = await _context.Buildings.FindAsync(request.DestinationBuildingId);
        if (building == null) return null;

        // 2. የካምፓሱን የመንገድ መረብ ነጥቦች መጫን
        var allNodes = await _context.MapNodes
            .Where(n => n.CampusId == building.CampusId)
            .ToListAsync();

        if (allNodes == null || !allNodes.Any()) return null;

        var campusNodeIds = allNodes.Select(n => n.Id).ToList();

        // 3. ንቁ የሆኑ (Active) መንገዶችን ብቻ መጫን
        var allEdges = await _context.MapEdges
            .Where(e =>
                e.Status == RoadStatus.Active &&
                campusNodeIds.Contains(e.StartNodeId) &&
                campusNodeIds.Contains(e.EndNodeId)
            )
            .ToListAsync();

        if (allEdges == null || !allEdges.Any()) return null;

        // 4. 📍 SMART SNAP: ተማሪው ካለበት GPS በጣም የቅርብ ያለውን የመንገድ ነጥብ መፈለግ
        // ርቀቱ እስከ 200 ሜትር ቢሆን እንኳ የቅርቡን ይመርጣል
        var startNode = allNodes
            .OrderBy(n => GetHaversineDistance(request.StartLatitude, request.StartLongitude, n.Latitude, n.Longitude))
            .FirstOrDefault();
        
        // 5. ለህንጻው በር በጣም የቅርብ የሆነውን ነጥብ መፈለግ
        var endNode = allNodes
            .OrderBy(n => GetHaversineDistance(building.Latitude, building.Longitude, n.Latitude, n.Longitude))
            .FirstOrDefault();

        if (startNode == null || endNode == null) return null;

        // --- Debug Information (በ Console ላይ ለዲባግ ይረዳል) ---
        Console.WriteLine("========== ROUTING INFO ==========");
        Console.WriteLine($"Building: {building.Name}");
        Console.WriteLine($"Start Snap Distance: {GetHaversineDistance(request.StartLatitude, request.StartLongitude, startNode.Latitude, startNode.Longitude):F2}m");
        Console.WriteLine($"End Snap Distance: {GetHaversineDistance(building.Latitude, building.Longitude, endNode.Latitude, endNode.Longitude):F2}m");
        Console.WriteLine("==================================");

        // 6. 🚀 A* Algorithm በመጠቀም አጭሩን መንገድ ማስላት
        var pathNodes = RunAStar(allNodes, allEdges, startNode.Id, endNode.Id, request.TravelMode);

        // መንገድ ካልተገኘ (Graph disconnected ከሆነ) null ይመለሳል
        if (pathNodes == null || !pathNodes.Any()) return null;

        // 7. ውጤቱን ማቀናጀት
        var totalDistance = CalculateTotalPathDistance(pathNodes);
        
        // ፍጥነትን መወሰን (በሜትር በደቂቃ) - Driving: 300m/min, Walking: 80m/min
        double speed = request.TravelMode.Equals("Driving", StringComparison.OrdinalIgnoreCase) ? 300 : 80;

        var result = new NavigationResultDto
        {
            TotalDistanceMeters = totalDistance,
            EstimatedMinutes = (int)Math.Max(1, Math.Round(totalDistance / speed)),
            Path = pathNodes.Select(n => new CoordinateDto { 
                Latitude = n.Latitude, 
                Longitude = n.Longitude 
            }).ToList()
        };

        return result;
    }

    // 🧠 A* Algorithm Implementation
    private List<MapNode>? RunAStar(List<MapNode> nodes, List<MapEdge> edges, int startId, int endId, string travelMode)
    {
        var targetNode = nodes.First(n => n.Id == endId);

        var gScore = nodes.ToDictionary(n => n.Id, n => double.MaxValue);
        var fScore = nodes.ToDictionary(n => n.Id, n => double.MaxValue);
        var previous = nodes.ToDictionary(n => n.Id, n => (int?)null);
        
        var openSet = new List<int> { startId };
        gScore[startId] = 0;
        fScore[startId] = GetHaversineDistance(nodes.First(n => n.Id == startId).Latitude, 
                                               nodes.First(n => n.Id == startId).Longitude, 
                                               targetNode.Latitude, targetNode.Longitude);

        while (openSet.Any())
        {
            var currentId = openSet.OrderBy(id => fScore[id]).First();

            if (currentId == endId) break;

            openSet.Remove(currentId);

            // አሁን ካለንበት ነጥብ የሚወጡ መንገዶችን መፈለግ (Bidirectional)
            var currentEdges = edges.Where(e => e.StartNodeId == currentId || e.EndNodeId == currentId).ToList();

            foreach (var edge in currentEdges)
            {
                // ለመኪና የማይሆኑ መንገዶችን ማለፍ
                if (travelMode.Equals("Driving", StringComparison.OrdinalIgnoreCase) && edge.Type == RoadType.Pedestrian)
                    continue;

                var neighborId = (edge.StartNodeId == currentId) ? edge.EndNodeId : edge.StartNodeId;
                var neighborNode = nodes.First(n => n.Id == neighborId);

                double weight = edge.TrafficFactor > 0 ? edge.TrafficFactor : 1.0;
                var tentativeGScore = gScore[currentId] + (edge.Distance * weight);

                if (tentativeGScore < gScore[neighborId])
                {
                    previous[neighborId] = currentId;
                    gScore[neighborId] = tentativeGScore;
                    fScore[neighborId] = gScore[neighborId] + GetHaversineDistance(neighborNode.Latitude, neighborNode.Longitude, targetNode.Latitude, targetNode.Longitude);
                    
                    if (!openSet.Contains(neighborId))
                        openSet.Add(neighborId);
                }
            }
        }

        var path = new List<MapNode>();
        int? curr = endId;
        while (curr.HasValue)
        {
            var node = nodes.FirstOrDefault(n => n.Id == curr);
            if (node == null) break;
            path.Insert(0, node);
            curr = previous[curr.Value];
        }

        return (path.Count > 0 && path[0].Id == startId) ? path : null;
    }

    // 📐 የርቀት ማስያ (Haversine Formula)
    private double GetHaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371000; 
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    // 📐 የመንገዱን ጠቅላላ ርዝመት መደመር
    private double CalculateTotalPathDistance(List<MapNode> path)
    {
        double total = 0;
        for (int i = 0; i < path.Count - 1; i++)
            total += GetHaversineDistance(path[i].Latitude, path[i].Longitude, path[i+1].Latitude, path[i+1].Longitude);
        return Math.Round(total, 2);
    }
}