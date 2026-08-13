using MekdelaAmbaCampusNavigation.Domain.Entities;
using MekdelaAmbaCampusNavigation.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MekdelaAmbaCampusNavigation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public UsersController(ApplicationDbContext context) => _context = context;

    // 1. ሁሉንም ተጠቃሚዎች ለማየት
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    // 2. አዲስ ተጠቃሚ ለመመዝገብ (Add User/Admin)
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user) 
    {
        // 🚀 ማሻሻያ 1፡ ኢሜይሉን ወደ lowercase መቀየር (ለ Login እንዲቀል)
        if (!string.IsNullOrEmpty(user.Email))
        {
            user.Email = user.Email.ToLower();
        }

        // 🚀 ማሻሻያ 2፡ አንተ የጠየቅከው - ሚናው (Role) ካልተገለጸ በDefault "Student" እንዲሆን
        if (string.IsNullOrEmpty(user.Role))
        {
            user.Role = "Student"; 
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    // 3. የተጠቃሚ መረጃ ለመቀየር (Edit User)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user) 
    {
        if (id != user.Id) return BadRequest();

        // ሲቀየርም ኢሜይሉ ትንሽ ፊደል መሆኑን እናረጋግጥ
        if (!string.IsNullOrEmpty(user.Email))
        {
            user.Email = user.Email.ToLower();
        }
        
        // ሲስተካከለም ሮሉ ባዶ እንዳይሆን መከላከል
        if (string.IsNullOrEmpty(user.Role)) 
        {
             user.Role = "Student";
        }

        _context.Entry(user).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // 4. ተጠቃሚ ለማጥፋት (Delete User)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id) 
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}