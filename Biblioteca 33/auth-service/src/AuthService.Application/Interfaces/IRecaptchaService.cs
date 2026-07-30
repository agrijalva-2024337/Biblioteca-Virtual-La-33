namespace AuthService.Application.Interfaces;

public interface IRecaptchaService
{
    /// <summary>
    /// Valida el token de Google reCAPTCHA v2.
    /// Si RecaptchaSettings:Enabled es false o no hay SecretKey, retorna true (modo desarrollo).
    /// </summary>
    Task<bool> VerifyAsync(string? captchaToken, string? remoteIp = null);
}
