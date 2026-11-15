const RARITIES = { commun:{name:'Commun',color:'#95a5a6',dropPct:60}, rare:{name:'Rare',color:'#3498db',dropPct:25}, epique:{name:'Épique',color:'#9b59b6',dropPct:12}, legendaire:{name:'Légendaire',color:'#f39c12',dropPct:2.5}, mythique:{name:'Mythique',color:'#e74c3c',dropPct:0.5} };
const RARITY_SELL = { commun:60, rare:150, epique:400, legendaire:1000, mythique:3000 };
const FOODS = { fruits:{name:'Fruits',emoji:'🍎',cost:25,xp:18}, insectes:{name:'Insectes',emoji:'🐛',cost:25,xp:18}, poissons:{name:'Poissons',emoji:'🐟',cost:25,xp:18}, plantes:{name:'Plantes',emoji:'🌿',cost:25,xp:18}, recette:{name:'Recette',emoji:'🍲',cost:120,xp:140,unlockLevel:10} };
const ZONES = {
  foret:{name:'Forêt',emoji:'🌲',color:'#2ecc71'},
  ocean:{name:'Océan',emoji:'🌊',color:'#3498db'},
  montagne:{name:'Montagne',emoji:'🏔️',color:'#95a5a6'},
  legendaire:{name:'Légendaire',emoji:'✨',color:'#b579d4'}
};
const LEAGUES = [
  {name:'Bronze II',min:0,max:49,color:'#cd7f32',icon:'🥉'},
  {name:'Bronze I',min:50,max:149,color:'#cd7f32',icon:'🥉'},
  {name:'Argent II',min:150,max:299,color:'#c0c0c0',icon:'🥈'},
  {name:'Argent I',min:300,max:499,color:'#c0c0c0',icon:'🥈'},
  {name:'Or II',min:500,max:799,color:'#ffd700',icon:'🥇'},
  {name:'Or I',min:800,max:1199,color:'#ffd700',icon:'🥇'},
  {name:'Platine III',min:1200,max:1699,color:'#5eead4',icon:'💎'},
  {name:'Platine II',min:1700,max:2299,color:'#5eead4',icon:'💎'},
  {name:'Platine I',min:2300,max:Infinity,color:'#a78bfa',icon:'👑'}
];
const LEAGUE_REWARDS = { 'Bronze I':{coins:300,gems:2},'Argent II':{coins:800,gems:3},'Argent I':{coins:2000,gems:5},'Or II':{coins:5000,gems:8},'Or I':{coins:10000,gems:12},'Platine III':{coins:20000,gems:18},'Platine II':{coins:35000,gems:25},'Platine I':{coins:60000,gems:40} };

const ELEMENTS = {
  feu:{name:'Feu',emoji:'🔥',color:'#e74c3c'},
  eau:{name:'Eau',emoji:'💧',color:'#3498db'},
  nature:{name:'Nature',emoji:'🌿',color:'#2ecc71'},
  foudre:{name:'Foudre',emoji:'⚡',color:'#f39c12'},
  ombre:{name:'Ombre',emoji:'🌑',color:'#9b59b6'}
};
const ELEM_BEATS = { feu:'nature', nature:'eau', eau:'foudre', foudre:'ombre', ombre:'feu' };

const ANIMAL_ELEMENT = {
  lapin:'nature',ecureuil:'nature',herisson:'nature',poussin:'foudre',grenouille:'eau',
  papillon:'nature',escargot:'eau',chenille:'nature',renard:'feu',cerf:'nature',
  sanglier:'nature',hibou:'ombre',blaireau:'nature',castor:'eau',raton:'nature',
  chauvesouris:'ombre',loup:'ombre',lynx:'feu',ours:'nature',aigle:'foudre',
  clown:'eau',crabe:'eau',crevette:'eau',coquillage:'eau',meduse:'eau',
  calamar:'ombre','poisson-globe':'eau',sardine:'eau',anguille:'foudre',tortue:'nature',
  loutre:'eau',phoque:'eau',requin:'eau',raie:'foudre',murene:'ombre',
  espadon:'eau',poulpe:'ombre',dauphin:'eau',orque:'eau',baleine:'eau',
  chevre:'nature',marmotte:'nature',mesange:'foudre',pika:'nature',bouquetin:'nature',
  chamois:'nature',renne:'nature',belette:'nature',yak:'nature',leopard:'feu',
  puma:'feu','loup-gris':'ombre',grizzly:'nature',condor:'foudre',taureau:'nature',
  'hibou-neige':'ombre',yeti:'feu','aigle-royal':'foudre','ours-brun':'nature',panthere:'ombre',
  dragon:'feu',phenix:'feu',licorne:'nature',griffon:'foudre',pegase:'foudre',
  'serpent-mer':'eau',kraken:'eau','loup-celeste':'ombre',kirin:'nature',kinkajou:'ombre'
};

const SKILLS = {
  armure:{emoji:'🛡️',name:'Armure',desc:'-20% dégâts subis'},
  regen:{emoji:'🌿',name:'Régénération',desc:'+5% PV/tour'},
  precision:{emoji:'🎯',name:'Précision',desc:'+10% critique'},
  execution:{emoji:'💀',name:'Exécution',desc:'+50% si cible < 30% PV'},
  vitalite:{emoji:'❤️',name:'Vitalité',desc:'+20% PV max'},
  butin:{emoji:'🎁',name:'Butin',desc:'+10% or en combat'}
};

function a(id,name,emoji,zone,rarity,atk,hp,def,food,specName,specEffect){
  return {id,name,emoji,zone,rarity,baseAtk:atk,baseHp:hp,baseDef:def,food,special:{name:specName,effect:specEffect,gemCost:rarity==='mythique'?150:(rarity==='legendaire'?30:10)}};
}

const ANIMALS = [
  a('lapin','Lapin','🐰','foret','commun',5,30,2,'plantes','Bond éclair','power'),
  a('ecureuil','Écureuil','🐿️','foret','commun',5,28,2,'fruits','Lancer de noix','power'),
  a('herisson','Hérisson','🦔','foret','commun',4,36,5,'insectes','Piquants','lifesteal'),
  a('poussin','Poussin','🐤','foret','commun',3,25,1,'insectes','Picpic','power'),
  a('grenouille','Grenouille','🐸','foret','commun',5,30,2,'insectes','Langue fouet','power'),
  a('papillon','Papillon','🦋','foret','commun',4,24,1,'plantes','Poudre étourdie','power'),
  a('escargot','Escargot','🐌','foret','commun',3,42,6,'plantes','Coquille blindée','lifesteal'),
  a('chenille','Chenille','🐛','foret','commun',3,28,2,'plantes','Soie collante','power'),
  a('renard','Renard','🦊','foret','rare',8,46,3,'fruits','Ruse','power'),
  a('cerf','Cerf','🦌','foret','rare',7,52,4,'plantes','Bois puissants','power'),
  a('sanglier','Sanglier','🐗','foret','rare',9,56,5,'plantes','Charge brutale','power'),
  a('hibou','Hibou','🦉','foret','rare',9,42,3,'insectes','Vision nocturne','power'),
  a('blaireau','Blaireau','🦡','foret','rare',8,50,4,'insectes','Creusage','lifesteal'),
  a('castor','Castor','🦫','foret','rare',7,46,5,'plantes','Barrage','lifesteal'),
  a('raton','Raton laveur','🦝','foret','rare',8,44,3,'fruits','Vol agile','power'),
  a('chauvesouris','Chauve-souris','🦇','foret','rare',10,36,2,'insectes','Écholocation','lifesteal'),
  a('loup','Loup','🐺','foret','epique',12,62,5,'poissons','Hurlement','power'),
  a('lynx','Lynx','🐆','foret','epique',13,58,4,'poissons','Griffes acérées','power'),
  a('ours','Ours','🐻','foret','epique',11,78,7,'fruits','Coup de patte','lifesteal'),
  a('aigle','Aigle','🦅','foret','epique',14,52,4,'poissons','Piqué','power'),
  a('clown','Poisson-clown','🐠','ocean','commun',5,30,2,'insectes','Nage rapide','power'),
  a('crabe','Crabe','🦀','ocean','commun',4,40,5,'poissons','Pinces','power'),
  a('crevette','Crevette','🦐','ocean','commun',4,28,2,'insectes','Bond','power'),
  a('coquillage','Coquillage','🐚','ocean','commun',3,46,6,'plantes','Coquille','lifesteal'),
  a('meduse','Méduse','🪼','ocean','commun',6,30,1,'poissons','Piqûre','power'),
  a('calamar','Calamar','🦑','ocean','commun',6,32,2,'poissons','Encre','power'),
  a('poisson-globe','Poisson-globe','🐡','ocean','commun',4,36,4,'poissons','Gonflement','lifesteal'),
  a('sardine','Sardine','🐟','ocean','commun',3,22,1,'insectes','Nuée','power'),
  a('anguille','Anguille','🐍','ocean','commun',6,28,2,'poissons','Décharge','power'),
  a('tortue','Tortue','🐢','ocean','rare',6,64,7,'plantes','Carapace','lifesteal'),
  a('loutre','Loutre','🦦','ocean','rare',8,46,3,'poissons','Jeu aquatique','power'),
  a('phoque','Phoque','🦭','ocean','rare',7,52,4,'poissons','Claquement','power'),
  a('requin','Requin','🦈','ocean','rare',11,52,3,'poissons','Morsure','power'),
  a('raie','Raie','🐠','ocean','rare',8,50,4,'poissons','Dard','power'),
  a('murene','Murène','🐍','ocean','rare',9,44,3,'poissons','Embuscade','lifesteal'),
  a('espadon','Espadon','🐟','ocean','rare',10,46,3,'poissons','Estoc','power'),
  a('poulpe','Poulpe','🐙','ocean','epique',12,62,4,'poissons','Huit tentacules','power'),
  a('dauphin','Dauphin','🐬','ocean','epique',13,56,4,'poissons','Sonar','power'),
  a('orque','Orque','🐋','ocean','epique',14,68,5,'poissons','Charge','power'),
  a('baleine','Baleine','🐳','ocean','epique',11,92,7,'poissons','Chant profond','lifesteal'),
  a('chevre','Chèvre','🐐','montagne','commun',5,34,3,'plantes','Cornes','power'),
  a('marmotte','Marmotte','🐹','montagne','commun',5,32,2,'plantes','Sifflement','power'),
  a('mesange','Mésange','🐦','montagne','commun',4,26,1,'insectes','Pépiement','power'),
  a('pika','Pika','🐭','montagne','commun',4,28,2,'plantes','Cachette','lifesteal'),
  a('bouquetin','Bouquetin','🐐','montagne','commun',6,40,4,'plantes','Cornes robustes','power'),
  a('chamois','Chamois','🦌','montagne','commun',6,36,3,'plantes','Agilité','power'),
  a('renne','Renne','🦌','montagne','commun',5,40,3,'plantes','Bois ramifiés','power'),
  a('belette','Belette','🦡','montagne','commun',7,30,2,'insectes','Souplesse','power'),
  a('yak','Yak','🐃','montagne','rare',9,60,5,'plantes','Charge lourde','power'),
  a('leopard','Léopard des neiges','🐆','montagne','rare',10,48,4,'poissons','Embuscade','power'),
  a('puma','Puma','🐆','montagne','rare',10,50,4,'fruits','Bond félin','power'),
  a('loup-gris','Loup gris','🐺','montagne','rare',9,52,5,'poissons','Meute','power'),
  a('grizzly','Grizzly','🐻','montagne','rare',10,62,6,'fruits','Griffes','lifesteal'),
  a('condor','Condor','🦅','montagne','rare',11,42,3,'poissons','Plongeon','power'),
  a('taureau','Taureau','🐂','montagne','rare',11,56,4,'plantes','Charge','power'),
  a('hibou-neige','Hibou des neiges','🦉','montagne','rare',9,46,4,'insectes','Vol silencieux','power'),
  a('yeti','Yéti','🐻','montagne','epique',12,74,7,'fruits','Coup glacé','power'),
  a('aigle-royal','Aigle royal','🦅','montagne','epique',14,58,4,'poissons','Piqué royal','power'),
  a('ours-brun','Ours brun','🐻','montagne','epique',12,84,8,'fruits','Étreinte','lifesteal'),
  a('panthere','Panthère des neiges','🐆','montagne','epique',15,62,5,'poissons','Griffes fantômes','power'),
  a('dragon','Dragon','🐉','legendaire','legendaire',20,105,10,'poissons','Souffle de feu','power'),
  a('phenix','Phénix','🔥','legendaire','legendaire',18,88,7,'fruits','Renaissance','lifesteal'),
  a('licorne','Licorne','🦄','legendaire','legendaire',16,92,8,'plantes','Corne magique','lifesteal'),
  a('griffon','Griffon','🦅','legendaire','legendaire',19,82,6,'poissons','Serres','power'),
  a('pegase','Pégase','🐴','legendaire','legendaire',17,88,7,'fruits','Ailes célestes','power'),
  a('serpent-mer','Serpent de mer','🐍','legendaire','legendaire',18,98,8,'poissons','Déferlante','lifesteal'),
  a('kraken','Kraken','🐙','legendaire','legendaire',20,115,9,'poissons','Tentacules','power'),
  a('loup-celeste','Loup céleste','🐺','legendaire','legendaire',19,92,7,'poissons','Hurlement lunaire','power'),
  a('kirin','Kirin','🦄','legendaire','legendaire',18,90,8,'plantes','Éclat sacré','lifesteal'),
  a('kinkajou','Kinkajou','🦝','legendaire','mythique',25,135,12,'fruits','Baiser du miel','lifesteal')
];
const ANIMAL_MAP = Object.fromEntries(ANIMALS.map(x=>[x.id,x]));

const NAME_PARTS = {
  firstNames:['Luna','Kai','Zara','Nova','Axel','Milo','Théo','Sacha','Yuki','Eliott','Ruby','Léo','Noa','Liam','Iris','Oscar','Léna','Hugo','Nina','Enzo','Aria','Finn','Léa','Max','Nora','Jules','Ella','Adam','Zoé','Manon','Tom','Inès','Elio','Mia','Rayan','Jade','Noah','Léonie','Aaron','Ambre','Tiago','Roméo','Chloé','Gaspard','Jeanne','Nathan','Malo','Lou','Alba','Soren','Nino'],
  adjectives:['Rusé','Brave','Vif','Sage','Sombre','Cosmique','Lunaire','Solaire','Sauvage','Éclatant','Silencieux','Féroce','Mystique','Ancien','Éternel','Sacré','Nocturne','Ardent','Glacé','Rouge','Argenté','Doré','Céleste','Fantôme'],
  nouns:['Ombre','Flamme','Vent','Lune','Soleil','Étoile','Roche','Rivière','Forêt','Montagne','Océan','Ciel','Aube','Crépuscule','Nuit','Lumière','Tempête','Cristal','Dragon','Phénix','Loup','Aigle','Tigre','Renard','Serpent','Sabre','Vortex','Écho','Aura','Prisme'],
  titles:['Maître','Champion','Gardien','Seigneur','Roi','Reine','Dresseur','Explorateur','Chasseur','Sage','Chevalier','Prince','Nomade','Chef','Vétéran','Légende','As','Pro','Elite','Éclaireur','Voyageur','Oracle','Prophète','Alpha','Ombre']
};
function generateName(rnd){
  rnd = rnd || Math.random;
  const styles = ['adj first','first num','title first','noun adj','first','title noun','noun first','first-noun','title first num'];
  const style = styles[Math.floor(rnd()*styles.length)];
  const first = NAME_PARTS.firstNames[Math.floor(rnd()*NAME_PARTS.firstNames.length)];
  const adj = NAME_PARTS.adjectives[Math.floor(rnd()*NAME_PARTS.adjectives.length)];
  const noun = NAME_PARTS.nouns[Math.floor(rnd()*NAME_PARTS.nouns.length)];
  const title = NAME_PARTS.titles[Math.floor(rnd()*NAME_PARTS.titles.length)];
  const num = Math.floor(rnd()*98)+1;
  switch(style){
    case 'adj first': return adj+' '+first;
    case 'first num': return first+' '+num;
    case 'title first': return title+' '+first;
    case 'noun adj': return noun+' '+adj;
    case 'first': return first;
    case 'title noun': return title+' '+noun;
    case 'noun first': return noun+' '+first;
    case 'first-noun': return first+'-'+noun;
    case 'title first num': return title+' '+first+' '+num;
    default: return first;
  }
}
function seededRnd(seed){ let s = seed % 2147483647; if(s<=0) s += 2147483646; return function(){ s = s*16807 % 2147483647; return (s-1)/2147483646; }; }

const EGG_DEFS = {
  commun:{cost:500,pools:{commun:80,rare:18,epique:2}},
  rare:{cost:2500,pools:{rare:70,epique:25,legendaire:5}},
  epique:{cost:10000,pools:{epique:65,legendaire:30,mythique:5}},
  legendaire:{cost:50000,pools:{legendaire:70,mythique:30}}
};
const SHINY_RATE = 0.05; // 5% de chance d'avoir un shiny

// ==========================================
// LES BOSS DU JEU
// ==========================================
// ==========================================
// LES SBIRES & BOSS DU JEU
// ==========================================
const BOSS_CHAPTERS = [
  {
    zone: 'foret', name: 'Chapitre 1 : Le Grand Chêne', bossEmoji: '🌳', bossName: 'Le Grand Chêne',
    sbires: [
      { name: 'Louveteau', emoji: '🐺', lvl: 5, hpMult: 1.5, atkMult: 1.0, rewardCoins: 500, rewardGems: 1 },
      { name: 'Garde Forestier', emoji: '🏹', lvl: 8, hpMult: 1.8, atkMult: 1.1, rewardCoins: 700, rewardGems: 1 },
      { name: 'Araignée Géante', emoji: '🕷️', lvl: 10, hpMult: 2.0, atkMult: 1.2, rewardCoins: 900, rewardGems: 1 },
      { name: 'Sanglier Alpha', emoji: '🐗', lvl: 12, hpMult: 2.2, atkMult: 1.3, rewardCoins: 1200, rewardGems: 1 },
      { name: 'Esprit de la Forêt', emoji: '🧚', lvl: 14, hpMult: 2.5, atkMult: 1.4, rewardCoins: 1500, rewardGems: 1 }
    ],
    boss: { lvl: 15, hpMult: 3.0, atkMult: 1.5, trophy: 30, coins: 3000, gems: 10 }
  },
  {
    zone: 'ocean', name: 'Chapitre 2 : Léviathan', bossEmoji: '🐋', bossName: 'Léviathan',
    sbires: [
      { name: 'Piranha', emoji: '🐟', lvl: 15, hpMult: 1.5, atkMult: 1.1, rewardCoins: 1000, rewardGems: 1 },
      { name: 'Sirène Noire', emoji: '🧜‍♀️', lvl: 20, hpMult: 2.0, atkMult: 1.2, rewardCoins: 1500, rewardGems: 1 },
      { name: 'Crabe Blindé', emoji: '🦀', lvl: 24, hpMult: 2.2, atkMult: 1.3, rewardCoins: 2000, rewardGems: 1 },
      { name: 'Kraken Juvénile', emoji: '🦑', lvl: 28, hpMult: 2.5, atkMult: 1.4, rewardCoins: 2500, rewardGems: 1 },
      { name: 'Gardien des Abysses', emoji: '🛡️', lvl: 32, hpMult: 2.8, atkMult: 1.5, rewardCoins: 3000, rewardGems: 1 }
    ],
    boss: { lvl: 35, hpMult: 3.5, atkMult: 1.8, trophy: 60, coins: 10000, gems: 25 }
  },
  {
    zone: 'montagne', name: 'Chapitre 3 : Le Colosse', bossEmoji: '🗿', bossName: 'Le Colosse',
    sbires: [
      { name: 'Chèvre des Neiges', emoji: '🐐', lvl: 36, hpMult: 1.5, atkMult: 1.2, rewardCoins: 3000, rewardGems: 1 },
      { name: 'Aigle des Cimes', emoji: '🦅', lvl: 40, hpMult: 2.0, atkMult: 1.3, rewardCoins: 4000, rewardGems: 1 },
      { name: 'Yéti Sauvage', emoji: '❄️', lvl: 44, hpMult: 2.5, atkMult: 1.4, rewardCoins: 5000, rewardGems: 1 },
      { name: 'Golem de Pierre', emoji: '🪨', lvl: 48, hpMult: 3.0, atkMult: 1.5, rewardCoins: 6000, rewardGems: 1 },
      { name: 'Bouquetin Démon', emoji: '🐏', lvl: 52, hpMult: 3.2, atkMult: 1.6, rewardCoins: 8000, rewardGems: 1 }
    ],
    boss: { lvl: 55, hpMult: 4.0, atkMult: 2.0, trophy: 100, coins: 30000, gems: 50 }
  },
  {
    zone: 'legendaire', name: 'Chapitre 4 : L\'Ombre', bossEmoji: '👤', bossName: 'L\'Ombre de Kinkajou',
    sbires: [
      { name: 'Ombres Mineures', emoji: '🌑', lvl: 50, hpMult: 2.0, atkMult: 1.5, rewardCoins: 5000, rewardGems: 1 },
      { name: 'Chevalier Noir', emoji: '⚔️', lvl: 55, hpMult: 2.5, atkMult: 1.8, rewardCoins: 7000, rewardGems: 1 },
      { name: 'Dragon Zombie', emoji: '🐲', lvl: 60, hpMult: 3.0, atkMult: 2.0, rewardCoins: 10000, rewardGems: 1 },
      { name: 'Ange Déchu', emoji: '🪶', lvl: 65, hpMult: 3.5, atkMult: 2.2, rewardCoins: 15000, rewardGems: 1 },
      { name: 'Écho du Néant', emoji: '🌀', lvl: 70, hpMult: 4.0, atkMult: 2.5, rewardCoins: 20000, rewardGems: 1 }
    ],
    boss: { lvl: 80, hpMult: 5.0, atkMult: 3.0, trophy: 200, coins: 100000, gems: 100 }
  }
];
