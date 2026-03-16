using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

var builder = WebApplication.CreateBuilder(args);

// --- 1. 資料庫與基礎服務 ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<Backend.Services.RecordService>();
builder.Services.AddHttpClient();

// --- 2. CORS 設定 ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVueApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://account-book-app-sigma.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 3. Logto 身分驗證 (核心修正區) ---

// 讓 Token 欄位名稱保持原樣 (例如 sub 不要變成 NameIdentifier)
JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        string authority = "https://y4spdd.logto.app/oidc";
        string audience = "https://accountbook.api";

        options.Authority = authority;
        options.Audience = audience;
        options.MetadataAddress = $"{authority}/.well-known/openid-configuration";
        options.RequireHttpsMetadata = false;

        // ⭐ 修正 CS1061 錯誤：改用這個方法啟用 .NET 8 新的驗證引擎
        options.SecurityTokenValidators.Clear();

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,   // 1. 檢查這張票是不是 Logto (外交部) 發的
            ValidIssuer = authority,
            ValidateAudience = true, // 2. 檢查這張票是不是要給「我的後端」用的 (Audience)
            ValidAudience = audience,
            ValidateLifetime = true, // 3. 檢查這張票有沒有過期
            ClockSkew = TimeSpan.Zero,

            // ⭐ 解決 IDX10500 的關鍵：認可 Logto 的標籤類型
            ValidateIssuerSigningKey = true, // 4. ⭐ 最關鍵：檢查上面的「印章」是否跟對照表一致
            ValidTypes = new[] { "at+jwt" },

            // ⭐ 強迫保全去抓印章 (金鑰)，解決「找不到安全金鑰」問題
            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
            {
                var configManager = parameters.ConfigurationManager as IConfigurationManager<OpenIdConnectConfiguration>;
                var config = configManager?.GetConfigurationAsync(CancellationToken.None).GetAwaiter().GetResult();
                return config?.SigningKeys;
            }
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"❌ 驗證失敗：{context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("✅ 【大功告成】身分驗證成功！終於進來了！");
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// --- 4. Middleware 順序 (這不能亂改) ---
app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting();

// CORS 必須在驗證之前
app.UseCors("AllowVueApp");

// 先認人 (Authentication)，再查權限 (Authorization)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();