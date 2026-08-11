using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Services;

public class PointOfInterestService : IPointOfInterestService
{
    private readonly ApplicationDbContext _context;

    public PointOfInterestService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PointOfInterest>> GetAllPOIsAsync()
    {
        return await _context.PointsOfInterest
            .Include(p => p.Campus)
            .Include(p => p.Building)
            .ToListAsync();
    }

    public async Task<List<PointOfInterest>> GetPOIsByCampusIdAsync(int campusId)
    {
        return await _context.PointsOfInterest
            .Where(p => p.CampusId == campusId)
            .ToListAsync();
    }

    public async Task<PointOfInterest> GetPOIByIdAsync(int id)
    {
        return await _context.PointsOfInterest
            .Include(p => p.Campus)
            .Include(p => p.Building)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PointOfInterest> CreatePOIAsync(PointOfInterest poi)
    {
        _context.PointsOfInterest.Add(poi);
        await _context.SaveChangesAsync();
        return poi;
    }

    public async Task UpdatePOIAsync(PointOfInterest poi)
    {
        _context.Entry(poi).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeletePOIAsync(int id)
    {
        var poi = await _context.PointsOfInterest.FindAsync(id);
        if (poi != null)
        {
            _context.PointsOfInterest.Remove(poi);
            await _context.SaveChangesAsync();
        }
    }
}