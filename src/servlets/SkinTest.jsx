import React, { useState } from "react";

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

    // Handle radio button changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnswers({ ...answers, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Test results:", answers);
    };

    return (
        <div style={{ marginTop: "80px" }}> {/* Added margin to avoid overlap with navbar */}
            <h1>SKINCARE MINI TEST</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Q1: Da của bạn thường trông như thế nào?</label>
                    <div>
                        <input
                            type="radio"
                            id="q1_a"
                            name="q1"
                            value="Dry"
                            onChange={handleChange}
                        />
                        <label htmlFor="q1_a">Khô</label>
                        <input
                            type="radio"
                            id="q1_b"
                            name="q1"
                            value="Oily"
                            onChange={handleChange}
                        />
                        <label htmlFor="q1_b">Nhờn</label>
                        <input
                            type="radio"
                            id="q1_c"
                            name="q1"
                            value="Mixed"
                            onChange={handleChange}
                        />
                        <label htmlFor="q1_c">Hỗn hợp</label>
                    </div>
                </div>
                {/* Additional questions... */}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default SkinTest;
