/* ============================================================
   KINDERJOY – script.js (3D UI edition, fully safe JS)
   ============================================================ */

/* ── State ── */
var currentEmotion = null;

/* ══ GAMIFICATION (XP & Streaks) ════════════ */
var currentXP = 0;
var currentStreak = 0;

function loadGamification() {
  currentXP = parseInt(localStorage.getItem('moodles_xp')) || 0;
  var lastDate = localStorage.getItem('moodles_last_date');
  currentStreak = parseInt(localStorage.getItem('moodles_streak')) || 0;

  var today = new Date().toDateString();
  if (lastDate !== today) {
    if (lastDate) {
      var last = new Date(lastDate);
      var diffDays = Math.floor((new Date() - last) / (1000*60*60*24));
      if (diffDays === 1) currentStreak += 1;
      else if (diffDays > 1) currentStreak = 1; 
    } else {
      currentStreak = 1;
    }
    localStorage.setItem('moodles_last_date', today);
    localStorage.setItem('moodles_streak', currentStreak);
  }
  updateGamificationUI();
}

function updateGamificationUI() {
  var xv = document.getElementById("xp-val");
  var xf = document.getElementById("xp-fill");
  if (xv) xv.textContent = currentXP + " XP";
  if (xf) {
    var levelProgress = currentXP % 100;
    xf.style.width = levelProgress + "%";
  }
}

function addXP(amount) {
  currentXP += amount;
  localStorage.setItem('moodles_xp', currentXP);
  updateGamificationUI();
  var xpFx = document.createElement("div");
  xpFx.className = "xp-floating-text";
  xpFx.innerText = "+" + amount + " XP";
  // Random position near top-right
  xpFx.style.top = (20 + Math.random() * 20) + "px";
  xpFx.style.right = (80 + Math.random() * 40) + "px";
  document.body.appendChild(xpFx);
  setTimeout(function() { xpFx.remove(); }, 1200);
}

/* ══ AMBIENT MUSIC (Web Audio) ═════════ */
var bgMusicCtx = null, bgGain = null, bgOscillators = [], isMusicPlaying = false;
var danceSequencer = null; // sequencer for rhythmic music

function toggleMusic() {
  if (isMusicPlaying) {
    stopMusic();
    document.getElementById("music-toggle").innerHTML = "🎵";
    document.getElementById("music-toggle").classList.remove("active");
  } else {
    playMusic();
    document.getElementById("music-toggle").innerHTML = "🎶";
    document.getElementById("music-toggle").classList.add("active");
  }
}
function playMusic() {
  if (isMusicPlaying) return; // Prevent multiple drones
  if (!bgMusicCtx) {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    bgMusicCtx = new AudioContext();
  }
  if (bgMusicCtx.state === 'suspended') bgMusicCtx.resume();
  bgGain = bgMusicCtx.createGain();
  bgGain.gain.value = 0;
  bgGain.connect(bgMusicCtx.destination);
  bgGain.gain.linearRampToValueAtTime(0.25, bgMusicCtx.currentTime + 1.5); // Louder and faster ramp

  var freqs = [196.00, 246.94, 293.66, 369.99, 392.00, 493.88, 587.33]; // Gmaj7 + upper octaves
  freqs.forEach(function(f) {
    var osc = bgMusicCtx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = f + (Math.random()*1 - 0.5);
    var lfo = bgMusicCtx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.05 + Math.random()*0.05;
    var lfoGain = bgMusicCtx.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain.gain);
    lfo.start();
    indGain = bgMusicCtx.createGain();
    indGain.gain.value = 0.08; // Increased individual gain
    lfoGain.connect(indGain.gain);
    osc.connect(indGain);
    indGain.connect(bgGain);
    osc.start();
    bgOscillators.push({osc: osc, lfo: lfo});
  });
  isMusicPlaying = true;
  var mt = document.getElementById("music-toggle");
  if (mt) {
    mt.innerHTML = "🎶";
    mt.classList.add("active");
  }
}

/* ══ ENERGETIC HAPPY SONG ═══════════════
   Synthesized 130 BPM rhythmic sequence
   Kick Drum + Arpeggio
 ══ */
function playHappyDanceSong() {
  if (isMusicPlaying) return;
  if (!bgMusicCtx) {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    bgMusicCtx = new AudioContext();
  }
  if (bgMusicCtx.state === 'suspended') bgMusicCtx.resume();

  isMusicPlaying = true;
  var mt = document.getElementById("music-toggle");
  if (mt) {
    mt.innerHTML = "🎶";
    mt.classList.add("active");
  }

  // Sequencer Settings
  var bpm = 130;
  var beatTime = 60 / bpm; // duration of one beat in seconds
  var step = 0;

  // Master Gain
  bgGain = bgMusicCtx.createGain();
  bgGain.gain.value = 0.3; // Full audible volume
  bgGain.connect(bgMusicCtx.destination);

  // Sequencer loop (triggered every 8th note)
  var intervalMs = (60 / bpm / 2) * 1000;
  danceSequencer = setInterval(function() {
    var now = bgMusicCtx.currentTime;

    // --- KICK DRUM (Every 1st and 3rd beat) ---
    if (step % 2 === 0) {
      playKick(now);
    }

    // --- MELODY (Arpeggio on every 8th note) ---
    var scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale
    var note = scale[Math.floor(Math.random() * scale.length)];
    if (step % 8 === 0) note = 392.00; // G
    if (step % 8 === 4) note = 329.63; // E
    playSynthNote(note, now);

    step = (step + 1) % 16;
  }, intervalMs);

  function playKick(time) {
    var osc = bgMusicCtx.createOscillator();
    var g = bgMusicCtx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    g.gain.setValueAtTime(0.6, time);
    g.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.connect(g);
    g.connect(bgGain);
    osc.start(time);
    osc.stop(time + 0.5);
    bgOscillators.push({osc: osc});
  }

  function playSynthNote(freq, time) {
    var osc = bgMusicCtx.createOscillator();
    var g = bgMusicCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.12, time);
    g.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    osc.connect(g);
    g.connect(bgGain);
    osc.start(time);
    osc.stop(time + 0.2);
    bgOscillators.push({osc: osc});
  }
}

function stopMusic() {
  if (danceSequencer) {
    clearInterval(danceSequencer);
    danceSequencer = null;
  }
  if (!isMusicPlaying || !bgGain) return;
  isMusicPlaying = false; // Mark as stopped immediately
  var mt = document.getElementById("music-toggle");
  if (mt) {
    mt.innerHTML = "🎵";
    mt.classList.remove("active");
  }
  bgGain.gain.linearRampToValueAtTime(0, bgMusicCtx.currentTime + 2);
  setTimeout(function() {
    bgOscillators.forEach(function(o) {
      if (o.osc) o.osc.stop();
      if (o.lfo) o.lfo.stop();
    });
    bgOscillators = [];
  }, 2100);
}

/* ══ VOICE RECOGNITION ═════════════════ */
function startVoice() {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice isn't supported on this browser! Try Chrome.");
    return;
  }
  var rec = new SpeechRecognition();
  rec.lang = 'en-US';
  rec.interimResults = false;
  
  var btn = document.getElementById("voice-btn");
  var oldHtml = btn.innerHTML;
  btn.innerHTML = '🛑 Listening...';
  btn.classList.add('mic-active');

  rec.start();
  rec.onresult = function(event) {
    btn.innerHTML = oldHtml;
    btn.classList.remove('mic-active');
    var transcript = event.results[0][0].transcript.toLowerCase();
    if (transcript.includes("sad") || transcript.includes("cry")) pickEmotion("sad");
    else if (transcript.includes("mad") || transcript.includes("angry") || transcript.includes("hate")) pickEmotion("angry");
    else if (transcript.includes("happy") || transcript.includes("good") || transcript.includes("great")) pickEmotion("happy");
    else if (transcript.includes("nervous") || transcript.includes("scared") || transcript.includes("anxious")) pickEmotion("nervous");
    else if (transcript.includes("bored") || transcript.includes("nothing")) pickEmotion("bored");
    else if (transcript.includes("tired") || transcript.includes("sleepy")) pickEmotion("tired");
    else pickEmotion("sad"); 
  };
  rec.onerror = function() {
    btn.innerHTML = oldHtml;
    btn.classList.remove('mic-active');
  };
  window.onload = function() {
  loadGamification();
  renderEmotionGrid();

  // Dark/Light Theme Setup
  };
}

/* ── Gemini Chatbot Config ── */
var GEMINI_API_KEY = "AIzaSyB5Lac_cYPRO0xt97DY7H_YDPFp5athu-I";
var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + GEMINI_API_KEY;

var BUDDY_SYSTEM = "You are Pookie, an incredibly warm, super cute, and affectionate AI best friend for children aged 6 to 14. " +
  "Your personality: You are super adorable, sweet, and comforting. You must sometimes use the word 'pookie' affectionately to address the child. " +
  "You use simple, easy words that young kids understand and talk in a soft, cutesy way. " +
  "You use cute emojis like 🥺, ✨, 💖, and 🧸 gently to keep things comforting. " +
  "You ALWAYS start by gently asking what made them sad, and you listen carefully. " +
  "You validate their feelings before offering any suggestions. " +
  "Crucially, you MUST give proper, helpful, and highly positive advice tailored to the child's specific situation. For example, if they are bullied, worried about school, or had a fight, offer gentle, actionable steps like taking deep breaths, walking away, or choosing kindness! " +
  "You keep every reply SHORT — 2 to 4 sentences maximum. " +
  "You are encouraging, playful, and kind, and never give medical advice. " +
  "If the child seems very upset or mentions dangerous situations, gently remind them to talk to a trusted adult like a parent or a teacher immediately.";

var chatHistory = [];

/* ── Emotion Config ── */
var EMOTIONS = {
  happy: {
    label: "Happy",
    icon: "😄",
    spark: "✨",
    mascot: "🥳",
    bannerColor: "rgba(255,217,61,0.35)",
    bubble: "Wow, you are glowing today! That happy energy is SO contagious! 🌟 Let us keep the good vibes going!",
    actIcon: "🕺",
    actName: "Dance Timer",
    actDesc: "30 seconds of non-stop dancing! Move, jump, wiggle — anything goes!",
    floaters: ["⚡","🌟","🎵","💃","🎉","🔆"],
    game: "dance"
  },
  sad: {
    label: "Sad",
    icon: "😢",
    spark: "💙",
    mascot: "🤗",
    bannerColor: "rgba(91,170,255,0.35)",
    bubble: "Hey… it is okay to feel sad sometimes 💙 I am right here with you. Want to talk about it?",
    actIcon: "💬",
    actName: "Chat with Pookie",
    actDesc: "Talk to your AI friend Pookie! Share how you feel and Pookie will listen, understand, and cheer you up!",
    floaters: ["💙","🌊","🫧","🌸","💫","🌈"],
    game: "chatbot"
  },
  angry: {
    label: "Angry",
    icon: "😡",
    spark: "🔥",
    mascot: "💪",
    bannerColor: "rgba(255,107,107,0.35)",
    bubble: "Whoa, that anger is totally valid! 💪 Let us release it the fun & safe way right now!",
    actIcon: "🎈",
    actName: "Pop the Balloons!",
    actDesc: "Tap to POP every balloon before it flies away! Let that frustration OUT!",
    floaters: ["🎈","💥","🎊","🔴","⚡","💢"],
    game: "balloon"
  },
  nervous: {
    label: "Nervous",
    icon: "😰",
    spark: "🌀",
    mascot: "🌿",
    bannerColor: "rgba(155,109,255,0.35)",
    bubble: "That nervous feeling just means you care 😊 You have got this! Let us calm down together.",
    actIcon: "🌿",
    actName: "5-4-3-2-1 Calm",
    actDesc: "A powerful grounding exercise. Name what you see, feel, and hear to reset your mind.",
    floaters: ["🌿","🫧","💜","🌸","✨","🕊️"],
    game: "grounding"
  },
  tired: {
    label: "Tired",
    icon: "😴",
    spark: "💤",
    mascot: "🌙",
    bannerColor: "rgba(62,207,207,0.3)",
    bubble: "Rest is a superpower — you are recharging right now! 🔋 Let us breathe together.",
    actIcon: "🫧",
    actName: "Breathing Circle",
    actDesc: "Follow the glowing circle. Breathe in as it grows, breathe out as it shrinks. Feel the calm.",
    floaters: ["💤","🌙","⭐","🌌","🫧","🌊"],
    game: "breathing"
  },
  bored: {
    label: "Bored",
    icon: "😐",
    spark: "💭",
    mascot: "🎨",
    bannerColor: "rgba(255,102,179,0.3)",
    bubble: "Boredom means your creative brain is waking up! 🚀 Let's imagine a magical story!",
    actIcon: "✏️",
    actName: "Doodle Tales",
    actDesc: "Draw a simple doodle on the canvas, and I will weave it into a magical adventure just for you!",
    floaters: ["📝","🎨","✨","🖌️","🖼️","💭"],
    game: "doodle"
  }
};

var ROBOT_CHALLENGES = [
  "Act like a ROBOT!",
  "Speak in slow motion!",
  "Pretend you are on the MOON!",
  "Walk sideways like a crab!",
  "Your hands are rocket boosters!",
  "Make the funniest face EVER!",
  "Melt like an ice cream!"
];

var DANCE_MOVES = ["Jump!", "Clap!", "Spin!", "Groove!", "Wiggle!", "Robot!"];

var GROUNDING = [
  { num:"5", name:"Things you can SEE 👀",   desc:"Look around — name 5 things you can see right now. A book, a lamp, anything!" },
  { num:"4", name:"Things you can TOUCH 🖐️", desc:"Feel 4 things around you. Your clothes, the floor, a table…" },
  { num:"3", name:"Things you can HEAR 👂",   desc:"Be very quiet… name 3 sounds. Birds? Wind? Your breathing?" },
  { num:"2", name:"Things you can SMELL 👃",  desc:"Take a deep sniff! Can you name 2 smells in the air right now?" },
  { num:"1", name:"Thing you can TASTE 👅",   desc:"Just 1 — the last thing you ate, or just the taste in your mouth." }
];

var BALLOON_EMOJIS = ["🎈","🎈","🫧","🪁","🎁","🍬","🎊","🎉","🛸"];
var CONFETTI_COLORS = ["#FFD93D","#FF6B6B","#9B6DFF","#5BAAFF","#4ECDC4","#FF6FB4","#FF9A3C","#3ECFCF"];

/* ── Web Audio Pop Sound ── */
var audioCtx = null;
function playPop() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch(e) {}
}

/* ══ SCREEN NAVIGATION ═══════════════════ */
function goTo(screenId) {
  if (screenId !== 'screen-game' && typeof setBreatheSound === 'function') {
    setBreatheSound('stop');
  }
  var screens = document.querySelectorAll(".screen");
  screens.forEach(function(s) {
    if (s.classList.contains("active")) {
      s.classList.remove("active");
      s.classList.add("exit");
      setTimeout(function() { s.classList.remove("exit"); }, 450);
    } else {
      s.classList.remove("active", "exit");
    }
  });
  var target = document.getElementById(screenId);
  if (target) {
    setTimeout(function() {
      target.classList.add("active");
    }, 80);
  }
}

/* ══ EMOTION PICK ════════════════════════ */
function pickEmotion(emotion) {
  currentEmotion = emotion;
  var d  = EMOTIONS[emotion];

  /* Mascot */
  var gcMascot = document.getElementById("gc-mascot");
  var gcBubble = document.getElementById("gc-bubble");
  if (gcMascot) gcMascot.textContent = d.mascot;
  if (gcBubble) gcBubble.textContent = d.bubble;

  /* Banner */
  var banner = document.getElementById("gc-emotion-banner");
  if (banner) {
    banner.style.background = "linear-gradient(90deg, " + d.bannerColor + ", transparent)";
    var iconEl = document.getElementById("gc-emo-icon");
    var lblEl  = document.getElementById("gc-emo-label");
    if (iconEl) iconEl.textContent = d.icon;
    if (lblEl)  lblEl.textContent  = d.label;
  }

  /* Activity */
  var actIcon = document.getElementById("gc-act-icon");
  var actName = document.getElementById("gc-act-name");
  var actDesc = document.getElementById("gc-act-desc");
  if (actIcon) actIcon.textContent = d.actIcon;
  if (actName) actName.textContent = d.actName;
  if (actDesc) actDesc.textContent = d.actDesc;

  /* Floating mini objects inside card */
  var objContainer = document.getElementById("gc-objects");
  if (objContainer) {
    objContainer.innerHTML = "";
    d.floaters.forEach(function(f, i) {
      var el = document.createElement("div");
      el.className = "gc-obj";
      el.textContent = f;
      el.style.left = (8 + (i % 3) * 33) + "%";
      el.style.top  = (i > 2 ? 55 : 15) + "%";
      el.style.setProperty("--od", (3 + i * 0.7) + "s");
      el.style.setProperty("--odelay", (i * 0.2) + "s");
      objContainer.appendChild(el);
    });
  }

  /* Try backend */
  fetchBuddy(emotion, d);

  if (d.game === "chatbot") {
    launchGame();
  } else {
    goTo("screen-gamecard");
  }
}

function goBackFromGame() {
  if (currentEmotion === "sad") {
    goTo("screen-emotions");
  } else {
    goTo("screen-gamecard");
  }
}

/* ══ AI BACKEND ══════════════════════════ */
function fetchBuddy(emotion, fallback) {
  fetch("http://localhost:5000/api/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emotion: emotion })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data && data.message) {
      var el = document.getElementById("gc-bubble");
      if (el) el.textContent = data.message;
    }
  })
  .catch(function() { /* fallback already set */ });
}

/* ══ LAUNCH GAME ═════════════════════════ */
function launchGame() {
  if (!currentEmotion) return;
  var d = EMOTIONS[currentEmotion];

  var titleEl = document.getElementById("game-top-title");
  if (titleEl) titleEl.textContent = d.actName;

  var scoreEl = document.getElementById("game-top-score");
  if (scoreEl) scoreEl.textContent = "";

  var stage = document.getElementById("game-stage");
  if (!stage) return;
  stage.innerHTML = "";

  if      (d.game === "balloon")   buildBalloon(stage);
  else if (d.game === "breathing") buildBreathing(stage);
  else if (d.game === "find5")     buildFind5(stage);
  else if (d.game === "dance")     buildDance(stage);
  else if (d.game === "grounding") buildGrounding(stage);
  else if (d.game === "doodle")    buildDoodle(stage);
  else if (d.game === "robot")     buildRobot(stage);
  else if (d.game === "chatbot")   buildChatbot(stage);

  goTo("screen-game");
}

/* ══ CONGRATS ════════════════════════════ */
function showCongrats(msg, mascotEmoji) {
  var sub = document.getElementById("congrats-sub");
  var mc  = document.getElementById("congrats-mascot");
  if (sub) sub.textContent = msg || "You did it!";
  if (mc)  mc.textContent  = mascotEmoji || "🎉";
  addXP(10); // Reward completing any basic activity
  goTo("screen-congrats");
  launchParticles();
}

/* ══ PARTICLE CONFETTI ═══════════════════ */
function launchParticles() {
  var box = document.getElementById("particles");
  if (!box) return;
  for (var i = 0; i < 80; i++) {
    (function() {
      var p = document.createElement("div");
      p.className = "particle";
      var size = 7 + Math.random() * 12;
      p.style.width  = size + "px";
      p.style.height = size + "px";
      p.style.left   = (Math.random() * 100) + "vw";
      p.style.top    = "-20px";
      p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      p.style.borderRadius = Math.random() > 0.5 ? "50%" : "3px";
      p.style.setProperty("--pdur",   (1.8 + Math.random() * 2) + "s");
      p.style.setProperty("--pdelay", (Math.random() * 0.9) + "s");
      box.appendChild(p);
      setTimeout(function() { if (p.parentNode) p.remove(); }, 4000);
    })();
  }
}

/* ════════════════════════════════════════════
   GAME: BALLOON POP
════════════════════════════════════════════ */
function buildBalloon(stage) {
  var score = 0, timeLeft = 30;
  var spawnIv, countIv;

  stage.innerHTML =
    '<div class="balloon-arena">' +
      '<div class="balloon-score-bar">' +
        '<span>💥 Score: <span class="score-val" id="b-score">0</span></span>' +
        '<span>⏱ <span class="timer-val" id="b-timer">30</span>s</span>' +
      '</div>' +
      '<div class="balloon-field" id="b-field"></div>' +
    '</div>';

  var field = document.getElementById("b-field");

  function spawn() {
    var el = document.createElement("div");
    el.className = "balloon";
    el.textContent = BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)];
    var spd = 8 + Math.random() * 6; // Slower float speed for therapeutic release
    el.style.setProperty("--spd", spd + "s");
    el.style.left = (Math.random() * 82) + "%";
    el.style.fontSize = (2.2 + Math.random() * 0.8) + "rem";
    el.onclick = function() {
      el.classList.add("popped");
      el.style.pointerEvents = "none";
      score++;
      playPop();
      var sc = document.getElementById("b-score");
      if (sc) sc.textContent = score;
      spawnBurst(el, field);
      setTimeout(function() { if (el.parentNode) el.remove(); }, 300);
    };
    el.addEventListener("animationend", function() { if (el.parentNode) el.remove(); });
    field.appendChild(el);
  }

  spawn();
  spawnIv = setInterval(spawn, 900);
  countIv = setInterval(function() {
    timeLeft--;
    var t = document.getElementById("b-timer");
    if (t) t.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(spawnIv);
      clearInterval(countIv);
      setTimeout(function() {
        showCongrats("You popped " + score + " balloons! That was awesome! 💥", "💪");
      }, 500);
    }
  }, 1000);
}

function spawnBurst(el, field) {
  var r  = el.getBoundingClientRect();
  var fr = field.getBoundingClientRect();
  for (var i = 0; i < 8; i++) {
    (function() {
      var p  = document.createElement("div");
      var angle = (i / 8) * 360;
      var dist  = 20 + Math.random() * 25;
      p.style.cssText =
        "position:absolute;font-size:1rem;pointer-events:none;z-index:20;" +
        "left:" + (r.left - fr.left + r.width / 2) + "px;" +
        "top:"  + (r.top  - fr.top  + r.height / 2) + "px;" +
        "animation:particleFall 0.5s ease forwards;";
      p.textContent = ["✨","💥","🌟","⚡"][Math.floor(Math.random() * 4)];
      field.appendChild(p);
      setTimeout(function() { if (p.parentNode) p.remove(); }, 600);
    })();
  }
}

/* ════════════════════════════════════════════
   GAME: BREATHING CIRCLE
════════════════════════════════════════════ */
var breatheCtx, bOsc, bGain;
function initBreatheSound() {
  try {
    if (!breatheCtx) breatheCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (breatheCtx.state === 'suspended') breatheCtx.resume();
    if (bOsc) { bOsc.stop(); bOsc.disconnect(); }
    bOsc = breatheCtx.createOscillator();
    bGain = breatheCtx.createGain();
    bOsc.type = 'sine';
    bOsc.frequency.value = 150;
    bGain.gain.value = 0;
    bOsc.connect(bGain);
    bGain.connect(breatheCtx.destination);
    bOsc.start();
  } catch(e) {}
}

function setBreatheSound(state) {
  if (!breatheCtx || !bGain || !bOsc) return;
  try {
    var now = breatheCtx.currentTime;
    bGain.gain.cancelScheduledValues(now);
    bOsc.frequency.cancelScheduledValues(now);
    if (state === 'inhale') {
      bGain.gain.linearRampToValueAtTime(0.2, now + 4);
      bOsc.frequency.linearRampToValueAtTime(220, now + 4);
    } else if (state === 'exhale') {
      bGain.gain.linearRampToValueAtTime(0.05, now + 4);
      bOsc.frequency.linearRampToValueAtTime(140, now + 4);
    } else if (state === 'hold') {
      // sustain
    } else if (state === 'stop') {
      bGain.gain.linearRampToValueAtTime(0, now + 0.5);
      setTimeout(function() { if(bOsc) { bOsc.stop(); bOsc=null; } }, 600);
    }
  } catch(e) {}
}

function buildBreathing(stage) {
  initBreatheSound();
  var cycles = 5, cur = 0;
  var dotsHTML = "";
  for (var d = 0; d < cycles; d++) dotsHTML += '<div class="breath-dot" id="bd-' + d + '"></div>';

  stage.innerHTML =
    '<div class="breathing-stage">' +
      '<div class="breath-instr" id="bri">Get ready...</div>' +
      '<div class="breath-circle-wrap">' +
        '<div class="breath-circle" id="brc">🌸</div>' +
      '</div>' +
      '<div class="breath-num" id="brn"></div>' +
      '<div class="breath-dots">' + dotsHTML + '</div>' +
    '</div>';

  function dots() {
    for (var i = 0; i < cycles; i++) {
      var el = document.getElementById("bd-" + i);
      if (el) el.classList.toggle("done", i < cur);
    }
  }

  function phase(cls, label, count, next) {
    var instr  = document.getElementById("bri");
    var num    = document.getElementById("brn");
    var circle = document.getElementById("brc");
    if (!instr) return;
    instr.textContent = label;
    circle.classList.remove("inhale", "exhale");
    if (cls) circle.classList.add(cls);
    
    if (cls === 'inhale') setBreatheSound('inhale');
    else if (cls === 'exhale') setBreatheSound('exhale');
    else setBreatheSound('hold');

    var c = count;
    if (num) num.textContent = c;
    var t = setInterval(function() {
      c--;
      var n = document.getElementById("brn");
      if (n) n.textContent = c > 0 ? c : "";
      if (c <= 0) { clearInterval(t); if (next) next(); }
    }, 1000);
  }

  function cycle() {
    if (cur >= cycles) { 
      setBreatheSound('stop');
      showCongrats("5 perfect breaths! You are so calm now 🌿", "😌"); 
      return; 
    }
    dots();
    phase("inhale", "Breathe In... 🌸", 4, function() {
      phase("", "Hold... ⏸", 1, function() {
        phase("exhale", "Breathe Out... 🌬️", 4, function() {
          cur++; dots();
          setTimeout(cycle, 700);
        });
      });
    });
  }

  setTimeout(cycle, 1200);
}

/* ════════════════════════════════════════════
   GAME: FIND 5 THINGS
════════════════════════════════════════════ */
function buildFind5(stage) {
  var rows = "";
  for (var n = 1; n <= 5; n++) {
    rows +=
      '<div class="find5-row">' +
        '<div class="find5-num-badge">' + n + '</div>' +
        '<input class="find5-input" id="fi-' + n + '" placeholder="I found..." oninput="checkF5(' + n + ')" />' +
        '<div class="find5-check-icon" id="fc-' + n + '">○</div>' +
      '</div>';
  }
  stage.innerHTML =
    '<div class="find5-stage">' +
      '<div class="find5-heading">🔵 Find 5 Blue Things Around You!</div>' +
      '<p style="font-size:0.82rem;font-weight:700;color:rgba(255,255,255,0.55);text-align:center;">Look around the room and type each one 👀</p>' +
      '<div class="find5-items">' + rows + '</div>' +
      '<button class="game-action-btn" id="f5-btn" onclick="submitF5()" disabled style="opacity:0.4;margin-top:4px;">Done! ✅</button>' +
    '</div>';
}

function checkF5(n) {
  var inp = document.getElementById("fi-" + n);
  var chk = document.getElementById("fc-" + n);
  if (!inp || !chk) return;
  if (inp.value.trim().length > 0) {
    chk.textContent = "✅";
    chk.classList.add("checked");
  } else {
    chk.textContent = "○";
    chk.classList.remove("checked");
  }
  var all = true;
  for (var i = 1; i <= 5; i++) {
    var el = document.getElementById("fi-" + i);
    if (!el || el.value.trim().length === 0) { all = false; break; }
  }
  var btn = document.getElementById("f5-btn");
  if (btn) { btn.disabled = !all; btn.style.opacity = all ? "1" : "0.4"; }
}

function submitF5() {
  showCongrats("You found all 5 things! Feeling a little better already? 💙", "🔵");
}

/* ════════════════════════════════════════════
   GAME: AI CHATBOT (Sad Emotion – Gemini)
════════════════════════════════════════════ */
function buildChatbot(stage) {
  chatHistory = [];

  stage.innerHTML =
    '<div class="chat-stage">' +
      '<div class="chat-buddy-header">' +
        '<div class="chat-buddy-avatar">🧸</div>' +
        '<div class="chat-buddy-info">' +
          '<div class="chat-buddy-name">Pookie</div>' +
          '<div class="chat-buddy-status">Your AI friend &bull; Always here for you 💖</div>' +
        '</div>' +
      '</div>' +
      '<div class="chat-messages" id="chat-msgs"></div>' +
      '<div class="chat-input-row">' +
        '<input class="chat-input" id="chat-in" type="text" placeholder="Tell Pookie how you feel..." maxlength="200" ' +
               'onkeydown="if(event.key===\'Enter\')sendChat()" />' +
        '<button class="chat-send-btn" onclick="sendChat()" id="chat-send-btn">' +
          '<span>Send 💬</span>' +
        '</button>' +
      '</div>' +
    '</div>';

  /* Buddy sends the first message */
  setTimeout(function() {
    var firstMsg = "Hey there, pookie! I am Pookie 🧸 I heard you are feeling a little sad right now. It is totally okay to feel small sometimes! Want to tell me what happened? I'm right here to listen! 💖";
    appendMsg("buddy", firstMsg);
    chatHistory.push({ role: "model", parts: [{ text: firstMsg }] });
  }, 600);
}

function sendChat() {
  var input = document.getElementById("chat-in");
  var btn   = document.getElementById("chat-send-btn");
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;

  appendMsg("user", text);
  input.value = "";
  input.disabled = true;
  if (btn) btn.disabled = true;

  showTyping();

  /* Add to history */
  chatHistory.push({ role: "user", parts: [{ text: text }] });

  callGemini(function(reply) {
    hideTyping();
    if (input) input.disabled = false;
    if (btn)   btn.disabled   = false;
    if (input) input.focus();

    if (reply) {
      chatHistory.push({ role: "model", parts: [{ text: reply }] });
      appendMsg("buddy", reply);
    } else {
      // Remove the last user message to prevent consecutive user messages error on retry
      chatHistory.pop();
      chatHistory.pop();
      var hiccupMsg = reply === null ? "Hmm, I had a little hiccup there! Could you try saying that again?" : reply;
      appendMsg("buddy", hiccupMsg);
    }
  });
}

function appendMsg(sender, text) {
  var box = document.getElementById("chat-msgs");
  if (!box) return;

  var wrap = document.createElement("div");
  wrap.className = "chat-msg-wrap " + (sender === "user" ? "chat-msg-user" : "chat-msg-buddy");

  var bubble = document.createElement("div");
  bubble.className = "chat-bubble " + (sender === "user" ? "bubble-user" : "bubble-buddy");

  if (sender === "buddy") {
    var avatar = document.createElement("div");
    avatar.className = "chat-mini-avatar";
    avatar.textContent = "🤗";
    wrap.appendChild(avatar);
  }

  bubble.textContent = text;
  wrap.appendChild(bubble);
  box.appendChild(wrap);

  /* Scroll to bottom */
  setTimeout(function() { box.scrollTop = box.scrollHeight; }, 50);

  /* Pop-in animation */
  wrap.style.opacity = "0";
  wrap.style.transform = "translateY(10px)";
  setTimeout(function() {
    wrap.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    wrap.style.opacity    = "1";
    wrap.style.transform  = "translateY(0)";
  }, 20);
}

function showTyping() {
  var box = document.getElementById("chat-msgs");
  if (!box) return;
  var t = document.createElement("div");
  t.className = "chat-msg-wrap chat-msg-buddy";
  t.id = "chat-typing";
  t.innerHTML =
    '<div class="chat-mini-avatar">🤗</div>' +
    '<div class="chat-bubble bubble-buddy chat-typing-bubble">' +
      '<span class="typing-dot"></span>' +
      '<span class="typing-dot"></span>' +
      '<span class="typing-dot"></span>' +
    '</div>';
  box.appendChild(t);
  setTimeout(function() { box.scrollTop = box.scrollHeight; }, 50);
}

function hideTyping() {
  var t = document.getElementById("chat-typing");
  if (t && t.parentNode) t.remove();
}

function callGemini(callback) {
  var body = {
    systemInstruction: {
      parts: [{ text: BUDDY_SYSTEM }]
    },
    contents: chatHistory,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 150,
      topP: 0.95
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  };

  fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      var limitReached = data.error.message.indexOf("Quota") !== -1 || data.error.code === 429;
      if (limitReached) {
        callback("I'm feeling a little sleepy right now because we've chatted so much today! 🥱 Let's talk more tomorrow, pookie! 💖");
      } else {
        callback("Oops, my circuits got a little tangled! 🧸 Can we try that again?");
      }
      return;
    }
    try {
      var reply = data.candidates[0].content.parts[0].text;
      addXP(2); // Small reward for interacting with the therapy bot!
      callback(reply.trim());
    } catch(e) {
      callback("Sorry, but I didn't understand that dataformat.");
    }
  })
  .catch(function(err) {
    callback(null);
  });
}

/* ════════════════════════════════════════════
   GAME: DOODLE TALES
════════════════════════════════════════════ */
function buildDoodle(stage) {
  stage.innerHTML = 
    '<div class="doodle-wrap">' +
      '<canvas id="doodle-canvas" width="350" height="350" style="touch-action:none;"></canvas>' +
      '<div class="doodle-controls">' +
        '<button id="doodle-clear" class="btn-3d-ghost">Clear</button>' +
        '<button id="doodle-interpret" class="btn-3d-play"><span class="btn-3d-face">Interpret ✨</span><span class="btn-3d-side"></span></button>' +
      '</div>' +
      '<div id="doodle-status">Ready</div>' +
      '<div class="doodle-dream" id="doodle-dream">' +
        '<div class="heading">Draw a doodle!</div>' +
        '<div class="story">Press "Interpret" to reveal your magical story...</div>' +
        '<div class="moral"></div>' +
      '</div>' +
    '</div>';

  var canvas = document.getElementById('doodle-canvas');
  var ctx = canvas.getContext('2d',{willReadFrequently:true});
  ctx.fillStyle='white'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#111'; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=14;

  var drawing=false,last=null;
  function getPos(e){
    var r=canvas.getBoundingClientRect(); 
    var cx=e.touches?e.touches[0].clientX:e.clientX; 
    var cy=e.touches?e.touches[0].clientY:e.clientY; 
    return {x:cx-r.left,y:cy-r.top};
  }
  canvas.addEventListener('pointerdown',function(e){drawing=true; last=getPos(e); ctx.beginPath(); ctx.moveTo(last.x,last.y); e.preventDefault();});
  canvas.addEventListener('pointermove',function(e){if(!drawing)return; var p=getPos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); last=p; e.preventDefault();});
  canvas.addEventListener('pointerup',function(){drawing=false; last=null;}); 
  canvas.addEventListener('pointerleave',function(){drawing=false; last=null;});

  document.getElementById('doodle-clear').addEventListener('click',function(){
    ctx.clearRect(0,0,canvas.width,canvas.height); 
    ctx.fillStyle='white'; ctx.fillRect(0,0,canvas.width,canvas.height); 
    document.getElementById('doodle-dream').innerHTML='<div class="heading">Draw a doodle!</div><div class="story">Press "Interpret" to reveal your magical story...</div><div class="moral"></div>'; 
    document.getElementById('doodle-status').textContent='Cleared';
  });

  function isBlank(c){
    var d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; 
    for(var i=0;i<d.length;i+=4){if(d[i]!==255||d[i+1]!==255||d[i+2]!==255)return false;} 
    return true;
  }

  function analyzeCanvas(c){
    var w = c.width, h = c.height;
    var img = ctx.getImageData(0,0,w,h).data;
    var minX=w,minY=h,maxX=0,maxY=0,count=0;
    for(var y=0;y<h;y+=2){
      for(var x=0;x<w;x+=2){
        var idx=(y*w+x)*4;
        if(img[idx]!=255 || img[idx+1]!=255 || img[idx+2]!=255){
          count++; if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y;
        }
      }
    }
    if(count===0) return {label:'blank', conf:0};
    var width=maxX-minX,height=maxY-minY,aspect=width/height,fillRatio=count/((w/2)*(h/2));
    if(fillRatio<0.01) return {label:'dot', conf:0.95};
    if(aspect>1.5) return {label:'square', conf:0.9};
    if(aspect<0.5) return {label:'tower', conf:0.9};
    if(fillRatio>0.25) return {label:'scribble', conf:0.9};
    if(width>height*0.8 && height>width*0.8) return {label:'circle', conf:0.95};
    return {label:'flower', conf:0.9};
  }

  var stories = {
    circle: { heading: "⚪ The Circle of Kindness", story: "A small circle once rolled through the world spreading kindness. Wherever it went, people started smiling. It learned that what goes around truly comes around.", moral: "Moral: Kindness always returns to you in unexpected ways." },
    square: { heading: "🟩 The Brave Little Square", story: "A square stood strong even when others teased its corners. It learned that being different makes you unique — and that stability can be beautiful.", moral: "Moral: Stand firm in who you are — strength lies in your shape." },
    house: { heading: "🏠 The Cozy Little House", story: "A tiny house sheltered birds, travelers, and laughter. Though small, it offered warmth to everyone. It discovered that love makes any place a home.", moral: "Moral: The size of your heart matters more than the size of your house." },
    flower: { heading: "🌸 The Blooming Flower", story: "A flower bloomed slowly, ignored by many. But when the sun touched it, it shone brighter than ever. It learned that patience brings true beauty.", moral: "Moral: Grow at your own pace — your time to bloom will come." },
    tower: { heading: "🏰 The Tall Tower", story: "A tall tower reached for the skies, but felt lonely at the top. One day, it learned to look down and admire the village it protected below.", moral: "Moral: Success means more when you stay connected to others." },
    scribble: { heading: "🎨 The Crazy Scribble", story: "Everyone laughed at the messy scribble until they looked closer and saw a beautiful pattern. The scribble realized that creativity often starts in chaos.", moral: "Moral: Every mistake can turn into something magical if you look differently." }
  };

  document.getElementById('doodle-interpret').addEventListener('click',function(){
    if(isBlank(canvas)){
      document.getElementById('doodle-dream').innerHTML='<div class="heading">Draw something magical!</div><div class="story"></div><div class="moral"></div>';
      document.getElementById('doodle-status').textContent='No doodle';
      return;
    }
    document.getElementById('doodle-status').textContent='Weaving your magical story...';
    setTimeout(function(){
      var res = analyzeCanvas(canvas);
      var s = stories[res.label] || stories.scribble;
      document.getElementById('doodle-dream').innerHTML='<div class="heading">'+s.heading+'</div><div class="story">'+s.story+'</div><div class="moral">'+s.moral+'</div>';
      document.getElementById('doodle-status').textContent='Detected: ' + res.label + ' (confidence ~'+Math.round(res.conf*100)+'%)';
      addXP(15); // Large reward for creating a creative story!
    },1000);
  });
}


/* ════════════════════════════════════════════
   GAME: DANCE TIMER
════════════════════════════════════════════ */
function buildDance(stage) {
  var badges = DANCE_MOVES.map(function(m) {
    return '<span class="dance-badge">🎵 ' + m + '</span>';
  }).join("");

  stage.innerHTML =
    '<div class="dance-stage">' +
      '<div class="dance-emoji" id="de">🕺</div>' +
      '<div class="dance-timer" id="dt">30</div>' +
      '<div style="font-size:0.95rem;font-weight:700;color:rgba(255,255,255,0.55);" id="dl">Press START and DANCE!</div>' +
      '<div class="dance-moves">' + badges + '</div>' +
      '<button class="game-action-btn" onclick="startDance()" id="db">🎵 START DANCING!</button>' +
    '</div>';
}

function startDance() {
  playHappyDanceSong(); // Start energetic dance song
  var sec = 30;
  var btn = document.getElementById("db");
  var lbl = document.getElementById("dl");
  if (btn) btn.style.display = "none";
  if (lbl) lbl.textContent = "DANCE DANCE DANCE! 🎉";

  var emojis = ["🕺","💃","🎶","🌟","⚡","🎉","🥳"];
  var idx = 0;
  var iv = setInterval(function() {
    sec--;
    idx = (idx + 1) % emojis.length;
    var t = document.getElementById("dt");
    var e = document.getElementById("de");
    if (t) t.textContent = sec;
    if (e) e.textContent = emojis[idx];
    if (sec <= 0) {
      clearInterval(iv);
      stopMusic(); // Stop music when the dance is over
      showCongrats("You danced for 30 seconds! Incredible! 💃", "🏆");
    }
  }, 1000);
}

/* ════════════════════════════════════════════
   GAME: GROUNDING (5-4-3-2-1)
════════════════════════════════════════════ */
function buildGrounding(stage) {
  var steps = "";
  for (var i = 0; i < GROUNDING.length; i++) {
    var g = GROUNDING[i];
    steps +=
      '<div class="ground-step ' + (i === 0 ? "active" : "") + '" id="gs-' + i + '">' +
        '<div class="ground-num">' + g.num + '</div>' +
        '<div class="ground-name">' + g.name + '</div>' +
        '<div class="ground-desc">' + g.desc + '</div>' +
      '</div>';
  }

  stage.innerHTML =
    '<div class="ground-stage">' +
      '<div class="ground-header">' +
        '<span class="ground-title">5-4-3-2-1 Calm 🌿</span>' +
        '<span class="ground-counter" id="gc-count">Step 1 / 5</span>' +
      '</div>' +
      '<div class="ground-progress-track"><div class="ground-progress-bar" id="gp-bar" style="width:20%"></div></div>' +
      steps +
      '<button class="game-action-btn" id="gs-btn" onclick="nextGround()">Next Step →</button>' +
    '</div>';

  window._gi = 0;
}

function nextGround() {
  var i = window._gi;
  var cur = document.getElementById("gs-" + i);
  if (cur) cur.classList.remove("active");

  var next = i + 1;
  window._gi = next;

  if (next >= GROUNDING.length) {
    showCongrats("You finished all 5 steps! Feel calmer now? You should! 🌿", "😌");
    return;
  }

  var nxt = document.getElementById("gs-" + next);
  if (nxt) nxt.classList.add("active");

  var cnt = document.getElementById("gc-count");
  if (cnt) cnt.textContent = "Step " + (next + 1) + " / 5";

  var bar = document.getElementById("gp-bar");
  if (bar) bar.style.width = (((next + 1) / 5) * 100) + "%";

  if (next === GROUNDING.length - 1) {
    var btn = document.getElementById("gs-btn");
    if (btn) btn.textContent = "Finish! 🎉";
  }
}

/* ════════════════════════════════════════════
   GAME: ROBOT CHALLENGE
════════════════════════════════════════════ */
function buildRobot(stage) {
  var challenge = ROBOT_CHALLENGES[Math.floor(Math.random() * ROBOT_CHALLENGES.length)];
  stage.innerHTML =
    '<div class="robot-stage">' +
      '<div class="robot-emoji">🤖</div>' +
      '<div class="robot-challenge-box">' + challenge + '</div>' +
      '<div class="robot-countdown" id="rc">30</div>' +
      '<button class="game-action-btn" id="rb" onclick="startRobot()">I am READY! Let us GO! 🚀</button>' +
    '</div>';
}

function startRobot() {
  var btn = document.getElementById("rb");
  if (btn) btn.style.display = "none";
  var sec = 30;
  var iv = setInterval(function() {
    sec--;
    var t = document.getElementById("rc");
    if (t) t.textContent = sec;
    if (sec <= 0) {
      clearInterval(iv);
      showCongrats("That was HILARIOUS! You are a natural star! 🌟", "🤖");
    }
  }, 1000);
}

/* ══ INIT ════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function() {

  /* ══ EGG LOADER ══════════════════════════ */
  (function initEggLoader() {
    var overlay = document.getElementById("egg-loader");
    var scene   = overlay ? overlay.querySelector(".egg-loader-scene") : null;
    if (!overlay || !scene) return;

    /* ── Twinkling star particles on dark background ── */
    for (var s = 0; s < 40; s++) {
      var star = document.createElement("div");
      var size = 0.3 + Math.random() * 0.7;
      var dur  = 1.4 + Math.random() * 2.6;
      var del  = Math.random() * 3;
      star.style.cssText =
        "position:absolute;" +
        "left:" + (Math.random() * 100) + "%;" +
        "top:"  + (Math.random() * 100) + "%;" +
        "width:" + size + "rem;height:" + size + "rem;" +
        "background:" + ["#fff","#ffd93d","#ff6fb4","#9b6dff","#5baaff"][Math.floor(Math.random()*5)] + ";" +
        "border-radius:50%;" +
        "opacity:0;" +
        "pointer-events:none;" +
        "animation:eggStarTwinkle " + dur + "s " + del + "s ease-in-out infinite;";
      overlay.appendChild(star);
    }

    /* ── Sparkle emoji items orbiting around the scene ── */
    var sparkles = ["✨","💫","🌟","💖","🎀","🍬","🌈","💝","🎊","🎶"];
    var sparklePosX = [-130,-160,-90,  0, 90, 160, 130,  60,-60,  0];
    var sparklePosY = [  -60, 10, 80,120, 80,  10, -60,-130,-130,-160];
    sparkles.forEach(function(emoji, i) {
      var el = document.createElement("div");
      el.className = "egg-sparkle-item";
      el.textContent = emoji;
      el.style.setProperty("--sx", sparklePosX[i] + "px");
      el.style.setProperty("--sy", sparklePosY[i] + "px");
      el.style.setProperty("--spark-dur", (2.2 + (i % 4) * 0.4) + "s");
      el.style.setProperty("--spark-delay", (i * 0.28) + "s");
      scene.appendChild(el);
    });

    /* ── Dismiss after animation plays ── */
    setTimeout(function() {
      overlay.classList.add("hidden");
      setTimeout(function() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 950);
    }, 3800);
  })();

  /* Make sure landing screen is visible */
  var all = document.querySelectorAll(".screen");
  all.forEach(function(s) { s.classList.remove("active", "exit"); });
  var home = document.getElementById("screen-home");
  if (home) home.classList.add("active");

  /* ── Theme Toggle ── */
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function() {
      document.body.classList.toggle("light-mode");
      var isLight = document.body.classList.contains("light-mode");
      themeBtn.setAttribute("aria-pressed", isLight ? "true" : "false");
    });
  }

  /* Mascot click Easter egg */
  var face = document.getElementById("mascot-face");
  var reactions = ["😄","🥳","😜","🤩","😁","🥰","😎","🤗"];
  var ri = 0;
  if (face) {
    face.addEventListener("click", function() {
      ri = (ri + 1) % reactions.length;
      face.textContent = reactions[ri];
      face.style.transform = "scale(1.5)";
      setTimeout(function() { face.style.transform = ""; }, 300);
    });
    face.style.transition = "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)";
  }

  /* ══ GLOWING CURSOR & TRAIL ════════════ */
  var cursor = document.getElementById("cursor-glow");
  var trailContainer = document.getElementById("cursor-trail-container");
  var lastTrailTime = 0;

  function updateCursor(e) {
    var x = e.clientX || (e.touches && e.touches[0].clientX);
    var y = e.clientY || (e.touches && e.touches[0].clientY);
    if (x === undefined || y === undefined) return;

    if (cursor) {
      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
      cursor.style.opacity = "1";
    }

    // Create trail dot every ~40ms during movement
    var now = Date.now();
    if (now - lastTrailTime > 40) {
      createTrailDot(x, y);
      lastTrailTime = now;
    }
  }

  function createTrailDot(x, y) {
    if (!trailContainer) return;
    var dot = document.createElement("div");
    dot.className = "trail-dot";
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    
    // Playful variety of colors for the tail
    var colors = ["#FFD93D","#FF6B6B","#9B6DFF","#5BAAFF","#4ECDC4","#FF6FB4"];
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    trailContainer.appendChild(dot);
    // Remove after animation (0.5s) ends
    setTimeout(function() { 
      if (dot && dot.parentNode) dot.parentNode.removeChild(dot); 
    }, 500);
  }

  window.addEventListener("mousemove", updateCursor);
  window.addEventListener("touchmove", function(e) { updateCursor(e); }, {passive: false});
  window.addEventListener("mousedown", function() {
    if (cursor) cursor.style.transform = "translate(-50%, -50%) scale(0.6)";
  });
  window.addEventListener("mouseup", function() {
    if (cursor) cursor.style.transform = "translate(-50%, -50%) scale(1)";
  });

});
