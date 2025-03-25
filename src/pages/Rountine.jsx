import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/RoutinePage.css';

const routines = {
    dry: {
        title: 'Lộ trình chăm sóc cho Da khô',
        steps: [
            '✨ Làm sạch nhẹ nhàng với sữa rửa mặt dưỡng ẩm:\nChọn sản phẩm không chứa sulfate để tránh làm mất độ ẩm tự nhiên của da. Rửa mặt bằng nước ấm để làm dịu da.',
            '💧 Dùng toner cấp nước, không cồn:\nToner nên chứa glycerin hoặc hoa cúc, giúp cân bằng độ pH và cấp nước tức thì cho làn da khô ráp.',
            '🧴 Thoa serum chứa Hyaluronic Acid:\nSerum giúp hút ẩm và giữ nước sâu trong da, làm mềm và giảm tình trạng bong tróc.',
            '🧴 Dưỡng ẩm sâu bằng kem dưỡng giàu chất béo:\nChọn kem có chứa ceramide hoặc shea butter để phục hồi hàng rào bảo vệ da.',
            '🧴 Dùng kem chống nắng có thành phần dưỡng da:\nChống nắng vật lý hoặc có bổ sung dưỡng chất như vitamin E giúp bảo vệ và nuôi dưỡng da khô.'
        ]
    },
    oily: {
        title: 'Lộ trình chăm sóc cho Da dầu',
        steps: [
            '🧼 Làm sạch kỹ bằng sữa rửa mặt kiềm dầu:\nChọn loại có salicylic acid hoặc trà xanh để kiểm soát bã nhờn và ngừa mụn.',
            '🍃 Dùng toner se khít lỗ chân lông:\nSử dụng toner chứa witch hazel hoặc niacinamide giúp giảm bóng nhờn và cải thiện cấu trúc da.',
            '🧴 Serum chứa Niacinamide hoặc BHA:\nGiúp kiểm soát dầu, giảm mụn ẩn và thu nhỏ lỗ chân lông hiệu quả.',
            '🧴 Dưỡng ẩm dạng gel:\nKhông bỏ qua bước này! Gel dưỡng thấm nhanh, cấp nước nhưng không gây bí da.',
            '🌞 Dùng kem chống nắng không gây nhờn:\nƯu tiên sản phẩm oil-free, không gây mụn (non-comedogenic), kết cấu mỏng nhẹ.'
        ]
    },
    normal: {
        title: 'Lộ trình chăm sóc cho Da thường',
        steps: [
            '🧼 Làm sạch bằng sữa rửa mặt dịu nhẹ:\nGiúp loại bỏ bụi bẩn mà không gây khô hay kích ứng.',
            '💧 Toner cấp nước nhẹ nhàng:\nGiữ cho da cân bằng, sẵn sàng hấp thu dưỡng chất từ các bước sau.',
            '🧴 Serum dưỡng sáng hoặc ngăn lão hoá:\nCó thể chọn vitamin C để làm sáng hoặc peptide để tăng đàn hồi da.',
            '🧴 Kem dưỡng cân bằng độ ẩm:\nKhông cần quá đặc, chỉ cần khóa ẩm và duy trì sự mềm mại tự nhiên của da.',
            '🌞 Kem chống nắng SPF từ 30 trở lên:\nBảo vệ da khỏi tác hại tia UV, giúp duy trì làn da khoẻ mạnh lâu dài.'
        ]
    },
    combination: {
        title: 'Lộ trình chăm sóc cho Da hỗn hợp',
        steps: [
            '🧼 Sữa rửa mặt cho da hỗn hợp, làm sạch vùng chữ T:\nChọn sản phẩm làm sạch sâu nhưng không quá khô da, tập trung vùng trán, mũi, cằm.',
            '🍃 Toner cấp nước vùng má và kiềm dầu vùng trán/cằm:\nDùng bông tách vùng toner nếu cần, hoặc chọn toner cân bằng.',
            '🧴 Serum đa tác dụng hoặc chia vùng da:\nDùng serum BHA cho vùng dầu và Hyaluronic Acid cho vùng khô.',
            '🧴 Dưỡng ẩm dịu nhẹ, tập trung vùng da khô:\nChọn kem dưỡng dạng lotion, dùng thêm kem chuyên sâu ở vùng má nếu bị khô.',
            '🌞 Chống nắng không gây bí da:\nSử dụng loại thấm nhanh, có thể phủ thêm phấn kiềm dầu nếu cần.'
        ]
    }
};


const RoutinePage = () => {
    const { skinType } = useParams();
    const routine = routines[skinType];

    if (!routine) return <div className="routinePage">Không tìm thấy lộ trình phù hợp.</div>;

    return (
        <div className="routinePage">
            <h2>{routine.title}</h2>
            <ul>
                {routine.steps.map((step, index) => (
                    <li key={index}>• {step}</li>
                ))}
            </ul>
        </div>
    );
};

export default RoutinePage;
