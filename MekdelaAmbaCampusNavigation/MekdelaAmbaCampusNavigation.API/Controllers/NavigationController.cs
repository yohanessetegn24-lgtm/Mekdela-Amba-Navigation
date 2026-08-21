using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NavigationController : ControllerBase
{
    private readonly RoutingService _routingService;

    public NavigationController(RoutingService routingService)
    {
        _routingService = routingService;
    }

    // 🚀 POST: api/Navigation/calculate
    // ተማሪው "Navigate" ሲል ይህ Endpoint ይጠራል
    [HttpPost("calculate")]
    public async Task<IActionResult> CalculateRoute([FromBody] CalculateRouteRequestDto request)
    {
        if (request == null)
            return BadRequest(new { message = "የተሳሳተ ጥያቄ!" });

        var result = await _routingService.CalculateRoute(request);

        if (result == null)
            return NotFound(new { message = "ይቅርታ፣ ወደተመረጠው ህንጻ የሚያደርስ ክፍት መንገድ አልተገኘም!" });

        return Ok(result);
    }
}