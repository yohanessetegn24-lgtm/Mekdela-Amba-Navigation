using MekdelaAmbaCampusNavigation.Application.DTOs;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (loginDto == null || string.IsNullOrEmpty(loginDto.Email))
            return BadRequest(new { message = "እባክዎ ኢሜይል እና ፓስወርድ ያስገቡ!" });

        // 🚀 1. ዳታቤዝ ውስጥ ተጠቃሚውን መፈለግ
        string emailInput = loginDto.Email.Trim().ToLower();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.Trim().ToLower() == emailInput);

        // 🚀 2. ኢሜይሉ ዳታቤዝ ውስጥ ከሌለ
        if (user == null)
        {
            return Unauthorized(new { message = "ይህ ኢሜይል በሲስተሙ ውስጥ አልተመዘገበም! እባክዎ በትክክል ያስገቡ።" });
        }

        // 🚀 3. ፓስወርዱ ስህተት ከሆነ
        if (user.Password != loginDto.Password)
        {
            return Unauthorized(new { message = "ያስገቡት ፓስወርድ ስህተት ነው!" });
        }

        // 🚀 4. ተጠቃሚው አድሚን መሆኑን ማረጋገጥ (Case-insensitive)
        if (!user.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(new { message = "ይቅርታ፣ ይህ ገጽ ለአድሚኖች ብቻ የተፈቀደ ነው!" });
        }

        // 🚀 5. ሁሉም ትክክል ከሆነ ስኬታማ ምላሽ መላክ
        return Ok(new
        {
            userName = user.FullName,
            email = user.Email,
            role = "Admin" // ለሪአክት እንዲመች ሁልጊዜ "Admin" ብለን እንልካለን
        });
    }
}