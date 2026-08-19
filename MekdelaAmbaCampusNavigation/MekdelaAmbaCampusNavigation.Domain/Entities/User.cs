namespace MekdelaAmbaCampusNavigation.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty; // 🚀 ይህ ለፕሮፋይል አይኮኑ ይጠቅመናል
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin"; // "Admin" ወይም "Student"

    public bool IsActive { get; set; } = false; // መጀመሪያ ሲመዘገብ false ነው
    public string? VerificationCode { get; set; } // ለምዝገባ ማረጋገጫ
    public string? ResetCode { get; set; } // ለፓስወርድ ማደሻ
    public DateTime? CodeExpiry { get; set; } // የኮዱ ማለቂያ ጊዜ

}