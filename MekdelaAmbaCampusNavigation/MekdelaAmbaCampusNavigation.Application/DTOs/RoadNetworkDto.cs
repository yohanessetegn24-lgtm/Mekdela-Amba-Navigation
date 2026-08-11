namespace MekdelaAmbaCampusNavigation.Application.DTOs;

public class RoadNodeDto
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class RoadNetworkDto
{
    public int CampusId { get; set; }
    public List<RoadNodeDto> Nodes { get; set; } = new();
}