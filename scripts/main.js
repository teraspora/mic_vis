// Playing with Web Audio API to get sound data and represent it graphically
// Author: John Lynch
// August 2019

// Based on the docs at https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

let WIDTH, HEIGHT, HALF_HEIGHT;
let canvas, ctx, source, context, analyser, spectrum, bar_height, bar_x;

canvas = document.getElementById('canvas');
[WIDTH, HEIGHT] = [canvas.clientWidth, canvas.clientHeight];
HALF_HEIGHT = HEIGHT / 2;
ctx = canvas.getContext('2d');
    

document.addEventListener('click', function() {
    context.resume().then(() => {
        console.log('Playback resumed successfully');
    });
});

// MIC INPUT CODE
const constraints = {audio: true};
navigator.getUserMedia(constraints, processStream, err => console.log(`Error: ${err.name} - ${err.message}`));


// ----------------------------------------------------------------------------------------------------------
// let audio = new Audio();
// audio.src = 'track1.mp3';
// audio.controls = true;
// audio.loop = true;
// audio.autoplay = true;
let frame = 0;
let mic;
const bar_width = 4;
const bars = 256;


// window.addEventListener("load", initPlayer, false);
function processStream(stream) {
    console.log(stream);
    context = new AudioContext();
    mic = context.createMediaStreamSource(stream);
    analyser = context.createAnalyser();
    mic.connect(analyser);
    // mic.connect(context.destination);
    paintGraph();    
}

// function initPlayer(){
//     document.getElementById('audio_box').appendChild(audio);
//     // Re-route audio playback into the processing graph of the AudioContext
// }

function paintGraph(){
    requestAnimationFrame(paintGraph);
    let count = analyser.frequencyBinCount;
    spectrum = new Uint8Array(count);
    analyser.getByteTimeDomainData(spectrum);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const sliceWidth = WIDTH / count;
    let x = 0;
    frame++;
    for (let i = 0; i < count; i++, x += sliceWidth) {
        let v = spectrum[i];
        // if (frame % 255 == i) console.log(`v = ${v}`);
        let y = v  / 128.0 * HALF_HEIGHT - 184;
        ctx.strokeStyle = `rgb(255, 0, ${10 * v - 1152})`;
        ctx.lineWidth = `1`;
        if (i === 0) {
            ctx.moveTo(x, y);
        }
        else {
            ctx.lineTo(x, y);
        }
    }
    ctx.lineTo(WIDTH, HALF_HEIGHT);
    ctx.stroke();
}

// function rgb2Hex(rgbColour) {
//     let rgb = rgbColour.slice(4,-1).split(`,`);
//     return `#`
//       + (`0` + Number(rgb[0]).toString(16)).slice(-2)
//       + (`0` + Number(rgb[1]).toString(16)).slice(-2)
//       + (`0` + Number(rgb[2]).toString(16)).slice(-2);
// }
