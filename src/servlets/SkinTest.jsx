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
    q10: "",
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
        {/* Thêm các câu hỏi khác tại đây */}
        <button type="submit">Gửi bài test</button>
      </form>
    </div>
  );
};

export default SkinTest;
