using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

namespace MekdelaAmbaCampusNavigation.Infrastructure.Services;

public class EmailService
{
    // ⚠️ ማሳሰቢያ፡ እዚህ ጋር ያንተን እውነተኛ Gmail እና App Password በኋላ እናስገባለን
    private readonly string _fromEmail = "felegediget@gmail.com";
    private readonly string _appPassword = "uoxucjbgshmzdhhp";

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_fromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            // ከጎግል ሰርቨር ጋር መገናኘት
            await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_fromEmail, _appPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            return true;
        }
        catch (Exception)
        {
            return false; // ኢሜይሉ ስህተት ከሆነ ወይም መላክ ካልተቻለ false ይመልሳል
        }
    }
}