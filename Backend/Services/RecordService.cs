using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class RecordService
    {
        private readonly AppDbContext _context;

        public RecordService(AppDbContext context)
        {
            _context = context;
        }

        // 1. 新增記帳
        public async Task<Record> CreateRecordAsync(CreateRecordDto dto)
        {
            // 把 DTO 轉成 資料庫實體 (Entity)
            var record = new Record
            {
                Item = dto.Item,
                Amount = dto.Amount,
                Category = dto.Category,
                Date = dto.Date.ToUniversalTime(), // PostgreSQL 建議存 UTC
                CreatedAt = DateTime.UtcNow
            };

            // 加入並存檔
            _context.Records.Add(record);
            await _context.SaveChangesAsync();

            return record;
        }

        // 2. 查詢所有記帳 (方便等等測試用)
        public async Task<List<Record>> GetAllRecordsAsync()
        {
            return await _context.Records
                .OrderByDescending(r => r.Date)
                .ToListAsync();
        }
    }
}