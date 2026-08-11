using MekdelaAmbaCampusNavigation.Domain.Enums;

namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class PointOfInterest
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // የትኛው ዓይነት እንደሆነ (ካፌ፣ በር...)
    public POICategory Category { get; set; }

    // GPS Coordinates
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // የትኛው ካምፓስ ውስጥ እንዳለ
    public int CampusId { get; set; }
    public Campus Campus { get; set; } = null!;

    // አማራጭ፡- አንድ የተለየ ህንጻ ውስጥ ከሆነ (ለምሳሌ ካፌው ህንጻ 1 ውስጥ ከሆነ)
    public int? BuildingId { get; set; }
    public Building? Building { get; set; }
}