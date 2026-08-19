using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Application.Mappings;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using MekdelaAmbaCampusNavigation.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization; // 👈 ይህ ለስህተቱ መፍትሄ አስፈላጊ ነው

var builder = WebApplication.CreateBuilder(args);

// CORS Policy ለ React መፍቀድ
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// 1. Controllers (የ JSON አዙሪት ስህተትን እዚህ ጋር እናስተካክላለን)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // 👈 ይህ መስመር ካምፓስ እና ህንጻ እርስ በርስ በሚጠራሩበት ጊዜ የሚፈጠረውን ስህተት ያስቀራል
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. የዳታቤዝ ግንኙነት (Database Connection)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Dependency Injection (Interface እና Implementation ማገናኘት)
builder.Services.AddScoped<ICampusService, CampusService>();
builder.Services.AddScoped<IBuildingService, BuildingService>();
builder.Services.AddScoped<IPointOfInterestService, PointOfInterestService>();
builder.Services.AddScoped<IOfficeService, OfficeService>();
builder.Services.AddScoped<MekdelaAmbaCampusNavigation.Infrastructure.Services.EmailService>();
// 4. AutoMapper መመዝገብ
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

var app = builder.Build();

// 5. የ Swagger UI ዝግጅት
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mekdela Amba Campus API V1");
        c.RoutePrefix = string.Empty;
    });
}

// ⚠️ የ Middleware ቅደም ተከተል በጣም ወሳኝ ነው
app.UseCors("AllowReactApp"); // መጀመሪያ CORS

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();