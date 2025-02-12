import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "../components/Carouse.css"// Import file CSS để tùy chỉnh giao diện

const images = [
    "./src/images/anh1.jpg",
    "./src/images/anh2.jpg",
    "./src/images/anh3.png",

];

const Carousel = () => {
    return (
        <div className="carousel-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                className="carousel"
            >
                {images.map((src, index) => (
                    <SwiperSlide key={index}>
                        <img src={src} alt={`Slide ${index + 1}`} className="carousel-image" />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Carousel;
