const chordDefs=[['I','Major',[0,4,7]],['ii','Minor',[2,5,9]],['iii','Minor',[4,7,11]],['IV','Major',[5,9,12]],['V','Major',[7,11,14]],['vi','Minor',[9,12,16]],['vii°','Diminished',[11,14,17]]];
const $=id=>document.getElementById(id);let midi=null,output=null,active=null,activeIndex=null,audio=null,oscillators=new Map(),lastXY={x:0,y:0};
function log(message){const time=new Date().toLocaleTimeString();$('event-log').textContent=`${time}  ${message}\n`+$('event-log').textContent.split('\n').slice(0,18).join('\n')}
function channel(){return Math.min(16,Math.max(1,Number($('channel').value)||1))-1} function send(data){if(output)output.send(data);log(`MIDI ${data.map(n=>n.toString(16).padStart(2,'0')).join(' ')}`)}
function noteOn(note,velocity=100){send([0x90|channel(),note,velocity]); if(audio){const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=440*Math.pow(2,(note-69)/12);g.gain.setValueAtTime(.0001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.08,audio.currentTime+.01);o.connect(g).connect(audio.destination);o.start();oscillators.set(note,{o,g})}}
function noteOff(note){send([0x80|channel(),note,0]);const item=oscillators.get(note);if(item){item.g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.04);item.o.stop(audio.currentTime+.05);oscillators.delete(note)}}
function release(){if(!active)return;active.forEach(noteOff);active=null;activeIndex=null;$('chord-name').textContent='Choose a chord';document.querySelectorAll('.chord').forEach(b=>b.classList.remove('active'));resetJoystick()}
function qualityNotes(index,variant){const base=chordDefs[index][2],minor=chordDefs[index][1]==='Minor';if(variant==='base')return base;if(variant==='flip')return minor?[0,4,7]:[0,3,7];if(variant==='left')return minor?[0,3,7]:[0,3,6];if(variant==='right')return minor?[0,3,7,10]:[0,4,7,11];if(variant==='nw')return [0,4,8];if(variant==='ne')return [0,4,7,10];if(variant==='sw')return minor?[0,3,7,9]:[0,4,7,9];if(variant==='s')return minor?[0,3,7,14]:[0,4,7,14];if(variant==='se')return minor?[0,3,7,14]:[0,4,7,14];return base}
function notesFor(index,variant='base'){const root=Number($('root').value)+chordDefs[index][2][0];return qualityNotes(index,variant).map(n=>root+n)}
function replaceNotes(notes){if(!active)return;const old=new Set(active),next=new Set(notes);old.forEach(n=>{if(!next.has(n))noteOff(n)});next.forEach(n=>{if(!old.has(n))noteOn(n)});active=notes}
function playChord(index){release();activeIndex=index;active=notesFor(index);active.forEach(n=>noteOn(n));$('chord-name').textContent=`${chordDefs[index][0]} ${chordDefs[index][1]}`;document.querySelector(`[data-index="${index}"]`).classList.add('active')}
function setupChords(){chordDefs.forEach((c,i)=>{const b=document.createElement('button');b.className='chord';b.dataset.index=i;b.innerHTML=`${c[0]}<small>${c[1]}</small>`;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);playChord(i)});b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);$('chord-grid').append(b)})}
function joystickVariant(x,y){const distance=Math.hypot(x,y);if(distance<.22)return'base';if(y<-.35&&x<-.35)return'nw';if(y<-.35&&x>.35)return'ne';if(y>.35&&x<-.35)return'sw';if(y>.35&&x>.35)return'se';if(Math.abs(x)>Math.abs(y))return x<0?'left':'right';if(y<0)return'flip';return's'}
function updateJoystick(e){const r=$('joystick').getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width/2))),y=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height/2)));lastXY={x,y};$('stick').style.transform=`translate(${x*86}px,${y*86}px)`;$('joystick-readout').textContent=`x ${x.toFixed(2)} · y ${y.toFixed(2)}`;if(activeIndex!==null)replaceNotes(notesFor(activeIndex,joystickVariant(x,y)))}
function resetJoystick(){lastXY={x:0,y:0};$('stick').style.transform='translate(0, 0)';$('joystick-readout').textContent='x 0.00 · y 0.00'}
function setupJoystick(){let dragging=false;const j=$('joystick');j.addEventListener('pointerdown',e=>{dragging=true;j.setPointerCapture(e.pointerId);updateJoystick(e)});j.addEventListener('pointermove',e=>{if(dragging)updateJoystick(e)});['pointerup','pointercancel'].forEach(type=>j.addEventListener(type,()=>{dragging=false;if(activeIndex!==null)replaceNotes(notesFor(activeIndex,'base'));resetJoystick()}))}
async function toggleAudio(){if(!audio)audio=new AudioContext();await audio.resume();$('audio-status').textContent='Audio ready';$('audio-status').classList.add('live');$('audio-toggle').textContent='Preview enabled';log('Audio preview enabled')}
async function setupMIDI(){
  if(!navigator.requestMIDIAccess){log('Web MIDI is not available in this browser');return}
  try{
    midi=await navigator.requestMIDIAccess();
    const refresh=()=>{
      const select=$('midi-output');
      select.innerHTML='<option value="">No output selected</option>';
      [...midi.outputs.values()].forEach(o=>select.add(new Option(o.name,o.id)));
      $('midi-status').textContent=`${midi.outputs.size} MIDI output${midi.outputs.size===1?'':'s'}`;
    };
    midi.onstatechange=refresh;
    refresh();
    $('midi-output').onchange=e=>{
      output=midi.outputs.get(e.target.value)||null;
      if(output)log(`Selected MIDI output: ${output.name}`);
    };
  }catch(e){log(`MIDI permission failed: ${e.message}`)}
}
function panic(){if(active)release();for(const n of oscillators.keys())noteOff(n);send([0xb0|channel(),123,0]);log('Panic: all notes off')}
$('audio-toggle').onclick=toggleAudio;$('panic').onclick=panic;$('clear-log').onclick=()=>$('event-log').textContent='Ready.';window.addEventListener('blur',release);window.addEventListener('keydown',e=>{if(e.repeat)return;const i='asdfjkl'.indexOf(e.key.toLowerCase());if(i>=0)playChord(i)});window.addEventListener('keyup',e=>{if('asdfjkl'.includes(e.key.toLowerCase()))release()});setupChords();setupJoystick();setupMIDI();
