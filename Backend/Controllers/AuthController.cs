using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // ⭐ 要記得在最上面加上這個

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpGet("public")]
        public IActionResult GetPublicData()
        {
            return Ok(new { message = "這是公開資料，不需要登入！" });
        }

        [HttpGet("private")]
        [Authorize] 
        public IActionResult GetPrivateData()
        {
            // ⭐ 升級版：從 Token 裡面解碼出這個人的專屬 ID
            // 這個 ID 就是 Logto 發給他的，未來我們要把它當作關聯存進 Supabase！
            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            return Ok(new 
            { 
                message = "驗證成功！這是專屬你的記帳機密資料。",
                yourLogtoId = userId // 把 ID 傳回前端看看
            });
        }
    }
}