using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MekdelaAmbaCampusNavigation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRoadNetwork : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MapNodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    CampusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MapNodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MapEdges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StartNodeId = table.Column<int>(type: "int", nullable: false),
                    EndNodeId = table.Column<int>(type: "int", nullable: false),
                    Distance = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MapEdges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MapEdges_MapNodes_EndNodeId",
                        column: x => x.EndNodeId,
                        principalTable: "MapNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MapEdges_MapNodes_StartNodeId",
                        column: x => x.StartNodeId,
                        principalTable: "MapNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MapEdges_EndNodeId",
                table: "MapEdges",
                column: "EndNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_MapEdges_StartNodeId",
                table: "MapEdges",
                column: "StartNodeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MapEdges");

            migrationBuilder.DropTable(
                name: "MapNodes");
        }
    }
}
