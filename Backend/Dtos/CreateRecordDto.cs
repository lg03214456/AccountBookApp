using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class CreateRecordDto
    {
        [Required]
        public string Item { get; set; } = string.Empty; // 例如: "午餐"

        [Required]
        [Range(1, 1000000)]
        public decimal Amount { get; set; } // 例如: 100

        public string Category { get; set; } = "Food"; // 例如: "Food"

        public DateTime Date { get; set; } // 例如: "2024-01-19"
    }
}