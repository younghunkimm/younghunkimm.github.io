$(function(){
// -------------------------------------------------
$(window).on('scroll', ()=>{
    let sct=$(window).scrollTop();
    sct > 0 ? $('#header').addClass('on') : $('#header').removeClass('on');
});

$('.main_slider').slick({
    arrows:false,
    autoplay:true,
    autoplaySpeed:4000,
    fade:true,
    speed:1500,
    pauseOnHover:false,
    pauseOnFocus:false,
    dots:true,
});

$('.main_slider figure').eq(0).addClass('on');
$('.main_slider').on('afterChange', function(e,s,c){
    $('.main_slider figure').eq(c).addClass('on').siblings().removeClass('on');
});

$('.pr_slider figure').eq(4).addClass('on');
$('.pr_slider').on('afterChange', function(e,s,c){
    $('.pr_slider figure').eq(c+4).addClass('on').siblings().removeClass('on');
});

$('.pr_slider').slick({
    arrows:false,
    autoplay:true,
    autoplaySpeed:3000,
    centerMode:true,
    centerPadding:'5rem',
    slidesToShow:3,
    pauseOnHover:false,
    pauseOnFocus:false,
    dots:false,
});























// -------------------------------------------------
});