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

        // የምዝገባ ፓስወርድ validation
        if (!IsValidPassword(user.Password))
        {
            return BadRequest(new { message = "ፓስወርዱ ቢያንስ 6 ፊደላትና ቁጥሮች ሆኖ፣ ቢያንስ 2 ፊደል እና ቢያንስ 2 ቁጥር መያዝ አለበት!" });
        }

        string code = new Random().Next(100000, 999999).ToString();
        user.Role = "Admin";
        user.IsActive = false;
        user.VerificationCode = code;
        user.CodeExpiry = DateTime.UtcNow.AddMinutes(15);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        string body = $@"
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #00204E;'>የመቅደላ አምባ ዩኒቨርሲቲ አድሚን ምዝገባ</h2>
                <p>የእርስዎ የአካውንት ማረጋገጫ ኮድ፡</p>
                <h1 style='color: #007bff; letter-spacing: 4px;'>{code}</h1>
                <p style='color: #888;'>ይህ ኮድ የሚያገለግለው ለ 15 ደቂቃ ብቻ ነው።</p>
            </div>";

        await _emailService.SendEmailAsync(user.Email, "የአድሚን ምዝገባ ማረጋገጫ ኮድ", body);
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

        string emailBody = $@"
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #00204E;'>የይለፍ ቃል (Password) ማደሻ</h2>
                <p>የይለፍ ቃልዎን ለመቀየር የጠየቁት የማረጋገጫ ኮድ ይኸውልዎት፡</p>
                <h1 style='color: #d9534f; letter-spacing: 5px;'>{resetCode}</h1>
                <p style='color: #666;'>ይህ ኮድ ለ <strong>10 ደቂቃ</strong> ብቻ ያገለግላል።</p>
                <p style='font-size: 12px; color: #999;'>እርስዎ ካልጠየቁ እባክዎ ይህን መልእክት ችላ ይበሉት።</p>
            </div>";

        await _emailService.SendEmailAsync(email, "Password Reset Code", emailBody);
        return Ok(new { message = "ኮዱ ተልኳል።" });
    }

    // 5. 🚀 ፓስወርዱን በትክክል በዳታቤዝ የሚቀይረው ክፍል (Validation የተጨመረበት)
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
    {
        if (resetDto == null) return BadRequest();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == resetDto.Email.ToLower());

        // 1. ኮዱ ትክክል መሆኑንና ጊዜው አለማለፉን ማረጋገጥ
        if (user == null || user.ResetCode != resetDto.Code || user.CodeExpiry < DateTime.UtcNow)
        {
            return BadRequest(new { message = "ያስገቡት ኮድ ስህተት ነው ወይም ጊዜው አልፎበታል!" });
        }

        // 2. 🔐 የይለፍ ቃል ህግጋት (Password Validation): ቢያንስ 6 ዲጂት፣ 2 ፊደል፣ 2 ቁጥር
        if (!IsValidPassword(resetDto.NewPassword))
        {
            return BadRequest(new { message = "አዲሱ ፓስወርድ ቢያንስ 6 ሆሄያት ርዝመት፣ ቢያንስ 2 ፊደላት (Letters) እና ቢያንስ 2 ቁጥሮች (Numbers) መያዝ አለበት!" });
        }

        // 3. አዲሱን ፓስዎርድ መመዝገብ
        user.Password = resetDto.NewPassword;
        user.ResetCode = null; // ኮዱን አንዴ ከተጠቀመበት በኋላ ያጠፋዋል
        await _context.SaveChangesAsync();

        return Ok(new { message = "ፓስዎርድዎ በስኬት ተቀይሯል!" });
    }

    // 🔒 የፓስወርድ ማረጋገጫ ረዳት ሜተድ (Helper Method)
    private static bool IsValidPassword(string? password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
            return false;

        int letterCount = password.Count(char.IsLetter);
        int digitCount = password.Count(char.IsDigit);

        return letterCount >= 2 && digitCount >= 2;
    }
}
