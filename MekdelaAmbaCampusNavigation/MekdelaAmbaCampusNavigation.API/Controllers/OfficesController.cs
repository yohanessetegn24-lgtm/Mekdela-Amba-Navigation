using AutoMapper;
using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OfficesController : ControllerBase
{
    private readonly IOfficeService _officeService;
    private readonly IMapper _mapper;

    public OfficesController(IOfficeService officeService, IMapper mapper)
    {
        _officeService = officeService;
        _mapper = mapper;
    }

    [HttpGet("building/{buildingId}")]
    public async Task<ActionResult<List<Office>>> GetByBuilding(int buildingId) =>
        Ok(await _officeService.GetOfficesByBuildingIdAsync(buildingId));

    [HttpPost]
    public async Task<ActionResult<Office>> Create(OfficeDto officeDto)
    {
        // 🚀 Description እና ImageUrl እዚህ ጋር Map ይደረጋሉ
        var office = _mapper.Map<Office>(officeDto);
        return Ok(await _officeService.CreateOfficeAsync(office));
    }

    // 🚀 አዲስ፡ የOffice መረጃን ለማስተካከል (ለ Edit Button አስፈላጊ ነው)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOffice(int id, OfficeDto officeDto)
    {
        if (id != officeDto.Id) return BadRequest("ID Mismatch");

        var existingOffice = await _officeService.GetOfficeByIdAsync(id);
        if (existingOffice == null) return NotFound();

        // መረጃውን Map አድርግ
        _mapper.Map(officeDto, existingOffice);

        await _officeService.UpdateOfficeAsync(existingOffice);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _officeService.DeleteOfficeAsync(id);
        return NoContent();
    }


}