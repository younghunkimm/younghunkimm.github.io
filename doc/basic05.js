$(function(){
// ---------------------------------------------------------------------------
$('#top_banner i').on('click', function(){
    // $('#top_banner').hide()
    $('#top_banner').slideUp()
});

$('.main_slider').slick({
    arrows:false,
    autoplay:true,
    autoplaySpeed:2000,
    pauseOnHover:false,
    pauseOnFocus:false,
});


// ---------------------------------------------------------------------------
});