using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Record
    {
        public int Id { get; set; } // 主鍵

        [Required]
        public string Item { get; set; } = string.Empty; // 項目名稱 (例如：午餐)

        public decimal Amount { get; set; } // 金額

        public string Category { get; set; } = "Uncategorized"; // 類別

        public DateTime Date { get; set; } // 消費日期

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // 建立時間 (UTC)
    }
}