namespace MekdelaAmbaCampusNavigation.Application.DTOs;

public class CalculateRouteRequestDto
{
    // ተማሪው አሁን ያለበት የ GPS ቦታ
    public double StartLatitude { get; set; }
    public double StartLongitude { get; set; }

    // መድረስ የሚፈልግበት ህንጻ መለያ ቁጥር (ID)
    public int DestinationBuildingId { get; set; }

    // አማራጭ፡ ለእግረኛ ወይስ ለመኪና? (Default: Walking)
    public string TravelMode { get; set; } = "Walking";
}