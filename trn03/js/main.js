const HD = document.querySelector('#hd');
window.addEventListener('scroll', ()=>{
    let sct = window.scrollY;
    sct > 0 ? HD.classList.add('on') : HD.classList.remove('on')
});

const slideBar = document.querySelector('.slide_bottom .bar');
const mainSlider = new Swiper('.main_slider', {
    loop:true,
    slidesPerView: 2,
    spaceBetween: 150,
    autoplay: {
        delay:2000,
    },
    pagination: {
        el: '.main_visual .page',
        type: "fraction",
    },
    navigation: {
        nextEl: '.main_visual .btn_next',
        prevEl: '.main_visual .btn_prev',
    },
    autopalyDisableOnInteraction:false,
});

slideBar.classList.add('on');
mainSlider.on('slideChangeTransitionEnd', ()=> {
    slideBar.classList.add('on');
});
mainSlider.on('slideChangeTransitionStart', ()=> {
    slideBar.classList.remove('on');
});

const productSlider = new Swiper('.pr_slider', {
    loop:false,
    slidesPerView: 4,
    spaceBetween: 30,
    pagination: {
        el: '.pr_btn .pr_dots',
    },
    navigation: {
        nextEl: '.pr_btn .btn_next',
        prevEl: '.pr_btn .btn_prev',
    },
});

//scroll event
const SEC = document.querySelectorAll('.action');
const WT=window.innerHeight;

window.addEventListener("scroll", ()=>{
        let sct=window.scrollY;
        SEC.forEach(e=>{
            let secTop = e.offsetTop;
            let secH=e.clientHeight;
            if (sct > secTop - (WT-secH) / 2 - 200) {
                e.classList.add('on');
            };
            // sct > secTop - (WT-secH) / 2 - 200 ? e.classList.add('on') : e.classList.remove('on');
        });
});







