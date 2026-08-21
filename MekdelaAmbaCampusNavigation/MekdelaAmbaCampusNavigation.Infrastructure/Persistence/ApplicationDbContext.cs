using MekdelaAmbaCampusNavigation.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Campus> Campuses { get; set; }
    public DbSet<Building> Buildings { get; set; }
    public DbSet<PointOfInterest> PointsOfInterest { get; set; }
    public DbSet<Office> Offices { get; set; }
    public DbSet<MapNode> MapNodes { get; set; }
    public DbSet<MapEdge> MapEdges { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. የካምፓስ እና የህንጻ ግንኙነት
        modelBuilder.Entity<Campus>()
            .HasMany(c => c.Buildings)
            .WithOne(b => b.Campus)
            .HasForeignKey(b => b.CampusId);

        // 2. 🚀 የ MapNode እና MapEdge ግንኙነት (Dijkstra Algorithm እንዲሰራ ወሳኝ ነው)
        modelBuilder.Entity<MapEdge>()
            .HasOne(e => e.StartNode)
            .WithMany(n => n.Edges)
            .HasForeignKey(e => e.StartNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MapEdge>()
            .HasOne(e => e.EndNode)
            .WithMany() 
            .HasForeignKey(e => e.EndNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        // 3. 🚀 Enums ወደ String መቀየር (ለዳታቤዝ ግልጽነት)
        // ይህ ማስተካከያ በ SQL ውስጥ '0, 1, 2' ከሚሆን 'Active, Closed, Construction' ብሎ እንዲቀመጥ ያደርጋል

        modelBuilder.Entity<MapEdge>()
            .Property(e => e.Status)
            .HasConversion<string>();

        modelBuilder.Entity<MapEdge>()
            .Property(e => e.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Building>()
            .Property(b => b.Type)
            .HasConversion<string>();

        modelBuilder.Entity<PointOfInterest>()
            .Property(p => p.Category)
            .HasConversion<string>();

        // 4. 🚀 ተጨማሪ የካምፓስ ግንኙነቶች (Nodes እና POIs)
        modelBuilder.Entity<Campus>()
            .HasMany(c => c.MapNodes)
            .WithOne(n => n.Campus)
            .HasForeignKey(n => n.CampusId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Campus>()
            .HasMany(c => c.PointsOfInterest)
            .WithOne(p => p.Campus)
            .HasForeignKey(p => p.CampusId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}