using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using MekdelaAmbaCampusNavigation.Infrastructure.Services; // 🚀 ለኢሜይል አገልግሎት
using MekdelaAmbaCampusNavigation.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EmailService _emailService;

    public AuthController(ApplicationDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // 1. 🔑 መግቢያ (Login)
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (loginDto == null || string.IsNullOrEmpty(loginDto.Email))
            return BadRequest(new { message = "እባክዎ ኢሜይል እና ፓስወርድ ያስገቡ!" });

        string emailInput = loginDto.Email.Trim().ToLower();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.Trim().ToLower() == emailInput);

        if (user == null)
            return Unauthorized(new { message = "ይህ ኢሜይል በሲስተሙ ውስጥ አልተመዘገበም!" });

        if (user.Password != loginDto.Password)
            return Unauthorized(new { message = "ያስገቡት ፓስወርድ ስህተት ነው!" });

        if (!user.IsActive)
            return Unauthorized(new { message = "እባክዎ መጀመሪያ አካውንትዎን ያረጋግጡ!" });

        return Ok(new { userName = user.FullName, email = user.Email, role = user.Role });
    }

    // 2. 🚀 አዲስ አድሚን መመዝገብ (Register)
    [HttpPost("register-admin")]
    public async Task<IActionResult> RegisterAdmin([FromBody] User user)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == user.Email.ToLower()))
            return BadRequest(new { message = "ይህ ኢሜይል ቀድሞ ተይዟል!" });

        string code = new Random().Next(100000, 999999).ToString();
        user.Role = "Admin";
        user.IsActive = false;
        user.VerificationCode = code;
        user.CodeExpiry = DateTime.UtcNow.AddMinutes(15);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        string body = $"<h2 style='color: #00204E;'>የማረጋገጫ ኮድ፡ {code}</h2>";
        await _emailService.SendEmailAsync(user.Email, "የአድሚን ምዝገባ", body);
        return Ok(new { message = "የማረጋገጫ ኮድ ተልኳል።" });
    }

    // 3. ✅ አካውንት በኮድ ማረጋገጫ (Verify OTP)
    [HttpPost("verify-account")]
    public async Task<IActionResult> VerifyAccount(string email, string code)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user == null || user.VerificationCode != code || user.CodeExpiry < DateTime.UtcNow)
            return BadRequest(new { message = "ኮዱ ስህተት ነው ወይም ጊዜው አልፏል!" });

        user.IsActive = true;
        user.VerificationCode = null;
        await _context.SaveChangesAsync();
        return Ok(new { message = "ተረጋግጧል!" });
    }

    // 4. 🔄 ፓስወርድ ሲጠፋ ኮድ መላኪያ (Forgot Password)
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user == null) return NotFound(new { message = "ኢሜይሉ አልተገኘም!" });

        string resetCode = new Random().Next(100000, 999999).ToString();
        user.ResetCode = resetCode;
        user.CodeExpiry = DateTime.UtcNow.AddMinutes(10); // ለ10 ደቂቃ የሚቆይ
        await _context.SaveChangesAsync();

        await _emailService.SendEmailAsync(email, "Password Reset Code", $"የእርስዎ ፓስዎርድ ማደሻ ኮድ፡ {resetCode}");
        return Ok(new { message = "ኮዱ ተልኳል።" });
    }

    // 🚀 5. አዲስ፡ ፓስወርዱን በትክክል በዳታቤዝ የሚቀይረው ክፍል
    // React (Login.jsx) ላይ ከሰራነው handleResetPassword ጋር እንዲገናኝ ተደርጓል
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
    {
        if (resetDto == null) return BadRequest();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == resetDto.Email.ToLower());

        // የላከው ኮድ በዳታቤዝ ካለው ResetCode ጋር መመሳሰሉን እና ጊዜው አለማለፉን ቼክ ያደርጋል
        if (user == null || user.ResetCode != resetDto.Code || user.CodeExpiry < DateTime.UtcNow)
        {
            return BadRequest(new { message = "ያስገቡት ኮድ ስህተት ነው ወይም ጊዜው አልፎበታል!" });
        }

        // አዲሱን ፓስዎርድ መመዝገብ
        user.Password = resetDto.NewPassword;
        user.ResetCode = null; // ኮዱን አንዴ ከተጠቀመበት በኋላ ያጠፋዋል
        await _context.SaveChangesAsync();

        return Ok(new { message = "ፓስዎርድዎ በስኬት ተቀይሯል!" });
    }
}