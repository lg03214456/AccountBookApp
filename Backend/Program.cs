// --- 需引用這兩個 namespace ---我
using Microsoft.EntityFrameworkCore;
using Backend.Data;

var builder = WebApplication.CreateBuilder(args);

// --- [開始] 加入這段 PostgreSQL 連線設定 ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));
// --- [結束] ---

builder.Services.AddScoped<Backend.Services.RecordService>();


// 1. 註冊 HttpClient (讓 Controller 可以用)
builder.Services.AddHttpClient();

// 2. 設定 CORS (允許 Vue 前端連線)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVueApp",
        policy =>
        {
            // 這裡設定允許的前端網址，Vite 預設通常是 http://localhost:5173
            policy.WithOrigins("http://localhost:5173",
            "https://account-book-app-chi.vercel.app"
            ) 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
    app.UseSwagger();
    app.UseSwaggerUI();
// }

// app.UseHttpsRedirection();

// 3. 啟用 CORS (這行一定要在 UseAuthorization 之前)
app.UseCors("AllowVueApp");

app.UseAuthorization();

app.MapControllers();

app.Run();