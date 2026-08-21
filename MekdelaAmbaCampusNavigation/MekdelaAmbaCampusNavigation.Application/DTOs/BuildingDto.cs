using MekdelaAmbaCampusNavigation.Domain.Enums;

namespace MekdelaAmbaCampusNavigation.Application.DTOs;

public class BuildingDto
{
    public int Id { get; set; } // መታወቂያ ቁጥር
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    
    // 🚀 አዲስ፡ ለ Building Details Page (Image 8)
    public BuildingType Type { get; set; } = BuildingType.Academic;
    public string? OpeningHours { get; set; } = "Mon - Fri  8:00 AM - 5:30 PM";

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int CampusId { get; set; }
}