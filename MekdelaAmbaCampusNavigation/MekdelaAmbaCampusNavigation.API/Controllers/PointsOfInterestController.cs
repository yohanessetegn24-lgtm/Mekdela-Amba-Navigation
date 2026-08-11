using AutoMapper;
using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PointsOfInterestController : ControllerBase
{
    private readonly IPointOfInterestService _poiService;
    private readonly IMapper _mapper;

    public PointsOfInterestController(IPointOfInterestService poiService, IMapper mapper)
    {
        _poiService = poiService;
        _mapper = mapper;
    }

    [HttpGet("campus/{campusId}")]
    public async Task<ActionResult<List<PointOfInterest>>> GetByCampus(int campusId)
    {
        return Ok(await _poiService.GetPOIsByCampusIdAsync(campusId));
    }

    [HttpPost]
    public async Task<ActionResult<PointOfInterest>> Create(PointOfInterestDto poiDto)
    {
        var poi = _mapper.Map<PointOfInterest>(poiDto);
        var created = await _poiService.CreatePOIAsync(poi);
        return Ok(created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, PointOfInterestDto poiDto)
    {
        var poi = await _poiService.GetPOIByIdAsync(id);
        if (poi == null) return NotFound();

        _mapper.Map(poiDto, poi);
        await _poiService.UpdatePOIAsync(poi);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _poiService.DeletePOIAsync(id);
        return NoContent();
    }
}