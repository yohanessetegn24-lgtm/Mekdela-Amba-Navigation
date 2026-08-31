using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Services;

public class BuildingService : IBuildingService
{
    private readonly ApplicationDbContext _context;

    public BuildingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Building>> GetAllBuildingsAsync()
    {
        // ቢሮዎችን (Offices) ጨምሮ ያመጣል
        return await _context.Buildings
            .Include(b => b.Campus)
            .Include(b => b.Offices) 
            .ToListAsync();
    }

    public async Task<List<Building>> GetBuildingsByCampusIdAsync(int campusId)
    {
        // ለ React Map Suggestion ወሳኙ ክፍል ይህ ነው
        return await _context.Buildings
            .Include(b => b.Offices) 
            .Where(b => b.CampusId == campusId)
            .ToListAsync();
    }

    public async Task<Building> GetBuildingByIdAsync(int id)
    {
        return await _context.Buildings
            .Include(b => b.Campus)
            .Include(b => b.Offices) 
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Building> CreateBuildingAsync(Building building)
    {
        _context.Buildings.Add(building);
        await _context.SaveChangesAsync();
        return building;
    }

    // UPDATE ስራ
    public async Task UpdateBuildingAsync(Building building)
    {
        _context.Entry(building).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    // DELETE ስራ
    public async Task DeleteBuildingAsync(int id)
    {
        var building = await _context.Buildings.FindAsync(id);
        if (building != null)
        {
            _context.Buildings.Remove(building);
            await _context.SaveChangesAsync();
        }
    }
}