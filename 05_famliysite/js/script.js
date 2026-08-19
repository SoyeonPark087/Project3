$(function () {

    $(".family-btn").click(function () {

        // 패밀리사이트 리스트 열고 닫기
        $(".family-list")
            .stop(true, true)
            .slideToggle(300);


        // 화살표 방향 변경
        $(".family").toggleClass("active");

    });

});