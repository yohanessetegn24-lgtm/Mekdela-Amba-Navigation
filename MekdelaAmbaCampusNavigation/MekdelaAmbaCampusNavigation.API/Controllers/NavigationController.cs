using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NavigationController : ControllerBase
{
    private readonly RoutingService _routingService;
    private readonly ILogger<NavigationController> _logger;

    public NavigationController(RoutingService routingService, ILogger<NavigationController> logger)
    {
        _routingService = routingService;
        _logger = logger;
    }

    // 🚀 POST: api/Navigation/calculate
    [HttpPost("calculate")]
    public async Task<IActionResult> CalculateRoute([FromBody] CalculateRouteRequestDto request)
    {
        if (request == null)
            return BadRequest(new { message = "የተሳሳተ መረጃ ተልኳል።" });

        if (request.DestinationBuildingId <= 0)
            return BadRequest(new { message = "እባክዎ መድረሻ ህንጻ ይምረጡ!" });

        if (request.StartLatitude == 0 || request.StartLongitude == 0)
            return BadRequest(new { message = "የእርስዎ GPS ቦታ አልታወቀም። እባክዎ Location ያብሩ!" });

        try
        {
            _logger.LogInformation("Calculating route for Building {Id} from ({Lat}, {Lng})", 
                request.DestinationBuildingId, request.StartLatitude, request.StartLongitude);

            var result = await _routingService.CalculateRoute(request);

            // ⚠️ ዋናው ችግር እዚህ ጋር ነው፡ ውጤቱ null ከሆነ ሪአክት መስመር አይስልም
            if (result == null || result.Path == null || result.Path.Count == 0)
            {
                // በ 404 ፋንታ በ 200 (Ok) ግን ባዶ መልዕክት መላክ ይሻላል (ለሪአክት እንዲመቸው)
                return Ok(new { 
                    success = false,
                    message = "ይቅርታ፣ ከመነሻዎ ወደተመረጠው ህንጻ የሚያደርስ የመንገድ ትስስር አልተገኘም! እባክዎ በ Road Designer መንገዶቹን ያገናኙ።" 
                });
            }

            // ውጤቱ ከተገኘ success flag ጨምረን እንላካለን
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while calculating route");
            return StatusCode(500, new { message = "በሰርቨር በኩል ስህተት ተፈጥሯል፡ " + ex.Message });
        }
    }
}