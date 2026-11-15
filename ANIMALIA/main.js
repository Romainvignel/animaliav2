function switchTab(tab){ if(state.currentTab===tab) return; state.currentTab = tab; render(); save(); playClick(); }

const TAB_ORDER = ['zoo','arena','classement','collection','shop'];
let swipeStart = null;

function setupSwipe(){
  const content = document.getElementById('content');
  content.addEventListener('touchstart', e=>{
    if(e.touches.length!==1) return;
    swipeStart = {x:e.touches[0].clientX, y:e.touches[0].clientY, time:Date.now()};
  }, {passive:true});
  content.addEventListener('touchend', e=>{
    if(!swipeStart || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - swipeStart.x;
    const dy = e.changedTouches[0].clientY - swipeStart.y;
    const dt = Date.now() - swipeStart.time;
    swipeStart = null;
    if(dt>600) return;
    if(Math.abs(dx)<60) return;
    if(Math.abs(dy) > 30) return;
    if(document.querySelector('.modal-bg')) return;
    if(document.getElementById('combat-root').classList.contains('open')) return;
    const idx = TAB_ORDER.indexOf(state.currentTab);
    if(dx<0 && idx<TAB_ORDER.length-1) switchTab(TAB_ORDER[idx+1]);
    else if(dx>0 && idx>0) switchTab(TAB_ORDER[idx-1]);
  }, {passive:true});
}

function init(){
  initAudio();
  applyOfflineProgress();
  checkZoneUnlocks();
  if(state.zooUpgradeEnd > 0 && state.zooUpgradeEnd <= Date.now()){
    state.zooUpgradeEnd = 0; state.zooLevel++;
    setTimeout(()=>showToast(`🏞️ Zoo niveau ${state.zooLevel} !`,'success'), 800);
  }
  render();
  saveNow();
  lastTickTime = Date.now();
  document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click', ()=>switchTab(b.dataset.tab)));
  setupSwipe();
  document.addEventListener('touchstart', initAudio, {once:true, passive:true});
  document.addEventListener('click', initAudio, {once:true});
  document.addEventListener('keydown', initAudio, {once:true});
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) saveNow(); });
  window.addEventListener('beforeunload', saveNow);
  window.addEventListener('pagehide', saveNow);
  setInterval(liveTick, 1000);
  setInterval(saveNow, 5000);
}
init();
