using MekdelaAmbaCampusNavigation.Domain.Entities;

namespace MekdelaAmbaCampusNavigation.Application.Interfaces;

public interface IOfficeService
{
    Task<List<Office>> GetOfficesByBuildingIdAsync(int buildingId);
    Task<Office> CreateOfficeAsync(Office office);
    Task UpdateOfficeAsync(Office office);
    Task DeleteOfficeAsync(int id);
}