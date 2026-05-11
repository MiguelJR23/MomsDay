 <script>
    /* petálas */
    const PETALS = ['🌸', '🌺', '🌷', '🌹', '💮', '🏵️', '💐', '🌼', '🌻'];
    function spawnPetal() {
      const el = document.createElement('div');
      el.className = 'petal';
      el.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
      const dur = 6 + Math.random() * 8;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = (-Math.random() * dur) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), (dur + 1) * 1000);
    }
    setInterval(spawnPetal, 700);
    for (let i = 0; i < 12; i++) spawnPetal();

    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = 1 + Math.random() * 2;
        this.sp = 0.1 + Math.random() * 0.4;
        this.op = Math.random();
        this.tw = 0.005 + Math.random() * 0.01;
        this.hue = [350, 340, 30, 280][Math.floor(Math.random() * 4)];
      }
      update() {
        this.y -= this.sp;
        this.op += this.tw;
        if (this.op > 1 || this.y < 0) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.abs(Math.sin(this.op));
        ctx.fillStyle = `hsl(${this.hue},80%,75%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    (function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    })();

    /* reevla no scroll */
    const reveals = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(r => io.observe(r));

    let score = 0, level = 1, xp = 0, streak = 0;
    const XP_PER_LEVEL = 20;

    function addScore(pts, el) {
      score += pts; xp += pts; streak++;
      // Streak
      if (streak > 0 && streak % 5 === 0) { addScore(5, null); showToast(`🔥 ${streak} Streak BONUS! +5 ❤️`); }
      // Level up
      while (xp >= XP_PER_LEVEL) { xp -= XP_PER_LEVEL; level++; showToast(`🌟 Level Up! You're now Level ${level}!`); }
      updateUI();
      // Pop 
      if (el) {
        const pop = document.createElement('div');
        pop.className = 'score-pop';
        pop.textContent = `+${pts} ❤️`;
        const rect = el.getBoundingClientRect();
        pop.style.left = (rect.left + rect.width / 2) + 'px';
        pop.style.top = rect.top + 'px';
        document.body.appendChild(pop);
        setTimeout(() => pop.remove(), 1300);
      }
    }

    function updateUI() {
      document.getElementById('score-display').textContent = score;
      document.getElementById('level-display').textContent = level;
      document.getElementById('streak-display').textContent = streak;
      document.getElementById('lvl-txt').textContent = level;
      document.getElementById('xp-txt').textContent = `${xp} / ${XP_PER_LEVEL} XP`;
      document.getElementById('xp-bar').style.width = (xp / XP_PER_LEVEL * 100) + '%';
    }

    let toastTimer;
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg; t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
    }

    function switchTab(tab) {
      document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('panel-' + tab).classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    }

    /* jogo 2 */
    const MEMORY_EMOJIS = ['💖', '🌸', '🎀', '👑', '🌺', '🌹', '💐', '🌼', '🩷', '🌷', '🤍', '💝'];
    let memCards = [], memFlipped = [], memMatched = 0, memLocked = false, memMoves = 0, memCols = 4;

    function startMemory(cols) {
      memCols = cols;
      memFlipped = []; memMatched = 0; memMoves = 0; memLocked = false;
      const rows = 4;
      const pairs = (cols * rows) / 2;
      const chosen = MEMORY_EMOJIS.slice(0, pairs);
      memCards = shuffle([...chosen, ...chosen]);
      renderMemory();
      document.getElementById('mem-status').textContent = `Moves: 0 | Matched: 0 / ${pairs}`;
    }

    function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

    function renderMemory() {
      const g = document.getElementById('memory-grid');
      g.innerHTML = '';
      g.style.gridTemplateColumns = `repeat(${memCols}, 80px)`;
      memCards.forEach((emoji, i) => {
        const card = document.createElement('div');
        card.className = 'mem-card';
        card.innerHTML = `
      <div class="mem-card-face mem-card-back">💖</div>
      <div class="mem-card-face mem-card-front">${emoji}</div>`;
        card.onclick = () => flipCard(card, i, emoji);
        g.appendChild(card);
      });
    }

    function flipCard(card, idx, emoji) {
      if (memLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      memFlipped.push({ card, idx, emoji });
      if (memFlipped.length === 2) {
        memMoves++;
        memLocked = true;
        const [a, b] = memFlipped;
        if (a.emoji === b.emoji) {
          a.card.classList.add('matched'); b.card.classList.add('matched');
          memMatched++;
          memFlipped = []; memLocked = false;
          const pairs = (memCols * 4) / 2;
          addScore(3, b.card);
          document.getElementById('mem-status').textContent = `Moves: ${memMoves} | Matched: ${memMatched} / ${pairs}`;
          if (memMatched === pairs) {
            setTimeout(() => {
              addScore(15, null);
              launchConfetti();
              showWin(`🧠 Incredible! You matched all ${pairs} pairs in just ${memMoves} moves! You earned 15 bonus hearts! Mom loves your memory!`);
            }, 500);
          }
        } else {
          setTimeout(() => {
            a.card.classList.remove('flipped');
            b.card.classList.remove('flipped');
            memFlipped = []; memLocked = false;
            streak = Math.max(0, streak - 1); updateUI();
          }, 900);
        }
      }
    }

    /* jogo 3 */
    const WORD_BANK = [
      { word: 'MOTHER', clue: 'The person who gave you life and loves you unconditionally', cat: '💖 Family' },
      { word: 'WARMTH', clue: 'The feeling of a mom\'s hug on a cold day', cat: '🌞 Feelings' },
      { word: 'FLOWER', clue: 'A beautiful gift for a beautiful person', cat: '🌸 Nature' },
      { word: 'TENDER', clue: 'Gentle care and loving patience', cat: '💝 Qualities' },
      { word: 'BRAVE', clue: 'A word that perfectly describes every mother', cat: '💪 Strength' },
      { word: 'HUGS', clue: 'Moms dispense these for free, unlimited supply', cat: '🤗 Love' },
      { word: 'GRACE', clue: 'Moving through life with beauty and dignity', cat: '👑 Elegance' },
      { word: 'LOYAL', clue: 'Always by your side no matter what, just like Mom', cat: '🛡️ Devotion' },
      { word: 'SMILE', clue: 'Mom\'s most powerful superpower', cat: '😊 Joy' },
      { word: 'HEART', clue: 'Mom keeps yours safe, always', cat: '💕 Love' },
    ];

    let wordQueue = [], wordIdx = 0, currentWord = '', currentGuessed = [], wordScore = 0;

    function initWords() {
      wordQueue = shuffle([...WORD_BANK]);
      wordIdx = 0; wordScore = 0;
      renderWordProgress();
      loadWord();
    }

    function renderWordProgress() {
      const el = document.getElementById('word-progress');
      el.innerHTML = wordQueue.map((_, i) => `<div class="word-dot ${i < wordIdx ? 'done' : i === wordIdx ? 'current' : ''}"></div>`).join('');
    }

    function loadWord() {
      if (wordIdx >= wordQueue.length) {
        addScore(20, null);
        launchConfetti();
        showWin(`💌 You completed ALL ${wordQueue.length} Words of Love! Amazing! +20 bonus hearts! Mom is so proud of you!`);
        wordIdx = 0; renderWordProgress(); loadWord(); return;
      }
      const entry = wordQueue[wordIdx];
      currentWord = entry.word;
      currentGuessed = new Array(currentWord.length).fill(null);
      document.getElementById('word-clue').textContent = `"${entry.clue}"`;
      document.getElementById('word-cat').textContent = entry.cat;
      document.getElementById('word-feedback').textContent = '';
      document.getElementById('word-next-btn').style.display = 'none';
      renderWordBlanks();
      renderLetterChoices();
    }

    function renderWordBlanks() {
      const el = document.getElementById('word-blanks'); el.innerHTML = '';
      currentWord.split('').forEach((ch, i) => {
        const box = document.createElement('div');
        box.className = 'letter-box' + (currentGuessed[i] ? ' filled' : '');
        box.textContent = currentGuessed[i] || '';
        el.appendChild(box);
      });
    }

    function renderLetterChoices() {
      const el = document.getElementById('letter-choices'); el.innerHTML = '';
      const correct = [...new Set(currentWord.split(''))];
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const extras = shuffle(alpha.filter(c => !correct.includes(c))).slice(0, Math.max(0, 10 - correct.length));
      const choices = shuffle([...correct, ...extras]).slice(0, 14);
      choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'letter-choice';
        btn.textContent = ch;
        btn.onclick = () => guessLetter(ch, btn);
        el.appendChild(btn);
      });
    }

    function guessLetter(ch, btn) {
      btn.disabled = true;
      const positions = [];
      currentWord.split('').forEach((c, i) => { if (c === ch && !currentGuessed[i]) positions.push(i); });
      if (positions.length > 0) {
        positions.forEach(i => { currentGuessed[i] = ch; });
        addScore(2, btn);
        renderWordBlanks();
        if (currentGuessed.every(c => c !== null)) {
          document.getElementById('word-feedback').textContent = '🎉 Perfect! You got it!';
          document.getElementById('word-next-btn').style.display = 'inline-block';
          wordIdx++; renderWordProgress();
        }
      } else {
        btn.style.background = 'rgba(239,68,68,0.15)';
        btn.style.borderColor = '#ef4444';
        streak = Math.max(0, streak - 1); updateUI();
        document.getElementById('word-feedback').textContent = '💭 Not quite there — try another!';
      }
    }

    function nextWord() { loadWord(); }

    document.getElementById('tab-word').addEventListener('click', () => {
      if (!currentWord) initWords();
    });

    /* caixinhas */
    const GIFTS = [
      { icon: '🌹', title: 'A Garden of Roses', text: 'Imagine a garden filled with the most beautiful roses, all blooming just for you. This is how full of beauty my life is because you are in it.' },
      { icon: '⭐', title: 'You Are My Star', text: 'When I look at the stars, I think of you. You light up the darkest corners of my world and guide me home every single time.' },
      { icon: '🍰', title: 'Sweet Like You', text: 'Nothing in the world is as sweet as your love. Not cake, not candy, not anything. Thank you for being the sweetest part of my life.' },
      { icon: '🎵', title: 'Our Song', text: '"You are the sunshine of my life" — every song written about love has secretly been written about you, Mom. You are my favorite melody.' },
      { icon: '🌙', title: 'Every Sleepless Night', text: 'Every night you stayed up to watch over me, I was safe because of you. I hope you know that your sacrifices never went unnoticed.' },
      { icon: '🦋', title: 'You Set Me Free', text: 'You raised me with wings strong enough to fly, and a heart brave enough to soar. Everything I am is because of everything you gave.' },
    ];

    const giftRow = document.getElementById('gifts-row');
    GIFTS.forEach((g, i) => {
      const box = document.createElement('div');
      box.className = 'gift-box';
      box.innerHTML = `<span class="box-icon">${g.icon}</span><p>Open Me!</p>`;
      box.onclick = function () {
        box.classList.add('opened');
        box.querySelector('p').textContent = '💖';
        addScore(5, box);
        openGift(g);
        launchMiniConfetti(box);
      };
      giftRow.appendChild(box);
    });

    function openGift(g) {
      document.getElementById('gift-msg-icon').textContent = g.icon;
      document.getElementById('gift-msg-title').textContent = g.title;
      document.getElementById('gift-msg-text').textContent = g.text;
      document.getElementById('gift-msg').classList.add('visible');
      document.getElementById('overlay').style.display = 'block';
    }

    function closeGiftMsg() {
      document.getElementById('gift-msg').classList.remove('visible');
      document.getElementById('overlay').style.display = 'none';
    }

    /* confetes */
    const CONFETTI_COLORS = ['#e8537a', '#f0b943', '#c084fc', '#6ee7b7', '#f97316', '#38bdf8'];

    function launchConfetti() {
      for (let i = 0; i < 80; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.width = (6 + Math.random() * 10) + 'px';
        el.style.height = (10 + Math.random() * 16) + 'px';
        el.style.animationDuration = (2 + Math.random() * 3) + 's';
        el.style.animationDelay = Math.random() * 1 + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 5000);
      }
    }

    function launchMiniConfetti(el) {
      const rect = el.getBoundingClientRect();
      for (let i = 0; i < 20; i++) {
        const c = document.createElement('div');
        c.className = 'confetti-piece';
        c.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 60) + 'px';
        c.style.top = rect.top + 'px';
        c.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        c.style.borderRadius = '50%';
        c.style.width = '8px';
        c.style.height = '8px';
        c.style.animationDuration = (1 + Math.random() * 1.5) + 's';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3000);
      }
    }

    function showWin(msg) {
      document.getElementById('win-msg').textContent = msg;
      document.getElementById('win-overlay').classList.add('active');
    }

    function closeWin() {
      document.getElementById('win-overlay').classList.remove('active');
    }

    startMemory(4);
  </script>
