/* =========================================================
   페이지 로딩 완료 후 실행
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       HEADER - 2단 메뉴
    ====================================================== */

    const header = document.querySelector("#header");
    const gnbItems = document.querySelectorAll(".gnb__item");


    /*
        header가 실제 HTML에 있을 때만
        메뉴 이벤트를 실행합니다.

        이렇게 해야 헤더 관련 오류 때문에
        아래 Swiper 코드가 멈추는 것을 방지할 수 있습니다.
    */
    if (header && gnbItems.length > 0) {


        /* 메뉴 열기 */
        function openMenu() {

            header.classList.add("is-open");

        }


        /* 메뉴 닫기 */
        function closeMenu() {

            header.classList.remove("is-open");


            /* 모든 active 제거 */
            gnbItems.forEach(function (item) {

                item.classList.remove("is-active");

            });

        }


        /* 각 주메뉴에 마우스 올렸을 때 */
        gnbItems.forEach(function (item) {

            item.addEventListener("mouseenter", function () {


                /* 2단 메뉴 열기 */
                openMenu();


                /* 기존 active 삭제 */
                gnbItems.forEach(function (menu) {

                    menu.classList.remove("is-active");

                });


                /* 현재 메뉴에 active */
                item.classList.add("is-active");

            });

        });


        /* 헤더 전체를 벗어나면 닫기 */
        header.addEventListener("mouseleave", function () {

            closeMenu();

        });

    }



    /* =====================================================
       MAIN SWIPER
    ====================================================== */

    const swiperElement = document.querySelector(".mainSwiper");


    /*
        Swiper 요소와 Swiper 라이브러리가
        정상적으로 존재하는 경우에만 실행
    */
    if (swiperElement && typeof Swiper !== "undefined") {


        const mainSwiper = new Swiper(".mainSwiper", {


            /* ---------------------------------------------
               한 화면에 슬라이드 1개
            --------------------------------------------- */
            slidesPerView: 1,


            /* 한 번에 한 장씩 이동 */
            slidesPerGroup: 1,


            /* 슬라이드 사이 간격 없음 */
            spaceBetween: 0,


            /* ---------------------------------------------
               마지막 → 첫 번째 반복
            --------------------------------------------- */
            loop: true,


            /* ---------------------------------------------
               이동 애니메이션 속도

               700 = 0.7초
            --------------------------------------------- */
            speed: 700,


            /* ---------------------------------------------
               자동재생
            --------------------------------------------- */
            autoplay: {

                /*
                    3초마다 자동 이동
                */
                delay: 3000,


                /*
                    사용자가 화살표를 누르거나
                    드래그한 다음에도 자동재생 계속
                */
                disableOnInteraction: false,


                /*
                    마우스를 배너에 올려도 멈추지 않음
                */
                pauseOnMouseEnter: false,


                /*
                    마지막에서 멈추지 않음
                */
                stopOnLastSlide: false,


                /*
                    슬라이드 이동이 끝난 후
                    다음 autoplay 시간을 계산
                */
                waitForTransition: true

            },


            /* ---------------------------------------------
               좌우 버튼
            --------------------------------------------- */
            navigation: {

                nextEl: ".main-next",

                prevEl: ".main-prev"

            },


            /* ---------------------------------------------
               1 / 3 페이지 표시
            --------------------------------------------- */
            pagination: {

                el: ".main-pagination",

                type: "fraction",


                /* 페이지 표시 형태 */
                renderFraction: function (
                    currentClass,
                    totalClass
                ) {

                    return (
                        '<span class="' +
                        currentClass +
                        '"></span>' +

                        '<span class="page-slash"> / </span>' +

                        '<span class="' +
                        totalClass +
                        '"></span>'
                    );

                }

            },


            /* ---------------------------------------------
               마우스 드래그 가능
            --------------------------------------------- */
            allowTouchMove: true,

            simulateTouch: true,


            /* ---------------------------------------------
               부모 영역이나 크기 변경 감지

               CSS 때문에 Swiper 크기 계산이 잘못되는
               상황을 방지하는 데 도움이 됩니다.
            --------------------------------------------- */
            observer: true,

            observeParents: true,


            /*
                슬라이드 수 때문에 자동으로
                Swiper가 비활성화되는 것을 방지
            */
            watchOverflow: false,


            /* Swiper 초기화 확인용 */
            on: {

                init: function () {

                    console.log("Swiper 시작됨");

                },


                slideChange: function () {

                    console.log(
                        "현재 슬라이드:",
                        this.realIndex + 1
                    );

                }

            }

        });


        /* =================================================
           브라우저 탭을 나갔다가 돌아와도
           autoplay 다시 실행
        ================================================= */

        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    !document.hidden &&
                    mainSwiper.autoplay
                ) {

                    mainSwiper.autoplay.start();

                }

            }
        );

    }


    /* =====================================================
       Swiper 라이브러리를 불러오지 못한 경우
    ====================================================== */

    else {

        console.error(
            "Swiper를 실행할 수 없습니다. CDN 또는 .mainSwiper 요소를 확인하세요."
        );

    }

});