using MekdelaAmbaCampusNavigation.Domain.Entities;

namespace MekdelaAmbaCampusNavigation.Application.Interfaces;

public interface IBuildingService
{
    Task<List<Building>> GetAllBuildingsAsync();
    Task<List<Building>> GetBuildingsByCampusIdAsync(int campusId);
    Task<Building> GetBuildingByIdAsync(int id);
    Task<Building> CreateBuildingAsync(Building building);
    Task UpdateBuildingAsync(Building building); // አዲስ
    Task DeleteBuildingAsync(int id);       // አዲስ
}