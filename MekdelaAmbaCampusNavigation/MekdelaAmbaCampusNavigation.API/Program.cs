using MekdelaAmbaCampusNavigation.Application.Interfaces;
using MekdelaAmbaCampusNavigation.Application.Mappings;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using MekdelaAmbaCampusNavigation.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// CORS Policy - ማንኛውንም እንዲቀበል (ለDevelopment በጣም አሪፍ ነው)
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// Controllers እና JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // 1. ለአዙሪት ግንኙነት (Node -> Edge -> Node)
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // 2. በ C# የጻፍከው ስም (ለምሳሌ Path) ለሪአክትም በዛው ስም እንዲሄድ
        options.JsonSerializerOptions.PropertyNamingPolicy = null; 
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dependency Injection
builder.Services.AddScoped<ICampusService, CampusService>();
builder.Services.AddScoped<IBuildingService, BuildingService>();
builder.Services.AddScoped<IPointOfInterestService, PointOfInterestService>();
builder.Services.AddScoped<IOfficeService, OfficeService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<RoutingService>(); 

builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mekdela Amba Campus API V1");
        c.RoutePrefix = string.Empty;
    });
}

// 🚀 የ Middleware ቅደም ተከተል ማስተካከያ
app.UseHttpsRedirection(); // መጀመሪያ HTTPS ይሁን
app.UseRouting();
app.UseCors("AllowReactApp"); // ከዚያ CORS ይፈቀድ

app.UseAuthorization();
app.MapGet("/", () => new
{
    message = "Mekdela Amba Campus Navigation API is running successfully!",
    status = "Online"
});
app.MapControllers();

app.Run();