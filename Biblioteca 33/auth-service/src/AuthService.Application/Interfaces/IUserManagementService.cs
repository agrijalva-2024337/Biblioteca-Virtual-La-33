using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IUserManagementService
{
    Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName);
    Task<IReadOnlyList<string>> GetUserRolesAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName);
    Task<UserResponseDto> CreateUserAsync(CreateUserDto dto);
    Task<UserResponseDto> UpdateUserDetailsAsync(string userId, UpdateUserDetailsDto dto);
    Task<UserResponseDto> ToggleUserStatusAsync(string userId, bool activate);
    Task<IReadOnlyList<UserResponseDto>> GetAllUsersAsync();
}
