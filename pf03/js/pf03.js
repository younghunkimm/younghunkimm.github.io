$(function(){
// -----------------------------------

$('#main_player').YTPlayer({
    videoURL:'https://www.youtube.com/watch?v=wq0iC472QeQ',
    containment:'#main_visual',
    autoPlay:true,
    mute:true,
    startAt:8,
    opacity:1,
    showControls:false,
    pauseOnFocus:false,
    pauesOnHover:false,
});

$('.pr_slider').slick({
    slidesToShow:1,
    arrows:false,
    fade:true,
    asNavFor:'.txt_slider',
});

$('.txt_slider').slick({
    slidesToShow:1,
    arrows:false,
    fade:true,
    asNavFor:'.pr_slider',
});

$('.pr_slider').on('afterChange', function(e,s,c){
    $('.category>ul>li').eq(c).addClass('on').siblings().removeClass('on');
});

$('.category>ul>li').eq(0).addClass('on');
$('.category>ul>li').on('click', function(){
    var idx= $(this).index();
    // console.log(idx);
    $('.pr_slider').slick('slickGoTo', idx);
    $('.txt_slider').slick('slickGoTo', idx);
    $(this).toggleClass('on').siblings().removeClass('on');
});

$('.mv01').YTPlayer({
    videoURL:'https://www.youtube.com/watch?v=xbzdHIYyJ4Y',
    containment:'.main_case',
    autoPlay:true,
    mute:true,
    startAt:0,
    opacity:1,
    showControls:false,
    playOnlyIfVisible:true,
    optimizeDisplay:false,
    pauseOnFocus:true,
    loop:true,
})

$('.insta_slider').slick({
    autoplay:false,
    autoplaySpeed:2000,
    centerMode:true,
    slidesToShow:8,
    arrows:false,
    swipeToSlide:true,
    responsive: [
        {
            breakpoint:768,
            settings: {
                slidesToShow:2,
            }
        }
    ]
});

$('.notice_slider').slick({
    autoplay:true,
    arrows:false,
    vertical:true,
});

$('.up_case').on('click', function(){
    $('.notice_slider').slick('slickPrev')
});
$('.down_case').on('click', function(){
    $('.notice_slider').slick('slickNext')
});

$('.mopen').on('click', function(){
    $('.gnb').toggleClass('on');
    $('.h_right').toggleClass('on');
    $(this).toggleClass('on');
});

$('.depth01>li>a').on('click', function(){
    if ($(window).width() < 768) {
        $(this).next().stop().slideToggle();
        $(this).parent().siblings().find('.depth02').slideUp();
    };
});

$(window).on('resize', function(){
    $('.depth02').removeAttr('style');
});

$('#popup .con .close_con span').on('click', function(){
    $('#popup').hide();
});

$('#scroll_banner .itm01').on('click', function(){
    $('html, body').stop().animate({scrollTop:0}, 500);
});

$(window).on('scroll', function(){
    var sct=$(window).scrollTop();

    $('#scroll_banner').css({bottom:100 - sct})
});

// -----------------------------------
});