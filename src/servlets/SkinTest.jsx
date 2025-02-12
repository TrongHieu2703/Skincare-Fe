import React, { useState } from "react";
import "./SkinTest.css";

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

  // Xử lý thay đổi radio button
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers({ ...answers, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Kết quả bài test:", answers);
  };

  return (
    <div className="skincare-test-container">
      <h1>SKINCARE MINI TEST</h1>
      <form onSubmit={handleSubmit}>
        {/* Câu hỏi 1 */}
        <div className="question">
          <label>Q1: Da của bạn thường trông như thế nào?</label>
          <div className="options">
            <label>
              <input type="radio" name="q1" value="Dry" onChange={handleChange} />
              Khô
            </label>
            <label>
              <input type="radio" name="q1" value="Oily" onChange={handleChange} />
              Nhờn
            </label>
            <label>
              <input type="radio" name="q1" value="Mixed" onChange={handleChange} />
              Hỗn hợp
            </label>
          </div>
        </div>

        {/* Câu hỏi 2 */}
        <div className="question">
          <label>Q2: Vùng trán của bạn trông như thế nào?</label>
          <div className="options">
            <label>
              <input type="radio" name="q2" value="Dry" onChange={handleChange} />
              Da khá phẳng mịn, với một vài nếp nhăn.
            </label>
            <label>
              <input type="radio" name="q2" value="Oily" onChange={handleChange} />
              Tôi thấy một vài vết bong tróc theo đường chân tóc, lông mày và giữa hai bên lông mày.
            </label>
            <label>
              <input type="radio" name="q2" value="Acne" onChange={handleChange} />
              Da bóng nhờn hoặc mịn màng nhưng có một số mụn đầu đen và mụn trứng cá.
            </label>
          </div>
        </div>

        {/* Câu hỏi 3 */}
        <div className="question">
          <label>Q3: Hãy mô tả phần má và vùng dưới mắt của bạn.</label>
          <div className="options">
            <label>
              <input type="radio" name="q3" value="Smooth" onChange={handleChange} />
              Hầu như không có vết nhân để nhận diện nào. Chỉ có một số vùng da khô có thể nhìn ra.
            </label>
            <label>
              <input type="radio" name="q3" value="Flaky" onChange={handleChange} />
              Da kích ứng và khô. Có cảm giác da bị căng.
            </label>
            <label>
              <input type="radio" name="q3" value="Oily" onChange={handleChange} />
              Da chần long nơi má có khuyết điểm dạng mụn đầu đen hay đốm mụn trắng.
            </label>
          </div>
        </div>

        {/* Câu hỏi 4 */}
        <div className="question">
          <label>Q4: Da của bạn có dễ hình thành các vết hằn và nếp nhăn?</label>
          <div className="options">
            <label>
              <input type="radio" name="q4" value="Wrinkle" onChange={handleChange} />
              Tôi bị một vài vết hằn do da khô.
            </label>
            <label>
              <input type="radio" name="q4" value="Lines" onChange={handleChange} />
              Có, tôi bị các nếp nhăn quanh vùng mắt và/hoặc ở khóe miệng.
            </label>
            <label>
              <input type="radio" name="q4" value="NoLines" onChange={handleChange} />
              Không hẳn, da của tôi lão hóa tương đối chậm.
            </label>
          </div>
        </div>

        {/* Câu hỏi 5 */}
        <div className="question">
          <label>Q5: Hiện giờ điều gì là quan trọng nhất với bạn khi lựa chọn một sản phẩm chăm sóc da?</label>
          <div className="options">
            <label>
              <input type="radio" name="q5" value="Moisturizing" onChange={handleChange} />
              Sản phẩm giúp tôi đối phó với sự bóng dầu nhưng vẫn có tác dụng dưỡng ẩm.
            </label>
            <label>
              <input type="radio" name="q5" value="AcneCare" onChange={handleChange} />
              Sản phẩm giúp làm dịu và nuôi dưỡng làm da của tôi sáng lên bên trong.
            </label>
            <label>
              <input type="radio" name="q5" value="Quick" onChange={handleChange} />
              Sản phẩm có khả năng thẩm thấu nhanh và cải thiện làn da của tôi một cách nhanh chóng.
            </label>
          </div>
        </div>

        {/* Câu hỏi 6 */}
        <div className="question">
          <label>Q6: Da mặt bạn đã thay đổi ra sao trong 5 năm trở lại đây?</label>
          <div className="options">
            <label>
              <input type="radio" name="q6" value="Tzone" onChange={handleChange} />
              Da tôi bị bóng dầu nhiều hơn ở vùng chữ T (trán, mũi và cằm).
            </label>
            <label>
              <input type="radio" name="q6" value="Dry" onChange={handleChange} />
              Da tôi dễ bong tróc hơn và thường cảm thấy căng.
            </label>
            <label>
              <input type="radio" name="q6" value="Better" onChange={handleChange} />
              Da tôi vẫn ở tình trạng tốt và dễ dàng chăm sóc.
            </label>
          </div>
        </div>

        {/* Câu hỏi 7 */}
        <div className="question">
          <label>Q7: Da của bạn có thay đổi trong 5 năm trở lại đây?</label>
          <div className="options">
            <label>
              <input type="radio" name="q7" value="LessSpots" onChange={handleChange} />
              Da tôi ít bóng dầu hơn nhiều ở vùng chữ T.
            </label>
            <label>
              <input type="radio" name="q7" value="MoreWrinkles" onChange={handleChange} />
              Da tôi có nhiều khuyết điểm hơn so với trước đây.
            </label>
            <label>
              <input type="radio" name="q7" value="BetterCare" onChange={handleChange} />
              Da tôi vẫn ở tình trạng tốt và dễ dàng chăm sóc.
            </label>
          </div>
        </div>

        {/* Câu hỏi 8 */}
        <div className="question">
          <label>Q8: Giới tính của bạn là?</label>
          <div className="options">
            <label>
              <input type="radio" name="q8" value="Male" onChange={handleChange} />
              Nam
            </label>
            <label>
              <input type="radio" name="q8" value="Female" onChange={handleChange} />
              Nữ
            </label>
          </div>
        </div>

        {/* Câu hỏi 9 */}
        <div className="question">
          <label>Q9: Độ tuổi của bạn là?</label>
          <div className="options">
            <label>
              <input type="radio" name="q9" value="Under25" onChange={handleChange} />
              Dưới 25
            </label>
            <label>
              <input type="radio" name="q9" value="25to40" onChange={handleChange} />
              Từ 25 tới 40
            </label>
            <label>
              <input type="radio" name="q9" value="40to50" onChange={handleChange} />
              Từ 40 tới 50
            </label>
            <label>
              <input type="radio" name="q9" value="Over50" onChange={handleChange} />
              Trên 50
            </label>
          </div>
        </div>

        <button type="submit">Submit Answer</button>
      </form>
    </div>
  );
};

export default SkinTest;
