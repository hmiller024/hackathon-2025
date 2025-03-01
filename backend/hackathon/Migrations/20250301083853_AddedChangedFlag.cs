using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace hackathon.Migrations
{
    /// <inheritdoc />
    public partial class AddedChangedFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ContentChanged",
                table: "TrackedWebsites",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentChanged",
                table: "TrackedWebsites");
        }
    }
}
