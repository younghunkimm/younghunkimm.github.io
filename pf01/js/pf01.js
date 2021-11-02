$(function () {
    //----------------------------------------------------------------------
    $(window).on('scroll', function () {
        var sct = $(window).scrollTop();

        if (sct > 900) {
            $('#header').addClass('on')
        } else {
            $('#header').removeClass('on')
        }
    })


    $('.main_slider').on('afterChange', function (e, s, c) {
        // console.log(c)
        if (c > 1) {
            $('#header').addClass('om')
        } else {
            $('#header').removeClass('om')
        }
    });


    $('.main_slider').slick({
        arrows: false,
        autoplay: true,
        pauseOnHover: false,
    });

    $('.main_slider figure').eq(1).addClass('on')
    $('.main_slider').on('afterChange', function (e, s, c) {
        // console.log(c);
        $('.main_slider figure').eq(c + 1).addClass('on').siblings().removeClass('on');
        $('#main_visual .slide_bar li').eq(c).addClass('on').siblings().removeClass('on');
    });

    $('#main_visual .slide_bar li').eq(0).addClass('on')
    $('#main_visual .slide_bar li').on('click', function () {
        var idx = $(this).index();
        // console.log(idx);
        $('.main_slider').slick('slickGoTo', idx);
        $(this).addClass('on').siblings().removeClass('on');
    });

    $('.pr_slider').slick({
        infinite: true,
        slidesToShow: 3,
        arrows: false,
        autoplay: true,
        centerMode: true,
        dots: true,
    });

    $('.pr_slider').on('afterChange', function (e, s, c) {
        // console.log(c);

        $('#content01 figure').eq(c + 4).addClass('on').siblings().removeClass('on')
    });


    $('.pr_slider').slick('slickGoTo', 5);

    $('.xi-angle-left-thin').on('click', function () {
        $('.pr_slider').slick('slickPrev')
    });
    $('.xi-angle-right-thin').on('click', function () {
        $('.pr_slider').slick('slickNext')
    });

    $(window).on('scroll', function () {
        var sct = $(window).scrollTop();
        // console.log(sct)

        if (sct > 1540) {
            $('#content02 h2').addClass('on')
        } else {
            $('#content02 h2').removeClass('on')
        };

        if (sct > 1540) {
            $('#content02 p').addClass('on')
        } else {
            $('#content02 p').removeClass('on')
        };
    });

    $(window).on('scroll', function () {
        var sct = $(window).scrollTop();

        if (sct > 1750) {
            $('#content03 h2').addClass('on')
        } else {
            $('#content03 h2').removeClass('on')
        }
    });

    $(window).on('scroll', function () {
        var sct = $(window).scrollTop();

        if (sct > 2200) {
            $('#content03 figure').addClass('on')
        } else {
            $('#content03 figure').removeClass('on')
        }
    });

    $(window).on('scroll', function () {
        var sct = $(window).scrollTop();

        if (sct > 2200) {
            $('#content03 .text_con').addClass('on')
        } else {
            $('#content03 .text_con').removeClass('on')
        }
    });

    $(window).on('scroll', function () {
        var sct = $(window).scrollTop();

        if (sct > 2430) {
            $('#content04 h2').addClass('on')
        } else {
            $('#content04 h2').removeClass('on')
        }
    });

    $(window).on('scroll', function () {
        var sct = $(window).scrollTop();

        if (sct > 2500) {
            $('#content04 .con').addClass('on')
        } else {
            $('#content04 .con').removeClass('on')
        }
    });

    $('#footer .top_f .family').on('click', function () {
        $('#footer .top_f .family').toggleClass('on')
    });

    $(window).on('scroll', function () {
        var sct = $(window).scrollTop();

        if (sct > 2400) {
            $('#toTop').fadeIn()
        } else {
            $('#toTop').fadeOut()
        }
    });

    $('#toTop').on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });
    //----------------------------------------------------------------------
});