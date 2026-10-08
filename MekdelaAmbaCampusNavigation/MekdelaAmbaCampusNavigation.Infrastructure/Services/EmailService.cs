using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Services;

public class EmailService
{
    private readonly IConfiguration? _config;
    private static readonly HttpClient _httpClient = new HttpClient();

    // Default constructor (በቀጥታ አዲስ object ቢፈጠር እንዳይበላሽ)
    public EmailService()
    {
    }

    // Dependency Injection constructor (ከ appsettings.json እንዲያነብ)
    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var apiKey = _config?["BrevoSettings:ApiKey"] ?? "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";
            var senderEmail = _config?["BrevoSettings:SenderEmail"] ?? "yohanessetegn24@gmail.com";
            var senderName = _config?["BrevoSettings:SenderName"] ?? "mkau";

            var payload = new
            {
                sender = new { name = senderName, email = senderEmail },
                to = new[] { new { email = toEmail } },
                subject = subject,
                htmlContent = body
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };

            request.Headers.Add("api-key", apiKey);

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception)
        {
            return false;
        }
    }
}
