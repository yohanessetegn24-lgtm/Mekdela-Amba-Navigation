namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class Building
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // ለምሳሌ፡ ብሎክ 1
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty; // የህንጻው ፎቶ

    // GPS Coordinates
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // ህንጻው የትኛው ካምፓስ ውስጥ እንደሆነ ለማወቅ
    public int CampusId { get; set; }
    public Campus Campus { get; set; } = null!;
}