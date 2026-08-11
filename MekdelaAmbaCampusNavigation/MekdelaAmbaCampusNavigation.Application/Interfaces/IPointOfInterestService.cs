using MekdelaAmbaCampusNavigation.Domain.Entities;

namespace MekdelaAmbaCampusNavigation.Application.Interfaces;

public interface IPointOfInterestService
{
    Task<List<PointOfInterest>> GetAllPOIsAsync();
    Task<List<PointOfInterest>> GetPOIsByCampusIdAsync(int campusId);
    Task<PointOfInterest> GetPOIByIdAsync(int id);
    Task<PointOfInterest> CreatePOIAsync(PointOfInterest poi);
    Task UpdatePOIAsync(PointOfInterest poi);
    Task DeletePOIAsync(int id);
}