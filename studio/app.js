const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const lessonNames = ["Confident Lines","Shapes & Forms","Seeing Light","Shading & Texture","Everyday Objects","Nature Studies","Faces & Figures","Perspective & Space","Personal Style","Masterpiece"];
const lessonDescriptions = [
"Draw five slow, steady lines. Try changing the length and direction. Notice how your hand feels when you relax your grip.",
"Build a small collection of circles, squares, triangles and ovals. Combine two shapes to invent a new object.",
"Choose one object nearby. Sketch its outline, then mark where the light hits and where the shadows gather.",
"Fill a page with gentle, medium and dark marks. Try dots, crosshatching, soft shading and repeated patterns.",
"Sketch a mug, shoe or keys using only the big shapes first. Add details after the proportions feel right.",
"Draw a leaf or flower. Look for repeating patterns, curves and the spaces between the shapes.",
"Make a simple expressive face using basic shapes. Experiment with eyebrows, eyes and mouth to change the mood.",
"Draw a hallway or road with a horizon line and one vanishing point. Let the edges guide the eye.",
"Create three versions of the same subject in different mark-making styles. Keep the one that feels most like you.",
"Plan and create a finished artwork that combines at least three skills from your journey."
];
const activities = [
["Mindful mandala","Build a repeating pattern, one calm mark at a time."],["Memory postcard","Draw a place that holds a favorite memory."],
["Photo-to-coloring page","Use a personal photo as inspiration for a simplified coloring design."],["Partner art date","Take turns adding shapes to one shared drawing."],
["One-line portrait","Draw a face without lifting your pen."],["Tiny world","Invent a miniature room inside an everyday object."],
["Texture treasure hunt","Collect five textures and sketch how each might look."],["Mood palette","Choose colors that match how today feels."],
["Timed doodle","Set a gentle 3-minute timer and keep your pen moving."],["Art journal page","Combine a sketch, a few words and a pattern."],
["Reverse coloring","Start with a colored shape and draw around it."],["Dream garden","Invent plants that could only grow in a dream."],
["Continuous contour","Draw an object while looking mostly at its edges."],["Abstract soundscape","Turn a song's rhythm into lines and shapes."],
["Creative gratitude","Illustrate three small things you appreciate."],["Character maker","Design a character using three simple shapes."],
["Pattern remix","Combine two patterns into one new design."],["Mini comic","Tell a tiny story in four panels."],
["Timelapse replay","Record your screen while making a drawing, then replay it."],["Podcast or book seed","Sketch a cover for an idea you'd love to share."]
];
let completed = JSON.parse(localStorage.getItem("luminaryCompleted")||"[]");
let selectedLevel = 0, selectedLesson = 0;
function updateStats(){
 const count=Math.min(60,completed.length),level=Math.min(10,Math.floor(count/6)+1);
 $("#progressCount").textContent=count; $("#levelCount").textContent=level+" / 10";
 const ring=$("#ringProgress");if(ring)ring.style.setProperty("--progress",String(Math.round(count/60*100)));
 const label=$("#homeProgressLabel");if(label)label.textContent=(count===60?10:level)+"/10";
 const remaining=$("#homeLessonsRemaining");if(remaining)remaining.textContent=count===60?"All 60 lessons complete!":(60-count)+" lessons await you!";
}
function showView(id){ $$(".view").forEach(v=>v.classList.toggle("active",v.id===id)); $$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id)); window.scrollTo({top:0,behavior:"smooth"}); }
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
function renderLevels(){
 $("#levels").innerHTML=lessonNames.map((n,i)=>`<button class="level ${i===selectedLevel?'selected':''}" data-level="${i}"><span class="num">${i+1}</span><span><b>${n}</b><small>${completed.filter(x=>Math.floor(x/6)===i).length} of 6 lessons complete</small></span></button>`).join("");
 $$(".level").forEach(b=>b.onclick=()=>{selectedLevel=+b.dataset.level;renderLevels();renderLesson();});
}
function renderLesson(){const n=lessonNames[selectedLevel];$("#lessonPanel").innerHTML=`<div class="eyebrow">LEVEL ${selectedLevel+1} · LESSON ${selectedLesson+1} OF 6</div><h3>${n}</h3><p>${lessonDescriptions[selectedLevel]}</p><p class="muted">Try this prompt in Free Play, then come back when you're ready.</p><button class="primary" id="completeLesson">Mark lesson complete</button>`;$("#completeLesson").onclick=()=>{let id=selectedLevel*6+selectedLesson;if(!completed.includes(id))completed.push(id);localStorage.setItem("luminaryCompleted",JSON.stringify(completed));updateStats();renderLevels();selectedLesson=(selectedLesson+1)%6;renderLesson();};}
renderLevels();renderLesson();updateStats();
$("#activityGrid").innerHTML=activities.map(([a,b])=>`<article class="activity"><b>${a}</b><small>${b}</small></article>`).join("");
const prompts=["Draw a place where you feel completely at ease.","Invent a flower that blooms only at night.","Turn your initials into an abstract pattern.","Sketch an object as if it were a tiny planet.","Draw your favorite sound without using words.","Create a creature from three geometric shapes.","Illustrate a moment you wish you could bottle.","Design a cozy reading nook in an impossible place."];
$("#newPrompt").onclick=()=>$("#randomPrompt").textContent=prompts[Math.floor(Math.random()*prompts.length)];

// Drawing canvas: pointer events support mouse, touch and stylus pressure when available.
const canvas=$("#drawCanvas"),ctx=canvas.getContext("2d");let drawing=false,last=null,undoStack=[],erasing=false;
function resizeCanvas(){const r=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;const old=canvas.width?canvas.toDataURL():null;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap="round";ctx.lineJoin="round";if(old){let im=new Image();im.onload=()=>ctx.drawImage(im,0,0,r.width,r.height);im.src=old;}}
new ResizeObserver(resizeCanvas).observe(canvas);resizeCanvas();
function snapshot(){undoStack.push(canvas.toDataURL());if(undoStack.length>20)undoStack.shift();}
canvas.addEventListener("pointerdown",e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);snapshot();drawing=true;const r=canvas.getBoundingClientRect();last={x:e.clientX-r.left,y:e.clientY-r.top};});
canvas.addEventListener("pointermove",e=>{if(!drawing)return;e.preventDefault();const r=canvas.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top};const pressure=e.pressure>0?e.pressure:0.5;const base=+$("#size").value;ctx.globalCompositeOperation=erasing?"destination-out":"source-over";ctx.strokeStyle=erasing?"#000000":$("#ink").value;ctx.lineWidth=erasing?base*3:base*(e.pointerType==="pen"?(0.35+pressure*1.5):1);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();if($("#mirror").checked){ctx.beginPath();ctx.moveTo(r.width-last.x,last.y);ctx.lineTo(r.width-p.x,p.y);ctx.stroke();}last=p;});
function stop(){drawing=false;last=null;ctx.globalCompositeOperation="source-over";}canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);
$("#eraser").onclick=()=>{erasing=!erasing;$("#eraser").textContent=erasing?"Eraser on":"Eraser";};
function restore(data){let im=new Image();im.onload=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);const r=canvas.getBoundingClientRect();ctx.drawImage(im,0,0,r.width,r.height);};im.src=data;}
$("#undo").onclick=()=>{const prev=undoStack.pop();if(prev)restore(prev);};
$("#clear").onclick=()=>{snapshot();ctx.clearRect(0,0,canvas.width,canvas.height);};
$("#save").onclick=()=>{const data=canvas.toDataURL("image/png");let saved=JSON.parse(localStorage.getItem("luminaryDrawings")||"[]");saved.unshift(data);saved=saved.slice(0,8);localStorage.setItem("luminaryDrawings",JSON.stringify(saved));renderGallery();};
function renderGallery(){$("#savedGallery").innerHTML=JSON.parse(localStorage.getItem("luminaryDrawings")||"[]").map((d,i)=>`<img src="${d}" alt="Saved drawing ${i+1}" title="Saved drawing ${i+1}">`).join("");}renderGallery();

// Color-by-number mini activity
const colors=["#f2c66d","#d889a7","#8db7a1","#8e9ed2","#e9a36f","#b8a0d5"];let chosen=0;
$("#palette").innerHTML=colors.map((c,i)=>`<button class="swatch ${i===0?'active':''}" style="background:${c}" data-color="${i}" aria-label="Color ${i+1}">${i+1}</button>`).join("");
$$(".swatch").forEach(b=>b.onclick=()=>{chosen=+b.dataset.color;$$(".swatch").forEach(x=>x.classList.toggle("active",x===b));});
$$(".region").forEach(b=>b.onclick=()=>{let n=+b.dataset.number;if(n-1===chosen){b.style.background=colors[chosen];b.dataset.done="1";$("#colorMessage").textContent="Lovely! Keep going — color "+(chosen+1)+" matched.";if($$(".region[data-done='1']").length===6)$("#colorMessage").textContent="You did it! Your little flower is complete."; }else $("#colorMessage").textContent="Try color "+n+" for this region, or choose another number.";});
$("#resetColor").onclick=()=>{$$(".region").forEach(b=>{b.style.background="transparent";delete b.dataset.done;});$("#colorMessage").textContent="Picture reset. Choose a number to begin.";};

// Install prompt for supported browsers
let installEvent;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvent=e;$("#installBtn").hidden=false;});
$("#installBtn").onclick=async()=>{if(installEvent){installEvent.prompt();await installEvent.userChoice;installEvent=null;$("#installBtn").hidden=true;}};
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});

// Home toolkit shortcuts launch real drawing tools instead of decorative buttons.
$$('[data-tool]').forEach(button=>button.addEventListener('click',()=>{
 const tool=button.dataset.tool;showView('studio');
 if(tool==='eraser' && !erasing)$('#eraser').click();
 if(tool==='pen' && erasing)$('#eraser').click();
 if(tool==='brush'){$('#brushStyle').value='marker';if(erasing)$('#eraser').click();}
 if(tool==='mirror')$('#mirror').checked=!$('#mirror').checked;
 if(tool==='colors')$('#ink').focus();
 if(tool==='undo')$('#undo').click();
 if(tool==='save')$('#save').click();
}));

// Connected creative widgets: each opens a usable studio or guided path.
const widgetPaths={sketch:{view:'learn',level:0},draw:{view:'learn',level:1},paint:{view:'learn',level:3},podcast:{view:'write',mode:'podcast'},book:{view:'write',mode:'book'}};
$$('[data-widget]').forEach(button=>button.addEventListener('click',()=>{const w=widgetPaths[button.dataset.widget];if(w.level!==undefined){selectedLevel=w.level;selectedLesson=0;renderLevels();renderLesson();}if(w.mode){$('#writingMode').value=w.mode;loadWriting();}showView(w.view);}));
// Six genuinely selectable lessons in every level, with unique practice goals.
const lessonCurriculum = [
 {
  "title": "Line confidence",
  "exercise": "Draw ten long strokes from shoulder to wrist, without correcting them.",
  "check": "Compare which three strokes feel most fluid."
 },
 {
  "title": "Contour discovery",
  "exercise": "Trace the silhouette of a real cup with one uninterrupted line.",
  "check": "Your contour closes around the object."
 },
 {
  "title": "Line rhythm",
  "exercise": "Fill three rows with slow, medium and quick parallel marks.",
  "check": "Identify the pace with the steadiest spacing."
 },
 {
  "title": "Weight and emphasis",
  "exercise": "Draw the same leaf using thin edges and bold focal lines.",
  "check": "The focal edge reads clearly at arm’s length."
 },
 {
  "title": "Curves and corners",
  "exercise": "Alternate S-curves, circles, zigzags and crisp corners in a pattern.",
  "check": "Each mark changes direction intentionally."
 },
 {
  "title": "Linework study",
  "exercise": "Create a small cityscape using only lines and varied line weight.",
  "check": "The drawing has foreground, middle and background."
 },
 {
  "title": "Circle construction",
  "exercise": "Build a teacup from two ellipses and a rectangle.",
  "check": "The rim and base align."
 },
 {
  "title": "Boxes in space",
  "exercise": "Sketch three boxes from different viewing angles.",
  "check": "Each box shows believable top and side planes."
 },
 {
  "title": "Cylinder practice",
  "exercise": "Construct a vase from a central axis and stacked ellipses.",
  "check": "The vase feels symmetrical."
 },
 {
  "title": "Shape simplification",
  "exercise": "Reduce a bicycle to circles, triangles and lines before adding detail.",
  "check": "The silhouette remains recognizable."
 },
 {
  "title": "Positive and negative",
  "exercise": "Draw a chair by sketching the spaces between its legs first.",
  "check": "The empty spaces help the proportions."
 },
 {
  "title": "Form invention",
  "exercise": "Design a playful lamp using sphere, cone and cylinder forms.",
  "check": "The object feels three-dimensional."
 },
 {
  "title": "Find the light",
  "exercise": "Place a small object near a lamp and draw an arrow for light direction.",
  "check": "Your drawing identifies the brightest plane."
 },
 {
  "title": "Value ladder",
  "exercise": "Make seven squares from paper white to deep graphite.",
  "check": "The seven steps are visibly different."
 },
 {
  "title": "Cast shadow",
  "exercise": "Draw a sphere and its cast shadow on a tabletop.",
  "check": "The shadow points away from the light."
 },
 {
  "title": "Core shadow",
  "exercise": "Shade a cylinder with light, midtone and core shadow bands.",
  "check": "The curved form reads without an outline."
 },
 {
  "title": "Reflected light",
  "exercise": "Study a dark mug and leave a narrow reflected-light edge.",
  "check": "The edge remains darker than the highlight."
 },
 {
  "title": "Still-life lighting",
  "exercise": "Draw two objects under one light source with consistent shadows.",
  "check": "Both objects share the same light direction."
 },
 {
  "title": "Hatching control",
  "exercise": "Shade a rectangle from light to dark using parallel hatches.",
  "check": "The hatch density changes smoothly."
 },
 {
  "title": "Crosshatch volume",
  "exercise": "Use two crossing hatch directions to shade an apple.",
  "check": "The apple looks round."
 },
 {
  "title": "Stipple gradients",
  "exercise": "Build a soft shadow using only dots.",
  "check": "Dot spacing, not dot size, creates the gradient."
 },
 {
  "title": "Material: wood",
  "exercise": "Sketch a small wooden box with grain following each plane.",
  "check": "The grain reinforces the form."
 },
 {
  "title": "Material: fabric",
  "exercise": "Draw three fabric folds using soft and sharp value transitions.",
  "check": "The folds show tension and depth."
 },
 {
  "title": "Texture sampler",
  "exercise": "Create a six-tile board: stone, metal, fur, glass, wood, fabric.",
  "check": "Each tile has a distinct surface quality."
 },
 {
  "title": "Mug proportions",
  "exercise": "Measure mug height against width before drawing its silhouette.",
  "check": "The proportions resemble the reference."
 },
 {
  "title": "Keys and overlap",
  "exercise": "Arrange three keys and draw their overlaps from observation.",
  "check": "The frontmost key is unmistakable."
 },
 {
  "title": "Shoe gesture",
  "exercise": "Sketch a shoe in 90 seconds, focusing on its overall movement.",
  "check": "The gesture reads before the details."
 },
 {
  "title": "Bottle symmetry",
  "exercise": "Construct a bottle around a vertical centerline.",
  "check": "Both sides balance around the axis."
 },
 {
  "title": "Desk composition",
  "exercise": "Arrange three desk objects and draw them as simple masses.",
  "check": "All objects sit on the same surface."
 },
 {
  "title": "Everyday still life",
  "exercise": "Finish a three-object study with contour, value and focal point.",
  "check": "The focal object attracts attention first."
 },
 {
  "title": "Leaf veins",
  "exercise": "Draw a real leaf from its central vein outward.",
  "check": "Secondary veins follow the leaf structure."
 },
 {
  "title": "Petal anatomy",
  "exercise": "Study a flower and sketch petals overlapping around a center.",
  "check": "Petals attach consistently."
 },
 {
  "title": "Branching pattern",
  "exercise": "Draw a twig with branches tapering from trunk to tip.",
  "check": "Thinner branches emerge naturally."
 },
 {
  "title": "Shell spirals",
  "exercise": "Observe a shell or spiral image and sketch its changing curve.",
  "check": "The spiral expands smoothly."
 },
 {
  "title": "Botanical values",
  "exercise": "Shade a leaf with folds and a clear light direction.",
  "check": "The leaf appears to bend in space."
 },
 {
  "title": "Botanical plate",
  "exercise": "Create a finished botanical page with one specimen and annotations.",
  "check": "The page feels like a coherent study."
 },
 {
  "title": "Face map",
  "exercise": "Draw a head oval with eye, nose and mouth guides.",
  "check": "Features follow the same central axis."
 },
 {
  "title": "Eyes and brows",
  "exercise": "Sketch three pairs of eyes expressing different emotions.",
  "check": "Brows change the expression."
 },
 {
  "title": "Nose planes",
  "exercise": "Construct a nose using bridge, tip and side planes.",
  "check": "The nose has volume without heavy outlines."
 },
 {
  "title": "Mouth expressions",
  "exercise": "Draw five mouths showing different emotions.",
  "check": "Expressions remain readable at small size."
 },
 {
  "title": "Gesture figure",
  "exercise": "Capture five standing or seated poses in 60 seconds each.",
  "check": "Each pose has a clear line of action."
 },
 {
  "title": "Expressive portrait",
  "exercise": "Create a portrait that combines structure, features and mood.",
  "check": "The intended expression is apparent."
 },
 {
  "title": "Horizon line",
  "exercise": "Draw three horizons: low, eye-level and high.",
  "check": "Each horizon changes the viewer’s viewpoint."
 },
 {
  "title": "One-point room",
  "exercise": "Place a vanishing point and construct a simple room.",
  "check": "Receding lines converge consistently."
 },
 {
  "title": "Road to distance",
  "exercise": "Sketch a road with shrinking trees and lane marks.",
  "check": "Objects get smaller toward the horizon."
 },
 {
  "title": "Two-point boxes",
  "exercise": "Construct a building corner with two vanishing points.",
  "check": "Both face directions recede correctly."
 },
 {
  "title": "Overlap and scale",
  "exercise": "Draw a landscape using overlapping hills and varied object sizes.",
  "check": "Depth is clear even without shading."
 },
 {
  "title": "Interior sketch",
  "exercise": "Draw a cozy reading corner with perspective and tonal focus.",
  "check": "The room feels inhabitable."
 },
 {
  "title": "Mark-making signature",
  "exercise": "Make a page of ten favorite marks and select three to develop.",
  "check": "Your chosen marks have a recognizable character."
 },
 {
  "title": "Palette personality",
  "exercise": "Choose five colors that convey a mood and make an abstract study.",
  "check": "The palette expresses the intended feeling."
 },
 {
  "title": "Three interpretations",
  "exercise": "Draw one flower realistically, geometrically and expressively.",
  "check": "Each version feels distinct."
 },
 {
  "title": "Negative-space design",
  "exercise": "Create an illustration where the background defines the subject.",
  "check": "The subject is legible through empty space."
 },
 {
  "title": "Story through symbols",
  "exercise": "Illustrate a personal memory using three visual symbols.",
  "check": "The image suggests a narrative."
 },
 {
  "title": "Style mini-series",
  "exercise": "Create three related small artworks using a consistent visual language.",
  "check": "The trio looks like one collection."
 },
 {
  "title": "Masterpiece concept",
  "exercise": "Write a one-sentence theme and make three thumbnail compositions.",
  "check": "One composition has a clear focal point."
 },
 {
  "title": "Reference and plan",
  "exercise": "Gather three references and identify the shapes, values and mood to borrow.",
  "check": "The plan stays original and specific."
 },
 {
  "title": "Composition block-in",
  "exercise": "Build the final drawing using large masses and perspective first.",
  "check": "The layout works before details."
 },
 {
  "title": "Light and texture pass",
  "exercise": "Add a consistent light source and three purposeful textures.",
  "check": "The image has depth and material variety."
 },
 {
  "title": "Refinement critique",
  "exercise": "Check anatomy, proportions, edges and focal contrast; revise two issues.",
  "check": "At least two deliberate improvements are visible."
 },
 {
  "title": "Final masterpiece",
  "exercise": "Complete, title and export your original work for your portfolio.",
  "check": "The final work combines at least three learned skills."
 }
];
renderLesson=function(){
 const id=selectedLevel*6+selectedLesson, item=lessonCurriculum[id];
 const picker=Array.from({length:6},(_,i)=>{const x=lessonCurriculum[selectedLevel*6+i];return `<button class="secondary ${i===selectedLesson?'chosen':''}" data-lesson="${i}" aria-label="Lesson ${i+1}: ${x.title}">${i+1}. ${x.title}${completed.includes(selectedLevel*6+i)?' ✓':''}</button>`}).join('');
 $('#lessonPanel').innerHTML=`<div class="eyebrow">LEVEL ${selectedLevel+1} · LESSON ${selectedLesson+1} OF 6</div><h3>${item.title}</h3><p><strong>Your creative mission</strong></p><p>${item.exercise}</p><p><strong>How to know you have it</strong></p><p>${item.check}</p><div class="lesson-picker">${picker}</div><p class="muted">Practice with a guide on the canvas, then mark this lesson complete. No scores or time limits.</p><button class="secondary" id="practiceLesson">Practice on canvas</button> <button class="primary" id="completeLesson">${completed.includes(id)?'Completed ✓':'Mark lesson complete'}</button>`;
 $$('#lessonPanel [data-lesson]').forEach(b=>b.onclick=()=>{selectedLesson=+b.dataset.lesson;renderLesson()});
 $('#practiceLesson').onclick=()=>showView('studio');
 $('#completeLesson').onclick=()=>{if(!completed.includes(id))completed.push(id);localStorage.setItem('luminaryCompleted',JSON.stringify(completed));updateStats();renderLevels();notify(completed.length===60?'🏆 Master Sketch Artist Award unlocked!':'Lesson complete! ✨');selectedLesson=(selectedLesson+1)%6;renderLesson()};
};renderLesson();
function notify(message){const el=$('#toast');el.textContent=message;el.style.display='block';clearTimeout(notify.timeout);notify.timeout=setTimeout(()=>el.style.display='none',3200);}
$('#rainbow').onclick=()=>{const palette=['#ff4fce','#52dfff','#ffd05b','#9c8aff','#5ce7ab','#fc7c71'];$('#ink').value=palette[Math.floor(Math.random()*palette.length)];erasing=false;$('#eraser').textContent='Eraser';notify('New color selected ✨');};
// Preserve canvas drawing functionality, with a selectable brush rendering style.
canvas.addEventListener('pointerdown',()=>{const brush=$('#brushStyle').value;ctx.shadowBlur=brush==='glow'?14:0;ctx.shadowColor=$('#ink').value;ctx.globalAlpha=erasing?1:(brush==='marker'?.55:1);});
canvas.addEventListener('pointerup',()=>{ctx.shadowBlur=0;ctx.globalAlpha=1;});
$('#exportArt').onclick=()=>{const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='upfront-art-artwork.png';a.click();notify('PNG export started');};
const oldSave=$('#save').onclick;$('#save').onclick=()=>{try{oldSave();renderFullGallery();notify('Saved to your gallery ✨');}catch(e){notify('Storage is full. Export your artwork as PNG instead.');}};
function renderFullGallery(){let saved=[];try{saved=JSON.parse(localStorage.getItem('luminaryDrawings')||'[]')}catch(e){}$('#galleryGrid').innerHTML='';saved.forEach((src,i)=>{const a=document.createElement('a');a.href=src;a.download=`upfront-art-art-${i+1}.png`;const img=document.createElement('img');img.src=src;img.alt=`Saved artwork ${i+1} — select to download`;a.append(img);$('#galleryGrid').append(a)});$('#galleryEmpty').hidden=saved.length>0;}renderFullGallery();
// Separate local drafts for book and podcast modes.
const writingGuides={podcast:['1. Define your listener and big idea','2. Write an irresistible opening hook','3. Plan three talking points','4. Add stories, questions, or interview cues','5. Finish with a clear closing'],book:['1. Choose your genre and central idea','2. Meet your main character or narrator','3. Describe the setting and stakes','4. Outline a beginning, middle, and end','5. Draft your opening scene']};
const writingTemplates={podcast:'EPISODE TITLE: \n\nOPENING HOOK\nWelcome to...\n\nINTRODUCTION\nToday we are exploring...\n\nSEGMENT 1\n\nSEGMENT 2\n\nSEGMENT 3\n\nCLOSING\nThank you for listening...\n',book:'WORKING TITLE: \n\nPREMISE\nThis is a story about...\n\nMAIN CHARACTERS\n\nSETTING\n\nCHAPTER OUTLINE\nChapter 1:\nChapter 2:\nChapter 3:\n\nOPENING SCENE\n'};
function loadWriting(){const mode=$('#writingMode').value;$('#writingGuide').innerHTML='<b>Your creative roadmap</b>'+writingGuides[mode].map(x=>`<p>${x}</p>`).join('');$('#writingTitle').value=localStorage.getItem('luminary-'+mode+'-title')||'';$('#writingText').value=localStorage.getItem('luminary-'+mode+'-text')||'';$('#writingStatus').textContent='Auto-saved locally · '+(mode==='podcast'?'Podcast studio':'Book studio');}
function saveWriting(){const mode=$('#writingMode').value;try{localStorage.setItem('luminary-'+mode+'-title',$('#writingTitle').value);localStorage.setItem('luminary-'+mode+'-text',$('#writingText').value);$('#writingStatus').textContent='Saved on this device ✓';}catch(e){$('#writingStatus').textContent='Local storage full — please export your draft.';}}
$('#writingMode').onchange=loadWriting;$('#writingTitle').oninput=saveWriting;$('#writingText').oninput=saveWriting;
$('#insertTemplate').onclick=()=>{if($('#writingText').value.trim()&&!confirm('Replace your current draft with a starter outline?'))return;$('#writingText').value=writingTemplates[$('#writingMode').value];saveWriting();notify('Starter outline added');};
$('#downloadWriting').onclick=()=>{const mode=$('#writingMode').value;const blob=new Blob([$('#writingTitle').value+'\n\n'+$('#writingText').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`upfront-art-${mode}-draft.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};loadWriting();
// Don't claim cross-device sync; all data is browser-local.


// Guided art practice. A separate canvas makes references non-destructive.
const guideCanvas=document.getElementById('guideCanvas');
const guideCtx=guideCanvas.getContext('2d');
const guideHints={
 none:'A blank canvas for your own ideas.',
 lines:'Follow the dashed lines, then draw five confident lines of your own.',
 shapes:'Trace the shapes, then combine them into a new object.',
 flower:'Follow the petals and leaves, then add your own botanical details.',
 face:'Use the guide to place eyes, nose and mouth, then invent an expression.',
 perspective:'Trace the horizon and converging lines to explore depth.'
};
function renderGuide(){
 const r=guideCanvas.getBoundingClientRect(),w=r.width,h=r.height,d=window.devicePixelRatio||1;
 if(!w||!h)return;
 guideCanvas.width=Math.round(w*d);guideCanvas.height=Math.round(h*d);
 guideCtx.setTransform(d,0,0,d,0,0);guideCtx.clearRect(0,0,w,h);
 const g=guideCtx;
 g.strokeStyle='#7656c8';g.fillStyle='#7656c8';g.lineWidth=2;g.setLineDash([8,7]);
 const line=(x,y,a,b)=>{g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke()};
 const ellipse=(x,y,rx,ry)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.stroke()};
 const kind=document.getElementById('guideSelect').value;
 document.getElementById('guideHint').textContent=guideHints[kind];
 guideCanvas.style.display=document.getElementById('showGuide').checked?'block':'none';
 if(kind==='lines'){for(let i=1;i<=5;i++){let y=h*i/6;line(w*.12,y,w*.88,y+(i-3)*15)}}
 if(kind==='shapes'){ellipse(w*.25,h*.32,w*.12,h*.17);g.strokeRect(w*.5,h*.18,w*.23,h*.27);g.beginPath();g.moveTo(w*.26,h*.65);g.lineTo(w*.46,h*.85);g.lineTo(w*.07,h*.85);g.closePath();g.stroke();ellipse(w*.68,h*.72,w*.17,h*.09)}
 if(kind==='flower'){
   const cx=w*.5,cy=h*.43,rad=Math.min(w,h)*.15;
   for(let i=0;i<8;i++){let a=i*Math.PI/4;ellipse(cx+Math.cos(a)*rad*.9,cy+Math.sin(a)*rad*.9,rad*.6,rad*.6)}
   ellipse(cx,cy,rad*.42,rad*.42);line(cx,cy+rad*1.5,cx,h*.92);
   ellipse(cx-rad*.7,h*.74,rad*.7,rad*.27);ellipse(cx+rad*.7,h*.83,rad*.7,rad*.27);
 }
 if(kind==='face'){
   const s=Math.min(w,h);ellipse(w*.5,h*.48,s*.24,s*.34);
   line(w*.26,h*.43,w*.74,h*.43);line(w*.5,h*.16,w*.5,h*.8);
   ellipse(w*.4,h*.42,s*.045,s*.023);ellipse(w*.6,h*.42,s*.045,s*.023);
   line(w*.5,h*.46,w*.47,h*.59);line(w*.47,h*.59,w*.54,h*.59);
   g.beginPath();g.arc(w*.5,h*.63,s*.085,0,Math.PI);g.stroke();
 }
 if(kind==='perspective'){
   const vx=w*.5,vy=h*.48;line(0,vy,w,vy);
   [[0,0],[w,0],[0,h],[w,h],[w*.18,h],[w*.82,h]].forEach(([x,y])=>line(vx,vy,x,y));
   g.strokeRect(w*.13,h*.23,w*.2,h*.24);g.strokeRect(w*.68,h*.23,w*.18,h*.24);
 }
 g.setLineDash([]);
}
new ResizeObserver(renderGuide).observe(guideCanvas);
document.getElementById('guideSelect').addEventListener('change',renderGuide);
document.getElementById('showGuide').addEventListener('change',renderGuide);
document.getElementById('downloadWithGuide').addEventListener('click',()=>{
 const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;
 const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
 if(document.getElementById('showGuide').checked)x.drawImage(guideCanvas,0,0,c.width,c.height);
 x.drawImage(canvas,0,0);
 const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='upfront-art-guided-art.png';a.click();
});
function renderAward(){
 const box=document.getElementById('awardStatus');
 if(completed.length<60){
   box.textContent=`🏆 Master Sketch Artist Award · ${completed.length} of 60 lessons completed. The award unlocks after all 60 lessons.`;
   return;
 }
 box.innerHTML='<strong>🏆 Master Sketch Artist Award unlocked!</strong><p>You completed all 60 creative lessons.</p><button class="primary" id="printAward">Print your certificate</button>';
 document.getElementById('printAward').onclick=()=>{
   const win=window.open('','_blank');
   if(!win){notify('Allow pop-ups to print your certificate.');return;}
   win.document.write('<!doctype html><html><head><title>Upfront Art Studio Award</title><meta charset="utf-8"><style>body{font-family:Georgia,serif;text-align:center;padding:8vw;background:#fff;color:#33264d}article{border:8px double #8c67b6;padding:8vw}h1{font-size:40px}p{font-size:20px}</style></head><body><article><h1>✦ Master Sketch Artist Award ✦</h1><p>Certificate of Creative Achievement</p><p>For completing all 60 Upfront Art Studio lessons</p><p>Keep creating. Keep shining.</p><small>Upfront Art Studio · Upfront Consulting with Tiff &amp; Reco LLC</small></article><script>window.onload=()=>window.print()<\/script></body></html>');
   win.document.close();
 };
}
const originalUpdateStats=updateStats;
updateStats=function(){originalUpdateStats();renderAward();};
renderAward();
// Keep selected guided topic in sync when practicing a lesson.
const originalRenderLesson=renderLesson;
renderLesson=function(){originalRenderLesson();const b=document.getElementById('practiceLesson');if(b)b.onclick=()=>{
 const guide=['lines','shapes','none','none','shapes','flower','face','perspective','none','none'][selectedLevel];
 document.getElementById('guideSelect').value=guide;
 renderGuide();showView('studio');
};};
renderLesson();


// V6: non-destructive autosave of the current canvas draft (device-local IndexedDB).
const studioDB = new Promise(resolve=>{
 if(!('indexedDB' in window)){resolve(null);return;}
 // Safari private browsing and restricted previews may throw synchronously.
 try{
  const request=indexedDB.open('upfront-art-drafts',1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('art'))request.result.createObjectStore('art');};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>resolve(null);
 }catch(e){resolve(null);}
});
function draftStore(mode,action){return studioDB.then(db=>new Promise(resolve=>{
 if(!db){resolve(null);return;}
 try{const tx=db.transaction('art',mode),req=action(tx.objectStore('art'));req.onsuccess=()=>resolve(mode==='readwrite'?true:req.result);req.onerror=()=>resolve(null);}catch(e){resolve(null)}
}));}
let autosaveTimer;
function saveCanvasDraft(){clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>{
 try{
  const png=canvas.toDataURL('image/png');
  draftStore('readwrite',store=>store.put(png,'current')).then(saved=>{
   $('#draftStatus').textContent=saved?'Canvas draft saved on this device':'Automatic draft saving is unavailable here. Export a PNG to keep your artwork.';
  });
 }catch(e){$('#draftStatus').textContent='Draft could not be saved. Export a PNG to keep your artwork.'}
},250);}
let draftLoaded=false;
function loadCanvasDraft(){
 if(draftLoaded||canvas.getBoundingClientRect().width<10)return Promise.resolve();
 draftLoaded=true;
 return draftStore('readonly',store=>store.get('current')).then(png=>{
  if(!png)return;const img=new Image();img.onload=()=>{const r=canvas.getBoundingClientRect();if(r.width<10)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,r.width,r.height);$('#draftStatus').textContent='Your last canvas draft was restored';};img.src=png;
 });
}
canvas.addEventListener('pointerup',saveCanvasDraft);canvas.addEventListener('pointercancel',saveCanvasDraft);
$('#clear').addEventListener('click',saveCanvasDraft);$('#undo').addEventListener('click',saveCanvasDraft);
requestAnimationFrame(()=>requestAnimationFrame(loadCanvasDraft));
new ResizeObserver(()=>{if(!draftLoaded&&canvas.getBoundingClientRect().width>10)loadCanvasDraft();}).observe(canvas);

// V6: three original six-region designs with independent saved progress.
const COLOR_KEY='upfront-art-color-v6';
const designSymbols={flower:'✿',star:'✦',gem:'◇'};
let design='flower';
function colorState(){try{return JSON.parse(localStorage.getItem(COLOR_KEY)||'{}')}catch(e){return {}}}
function paintDesign(){const all=colorState(),done=all[design]||[];$('#colorArt').dataset.design=design;$('#colorArt .art-center').textContent=designSymbols[design];
 $$('.region').forEach(b=>{const idx=Number(b.dataset.number);if(done.includes(idx)){b.style.background=colors[idx-1];b.dataset.done='1';}else{b.style.background='transparent';delete b.dataset.done;}});
 $$('.color-design').forEach(b=>b.classList.toggle('selected',b.dataset.design===design));
 $('#colorMessage').textContent=done.length===6?'Picture complete! Choose another design or reset.':`${done.length} of 6 regions complete in ${design}.`;
}
$$('.color-design').forEach(b=>b.addEventListener('click',()=>{design=b.dataset.design;paintDesign();}));
$$('.region').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.done!=='1')return;const all=colorState();all[design]=[...new Set([...(all[design]||[]),Number(b.dataset.number)])];try{localStorage.setItem(COLOR_KEY,JSON.stringify(all));}catch(e){};}));
$('#resetColor').addEventListener('click',()=>{const all=colorState();all[design]=[];try{localStorage.setItem(COLOR_KEY,JSON.stringify(all));}catch(e){};paintDesign();});
paintDesign();

// V6: portable, explicit studio backup. Import asks before replacing browser-local data.
const BACKUP_KEYS=['luminaryCompleted','luminaryDrawings','luminaryPodcastDraft','luminaryBookDraft','upfront-art-color-v6'];
function studioBackup(){const values={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith('luminary')||key.startsWith('upfront-art-color'))values[key]=localStorage.getItem(key);}return values;}
$('#exportStudioBackup').addEventListener('click',async()=>{
 const draft=await draftStore('readonly',store=>store.get('current'));
 const data={format:'upfront-art-studio-backup',version:6,created:new Date().toISOString(),storage:studioBackup(),canvasDraft:draft||null};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='upfront-art-studio-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);notify('Studio backup downloaded');
});
$('#importStudioBackup').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{const data=JSON.parse(await file.text());if(data.format!=='upfront-art-studio-backup'||!data.storage||typeof data.storage!=='object'||Array.isArray(data.storage))throw new Error('Invalid backup');
  if(!confirm('Restore this studio backup? It will replace lessons, gallery, and writing saved in this browser.'))return;
  for(const [key,value] of Object.entries(data.storage)){if((key.startsWith('luminary')||key.startsWith('upfront-art-color'))&&typeof value==='string')localStorage.setItem(key,value);}
  if(typeof data.canvasDraft==='string'&&data.canvasDraft.startsWith('data:image/png;base64,'))await draftStore('readwrite',store=>store.put(data.canvasDraft,'current'));
  location.reload();
 }catch(err){notify('Backup could not be imported. Check that it is a studio backup JSON file.');}
 finally{e.target.value='';}
});

// Open the selected creative activity from the approved landing-page artwork.
try { const requestedView = new URLSearchParams(window.location.search).get('view'); if (requestedView && document.getElementById(requestedView) && typeof showView === 'function') { showView(requestedView); } } catch (error) { console.warn('Unable to open requested studio view', error); }
