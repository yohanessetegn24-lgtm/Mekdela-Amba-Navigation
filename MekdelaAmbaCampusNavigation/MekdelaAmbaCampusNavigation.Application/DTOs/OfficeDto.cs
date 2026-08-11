namespace MekdelaAmbaCampusNavigation.Application.DTOs;

public class OfficeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public int FloorNumber { get; set; }
    public int BuildingId { get; set; }
}