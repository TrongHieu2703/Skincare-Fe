import React, { useState } from 'react';
import questions from '/src/store/question';
import '../styles/Skintest.css';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const SkinTest = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  const handleSelect = (qId, optionIndex) => {
    setAnswers({ ...answers, [qId]: optionIndex });
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResult = () => {
    const scores = { dry: 0, oily: 0, normal: 0, combination: 0 };
    questions.forEach((q) => {
      const selectedIndex = answers[q.id];
      if (selectedIndex !== undefined) {
        const selectedOption = q.options[selectedIndex];
        for (const key in selectedOption.score) {
          scores[key] += selectedOption.score[key];
        }
      }
    });

    const skinType = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    const skinLabel = {
      dry: 'Da khô',
      oily: 'Da dầu',
      normal: 'Da thường',
      combination: 'Da hỗn hợp',
    };

    const imageMap = {
      dry: 'https://cdn-icons-png.flaticon.com/512/2721/2721084.png',
      oily: 'https://cdn-icons-png.flaticon.com/512/2721/2721103.png',
      normal: 'https://cdn-icons-png.flaticon.com/512/2721/2721056.png',
      combination: 'https://cdn-icons-png.flaticon.com/512/2721/2721066.png',
    };

    setResult({ type: skinType, label: skinLabel[skinType] });
    setImage(imageMap[skinType]);
  };

  const handleGoToRoutine = () => {
    if (result?.type) {
      navigate(`/routine/${result.type}`);
    }
  };

  return (
    <div className="skin-test-page">
      <h1 className="title">🖊️ Kiểm Tra Loại Da</h1>

      <div className="questions">
        {result === null && (
          <div className="question">
            <p className="questionText">{questions[currentQuestionIndex].question}</p>
            {questions[currentQuestionIndex].options.map((opt, idx) => (
              <label key={idx} className="option">
                <input
                  type="radio"
                  name={`question-${questions[currentQuestionIndex].id}`}
                  onChange={() => handleSelect(questions[currentQuestionIndex].id, idx)}
                  checked={answers[questions[currentQuestionIndex].id] === idx}
                />
                {opt.answer}
              </label>
            ))}
          </div>
        )}
      </div>

      {result === null && (
        <div className="navigationButtons">
          {currentQuestionIndex > 0 && (
            <button className="backBtn" onClick={handleBack}>
              Quay lại
            </button>
          )}
          {currentQuestionIndex === questions.length - 1 ? (
            <button className="submitBtn" onClick={calculateResult}>
              Xem Kết Quả
            </button>
          ) : (
            <button
              className="nextBtn"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={answers[questions[currentQuestionIndex]?.id] === undefined}
            >
              Tiếp theo
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="resultBox">
          <CheckCircle color="green" size={24} />
          <span className="resultText">
            Kết quả: <strong>{result.label}</strong>
          </span>
          {image && <img src={image} alt={result.label} className="resultImage" />}
          <p className="summary">
            Bạn giống như một cây bút – mỗi loại da đều có nét riêng và cần được chọn đúng cách để phát huy tốt nhất ✨
          </p>
          <button className="routineBtn" onClick={handleGoToRoutine}>
            Xem đề xuất lộ trình
          </button>
        </div>
      )}
    </div>
  );
};

export default SkinTest;