$(function () {

    /* ==============================
       fade 관련
    ============================== */

    // fadeIn
    $("#fadeInBtn").click(function () {

        $(".fade-box")
            .stop(true, true)
            .fadeIn(1000);

    });


    // fadeOut
    $("#fadeOutBtn").click(function () {

        $(".fade-box")
            .stop(true, true)
            .fadeOut(1000);

    });


    // fadeToggle
    $("#fadeToggleBtn").click(function () {

        $(".fade-toggle-box")
            .stop(true, true)
            .fadeToggle(1000);

    });



    /* ==============================
       slide 관련
    ============================== */

    // slideUp
    $("#slideUpBtn").click(function () {

        $(".slide-box")
            .stop(true, true)
            .slideUp(1000);

    });


    // slideDown
    $("#slideDownBtn").click(function () {

        $(".slide-box")
            .stop(true, true)
            .slideDown(1000);

    });


    // slideToggle
    $("#slideToggleBtn").click(function () {

        $(".slide-toggle-box")
            .stop(true, true)
            .slideToggle(1000);

    });



    /* ==============================
       animate 관련
    ============================== */

    // ani1 : 확대
    $("#ani1Btn").click(function () {

        $(".animate-box")
            .stop()
            .animate({
                width: "300px",
                height: "300px"
            }, 1000);

    });


    // ani2 : 원래 크기로 복귀
    $("#ani2Btn").click(function () {

        $(".animate-box")
            .stop()
            .animate({
                width: "200px",
                height: "200px"
            }, 1000);

    });

});