using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Domain.Entities;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Services;

public class CampusService : ICampusService
{
    private readonly ApplicationDbContext _context;

    public CampusService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Campus>> GetAllCampusesAsync()
    {
        return await _context.Campuses.Include(c => c.Buildings).ToListAsync();
    }

    public async Task<Campus> GetCampusByIdAsync(int id)
    {
        return await _context.Campuses.Include(c => c.Buildings)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Campus> CreateCampusAsync(Campus campus)
    {
        _context.Campuses.Add(campus);
        await _context.SaveChangesAsync();
        return campus;
    }

    // UPDATE ስራ
    public async Task UpdateCampusAsync(Campus campus)
    {
        _context.Entry(campus).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    // DELETE ስራ
    public async Task DeleteCampusAsync(int id)
    {
        var campus = await _context.Campuses.FindAsync(id);
        if (campus != null)
        {
            _context.Campuses.Remove(campus);
            await _context.SaveChangesAsync();
        }
    }
}