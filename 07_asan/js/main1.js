document.addEventListener("DOMContentLoaded", function () {
    const mainBannerSwiper = new Swiper(".main-banner-swiper", {
        /**
         * 한 화면에 배너 한 장 표시
         */
        slidesPerView: 1,
        spaceBetween: 0,

        /**
         * 마지막 슬라이드 다음에 첫 슬라이드 연결
         */
        loop: true,

        /**
         * 슬라이드 이동 속도
         */
        speed: 700,

        /**
         * 자동 슬라이드
         */
        autoplay: {
            delay: 3500,
            disableOnInteraction: false
        },

        /**
         * 손가락 드래그
         */
        allowTouchMove: true,
        simulateTouch: true,
        grabCursor: true,

        /**
         * 좌우 이동 버튼
         */
        navigation: {
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next"
        },

        /**
         * 하단 페이지네이션
         */
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },

        /**
         * 키보드 접근성
         */
        keyboard: {
            enabled: true,
            onlyInViewport: true
        },

        /**
         * 접근성 문구
         */
        a11y: {
            enabled: true,
            prevSlideMessage: "이전 배너",
            nextSlideMessage: "다음 배너",
            firstSlideMessage: "첫 번째 배너입니다",
            lastSlideMessage: "마지막 배너입니다",
            paginationBulletMessage: "{{index}}번째 배너로 이동"
        }
    });


    /**
     * 사용자가 배너 위에 손가락을 올린 경우
     * 자동 넘김을 잠시 중단합니다.
     */
    const bannerElement = document.querySelector(".main-banner-swiper");

    if (bannerElement) {
        bannerElement.addEventListener(
            "touchstart",
            function () {
                mainBannerSwiper.autoplay.stop();
            },
            {
                passive: true
            }
        );

        bannerElement.addEventListener(
            "touchend",
            function () {
                mainBannerSwiper.autoplay.start();
            },
            {
                passive: true
            }
        );
    }
});