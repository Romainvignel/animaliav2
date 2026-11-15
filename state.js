let isResetting = false;
const SAVE_KEY = 'animalia_v6_final';

let state = loadState();
let currentModalAnimalId = null, currentTeamSlot = null, combat = null, combatSpeed = 1, saveTimeout = null, lastTickTime = Date.now();
let lastRenderedTab = null;
let pendingPlayerActionResolver = null;
let cachedTop100 = null;

function defaultState(){
  return {
    coins:800, gems:20, trophies:0, zooLevel:1, zooUpgradeEnd:0,
    animals:{ lapin:{level:1,xp:0,specialLvl:0,owned:true,count:1,hasShiny:false,skills:[null,null]}, ecureuil:{level:1,xp:0,specialLvl:0,owned:true,count:1,hasShiny:false,skills:[null,null]}, grenouille:{level:1,xp:0,specialLvl:0,owned:true,count:1,hasShiny:false,skills:[null,null]} },
    zoneUnlocked:{foret:true,ocean:false,montagne:false,legendaire:false},
    arenaTeam:[], arenaHistory:[], leagueRewardsClaimed:{},
    bossProgress: { 0: 0, 1: 0, 2: 0, 3: 0 }, // <-- ICI (à l'intérieur de l'objet)
    bossVeterans: {}, // <-- ET ICI
    lastTick:Date.now(),
    stats:{totalFeeds:0,arenaWins:0,arenaLosses:0,eggsOpened:0,shinyFound:0,dupesSold:0},
    currentTab:'zoo'
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(SAVE_KEY); if(!raw) return defaultState();
    const s = JSON.parse(raw); const d = defaultState();
    const m = {...d,...s,animals:{...d.animals,...s.animals},zoneUnlocked:{...d.zoneUnlocked,...s.zoneUnlocked},stats:{...d.stats,...s.stats},leagueRewardsClaimed:{...d.leagueRewardsClaimed,...(s.leagueRewardsClaimed||{})}};
    for(const id in m.animals){
      const a = m.animals[id];
      if(typeof a.level!=='number') a.level=1;
      if(typeof a.xp!=='number') a.xp=0;
      if(typeof a.specialLvl!=='number') a.specialLvl=0;
      if(typeof a.count!=='number') a.count=1;
      if(typeof a.hasShiny!=='boolean') a.hasShiny=false;
      if(!Array.isArray(a.skills)) a.skills=[null,null];
      a.skills = a.skills.map(s => (s && SKILLS[s.id]) ? s : null);
    }
    return m;
  }catch(e){ return defaultState(); }
}
function save(){ clearTimeout(saveTimeout); saveTimeout = setTimeout(saveNow,250); }
function saveNow(){ if(isResetting) return; clearTimeout(saveTimeout); try{ localStorage.setItem(SAVE_KEY,JSON.stringify({...state,lastTick:Date.now()})); }catch(e){ console.warn('Save fail',e); } }

const ZOO_CAP_PER_LEVEL = 3, MAX_ZOO_LEVEL = 20, MAX_ANIMAL_LEVEL = 50, TOTAL_PLAYERS = 100000, TROPHY_K = 260.577;
function zooCap(){ return Math.min(MAX_ANIMAL_LEVEL, state.zooLevel*ZOO_CAP_PER_LEVEL); }
function isZooUpgrading(){ return state.zooUpgradeEnd > Date.now(); }
function zooUpgradeRemainingMs(){ return Math.max(0, state.zooUpgradeEnd - Date.now()); }
function zooUpgradeDuration(zooLevel){ if(zooLevel<=5) return 0; if(zooLevel<=10) return 60*60*1000; if(zooLevel<=15) return 120*60*1000; return 240*60*1000; }
function zooUpgradeCost(zooLevel){ return {coins: Math.round(500*Math.pow(1.5,zooLevel-1)), gems: Math.max(1,Math.floor(zooLevel/4))}; }
function xpForLevel(level){ return 15 + level*12; }
function getEvolutionStage(level){ if(level>=40) return 3; if(level>=20) return 2; return 1; }
function getEvolutionMult(stage){ if(stage===3) return {atk:2.0,def:2.0,hp:1.8}; if(stage===2) return {atk:1.5,def:1.5,hp:1.3}; return {atk:1,def:1,hp:1}; }
function animalStats(animal, level){
  const stage = getEvolutionStage(level); const mult = getEvolutionMult(stage);
  return { atk: Math.round((animal.baseAtk+(level-1)*2)*mult.atk), hp: Math.round((animal.baseHp+(level-1)*5)*mult.hp), def: Math.round((animal.baseDef+(level-1)*1)*mult.def) };
}
function animalPower(animal, level){ const s = animalStats(animal,level); return s.atk*2 + s.hp*0.3 + s.def*1.5; }
function getDisplayName(animal, level, hasShiny){ const stage = getEvolutionStage(level); let n = animal.name; if(stage===2) n += ' ⭐'; if(stage===3) n += ' 👑'; return n; }
function getElementOf(animalId){ return ANIMAL_ELEMENT[animalId] || 'nature'; }
function getElementMultiplier(atkElem, defElem){ if(atkElem === defElem) return 1.0; if(ELEM_BEATS[atkElem] === defElem) return 1.5; if(ELEM_BEATS[defElem] === atkElem) return 0.75; return 1.0; }
function ownedCount(){ return Object.values(state.animals).filter(a=>a.owned).length; }
function zoneOwnedCount(zone){ return ANIMALS.filter(a=>a.zone===zone && state.animals[a.id]?.owned).length; }
function countAtLevelInZone(zone, minLvl){ return ANIMALS.filter(a=>a.zone===zone && state.animals[a.id]?.owned && state.animals[a.id].level>=minLvl).length; }
function formatNum(n){ n=Math.floor(n); if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e4) return (n/1e3).toFixed(1)+'k'; return String(n); }
function formatDuration(ms){ if(ms<=0) return '0s'; const s = Math.ceil(ms/1000); if(s<60) return s+'s'; const m = Math.floor(s/60), sec = s%60; if(m<60) return m+'min'+(sec>0?' '+sec+'s':''); const h = Math.floor(m/60), min = m%60; return h+'h'+(min>0?' '+min+'min':''); }
function getLeague(trophies){ for(const l of LEAGUES) if(trophies>=l.min && trophies<=l.max) return l; return LEAGUES[0]; }
function calculateRank(trophies){ if(trophies >= 3000) return 1; if(trophies >= 2985) return 2; if(trophies >= 2965) return 3; const rank = Math.round(TOTAL_PLAYERS*Math.exp(-trophies/TROPHY_K)); return Math.max(4,Math.min(TOTAL_PLAYERS,rank)); }

function checkLeagueRewards(){
  const league = getLeague(state.trophies);
  if(state.leagueRewardsClaimed[league.name]) return;
  const reward = LEAGUE_REWARDS[league.name]; if(!reward) return;
  state.leagueRewardsClaimed[league.name] = true;
  state.coins += reward.coins; state.gems += reward.gems;
  save();
  setTimeout(()=>{ playLevelUp(); showToast(`🏆 Ligue ${league.name} ! +${formatNum(reward.coins)} 🪙 +${reward.gems} 💎`,'success'); },600);
}
function checkZoneUnlocks(){
  if(!state.zoneUnlocked.ocean && countAtLevelInZone('foret',3)>=3){ state.zoneUnlocked.ocean = true; playLevelUp(); setTimeout(()=>showToast('🌊 L\'Océan est débloqué !','success'),200); }
  if(!state.zoneUnlocked.montagne && state.zoneUnlocked.ocean && countAtLevelInZone('ocean',6)>=3){ state.zoneUnlocked.montagne = true; playLevelUp(); setTimeout(()=>showToast('🏔️ La Montagne est débloquée !','success'),200); }
  if(!state.zoneUnlocked.legendaire && state.zoneUnlocked.montagne && countAtLevelInZone('montagne',15)>=3 && state.trophies>=200){ state.zoneUnlocked.legendaire = true; playLevelUp(); setTimeout(()=>showToast('✨ Zone Légendaire débloquée !','success'),200); }
}

const RARITY_INCOME = { commun:0.5, rare:1, epique:1.5, legendaire:2, mythique:3 };
function computeIncomePerMin(){ let total = 0; for(const id in state.animals){ const a = state.animals[id]; if(!a.owned) continue; const animal = ANIMAL_MAP[id]; if(!animal) continue; total += a.level*(RARITY_INCOME[animal.rarity]||0.5); } return Math.round(total) + state.zooLevel*2; }
function applyOfflineProgress(){
  const now = Date.now(); const elapsed = Math.min((now-(state.lastTick||now))/1000,4*3600);
  if(elapsed<60) return;
  const earned = Math.floor(computeIncomePerMin()*(elapsed/60)*0.4);
  if(earned>0){ state.coins += earned; setTimeout(()=>showToast(`🌙 Hors-ligne : +${formatNum(earned)} 🪙`,'info'),600); }
}
function liveTick(){
  const now = Date.now(); const dt = (now-lastTickTime)/1000;
  if(dt<1 || dt>3600){ lastTickTime = now; return; }
  state.coins += (computeIncomePerMin()/60)*dt; lastTickTime = now;
  const coinEl = document.getElementById('coins'); if(coinEl) coinEl.textContent = formatNum(state.coins);
  if(state.zooUpgradeEnd>0 && state.zooUpgradeEnd<=now){
    state.zooUpgradeEnd = 0; state.zooLevel++; playUpgrade();
    setTimeout(()=>showToast(`🏞️ Zoo niveau ${state.zooLevel} !`,'success'),100);
    render(); save();
  }
  const timerEl = document.querySelector('.upgrade-timer');
  if(timerEl && isZooUpgrading()) timerEl.textContent = '⏳ ' + formatDuration(zooUpgradeRemainingMs()) + ' restantes';
}

function getTop100Players(){
  if(cachedTop100) return cachedTop100;
  const rnd = seededRnd(42); const list = []; const used = new Set();
  const specialNames = ['The King','Immortal','Eagle'];
  const specialTrophies = [3000,2985,2965];
  for(let rank = 1; rank <= 100; rank++){
    let name;
    if(rank <= 3){ name = specialNames[rank-1]; }
    else { let tries = 0; do{ name = generateName(rnd); tries++; }while(used.has(name) && tries<30); }
    used.add(name);
    const trophies = rank <= 3 ? specialTrophies[rank-1] : Math.round(TROPHY_K*Math.log(TOTAL_PLAYERS/rank));
    list.push({rank,name,trophies});
  }
  cachedTop100 = list; return list;
}
