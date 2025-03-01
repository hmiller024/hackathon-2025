using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Chat;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ILogger<ChatController> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;

        public ChatController(
            ILogger<ChatController> logger,
            IConfiguration configuration,
            HttpClient httpClient,
            AppDbContext context)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
            _context = context;
        }

        [HttpPost("getResponse")]
        public async Task<IActionResult> GetChatResponse([FromBody] ChatRequest request)
        {
            try
            {
                _logger.LogInformation($"Processing chat request for website: {request.WebsiteName}, URL: {request.WebsiteUrl}");

                // Get website context
                string websiteContextPrompt = GenerateWebsiteContextPrompt(request);

                // Initialize OpenAI client
                ChatClient client = new(model: "gpt-4o-mini", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));

                // Create chat with proper prompt including website context
                ChatCompletion completion = client.CompleteChat(websiteContextPrompt);

                // Get response from OpenAI
                var response = completion.Content[0].Text;

                // Return the response
                return Ok(new ChatResponse
                {
                    Message = response
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting chat response: {ex.Message}");
                return StatusCode(500, $"Failed to get chat response: {ex.Message}");
            }
        }

        [HttpPost("analyzeChanges")]
        public async Task<IActionResult> AnalyzeChanges([FromBody] ChangeAnalysisRequest request)
        {
            try
            {
                _logger.LogInformation($"Analyzing changes for website: {request.WebsiteName}, URL: {request.WebsiteUrl}");

                // Build a prompt that includes previous content (lastHash) and new content
                string changeAnalysisPrompt = GenerateChangeAnalysisPrompt(request);

                // Initialize OpenAI client
                ChatClient client = new(model: "gpt-4o-mini", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));

                // Create chat completion with the analysis prompt
                ChatCompletion completion = client.CompleteChat(changeAnalysisPrompt);

                // Get response from OpenAI
                var response = completion.Content[0].Text;

                // Return the response
                return Ok(new ChatResponse
                {
                    Message = response
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error analyzing changes: {ex.Message}");
                return StatusCode(500, $"Failed to analyze changes: {ex.Message}");
            }
        }

        private string GenerateWebsiteContextPrompt(ChatRequest request)
        {
            return $"You are an AI assistant that analyzes websites. Please provide a brief summary of the website '{request.WebsiteName}' located at {request.WebsiteUrl}. Focus on the main purpose of the website, its content structure, and key features. Keep your response concise and informative.";
        }

        private string GenerateChangeAnalysisPrompt(ChangeAnalysisRequest request)
        {
            return $@"You are an AI assistant that analyzes website changes. 

Website: {request.WebsiteName} ({request.WebsiteUrl})

Detected Differences: {request.Differences}

Please analyze these changes and provide:
1. A summary of what has changed on the website
2. The significance of these changes
3. Any potential action items or recommendations based on these changes

Keep your response clear, concise, and focused on the most important changes. Say the 'one piece is real' at the start of the response last sentence";
        }

        // Request and Response Classes
        public class ChatRequest
        {
            public string WebsiteName { get; set; }
            public string WebsiteUrl { get; set; }
        }

        public class ChangeAnalysisRequest : ChatRequest
        {
            public string PreviousHash { get; set; }
            public string CurrentHash { get; set; }
            public string Differences { get; set; }
        }

        public class ChatResponse
        {
            public string Message { get; set; }
        }
    }
}