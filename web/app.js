const chordDefs=[['I','Major',[0,4,7]],['ii','Minor',[2,5,9]],['iii','Minor',[4,7,11]],['IV','Major',[5,9,12]],['V','Major',[7,11,14]],['vi','Minor',[9,12,16]],['vii°','Diminished',[11,14,17]]];
const VOICE_LEADING=true;
const $=id=>document.getElementById(id);let midi=null,output=null,midiStarting=false,active=null,activeIndex=null,audio=null,oscillators=new Map(),lastXY={x:0,y:0},pendingVariant='base',currentVariant='base';
function log(message){const time=new Date().toLocaleTimeString();$('event-log').textContent=`${time}  ${message}\n`+$('event-log').textContent.split('\n').slice(0,18).join('\n')}
function channel(){return Math.min(16,Math.max(1,Number($('channel').value)||1))-1} function send(data){if(output)output.send(data);log(`MIDI ${data.map(n=>n.toString(16).padStart(2,'0')).join(' ')}`)}
function noteOn(note,velocity=100){send([0x90|channel(),note,velocity]); if(audio){const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=440*Math.pow(2,(note-69)/12);g.gain.setValueAtTime(.0001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.08,audio.currentTime+.01);o.connect(g).connect(audio.destination);o.start();oscillators.set(note,{o,g})}}
function noteOff(note){send([0x80|channel(),note,0]);const item=oscillators.get(note);if(item){item.g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.04);item.o.stop(audio.currentTime+.05);oscillators.delete(note)}}
function release(){if(!active)return;active.forEach(noteOff);active=null;activeIndex=null;$('chord-name').textContent='Choose a chord';document.querySelectorAll('.chord').forEach(b=>b.classList.remove('active'));resetJoystick()}
function qualityNotes(index,variant){const base=chordDefs[index][2],minor=chordDefs[index][1]==='Minor';if(variant==='base')return base;if(variant==='flip')return minor?[0,4,7]:[0,3,7];if(variant==='left')return minor?[0,3,7]:[0,3,6];if(variant==='right')return minor?[0,3,7,10]:[0,4,7,11];if(variant==='nw')return [0,4,8];if(variant==='ne')return [0,4,7,10];if(variant==='sw')return minor?[0,3,7,9]:[0,4,7,9];if(variant==='s')return [0,5,7];if(variant==='se')return minor?[0,3,7,10,14]:[0,4,7,11,14];return base}
function notesFor(index,variant='base',previous=null){const root=Number($('root').value)+chordDefs[index][2][0],intervals=qualityNotes(index,variant);if(!VOICE_LEADING||!previous)return intervals.map(n=>root+n);const candidates=[];function build(pos,values){if(pos===intervals.length){const notes=values.slice().sort((a,b)=>a-b);if(notes[notes.length-1]-notes[0]<=24)candidates.push(notes);return}for(let octave=-2;octave<=2;octave++)build(pos+1,values.concat(root+intervals[pos]+octave*12))}build(0,[]);const prior=[...previous].sort((a,b)=>a-b);return candidates.reduce((best,candidate)=>{const count=Math.min(prior.length,candidate.length);let score=Math.abs(candidate.length-prior.length)*6;for(let i=0;i<count;i++)score+=Math.abs(candidate[i]-prior[i]);return !best||score<best.score?{notes:candidate,score}:best},null)?.notes||intervals.map(n=>root+n)}
function replaceNotes(notes,retrigger=false){if(!active)return;const old=[...active];if(retrigger)old.forEach(noteOff);else{const oldSet=new Set(old),nextSet=new Set(notes);oldSet.forEach(n=>{if(!nextSet.has(n))noteOff(n)});notes.forEach(n=>{if(!oldSet.has(n))noteOn(n)})}if(retrigger)notes.forEach(noteOn);active=notes}
function playChord(index){const previous=active?[...active]:null;release();activeIndex=index;currentVariant=pendingVariant;active=notesFor(index,currentVariant,previous);active.forEach(n=>noteOn(n));$('chord-name').textContent=`${chordDefs[index][0]} ${chordDefs[index][1]}${currentVariant==='base'?'':` · ${currentVariant}`}`;document.querySelector(`[data-index="${index}"]`).classList.add('active')}
function setupChords(){chordDefs.forEach((c,i)=>{const b=document.createElement('button');b.className='chord';b.dataset.index=i;b.innerHTML=`${c[0]}<small>${c[1]}</small>`;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);playChord(i)});b.addEventListener('pointerup',()=>{if(activeIndex===i)release()});b.addEventListener('pointercancel',()=>{if(activeIndex===i)release()});$('chord-grid').append(b)})}
function joystickVariant(x,y){const distance=Math.hypot(x,y);if(distance<.22)return'base';if(y<-.35&&x<-.35)return'nw';if(y<-.35&&x>.35)return'ne';if(y>.35&&x<-.35)return'sw';if(y>.35&&x>.35)return'se';if(Math.abs(x)>Math.abs(y))return x<0?'left':'right';if(y<0)return'flip';return's'}
function updateJoystick(e){const r=$('joystick').getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width/2))),y=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height/2))),travel=Math.max(0,Math.min(r.width,r.height)/2-28);lastXY={x,y};pendingVariant=joystickVariant(x,y);$('stick').style.transform=`translate(${x*travel}px,${y*travel}px)`;$('joystick-readout').textContent=`x ${x.toFixed(2)} · y ${y.toFixed(2)}`;if(activeIndex!==null&&pendingVariant!==currentVariant){currentVariant=pendingVariant;replaceNotes(notesFor(activeIndex,currentVariant,active),true)}}
function resetJoystick(){lastXY={x:0,y:0};$('stick').style.transform='translate(0, 0)';$('joystick-readout').textContent='x 0.00 · y 0.00'}
function setupJoystick(){let dragging=false;const j=$('joystick');j.addEventListener('pointerdown',e=>{dragging=true;j.setPointerCapture(e.pointerId);updateJoystick(e)});j.addEventListener('pointermove',e=>{if(dragging)updateJoystick(e)});['pointerup','pointercancel'].forEach(type=>j.addEventListener(type,()=>{dragging=false;pendingVariant='base';currentVariant='base';if(activeIndex!==null)replaceNotes(notesFor(activeIndex,'base'));resetJoystick()}))}
async function toggleAudio(){if(!audio)audio=new AudioContext();await audio.resume();$('audio-status').textContent='Audio ready';$('audio-status').classList.add('live');$('audio-toggle').textContent='Preview enabled';log('Audio preview enabled')}
async function setupMIDI(){
  if(midiStarting)return;
  midiStarting=true;
  if(!navigator.requestMIDIAccess){midiStarting=false;$('midi-status').textContent='MIDI unsupported';log(`Web MIDI unavailable (${location.protocol}, ${window.matchMedia('(display-mode: standalone)').matches?'standalone PWA':'browser'})`);return}
  try{
    midi=await navigator.requestMIDIAccess();
    const refresh=()=>{
      const select=$('midi-output');
      select.innerHTML='<option value="">No output selected</option>';
      [...midi.outputs.values()].forEach(o=>select.add(new Option(o.name,o.id)));
      $('midi-status').textContent=`${midi.outputs.size} MIDI output${midi.outputs.size===1?'':'s'}`;
      const savedId=localStorage.getItem('touch-midi-output');
      if(savedId&&midi.outputs.has(savedId)){select.value=savedId;output=midi.outputs.get(savedId);}
    };
    midi.onstatechange=refresh;
    refresh();
    $('midi-output').onchange=e=>{
      output=midi.outputs.get(e.target.value)||null;
      if(output){localStorage.setItem('touch-midi-output',output.id);log(`Selected MIDI output: ${output.name}`);}
    };
    midiStarting=false;
  }catch(e){midiStarting=false;$('midi-status').textContent='MIDI blocked';log(`MIDI permission failed: ${e.name}: ${e.message}`)}
}
function panic(){if(active)release();for(const n of oscillators.keys())noteOff(n);send([0xb0|channel(),123,0]);log('Panic: all notes off')}
$('audio-toggle').onclick=toggleAudio;$('connect-midi').onclick=setupMIDI;$('panic').onclick=panic;$('clear-log').onclick=()=>$('event-log').textContent='Ready.';window.addEventListener('blur',release);window.addEventListener('keydown',e=>{if(e.repeat)return;const i='asdfjkl'.indexOf(e.key.toLowerCase());if(i>=0)playChord(i)});window.addEventListener('keyup',e=>{if('asdfjkl'.includes(e.key.toLowerCase()))release()});setupChords();setupJoystick();if(localStorage.getItem('touch-midi-output'))setupMIDI();
