namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class Campus
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // ለምሳሌ፡ መካነ ሰላም
    public string Description { get; set; } = string.Empty;
    public double Latitude { get; set; }  // ለካርታው መገኛ (GPS)
    public double Longitude { get; set; } // ለካርታው መገኛ (GPS)

    // አንድ ካምፓስ ብዙ ህንጻዎች ይኖሩታል
    public ICollection<Building> Buildings { get; set; } = new List<Building>();
}