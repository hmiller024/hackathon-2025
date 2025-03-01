using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=websites.db"));

// Enable CORS globally (you can also configure specific policies if needed)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()      // Allow any origin
               .AllowAnyMethod()      // Allow any HTTP method (GET, POST, etc.)
               .AllowAnyHeader();     // Allow any headers
    });
});

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

// Enable CORS middleware
app.UseCors();

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
