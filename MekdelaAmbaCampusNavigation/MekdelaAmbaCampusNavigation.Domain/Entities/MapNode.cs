namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class MapNode
{
    public int Id { get; set; }
    public string Name { get; set; } = "Path Node";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int CampusId { get; set; }

    // ይህ ነጥብ ከሌሎች ነጥቦች ጋር ያለው ግንኙነት (Edges)
    public ICollection<MapEdge> Edges { get; set; } = new List<MapEdge>();
}