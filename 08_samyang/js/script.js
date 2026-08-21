$(function(){

    $(".gnb").mouseenter(function(){

        $(".gnb-bg, .depth2")
            .stop(true, true)
            .slideDown(400);

    });

    $("#header").mouseleave(function(){

        $(".gnb-bg, .depth2")
            .stop(true, true)
            .slideUp(400);

    });

});

/* =========================
   Swiper Slide
========================= */

const mainSwiper = new Swiper(".mainSwiper", {

    /* 무한 반복 */
    loop: true,


    /* 자동 슬라이드 */
    autoplay: {

        /* 3초마다 실행 */
        delay: 3000,

        /* 사용자가 버튼을 눌러도 자동재생 유지 */
        disableOnInteraction: false,

    },


    /* 슬라이드 속도 */
    speed: 700,


    /* 좌우 버튼 */
    navigation: {

        nextEl: ".swiper-button-next",

        prevEl: ".swiper-button-prev",

    },


    /* 슬라이드가 바뀔 때 */
    on: {

        slideChange: function(){

            /* 현재 슬라이드 번호 */
            const currentNumber = this.realIndex + 1;

            $(".slide-count .current").text(currentNumber);

        }

    }

});

/* =========================
   BRAND 탭 기능
========================= */

$(function(){

    $(".brand-tab li").click(function(e){

        /* a 태그 기본 이동 방지 */
        e.preventDefault();


        /* 클릭한 탭의 순서 저장 */
        let num = $(this).index();


        /* 모든 탭의 on 클래스 제거 */
        $(".brand-tab li").removeClass("on");


        /* 클릭한 탭에 on 클래스 추가 */
        $(this).addClass("on");


        /* 모든 제품 영역 숨기기 */
        $(".brand-listwrap").hide();


        /* 클릭한 탭과 같은 순서의 제품 영역 보이기 */
        $(".brand-listwrap").eq(num).show();

    });

});


/* =========================
   패밀리 사이트
========================= */

$(".family-btn").click(function(){

    $(".family-list").slideToggle();

});

/* =========================
   TOP 버튼
========================= */

$(window).scroll(function(){

    /* 스크롤을 300px 이상 내리면 버튼 보이기 */
    if($(this).scrollTop() > 300){

        $(".top-btn").fadeIn();

    }else{

        $(".top-btn").fadeOut();

    }

});


/* TOP 버튼 클릭 */

$(".top-btn").click(function(){

    $("html, body").animate({

        scrollTop: 0

    }, 500);

});

/* =========================
   팝업창
========================= */

$(function(){

    /* 오늘 날짜 */
    const today = new Date().toDateString();


    /* 저장된 날짜 불러오기 */
    const popupCloseDay = localStorage.getItem("popupCloseDay");


    /* 저장된 날짜가 오늘과 같으면 팝업 숨기기 */
    if(popupCloseDay === today){

        $(".popup-overlay").hide();

    }else{

        /* 웹페이지 로딩시 팝업 보이기 */
        $(".popup-overlay").show();

    }


    /* =========================
       X 버튼 클릭
    ========================= */

    $(".popup-close").click(function(){

        $(".popup-overlay").hide();

    });


    /* =========================
       하단 닫기 버튼 클릭
    ========================= */

    $(".popup-bottom-close").click(function(){

        /* 오늘 하루 닫기 체크 여부 */
        if($(".today-check").is(":checked")){

            /* 오늘 날짜 저장 */
            localStorage.setItem("popupCloseDay", today);

        }

        /* 팝업 닫기 */
        $(".popup-overlay").hide();

    });

});
