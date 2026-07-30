using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class UserManagementService(
    IUserRepository users,
    IRoleRepository roles,
    IPasswordHashService passwordHashService) : IUserManagementService
{
    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));
        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException($"Role not allowed. Use {RoleConstants.ADMIN_ROLE} or {RoleConstants.USER_ROLE} or {RoleConstants.TEACHER_ROLE}");

        var user = await users.GetByIdAsync(userId);

        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isUserAdmin && roleName != RoleConstants.ADMIN_ROLE)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last administrator");
            }
        }

        var role = await roles.GetByNameAsync(roleName)
                    ?? throw new InvalidOperationException($"Role {roleName} not found");

        await users.UpdateUserRoleAsync(userId, role.Id);

        user = await users.GetByIdAsync(userId);

        return MapToUserResponseDto(user);
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNamesAsync(userId);
        return roleNames;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);

        return usersInRole.Select(u => MapToUserResponseDto(u, roleName)).ToList();
    }

    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto dto)
    {
        var roleName = dto.RoleName?.Trim().ToUpperInvariant() ?? string.Empty;

        if (!RoleConstants.AllowedRoles.Contains(roleName))
        {
            throw new InvalidOperationException($"Role not allowed. Use {RoleConstants.ADMIN_ROLE} or {RoleConstants.USER_ROLE} or {RoleConstants.TEACHER_ROLE}");
        }

        if (await users.ExistsByEmailAsync(dto.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        if (await users.ExistsByUsernameAsync(dto.Username))
        {
            throw new InvalidOperationException("Username already exists");
        }

        var role = await roles.GetByNameAsync(roleName)
            ?? throw new InvalidOperationException($"Role {roleName} not found");

        var emailVerificationToken = TokenGenerator.GenerateEmailVerificationToken();
        var userId = UuidGenerator.GenerateUserId();
        var userProfileId = UuidGenerator.GenerateUserId();
        var userEmailId = UuidGenerator.GenerateUserId();
        var userRoleId = UuidGenerator.GenerateUserId();
        var userPasswordResetId = UuidGenerator.GenerateUserId();

        var user = new User
        {
            Id = userId,
            Name = dto.Name.Trim(),
            Surname = dto.Surname.Trim(),
            Username = dto.Username.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Password = passwordHashService.HashPassword(dto.Password),
            Status = true,
            UserEmail = new UserEmail
            {
                Id = userEmailId,
                UserId = userId,
                EmailVerified = true,
                EmailVerificationToken = emailVerificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
            },
            UserRoles =
            [
                new UserRole
                {
                    Id = userRoleId,
                    UserId = userId,
                    RoleId = role.Id
                }
            ],
            UserPasswordReset = new UserPasswordReset
            {
                Id = userPasswordResetId,
                UserId = userId,
                PasswordResetToken = null,
                PasswordResetTokenExpiry = null
            },
            UserProfile = new UserProfile
            {
                Id = userProfileId,
                UserId = userId,
                Phone = dto.Phone
            }
        };

        var createdUser = await users.CreateUserAsync(user);
        return MapToUserResponseDto(createdUser, roleName);
    }

    public async Task<UserResponseDto> UpdateUserDetailsAsync(string userId, UpdateUserDetailsDto dto)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("Invalid userId", nameof(userId));
        }

        var hasName = !string.IsNullOrWhiteSpace(dto.Name);
        var hasSurname = !string.IsNullOrWhiteSpace(dto.Surname);
        var hasEmail = !string.IsNullOrWhiteSpace(dto.Email);
        var hasPhone = !string.IsNullOrWhiteSpace(dto.Phone);

        if (!hasName && !hasSurname && !hasEmail && !hasPhone)
        {
            throw new ArgumentException("At least one field must be provided to update user details");
        }

        var user = await users.GetByIdAsync(userId);

        if (hasName)
        {
            user.Name = dto.Name!.Trim();
        }

        if (hasSurname)
        {
            user.Surname = dto.Surname!.Trim();
        }

        if (hasEmail)
        {
            var normalizedEmail = dto.Email!.Trim().ToLowerInvariant();
            var existing = await users.GetByEmailAsync(normalizedEmail);
            if (existing != null && !string.Equals(existing.Id, userId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException("Email already in use by another user");
            }

            user.Email = normalizedEmail;
        }

        if (hasPhone)
        {
            if (user.UserProfile == null)
            {
                user.UserProfile = new UserProfile
                {
                    Id = UuidGenerator.GenerateUserId(),
                    UserId = user.Id,
                    Phone = dto.Phone!.Trim()
                };
            }
            else
            {
                user.UserProfile.Phone = dto.Phone!.Trim();
            }
        }

        var updatedUser = await users.UpdateUserAsync(user);
        return MapToUserResponseDto(updatedUser);
    }

    public async Task<UserResponseDto> ToggleUserStatusAsync(string userId, bool activate)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("Invalid userId", nameof(userId));
        }

        var user = await users.GetByIdAsync(userId);

        if (!activate)
        {
            var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
            if (isUserAdmin)
            {
                var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);
                if (adminCount <= 1)
                {
                    throw new InvalidOperationException("Cannot deactivate the last administrator");
                }
            }
        }

        user.Status = activate;
        var updatedUser = await users.UpdateUserAsync(user);
        return MapToUserResponseDto(updatedUser);
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetAllUsersAsync()
    {
        var allUsers = await users.GetAllAsync();
        return allUsers.Select(u => MapToUserResponseDto(u)).ToList();
    }

    private static UserResponseDto MapToUserResponseDto(User user, string? roleOverride = null)
    {
        var role = roleOverride
            ?? user.UserRoles.FirstOrDefault()?.Role?.Name
            ?? string.Empty;

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Grade = user.UserProfile?.Grade,
            Role = role,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
