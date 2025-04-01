import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/RoutinePage.css';

const routines = {
    dry: {
        title: 'Lộ trình chăm sóc cho Da khô',
        image: 'https://paulaschoice.vn/wp-content/uploads/2023/02/cach-cham-soc-da-kho-nhay-cam-7.png',

        steps: [
            '✨ Làm sạch nhẹ nhàng với sữa rửa mặt dưỡng ẩm:\nChọn sản phẩm không chứa sulfate để tránh làm mất độ ẩm tự nhiên của da. Rửa mặt bằng nước ấm để làm dịu da. Điều này giúp da không bị khô, ngứa hay kích ứng.',
            '💧 Dùng toner cấp nước, không cồn:\nToner nên chứa glycerin hoặc hoa cúc, giúp cân bằng độ pH và cấp nước tức thì cho làn da khô ráp. Tránh sử dụng toner có cồn vì chúng có thể làm khô da.',
            '🧴 Thoa serum chứa Hyaluronic Acid:\nSerum giúp hút ẩm và giữ nước sâu trong da, làm mềm và giảm tình trạng bong tróc. Hyaluronic acid giúp da bạn luôn mềm mại và ẩm mượt.',
            '🧴 Dưỡng ẩm sâu bằng kem dưỡng giàu chất béo:\nChọn kem có chứa ceramide hoặc shea butter để phục hồi hàng rào bảo vệ da. Điều này giúp da bạn duy trì độ ẩm suốt cả ngày.',
            '🧴 Dùng kem chống nắng có thành phần dưỡng da:\nChống nắng vật lý hoặc có bổ sung dưỡng chất như vitamin E giúp bảo vệ và nuôi dưỡng da khô.'
        ],
        additionalTips: [
            '👉 Uống đủ nước mỗi ngày để giữ cho da luôn mềm mại và đủ ẩm.',
            '👉 Hạn chế tắm nước quá nóng, vì nước nóng có thể làm khô da.',
            '👉 Sử dụng mặt nạ dưỡng ẩm mỗi tuần để tăng cường độ ẩm cho da khô.'
        ]
    },
    oily: {
        title: 'Lộ trình chăm sóc cho Da dầu',
        image: 'https://images-1.eucerin.com/~/media/eucerin/local/vn/cac-buoc-skincare-cho-da-mun-revamp/cac-buoc-skincare-cho-da-dau-mun.png',

        steps: [
            '🧼 Làm sạch kỹ bằng sữa rửa mặt kiềm dầu:\nChọn loại có salicylic acid hoặc trà xanh để kiểm soát bã nhờn và ngừa mụn. Rửa mặt ít nhất 2 lần mỗi ngày để ngăn ngừa bít tắc lỗ chân lông.',
            '🍃 Dùng toner se khít lỗ chân lông:\nSử dụng toner chứa witch hazel hoặc niacinamide giúp giảm bóng nhờn và cải thiện cấu trúc da. Nó cũng giúp làm sạch sâu và loại bỏ bụi bẩn tích tụ.',
            '🧴 Serum chứa Niacinamide hoặc BHA:\nGiúp kiểm soát dầu, giảm mụn ẩn và thu nhỏ lỗ chân lông hiệu quả. Serum này cũng giúp da trông đều màu và sáng hơn.',
            '🧴 Dưỡng ẩm dạng gel:\nKhông bỏ qua bước này! Gel dưỡng thấm nhanh, cấp nước nhưng không gây bí da. Da dầu vẫn cần được dưỡng ẩm để không bị mất nước.',
            '🌞 Dùng kem chống nắng không gây nhờn:\nƯu tiên sản phẩm oil-free, không gây mụn (non-comedogenic), kết cấu mỏng nhẹ.'
        ],
        additionalTips: [
            '👉 Không sờ tay lên mặt quá thường xuyên, vì tay có thể mang vi khuẩn và dầu thừa.',
            '👉 Tẩy tế bào chết 1-2 lần mỗi tuần để loại bỏ bã nhờn và tế bào chết tích tụ trên da.',
            '👉 Dùng giấy thấm dầu để kiểm soát lượng dầu dư thừa trong ngày.'
        ]
    },
    normal: {
        title: 'Lộ trình chăm sóc cho Da thường',
        image: 'https://paulaschoice.vn/wp-content/uploads/2022/06/cham-soc-da-thuong-2.jpg',

        steps: [
            '🧼 Làm sạch bằng sữa rửa mặt dịu nhẹ:\nGiúp loại bỏ bụi bẩn mà không gây khô hay kích ứng. Đảm bảo sản phẩm bạn chọn không làm mất đi lớp dầu tự nhiên của da.',
            '💧 Toner cấp nước nhẹ nhàng:\nGiữ cho da cân bằng, sẵn sàng hấp thu dưỡng chất từ các bước sau. Toner giúp làm dịu và cung cấp độ ẩm cho da.',
            '🧴 Serum dưỡng sáng hoặc ngăn lão hoá:\nCó thể chọn vitamin C để làm sáng hoặc peptide để tăng đàn hồi da. Serum này giúp da sáng khỏe và đều màu.',
            '🧴 Kem dưỡng cân bằng độ ẩm:\nKhông cần quá đặc, chỉ cần khóa ẩm và duy trì sự mềm mại tự nhiên của da. Chọn kem dưỡng nhẹ nhàng, không gây bít tắc lỗ chân lông.',
            '🌞 Kem chống nắng SPF từ 30 trở lên:\nBảo vệ da khỏi tác hại tia UV, giúp duy trì làn da khoẻ mạnh lâu dài. Chống nắng là bước không thể thiếu dù da bạn là da thường.'
        ],
        additionalTips: [
            '👉 Duy trì chế độ ăn uống cân bằng để giúp da luôn khỏe mạnh và sáng đẹp.',
            '👉 Uống đủ nước mỗi ngày để giúp da luôn ẩm mượt.',
            '👉 Thực hiện các bước chăm sóc da đều đặn để duy trì làn da khỏe mạnh lâu dài.'
        ]
    },
    combination: {
        title: 'Lộ trình chăm sóc cho Da hỗn hợp',
        image: 'https://paulaschoice.vn/wp-content/uploads/2019/08/cham-soc-da-hon-hop-vao-mua-he-0.jpg',

        steps: [
            '🧼 Sữa rửa mặt cho da hỗn hợp, làm sạch vùng chữ T:\nChọn sản phẩm làm sạch sâu nhưng không quá khô da, tập trung vùng trán, mũi, cằm.',
            '🍃 Toner cấp nước vùng má và kiềm dầu vùng trán/cằm:\nDùng bông tách vùng toner nếu cần, hoặc chọn toner cân bằng.',
            '🧴 Serum đa tác dụng hoặc chia vùng da:\nDùng serum BHA cho vùng dầu và Hyaluronic Acid cho vùng khô.',
            '🧴 Dưỡng ẩm dịu nhẹ, tập trung vùng da khô:\nChọn kem dưỡng dạng lotion, dùng thêm kem chuyên sâu ở vùng má nếu bị khô.',
            '🌞 Chống nắng không gây bí da:\nSử dụng loại thấm nhanh, có thể phủ thêm phấn kiềm dầu nếu cần.'
        ],
        additionalTips: [
            '👉 Sử dụng mặt nạ cho từng vùng da để cung cấp dưỡng chất phù hợp cho từng khu vực.',
            '👉 Dùng sản phẩm tẩy tế bào chết nhẹ nhàng để không làm khô da.',
            '👉 Điều chỉnh chế độ dưỡng ẩm cho vùng da khô và da dầu để đạt được hiệu quả tốt nhất.'
        ]
    }
};

const RoutinePage = () => {
    const { skinType } = useParams();
    const routine = routines[skinType];

    if (!routine) return <div className="routinePage">Không tìm thấy lộ trình phù hợp.</div>;

    return (
        <div className="routinePage">
            <div className="routine-header">
                <h1 className="routine-title">{routine.title}</h1>

                <div className="routine-media">
                    {routine.image && (
                        <div className="routine-image-container">
                            <img src={routine.image} alt={`Hình ảnh cho ${routine.title}`} className="routine-image" />
                        </div>
                    )}

                    {routine.video && (
                        <div className="routine-video-container">
                            <video
                                controls
                                className="routine-video"
                                poster={routine.image}
                            >
                                <source src={routine.video} type="video/mp4" />
                                Trình duyệt của bạn không hỗ trợ video tag.
                            </video>
                        </div>
                    )}
                </div>
            </div>

            <div className="routine-content">
                <div className="routine-steps">
                    <h2 className="section-title">Các bước chăm sóc da</h2>

                    <div className="steps-list">
                        {routine.steps.map((step, index) => {
                            const [title, description] = step.split(':\n');

                            return (
                                <div key={index} className="step-item">
                                    <h3 className="step-title">{title}</h3>
                                    <p className="step-description">{description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="routine-tips">
                    <h2 className="section-title">Lời khuyên bổ sung</h2>

                    <div className="tips-list">
                        {routine.additionalTips.map((tip, index) => (
                            <div key={index} className="tip-item">
                                <p>{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutinePage;