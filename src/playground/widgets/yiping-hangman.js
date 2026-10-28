const SVG_NS = "http://www.w3.org/2000/svg";

const WORDS = [
  { word: "PROTOTYPE", category: "Design" },
  { word: "WIREFRAME", category: "Design" },
  { word: "INTERFACE", category: "UI/UX" },
  { word: "ANIMATION", category: "Motion" },
  { word: "AFFORDANCE", category: "Design" },
  { word: "COMPONENT", category: "Frontend" },
  { word: "VIEWPORT", category: "Web" },
  { word: "GRADIENT", category: "Visual" },
  { word: "KEYFRAME", category: "Motion" },
  { word: "CANVAS", category: "Creative" },
  { word: "GESTURE", category: "Interaction" },
  { word: "ITERATION", category: "Process" },
  { word: "PALETTE", category: "Color" },
  { word: "FEEDBACK", category: "UX" },
  { word: "SANDBOX", category: "Tech" },
  { word: "TYPOGRAPHY", category: "Design" },
  { word: "VARIABLE", category: "Code" },
  { word: "PLAYGROUND", category: "Creative" },
];

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const MAX_MISTAKES = 6;

export default {
  student: "Yiping Dong",
  title: "Hangman",
  frame: true,
  width: 340,
  height: 430,
  rotate: -1,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--paper, #fff);
        color: var(--ink, #111);
        font-family: "IBM Plex Mono", monospace;
        user-select: none;
        overflow: hidden;
      }

      .game-shell {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0.65rem;
        gap: 0.45rem;
        box-sizing: border-box;
      }

      .top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.72rem;
        border-bottom: 1px dashed var(--line, rgba(0, 0, 0, 0.15));
        padding-bottom: 0.35rem;
      }

      .meta-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-weight: 500;
        opacity: 0.85;
      }

      .lives-tracker {
        display: inline-flex;
        align-items: center;
        gap: 0.15rem;
        font-size: 0.78rem;
      }

      .gallows-stage {
        position: relative;
        height: 130px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--ink) 2%, transparent);
        border: 1px solid color-mix(in srgb, var(--line) 60%, transparent);
        border-radius: 8px;
        overflow: hidden;
      }

      .gallows-svg {
        width: 100%;
        height: 100%;
        stroke: var(--ink, #111);
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .scaffold {
        stroke-width: 3.5;
        fill: none;
      }

      .rope {
        stroke-width: 2;
        stroke-dasharray: 2 2;
      }

      .body-part {
        stroke-width: 3;
        fill: none;
        opacity: 0;
        transform-origin: 150px 50px;
        transition: opacity 250ms ease, transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .body-part.visible {
        opacity: 1;
        transform: scale(1);
      }

      .face-won, .face-lost {
        opacity: 0;
        transition: opacity 200ms ease;
      }

      .face-won.visible, .face-lost.visible {
        opacity: 1;
      }

      .confetti-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .confetti {
        position: absolute;
        font-size: 1.1rem;
        animation: popFloat 700ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
      }

      @keyframes popFloat {
        0% { opacity: 1; transform: translate(0, 0) scale(0.5); }
        100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.2) rotate(var(--rot)); }
      }

      .word-display {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.35rem;
        min-height: 2.2rem;
        padding: 0.2rem 0;
        overflow-x: auto;
      }

      .letter-slot {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        width: 1.55rem;
        height: 2rem;
        border-bottom: 2.5px solid var(--ink, #111);
        font-size: 1.15rem;
        font-weight: 600;
        line-height: 1.2;
        text-transform: uppercase;
        color: var(--ink);
      }

      .letter-slot.revealed {
        animation: popLetter 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .letter-slot.missed {
        color: #ef4444;
        opacity: 0.85;
      }

      @keyframes popLetter {
        0% { transform: scale(0.6); opacity: 0.2; }
        100% { transform: scale(1); opacity: 1; }
      }

      .keyboard {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        align-items: center;
      }

      .kb-row {
        display: flex;
        gap: 0.25rem;
        width: 100%;
        justify-content: center;
      }

      .key-btn {
        flex: 1;
        max-width: 2rem;
        height: 1.85rem;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
        font-size: 0.76rem;
        font-weight: 600;
        background: color-mix(in srgb, var(--paper) 88%, var(--ink));
        color: var(--ink);
        border: 1px solid var(--line, rgba(0, 0, 0, 0.15));
        border-radius: 4px;
        cursor: pointer;
        transition: transform 100ms ease, background-color 150ms ease, opacity 150ms ease;
        touch-action: manipulation;
      }

      .key-btn:hover:not(:disabled) {
        background: color-mix(in srgb, var(--paper) 68%, var(--ink));
        transform: translateY(-1px);
      }

      .key-btn:active:not(:disabled) {
        transform: scale(0.92);
      }

      .key-btn:focus-visible {
        outline: 2px solid var(--ink);
        outline-offset: 1px;
      }

      .key-btn.is-correct {
        background: #22c55e;
        color: #fff;
        border-color: #16a34a;
        opacity: 0.9;
        cursor: default;
      }

      .key-btn.is-wrong {
        opacity: 0.28;
        background: color-mix(in srgb, var(--ink) 10%, transparent);
        border-color: transparent;
        text-decoration: line-through;
        cursor: default;
      }

      .banner-overlay {
        display: none;
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--paper) 92%, transparent);
        backdrop-filter: blur(2px);
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        z-index: 10;
        padding: 1rem;
        text-align: center;
        animation: fadeIn 200ms ease;
      }

      .banner-overlay.visible {
        display: flex;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .banner-title {
        font-size: 1.15rem;
        font-weight: 700;
      }

      .banner-sub {
        font-size: 0.72rem;
        opacity: 0.75;
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-top: 0.25rem;
        padding: 0.4rem 0.85rem;
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 600;
        border-radius: 6px;
        background: var(--ink);
        color: var(--paper);
        border: 1px solid var(--ink);
        cursor: pointer;
        transition: transform 120ms ease, opacity 150ms ease;
        touch-action: manipulation;
      }

      .action-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .action-btn:active {
        transform: scale(0.95);
      }

      .restart-icon-btn {
        background: none;
        border: 0;
        color: inherit;
        font-size: 0.75rem;
        font-family: inherit;
        cursor: pointer;
        opacity: 0.65;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        transition: opacity 150ms ease, transform 150ms ease;
      }

      .restart-icon-btn:hover {
        opacity: 1;
        transform: rotate(30deg);
      }

      @media (prefers-reduced-motion: reduce) {
        .body-part, .letter-slot.revealed, .confetti {
          animation: none;
          transition: none;
        }
      }
    `;

    const container = document.createElement("div");
    container.className = "game-shell";
    container.tabIndex = 0;
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Hangman Word Game");

    container.innerHTML = `
      <div class="top-row">
        <div class="meta-pill">
          <span id="categoryLabel">Category: Design</span>
        </div>
        <div class="lives-tracker" id="livesTracker" aria-live="polite" aria-label="Mistakes: 0 of 6">
          <span id="streakPill" style="margin-right: 0.4rem; font-size: 0.68rem; opacity: 0.7;">Streak: 0</span>
          <button type="button" class="restart-icon-btn" id="newWordBtn" title="New Word (↻)">↻</button>
        </div>
      </div>

      <div class="gallows-stage" id="stage">
        <div class="confetti-layer" id="confettiLayer"></div>
        <svg class="gallows-svg" viewBox="0 0 220 150" aria-hidden="true">
          <!-- Gallows Scaffold -->
          <line class="scaffold" x1="20" y1="135" x2="100" y2="135" />
          <line class="scaffold" x1="50" y1="135" x2="50" y2="20" />
          <line class="scaffold" x1="48" y1="20" x2="152" y2="20" />
          <line class="scaffold" x1="50" y1="45" x2="75" y2="20" />
          <line class="rope" x1="150" y1="20" x2="150" y2="40" />

          <!-- Body Parts (6 mistakes) -->
          <!-- 1: Head -->
          <g class="body-part" id="partHead">
            <circle cx="150" cy="53" r="13" stroke="var(--ink, #111)" stroke-width="2.8" fill="var(--paper, #fff)" />
            <!-- Normal Eyes -->
            <circle cx="146" cy="51" r="1.5" fill="var(--ink, #111)" />
            <circle cx="154" cy="51" r="1.5" fill="var(--ink, #111)" />
            <path d="M 147 58 Q 150 61 153 58" stroke="var(--ink, #111)" stroke-width="1.6" fill="none" />
          </g>

          <!-- Lost Eyes (Dead X) -->
          <g class="face-lost" id="faceLost">
            <line x1="144" y1="49" x2="148" y2="53" stroke="#ef4444" stroke-width="1.8" />
            <line x1="148" y1="49" x2="144" y2="53" stroke="#ef4444" stroke-width="1.8" />
            <line x1="152" y1="49" x2="156" y2="53" stroke="#ef4444" stroke-width="1.8" />
            <line x1="156" y1="49" x2="152" y2="53" stroke="#ef4444" stroke-width="1.8" />
            <path d="M 147 60 Q 150 56 153 60" stroke="#ef4444" stroke-width="1.8" fill="none" />
          </g>

          <!-- Won Eyes (Joy ^^) -->
          <g class="face-won" id="faceWon">
            <path d="M 144 52 Q 146 48 148 52" stroke="#22c55e" stroke-width="2" fill="none" />
            <path d="M 152 52 Q 154 48 156 52" stroke="#22c55e" stroke-width="2" fill="none" />
            <path d="M 146 58 Q 150 64 154 58" stroke="#22c55e" stroke-width="2" fill="none" />
          </g>

          <!-- 2: Spine / Torso -->
          <line class="body-part" id="partTorso" x1="150" y1="66" x2="150" y2="100" />
          <!-- 3: Left Arm -->
          <line class="body-part" id="partArmL" x1="150" y1="74" x2="132" y2="88" />
          <!-- 4: Right Arm -->
          <line class="body-part" id="partArmR" x1="150" y1="74" x2="168" y2="88" />
          <!-- 5: Left Leg -->
          <line class="body-part" id="partLegL" x1="150" y1="100" x2="135" y2="124" />
          <!-- 6: Right Leg -->
          <line class="body-part" id="partLegR" x1="150" y1="100" x2="165" y2="124" />
        </svg>

        <!-- End of Game Overlay -->
        <div class="banner-overlay" id="bannerOverlay" role="dialog" aria-modal="true">
          <div class="banner-title" id="bannerTitle">🎉 Brilliant!</div>
          <div class="banner-sub" id="bannerSub">You solved it with 2 mistakes!</div>
          <button type="button" class="action-btn" id="playAgainBtn">Play Again</button>
        </div>
      </div>

      <div class="word-display" id="wordDisplay" aria-label="Word blanks"></div>

      <div class="keyboard" id="keyboard" role="group" aria-label="Virtual keyboard">
        ${KEYBOARD_ROWS.map((row) => `
          <div class="kb-row">
            ${row.map((letter) => `
              <button type="button" class="key-btn" data-key="${letter}" aria-label="Letter ${letter}">${letter}</button>
            `).join("")}
          </div>
        `).join("")}
      </div>
    `;

    root.append(style, container);

    // References
    const categoryLabel = container.querySelector("#categoryLabel");
    const streakPill = container.querySelector("#streakPill");
    const newWordBtn = container.querySelector("#newWordBtn");
    const livesTracker = container.querySelector("#livesTracker");
    const wordDisplay = container.querySelector("#wordDisplay");
    const bannerOverlay = container.querySelector("#bannerOverlay");
    const bannerTitle = container.querySelector("#bannerTitle");
    const bannerSub = container.querySelector("#bannerSub");
    const playAgainBtn = container.querySelector("#playAgainBtn");
    const confettiLayer = container.querySelector("#confettiLayer");
    const faceLost = container.querySelector("#faceLost");
    const faceWon = container.querySelector("#faceWon");
    const keyButtons = Array.from(container.querySelectorAll(".key-btn"));

    const bodyParts = [
      container.querySelector("#partHead"),
      container.querySelector("#partTorso"),
      container.querySelector("#partArmL"),
      container.querySelector("#partArmR"),
      container.querySelector("#partLegL"),
      container.querySelector("#partLegR"),
    ];

    let currentEntry = null;
    let guessedLetters = new Set();
    let mistakeCount = 0;
    let isGameOver = false;
    let streakCount = 0;

    const fireConfetti = () => {
      confettiLayer.replaceChildren();
      const emojis = ["✨", "🎉", "🌟", "⭐", "🎊"];
      for (let i = 0; i < 14; i += 1) {
        const item = document.createElement("span");
        item.className = "confetti";
        item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        item.style.left = `${50 + (Math.random() - 0.5) * 50}%`;
        item.style.top = `${50 + (Math.random() - 0.5) * 40}%`;
        item.style.setProperty("--dx", `${(Math.random() - 0.5) * 160}px`);
        item.style.setProperty("--dy", `${-40 - Math.random() * 80}px`);
        item.style.setProperty("--rot", `${(Math.random() - 0.5) * 120}deg`);
        confettiLayer.appendChild(item);
        item.addEventListener("animationend", () => item.remove(), { once: true });
      }
    };

    const renderWord = () => {
      wordDisplay.replaceChildren();
      const word = currentEntry.word;
      for (let i = 0; i < word.length; i += 1) {
        const char = word[i];
        const slot = document.createElement("span");
        slot.className = "letter-slot";
        if (guessedLetters.has(char)) {
          slot.textContent = char;
          slot.classList.add("revealed");
        } else if (isGameOver && mistakeCount >= MAX_MISTAKES) {
          slot.textContent = char;
          slot.classList.add("missed");
        } else {
          slot.textContent = "";
        }
        wordDisplay.appendChild(slot);
      }
    };

    const updateGallows = () => {
      bodyParts.forEach((part, index) => {
        part.classList.toggle("visible", index < mistakeCount);
      });
      faceLost.classList.toggle("visible", mistakeCount >= MAX_MISTAKES);
      faceWon.classList.toggle("visible", isGameOver && mistakeCount < MAX_MISTAKES);
    };

    const handleGuess = (letter) => {
      if (isGameOver || guessedLetters.has(letter)) return;
      guessedLetters.add(letter);

      const isHit = currentEntry.word.includes(letter);
      const btn = keyButtons.find((b) => b.dataset.key === letter);
      if (btn) {
        btn.disabled = true;
        btn.classList.add(isHit ? "is-correct" : "is-wrong");
      }

      if (!isHit) {
        mistakeCount += 1;
      }

      renderWord();
      updateGallows();

      // Check win condition
      const won = currentEntry.word.split("").every((char) => guessedLetters.has(char));
      if (won) {
        isGameOver = true;
        streakCount += 1;
        streakPill.textContent = `Streak: ${streakCount} 🔥`;
        updateGallows();
        fireConfetti();
        bannerTitle.textContent = "🎉 Brilliant!";
        bannerSub.textContent = `You found "${currentEntry.word}"!`;
        bannerOverlay.classList.add("visible");
        return;
      }

      // Check lose condition
      if (mistakeCount >= MAX_MISTAKES) {
        isGameOver = true;
        streakCount = 0;
        streakPill.textContent = "Streak: 0";
        updateGallows();
        renderWord(); // Reveals missed letters in red
        bannerTitle.textContent = "💀 Game Over";
        bannerSub.textContent = `The word was "${currentEntry.word}".`;
        bannerOverlay.classList.add("visible");
      }
    };

    const startNewGame = () => {
      // Pick next word different from current
      let next;
      do {
        next = WORDS[Math.floor(Math.random() * WORDS.length)];
      } while (WORDS.length > 1 && currentEntry && next.word === currentEntry.word);

      currentEntry = next;
      guessedLetters = new Set();
      mistakeCount = 0;
      isGameOver = false;

      categoryLabel.textContent = `Category: ${currentEntry.category}`;
      bannerOverlay.classList.remove("visible");
      confettiLayer.replaceChildren();

      keyButtons.forEach((btn) => {
        btn.disabled = false;
        btn.classList.remove("is-correct", "is-wrong");
      });

      renderWord();
      updateGallows();
    };

    // Keyboard and button events
    keyButtons.forEach((btn) => {
      btn.addEventListener("click", () => handleGuess(btn.dataset.key));
    });

    newWordBtn.addEventListener("click", startNewGame);
    playAgainBtn.addEventListener("click", startNewGame);

    // Support typing physical keys
    container.addEventListener("keydown", (event) => {
      const key = event.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
      } else if (event.key === "Enter" && isGameOver) {
        startNewGame();
      }
    });

    // Start initial game
    startNewGame();
  },
};