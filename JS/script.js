const playBtn = document.getElementById('playBtn');
const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const puzzle = document.getElementById('puzzle');
const winMessage = document.getElementById('winMessage');
const loseMessage = document.getElementById('loseMessage');
const resetBtn = document.getElementById('resetBtn');
const timerEl = document.getElementById('timer');
const countdownText = document.getElementById('countdownText');
const shuffleSound = document.getElementById('shuffleSound');

let tiles = [];
let timer = null;
let timeLeft = 300;

playBtn.addEventListener('click', () => {
  lobby.style.display = 'none';
  game.style.display = 'block';
  startGame();
});

resetBtn.addEventListener('click', () => {
  resetGame();
});

function startGame() {
  puzzle.innerHTML = '';
  winMessage.style.display = 'none';
  loseMessage.style.display = 'none';
  countdownText.classList.remove('hidden');
  countdownText.textContent = 'Acak gambar dalam waktu 3 detik...';

  tiles = [];
  timeLeft = 300;
  updateTimerDisplay();
  clearInterval(timer);
  shuffleSound.pause();
  shuffleSound.currentTime = 0;

  for (let n = 0; n < 9; n++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.correct = n;

    if (n === 8) {
      tile.classList.add('empty');
    } else {
      const img = document.createElement('img');
      img.src = `img/img-${n + 1}.jpg`;
      tile.appendChild(img);
    }

    tiles.push(tile);
    puzzle.appendChild(tile);
  }

  let count = 3;
  const interval = setInterval(() => {
    if (count > 0) {
      countdownText.textContent = `Acak gambar dalam waktu ${count} detik...`;
    } else if (count === 0) {
      countdownText.textContent = `Mengacak gambar...`;
    } else {
      clearInterval(interval);
      countdownText.textContent = '';
      countdownText.classList.add('hidden');

      // 🔊 Play lagu & shuffle
      shuffleSound.play();
      shuffleTiles();
      updateBoard();
      startTimer();
    }
    count--;
  }, 1000);
}

function shuffleTiles() {
  const shuffled = [...tiles];
  let tries = 0;
  do {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    tries++;
    if (tries > 1000) break;
  } while (!isSolvable(shuffled));
  tiles = shuffled;
}

function isSolvable(arr) {
  const flat = arr.map(tile => tile.classList.contains('empty') ? 8 : Number(tile.dataset.correct));
  let inv = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 9; j++) {
      if (flat[i] !== 8 && flat[j] !== 8 && flat[i] > flat[j]) inv++;
    }
  }
  return inv % 2 === 0;
}

function updateBoard() {
  puzzle.innerHTML = '';
  tiles.forEach((tile, i) => {
    tile.dataset.index = i;

    const clone = tile.cloneNode(true);
    tiles[i] = clone;

    clone.onclick = () => handleMove(i);

    let startX = 0, startY = 0;
    clone.ontouchstart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    clone.ontouchend = (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) trySwipe(i, 'right');
        else if (dx < -30) trySwipe(i, 'left');
      } else {
        if (dy > 30) trySwipe(i, 'down');
        else if (dy < -30) trySwipe(i, 'up');
      }
    };

    puzzle.appendChild(clone);
  });
}

function getTargetIndex(index, dir) {
  switch (dir) {
    case 'up': return index - 3 >= 0 ? index - 3 : -1;
    case 'down': return index + 3 < 9 ? index + 3 : -1;
    case 'left': return index % 3 !== 0 ? index - 1 : -1;
    case 'right': return index % 3 !== 2 ? index + 1 : -1;
    default: return -1;
  }
}

function trySwipe(index, direction) {
  const target = getTargetIndex(index, direction);
  if (target !== -1 && tiles[target].classList.contains('empty')) {
    [tiles[index], tiles[target]] = [tiles[target], tiles[index]];
    updateBoard();
    checkWin();
  }
}

function handleMove(index) {
  const emptyIndex = tiles.findIndex(t => t.classList.contains('empty'));
  const validMoves = [emptyIndex - 3, emptyIndex + 3];
  if (emptyIndex % 3 !== 0) validMoves.push(emptyIndex - 1);
  if (emptyIndex % 3 !== 2) validMoves.push(emptyIndex + 1);

  if (validMoves.includes(index)) {
    [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
    updateBoard();
    checkWin();
  }
}

function checkWin() {
  const isWin = tiles.every((tile, idx) => tile.dataset.correct == idx);
  if (isWin) {
    winMessage.style.display = 'block';
    clearInterval(timer);
    shuffleSound.pause(); // stop lagu
    shuffleSound.currentTime = 0;
  }
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      loseMessage.style.display = 'block';
      shuffleSound.pause(); // stop lagu
      shuffleSound.currentTime = 0;
      setTimeout(() => {
        loseMessage.style.display = 'none';
      }, 3000);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');
  timerEl.textContent = `🕒 ${m}:${s}`;
}

function resetGame() {
  clearInterval(timer);
  puzzle.innerHTML = '';
  tiles = [];
  timeLeft = 300;
  game.style.display = 'none';
  lobby.style.display = 'block';
  winMessage.style.display = 'none';
  loseMessage.style.display = 'none';
  countdownText.classList.add('hidden');
  shuffleSound.pause(); // stop lagu saat reset
  shuffleSound.currentTime = 0;
}