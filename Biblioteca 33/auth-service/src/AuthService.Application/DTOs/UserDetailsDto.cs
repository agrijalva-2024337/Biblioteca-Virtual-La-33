namespace AuthService.Application.DTOs;

public class UserDetailsDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    /// <summary>Grado del estudiante (Grade.name). Null para roles sin grado.</summary>
    public string? Grade { get; set; }
}
