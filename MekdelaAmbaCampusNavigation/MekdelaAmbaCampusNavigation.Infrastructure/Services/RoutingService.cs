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
    // Task<NavigationResultDto?> ማድረጋችን null ሊመለስ እንደሚችል ለሲስተሙ ይነግረዋል (Warning ያጠፋል)
    public async Task<NavigationResultDto?> CalculateRoute(CalculateRouteRequestDto request)
    {
        // 1. መድረሻ ህንጻውን ማግኘት
        var building = await _context.Buildings.FindAsync(request.DestinationBuildingId);
        if (building == null) return null;

        // 2. የካምፓሱን የመንገድ መረብ መጫን 
        var allNodes = await _context.MapNodes
            .Where(n => n.CampusId == building.CampusId)
            .ToListAsync();

        var allEdges = await _context.MapEdges
            .Where(e => e.Status == RoadStatus.Active) 
            .ToListAsync();

        if (allNodes == null || !allNodes.Any() || allEdges == null || !allEdges.Any()) return null;

        // 3. 📍 SNAP TO ROAD: ለተማሪው GPS በጣም ቅርብ ያለውን 'Node' መፈለግ
        var startNode = allNodes
            .OrderBy(n => GetHaversineDistance(request.StartLatitude, request.StartLongitude, n.Latitude, n.Longitude))
            .FirstOrDefault();
        
        // 4. ለህንጻው መግቢያ ቅርብ የሆነውን 'Node' መፈለግ
        var endNode = allNodes
            .OrderBy(n => GetHaversineDistance(building.Latitude, building.Longitude, n.Latitude, n.Longitude))
            .FirstOrDefault();

        if (startNode == null || endNode == null) return null;

        // 5. 🧠 DIJKSTRA ALGORITHM: በመንገዱ ላይ ብቻ ያለውን አጭር መንገድ ያሰላል
        var pathNodes = RunDijkstra(allNodes, allEdges, startNode.Id, endNode.Id, request.TravelMode);

        if (pathNodes == null || !pathNodes.Any()) return null;

        // 6. ውጤቱን ማቀናጀት (Distance + ETA + Path)
        var totalDistance = CalculateTotalPathDistance(pathNodes);
        
        // ፍጥነትን መወሰን (በሜትር በደቂቃ)
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

    // 🧠 Dijkstra Core Logic (Bidirectional & Traffic Aware)
    private List<MapNode>? RunDijkstra(List<MapNode> nodes, List<MapEdge> edges, int startId, int endId, string travelMode)
    {
        var distances = nodes.ToDictionary(n => n.Id, n => double.MaxValue);
        var previous = nodes.ToDictionary(n => n.Id, n => (int?)null);
        var unvisited = nodes.Select(n => n.Id).ToList();

        distances[startId] = 0;

        while (unvisited.Any())
        {
            var currentId = unvisited.OrderBy(id => distances[id]).First();
            if (distances[currentId] == double.MaxValue || currentId == endId) break;
            unvisited.Remove(currentId);

            // መንገዶችን በሁለቱም አቅጣጫ መፈለግ (Bidirectional)
            var currentEdges = edges.Where(e => e.StartNodeId == currentId || e.EndNodeId == currentId).ToList();

            foreach (var edge in currentEdges)
            {
                if (travelMode.Equals("Driving", StringComparison.OrdinalIgnoreCase) && edge.Type == RoadType.Pedestrian)
                    continue;

                var neighborId = (edge.StartNodeId == currentId) ? edge.EndNodeId : edge.StartNodeId;
                
                if (!unvisited.Contains(neighborId)) continue;

                // 🚀 አዲሱ ማሻሻያ፡ TrafficFactor በመጠቀም ክብደትን (Weight) ማስላት
                double trafficWeight = edge.TrafficFactor > 0 ? edge.TrafficFactor : 1.0;
                var alt = distances[currentId] + (edge.Distance * trafficWeight);

                if (alt < distances[neighborId])
                {
                    distances[neighborId] = alt;
                    previous[neighborId] = currentId;
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