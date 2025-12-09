<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Dynamic Star Life Cycle Lab — Temperature</title>
<style>
  body {margin:0; font-family:Arial, sans-serif; background:#0b0f1a; color:white;}
  h1{text-align:center; margin-top:5px; font-size:20px;}
  #container{display:flex; gap:20px; padding:20px;}
  #controlsColumn{display:flex; flex-direction:column; min-width:260px;}
  #canvasBox{background:black; border:2px solid #333; border-radius:10px; padding:10px; flex-grow:1; position:relative; min-height:480px;}
  canvas{background:black; display:block; width:100%; height:100%;}
  #infoBox{text-align:left; font-size:20px; min-height:40px; margin-bottom:5px; color:#fff;}
  .controls{text-align:left; margin-top:5p  x;}
  .controls label{color:#ddd; display:block; margin-bottom:6px; font-size:14px;}
  .controls input[type=range]{width:100%;}
  .readout{font-size:13px; color:#cfcfcf; margin-bottom:8px;}
  #dataBox{margin-top:20px; text-align:left; font-size:16px; color:#ccc;}
  select, .button {width:100%; padding:6px; border-radius:6px; border:1px solid #444; background:#0f1724; color:#fff;}
  .small{font-size:13px; color:#bbb;}
  table{width:100%; border-collapse:collapse; color:#fff; font-size:14px;}
  table td{padding:6px; border-bottom:1px solid #333;}
</style>
</head>
<body>
<h1> Dynamic Stellar Life Cycle Lab</h1>
<div id="container">
  <div id="controlsColumn">
    <h1 id="infoBox">Move sliders to automatically change star phase.</h1>

    <!-- ⭐ STATUS PANEL TABLE -->
    <div class="controls" id="statusPanel" style=" 
      padding:10px; 
      border:1px solid #444; 
      border-radius:8px;
      background:#111;
    ">
      <h2 style="font-size:18px; margin:0 0 10px 0;">Star Status</h2>
      <table>
        <tr><td>Mass</td><td id="statusMass">--</td></tr>
        <tr><td>Temperature</td><td id="statusTemp">-- K</td></tr>
        <tr><td>Stage</td><td id="statusStage">--</td></tr>
        <tr><td>Color</td><td id="statusColor">--</td></tr>
        <tr><td>Hydrogen</td><td id="statusH">--%</td></tr>
        <tr><td>Helium</td><td id="statusHe">--%</td></tr>
        <tr><td>Nitrogen</td><td id="statusN">--%</td></tr>
        <tr><td>Life Span</td><td id="statusLife">-- million years</td></tr>
      </table>
    </div>

    <!-- Mass -->
    <div id="controlsContainer" class="controls">
      <label>Mass:
        <input id="massSlider" type="range" min="1" max="50" value="10">
      </label>
      <div class="readout small"><span id="massValue">10 Solar Masses</span></div>
    </div>

    <!-- Composition -->
    <div id="elementControlsContainer" class="controls">
      <label>Hydrogen:
        <input id="hydrogenSlider" type="range" min="0" max="100" value="70">
      </label>
      <div class="readout small"><span id="hydrogenValue">70%</span></div>

      <label>Helium:
        <input id="heliumSlider" type="range" min="0" max="100" value="28">
      </label>
      <div class="readout small"><span id="heliumValue">28%</span></div>

      <label>Nitrogen:
        <input id="nitrogenSlider" type="range" min="0" max="100" value="2">
      </label>
      <div class="readout small"><span id="nitrogenValue">2%</span></div>
    </div>

    <!-- Temperature -->
    <div id="temperatureControls" class="controls" style="margin-top:10px;">
      <label>Temperature (Kelvin):
        <input id="tempSlider" type="range" min="2000" max="50000" step="100" value="5800">
      </label>
      <div class="readout small">
        <span id="tempValue">5800 K</span> — Color blends temperature (80%) + composition (20%).
      </div>
    </div>

    <div id="dataBox">Star Life Span Data</div>
  </div>

  <div id="canvasBox">
    <canvas id="spaceCanvas"></canvas>
  </div>
</div>

<script>
const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
const infoBox = document.getElementById('infoBox');
const dataBox = document.getElementById('dataBox');

function resizeCanvas(){
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let star = { 
  mass:10, hydrogen:70, helium:28, nitrogen:2, 
  temperature:5800, color:'rgb(255,220,120)', 
  size:90, stage:'Main Sequence' 
};

const lifeSpanData = {
  'Main Sequence': 10000,
  'Red Giant': 1000,
  'White Dwarf': 10000,
  'Red Supergiant': 100,
  'Supernova': 1,
  'Neutron Star': 10000,
  'Black Hole': 10000
};

// background stars
let backgroundStars=[];
for(let i=0;i<150;i++){
  backgroundStars.push({
    x:Math.random()*500,
    y:Math.random()*500,
    r:Math.random()*2+1,
    brightness:Math.random()*0.8+0.2,
    delta:(Math.random()*0.02+0.004)
  });
}
function drawBackground(){
  for(const s of backgroundStars){
    s.brightness += s.delta;
    if(s.brightness>1 || s.brightness<0.15) s.delta*=-1;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${s.brightness})`;
    ctx.arc(s.x*canvas.width/500, s.y*canvas.height/500, s.r, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawStarAt(x,y,size,color){
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.arc(x,y,size,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawStage(stage){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBackground();
  const cx = canvas.width/2;
  const cy = canvas.height/2;
  switch(stage){
    case 'Main Sequence':
      drawStarAt(cx,cy,star.size,star.color);
      infoBox.textContent='Main Sequence Star';
      break;
    case 'Red Giant':
      drawStarAt(cx,cy,star.size*1.4,'red');
      infoBox.textContent='Red Giant';
      break;
    case 'White Dwarf':
      drawStarAt(cx,cy,star.size*0.3,'white');
      infoBox.textContent='White Dwarf';
      break;
    case 'Red Supergiant':
      drawStarAt(cx,cy,star.size*1.8,'crimson');
      infoBox.textContent='Red Supergiant';
      break;
    case 'Supernova':
      for(let i=0;i<40;i++){
        ctx.fillStyle = `rgba(255,${Math.floor(Math.random()*255)},0,0.95)`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(i)*(i*4), cy + Math.sin(i)*(i*4), 6 + Math.random()*20, 0, Math.PI*2);
        ctx.fill();
      }
      infoBox.textContent='Supernova!';
      break;
    case 'Neutron Star':
      drawStarAt(cx,cy,star.size*0.15,'lightblue');
      infoBox.textContent='Neutron Star';
      break;
    case 'Black Hole':
      ctx.fillStyle='black';
      ctx.beginPath();
      ctx.arc(cx,cy,star.size*0.9,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle='purple';
      ctx.lineWidth=8;
      ctx.beginPath();
      ctx.arc(cx,cy,star.size*1.1,0,Math.PI*2);
      ctx.stroke();
      infoBox.textContent='Black Hole';
      break;
  }
}

// --- STATUS PANEL ---
function updateStatusPanel() {
  document.getElementById("statusMass").textContent = `${star.mass} Solar Masses`;
  document.getElementById("statusTemp").textContent = `${star.temperature} K`;
  document.getElementById("statusStage").textContent = star.stage;
  document.getElementById("statusColor").textContent = star.color;

  document.getElementById("statusH").textContent = `${star.hydrogen}%`;
  document.getElementById("statusHe").textContent = `${star.helium}%`;
  document.getElementById("statusN").textContent = `${star.nitrogen}%`;

  document.getElementById("statusLife").textContent =
    `${lifeSpanData[star.stage]} million years`;
}

// --- Temperature to RGB ---
function temperatureToRGB(tempK){
  let temp = Math.max(1000, Math.min(40000, tempK))/100;
  let red, green, blue;
  if (temp <= 66) red = 255;
  else { red = 329.698727446 * Math.pow(temp-60, -0.1332047592); red=Math.max(0, Math.min(255, red)); }
  if (temp <= 66) green = 99.4708025861*Math.log(temp)-161.1195681661;
  else { green = 288.1221695283*Math.pow(temp-60,-0.0755148492); green=Math.max(0, Math.min(255, green)); }
  if (temp >= 66) blue = 255;
  else if(temp <= 19) blue=0;
  else { blue=138.5177312231*Math.log(temp-10)-305.0447927307; blue=Math.max(0, Math.min(255, blue)); }
  return { r: Math.round(red), g: Math.round(green), b: Math.round(blue) };
}

function rgbToCss(rgb){ return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`; }

function blendRGB(a, b, wa=0.8, wb=0.2){ return { r:a.r*wa+b.r*wb, g:a.g*wa+b.g*wb, b:a.b*wa+b.b*wb }; }

function compositionTint(h, he, n){
  let tint={r:0,g:0,b:0};
  if(n>20){ let s=Math.min(1,(n-20)/50); tint.g+=80*s; tint.b+=255*s; }
  if(he>40){ let s=Math.min(1,(he-40)/60); tint.r+=255*s; tint.g+=255*s; tint.b+=255*s; }
  if(h>60){ let s=Math.min(1,(h-60)/40); tint.r+=255*s; tint.g+=200*s; }
  return tint;
}

function recalcStarProperties(){
  star.size = 40 + star.mass * 3;

  if(star.mass < 8){
    if(star.hydrogen > 50) star.stage = 'Main Sequence';
    else if(star.helium > 40) star.stage = 'Red Giant';
    else star.stage = 'White Dwarf';
  } else {
    if(star.hydrogen > 50) star.stage = 'Main Sequence';
    else if(star.helium > 35) star.stage = 'Red Supergiant';
    else if(star.nitrogen > 20 && star.mass > 20) star.stage = 'Black Hole';
    else if(star.nitrogen > 20) star.stage = 'Supernova';
    else star.stage = 'Neutron Star';
  }

  const tempRGB = temperatureToRGB(star.temperature);
  const tint = compositionTint(star.hydrogen, star.helium, star.nitrogen);
  const finalRGB = blendRGB(tempRGB, tint, 0.8, 0.2);
  star.color = rgbToCss(finalRGB);

  drawStage(star.stage);
  dataBox.textContent = `Approximate Life Span: ${lifeSpanData[star.stage]} million years`;

  updateStatusPanel();
}

// --- Controls ---
const massSlider = document.getElementById('massSlider');
const hydrogenSlider = document.getElementById('hydrogenSlider');
const heliumSlider = document.getElementById('heliumSlider');
const nitrogenSlider = document.getElementById('nitrogenSlider');
const tempSlider = document.getElementById('tempSlider');

const massValue = document.getElementById('massValue');
const hydrogenValue = document.getElementById('hydrogenValue');
const heliumValue = document.getElementById('heliumValue');
const nitrogenValue = document.getElementById('nitrogenValue');
const tempValue = document.getElementById('tempValue');

massSlider.addEventListener('input', ()=>{
  star.mass = Number(massSlider.value);
  massValue.textContent = star.mass + ' Solar Masses';
  recalcStarProperties();
});

function updateComposition(){
  star.hydrogen = Number(hydrogenSlider.value);
  star.helium = Number(heliumSlider.value);
  star.nitrogen = Number(nitrogenSlider.value);
  hydrogenValue.textContent = star.hydrogen + '%';
  heliumValue.textContent = star.helium + '%';
  nitrogenValue.textContent = star.nitrogen + '%';
  recalcStarProperties();
}
hydrogenSlider.addEventListener('input', updateComposition);
heliumSlider.addEventListener('input', updateComposition);
nitrogenSlider.addEventListener('input', updateComposition);

tempSlider.addEventListener('input', ()=>{
  star.temperature = Number(tempSlider.value);
  tempValue.textContent = star.temperature + ' K';
  recalcStarProperties();
});

// animation loop
function animate(){
  recalcStarProperties();
  requestAnimationFrame(animate);
}
animate();

recalcStarProperties();
</script>
</body>
</html>
