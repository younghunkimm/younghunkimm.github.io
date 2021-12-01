$(function(){
// ---------------------------------------------------------------
var visual = $('.main_slider');
var logo = $('.logo_menu li')

visual.slick({
    arrows:false,
    fade:true,
    autoplay:true,
    speed:500,
    autoplaySpeed:4500,
    infinite:true,
    pauseOnFocus:false,
    pauseOnHover:false,
});

logo.eq(0).addClass('on')
visual.on('afterChange', function(e,s,c){
    // console.log(c);
    logo.eq(c).addClass('on').siblings().removeClass('on');
});

logo.on('click', function(){
    var idx= $(this).index();
    // console.log(idx);
    visual.slick('slickGoTo', idx)
});

$('.h_left').on('click', function(){
    $('.gnb').toggleClass('on');
    $('#header').toggleClass('on');
});

$('.depth02.tc').hide();
$('.depth01>li>a').on('click', function(){
    if ($(window).width() < 769) {
        $(this).next().stop().slideToggle();
        $(this).parent().siblings().find('.depth02').stop().slideUp();
    };
});

$(window).on('resize', function(){
    $('.depth02').removeAttr('style');
})

$(window).on('scroll', function(){
    var sct= $(this).scrollTop()
    // console.log(sct);
    if (sct > 0) {
        $('#header').addClass('active')
    } else {
        $('#header').removeClass('active')
    };
});

// sc01 ---------------------
$('.room_slider').on('init reInit afterChange', function(e,s,c){
    console.log(c,s.slideCount);
    var i = (c ? c : 0);
    $('#sc01 .snum').text("0" + (i+1) + " / " + "0" + s.slideCount);
});

$('.room_slider').slick({
    arrows:false,
    asNavFor:'.r_text_slider',
    draggable:true,
    responsive:[
        {
            breakpoint:768,
            settings: {
                slidesToShow:1,
                centerMode:true,
                centerPadding:'1rem',
            }
        }
    ]
});

$('.r_text_slider').slick({
    arrows:false,
    fade:true,
    asNavFor:'.room_slider',
    draggable:false,
});

$('#sc01 i.xi-angle-left-thin').on('click', function(){
    $('.room_slider').slick('slickPrev');
});
$('#sc01 i.xi-angle-right-thin').on('click', function(){
    $('.room_slider').slick('slickNext');
});

// sc02 ---------------------
$('.dining_slider').on('init reInit afterChange', function(e,s,c){
    console.log(c,s.slideCount);
    var i = (c ? c : 0);
    $('#sc02 .snum').text("0" + (i+1) + " / " + "0" + s.slideCount);
});

$('.dining_slider').slick({
    arrows:false,
    asNavFor:'.d_text_slider',
    draggable:true,
    responsive:[
        {
            breakpoint:768,
            settings: {
                slidesToShow:1,
                centerMode:true,
                centerPadding:'1rem',
            }
        }
    ]
});

$('.d_text_slider').slick({
    arrows:false,
    fade:true,
    asNavFor:'.dining_slider',
    draggable:false,
});

$('#sc02 i.xi-angle-left-thin').on('click', function(){
    $('.dining_slider').slick('slickPrev');
});
$('#sc02 i.xi-angle-right-thin').on('click', function(){
    $('.dining_slider').slick('slickNext');
});

// sc03 ---------------------
$('.event_slider').slick({
    arrows:false,
    slidesToShow:3,
    swipeToSlide:true,
    responsive:[
        {
            breakpoint:768,
            settings: {
                slidesToShow:1,
                centerMode:true,
                centerPadding:'1rem',
            }
        }
    ]
});

$('#sc03 i.xi-angle-left-thin').on('click', function(){
    $('.event_slider').slick('slickPrev');
});
$('#sc03 i.xi-angle-right-thin').on('click', function(){
    $('.event_slider').slick('slickNext');
});









// ---------------------------------------------------------------
})