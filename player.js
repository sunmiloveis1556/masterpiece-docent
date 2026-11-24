(function(){
const W=window.WORK, CUES=W.cues;
const $=id=>document.getElementById(id);
const au=$('au'),cap=$('capText'),play=$('play'),ic=$('ic'),pg=$('pg'),tm=$('tm');
const spans=[...document.querySelectorAll('#body .s')];
const PLAY='<path d="M7 4.5v15l13-7.5z"/>',PAUSE='<path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/>';
const IDLE='아래 재생 버튼을 누르면 작품 해설을 들을 수 있습니다.';
let useTTS=!W.audio, ttsIdx=0, ttsOn=false, rate=1, cur=-2;
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function setIcon(on){ic.innerHTML=on?PAUSE:PLAY;play.setAttribute('aria-label',on?'일시정지':'해설 듣기')}
function show(i,scroll){
  cap.textContent=i>=0?CUES[i].text:IDLE;
  spans.forEach(s=>s.classList.toggle('on',+s.dataset.i===i));
  const on=spans.find(s=>+s.dataset.i===i);
  if(on&&scroll){const r=on.getBoundingClientRect();if(r.top<200||r.bottom>innerHeight-140)window.scrollBy({top:r.top-innerHeight*0.45,behavior:'smooth'})}
}
if(au){
  au.addEventListener('timeupdate',()=>{
    const t=au.currentTime,d=au.duration||0;
    if(d)pg.style.width=(t/d*100)+'%'; tm.textContent=fmt(t)+' / '+fmt(d);
    const i=CUES.findIndex(c=>t>=c.start&&t<c.end+0.35); if(i!==cur){cur=i;show(i,!au.paused)}
  });
  au.addEventListener('loadedmetadata',()=>tm.textContent='0:00 / '+fmt(au.duration));
  au.addEventListener('play',()=>setIcon(true));au.addEventListener('pause',()=>setIcon(false));
  au.addEventListener('ended',()=>{setIcon(false);cur=-2;show(-1);done()});
  au.addEventListener('error',()=>{useTTS=true;tm.textContent=''});
}else{tm.textContent=''}
function pickVoice(u){const v=speechSynthesis.getVoices().filter(v=>/^ko/i.test(v.lang));if(v.length)u.voice=v.find(x=>/female|yuna|heami|sunhi|google/i.test(x.name))||v[0]}
function done(){cap.textContent='해설이 끝났습니다.';if(W.next){const a=document.createElement('a');a.className='nextgo';a.href=W.next;a.textContent='다음: '+W.nextTitle+' →';cap.appendChild(document.createElement('br'));cap.appendChild(a)}}
function ttsSpeak(){
  if(ttsIdx>=CUES.length){ttsOn=false;setIcon(false);ttsIdx=0;show(-1);done();return}
  const u=new SpeechSynthesisUtterance(CUES[ttsIdx].say||CUES[ttsIdx].text);u.lang='ko-KR';u.rate=rate;pickVoice(u);
  show(ttsIdx,true);pg.style.width=((ttsIdx+1)/CUES.length*100)+'%';
  u.onend=()=>{if(ttsOn){ttsIdx++;ttsSpeak()}};speechSynthesis.speak(u);
}
play.onclick=()=>{
  if(useTTS){
    if(!('speechSynthesis' in window)){cap.textContent='이 기기에서는 음성 재생을 지원하지 않습니다. 아래 글을 읽어 주세요.';return}
    if(ttsOn){ttsOn=false;speechSynthesis.cancel();setIcon(false)}else{ttsOn=true;setIcon(true);ttsSpeak()}
    return;
  }
  au.paused?au.play().catch(()=>{useTTS=true;play.onclick()}):au.pause();
};
$('back').onclick=()=>{if(useTTS){ttsIdx=Math.max(0,ttsIdx-1);if(ttsOn){speechSynthesis.cancel();ttsSpeak()}}else au.currentTime=Math.max(0,au.currentTime-10)};
const rates=[1,1.25,0.85];let ri=0;
$('speed').onclick=e=>{ri=(ri+1)%rates.length;rate=rates[ri];if(au)au.playbackRate=rate;e.currentTarget.textContent='속도 '+(rate===1?'1.0':rate)+'×'};
$('big').onclick=e=>{const b=e.currentTarget,on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);document.documentElement.style.setProperty('--fs',on?'24px':'19px');try{localStorage.setItem('mp_big',on?'1':'')}catch(_){}};
try{if(localStorage.getItem('mp_big'))$('big').click()}catch(_){}
const mv=$('mv');if(mv&&$('replay'))$('replay').onclick=()=>{mv.currentTime=0;mv.play()};
spans.forEach(s=>s.addEventListener('click',()=>{const i=+s.dataset.i;if(useTTS){ttsIdx=i;speechSynthesis.cancel();ttsOn=true;setIcon(true);ttsSpeak()}else{au.currentTime=CUES[i].start;au.play()}}));
window.addEventListener('pagehide',()=>{try{speechSynthesis.cancel()}catch(_){}});
})();
