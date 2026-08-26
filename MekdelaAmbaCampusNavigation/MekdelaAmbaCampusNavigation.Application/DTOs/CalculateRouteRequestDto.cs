namespace MekdelaAmbaCampusNavigation.Application.DTOs; // Namespace ተስተካክሏል

public class CalculateRouteRequestDto
{
    public double StartLatitude { get; set; } // ከ UserLatitude ወደ StartLatitude ተቀይሯል
    public double StartLongitude { get; set; } // ከ UserLongitude ወደ StartLongitude ተቀይሯል
    public int DestinationBuildingId { get; set; }
    public string TravelMode { get; set; } = "Walking"; 
}