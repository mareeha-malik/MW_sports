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
      img: "https://res.cloudinary.com/dugqqxf20/image/upload/v1780650464/WhatsApp_Image_2026-06-05_at_2.07.21_PM_jtr6od.jpg",
    },
    {
      id: 1,
      img: "https://res.cloudinary.com/dugqqxf20/image/upload/v1780647210/Hero_Shirts_ptmqam.svg",
    },
    {
      id:2,
      img:"https://res.cloudinary.com/dugqqxf20/image/upload/v1780647170/Hero_All_Shirts_zkvold.svg",
    },
    {
      id:3,
      img:"https://res.cloudinary.com/dugqqxf20/image/upload/v1780650344/WhatsApp_Image_2026-06-05_at_2.05.06_PM_gl6k9r.jpg",
    },
    {
      id:4,
      img:"https://res.cloudinary.com/dugqqxf20/image/upload/v1780650429/WhatsApp_Image_2026-06-05_at_2.06.47_PM_cn4nel.jpg",
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
