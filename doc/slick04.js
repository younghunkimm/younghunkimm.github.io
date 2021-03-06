$(function(){
//-------------------------------------------------------------------
$('.main_slider').on('init reInit afterChange', function(e,s,c){
    console.log(c,s.slideCount);
    var i= (c ? c : 0);
    $('.snum').text(i+1 + " / " + s.slideCount);
});

var mS=$('.main_slider').slick({
    autoplay:true,
    fade:true,
    arrows:false,
    pauseOnHover:false,
});

$('.main_slider figure').eq(0).addClass('animation_active');
$('#main_visual .btn li').eq(0).addClass('animation_active');
$('#main_visual .sbar').addClass('animation_active');
$('#main_visual .sbar2 span').animate({height:100}, 1000);
mS.on('beforeChange', function(e,s,c,n){
    $('#main_visual .sbar').removeClass('animation_active');
});

mS.on('afterChange', function(e,s,c){
    $('.main_slider figure').eq(c).addClass('animation_active').siblings().removeClass('animation_active');
    $('#main_visual .btn li').eq(c).addClass('animation_active').siblings().removeClass('animation_active');
    $('#main_visual .sbar').addClass('animation_active');

    var sbar= $('#main_visual .sbar2 span')
    if (c < 1) {
        sbar.removeAttr('style');
        sbar.animate({height:100*(c+1)}, 1000);
    } else {
        sbar.animate({height:100*(c+1)}, 1000);
    };
});

$('#main_visual .btn li').on('click', function(){
    var idx=$(this).index();
    mS.slick('slickGoTo', idx);
});




//-------------------------------------------------------------------
})