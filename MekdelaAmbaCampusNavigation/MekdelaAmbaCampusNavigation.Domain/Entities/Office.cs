namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class Office
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // ለምሳሌ፡ የዲን ቢሮ
    public string RoomNumber { get; set; } = string.Empty;
    public int FloorNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int BuildingId { get; set; }
    public Building Building { get; set; } = null!;
}