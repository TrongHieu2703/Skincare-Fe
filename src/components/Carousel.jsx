import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "/src/styles/Carousel.css";
const mainSlides = [
    "./src/assets/images/giua1.jpg",
    "./src/assets/images/giua2.jpg",
    "./src/assets/images/giua3.jpg",
    "./src/assets/images/giua4.webp",
];

const sideBanners = {
    left: "./src/assets/images/trai.jpg",
    right: "./src/assets/images/doc2.jpeg"
};

const Carousel = () => {
    return (
        <div className="carousel-wrapper">
            <div className="side-banner left">
                <img src={sideBanners.left} alt="Left banner" />
            </div>

            <div className="carousel-container">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={true}
                    className="carousel"
                >
                    {mainSlides.map((src, index) => (
                        <SwiperSlide key={index}>
                            <img src={src} alt={`Slide ${index + 1}`} className="carousel-image" />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="side-banner right">
                <img src={sideBanners.right} alt="Right banner" />
            </div>
        </div>
    );
};

export default Carousel;
