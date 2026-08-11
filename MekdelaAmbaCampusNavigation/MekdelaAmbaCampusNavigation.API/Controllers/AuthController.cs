using MekdelaAmbaCampusNavigation.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto loginDto)
    {
        // 1. የአድሚን ፍተሻ (ይህ ኢሜይል ከመጣ አድሚን ነው)
        if (loginDto.Email.ToLower() == "edget@gmail.com" && loginDto.Password == "edget123")
        {
            return Ok(new
            {
                token = "secret-admin-key",
                userName = "System Administrator",
                role = "Admin"
            });
        }

        // 2. የተማሪ ፍተሻ (ማንኛውም ሌላ ኢሜይል ከመጣ እንደ ተማሪ ይቆጠራል)
        // አንተ እንዳልከው እያንዳንዱን ተማሪ መመዝገብ ስለማያስፈልግ እዚህ ጋር በነፃ እናሳልፋለን
        if (!string.IsNullOrEmpty(loginDto.Email) && loginDto.Email.Contains("@"))
        {
            return Ok(new
            {
                token = "student-access-key",
                userName = loginDto.Email.Split('@')[0], // ከኢሜይሉ ስሙን ይወስዳል
                role = "Student"
            });
        }

        return BadRequest("እባክዎ ትክክለኛ ኢሜይል ያስገቡ!");
    }
}