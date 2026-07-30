using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class LoginDto
{
    [Required]
    public string EmailOrUsername { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    /// <summary>Token de Google reCAPTCHA v2 (checkbox).</summary>
    public string? CaptchaToken { get; set; }
}
