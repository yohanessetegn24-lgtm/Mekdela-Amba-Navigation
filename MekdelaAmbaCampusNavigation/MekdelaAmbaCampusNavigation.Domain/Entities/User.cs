namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty; // 🚀 ይህ ለፕሮፋይል አይኮኑ ይጠቅመናል
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin"; // "Admin" ወይም "Student"
}