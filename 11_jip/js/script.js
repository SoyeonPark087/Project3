/* =========================================
   BANNER SWIPER
========================================= */
const bannerSwiper = new Swiper(
  ".bannerSwiper",
  {

    /* 한 화면에 1개 */
    slidesPerView: 1,

    /* 한 번에 1개 이동 */
    slidesPerGroup: 1,

    /* 무한 반복 */
    loop: true,

    /* 이동 속도 */
    speed: 700,

    /* 3초 자동재생 */
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },

    /* 배너 전용 좌우 버튼 */
    navigation: {
      nextEl: ".bannerSwiper .custom-next",
      prevEl: ".bannerSwiper .custom-prev"
    },

    /* 페이지 번호 */
    pagination: {
      el: ".bannerSwiper .swiper-pagination",
      type: "fraction"
    }

  }
);


/* =========================================
   PRODUCT SWIPER
========================================= */
const productSwiper = new Swiper(
  ".productSwiper",
  {

    /* =====================================
       한 화면에 상품 4개
    ====================================== */
    slidesPerView: 4,


    /* =====================================
       카드 사이 간격

       시안에 맞게 기존 20px보다 조금 작게
    ====================================== */
    spaceBetween: 18,


    /* =====================================
       한 번에 한 개씩 이동
    ====================================== */
    slidesPerGroup: 1,


    /* =====================================
       무한 반복
    ====================================== */
    loop: true,


    /* =====================================
       이동 속도
    ====================================== */
    speed: 650,


    /* =====================================
       3초마다 한 개씩 자동 이동
    ====================================== */
    autoplay: {

      delay: 3000,

      /* 사용자가 버튼을 눌러도 자동재생 유지 */
      disableOnInteraction: false

    },


    /* =====================================
       상품 슬라이드 전용 좌우 버튼

       배너 버튼과 충돌하지 않도록
       .productSwiper 범위를 지정
    ====================================== */
    navigation: {

      nextEl:
        ".productSwiper .custom-next",

      prevEl:
        ".productSwiper .custom-prev"

    }

  }
);