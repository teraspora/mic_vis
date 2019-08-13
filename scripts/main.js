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
canvas.addEventListener('click', clickHandler);
    
document.addEventListener('click', function() {
    context.resume().then(() => {
        console.log('Playback resumed successfully');
    });
});

// MIC INPUT CODE
const constraints = {audio: true};
navigator.getUserMedia(constraints, processStream, err => console.log(`Error: ${err.name} - ${err.message}`));

// ----------------------------------------------------------------------------------------------------------

let frame = 0;
let mic, dist;

// window.addEventListener("load", initPlayer, false);

function processStream(stream) {
    console.log(stream);
    context = new AudioContext();
    mic = context.createMediaStreamSource(stream);
    analyser = context.createAnalyser();
    mic.connect(analyser);
    // mic.connect(context.destination);
    dist = context.createWaveShaper();
    mic.connect(dist);
    dist.connect(context.destination);
    dist.curve = makeDistortionCurve(-2.4);
    paintGraph();    
}

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
        let y = v  / 128 * HALF_HEIGHT - 184;
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

// from https://codepen.io/gregh/pen/OWrjOb:
// http://stackoverflow.com/a/22313408/1090298
function makeDistortionCurve( amount ) {
    let n_samples = 256, curve = new Float32Array(n_samples);
    for (let i = 0 ; i < n_samples; ++i ) {
        let x = i * 2 / n_samples - 1;
        curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
} 
//   let k = typeof amount === 'number' ? amount : 0,
//     n_samples = 44100,
//     curve = new Float32Array(n_samples),
//     deg = Math.PI / 180,
//     i = 0,
//     x;
//   for ( ; i < n_samples; ++i ) {
//     x = i * 2 / n_samples - 1;
//     curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
//   }
//   return curve;
// }

function getMousePos(c, e) {       // got from https://codepen.io/chrisjaime/pen/lcEpn; takes a canvas and an event (mouse-click)
    const bounds = c.getBoundingClientRect();
    return {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top
    };
}

function clickHandler(ev) {
    const p = getMousePos(canvas, ev).x * 200 / WIDTH - 100;
    dist.curve = makeDistortionCurve(p)
    console.log(p);
}

// function rgb2Hex(rgbColour) {
//     let rgb = rgbColour.slice(4,-1).split(`,`);
//     return `#`
//       + (`0` + Number(rgb[0]).toString(16)).slice(-2)
//       + (`0` + Number(rgb[1]).toString(16)).slice(-2)
//       + (`0` + Number(rgb[2]).toString(16)).slice(-2);
// }
