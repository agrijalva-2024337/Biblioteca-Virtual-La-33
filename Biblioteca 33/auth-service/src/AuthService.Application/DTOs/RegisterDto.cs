using System.ComponentModel.DataAnnotations;
using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

public class RegisterDto
{
    [Required]
    [MaxLength(25)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(25)]
    public string Surname { get; set; } = string.Empty;

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(8, MinimumLength = 8)]
    public string Phone { get; set; } = string.Empty;

    /// <summary>Grado del estudiante (name del catálogo Grade en files-service).</summary>
    [Required]
    [MaxLength(80)]
    public string Grade { get; set; } = string.Empty;

    /// <summary>Token de Google reCAPTCHA v2 (checkbox).</summary>
    public string? CaptchaToken { get; set; }
}
