using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MekdelaAmbaCampusNavigation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionAndImageToCampusAndOffice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Offices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Offices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Campuses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Offices");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Campuses");
        }
    }
}
