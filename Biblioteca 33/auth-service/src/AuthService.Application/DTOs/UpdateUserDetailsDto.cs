using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class UpdateUserDetailsDto
{
    [MaxLength(25)]
    public string? Name { get; set; }

    [MaxLength(25)]
    public string? Surname { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(8, MinimumLength = 8)]
    public string? Phone { get; set; }
}
