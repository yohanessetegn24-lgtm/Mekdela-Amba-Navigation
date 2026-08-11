using AutoMapper;
using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Domain.Entities;

namespace MekdelaAmbaCampusNavigation.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // 1. Campus Mappings
        // ReverseMap() ስንጨምር ከ DTO ወደ Entity እንዲሁም ከ Entity ወደ DTO እንዲቀይር ያደርገዋል
        CreateMap<CampusCreateDto, Campus>().ReverseMap();

        // 2. Building Mappings
        CreateMap<BuildingDto, Building>().ReverseMap();

        // 3. Point of Interest Mappings
        CreateMap<PointOfInterestDto, PointOfInterest>().ReverseMap();

        CreateMap<OfficeDto, Office>().ReverseMap();
    }
}