using AutoMapper;
using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CampusesController : ControllerBase
{
    private readonly ICampusService _campusService;
    private readonly IMapper _mapper;

    public CampusesController(ICampusService campusService, IMapper mapper)
    {
        _campusService = campusService;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<Campus>>> GetCampuses()
    {
        var campuses = await _campusService.GetAllCampusesAsync();
        return Ok(campuses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Campus>> GetCampus(int id)
    {
        var campus = await _campusService.GetCampusByIdAsync(id);
        if (campus == null) return NotFound();
        return Ok(campus);
    }

    [HttpPost]
    public async Task<ActionResult<Campus>> CreateCampus(CampusCreateDto campusDto)
    {
        // 🚀 AutoMapper ፊልዶቹን (Description, ImageUrl) በራሱ Map ያደርጋቸዋል
        var campus = _mapper.Map<Campus>(campusDto);
        var created = await _campusService.CreateCampusAsync(campus);
        return Ok(created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCampus(int id, CampusCreateDto campusDto)
    {
        var existingCampus = await _campusService.GetCampusByIdAsync(id);
        if (existingCampus == null) return NotFound();

        // 🚀 አዲሶቹን መረጃዎች (Description, ImageUrl ጨምሮ) በነባሩ ላይ ይጭናል
        _mapper.Map(campusDto, existingCampus);

        await _campusService.UpdateCampusAsync(existingCampus);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCampus(int id)
    {
        var campus = await _campusService.GetCampusByIdAsync(id);
        if (campus == null) return NotFound();

        await _campusService.DeleteCampusAsync(id);
        return NoContent();
    }
}