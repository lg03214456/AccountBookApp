using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Services;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecordsController : ControllerBase
    {
        private readonly RecordService _recordService;

        public RecordsController(RecordService recordService)
        {
            _recordService = recordService;
        }

        // POST: api/records (新增)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRecordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _recordService.CreateRecordAsync(dto);
            return Ok(result);
        }

        // GET: api/records (查詢)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var results = await _recordService.GetAllRecordsAsync();
            return Ok(results);
        }
    }
}