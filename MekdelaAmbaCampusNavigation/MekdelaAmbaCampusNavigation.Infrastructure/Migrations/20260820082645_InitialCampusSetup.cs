using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MekdelaAmbaCampusNavigation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCampusSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "PointsOfInterest",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "MapEdges",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "RoadCode",
                table: "MapEdges",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoadName",
                table: "MapEdges",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "MapEdges",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Surface",
                table: "MapEdges",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "MapEdges",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "MapEdges",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Width",
                table: "MapEdges",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "OpeningHours",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Buildings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_MapNodes_CampusId",
                table: "MapNodes",
                column: "CampusId");

            migrationBuilder.AddForeignKey(
                name: "FK_MapNodes_Campuses_CampusId",
                table: "MapNodes",
                column: "CampusId",
                principalTable: "Campuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MapNodes_Campuses_CampusId",
                table: "MapNodes");

            migrationBuilder.DropIndex(
                name: "IX_MapNodes_CampusId",
                table: "MapNodes");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "MapEdges");

            migrationBuilder.DropColumn(
                name: "RoadCode",
                table: "MapEdges");

            migrationBuilder.DropColumn(
                name: "RoadName",
                table: "MapEdges");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "MapEdges");

            migrationBuilder.DropColumn(
                name: "Surface",
                table: "MapEdges");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "MapEdges");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "MapEdges");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "MapEdges");

            migrationBuilder.DropColumn(
                name: "OpeningHours",
                table: "Buildings");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Buildings");

            migrationBuilder.AlterColumn<int>(
                name: "Category",
                table: "PointsOfInterest",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }
    }
}
