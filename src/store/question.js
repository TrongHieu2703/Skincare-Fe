const questions = [
    {
        id: 1,
        question: "Da bạn có cảm giác khô căng sau khi rửa mặt không?",
        options: [
            { answer: "Có, rất khô", score: { dry: 2, oily: 0, normal: 0, combination: 1 } },
            { answer: "Không, cảm giác bình thường", score: { dry: 0, oily: 0, normal: 2, combination: 1 } },
            { answer: "Không, nhưng hơi nhờn", score: { dry: 0, oily: 2, normal: 0, combination: 1 } },
        ],
    },
    {
        id: 2,
        question: "Bạn có thường xuyên bị bóng dầu ở vùng chữ T (trán, mũi, cằm) không?",
        options: [
            { answer: "Có, rất thường xuyên", score: { dry: 0, oily: 2, normal: 0, combination: 1 } },
            { answer: "Thỉnh thoảng", score: { dry: 0, oily: 1, normal: 1, combination: 2 } },
            { answer: "Không bao giờ", score: { dry: 2, oily: 0, normal: 2, combination: 0 } },
        ],
    },
    {
        id: 3,
        question: "Da bạn có dễ bị bong tróc không?",
        options: [
            { answer: "Có, rất dễ", score: { dry: 2, oily: 0, normal: 0, combination: 0 } },
            { answer: "Không, rất hiếm", score: { dry: 0, oily: 0, normal: 2, combination: 1 } },
            { answer: "Không, nhưng thường bóng dầu", score: { dry: 0, oily: 2, normal: 0, combination: 1 } },
        ],
    },
    {
        id: 4,
        question: "Bạn có cảm giác da bị căng sau khi tiếp xúc với gió hoặc máy lạnh không?",
        options: [
            { answer: "Có, rất thường xuyên", score: { dry: 2, oily: 0, normal: 0, combination: 1 } },
            { answer: "Thỉnh thoảng", score: { dry: 1, oily: 0, normal: 1, combination: 1 } },
            { answer: "Không bao giờ", score: { dry: 0, oily: 2, normal: 2, combination: 0 } },
        ],
    },
    {
        id: 5,
        question: "Lỗ chân lông của bạn trông như thế nào?",
        options: [
            { answer: "Rất nhỏ, khó nhìn thấy", score: { dry: 2, oily: 0, normal: 1, combination: 0 } },
            { answer: "Bình thường, không quá to", score: { dry: 0, oily: 0, normal: 2, combination: 1 } },
            { answer: "To và dễ thấy", score: { dry: 0, oily: 2, normal: 0, combination: 1 } },
        ],
    },
    {
        id: 6,
        question: "Bạn có thường xuyên bị mụn không?",
        options: [
            { answer: "Có, rất thường xuyên", score: { dry: 0, oily: 2, normal: 0, combination: 1 } },
            { answer: "Thỉnh thoảng", score: { dry: 0, oily: 1, normal: 1, combination: 2 } },
            { answer: "Hiếm khi", score: { dry: 2, oily: 0, normal: 2, combination: 0 } },
        ],
    },
    {
        id: 7,
        question: "Da bạn có bị đỏ hoặc kích ứng khi sử dụng mỹ phẩm không?",
        options: [
            { answer: "Có, rất dễ bị", score: { dry: 2, oily: 0, normal: 0, combination: 1 } },
            { answer: "Thỉnh thoảng", score: { dry: 1, oily: 0, normal: 1, combination: 1 } },
            { answer: "Không bao giờ", score: { dry: 0, oily: 2, normal: 2, combination: 0 } },
        ],
    },
    {
        id: 8,
        question: "Bạn cảm thấy da mình như thế nào vào cuối ngày?",
        options: [
            { answer: "Rất khô và căng", score: { dry: 2, oily: 0, normal: 0, combination: 0 } },
            { answer: "Bình thường", score: { dry: 0, oily: 0, normal: 2, combination: 1 } },
            { answer: "Rất nhờn", score: { dry: 0, oily: 2, normal: 0, combination: 1 } },
        ],
    },
    {
        id: 9,
        question: "Bạn có cảm giác da không đều màu hoặc có vùng da khô và vùng da nhờn không?",
        options: [
            { answer: "Có, rất rõ ràng", score: { dry: 0, oily: 0, normal: 0, combination: 2 } },
            { answer: "Thỉnh thoảng", score: { dry: 1, oily: 1, normal: 1, combination: 1 } },
            { answer: "Không, da đều màu", score: { dry: 2, oily: 2, normal: 2, combination: 0 } },
        ],
    },
    {
        id: 10,
        question: "Bạn có cảm giác da mình cần dưỡng ẩm thường xuyên không?",
        options: [
            { answer: "Có, rất cần", score: { dry: 2, oily: 0, normal: 0, combination: 1 } },
            { answer: "Thỉnh thoảng", score: { dry: 1, oily: 0, normal: 1, combination: 1 } },
            { answer: "Không cần", score: { dry: 0, oily: 2, normal: 2, combination: 0 } },
        ],
    },
];

export default questions;