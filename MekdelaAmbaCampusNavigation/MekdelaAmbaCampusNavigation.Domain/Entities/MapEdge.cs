namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class MapEdge
{
    public int Id { get; set; }

    // የመንገዱ መጀመሪያ ነጥብ
    public int StartNodeId { get; set; }
    public MapNode StartNode { get; set; } = null!;

    // የመንገዱ መጨረሻ ነጥብ
    public int EndNodeId { get; set; }
    public MapNode EndNode { get; set; } = null!;

    public double Distance { get; set; } // የመንገዱ ርዝመት (በሜትር)
}