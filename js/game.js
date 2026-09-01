const config = window.GAME_CONFIG;

const grid = document.querySelector('.grid');
const spanPlayer = document.querySelector('.player');
const avatarBadge = document.querySelector('[data-role="avatar-badge"]');
const timer = document.querySelector('.timer');
const timerLabel = document.querySelector('[data-role="timer-label"]');
const spanMoves = document.querySelector('.moves');
const spanStreak = document.querySelector('.streak');
const progressContainer = document.querySelector('.houses');
const progressTitle = document.querySelector('[data-role="houses-title"]');
const progressLabel = document.querySelector('[data-role="houses-progress"]');
const audioPlayer = document.querySelector('[data-role="audio-player"]');

const victoryModal = document.querySelector('[data-role="victory-modal"]');
const victoryTitle = document.querySelector('[data-role="modal-title"]');
const victoryMessage = document.querySelector('[data-role="modal-message"]');
const playAgainButton = document.querySelector('[data-role="play-again"]');
const shareButton = document.querySelector('[data-role="share-button"]');

const gameOverModal = document.querySelector('[data-role="gameover-modal"]');
const gameOverMessage = document.querySelector('[data-role="gameover-message"]');
const retryButton = document.querySelector('[data-role="retry-button"]');

const MAX_RANKING_ENTRIES = 10;
const INITIAL_VOLUME = 0.1; // jogo sempre começa com volume em 10%
const MAX_STREAK_MULTIPLIER_STEPS = 5;
const TIME_BONUS_CEILING = 300; // teto (em segundos) usado no bônus de tempo da pontuação

// Título conquistado conforme a posição alcançada no Quadro de Honra
const TITLES = [
    { max: 1, title: 'Cavaleiro de Ouro' },
    { max: 3, title: 'Cavaleiro de Prata' },
    { max: 10, title: 'Cavaleiro de Bronze' },
];

const createElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

// --- Estado da partida ---
let firstCard = '';
let secondCard = '';
let loop = null;
let moves = 0;
let streak = 0;
let bestStreak = 0;
let score = 0;
let elapsedSeconds = 0;
let openedItems = 0;
let locked = false;
let settings = null;
let activeItems = [];
let difficultyConfig = null;

// --- Efeitos sonoros via Web Audio API (sem depender de arquivos externos) ---
let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = AudioContextClass ? new AudioContextClass() : null;
        } catch (error) {
            console.error('Web Audio API indisponível:', error);
        }
    }
    return audioCtx;
}

const playTone = (frequency, duration = 0.15, type = 'sine', volume = 0.12) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => { });
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
}

const sfx = {
    flip: () => playTone(440, 0.08, 'triangle', 0.07),
    match: () => {
        playTone(660, 0.12, 'sine', 0.12);
        setTimeout(() => playTone(880, 0.15, 'sine', 0.12), 100);
    },
    mismatch: () => playTone(160, 0.25, 'sawtooth', 0.08),
    victory: () => {
        [523, 659, 784, 1046].forEach((freq, i) => setTimeout(() => playTone(freq, 0.2, 'sine', 0.12), i * 120));
    },
    gameOver: () => {
        [392, 349, 293, 220].forEach((freq, i) => setTimeout(() => playTone(freq, 0.3, 'sawtooth', 0.1), i * 150));
    },
};

// --- Configuração vinda do login ---
const readSettings = () => {
    try {
        const player = localStorage.getItem(config.STORAGE_KEYS.player);

        if (!player) {
            return null;
        }

        return {
            player,
            avatar: localStorage.getItem(config.STORAGE_KEYS.avatar) || config.houses[0].id,
            difficulty: localStorage.getItem(config.STORAGE_KEYS.difficulty) || 'bronze',
            deck: localStorage.getItem(config.STORAGE_KEYS.deck) || 'zodiaco',
            countdown: localStorage.getItem(config.STORAGE_KEYS.countdown) === 'true',
        };
    } catch (error) {
        console.error('Não foi possível acessar o armazenamento local:', error);
        return null;
    }
}

// Fisher-Yates: garante embaralhamento uniforme
const shuffle = (array) => {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// Trava o grid durante a resolução de uma jogada, evitando cliques
// simultâneos em uma terceira carta enquanto o par ainda está sendo avaliado
const setLocked = (value) => {
    locked = value;
    grid.classList.toggle('locked', value);
}

// --- Quadro de Honra ---
const readRanking = () => {
    try {
        const raw = localStorage.getItem(config.STORAGE_KEYS.ranking);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Não foi possível ler o Quadro de Honra:', error);
        return [];
    }
}

const saveScore = (entry) => {
    try {
        const entries = readRanking();
        entries.push(entry);
        entries.sort((a, b) => (b.score || 0) - (a.score || 0) || (a.time || Infinity) - (b.time || Infinity));

        const position = entries.findIndex((item) => item === entry) + 1;

        localStorage.setItem(config.STORAGE_KEYS.ranking, JSON.stringify(entries.slice(0, MAX_RANKING_ENTRIES)));

        return position;
    } catch (error) {
        console.error('Não foi possível salvar no Quadro de Honra:', error);
        return null;
    }
}

const getTitleForPosition = (position) => {
    if (!position) {
        return 'Aspirante a Cavaleiro';
    }

    const tier = TITLES.find((item) => position <= item.max);
    return tier ? tier.title : 'Aspirante a Cavaleiro';
}

// --- Progresso (Casas do Santuário / Cavaleiros revelados) ---
const openProgressItem = (id) => {
    const el = progressContainer.querySelector(`[data-character="${id}"]`);

    if (!el) {
        return;
    }

    el.classList.add('opened');
    openedItems += 1;

    if (progressLabel) {
        const noun = settings.deck === 'cavaleiros' ? 'Cavaleiros revelados' : 'Casas abertas';
        progressLabel.textContent = `${openedItems}/${activeItems.length} ${noun}`;
    }
}

const createProgressItems = () => {
    activeItems.forEach((item, index) => {
        const el = createElement('li', 'house');
        el.setAttribute('data-character', item.id);

        if (settings.deck === 'cavaleiros') {
            el.classList.add('house-emoji');
            el.textContent = item.emoji;
            el.title = item.name;
        } else {
            el.style.backgroundImage = `url('../images/${item.id}.png')`;
            el.title = `Casa ${index + 1}: ${item.name}`;
        }

        progressContainer.appendChild(el);
    });

    const noun = settings.deck === 'cavaleiros' ? 'Cavaleiros revelados' : 'Casas abertas';

    if (progressTitle) {
        progressTitle.textContent = settings.deck === 'cavaleiros'
            ? 'Cavaleiros no campo de batalha'
            : 'Progresso pelas Casas do Santuário';
    }

    if (progressLabel) {
        progressLabel.textContent = `0/${activeItems.length} ${noun}`;
    }
}

// --- Pontuação e combo ---
const registerMatch = () => {
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);

    const multiplier = 1 + Math.min(streak - 1, MAX_STREAK_MULTIPLIER_STEPS) * 0.2;
    score += Math.round(100 * multiplier);

    spanStreak.textContent = streak;
}

const registerMismatch = () => {
    streak = 0;
    spanStreak.textContent = streak;
}

// --- Fim de jogo ---
const buildResultText = (title) => {
    return `${settings.player} atravessou o Santuário em ${elapsedSeconds}s com ${moves} movimentos, combo máximo de ${bestStreak} e ${score} pontos! Título: ${title}. 🏆 #MemoryGameCavaleirosDoZodiaco`;
}

const shareResult = async (text) => {
    if (navigator.share) {
        try {
            await navigator.share({ text, title: 'Memory Game | Cavaleiros do Zodíaco' });
            return;
        } catch (error) {
            // usuário cancelou o compartilhamento nativo — cai no fallback de clipboard
        }
    }

    try {
        await navigator.clipboard.writeText(text);
        alert('Resultado copiado para a área de transferência!');
    } catch (error) {
        console.error('Não foi possível compartilhar o resultado:', error);
        alert('Não foi possível compartilhar automaticamente. Copie seu resultado manualmente.');
    }
}

const showVictoryModal = (title) => {
    if (!victoryModal || !victoryMessage) {
        alert(buildResultText(title));
        return;
    }

    if (victoryTitle) {
        victoryTitle.textContent = title;
    }

    victoryMessage.textContent = `Tempo: ${elapsedSeconds}s · Movimentos: ${moves} · Combo máximo: ${bestStreak} · Pontos: ${score}`;
    victoryModal.hidden = false;

    if (shareButton) {
        shareButton.onclick = () => shareResult(buildResultText(title));
    }
}

const showGameOverModal = () => {
    setLocked(true);

    if (!gameOverModal) {
        alert('Seu Cosmo se apagou antes de atravessar o Santuário. Tente novamente!');
        return;
    }

    if (gameOverMessage) {
        gameOverMessage.textContent = `O tempo acabou! Você abriu ${openedItems}/${activeItems.length} com ${moves} movimentos.`;
    }

    gameOverModal.hidden = false;
}

const checkEndGame = () => {
    const disabledCards = document.querySelectorAll('.disabled-card');

    if (disabledCards.length === activeItems.length * 2) {
        clearInterval(loop);

        const timeBonus = Math.max(0, TIME_BONUS_CEILING - elapsedSeconds) * 2;
        score += timeBonus;

        const entry = {
            name: settings.player,
            avatar: settings.avatar,
            deck: settings.deck,
            difficulty: settings.difficulty,
            countdown: settings.countdown,
            score,
            time: elapsedSeconds,
            moves,
            bestStreak,
            date: new Date().toLocaleDateString('pt-BR'),
        };

        const position = saveScore(entry);
        const title = getTitleForPosition(position);

        sfx.victory();
        showVictoryModal(title);
    }
}

const checkCards = () => {
    moves += 1;
    spanMoves.textContent = moves;

    const firstCharacter = firstCard.getAttribute('data-character');
    const secondCharacter = secondCard.getAttribute('data-character');

    if (firstCharacter === secondCharacter) {

        firstCard.firstChild.classList.add('disabled-card');
        secondCard.firstChild.classList.add('disabled-card');

        openProgressItem(firstCharacter);
        registerMatch();
        sfx.match();

        firstCard = '';
        secondCard = '';
        setLocked(false);

        checkEndGame();

    } else {
        sfx.mismatch();

        setTimeout(() => {

            firstCard.classList.remove('reveal-card');
            secondCard.classList.remove('reveal-card');

            firstCard = '';
            secondCard = '';
            setLocked(false);
            registerMismatch();

        }, 500);
    }

}

const revealCard = ({ target }) => {

    if (locked) {
        return;
    }

    // closest(): o alvo do clique pode ser um elemento aninhado (ex.: o nome
    // do Cavaleiro no modo "Cavaleiros"), não só a face da carta
    const cardWrapper = target.closest('.card');

    if (!cardWrapper || cardWrapper.className.includes('reveal-card')) {
        return;
    }

    sfx.flip();

    if (firstCard === '') {

        cardWrapper.classList.add('reveal-card');
        firstCard = cardWrapper;

    } else if (secondCard === '') {

        cardWrapper.classList.add('reveal-card');
        secondCard = cardWrapper;
        setLocked(true);

        checkCards();

    }
}

const renderCardFace = (front, item) => {
    if (settings.deck === 'cavaleiros') {
        front.classList.add('knight-face');

        const emojiSpan = createElement('span', 'knight-emoji');
        emojiSpan.textContent = item.emoji;

        const nameSpan = createElement('span', 'knight-name');
        nameSpan.textContent = item.name;

        front.appendChild(emojiSpan);
        front.appendChild(nameSpan);
    } else {
        front.style.backgroundImage = `url('../images/${item.id}.png')`;
    }
}

const createCard = (item) => {

    const card = createElement('div', 'card');
    const front = createElement('div', 'face front');
    const back = createElement('div', 'face back');

    renderCardFace(front, item);

    card.appendChild(front);
    card.appendChild(back);

    card.addEventListener('click', revealCard);
    card.setAttribute('data-character', item.id)

    return card;
}

const loadGame = () => {
    const duplicatedItems = shuffle([...activeItems, ...activeItems]);
    const columns = duplicatedItems.length <= 12 ? 4 : 6;

    grid.style.setProperty('--columns', columns);

    duplicatedItems.forEach((item) => {
        const card = createCard(item);
        grid.appendChild(card);
    });
}

const startTimer = () => {

    if (settings.countdown) {
        timer.textContent = difficultyConfig.timeLimit;
        if (timerLabel) timerLabel.textContent = 'Tempo restante';
    } else if (timerLabel) {
        timerLabel.textContent = 'Tempo';
    }

    loop = setInterval(() => {
        elapsedSeconds += 1;

        if (settings.countdown) {
            const remaining = Math.max(difficultyConfig.timeLimit - elapsedSeconds, 0);
            timer.textContent = remaining;

            if (remaining <= 0) {
                clearInterval(loop);
                sfx.gameOver();
                showGameOverModal();
            }
        } else {
            timer.textContent = elapsedSeconds;
        }
    }, 1000);

}

if (playAgainButton) {
    playAgainButton.addEventListener('click', () => window.location.reload());
}

if (retryButton) {
    retryButton.addEventListener('click', () => window.location.reload());
}

window.onload = () => {
    settings = readSettings();

    // Sem jogador salvo (acesso direto à página, sem passar pelo login)
    if (!settings) {
        window.location = '../index.html';
        return;
    }

    difficultyConfig = config.difficulties[settings.difficulty] || config.difficulties.bronze;
    const deckConfig = config.decks[settings.deck] || config.decks.zodiaco;
    activeItems = deckConfig.items.slice(0, difficultyConfig.pairs);

    spanPlayer.textContent = settings.player;

    if (avatarBadge) {
        avatarBadge.style.backgroundImage = `url('../images/${settings.avatar}.png')`;
        avatarBadge.title = settings.player;
    }

    if (audioPlayer) {
        audioPlayer.volume = INITIAL_VOLUME;
        // play() via JS (em vez do atributo autoplay) permite capturar o bloqueio
        // que navegadores aplicam a áudio com som após a navegação de página
        audioPlayer.play().catch(() => { });
    }

    createProgressItems();
    loadGame();
    startTimer();
}
