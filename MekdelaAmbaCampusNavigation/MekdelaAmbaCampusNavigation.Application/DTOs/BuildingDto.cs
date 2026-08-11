namespace MekdelaAmbaCampusNavigation.Application.DTOs;

public class BuildingDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int CampusId { get; set; } // የትኛው ካምፓስ ውስጥ እንደሆነ ለማወቅ
}