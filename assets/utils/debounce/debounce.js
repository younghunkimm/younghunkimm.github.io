'use strict'

const txtArea = document.getElementById('txtArea');
txtArea.addEventListener('keyup', e => {
    progressChange(123, 'asd');
});


const progressChange = debounce((a, b) => {
    console.log('a', a);
    console.log('b', b);
});

console.log(progressChange);


// 팩토리 함수
function debounce(func, timeout = 300) {
    let timer;

    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, timeout);
    }
}