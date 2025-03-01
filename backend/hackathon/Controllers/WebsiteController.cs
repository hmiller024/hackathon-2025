using System.Collections;
using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;
using System.Text.Json;
using Backend.Controllers;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebsiteController: ControllerBase
    {
        private readonly ILogger<WebsiteController> _logger;
        private readonly AppDbContext _context;

        public WebsiteController(
            AppDbContext context,
            ILogger<WebsiteController> logger)
        {
            _logger = logger;
            _context = context;
        }


        [HttpGet("website")]
        public async Task<IActionResult> GetWebsiteFromId(int id) {
            _logger.LogInformation("KYS");
            var website = await _context.TrackedWebsites.FindAsync(id);

            return Ok(website);
        }

        [HttpGet("allWebsites")]
        public async Task<IActionResult> GetAllWebsites()
        {
            _logger.LogInformation("GETTING THE FUCKING WEBSITES BAYBE");

            var websites = await _context.TrackedWebsites.ToListAsync();
            return Ok(websites);
        }

        [HttpPost("addWebsite")]
        public async Task<IActionResult> AddWebsite(WebsiteRequest request)
        {
            TrackedWebsite website = new TrackedWebsite
            {
                Url = request.Url,
                LastChecked = DateTime.UtcNow,
                LastHash = request.Content
            };

            _context.TrackedWebsites.Add(website);
            await _context.SaveChangesAsync();  
            return Ok(request);
        }
    }

    public class WebsiteRequest
    {
        public string Url { get; set; }
        public string Content { get; set; }

        public WebsiteRequest(string url, string content)
        {
            Url = url;
            Content = content;

        }
    }
}