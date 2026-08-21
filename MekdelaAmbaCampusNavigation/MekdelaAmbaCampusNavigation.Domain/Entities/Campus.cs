using System.Collections.Generic;

namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class Campus
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public ICollection<Building> Buildings { get; set; } = new List<Building>();
    
    // 🚀 አዲስ፡ የካምፓሱ የመንገድ መረብ ነጥቦች
    public ICollection<MapNode> MapNodes { get; set; } = new List<MapNode>();
    public ICollection<PointOfInterest> PointsOfInterest { get; set; } = new List<PointOfInterest>();
}