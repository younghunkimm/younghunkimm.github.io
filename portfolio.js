$(function(){
// --------------------------------------------

let sc = $('.section');
let sideBar = $('nav li')
$('#main').fullpage({
    anchors:['intro', 'portfolio_01', 'portfolio_02', 'portfolio_03', 'portfolio_04', 'portfolio_05', 'profile'],
    afterLoad: function(origin, destination, direction){
        let idx = destination.index;
        sc.eq(idx).addClass('on').siblings().removeClass('on');
        sideBar.eq(idx).addClass('on').siblings().removeClass('on');
    },
});

let typed01 = new Typed('.typed01', {
    strings: ['WEB Is My MONEY'],
    typeSpeed: 100,
    backSpeed: 100,
    fadeOut: true,
    cursorChar: 'ㅣ',
    loop: false,
});

$('.cover_btn').on('click', function(){
    $(this).toggleClass('on');
    $('#cover').fadeToggle();
});

let cloneMenu = $('nav>ul').clone();
$('#cover').append(cloneMenu);

$('#cover a').on('click', function(){
    $('#cover').fadeOut();
});

$('#cover').on('scroll wheel touchmove', function(){
    return false;
});









// --------------------------------------------
});