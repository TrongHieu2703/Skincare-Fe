import React, { useState } from "react";
import "/src/styles/SkinTest.css";
import { FaCheck } from 'react-icons/fa';
import FeaturedNews from "/src/components/FeaturedNews";

const SkinTest = () => {
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
    q7: "",
    q8: "",
    q9: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers({ ...answers, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (

    <div className="skin-test-container">
      <div className="test-content">
        <div className="test-header">
          <h1>BÀI KIỂM TRA DA NHANH</h1>
          <p>Discover Your Perfect Skincare Routine</p>
        </div>

        <form onSubmit={handleSubmit} className="test-form">
          {/* Câu hỏi 1 */}
          <div className="question-card">
            <h3>Q1: Da của bạn thường trông như thế nào?</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q1"
                  value="Dry"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Khô</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q1"
                  value="Oily"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Nhờn</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q1"
                  value="Mixed"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Hỗn hợp</span>
                </span>
              </label>
            </div>
          </div>

          {/* Câu hỏi 2 */}
          <div className="question-card">
            <h3>Q2: Vùng trán của bạn trông như thế nào?</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q2"
                  value="Dry"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da khá phẳng mịn, với một vài nếp nhăn.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q2"
                  value="Oily"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Tôi thấy một vài vết bong tróc theo đường chân tóc, lông mày và giữa hai bên lông mày.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q2"
                  value="Acne"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da bóng nhờn hoặc mịn màng nhưng có một số mụn đầu đen và mụn trứng cá.</span>
                </span>
              </label>
            </div>
          </div>

          {/* Câu hỏi 3 */}
          <div className="question-card">
            <h3>Q3: Hãy mô tả phần má và vùng dưới mắt của bạn.</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q3"
                  value="Smooth"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Hầu như không có vết nhân để nhận diện nào. Chỉ có một số vùng da khô có thể nhìn ra.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q3"
                  value="Flaky"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da kích ứng và khô. Có cảm giác da bị căng.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q3"
                  value="Oily"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da chần long nơi má có khuyết điểm dạng mụn đầu đen hay đốm mụn trắng.</span>
                </span>
              </label>
            </div>
          </div>

          {/* Câu hỏi 4 */}
          <div className="question-card">
            <h3>Q4: Da của bạn có dễ hình thành các vết hằn và nếp nhăn?</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q4"
                  value="Wrinkle"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Tôi bị một vài vết hằn do da khô.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q4"
                  value="Lines"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Có, tôi bị các nếp nhăn quanh vùng mắt và/hoặc ở khóe miệng.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q4"
                  value="NoLines"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Không hẳn, da của tôi lão hóa tương đối chậm.</span>
                </span>
              </label>
            </div>
          </div>

          {/* Câu hỏi 5 */}
          <div className="question-card">
            <h3>Q5: Hiện giờ điều gì là quan trọng nhất với bạn khi lựa chọn một sản phẩm chăm sóc da?</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q5"
                  value="Moisturizing"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Sản phẩm giúp tôi đối phó với sự bóng dầu nhưng vẫn có tác dụng dưỡng ẩm.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q5"
                  value="AcneCare"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Sản phẩm giúp làm dịu và nuôi dưỡng làm da của tôi sáng lên bên trong.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q5"
                  value="Quick"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Sản phẩm có khả năng thẩm thấu nhanh và cải thiện làn da của tôi một cách nhanh chóng.</span>
                </span>
              </label>
            </div>
          </div>

          {/* Câu hỏi 6 */}
          <div className="question-card">
            <h3>Q6: Da mặt bạn đã thay đổi ra sao trong 5 năm trở lại đây?</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q6"
                  value="Tzone"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da tôi bị bóng dầu nhiều hơn ở vùng chữ T (trán, mũi và cằm).</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q6"
                  value="Dry"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da tôi dễ bong tróc hơn và thường cảm thấy căng.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q6"
                  value="Better"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da tôi vẫn ở tình trạng tốt và dễ dàng chăm sóc.</span>
                </span>
              </label>
            </div>
          </div>

          {/* Câu hỏi 7 */}
          <div className="question-card">
            <h3>Q7: Da của bạn có thay đổi trong 5 năm trở lại đây?</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q7"
                  value="LessSpots"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da tôi ít bóng dầu hơn nhiều ở vùng chữ T.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q7"
                  value="MoreWrinkles"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da tôi có nhiều khuyết điểm hơn so với trước đây.</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q7"
                  value="BetterCare"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Da tôi vẫn ở tình trạng tốt và dễ dàng chăm sóc.</span>
                </span>
              </label>
            </div>
          </div>

          {/* Câu hỏi 8 */}
          <div className="question-card">
            <h3>Q8: Giới tính của bạn là?</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q8"
                  value="Male"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Nam</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q8"
                  value="Female"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Nữ</span>
                </span>
              </label>
            </div>
          </div>

          {/* Câu hỏi 9 */}
          <div className="question-card">
            <h3>Q9: Độ tuổi của bạn là?</h3>
            <div className="options">
              <label className="option-label">
                <input
                  type="radio"
                  name="q9"
                  value="Under25"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Dưới 25</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q9"
                  value="25to40"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Từ 25 tới 40</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q9"
                  value="40to50"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Từ 40 tới 50</span>
                </span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  name="q9"
                  value="Over50"
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span>Trên 50</span>
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Get Your Skin Analysis
          </button>

        </form>

        {submitted && (
          <div className="success-message">
            <div className="success-content">
              <FaCheck className="success-icon" />
              <h2>Analysis Complete!</h2>
              <p>Based on your answers, we've created your personalized skincare recommendation.</p>
              <button className="view-results-btn">View Your Results</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinTest;
