using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // 告訴 EF Core 我們有一張 Records 表
        public DbSet<Record> Records { get; set; }
    }
}