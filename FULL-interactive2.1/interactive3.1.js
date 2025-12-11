const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
const infoBox = document.getElementById('infoBox');
const dataBox = document.getElementById('dataBox');

function resizeCanvas(){
  const parent = canvas.parentElement;
  const size = Math.min(parent.clientWidth, parent.clientHeight);
  canvas.width = size;
  canvas.height = size;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Page navigation: show lab page or lesson page
const lessonPage = document.getElementById('lessonPage');
const labPage = document.getElementById('labPage');
const goToLabBtn = document.getElementById('goToLab');
const backToLessonBtn = document.getElementById('backToLesson');

function showPage(showEl, hideEl){
  if(!showEl || !hideEl) return;
  hideEl.classList.remove('visible');
  hideEl.classList.add('hidden');
  showEl.classList.remove('hidden');
  showEl.classList.add('visible');
  // canvas may need resizing after becoming visible
  setTimeout(resizeCanvas, 50);
}

if(goToLabBtn){
  goToLabBtn.addEventListener('click', ()=>{
    showPage(labPage, lessonPage);
  });
}

if(backToLessonBtn){
  backToLessonBtn.addEventListener('click', ()=>{
    showPage(lessonPage, labPage);
  });
}

let star = {
  mass:10,
  hydrogen:70,
  helium:28,
  nitrogen:2,
  temperature:5800,
  color:"rgb(255,220,120)",
  size:90,
  stage:"Main Sequence"
};

const lifeSpanData={
"Main Sequence":10000,
"Red Giant":1000,
"White Dwarf":10000,
"Red Supergiant":100,
"Supernova":1,
"Neutron Star":10000,
"Black Hole":10000
};

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
  s.brightness+=s.delta;
  if(s.brightness>1||s.brightness<0.15) s.delta*=-1;
  ctx.beginPath();
  ctx.fillStyle=`rgba(255,255,255,${s.brightness})`;
  ctx.arc(s.x*canvas.width/500,s.y*canvas.height/500,s.r,0,Math.PI*2);
  ctx.fill();
}}

function drawStarAt(x,y,size,color){
 ctx.save();
 ctx.beginPath();
 ctx.fillStyle=color;
 ctx.shadowColor=color;
 ctx.shadowBlur=30;
 ctx.arc(x,y,size,0,Math.PI*2);
 ctx.fill();
 ctx.restore();
}

function drawStage(stage){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 drawBackground();
 const cx=canvas.width/2;
 const cy=canvas.height/2;

 const colors={
   "Main Sequence":star.color,
   "Red Giant":"red",
   "White Dwarf":"white",
   "Red Supergiant":"crimson",
   "Neutron Star":"lightblue"
 };

 if(stage==="Supernova"){
   for(let i=0;i<40;i++){
     ctx.fillStyle=`rgba(255,${Math.floor(Math.random()*255)},0,0.95)`;
     ctx.beginPath();
     ctx.arc(cx+Math.cos(i)*(i*4),cy+Math.sin(i)*(i*4),6+Math.random()*20,0,Math.PI*2);
     ctx.fill();
   }
 } 
 else if(stage==="Black Hole"){
   drawStarAt(cx,cy,star.size*0.9,"black");
   ctx.strokeStyle="purple";
   ctx.lineWidth=8;
   ctx.beginPath();
   ctx.arc(cx,cy,star.size*1.1,0,Math.PI*2);
   ctx.stroke();
 }
 else{
   drawStarAt(cx,cy,stage.includes("Giant")?star.size*1.6:
                  stage==="White Dwarf"?star.size*0.3:
                  stage==="Neutron Star"?star.size*0.12:star.size,
                  colors[stage]);
 }

 infoBox.textContent=stage;
}

function temperatureToRGB(tempK){
 let t=Math.max(1000,Math.min(40000,tempK))/100;
 let r=255,g,b;
 if(t>66) r=329.7*Math.pow(t-60,-0.13);
 r=Math.max(0,Math.min(255,r));
 g=t<=66?99.47*Math.log(t)-161.1:288.12*Math.pow(t-60,-0.08);
 g=Math.max(0,Math.min(255,g));
 if(t>=66) b=255;
 else if(t<=19) b=0;
 else b=138.51*Math.log(t-10)-305.04;
 return {r,g,b};
}

function compositionTint(h,he,n){
 let t={r:0,g:0,b:0};
 if(n>20){let s=(n-20)/50; t.b+=255*s;}
 if(he>40){let s=(he-40)/60; t.r+=255*s;t.g+=255*s;t.b+=255*s;}
 if(h>60){let s=(h-60)/40; t.r+=255*s;t.g+=200*s;}
 return t;
}

function blend(a,b){ return {r:a.r*0.8+b.r*0.2,g:a.g*0.8+b.g*0.2,b:a.b*0.8+b.b*0.2}; }
function rgbCss(c){ return `rgb(${c.r|0},${c.g|0},${c.b|0})`; }

function recalc(){
 star.size=40+star.mass*3;

 if(star.mass<8){
   star.stage=star.hydrogen>50?"Main Sequence":star.helium>40?"Red Giant":"White Dwarf";
 } else {
   star.stage=star.hydrogen>50?"Main Sequence":
               star.helium>35?"Red Supergiant":
               star.nitrogen>20&&star.mass>20?"Black Hole":
               star.nitrogen>20?"Supernova":"Neutron Star";
 }

 star.color=rgbCss(blend(temperatureToRGB(star.temperature),compositionTint(
 star.hydrogen,star.helium,star.nitrogen)));

 drawStage(star.stage);
 dataBox.textContent=`Approximate Life Span: ${lifeSpanData[star.stage]} million years`;

  updateStatus();
  // update description text
  updateDescription();
}

function updateStatus(){
statusMass.textContent=`${star.mass} Solar Masses`;
statusTemp.textContent=`${star.temperature} K`;
statusStage.textContent=star.stage;
statusColor.textContent=star.color;
statusH.textContent=`${star.hydrogen}%`;
statusHe.textContent=`${star.helium}%`;
statusN.textContent=`${star.nitrogen}%`;
statusLife.textContent=`${lifeSpanData[star.stage]} million years`;

// Update preset dropdown based on stage
const stageToPreset={
  "Main Sequence":"sun",
  "Red Giant":"redGiant",
  "White Dwarf":"whiteDwarf",
  "Red Supergiant":"supergiant",
  "Neutron Star":"neutron",
  "Supernova":"supernova",
  "Black Hole":"blackhole"
};
presetSelect.value=stageToPreset[star.stage]||"";
}

function getStageDescription(stage){
  switch(stage){
    case 'Main Sequence':
      return 'A stable star fusing hydrogen into helium in its core; steady luminosity and long lifespan.';
    case 'Red Giant':
      return 'Expanded, cooler envelope as hydrogen in the core is exhausted; shell burning increases radius.';
    case 'White Dwarf':
      return 'A dense, cooling stellar remnant supported by electron degeneracy; no fusion in the core.';
    case 'Red Supergiant':
      return 'Very large, luminous star near the end of its life; capable of heavy-element fusion in shells.';
    case 'Supernova':
      return 'A catastrophic explosion that disperses heavy elements and may leave a compact remnant.';
    case 'Neutron Star':
      return 'An extremely dense remnant made mostly of neutrons; strong gravity and rapid spin possible.';
    case 'Black Hole':
      return 'A collapsed core whose gravity is so strong that not even light can escape its event horizon.';
    default:
      return 'Stage information unavailable.';
  }
}

function getStageDescription(stage){
  switch(stage){
    case 'Main Sequence':
      return 'A stable star fusing hydrogen into helium in its core; steady luminosity and long lifespan.';
    case 'Red Giant':
      return 'Expanded, cooler envelope as hydrogen in the core is exhausted; shell burning increases radius.';
    case 'White Dwarf':
      return 'A dense, cooling stellar remnant supported by electron degeneracy; no fusion in the core.';
    case 'Red Supergiant':
      return 'Very large, luminous star near the end of its life; capable of heavy-element fusion in shells.';
    case 'Supernova':
      return 'A catastrophic explosion that disperses heavy elements and may leave a compact remnant.';
    case 'Neutron Star':
      return 'An extremely dense remnant made mostly of neutrons; strong gravity and rapid spin possible.';
    case 'Black Hole':
      return 'A collapsed core whose gravity is so strong that not even light can escape its event horizon.';
    default:
      return 'Stage information unavailable.';
  }
}

function updateDescription(){
  const descEl = document.getElementById('starDesc');
  if(!descEl) return;
  descEl.textContent = getStageDescription(star.stage);
}

// --- Sliders ---
massSlider.oninput=()=>{
 star.mass=+massSlider.value;
 massValue.textContent=star.mass+" Solar Masses";
 recalc();
};

function comps(){
 star.hydrogen=+hydrogenSlider.value;
 star.helium=+heliumSlider.value;
 star.nitrogen=+nitrogenSlider.value;
 hydrogenValue.textContent=star.hydrogen+"%";
 heliumValue.textContent=star.helium+"%";
 nitrogenValue.textContent=star.nitrogen+"%";
 recalc();
}

hydrogenSlider.oninput=comps;
heliumSlider.oninput=comps;
nitrogenSlider.oninput=comps;

tempSlider.oninput=()=>{
 star.temperature=+tempSlider.value;
 tempValue.textContent=star.temperature+" K";
 recalc();
};

// --- Presets ---
presetSelect.onchange=()=>{
 const p={
 sun:{mass:1,temp:5800,h:70,he:28,n:2},
 redGiant:{mass:2,temp:3500,h:35,he:55,n:10},
 whiteDwarf:{mass:1,temp:15000,h:5,he:40,n:10},
 supergiant:{mass:25,temp:4500,h:40,he:40,n:20},
 neutron:{mass:15,temp:30000,h:2,he:18,n:20},
 supernova:{mass:20,temp:6000,h:10,he:30,n:30},
 blackhole:{mass:35,temp:50000,h:0,he:10,n:90}
 }[presetSelect.value];

 if(!p) return;

 massSlider.value=p.mass;
 hydrogenSlider.value=p.h;
 heliumSlider.value=p.he;
 nitrogenSlider.value=p.n;
 tempSlider.value=p.temp;

 star.mass=p.mass;
 star.hydrogen=p.h;
 star.helium=p.he;
 star.nitrogen=p.n;
 star.temperature=p.temp;

 massValue.textContent=p.mass+" Solar Masses";
 hydrogenValue.textContent=p.h+"%";
 heliumValue.textContent=p.he+"%";
 nitrogenValue.textContent=p.n+"%";
 tempValue.textContent=p.temp+" K";

 recalc();
};

function animate(){
 recalc();
 requestAnimationFrame(animate);
}
animate();