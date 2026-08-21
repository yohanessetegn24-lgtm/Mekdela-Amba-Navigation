using MekdelaAmbaCampusNavigation.Domain.Enums;
using System.Collections.Generic;

namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class Building
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    // 🚀 አዲስ፡ ለ Building Details Page (Image 8)
    public BuildingType Type { get; set; } = BuildingType.Academic;
    public string? OpeningHours { get; set; } = "Mon - Fri  8:00 AM - 5:30 PM";

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public int CampusId { get; set; }
    public Campus Campus { get; set; } = null!;

    // 🚀 አዲስ፡ አንድ ህንጻ ብዙ ቢሮዎች ይኖሩታል
    public ICollection<Office> Offices { get; set; } = new List<Office>();
}