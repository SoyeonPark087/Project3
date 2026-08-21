/* =========================
   설화수 추천 Swiper
========================= */


const swiper = new Swiper(".productSwiper", {

    /*
        한 화면에 상품 3개 표시
    */
    slidesPerView: 3,


    /*
        상품 사이 간격
    */
    spaceBetween: 24,


    /*
        좌우버튼 클릭 시
        1개씩 이동
    */
    slidesPerGroup: 1,


    /*
        마지막에서 처음으로
        자연스럽게 계속 반복
    */
    loop: true,


    /* =========================
       자동재생
       3초마다 한 개씩 이동
    ========================== */

    autoplay: {

        /*
            3000 = 3초
        */
        delay: 3000,

        /*
            사용자가 슬라이드를 직접 조작해도
            자동재생을 완전히 멈추지 않음
        */
        disableOnInteraction: false
    },


    /* =========================
       이전 / 다음 버튼
    ========================== */

    navigation: {
        nextEl: ".custom-next",
        prevEl: ".custom-prev"
    },


    /* =========================
       Swiper 실행 이벤트
    ========================== */

    on: {

        /*
            Swiper 처음 실행될 때
            진행바 표시
        */
        init: function(){

            updateProgress(this);

        },


        /*
            슬라이드가 변경될 때마다
            진행바 변경
        */
        slideChange: function(){

            updateProgress(this);

        }

    }

});



/* =========================
   진행바 함수
========================= */

function updateProgress(swiper){

    /*
        진행바 요소 선택
    */
    const progressBar =
        document.querySelector(".progress-bar");


    /*
        실제 슬라이드는 총 6개

        화면에 3개씩 보이므로

        보여질 수 있는 위치는

        1 2 3
        2 3 4
        3 4 5
        4 5 6

        총 4단계
    */
    const totalStep = 4;


    /*
        loop 모드에서는 realIndex를 사용하면
        실제 상품 번호를 확인할 수 있음
    */
    let currentIndex = swiper.realIndex;


    /*
        4단계를 넘어가면
        다시 처음 단계로 계산
    */
    let currentStep = (currentIndex % totalStep) + 1;


    /*
        현재 위치에 따른 진행률 계산

        1단계 = 25%
        2단계 = 50%
        3단계 = 75%
        4단계 = 100%
    */
    let progress =
        (currentStep / totalStep) * 100;


    /*
        진행바 너비 변경
    */
    progressBar.style.width =
        progress + "%";

}



/* =========================
   재생 / 일시정지 버튼
========================= */

const playControl =
    document.querySelector(".play-control");


/*
    현재 자동재생 여부

    true = 자동재생 중
    false = 정지
*/
let isPlaying = true;



/* =========================
   재생 / 정지 버튼 클릭
========================= */

playControl.addEventListener("click", function(){


    /* 자동재생 중이라면 */
    if(isPlaying){

        /*
            Swiper 자동재생 정지
        */
        swiper.autoplay.stop();


        /*
            pause 클래스 제거
            play 클래스 추가
        */
        playControl.classList.remove("pause");
        playControl.classList.add("play");


        /*
            접근성용 설명 변경
        */
        playControl.setAttribute(
            "aria-label",
            "슬라이드 자동재생"
        );


        isPlaying = false;


    }else{


        /*
            자동재생 다시 시작
        */
        swiper.autoplay.start();


        /*
            play 클래스 제거
            pause 클래스 추가
        */
        playControl.classList.remove("play");
        playControl.classList.add("pause");


        /*
            접근성용 설명 변경
        */
        playControl.setAttribute(
            "aria-label",
            "슬라이드 일시정지"
        );


        isPlaying = true;

    }

});