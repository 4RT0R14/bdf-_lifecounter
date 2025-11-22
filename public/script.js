const socket = io();
let roomCode = prompt("Enter room code:"); 
socket.emit('joinRoom', roomCode);

// Life / AP / Power
let life1=10, life2=10, ap1=10, ap2=10, power1=0, power2=0;

function updateDisplay(type,player){
  let el;
  switch(type){
    case 'life': el=document.getElementById(`life${player}`); el.textContent = player===1? life1:life2; break;
    case 'ap': el=document.getElementById(`ap${player}`); el.textContent = player===1? ap1:ap2; break;
    case 'power': el=document.getElementById(`power${player}`); el.textContent = player===1? power1:power2; break;
  }
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}

function sendState(){ 
  socket.emit('updateState', { roomCode, newState:{life1,life2,ap1,ap2,power1,power2} }); 
}

function changeLife(player,amount){ if(player===1) life1=Math.max(life1+amount,0); else life2=Math.max(life2+amount,0); updateDisplay('life',player); sendState(); removeHighlight(); }
function changeAP(player,amount){ if(player===1) ap1=Math.max(ap1+amount,0); else ap2=Math.max(ap2+amount,0); updateDisplay('ap',player); sendState(); removeHighlight(); }
function changePower(player,amount){ if(player===1) power1=Math.max(power1+amount,0); else power2=Math.max(power2+amount,0); updateDisplay('power',player); sendState(); removeHighlight(); }
function resetAP(player){ if(player===1) ap1=10; else ap2=10; updateDisplay('ap',player); sendState(); removeHighlight(); }
function resetAll(){ life1=life2=10; ap1=ap2=10; power1=power2=0; ['life','ap','power'].forEach(t=>[1,2].forEach(p=>updateDisplay(t,p))); sendState(); removeHighlight(); }

// Holdable buttons
function setupHoldableButton(buttonId,action){
  const btn = document.getElementById(buttonId);
  let interval;
  btn.addEventListener('mousedown',()=>{ action(); interval=setInterval(action,200); });
  btn.addEventListener('mouseup',()=>clearInterval(interval));
  btn.addEventListener('mouseleave',()=>clearInterval(interval));
  btn.addEventListener('touchstart',(e)=>{ e.preventDefault(); action(); interval=setInterval(action,200); },{passive:false});
  btn.addEventListener('touchend',()=>clearInterval(interval));
}

// Assign buttons
setupHoldableButton('life1Plus', ()=>changeLife(1,1));
setupHoldableButton('life1Minus', ()=>changeLife(1,-1));
setupHoldableButton('ap1Plus', ()=>changeAP(1,1));
setupHoldableButton('ap1Minus', ()=>changeAP(1,-1));
setupHoldableButton('power1Plus', ()=>changePower(1,1));
setupHoldableButton('power1Minus', ()=>changePower(1,-1));
setupHoldableButton('life2Plus', ()=>changeLife(2,1));
setupHoldableButton('life2Minus', ()=>changeLife(2,-1));
setupHoldableButton('ap2Plus', ()=>changeAP(2,1));
setupHoldableButton('ap2Minus', ()=>changeAP(2,-1));
setupHoldableButton('power2Plus', ()=>changePower(2,1));
setupHoldableButton('power2Minus', ()=>changePower(2,-1));

// Socket.IO listener for updates
socket.on('updateState',(state)=>{
  life1=state.life1; life2=state.life2;
  ap1=state.ap1; ap2=state.ap2;
  power1=state.power1; power2=state.power2;
  ['life','ap','power'].forEach(t=>[1,2].forEach(p=>updateDisplay(t,p)));
});

// Background rotation
const medias = Array.from(document.querySelectorAll('.bg-media'));
let lastIndex = 0;
setInterval(()=>{
  let nextIndex; do { nextIndex=Math.floor(Math.random()*medias.length); } while(nextIndex===lastIndex);
  medias[lastIndex].style.opacity=0;
  medias[nextIndex].style.opacity=1;
  lastIndex=nextIndex;
},10000);

// ---------- Random Start Player ----------
const randomStartBtn = document.getElementById('randomStartBtn');
const startMessage = document.getElementById('startMessage');
const diceAnim = document.getElementById('diceAnim');

randomStartBtn.addEventListener('click', () => {
  let flashCount = 0;
  const maxFlashes = 6; // total flashes
  let currentFlash = 1;

  // Show dice GIF
  diceAnim.style.display = 'inline-block';
  startMessage.textContent = 'Rolling... 🎲';

  const flashInterval = setInterval(() => {
    highlightFirstPlayer(currentFlash);
    currentFlash = currentFlash === 1 ? 2 : 1; // alternate
    flashCount++;
  }, 200);

  setTimeout(() => {
    clearInterval(flashInterval);

    // Pick actual random player
    const firstPlayer = Math.random() < 0.5 ? 1 : 2;

    // Hide dice GIF
    diceAnim.style.display = 'none';

    // Emit to server
    socket.emit('randomStart', { roomCode, firstPlayer });
  }, maxFlashes * 200);
});

// Receive broadcast
socket.on('randomStart', ({ firstPlayer }) => {
  startMessage.textContent = `Player ${firstPlayer} starts first! 🎲`;
  highlightFirstPlayer(firstPlayer);
});

