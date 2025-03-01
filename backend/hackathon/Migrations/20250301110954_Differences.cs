using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace hackathon.Migrations
{
    /// <inheritdoc />
    public partial class Differences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Differences",
                table: "TrackedWebsites",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Differences",
                table: "TrackedWebsites");
        }
    }
}
