using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Services;

public class OfficeService : IOfficeService
{
    private readonly ApplicationDbContext _context;
    public OfficeService(ApplicationDbContext context) => _context = context;

    public async Task<List<Office>> GetOfficesByBuildingIdAsync(int buildingId) =>
        await _context.Offices.Where(o => o.BuildingId == buildingId).ToListAsync();

    public async Task<Office> CreateOfficeAsync(Office office)
    {
        _context.Offices.Add(office);
        await _context.SaveChangesAsync();
        return office;
    }

    public async Task UpdateOfficeAsync(Office office)
    {
        _context.Entry(office).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteOfficeAsync(int id)
    {
        var office = await _context.Offices.FindAsync(id);
        if (office != null) { _context.Offices.Remove(office); await _context.SaveChangesAsync(); }
    }
    public async Task<Office?> GetOfficeByIdAsync(int id)
    {
        return await _context.Offices.FindAsync(id);
    }

   
}