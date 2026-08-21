using System.Collections.Generic;

namespace MekdelaAmbaCampusNavigation.Application.DTOs;

public class NavigationResultDto
{
    public double TotalDistanceMeters { get; set; }
    public int EstimatedMinutes { get; set; }
    // የመንገዱ መጋጠሚያዎች (ለ React Map)
    public List<CoordinateDto> Path { get; set; } = new List<CoordinateDto>();
}

public class CoordinateDto
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}