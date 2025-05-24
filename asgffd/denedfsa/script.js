const emojis = ["🐶", "🐱", "🦊", "🐼", "🐸", "🐵", "🐤", "🦁", "🐰", "🐯"];

const gameBoard = document.getElementById("game-board");
const statusText = document.getElementById("status");
const scoreDisplay = document.getElementById("score");
const loginScreen = document.getElementById("login-screen");
const levelScreen = document.getElementById("level-screen");
const gameScreen = document.getElementById("game-screen");
const congratsScreen = document.getElementById("congrats-screen");
const welcomeMsg = document.getElementById("welcome-msg");
const winnerNameSpan = document.getElementById("winner-name");
const playerNameInput = document.getElementById("player-name");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const timerDisplay = document.getElementById("timer");
const retryBtn = document.getElementById("retry-btn");

let timer;
let timeLeft = 60;

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
let score = 0;
let playerName = "";
let totalCards = 16; // varsayılan 16 kart

// --- Kullanıcı adı girip Başlat'a basınca ---
// login ekranı gizlenecek, seviye ekranı açılacak
startBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (name.length < 2) {
    alert("Lütfen en az 2 karakterlik kullanıcı adı giriniz.");
    return;
  }
  playerName = name;

  loginScreen.classList.add("hidden");
  levelScreen.classList.remove("hidden");
});

// --- Seviye seçimi butonlarına tıklanma olayı ---
// Seçilen seviyeye göre kart sayısını ayarla ve oyunu başlat
const levelButtons = document.querySelectorAll(".level-btn");
levelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const level = btn.dataset.level;
    switch (level) {
      case "easy":
        totalCards = 12;
        break;
      case "medium":
        totalCards = 16;
        break;
      case "hard":
        totalCards = 20;
        break;
      default:
        totalCards = 16;
    }

    welcomeMsg.innerText = `Hoşgeldin, ${playerName}! Seviye: ${btn.innerText}`;
    levelScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    resetGame();
    startTimer();
  });
});

// --- Oyun başlangıcı ve kart oluşturma ---
function initGame() {
  gameBoard.innerHTML = "";
  matches = 0;
  score = 0;
  updateScore();
  statusText.innerText = "Eşleşmeleri bul!";
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  // totalCards çift sayı olmalı, yarısı emoji sayısı kadar olmalı
  // Örneğin totalCards=12 ise 6 farklı emoji kullanacağız
  const neededPairs = totalCards / 2;

  // emojis dizisinden sadece ihtiyaç kadar emoji seç
  const selectedEmojis = emojis.slice(0, neededPairs);
  const cards = [...selectedEmojis, ...selectedEmojis];
  cards.sort(() => 0.5 - Math.random());

  cards.forEach((emoji) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.emoji = emoji;
    card.innerText = "";
    card.addEventListener("click", flipCard);
    gameBoard.appendChild(card);
  });
}

// Kart çevirme, eşleşme kontrol vs (mevcut kodun aynısı)
function flipCard() {
  if (
    lockBoard ||
    this.classList.contains("flipped") ||
    this.classList.contains("matched")
  )
    return;

  this.classList.add("flipped");
  this.innerText = this.dataset.emoji;

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;

  checkMatch();
}

function checkMatch() {
  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matches++;
    increaseScore(10);

    if (matches === totalCards / 2) {
      clearInterval(timer);
      setTimeout(() => {
        gameScreen.classList.add("hidden");
        winnerNameSpan.innerText = playerName;
        document.getElementById(
          "final-score"
        ).innerText = `Toplam Skorunuz: ${score}`;
        congratsScreen.classList.remove("hidden");
        playConfetti();
      }, 1000);
    } else {
      statusText.innerText = `Eşleşme! Bulunan çift sayısı: ${matches}`;
    }
    resetTurn();
  } else {
    decreaseScore(2);
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      firstCard.innerText = "";
      secondCard.innerText = "";
      resetTurn();
    }, 1500);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function increaseScore(points) {
  score += points;
  updateScore();
}

function decreaseScore(points) {
  score -= points;
  updateScore();
}

function updateScore() {
  scoreDisplay.innerText = score;
}

function resetGame() {
  clearInterval(timer);
  initGame();
  statusText.innerText = "Eşleşmeleri bul!";
  lockBoard = false;
  timeLeft = 60;
  updateTimerDisplay();
}

function playConfetti() {
  let count = 0;
  const confettiInterval = setInterval(() => {
    if (count > 30) {
      clearInterval(confettiInterval);
      return;
    }
    const emoji = document.createElement("div");
    emoji.innerText = "🎉";
    emoji.style.position = "fixed";
    emoji.style.left = Math.random() * window.innerWidth + "px";
    emoji.style.top = "-50px";
    emoji.style.fontSize = "2rem";
    emoji.style.opacity = "0.8";
    emoji.style.userSelect = "none";
    emoji.style.transition = "top 2s ease-out, opacity 2s ease-out";
    document.body.appendChild(emoji);
    setTimeout(() => {
      emoji.style.top = window.innerHeight + 50 + "px";
      emoji.style.opacity = "0";
    }, 10);
    setTimeout(() => {
      document.body.removeChild(emoji);
    }, 2100);
    count++;
  }, 100);
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 60;
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);
      timeExpired();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerDisplay.innerText = `⏳ ${timeLeft} sn`;
}

function timeExpired() {
  lockBoard = true;

  const allCards = document.querySelectorAll(".card");
  allCards.forEach((card) => {
    if (!card.classList.contains("flipped")) {
      card.classList.add("flipped");
      card.innerText = card.dataset.emoji;
    }
    card.style.pointerEvents = "none";
  });
  document.getElementById("timeout-message").classList.remove("hidden");
}

// Süre dolunca çıkan mesajdaki "Tekrar Dene" butonu
retryBtn.addEventListener("click", () => {
  document.getElementById("timeout-message").classList.add("hidden"); // mesajı gizle
  lockBoard = false; // kartlara tıklamaya izin ver
  resetGame(); // oyunu sıfırla (kartlar, skor, eşleşmeler)
  startTimer(); // timerı başlat
});

// Tebrikler ekranından tekrar oynama
restartBtn.addEventListener("click", () => {
  congratsScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resetGame();
  startTimer();
});
