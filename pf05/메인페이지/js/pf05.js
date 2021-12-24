$(function(){
// ---------------------------------------------

var fp= $('.fullpage');
fp.fullpage({
    anchors:['s01','s02','s03','s04'],
    css3:false,
    afterLoad: function(origin, destination, direction){
        var idx= destination.index;
        $('.section').eq(idx).addClass('on').siblings().removeClass('on');
        $('nav li').eq(idx).addClass('on').siblings().removeClass('on');
        if (idx > 0) {
            $('.header').addClass('on');
            $('.logo').hide();
            $('.logo_c').show();
        } else {
            $('.header').removeClass('on')
            $('.logo_c').hide();
            $('.logo').show();
        };
        if (idx == 1 || idx == 3 || idx == 4) {
            $('nav').addClass('cc')
        } else {
            $('nav').removeClass('cc')
        };
    },
});

$('.sns').on('click', function(){
    $('.header, .sns ul').toggleClass('active')
})

var pr01= $('.product_slider01').slick({
    arrows:false,
    asNavFor:'.product_slider02',
    fade:true,
    dots:true,
    autoplay:true,
    autoplaySpeed:2000,
    pauseOnFocus:false,
});

var pr02= $('.product_slider02').slick({
    arrows:false,
    asNavFor:'.product_slider01',
    fade:true,
});

$('.txt_slider figcaption').eq(0).addClass('on')
pr01.on('afterChange', function(e,s,c){
    $('.txt_slider figcaption').eq(c).addClass('on').siblings().removeClass('on');
});

$('.sc04_slider').slick({
    arrows:false,
    slidesToShow:2,
    infinite:false,
});




// ---------------------------------------------
});