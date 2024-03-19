function toggleAnswer(id) {
    var answer = document.getElementById(id);
    var allAnswers = document.querySelectorAll('.answer');
    
    // Ẩn tất cả các câu trả lời trước khi hiển thị câu trả lời được chọn
    allAnswers.forEach(function(item) {
        if (item.id !== id) {
            item.style.display = "none";
        }
    });

    // Hiển thị hoặc ẩn câu trả lời được chọn
    if (answer.style.display === "block") {
        answer.style.display = "none";
    } else {
        answer.style.display = "block";
    }
}
