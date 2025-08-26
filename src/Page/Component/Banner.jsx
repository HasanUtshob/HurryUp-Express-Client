import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./banner.css";

// Import banner images
import banner1 from "../../assets/banner/1.jpg";
import banner2 from "../../assets/banner/2.jpg";
import banner3 from "../../assets/banner/3.jpg";
import banner4 from "../../assets/banner/4.jpg";

const Banner = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerData = [
    {
      id: 1,
      image: banner1,
      title: t("banner.slides.slide1.title"),
      subtitle: t("banner.slides.slide1.subtitle"),
      cta: t("banner.slides.slide1.cta"),
    },
    {
      id: 2,
      image: banner2,
      title: t("banner.slides.slide2.title"),
      subtitle: t("banner.slides.slide2.subtitle"),
      cta: t("banner.slides.slide2.cta"),
    },
    {
      id: 3,
      image: banner3,
      title: t("banner.slides.slide3.title"),
      subtitle: t("banner.slides.slide3.subtitle"),
      cta: t("banner.slides.slide3.cta"),
    },
    {
      id: 4,
      image: banner4,
      title: t("banner.slides.slide4.title"),
      subtitle: t("banner.slides.slide4.subtitle"),
      cta: t("banner.slides.slide4.cta"),
    },
  ];

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        pagination={{
          clickable: true,
          el: ".swiper-pagination-custom",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        loop={true}
        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
        className="w-full h-full"
      >
        {bannerData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              >
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent dark:from-black/80 dark:via-black/60 dark:to-black/20"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 flex items-center justify-start h-full px-6 md:px-12 lg:px-20">
                <div className="max-w-2xl text-white">
                  {/* Animated Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in-up">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      HurryUp
                    </span>{" "}
                    <span className="text-white">Express</span>
                  </h1>

                  {/* Slide Title */}
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 text-yellow-400 animate-fade-in-up animation-delay-200">
                    {slide.title}
                  </h2>

                  {/* Slide Subtitle */}
                  <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed animate-fade-in-up animation-delay-400">
                    {slide.subtitle}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                    <button className="btn btn-primary btn-lg px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                      {slide.cta}
                    </button>
                    <button className="btn btn-outline btn-lg px-8 py-3 text-white border-white hover:bg-white hover:text-black transform hover:scale-105 transition-all duration-300">
                      {t("banner.buttons.ourServices")}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 mt-8 animate-fade-in-up animation-delay-800">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        10K+
                      </div>
                      <div className="text-sm text-gray-300">{t('banner.stats.deliveries')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        24/7
                      </div>
                      <div className="text-sm text-gray-300">{t('banner.stats.support')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        99%
                      </div>
                      <div className="text-sm text-gray-300">{t('banner.stats.onTime')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <div className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </div>
      <div className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {/* Custom Pagination */}
      <div className="swiper-pagination-custom absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {bannerData.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              currentSlide === index
                ? "bg-yellow-400 w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
          ></div>
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full animate-pulse hidden lg:block"></div>
      <div className="absolute bottom-32 left-10 w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full animate-bounce hidden lg:block"></div>
    </div>
  );
};

export default Banner;
