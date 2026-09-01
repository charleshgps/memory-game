const config = window.GAME_CONFIG;

const createElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

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

// Top 1, 2 e 3 recebem a cor de uma armadura (Ouro, Prata, Bronze),
// remetendo à hierarquia dos Cavaleiros
const medalClasses = ['medal-gold', 'medal-silver', 'medal-bronze'];

const createRankingItem = (entry, position) => {
    const item = createElement('li', `ranking-item ${medalClasses[position] || ''}`);

    const top = createElement('div', 'ranking-top');

    const positionSpan = createElement('span', 'ranking-position');
    positionSpan.textContent = `${position + 1}º`;

    const avatarSpan = createElement('span', 'ranking-avatar');
    if (entry.avatar) {
        avatarSpan.style.backgroundImage = `url('../images/${entry.avatar}.png')`;
    }

    const nameSpan = createElement('span', 'ranking-name');
    nameSpan.textContent = entry.name || '—';

    const scoreSpan = createElement('span', 'ranking-score');
    scoreSpan.textContent = `${entry.score ?? 0} pts`;

    top.appendChild(positionSpan);
    top.appendChild(avatarSpan);
    top.appendChild(nameSpan);
    top.appendChild(scoreSpan);

    const details = createElement('div', 'ranking-details');

    const difficultyLabel = config.difficulties[entry.difficulty]?.label || '—';
    const deckLabel = config.decks[entry.deck]?.label || '—';
    const modeLabel = entry.countdown ? '⏱ contra o relógio' : '';

    details.textContent = [
        difficultyLabel,
        deckLabel,
        `${entry.time ?? '—'}s`,
        `${entry.moves ?? '—'} mov.`,
        `combo ${entry.bestStreak ?? 0}`,
        modeLabel,
    ].filter(Boolean).join(' · ');

    item.appendChild(top);
    item.appendChild(details);

    return item;
}

const renderRanking = () => {
    const list = document.querySelector('[data-role="ranking-list"]');
    const empty = document.querySelector('[data-role="ranking-empty"]');
    const ranking = readRanking();

    if (!list || !empty) {
        return;
    }

    if (ranking.length === 0) {
        empty.hidden = false;
        return;
    }

    ranking.forEach((entry, position) => {
        list.appendChild(createRankingItem(entry, position));
    });
}

window.onload = renderRanking;
