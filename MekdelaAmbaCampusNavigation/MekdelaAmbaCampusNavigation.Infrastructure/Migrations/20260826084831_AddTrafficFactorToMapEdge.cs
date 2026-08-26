using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MekdelaAmbaCampusNavigation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTrafficFactorToMapEdge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "TrafficFactor",
                table: "MapEdges",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TrafficFactor",
                table: "MapEdges");
        }
    }
}
