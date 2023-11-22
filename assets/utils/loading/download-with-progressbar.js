// 파일을 다운로드 할 때 로딩이미지를 만든다.
async function downloadWithLoading(targetURL, fileName) {
    const progressBar = {
        canvas: document.createElement('canvas'),
        diameter: 120,
    }
    progressBar.canvas.setAttribute('width', progressBar.diameter);
    progressBar.canvas.setAttribute('height', progressBar.diameter);

    const loading = document.createElement('div');
    loading.append(progressBar.canvas);
    loading.id = 'loading';
    loading.style.display = 'none';
    document.body.append(loading);

    const fadeInTime = 400;
    const fadeOutTime = 200;

    fadeInAction(loading, fadeInTime);

    const response = await fetch(targetURL);
    
    if (!response?.body || !response.ok) {
        setTimeout(() => {
            alert('에러가 발생하였습니다.');
            fadeOutAction(loading, fadeOutTime, function() {
                loading.remove();
            });
        }, fadeInTime);
        return;
    }

    if (fileName === undefined) {
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
            const [fileNameMatch] = contentDisposition.split(';').filter(str => str.includes('filename'));
            if (fileNameMatch) {
                fileName = fileNameMatch.split('=')[1];
            }
        }
    }

    const contentLength = response.headers.get('Content-Length');
    const totalLength = typeof contentLength === 'string' && parseInt(contentLength);

    const reader = response.body.getReader();
    const chunks = [];

    let receivedLength = 0;
    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);

        receivedLength = receivedLength + value.length;

        if (typeof totalLength === 'number') {
            const step = parseFloat((receivedLength / totalLength).toFixed(2)) * 100;

            showPer(progressBar, step.toFixed(0));

            if (step === 100) {
                fadeOutAction(loading, fadeOutTime, function() {
                    loading.remove();
                });
            }
        }
    }

    const blob = new Blob(chunks);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    function handleOnDownload() {
        setTimeout(() => {
            URL.revokeObjectURL(url);
            a.removeEventListener('click', handleOnDownload);
        }, 150);
    }

    a.addEventListener('click', handleOnDownload, false);

    a.click();
}


function showPer(progressBar, per) {
    // https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes

    if (progressBar.canvas.getContext) {
        const ctx = progressBar.canvas.getContext('2d');

        ctx.clearRect(0, 0, 120, 120);
    
        // 바깥쪽 써클 그리기
        ctx.strokeStyle = "skyblue";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(progressBar.diameter / 2, progressBar.diameter / 2, (progressBar.diameter - ctx.lineWidth) / 2, 0, (Math.PI * 2 * per) / 100);
        ctx.stroke();
    
        // 숫자 올리기
        ctx.font = '24px Noto Sans KR';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(per + '%', progressBar.diameter / 2, progressBar.diameter / 2);
    }
}

function fadeInAction(target, timer = 1000, callback) {
    if (target === null) return;

    let level = 0;
    target.style.display = '';
    const inTimer = setInterval(() => {
        level = level + (10 / timer);
        target.style.opacity = level;
        if (level >= 1) {
            clearInterval(inTimer);
            callback();
        }
    }, 10);
}

function fadeOutAction(target, timer = 1000, callback) {
    if (target === null) return;

    let level = 1;
    const outTimer = setInterval(() => {
        level = level - (10 / timer);
        target.style.opacity = level;
        if (level <= 0) {
            target.style.display = 'none';
            clearInterval(outTimer);
            callback();
        }
    }, 10);
}