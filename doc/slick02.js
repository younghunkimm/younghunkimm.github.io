$(function(){
//-------------------------------------------------------------------

//메인슬라이드
$('.main_slider').slick({
    arrows:false,
    autoplay:true,
    pauseOnHover:false,
});



//제품슬라이드
$('.pr_slider').slick({
    arrows:false,
    dots:true,
    slidesToShow: 5,
    autoplay:true,
    autoplaySpeed:3000,
});

$('.btn i.xi-angle-left-thin').on('click', function(){
    $('.pr_slider').slick('slickPrev')
})
$('.btn i.xi-angle-right-thin').on('click', function(){
    $('.pr_slider').slick('slickNext')
})
//-------------------------------------------------------------------
})