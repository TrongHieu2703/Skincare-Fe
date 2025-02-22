import React, { useState } from "react";
import "./SkinTest.css";
import { FaCheck } from 'react-icons/fa';

// Dữ liệu câu hỏi
const questions = [
  {
    id: 'q1',
    question: 'Da của bạn thường trông như thế nào?',
    options: [
      { value: 'Dry', label: 'Khô' },
      { value: 'Oily', label: 'Nhờn' },
      { value: 'Mixed', label: 'Hỗn hợp' }
    ]
  },
  {
    id: 'q2',
    question: 'Vùng trán của bạn trông như thế nào?',
    options: [
      { value: 'Dry', label: 'Da khá phẳng mịn, với một vài nếp nhăn.' },
      { value: 'Oily', label: 'Tôi thấy một vài vết bong tróc theo đường chân tóc, lông mày và giữa hai bên lông mày.' },
      { value: 'Acne', label: 'Da bóng nhờn hoặc mịn màng nhưng có một số mụn đầu đen và mụn trứng cá.' }
    ]
  },
  {
    id: 'q3',
    question: 'Hãy mô tả phần má và vùng dưới mắt của bạn.',
    options: [
      { value: 'Smooth', label: 'Hầu như không có vết nhân để nhận diện nào. Chỉ có một số vùng da khô có thể nhìn ra.' },
      { value: 'Flaky', label: 'Da kích ứng và khô. Có cảm giác da bị căng.' },
      { value: 'Oily', label: 'Da chần long nơi má có khuyết điểm dạng mụn đầu đen hay đốm mụn trắng.' }
    ]
  },
  {
    id: 'q4',
    question: 'Da của bạn có dễ hình thành các vết hằn và nếp nhăn?',
    options: [
      { value: 'Wrinkle', label: 'Tôi bị một vài vết hằn do da khô.' },
      { value: 'Lines', label: 'Có, tôi bị các nếp nhăn quanh vùng mắt và/hoặc ở khóe miệng.' },
      { value: 'NoLines', label: 'Không hẳn, da của tôi lão hóa tương đối chậm.' }
    ]
  },
  {
    id: 'q5',
    question: 'Hiện giờ điều gì là quan trọng nhất với bạn khi lựa chọn một sản phẩm chăm sóc da?',
    options: [
      { value: 'Moisturizing', label: 'Sản phẩm giúp tôi đối phó với sự bóng dầu nhưng vẫn có tác dụng dưỡng ẩm.' },
      { value: 'AcneCare', label: 'Sản phẩm giúp làm dịu và nuôi dưỡng làm da của tôi sáng lên bên trong.' },
      { value: 'Quick', label: 'Sản phẩm có khả năng thẩm thấu nhanh và cải thiện làn da của tôi một cách nhanh chóng.' }
    ]
  },
  {
    id: 'q6',
    question: 'Da mặt bạn đã thay đổi ra sao trong 5 năm trở lại đây?',
    options: [
      { value: 'Tzone', label: 'Da tôi bị bóng dầu nhiều hơn ở vùng chữ T (trán, mũi và cằm).' },
      { value: 'Dry', label: 'Da tôi dễ bong tróc hơn và thường cảm thấy căng.' },
      { value: 'Better', label: 'Da tôi vẫn ở tình trạng tốt và dễ dàng chăm sóc.' }
    ]
  },
  {
    id: 'q7',
    question: 'Da của bạn có thay đổi trong 5 năm trở lại đây?',
    options: [
      { value: 'LessSpots', label: 'Da tôi ít bóng dầu hơn nhiều ở vùng chữ T.' },
      { value: 'MoreWrinkles', label: 'Da tôi có nhiều khuyết điểm hơn so với trước đây.' },
      { value: 'BetterCare', label: 'Da tôi vẫn ở tình trạng tốt và dễ dàng chăm sóc.' }
    ]
  },
  {
    id: 'q8',
    question: 'Giới tính của bạn là?',
    options: [
      { value: 'Male', label: 'Nam' },
      { value: 'Female', label: 'Nữ' }
    ]
  },
  {
    id: 'q9',
    question: 'Độ tuổi của bạn là?',
    options: [
      { value: 'Under25', label: 'Dưới 25' },
      { value: '25to40', label: 'Từ 25 tới 40' },
      { value: '40to50', label: 'Từ 40 tới 50' },
      { value: 'Over50', label: 'Trên 50' }
    ]
  }
];

const SkinTest = () => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
  };

  const analyzeSkinType = () => {
    // Logic phân tích loại da dựa trên câu trả lời
    let dryCount = 0;
    let oilyCount = 0;
    let mixedCount = 0;

    Object.values(answers).forEach(answer => {
      if (answer.includes('Dry')) dryCount++;
      if (answer.includes('Oily')) oilyCount++;
      if (answer.includes('Mixed')) mixedCount++;
    });

    if (dryCount > oilyCount && dryCount > mixedCount) {
      return 'Da khô';
    } else if (oilyCount > dryCount && oilyCount > mixedCount) {
      return 'Da dầu';
    } else {
      return 'Da hỗn hợp';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const skinType = analyzeSkinType();
    setResult(skinType);
    setSubmitted(true);
  };

  const renderQuestion = (question) => (
    <div key={question.id} className="question-card">
      <h3>{question.question}</h3>
      <div className="options">
        {question.options.map((option, index) => (
          <label key={index} className="option-label">
            <input
              type="radio"
              name={question.id}
              value={option.value}
              onChange={handleChange}
              checked={answers[question.id] === option.value}
            />
            <span className="option-content">
              <span>{option.label}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="skincare-test-container">
      <div className="test-header">
        <h1>KIỂM TRA LOẠI DA</h1>
        <p>Khám phá quy trình chăm sóc da phù hợp với bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="test-form">
        {questions.map(renderQuestion)}

        <button
          type="submit"
          className="submit-button"
          disabled={Object.keys(answers).length !== questions.length}
        >
          Phân tích da của bạn
        </button>
      </form>

      {submitted && (
        <div className="success-message">
          <div className="success-content">
            <div className="result-header">
              <FaCheck className="success-icon" />
              <h2>Phân tích hoàn tất!</h2>
            </div>

            <div className="result-body">
              <div className="skin-type-section">
                <p>Dựa trên câu trả lời của bạn, chúng tôi xác định:</p>
                <h3 className="skin-type-result">{result}</h3>
              </div>

              <div className="recommendation-section">
                <h4>Khuyến nghị chăm sóc da:</h4>
                <div className="recommendation-grid">
                  {result === 'Da khô' && (
                    <>
                      <div className="recommendation-item">
                        <img src="/images/cleanser.png" alt="Sữa rửa mặt" />
                        <h5>Sữa rửa mặt</h5>
                        <p>Sử dụng sữa rửa mặt dịu nhẹ, không chứa sulfate</p>
                      </div>
                      <div className="recommendation-item">
                        <img src="/images/moisturizer.png" alt="Kem dưỡng ẩm" />
                        <h5>Kem dưỡng ẩm</h5>
                        <p>Dùng kem dưỡng ẩm đậm đặc</p>
                      </div>
                      <div className="recommendation-item">
                        <img src="/images/water.png" alt="Nước" />
                        <h5>Nhiệt độ nước</h5>
                        <p>Tránh nước nóng khi rửa mặt</p>
                      </div>
                    </>
                  )}
                  {result === 'Da dầu' && (
                    <>
                      <div className="recommendation-item">
                        <img src="/images/salicylic.png" alt="Salicylic Acid" />
                        <h5>Sữa rửa mặt</h5>
                        <p>Sử dụng sữa rửa mặt có chứa Salicylic Acid</p>
                      </div>
                      <div className="recommendation-item">
                        <img src="/images/gel.png" alt="Gel dưỡng ẩm" />
                        <h5>Kem dưỡng ẩm</h5>
                        <p>Dùng kem dưỡng ẩm dạng gel</p>
                      </div>
                      <div className="recommendation-item">
                        <img src="/images/toner.png" alt="Toner" />
                        <h5>Toner</h5>
                        <p>Thêm toner cân bằng độ pH</p>
                      </div>
                    </>
                  )}
                  {result === 'Da hỗn hợp' && (
                    <>
                      <div className="recommendation-item">
                        <img src="/images/oil-free.png" alt="Sản phẩm không dầu" />
                        <h5>Sản phẩm</h5>
                        <p>Sử dụng sản phẩm không chứa dầu</p>
                      </div>
                      <div className="recommendation-item">
                        <img src="/images/zone.png" alt="Dưỡng ẩm theo vùng" />
                        <h5>Dưỡng ẩm</h5>
                        <p>Dưỡng ẩm theo vùng</p>
                      </div>
                      <div className="recommendation-item">
                        <img src="/images/mask.png" alt="Mặt nạ đất sét" />
                        <h5>Mặt nạ</h5>
                        <p>Cân nhắc sử dụng mặt nạ đất sét</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinTest;
