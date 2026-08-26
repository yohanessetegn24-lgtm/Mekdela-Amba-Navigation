using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NavigationController : ControllerBase
{
    private readonly RoutingService _routingService;
    private readonly ILogger<NavigationController> _logger; // ለስህተት መከታተያ (Logging)

    public NavigationController(RoutingService routingService, ILogger<NavigationController> logger)
    {
        _routingService = routingService;
        _logger = logger;
    }

    // 🚀 POST: api/Navigation/calculate
    [HttpPost("calculate")]
    public async Task<IActionResult> CalculateRoute([FromBody] CalculateRouteRequestDto request)
    {
        // 1. መሠረታዊ ፍተሻ (Validation)
        if (request == null)
            return BadRequest(new { message = "Invalid request payload." });

        if (request.DestinationBuildingId <= 0)
            return BadRequest(new { message = "እባክዎ መድረሻ ህንጻ ይምረጡ!" });

        // GPS መረጃው በትክክል መምጣቱን ማረጋገጥ
        if (request.StartLatitude == 0 || request.StartLongitude == 0)
            return BadRequest(new { message = "የእርስዎ GPS ቦታ አልታወቀም። እባክዎ Location ያብሩ!" });

        try
        {
            // 2. መንገዱን ማስላት
            var result = await _routingService.CalculateRoute(request);

            // 3. ውጤቱን መፈተሽ
            if (result == null || result.Path == null || !result.Path.Any())
            {
                return NotFound(new { 
                    message = "ይቅርታ፣ ከመነሻዎ ወደተመረጠው ህንጻ የሚያደርስ የመንገድ ትስስር በዳታቤዝ ውስጥ አልተገኘም!" 
                });
            }

            // 4. የተሳካ ውጤት መመለስ
            return Ok(result);
        }
        catch (Exception ex)
        {
            // ስህተት ካለ በLog መያዝ (ለዲባግ ይረዳል)
            _logger.LogError(ex, "Error occurred while calculating route");
            return StatusCode(500, new { message = "በሰርቨር በኩል ችግር ተፈጥሯል፣ እባክዎ ቆይተው ይሞክሩ።" });
        }
    }
}