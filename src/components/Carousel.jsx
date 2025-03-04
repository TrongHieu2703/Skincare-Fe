import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "/src/styles/Carousel.css";

const images = [
    "./src/assets/images/anh1.jpg",
    "./src/assets/images/banner2.jpg",
    "./src/assets/images/banner9.jpg",
    "./src/assets/images/banner6.webp",


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
