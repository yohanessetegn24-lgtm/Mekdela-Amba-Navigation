using System;
using MekdelaAmbaCampusNavigation.Domain.Enums;

namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class MapEdge
{
    public int Id { get; set; }

    // 🚀 ለመንገዱ ስም እና መለያ (Image 12 ላይ እንዳለው)
    public string? RoadName { get; set; } 
    public string? RoadCode { get; set; } // ለምሳሌ R-025

    public int StartNodeId { get; set; }
    // virtual መጨመሩ ዳታቤዙ መረጃውን በደንብ እንዲያገናኝ ይረዳዋል
    public virtual MapNode StartNode { get; set; } = null!;

    public int EndNodeId { get; set; }
    public virtual MapNode EndNode { get; set; } = null!;

    public double Distance { get; set; } // ርዝመት (በሜትር)

    // 🚀 ለናቪጌሽን ስሌት (Dijkstra) የግድ የሚያስፈልገው ኮድ:
    // 1.0 ማለት መደበኛ መንገድ ነው፣ ቁጥሩ በጨመረ ቁጥር ትራፊክ አለ ማለት ነው
    public double TrafficFactor { get; set; } = 1.0; 

    // 🚀 በ UI ላይ ያሉትን መቆጣጠሪያዎች ለመደገፍ (Road Control)
    public RoadStatus Status { get; set; } = RoadStatus.Active;
    public RoadType Type { get; set; } = RoadType.Both;
    public double Width { get; set; } = 3.5; // የመንገዱ ወርድ
    public string Surface { get; set; } = "Paved"; // አስፋልት፣ ጠጠር ወዘተ

    // 🚀 ለሪፖርትና ለክትትል
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}