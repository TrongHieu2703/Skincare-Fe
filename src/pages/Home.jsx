import React from 'react'
import Carousel from '../components/Carousel'
import AboutUs from '../components/AboutUs'
import FeaturedNews from '../components/FeaturedNews'
import Footer from '../components/Footer'


function Home() {
    return (
        <div>
            <Carousel />
            <FeaturedNews />
            <AboutUs />
        </div>
    )
}

export default Home