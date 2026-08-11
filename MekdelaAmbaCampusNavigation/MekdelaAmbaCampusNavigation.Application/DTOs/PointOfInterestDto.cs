using MekdelaAmbaCampusNavigation.Domain.Enums;

namespace MekdelaAmbaCampusNavigation.Application.DTOs;

public class PointOfInterestDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public POICategory Category { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int CampusId { get; set; }
    public int? BuildingId { get; set; } // የግድ ህንጻ ውስጥ ላይሆን ይችላል
}