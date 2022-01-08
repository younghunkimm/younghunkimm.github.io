$(function(){
// --------------------------------------------------

$('.depth01>li>a').on('mouseenter', function(){
    $(this).next().addClass('on');
    $('.menu_bg').addClass('on');
    $(this).parent().addClass('on');
})
$('.depth01>li').on('mouseleave', function(){
    $(this).find('.sub_menu').removeClass('on');
    $('.menu_bg').removeClass('on');
    $(this).removeClass('on');
})

$('.menu_close i').on('click', function(){
    $('.sub_menu').removeClass('on');
});


$('.main_slider').slick({
    autoplay:true,
    autoplaySpeed:4000,
    fade:true,
    arrows:false,
    dots:true,
    pauseOnHover:false,
    pauseOnFocus:false,
});

$('.main_slider figure').eq(0).addClass('on')
$('.main_slider').on('afterChange', function(e,s,c){
    $('.main_slider figure').eq(c).addClass('on').siblings().removeClass('on');
});

$('.focus_slider').slick({
    autoplay:true,
    arrows:false,
    pauseOnFocus:false,
    vertical:true,
    verticalSwiping:true,
    slidesToShow:2,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                pauseOnHover:false,
                vertical:false,
                verticalSwiping:false,
                slidesToShow:1,
            }
        }
    ]
});

$('#focus .slide_dots .prev').on('click', function(){
    $('.focus_slider').slick('slickPrev');
});
$('#focus .slide_dots .next').on('click', function(){
    $('.focus_slider').slick('slickNext');
});

$('#focus .dots li').eq(0).addClass('on')
$('.focus_slider').on('afterChange', function(e,s,c){
    $('#focus .dots li').eq(c).addClass('on').siblings().removeClass('on');
});

$('.news_wrapper').masonry({
    itemSelector:'.itms',
    gutter:22,
    horizontalOrder:true,
    percentPosition:true,
});

$('.tab_menu').eq(0).find('h4').addClass('on');
$('.tab_menu').eq(0).find('ul').css({'display':'block'})
$('.tab_menu h4').on('click', function(){
    $(this).addClass('on');
    $(this).parent().siblings().find('h4').removeClass('on');
    $(this).next().stop().slideDown();
    $(this).parent().siblings().find('ul').stop().slideUp();
});

$(window).on('load', function(){
    let aTop = $('#announcements').offset().top - 550;
    let nTop1 = $('#news').offset().top - 550;
    let nTop2 = $('#news').offset().top - 250;
    let nTop3 = $('#news').offset().top + 50;
    let nTop4 = $('#news').offset().top + 450;
    let mTop = $('#multimedia').offset().top - 550;

    $(window).on('scroll', function(){
        sct = $(this).scrollTop();
    
        sct > aTop ? $('#announcements').addClass('on') : $('#announcements').removeClass('on');
        sct > nTop1 ? $('#news').addClass('row01') : $('#news').removeClass('row01');
        sct > nTop2 ? $('#news').addClass('row02') : $('#news').removeClass('row02');
        sct > nTop3 ? $('#news').addClass('row03') : $('#news').removeClass('row03');
        sct > nTop4 ? $('#news').addClass('row04') : $('#news').removeClass('row04');
        sct > mTop ? $('#multimedia').addClass('on') : $('#multimedia').removeClass('on');
    });
});

$('#footer .site>a').on('click', function(){
    $(this).toggleClass('on');
    $('#footer .site>ul').stop().slideUp();
    $(this).parent().siblings().find('a').removeClass('on');
    $(this).next().stop().slideToggle();

    return false;
});

$('.menu_open').on('click', function(){
    $(this).toggleClass('on');
});


// --------------------------------------------------
});