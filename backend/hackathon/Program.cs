using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=websites.db"));
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapGet("/websites", async ([FromServices] AppDbContext db) =>
{
    return await db.TrackedWebsites.ToListAsync();
});

app.MapPost("/track", async ([FromServices] AppDbContext db, [FromBody] TrackedWebsite site) =>
{
    db.TrackedWebsites.Add(site);
    await db.SaveChangesAsync();
    return Results.Created($"/track/{site.Id}", site);
});

app.Run();
