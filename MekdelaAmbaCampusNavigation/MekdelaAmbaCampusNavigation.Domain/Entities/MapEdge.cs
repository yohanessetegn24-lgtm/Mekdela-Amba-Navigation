using System;
using MekdelaAmbaCampusNavigation.Domain.Enums;

namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class MapEdge
{
    public int Id { get; set; }

    // 🚀 አዲስ፡ ለመንገዱ ስም እና መለያ (Image 12 ላይ እንዳለው)
    public string? RoadName { get; set; } 
    public string? RoadCode { get; set; } // ለምሳሌ R-025

    public int StartNodeId { get; set; }
    public MapNode StartNode { get; set; } = null!;

    public int EndNodeId { get; set; }
    public MapNode EndNode { get; set; } = null!;

    public double Distance { get; set; } // ርዝመት (በሜትር)

    // 🚀 አዲስ፡ በ UI ላይ ያሉትን መቆጣጠሪያዎች ለመደገፍ (Road Control)
    public RoadStatus Status { get; set; } = RoadStatus.Active;
    public RoadType Type { get; set; } = RoadType.Both;
    public double Width { get; set; } = 3.5; // የመንገዱ ወርድ
    public string Surface { get; set; } = "Paved"; // አስፋልት፣ ጠጠር ወዘተ

    // 🚀 አዲስ፡ ለሪፖርትና ለክትትል
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}