// Configuração compartilhada entre login, jogo e ranking.
// Carregado como script global simples (sem bundler/módulos no projeto).
window.GAME_CONFIG = (() => {

    // Ordem canônica das 12 Casas do Santuário (mesma ordem do zodíaco)
    const houses = [
        { id: 'aries', name: 'Áries' },
        { id: 'touro', name: 'Touro' },
        { id: 'gemeos', name: 'Gêmeos' },
        { id: 'cancer', name: 'Câncer' },
        { id: 'leao', name: 'Leão' },
        { id: 'virgem', name: 'Virgem' },
        { id: 'libra', name: 'Libra' },
        { id: 'escorpiao', name: 'Escorpião' },
        { id: 'sagitario', name: 'Sagitário' },
        { id: 'capricornio', name: 'Capricórnio' },
        { id: 'aquario', name: 'Aquário' },
        { id: 'peixes', name: 'Peixes' },
    ];

    // Deck alternativo: Cavaleiros. Personagens com arte real da Cloth usam
    // `image` (arquivo em images/knights/); os demais caem no fallback
    // emoji + nome até ganharem arte própria (saga a saga).
    const knights = [
        { id: 'seiya', name: 'Seiya · Pégaso', emoji: '🐎', image: 'seiya', saga: 'santuario' },
        { id: 'shiryu', name: 'Shiryu · Dragão', emoji: '🐉', image: 'shiryu', saga: 'santuario' },
        { id: 'hyoga', name: 'Hyoga · Cisne', emoji: '🦢', image: 'hyoga', saga: 'santuario' },
        { id: 'shun', name: 'Shun · Andrômeda', emoji: '⭐', image: 'shun', saga: 'santuario' },
        { id: 'ikki', name: 'Ikki · Fênix', emoji: '🔥', image: 'ikki', saga: 'santuario' },
        { id: 'saori', name: 'Saori · Athena', emoji: '🕊️', saga: 'santuario' },
        { id: 'mu', name: 'Mu · Áries', emoji: '🐏', saga: 'santuario' },
        { id: 'aioria', name: 'Aioria · Leão', emoji: '🦁', saga: 'santuario' },
        { id: 'milo', name: 'Milo · Escorpião', emoji: '🦂', saga: 'santuario' },
        { id: 'camus', name: 'Camus · Aquário', emoji: '❄️', saga: 'santuario' },
        { id: 'saga', name: 'Saga · Gêmeos', emoji: '🌓', saga: 'santuario' },
        { id: 'shaka', name: 'Shaka · Virgem', emoji: '🕉️', saga: 'santuario' },
    ];

    const difficulties = {
        bronze: { id: 'bronze', label: 'Bronze', pairs: 6, timeLimit: 60 },
        prata: { id: 'prata', label: 'Prata', pairs: 9, timeLimit: 100 },
        ouro: { id: 'ouro', label: 'Ouro', pairs: 12, timeLimit: 150 },
    };

    const decks = {
        zodiaco: { id: 'zodiaco', label: 'Zodíaco', items: houses },
        cavaleiros: { id: 'cavaleiros', label: 'Cavaleiros', items: knights },
    };

    const STORAGE_KEYS = {
        player: 'player',
        avatar: 'player-avatar',
        difficulty: 'game-difficulty',
        deck: 'game-deck',
        countdown: 'game-countdown',
        ranking: 'sanctuary-ranking',
    };

    return { houses, knights, difficulties, decks, STORAGE_KEYS };
})();
