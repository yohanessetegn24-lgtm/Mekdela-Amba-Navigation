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

    public async Task<NavigationResultDto> CalculateRoute(CalculateRouteRequestDto request)
    {
        var building = await _context.Buildings.FindAsync(request.DestinationBuildingId);
        if (building == null) return null;

        // 🚀 ማሻሻያ 1: በመንገድ አይነት (Walking vs Driving) መለየት
        // ተማሪው 'Driving' ከመረጠ የ'Pedestrian' መንገዶችን አይጠቀምም
        var allNodes = await _context.MapNodes
            .Include(n => n.Edges.Where(e => e.Status == RoadStatus.Active)) 
            .Where(n => n.CampusId == building.CampusId)
            .ToListAsync();

        if (!allNodes.Any()) return null;

        // 📍 SNAP TO ROAD
        var startNode = allNodes.OrderBy(n => GetHaversineDistance(request.StartLatitude, request.StartLongitude, n.Latitude, n.Longitude)).First();
        var endNode = allNodes.OrderBy(n => GetHaversineDistance(building.Latitude, building.Longitude, n.Latitude, n.Longitude)).First();

        // 🧠 DIJKSTRA: አሁን ተማሪው የመረጠውን TravelMode ያውቃል
        var pathNodes = RunDijkstra(allNodes, startNode.Id, endNode.Id, request.TravelMode);

        if (pathNodes == null || !pathNodes.Any()) return null;

        var totalDistance = CalculateTotalPathDistance(pathNodes);
        
        // 🚀 ማሻሻያ 2: ተለዋዋጭ ETA (Estimated Time)
        // በእግር 80m/min | በመኪና 300m/min (20km/h ገደማ)
        double speed = request.TravelMode.Equals("Driving", StringComparison.OrdinalIgnoreCase) ? 300 : 80;

        var result = new NavigationResultDto
        {
            TotalDistanceMeters = totalDistance,
            EstimatedMinutes = (int)Math.Max(1, Math.Round(totalDistance / speed)),
            Path = pathNodes.Select(n => new CoordinateDto { Latitude = n.Latitude, Longitude = n.Longitude }).ToList()
        };

        return result;
    }

    private List<MapNode> RunDijkstra(List<MapNode> nodes, int startId, int endId, string travelMode)
    {
        var distances = nodes.ToDictionary(n => n.Id, n => double.MaxValue);
        var previous = nodes.ToDictionary(n => n.Id, n => (int?)null);
        var unvisited = nodes.Select(n => n.Id).ToList();

        distances[startId] = 0;

        while (unvisited.Any())
        {
            var currentId = unvisited.OrderBy(id => distances[id]).First();
            unvisited.Remove(currentId);

            if (currentId == endId || distances[currentId] == double.MaxValue) break;

            var currentNode = nodes.First(n => n.Id == currentId);
            foreach (var edge in currentNode.Edges)
            {
                // 🚀 ማሻሻያ 3: የ "Road Type" ገደብን ቼክ ማድረግ
                // Driving ከሆነ እና መንገዱ ለደረጃ/ለእግር ብቻ ከሆነ አልጎሪዝሙ ይዘለዋል
                if (travelMode.Equals("Driving", StringComparison.OrdinalIgnoreCase) && edge.Type == RoadType.Pedestrian)
                    continue;

                var neighborId = edge.EndNodeId;
                if (!unvisited.Contains(neighborId)) continue;

                var alt = distances[currentId] + edge.Distance;
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

        return distances[endId] == double.MaxValue ? null : path;
    }

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

    private double CalculateTotalPathDistance(List<MapNode> path)
    {
        double total = 0;
        for (int i = 0; i < path.Count - 1; i++)
            total += GetHaversineDistance(path[i].Latitude, path[i].Longitude, path[i+1].Latitude, path[i+1].Longitude);
        return Math.Round(total, 2);
    }
}