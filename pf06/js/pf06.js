$(function(){
// ---------------------------------------
var HD = $('#header')
var depth02 = $('.depth02')
HD.on('mouseenter', function(){
    var sct = $(window).scrollTop();
    if (sct == 0) {
        if ($(window).width() >= 768) {
            $('.logo-w').hide();
            $('.logo-c').show();
        };
    };
    if ($(window).width() >= 768) {
        HD.addClass('active');
    };
});
HD.on('mouseleave', function(){
    var sct = $(window).scrollTop();
    if (sct == 0) {
        if ($(window).width() >= 768) {
            $('.logo-w').show();
            $('.logo-c').hide();
        };
    };
    if ($(window).width() >= 768) {
    HD.removeClass('active');
    };
});

const mainSlider = $('.main_slider').slick({
    autoplay:true,
    autoplaySpeed:4000,
    pauseOnHover:false,
    pauseOnFocus:false,
    prevArrow:'<div class="main_prev"></div>',
    nextArrow:'<div class="main_next"></div>',
})

$('.main_slider figure').eq(1).addClass('on')
mainSlider.on('afterChange', function(e,s,c){
    $('.main_slider figure').eq(c+1).addClass('on').siblings().removeClass('on');
});

$('.slider01').slick({
    fade:true,
    speed:1000,
    autoplay:true,
    dots:true,
    pauseOnHover:false,
    pauseOnFocus:false,
    prevArrow:'<div class="center_prev"></div>',
    nextArrow:'<div class="center_next"></div>',
});

$('.slider02').slick({
    fade:true,
    speed:1000,
    autoplay:true,
    dots:true,
    arrows:false,
    pauseOnHover:false,
    pauseOnFocus:false,
});

$('.tab_menu>li').eq(0).addClass('on')
$('.info03 .content_box>div').eq(0).addClass('on')
$('.tab_menu>li').on('click', function(){
    var me = $(this);
    var idx = me.index();
    $('.info03 .content_box>div').eq(idx).addClass('on').siblings().removeClass('on');
    me.addClass('on').siblings().removeClass('on');
});

$('.family_site span').on('click', function(){
    $('.family_site ul').stop().slideToggle();
});

var QM = $('.quick_menu');
$(window).on('scroll', function(){
    var sct = $(window).scrollTop();
    if (sct > 0) {
        HD.addClass('on');
        $('.logo-w').hide();
        $('.logo-c').show();
        if ($(window).width() >= 768) {
            $('.hd_top').hide();
        };
        $('.mopen').addClass('on');
    } else {
        HD.removeClass('on');
        $('.logo-w').show();
        $('.logo-c').hide();
        if ($(window).width() >= 768) {
            $('.hd_top').show();
        };
        $('.mopen').removeClass('on');
    };

    if (HD.hasClass('active')) {
        $('.logo-c').show();
        $('.logo-w').hide();
    };

    if (sct == 0) {
        QM.removeClass('on');
    } else if (sct < 1950) {
        QM.addClass('on');
    } else {
        QM.removeClass('on');
    }
});

$('.mopen').on('click', function(){
    $('.gnb').toggleClass('on');
    $('.hd_top').toggleClass('on');
    $(this).toggleClass('active');
    $('.login').toggleClass('on');
    $('html, body').toggleClass('no_scroll');
});

$('.depth01>li>a').on('click', function(){
    $(this).next().stop().slideToggle();
    $(this).parent().siblings().find('.depth02').stop().slideUp();
});

$('.depth02 dt').on('click', function(){
    $(this).parent().find('dd').slideToggle();
    $(this).parent().siblings().find('dd').stop().slideUp();
    $(this).parent().parent().siblings().find('dd').stop().slideUp();
});

$(window).on('resize', function(){
    $('.depth02').removeAttr('style');
});

if ($(window).width() <= 768) {
    $('.br_none').css('display', 'none');
} else {
    $('.br_none').css('display', 'block');
}

// ---------------------------------------
});