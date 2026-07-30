using System.Net.Http.Json;
using System.Text.Json.Serialization;
using AuthService.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AuthService.Application.Services;

public class RecaptchaService(
    IConfiguration configuration,
    ILogger<RecaptchaService> logger) : IRecaptchaService
{
    private const string VerifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    public async Task<bool> VerifyAsync(string? captchaToken, string? remoteIp = null)
    {
        var enabledRaw = configuration["RecaptchaSettings:Enabled"];
        var enabled = bool.TryParse(enabledRaw, out var parsed) && parsed;
        var secretKey = configuration["RecaptchaSettings:SecretKey"];

        // Sin secret / deshabilitado → no bloquear el flujo local académico.
        if (!enabled || string.IsNullOrWhiteSpace(secretKey))
        {
            logger.LogWarning(
                "reCAPTCHA deshabilitado o sin SecretKey: se omite la validación (solo uso local/dev).");
            return true;
        }

        if (string.IsNullOrWhiteSpace(captchaToken))
        {
            logger.LogWarning("reCAPTCHA: token ausente");
            return false;
        }

        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["secret"] = secretKey,
                ["response"] = captchaToken,
            });

            if (!string.IsNullOrWhiteSpace(remoteIp))
            {
                // remoteip es opcional; se envía si está disponible
            }

            using var response = await client.PostAsync(VerifyUrl, content);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<RecaptchaVerifyResponse>();
            if (result?.Success == true)
            {
                return true;
            }

            logger.LogWarning(
                "reCAPTCHA rechazado. ErrorCodes={Codes}",
                result?.ErrorCodes is null ? "(none)" : string.Join(",", result.ErrorCodes));
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al validar reCAPTCHA con Google");
            return false;
        }
    }

    private sealed class RecaptchaVerifyResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("error-codes")]
        public string[]? ErrorCodes { get; set; }
    }
}
