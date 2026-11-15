let audioCtx = null;
function initAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(audioCtx && audioCtx.state==='suspended') audioCtx.resume(); }
function playTone(freq,dur,type,vol,delay,slideTo){ if(!audioCtx) return; try{ const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(); osc.type=type||'sine'; const start=audioCtx.currentTime+(delay||0); osc.frequency.setValueAtTime(freq,start); if(slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo,start+dur); const safeVol=Math.max(0.0001,vol||0.1); gain.gain.setValueAtTime(0.0001,start); gain.gain.exponentialRampToValueAtTime(safeVol,start+0.01); gain.gain.exponentialRampToValueAtTime(0.0001,start+dur); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(start); osc.stop(start+dur+0.05); }catch(e){} }
function playBuy(){ initAudio(); playTone(880,0.08,'sine',0.07); playTone(1320,0.1,'sine',0.07,0.07); }
function playUpgrade(){ initAudio(); playTone(523,0.1,'triangle',0.09,0); playTone(659,0.1,'triangle',0.09,0.08); playTone(784,0.15,'triangle',0.09,0.16); playTone(1047,0.18,'triangle',0.09,0.24); }
function playWin(){ initAudio(); playTone(523,0.1,'square',0.06,0); playTone(659,0.1,'square',0.06,0.1); playTone(784,0.1,'square',0.06,0.2); playTone(1047,0.25,'square',0.08,0.3); }
function playLose(){ initAudio(); playTone(392,0.15,'sawtooth',0.07,0); playTone(311,0.15,'sawtooth',0.07,0.13); playTone(262,0.28,'sawtooth',0.07,0.26); }
function playFeed(){ initAudio(); playTone(660,0.07,'sine',0.05); }
function playLevelUp(){ initAudio(); playTone(784,0.09,'triangle',0.09,0); playTone(988,0.09,'triangle',0.09,0.08); playTone(1319,0.18,'triangle',0.09,0.16); }
function playEgg(){ initAudio(); playTone(440,0.12,'sine',0.07,0); playTone(660,0.12,'sine',0.07,0.12); playTone(880,0.35,'sine',0.09,0.24); }
function playShiny(){ initAudio(); playTone(1047,0.1,'sine',0.08,0); playTone(1319,0.1,'sine',0.08,0.1); playTone(1568,0.1,'sine',0.08,0.2); playTone(2093,0.3,'sine',0.1,0.3); }
function playClick(){ initAudio(); playTone(600,0.03,'sine',0.04); }
