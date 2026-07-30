using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs.Email;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>Token de Google reCAPTCHA v2 (checkbox).</summary>
    public string? CaptchaToken { get; set; }
}
