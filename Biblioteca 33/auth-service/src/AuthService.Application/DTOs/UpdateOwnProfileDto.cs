using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class UpdateOwnProfileDto
{
    [MaxLength(25)]
    public string? Name { get; set; }

    [MaxLength(25)]
    public string? Surname { get; set; }

    [StringLength(8, MinimumLength = 8)]
    public string? Phone { get; set; }
}
