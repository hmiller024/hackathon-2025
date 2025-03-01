using System.Collections;
using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;
using System.Text.Json;
using Backend.Controllers;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using HtmlAgilityPack;
using System.Text.RegularExpressions;
using DiffPlex;
using DiffPlex.DiffBuilder.Model;
using DiffPlex.DiffBuilder;
using System.Linq;
using System.Text;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebsiteController : ControllerBase
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
        public async Task<IActionResult> GetWebsiteFromId(int id)
        {
            _logger.LogInformation("KYS");
            var website = await _context.TrackedWebsites.FindAsync(id);

            return Ok(website);
        }

        [HttpDelete("nuke")]
        public async Task<IActionResult> NukeDb()
        {
            _logger.LogInformation("Killing the children");

            await _context.TrackedWebsites.ExecuteDeleteAsync();

            return Ok();
        }

        [HttpGet("allWebsites")]
        public async Task<IActionResult> GetAllWebsites()
        {
            _logger.LogInformation("GETTING THE FUCKING WEBSITES BAYBE");

            var websites = await _context.TrackedWebsites.ToListAsync();
            using (HttpClient client = new HttpClient())
            {
                foreach (var website in websites)
                {
                    try
                    {
                        // Check if the URL is a valid absolute URI
                        Uri websiteUri;
                        if (!Uri.TryCreate(website.Url, UriKind.Absolute, out websiteUri))
                        {
                            _logger.LogError($"Invalid URL: {website.Url} for website {website.Id}. Skipping...");
                            website.ContentChanged = false; 
                            continue; 
                        }

                        HttpResponseMessage response = await client.GetAsync(websiteUri);

                        if (response.IsSuccessStatusCode)
                        {
                            string htmlContent = await response.Content.ReadAsStringAsync();

                            string differences = Differences(htmlContent, website.LastHash);
                            htmlContent = CleanHtml(htmlContent);
                            string filteredDifferences = string.Join("\n",
                                    differences.Split('\n')
                                               .Where(line => !Regex.IsMatch(line, @"^[-+]\s*$")) 
                                );

                            if (!htmlContent.Equals(website.LastHash))
                            {
                                website.ContentChanged = true;
                                website.LastHash = htmlContent;
                                website.Differences = filteredDifferences;
                            }
                            website.LastChecked = DateTime.UtcNow;
                            await _context.SaveChangesAsync();
                        }
                        else
                        {
                            website.ContentChanged = false; 
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error fetching website {website.Url}: {ex.Message}");
                        website.ContentChanged = false; 
                    }
                }
            }
            await _context.SaveChangesAsync();
            return Ok(websites);
        }

        [HttpPost("addWebsite")]
        public async Task<IActionResult> AddWebsite([FromBody] WebsiteRequest request)
        {
            try
            {
                _logger.LogInformation($"Received URL: {request.Url}, Content: {request.Content}");
                using (HttpClient client = new HttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync(request.Url);

                    if (response.IsSuccessStatusCode)
                    {
                        string htmlContent = await response.Content.ReadAsStringAsync();
                        
                        htmlContent = CleanHtml(htmlContent);
                        TrackedWebsite website = new TrackedWebsite
                        {
                            Url = request.Url,
                            LastChecked = DateTime.UtcNow,
                            Name = request.Content,
                            LastHash = htmlContent
                        };
                        _context.TrackedWebsites.Add(website);
                        await _context.SaveChangesAsync();

                        return Ok(request);
                    }
                    else
                    {
                        return BadRequest("Failed to fetch the website content.");
                    }
                }
            }

            catch (Exception ex)
            {
                // Handle any errors that occur during the HTTP request
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }

        }
        private string CleanHtml(string html)
        {
            // Remove dynamic query parameters from URLs (session-related or tracking)
            string pattern = @"([?&])(sessionid=\w+|token=[\w\d]+|wordfence_lh=\d+|hid=[A-F0-9]+)(&|$)";
            
            string cleanedHtml = Regex.Replace(html, pattern, "$1");
            cleanedHtml = Regex.Replace(cleanedHtml, @"\s+", " ").Trim();

            // Load the HTML into a HtmlDocument
            var htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(cleanedHtml);

            var metaTags = htmlDoc.DocumentNode.SelectNodes("//meta");
            var inputFields = htmlDoc.DocumentNode.SelectNodes("//input|//textarea|//select|//button|//option");

            if (metaTags != null)
            {
                foreach (var node in metaTags)
                {
                    node.Remove(); 
                }
            }

            if (inputFields != null)
            {
                foreach (var node in inputFields)
                {
                    node.Remove(); 
                }
            }

            // Remove elements with dynamic IDs or classes (e.g., timestamp or tracking elements)
            var dynamicNodes = htmlDoc.DocumentNode.SelectNodes("//div[contains(@class, 'dynamic') or @id='timestamp']");

            if (dynamicNodes != null)
            {
                foreach (var node in dynamicNodes)
                {
                    node.Remove(); 
                }
            }

            // Remove or replace dynamic JavaScript parameters (like 'hid' or session-specific URLs)
            string jsPattern = @"(\/\/georgerrmartin\.com\/notablog\/\?hid=)[A-F0-9]+";
            cleanedHtml = Regex.Replace(htmlDoc.DocumentNode.OuterHtml, jsPattern, "$1STATICVALUE");

            return cleanedHtml;
        }


        private string Differences(string newHtml, string oldHtml)
        {
            var differ = new Differ();

            var diffResult = differ.CreateCharacterDiffs(oldHtml, newHtml, false); 

            var result = new StringBuilder();

            foreach (var block in diffResult.DiffBlocks)
            {
                if (block.DeleteCountA > 0)
                {
                    string deletedText = oldHtml.Substring(block.DeleteStartA, block.DeleteCountA);
                    result.AppendLine($"- {deletedText}"); 
                }

                if (block.InsertCountB > 0)
                {
                    string insertedText = newHtml.Substring(block.InsertStartB, block.InsertCountB);
                    result.AppendLine($"+ {insertedText}");
                }
            }

            return result.ToString();
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