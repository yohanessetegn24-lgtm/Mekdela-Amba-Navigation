using System.Collections.Generic;
using MekdelaAmbaCampusNavigation.Domain.Enums;

namespace MekdelaAmbaCampusNavigation.Application.DTOs;

public class RoadNodeDto
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class RoadNetworkDto
{
    public int CampusId { get; set; }
    
    // 🚀 አዲስ፡ ለመንገዱ ዝርዝር መረጃ (Image 12 ላይ እንዳለው)
    public string? RoadName { get; set; }
    public string? RoadCode { get; set; }
    public RoadStatus Status { get; set; } = RoadStatus.Active;
    public RoadType Type { get; set; } = RoadType.Both;

    public List<RoadNodeDto> Nodes { get; set; } = new();
}