const questions = [
    {
        id: 1,
        question: 'Da bạn có cảm giác căng sau khi rửa mặt không?',
        options: [
            { answer: 'Có, rất khô', score: { dry: 2 } },
            { answer: 'Không, vẫn mềm mại', score: { normal: 1 } },
            { answer: 'Bóng dầu ngay sau khi rửa', score: { oily: 2 } },
        ],
    },
    {
        id: 2,
        question: 'Bạn thường xuyên bị bóng dầu ở vùng chữ T?',
        options: [
            { answer: 'Có', score: { oily: 2 } },
            { answer: 'Chỉ hơi bóng một chút', score: { combination: 1 } },
            { answer: 'Không', score: { dry: 1 } },
        ],
    },
    {
        id: 3,
        question: 'Bạn có cảm giác ngứa hoặc kích ứng khi dùng sản phẩm mới?',
        options: [
            { answer: 'Có, thường xuyên', score: { dry: 2 } },
            { answer: 'Thỉnh thoảng', score: { combination: 1 } },
            { answer: 'Hầu như không', score: { normal: 2 } },
        ],
    },
    {
        id: 4,
        question: 'Lỗ chân lông của bạn như thế nào?',
        options: [
            { answer: 'Rất to và dễ thấy', score: { oily: 2 } },
            { answer: 'Chỉ to ở vùng chữ T', score: { combination: 2 } },
            { answer: 'Nhỏ và khó thấy', score: { dry: 1 } },
        ],
    },
    {
        id: 5,
        question: 'Da bạn có dễ bị nhăn hoặc kém đàn hồi?',
        options: [
            { answer: 'Có, thấy rõ nếp nhăn và da chùng', score: { dry: 2 } },
            { answer: 'Một chút ở vùng mắt/miệng', score: { combination: 1 } },
            { answer: 'Không, da căng mịn', score: { normal: 2 } },
        ],
    },
];

export default questions;
