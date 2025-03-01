using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
	public DbSet<TrackedWebsite> TrackedWebsites { get; set; }

	protected override void OnConfiguring(DbContextOptionsBuilder options)
		=> options.UseSqlite("Data Source=websites.db");
}