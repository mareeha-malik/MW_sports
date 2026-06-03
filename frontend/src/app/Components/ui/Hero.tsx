"use client";
import React from 'react';
import Slider from 'react-slick';

const Hero = () => {
  var settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    pauseOnHover: false
  };

  const Slide_Data = [
    {
      id: 0,
      img: "/Hero_Main.svg",
    },
    {
      id: 1,
      img: "/Hero_Shirts.svg",
    },
    {
      id:2,
      img:"/Hero_Bats.svg",
    },
    {
      id:3,
      img:"/Hero_Gears.svg",
    },
    {
      id:4,
      img:"/Hero_All_Shirts.svg",
    }
  ];

  return (
    <div>
      <div className="container pt-6 lg:pt-0">
        <Slider {...settings}>
          {Slide_Data.map((slide) => (
            <div key={slide.id}>
              <img src={slide.img} alt={`Slide ${slide.id}`} className="w-full h-auto" />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default Hero;
