function getCombatStats(entity){
  const stage = getEvolutionStage(entity.level); const mult = getEvolutionMult(stage);
  let atk = (entity.animal.baseAtk + (entity.level-1)*2) * mult.atk;
  let hp = (entity.animal.baseHp + (entity.level-1)*5) * mult.hp;
  let def = (entity.animal.baseDef + (entity.level-1)*1) * mult.def;
  for(const skill of entity.skills || []){
    if(!skill) continue;
    if(skill.id === 'vitalite') hp *= 1.2 + 0.05*(skill.level-1);
  }
  return {atk: Math.round(atk), hp: Math.round(hp), def: Math.round(def)};
}

function calcDamageInCombat(attacker, defender, multiplier){
  multiplier = multiplier || 1;
  const aStats = getCombatStats(attacker); const dStats = getCombatStats(defender);
  let dmg = Math.max(1, aStats.atk - dStats.def * 0.5);
  dmg = dmg * (0.85 + Math.random()*0.3) * multiplier;
  const elemMult = getElementMultiplier(getElementOf(attacker.animal.id), getElementOf(defender.animal.id));
  dmg *= elemMult;
  for(const skill of attacker.skills || []){
    if(!skill) continue;
    if(skill.id === 'execution' && defender.hp < defender.maxHp * 0.3) dmg *= 1.5 + 0.15*(skill.level-1);
  }
  for(const skill of defender.skills || []){
    if(!skill) continue;
    if(skill.id === 'armure') dmg *= 1 - (0.2 + 0.05*(skill.level-1));
  }
  return {dmg: Math.max(1, Math.round(dmg)), elemMult};
}

function generateOpponent(myPower){
  const roll = Math.random(); let factor;
  if(roll < 0.03) factor = 1.05 + Math.random() * 0.15;
  else if(roll < 0.15) factor = 0.92 + Math.random() * 0.10;
  else if(roll < 0.50) factor = 0.78 + Math.random() * 0.12;
  else factor = 0.62 + Math.random() * 0.15;
  const targetPower = myPower * factor; const targetPerAnimal = targetPower / 3;
  const oppTrophy = Math.max(0, state.trophies + Math.floor((Math.random()-0.5)*300)); const oppName = generateName();
  const maxZoneIdx = state.zoneUnlocked.legendaire?3:state.zoneUnlocked.montagne?2:state.zoneUnlocked.ocean?1:0;
  const zonePool = ['foret','ocean','montagne','legendaire'].slice(0,maxZoneIdx+1); const team = [];
  for(let i=0;i<3;i++){
    const zone = zonePool[Math.floor(Math.random()*zonePool.length)];
    let pool = ANIMALS.filter(a=>a.zone===zone);
    const fitting = pool.filter(a => animalPower(a,1) <= targetPerAnimal * 1.15);
    if(fitting.length > 0) pool = fitting;
    const animal = pool[Math.floor(Math.random()*pool.length)]; const basePower = animalPower(animal,1);
    let level = 1; if(targetPerAnimal > basePower) level = Math.round(1 + (targetPerAnimal - basePower) / 7);
    level = Math.max(1, Math.min(zooCap(), level)); team.push({animal, level});
  }
  return {name:oppName, trophy:oppTrophy, team};
}

function startArena(){
  if(state.arenaTeam.length!==3) return;
  combatSpeed = 1;
  const myPower = state.arenaTeam.reduce((s,id)=>s+animalPower(ANIMAL_MAP[id],state.animals[id].level),0);
  const opp = generateOpponent(myPower);
  const playerTeam = state.arenaTeam.map(id=>{
    const st = state.animals[id];
    return { animal: ANIMAL_MAP[id], level: st.level, specialLvl: st.specialLvl, skills: st.skills.map(s=>s?{...s}:null), hp: 0, maxHp: 0, specialUsed: false, defending: false };
  });
  playerTeam.forEach(p=>{ const stats = getCombatStats(p); p.hp = stats.hp; p.maxHp = stats.hp; });
  const enemyTeam = opp.team.map(t=>{
    const e = { animal: t.animal, level: t.level, specialLvl: Math.floor(Math.random()*4), skills: [null,null], hp: 0, maxHp: 0, specialUsed: false, defending: false };
    const stats = getCombatStats(e); e.hp = stats.hp; e.maxHp = stats.hp;
    return e;
  });
  combat = { player: playerTeam, enemy: enemyTeam, oppName: opp.name, oppTrophy: opp.trophy, log: [], over: false, win: false, playerIdx: 0, enemyIdx: 0, autoMode: false, waitingForPlayer: false, turnCount: 0 };
  renderCombat(); setTimeout(()=>combatStep(), 400);
}

function startBossFight(chapIndex, type, sbireIndex = 0){
  if(state.arenaTeam.length !== 3) return;
  const chapter = BOSS_CHAPTERS[chapIndex];
  if(!chapter) return;
  combatSpeed = 1;
  
  const playerTeam = state.arenaTeam.map(id=>{
    const st = state.animals[id];
    return { animal: ANIMAL_MAP[id], level: st.level, specialLvl: st.specialLvl, skills: st.skills.map(s=>s?{...s}:null), hp: 0, maxHp: 0, specialUsed: false, defending: false };
  });
  playerTeam.forEach(p=>{ const stats = getCombatStats(p); p.hp = stats.hp; p.maxHp = stats.hp; });

  let enemyName, enemyEmoji, enemyLvl, enemyHpMult, enemyAtkMult, rewards;

  if(type === 'sbire'){
    const sbire = chapter.sbires[sbireIndex];
    enemyName = sbire.name; enemyEmoji = sbire.emoji; enemyLvl = sbire.lvl; 
    enemyHpMult = sbire.hpMult; enemyAtkMult = sbire.atkMult;
    rewards = { trophy: 10, coins: sbire.rewardCoins, gems: sbire.rewardGems }; 
  } else {
    enemyName = chapter.bossName; enemyEmoji = chapter.bossEmoji; enemyLvl = chapter.boss.lvl;
    enemyHpMult = chapter.boss.hpMult; enemyAtkMult = chapter.boss.atkMult;
    rewards = { trophy: chapter.boss.trophy, coins: chapter.boss.coins, gems: chapter.boss.gems }; 
  }

  const bossAnimal = { id: 'boss_'+chapIndex, name: enemyName, emoji: enemyEmoji, baseAtk: 15, baseHp: 200, baseDef: 10, special:{name:'Fureur', effect:'power'}, rarity:'mythique' };
  const e = { animal: bossAnimal, level: enemyLvl, specialLvl: type==='boss'?3:1, skills: [null,null], hp: 0, maxHp: 0, specialUsed: false, defending: false };
  const stats = getCombatStats(e); 
  e.hp = Math.round(stats.hp * enemyHpMult); 
  e.maxHp = e.hp;
  e.animal.baseAtk = Math.round(stats.atk * enemyAtkMult);

  combat = { 
    player: playerTeam, enemy: [e], 
    oppName: enemyName, oppTrophy: state.trophies + rewards.trophy, 
    log: [`⚔️ ${enemyEmoji} ${enemyName} apparaît !`], 
    over: false, win: false, playerIdx: 0, enemyIdx: 0, 
    autoMode: false, waitingForPlayer: false, turnCount: 0,
    isBoss: true, bossRewards: rewards, bossChapter: chapIndex, bossType: type, bossSbireIndex: sbireIndex
  };
  
  renderCombat(); 
  setTimeout(()=>combatStep(), 400);
}

function renderCombat(){
  const root = document.getElementById('combat-root'); root.classList.add('open');
  const c = combat;
  root.innerHTML = `<div class="combat-bg">
    <div class="combat-top">
      <div class="combat-trophy-display">🏆 ${state.trophies}</div>
      <div class="combat-center"><span class="combat-vs-label">VS</span><button class="combat-speed-btn ${combatSpeed>1?'active':''}" id="combat-speed-btn" onclick="toggleCombatSpeed()">⏩×${combatSpeed}</button></div>
      <div class="combat-trophy-display" style="color:var(--danger);border-color:rgba(231,76,60,.25);background:rgba(231,76,60,.1)">🏆 ${c.oppTrophy}</div>
    </div>
    <div class="combat-teams">
      <div class="team-col mine"><div class="team-col-header">Ton équipe</div>${c.player.map((a,i)=>{const e=ELEMENTS[getElementOf(a.animal.id)];return `<div class="combat-animal ${i===c.playerIdx?'active':''}" id="pa-${i}"><div class="combat-animal-emoji">${a.animal.emoji}</div><div class="combat-animal-info"><div class="combat-animal-name">${e.emoji} ${a.animal.name}</div><div class="combat-hp"><div class="combat-hp-fill" id="pa-hp-${i}" style="width:100%"></div></div><div class="combat-hp-text" id="pa-ht-${i}">${a.maxHp}/${a.maxHp}</div></div></div>`}).join('')}</div>
      <div class="team-col enemy"><div class="team-col-header">${c.oppName}</div>${c.enemy.map((a,i)=>{const e=ELEMENTS[getElementOf(a.animal.id)]||ELEMENTS['ombre'];return `<div class="combat-animal ${i===c.enemyIdx?'active':''}" id="ea-${i}"><div class="combat-animal-emoji">${a.animal.emoji}</div><div class="combat-animal-info"><div class="combat-animal-name">${e.emoji} ${a.animal.name}</div><div class="combat-hp"><div class="combat-hp-fill enemy" id="ea-hp-${i}" style="width:100%"></div></div><div class="combat-hp-text" id="ea-ht-${i}">${a.maxHp}/${a.maxHp}</div></div></div>`}).join('')}</div>
    </div>
    <div class="combat-log" id="combat-log"></div>
    <button class="combat-auto-toggle ${c.autoMode?'active':''}" id="auto-toggle" onclick="toggleAutoMode()">${c.autoMode?'⏸️ Mode auto · cliquer pour reprendre la main':'▶️ Mode manuel · cliquer pour automatiser'}</button>
    <div id="combat-action-area"></div>
  </div>`;
  updateCombatLog(); updateCombatHP(); updateCombatActions();
}

function updateCombatActions(){
  const area = document.getElementById('combat-action-area'); if(!area || !combat) return;
  if(combat.over || combat.autoMode || !combat.waitingForPlayer){ area.innerHTML = ''; return; }
  const p = combat.player[combat.playerIdx];
  if(!p || p.hp<=0){ area.innerHTML=''; return; }
  const canSpecial = p.specialLvl > 0 && !p.specialUsed;
  area.innerHTML = `<div class="combat-waiting-msg">👇 Choisis une action</div>
    <div class="combat-actions" style="grid-template-columns:repeat(3,1fr)">
      <button class="combat-action-btn attack" onclick="submitPlayerAction('attack')">⚔️ Attaque<small>Dégâts normaux</small></button>
      <button class="combat-action-btn special" ${canSpecial?'':'disabled'} onclick="submitPlayerAction('special')">⭐ Spéciale<small>${canSpecial?'Dégâts ×2':'Indispo'}</small></button>
      <button class="combat-action-btn defend" onclick="submitPlayerAction('defend')">🛡️ Défense<small>-50% dégâts</small></button>
    </div>`;
}

function toggleAutoMode(){
  if(!combat) return;
  combat.autoMode = !combat.autoMode;
  const btn = document.getElementById('auto-toggle');
  if(btn){ btn.classList.toggle('active', combat.autoMode); btn.textContent = combat.autoMode?'⏸️ Mode auto · cliquer pour reprendre la main':'▶️ Mode manuel · cliquer pour automatiser'; }
  if(combat.autoMode && combat.waitingForPlayer){
    if(pendingPlayerActionResolver){ const r = pendingPlayerActionResolver; pendingPlayerActionResolver = null; combat.waitingForPlayer = false; r('auto'); }
  }
  updateCombatActions(); playClick();
}

function toggleCombatSpeed(){
  combatSpeed = combatSpeed===1?2:1;
  const btn = document.getElementById('combat-speed-btn');
  if(btn){ btn.textContent = '⏩×'+combatSpeed; btn.classList.toggle('active',combatSpeed>1); }
  playClick();
}

function updateCombatLog(){
  const logEl = document.getElementById('combat-log'); if(!logEl) return;
  logEl.innerHTML = combat.log.slice(-15).map(l=>`<div>${l}</div>`).join('');
  logEl.scrollTop = logEl.scrollHeight;
}

function updateCombatHP(){
  for(let i=0;i<3;i++){
    const pEl = document.getElementById('pa-hp-'+i); const ptEl = document.getElementById('pa-ht-'+i);
    if(pEl) pEl.style.width = Math.max(0,(combat.player[i].hp/combat.player[i].maxHp)*100)+'%';
    if(ptEl) ptEl.textContent = Math.max(0,combat.player[i].hp)+'/'+combat.player[i].maxHp;
    const eEl = document.getElementById('ea-hp-'+i); const etEl = document.getElementById('ea-ht-'+i);
    if(eEl) eEl.style.width = Math.max(0,(combat.enemy[i].hp/combat.enemy[i].maxHp)*100)+'%';
    if(etEl) etEl.textContent = Math.max(0,combat.enemy[i].hp)+'/'+combat.enemy[i].maxHp;
    const pCard = document.getElementById('pa-'+i);
    if(pCard){ pCard.classList.toggle('active',i===combat.playerIdx && combat.player[i].hp>0); pCard.classList.toggle('dead',combat.player[i].hp<=0); }
    const eCard = document.getElementById('ea-'+i);
    if(eCard){ eCard.classList.toggle('active',i===combat.enemyIdx && combat.enemy[i].hp>0); eCard.classList.toggle('dead',combat.enemy[i].hp<=0); }
  }
}

function nextAlive(team, from){ for(let i=from+1;i<3;i++) if(team[i].hp>0) return i; return -1; }
function sleep(ms){ return new Promise(r=>setTimeout(r, ms/combatSpeed)); }

function waitForPlayerInput(){
  return new Promise(resolve => {
    pendingPlayerActionResolver = resolve;
    combat.waitingForPlayer = true;
    updateCombatActions();
  });
}

function submitPlayerAction(action){
  if(!pendingPlayerActionResolver) return;
  const r = pendingPlayerActionResolver;
  pendingPlayerActionResolver = null; combat.waitingForPlayer = false;
  updateCombatActions(); r(action);
}

async function combatStep(){
  if(!combat || combat.over) return;
  const c = combat;
  let p = c.player[c.playerIdx];
  if(p.hp<=0){ const n = nextAlive(c.player,c.playerIdx); if(n<0) return endCombat(false); c.playerIdx = n; p = c.player[c.playerIdx]; }
  let e = c.enemy[c.enemyIdx];
  if(e.hp<=0){ const n = nextAlive(c.enemy,c.enemyIdx); if(n<0) return endCombat(true); c.enemyIdx = n; e = c.enemy[c.enemyIdx]; }
  updateCombatHP(); c.turnCount++;

  let action;
  if(c.autoMode){
    if(p.specialLvl > 0 && !p.specialUsed && (p.hp < p.maxHp * 0.5 || Math.random() < 0.4)){ action = 'special'; } 
    else { action = 'attack'; }
  } else {
    action = await waitForPlayerInput();
    if(!combat || combat.over) return;
  }

  if(action === 'attack'){
    const {dmg, elemMult} = calcDamageInCombat(p, e, 1);
    e.hp -= dmg;
    const elemTag = elemMult > 1 ? ' <span class="elem" style="color:#2ecc71">SUPER !</span>' : (elemMult < 1 ? ' <span class="elem" style="color:#e74c3c">résisté</span>' : '');
    c.log.push(`⚔️ ${p.animal.name} : <span class="dmg">${dmg}</span> dégâts${elemTag}`);
  } else if(action === 'special'){
    if(p.specialLvl === 0 || p.specialUsed) {
      const {dmg} = calcDamageInCombat(p, e, 1); e.hp -= dmg;
      c.log.push(`⚔️ ${p.animal.name} (fallback) : <span class="dmg">${dmg}</span>`);
    } else {
      p.specialUsed = true;
      const specMult = p.animal.special.effect === 'lifesteal' ? 1.5 : 2;
      const levelBonus = 1 + (p.specialLvl-1)*0.15;
      const {dmg} = calcDamageInCombat(p, e, specMult * levelBonus); e.hp -= dmg;
      if(p.animal.special.effect === 'lifesteal'){
        const heal = Math.round(dmg * 0.5); p.hp = Math.min(p.maxHp, p.hp + heal);
        c.log.push(`<span class="spec">⭐ ${p.animal.name} · ${p.animal.special.name} ! <span class="dmg">${dmg}</span> dégâts, +${heal} PV</span>`);
      } else {
        c.log.push(`<span class="spec">⭐ ${p.animal.name} · ${p.animal.special.name} ! <span class="dmg">${dmg}</span> dégâts</span>`);
      }
    }
  } else if(action === 'defend'){
    p.defending = true; c.log.push(`🛡️ ${p.animal.name} se défend`);
  }

  const pCard = document.getElementById('pa-'+c.playerIdx);
  if(pCard){ pCard.classList.add('attacking'); setTimeout(()=>pCard.classList.remove('attacking'), 300/combatSpeed); }
  updateCombatHP(); updateCombatLog();

  for(const skill of p.skills || []){
    if(skill && skill.id === 'regen' && p.hp > 0){
      const heal = Math.round(p.maxHp * (0.05 + 0.02*(skill.level-1)));
      p.hp = Math.min(p.maxHp, p.hp + heal);
    }
  }

  if(e.hp<=0){
    c.log.push(`💀 ${e.animal.name} vaincu !`); updateCombatLog();
    const n = nextAlive(c.enemy, c.enemyIdx);
    if(n < 0) { await sleep(400); return endCombat(true); }
    c.enemyIdx = n;
  }

  await sleep(700); if(!combat || combat.over) return;

  const e2 = c.enemy[c.enemyIdx];
  if(e2.hp > 0){
    const useSpecial = e2.specialLvl > 0 && !e2.specialUsed && Math.random() < 0.5;
    let dmg;
    if(useSpecial){
      e2.specialUsed = true;
      const specMult = e2.animal.special.effect === 'lifesteal' ? 1.5 : 2;
      const lb = 1 + (e2.specialLvl-1)*0.15;
      const r = calcDamageInCombat(e2, p, specMult * lb); dmg = r.dmg;
      if(e2.animal.special.effect === 'lifesteal'){
        const heal = Math.round(dmg*0.5); e2.hp = Math.min(e2.maxHp, e2.hp + heal);
        c.log.push(`<span class="spec">⭐ ${e2.animal.name} · ${e2.animal.special.name} ! <span class="dmg">${dmg}</span> dégâts, +${heal} PV</span>`);
      } else {
        c.log.push(`<span class="spec">⭐ ${e2.animal.name} · ${e2.animal.special.name} ! <span class="dmg">${dmg}</span> dégâts</span>`);
      }
    } else {
      const r = calcDamageInCombat(e2, p, 1); dmg = r.dmg;
      const elemTag = r.elemMult > 1 ? ' <span class="elem" style="color:#2ecc71">SUPER !</span>' : (r.elemMult < 1 ? ' <span class="elem" style="color:#e74c3c">résisté</span>' : '');
      c.log.push(`⚔️ ${e2.animal.name} : <span class="dmg">${dmg}</span> dégâts${elemTag}`);
    }
    if(p.defending){ dmg = Math.round(dmg * 0.5); c.log.push(`🛡️ ${p.animal.name} bloque, -50%`); }
    p.hp -= dmg;
    if(p.hp <= 0){ c.log.push(`💀 ${p.animal.name} vaincu !`); }
    const eCard = document.getElementById('ea-'+c.enemyIdx);
    if(eCard){ eCard.classList.add('attacking'); setTimeout(()=>eCard.classList.remove('attacking'), 300/combatSpeed); }
  }

  p.defending = false; updateCombatHP(); updateCombatLog();
  if(p.hp <= 0){
    const n = nextAlive(c.player, c.playerIdx);
    if(n < 0){ await sleep(400); return endCombat(false); }
    c.playerIdx = n;
  }
  await sleep(700); if(!combat || combat.over) return;
  combatStep();
}

function endCombat(win){
  if(!combat || combat.over) return;
  combat.over = true; combat.win = win;
  const c = combat;

  // --- GESTION DE LA VICTOIRE CONTRE UN SBIRES / BOSS ---
  if(c.isBoss){
    const rewards = c.bossRewards;
    if(win){
      state.coins += rewards.coins;
      state.gems += rewards.gems;
      state.trophies += rewards.trophy;
      
      if(c.bossType === 'sbire'){
        if(state.bossProgress[c.bossChapter] === c.bossSbireIndex){
          state.bossProgress[c.bossChapter]++;
        }
      } else if(c.bossType === 'boss'){
        // NOUVEAU : Enregistrer les animaux qui ont battu le boss
        if(!state.bossVeterans[c.bossChapter]) state.bossVeterans[c.bossChapter] = [];
        c.player.forEach(p => {
          if(!state.bossVeterans[c.bossChapter].includes(p.animal.id)) {
            state.bossVeterans[c.bossChapter].push(p.animal.id);
          }
        });
      }
      
      c.log.push(`<span class="win">🏆 VAINCU ! +${rewards.coins} 🪙 · +${rewards.gems} 💎 · +${rewards.trophy} 🏆</span>`);
      playWin();
    } else {
      c.log.push(`<span class="lose">💀 Vous avez été vaincu...</span>`);
      playLose();
    }
    save(); render();
    c.resultData = { win, trophyChange: win ? rewards.trophy : 0, coinsEarned: win ? rewards.coins : 0, gemsEarned: win ? rewards.gems : 0 };
    updateCombatHP(); updateCombatLog();
    const autoBtn = document.getElementById('auto-toggle'); if(autoBtn) autoBtn.style.display = 'none';
    const area = document.getElementById('combat-action-area'); if(area) area.innerHTML = '';
    render(); setTimeout(showCombatResult, 500);
    return; 
  }

  // GAIN D'XP EN COMBAT (Arène normale)
  c.player.forEach(p => {
    const st = state.animals[p.animal.id];
    if(st) {
      const xpGain = win ? 40 : 15; // 40 XP si victoire, 15 si défaite
      st.xp += xpGain;
      let leveledUp = false;
      while(st.xp >= xpForLevel(st.level) && st.level < MAX_ANIMAL_LEVEL) {
        st.xp -= xpForLevel(st.level);
        st.level++;
        leveledUp = true;
      }
      if(leveledUp) showToast(`⭐ ${p.animal.name} a gagné un niveau en combat !`, 'evolve');
    }
  });

  const playerHpLeft = c.player.reduce((s,a)=>s+Math.max(0,a.hp),0);
  const enemyHpLeft = c.enemy.reduce((s,a)=>s+Math.max(0,a.hp),0);
  const totalPlayerHp = c.player.reduce((s,a)=>s+a.maxHp,0);
  const totalEnemyHp = c.enemy.reduce((s,a)=>s+a.maxHp,0);
  const margin = (playerHpLeft/totalPlayerHp) - (enemyHpLeft/totalEnemyHp);
  let trophyChange = 0, coinsEarned = 0, gemsEarned = 0;
  
  if(win){
    const base = 5 + Math.round(Math.max(0,margin)*5); trophyChange = Math.min(10,Math.max(5,base));
    coinsEarned = 200 + Math.floor(Math.random()*200) + state.zooLevel*50;
    for(const p of c.player){ for(const skill of p.skills || []){ if(skill && skill.id === 'butin') coinsEarned = Math.round(coinsEarned * (1.1 + 0.05*(skill.level-1))); } }
    if(Math.random()<0.5) gemsEarned = 1 + Math.floor(Math.random()*2);
    state.stats.arenaWins++; state.trophies += trophyChange; state.coins += coinsEarned; state.gems += gemsEarned;
    c.log.push(`<span class="win">🎉 VICTOIRE ! +${trophyChange} 🏆 · +${coinsEarned} 🪙${gemsEarned>0?' · +'+gemsEarned+' 💎':''}</span>`);
    playWin();
  } else {
    const base = 3 + Math.round(Math.max(0,-margin)*6); trophyChange = -Math.min(9,Math.max(3,base));
    coinsEarned = 50 + Math.floor(Math.random()*50); state.stats.arenaLosses++;
    state.trophies = Math.max(0,state.trophies+trophyChange); state.coins += coinsEarned;
    c.log.push(`<span class="lose">💔 DÉFAITE · ${trophyChange} 🏆 · +${coinsEarned} 🪙</span>`);
    playLose();
  }
  
  c.resultData = { win, trophyChange, coinsEarned, gemsEarned };
  state.arenaHistory.push({win, oppName:c.oppName, trophyChange, ts:Date.now()});
  if(state.arenaHistory.length>20) state.arenaHistory.shift();
  checkZoneUnlocks(); checkLeagueRewards();
  save(); updateCombatHP(); updateCombatLog();
  
  const autoBtn = document.getElementById('auto-toggle'); if(autoBtn) autoBtn.style.display = 'none';
  const area = document.getElementById('combat-action-area'); if(area) area.innerHTML = '';
  render(); setTimeout(showCombatResult, 500);
}

function showCombatResult(){
  const c = combat; if(!c || !c.resultData) return;
  const { win, trophyChange, coinsEarned, gemsEarned } = c.resultData;
  let rewardsHtml = '';
  if(coinsEarned > 0) rewardsHtml += `<div class="result-reward-row"><span>🪙 Pièces</span><span>+${coinsEarned}</span></div>`;
  if(gemsEarned > 0) rewardsHtml += `<div class="result-reward-row"><span>💎 Gemmes</span><span>+${gemsEarned}</span></div>`;
  if(!rewardsHtml) rewardsHtml = `<div class="result-reward-row"><span>Aucune récompense</span><span>—</span></div>`;
  const trophyText = trophyChange > 0 ? '+'+trophyChange : String(trophyChange);
  const trophyClass = trophyChange > 0 ? 'positive' : 'negative';
  const titleClass = win ? 'win' : 'lose'; const title = win ? (c.isBoss ? 'BOSS VAINCU' : 'VICTOIRE') : 'DÉFAITE'; const emoji = win ? '🏆' : '💔';
  const overlay = document.createElement('div'); overlay.className = 'combat-result-overlay';
  overlay.innerHTML = `<div class="result-content ${titleClass}">
    <div class="result-emoji">${emoji}</div>
    <div class="result-title ${titleClass}">${title}</div>
    <div class="result-trophy ${trophyClass}">${trophyText} 🏆</div>
    <div class="result-rewards">${rewardsHtml}</div>
    <button class="result-btn" onclick="this.closest('.combat-result-overlay').remove();closeCombat();">Continuer</button>
  </div>`;
  document.body.appendChild(overlay);
  if(win && navigator.vibrate){ try{ navigator.vibrate([40,30,100,30,40]); }catch(e){} }
}

function closeCombat(){
  document.querySelectorAll('.combat-result-overlay').forEach(el=>el.remove());
  combat = null;
  document.getElementById('combat-root').classList.remove('open'); document.getElementById('combat-root').innerHTML = '';
  render(); playClick();
}
