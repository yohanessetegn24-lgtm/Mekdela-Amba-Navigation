using MekdelaAmbaCampusNavigation.Domain.Entities;

namespace MekdelaAmbaCampusNavigation.Application.Interfaces;

public interface ICampusService
{
    Task<List<Campus>> GetAllCampusesAsync();
    Task<Campus> GetCampusByIdAsync(int id);
    Task<Campus> CreateCampusAsync(Campus campus);

    // እነዚህን ሁለት አዳዲስ መስመሮች ጨምር
    Task UpdateCampusAsync(Campus campus);
    Task DeleteCampusAsync(int id);
}