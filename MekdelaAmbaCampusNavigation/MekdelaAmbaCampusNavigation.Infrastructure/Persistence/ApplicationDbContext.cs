using MekdelaAmbaCampusNavigation.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // ዳታቤዝ ውስጥ ሰንጠረዥ (Table) እንዲሆኑ የምንፈልጋቸው
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

        // 1. በካምፓስ እና በህንጻ መካከል ያለውን ግንኙነት ማስተካከል
        modelBuilder.Entity<Campus>()
            .HasMany(c => c.Buildings)
            .WithOne(b => b.Campus)
            .HasForeignKey(b => b.CampusId);

        // 2. 🚀 ለ MapNode እና MapEdge ግንኙነት (ስህተቱን የሚፈታው ኮድ)

        // ለ StartNode ግንኙነት
        modelBuilder.Entity<MapEdge>()
            .HasOne(e => e.StartNode)
            .WithMany(n => n.Edges)
            .HasForeignKey(e => e.StartNodeId)
            .OnDelete(DeleteBehavior.Restrict); // መረጃ ሲጠፋ ስህተት እንዳይፈጠር

        // ለ EndNode ግንኙነት
        modelBuilder.Entity<MapEdge>()
            .HasOne(e => e.EndNode)
            .WithMany() // ግጭት እንዳይፈጠር እዚህ ጋር WithMany() ባዶ ይሁን
            .HasForeignKey(e => e.EndNodeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}