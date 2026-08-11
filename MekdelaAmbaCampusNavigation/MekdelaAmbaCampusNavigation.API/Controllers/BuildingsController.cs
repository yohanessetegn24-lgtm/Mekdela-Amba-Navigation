using AutoMapper;
using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BuildingsController : ControllerBase
{
    private readonly IBuildingService _buildingService;
    private readonly IMapper _mapper;

    public BuildingsController(IBuildingService buildingService, IMapper mapper)
    {
        _buildingService = buildingService;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<Building>>> GetBuildings()
    {
        return Ok(await _buildingService.GetAllBuildingsAsync());
    }

    [HttpGet("campus/{campusId}")]
    public async Task<ActionResult<List<Building>>> GetBuildingsByCampus(int campusId)
    {
        return Ok(await _buildingService.GetBuildingsByCampusIdAsync(campusId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Building>> GetBuilding(int id)
    {
        var building = await _buildingService.GetBuildingByIdAsync(id);
        if (building == null) return NotFound();
        return Ok(building);
    }

    [HttpPost]
    public async Task<ActionResult<Building>> CreateBuilding(BuildingDto buildingDto)
    {
        var building = _mapper.Map<Building>(buildingDto);
        var created = await _buildingService.CreateBuildingAsync(building);
        return Ok(created);
    }

    // PUT: api/Buildings/1 (ህንጻ ለማስተካከል)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBuilding(int id, BuildingDto buildingDto)
    {
        var existingBuilding = await _buildingService.GetBuildingByIdAsync(id);
        if (existingBuilding == null) return NotFound();

        _mapper.Map(buildingDto, existingBuilding);

        await _buildingService.UpdateBuildingAsync(existingBuilding);
        return NoContent();
    }

    // DELETE: api/Buildings/1 (ህንጻ ለማጥፋት)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBuilding(int id)
    {
        var building = await _buildingService.GetBuildingByIdAsync(id);
        if (building == null) return NotFound();

        await _buildingService.DeleteBuildingAsync(id);
        return NoContent();
    }
}