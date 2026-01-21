using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeminiController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        // 建構子：注入設定檔 (拿Key用) 和 HTTP 客戶端 (連線用)
        public GeminiController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _httpClient = httpClientFactory.CreateClient();
        }

        // 定義前端傳來的資料格式
        public class ChatRequest
        {
            public string Message { get; set; } = string.Empty;
        }

        // --- 新增這段程式碼 ---

[HttpGet("test")] // 我們設定一個測試路徑
public async Task<IActionResult> ListModels()
{
    string apiKey = _configuration["GeminiApiKey"];
    if (string.IsNullOrEmpty(apiKey)) return BadRequest("No API Key");

    // 這是 Google 用來查詢「可用模型清單」的網址
    string url = $"https://generativelanguage.googleapis.com/v1beta/models?key={apiKey}";

    try 
    {
        var response = await _httpClient.GetAsync(url);
        var jsonString = await response.Content.ReadAsStringAsync();
        
        // 直接把 Google 回傳的原始清單顯示在畫面上
        return Content(jsonString, "application/json");
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}

// --- 結束 ---
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            // 1. 讀取 API Key
            string apiKey = _configuration["GeminiApiKey"] ?? "";
            if (string.IsNullOrEmpty(apiKey))
            {
                return StatusCode(500, "Server Error: API Key not found. Please checking 'dotnet user-secrets'.");
            }

            if (string.IsNullOrEmpty(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            // 2. 設定 Google Gemini API 網址 (使用 flash 模型比較快)
            //string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
// 修改後的 (指定最新版)
// 使用具體版本號 -001
string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={apiKey}";
 // 3. 準備傳送給 Google 的 JSON 資料
            var requestBody = new
            {
                contents = new[]
                {
                    new {
                        parts = new[]
                        {
                            new { text = request.Message }
                        }
                    }
                }
            };

            var jsonContent = JsonConvert.SerializeObject(requestBody);
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            try
            {
                // 1. 發送請求
                var response = await _httpClient.PostAsync(apiUrl, httpContent);
                
                // 2. 讀取原始回應字串
                var responseString = await response.Content.ReadAsStringAsync();
            
                // --- [防禦重點 A] 先檢查狀態碼 ---
                // 如果 Google 回傳錯誤 (400, 401, 404, 500)，不要硬解，直接把錯誤丟給前端看
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, $"Gemini API Error: {responseString}");
                }
            
                // 3. 解析 JSON (加上 ? 表示它可能是 null，消除警告)
                dynamic? result = JsonConvert.DeserializeObject(responseString);
            
                // --- [防禦重點 B] 安全讀取 (Safe Navigation) ---
                // 使用 ?. 運算子：如果 candidates 是空，就停下來，不會報錯
                // 使用 (string?) 強制轉型：明確告訴編譯器我們要轉成字串
                string aiText = (string?)result?.candidates?[0]?.content?.parts?[0]?.text ?? "沒有讀取到回應文字";
            
                // 4. 回傳成功結果
                return Ok(new { reply = aiText });
            }
catch (Exception ex)
{
    return StatusCode(500, $"Internal Server Error: {ex.Message}");
}
        }
    }
}