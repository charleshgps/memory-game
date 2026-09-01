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
        // Bronze — os 5 principais
        { id: 'seiya', name: 'Seiya · Pégaso', emoji: '🐎', image: 'seiya', saga: 'santuario', tier: 'bronze' },
        { id: 'shiryu', name: 'Shiryu · Dragão', emoji: '🐉', image: 'shiryu', saga: 'santuario', tier: 'bronze' },
        { id: 'hyoga', name: 'Hyoga · Cisne', emoji: '🦢', image: 'hyoga', saga: 'santuario', tier: 'bronze' },
        { id: 'shun', name: 'Shun · Andrômeda', emoji: '⭐', image: 'shun', saga: 'santuario', tier: 'bronze' },
        { id: 'ikki', name: 'Ikki · Fênix', emoji: '🔥', image: 'ikki', saga: 'santuario', tier: 'bronze' },
        // Prata — Cavaleiros que enfrentam os Cavaleiros de Bronze na saga do Santuário
        { id: 'marin', name: 'Marin · Águia', emoji: '🦅', image: 'marin', saga: 'santuario', tier: 'prata' },
        { id: 'shaina', name: 'Shaina · Ofiúco', emoji: '🐍', image: 'shaina', saga: 'santuario', tier: 'prata' },
        { id: 'misty', name: 'Misty · Lagarto', emoji: '🦎', image: 'misty', saga: 'santuario', tier: 'prata' },
        { id: 'jamian', name: 'Jamian · Corvo', emoji: '🐦‍⬛', image: 'jamian', saga: 'santuario', tier: 'prata' },
        { id: 'argol', name: 'Argol · Perseu', emoji: '🗿', image: 'argol', saga: 'santuario', tier: 'prata' },
        { id: 'babel', name: 'Babel · Centauro', emoji: '🏹', image: 'babel', saga: 'santuario', tier: 'prata' },
        { id: 'capella', name: 'Capella · Cão Maior', emoji: '🐕', image: 'capella', saga: 'santuario', tier: 'prata' },
        { id: 'orfeu', name: 'Orfeu · Lira', emoji: '🎵', image: 'orfeu', saga: 'santuario', tier: 'prata' },
        // Ouro — já representados no deck Zodíaco; aqui ficam como fallback
        // emoji até virarem uma leva própria (ex.: renderizados como pessoa,
        // não como a casa)
        { id: 'saori', name: 'Saori · Athena', emoji: '🕊️', saga: 'santuario', tier: 'deusa' },
        { id: 'mu', name: 'Mu · Áries', emoji: '🐏', saga: 'santuario', tier: 'ouro' },
        { id: 'aioria', name: 'Aioria · Leão', emoji: '🦁', saga: 'santuario', tier: 'ouro' },
        { id: 'milo', name: 'Milo · Escorpião', emoji: '🦂', saga: 'santuario', tier: 'ouro' },
        { id: 'camus', name: 'Camus · Aquário', emoji: '❄️', saga: 'santuario', tier: 'ouro' },
        { id: 'saga', name: 'Saga · Gêmeos', emoji: '🌓', saga: 'santuario', tier: 'ouro' },
        { id: 'shaka', name: 'Shaka · Virgem', emoji: '🕉️', saga: 'santuario', tier: 'ouro' },
        // Ásgard — os 8 Guerreiros Deuses (saga anime-only "Ring de Hilda")
        { id: 'siegfried', name: 'Siegfried · Dubhe', emoji: '🐺', image: 'siegfried', saga: 'asgard', tier: 'deus-guerreiro' },
        { id: 'hagen', name: 'Hägen · Merak', emoji: '🐎', image: 'hagen', saga: 'asgard', tier: 'deus-guerreiro' },
        { id: 'thor', name: 'Thor · Phecda', emoji: '⚡', image: 'thor', saga: 'asgard', tier: 'deus-guerreiro' },
        { id: 'alberich', name: 'Alberich · Megrez', emoji: '🗡️', image: 'alberich', saga: 'asgard', tier: 'deus-guerreiro' },
        { id: 'fenrir', name: 'Fenrir · Alioth', emoji: '🐋', image: 'fenrir', saga: 'asgard', tier: 'deus-guerreiro' },
        { id: 'mime', name: 'Mime · Benetnasch', emoji: '🎻', image: 'mime', saga: 'asgard', tier: 'deus-guerreiro' },
        { id: 'syd', name: 'Syd · Mizar', emoji: '🌪️', image: 'syd', saga: 'asgard', tier: 'deus-guerreiro' },
        { id: 'bud', name: 'Bud · Alcor', emoji: '🌙', image: 'bud', saga: 'asgard', tier: 'deus-guerreiro' },
        // Poseidon — as 8 Marinas (Generais Marinha)
        { id: 'kanon', name: 'Kanon · Dragão Marinho', emoji: '🌊', image: 'kanon', saga: 'poseidon', tier: 'marina' },
        { id: 'sorrento', name: 'Sorrento · Sereia', emoji: '🎶', image: 'sorrento', saga: 'poseidon', tier: 'marina' },
        { id: 'isaak', name: 'Isaak · Kraken', emoji: '🐙', image: 'isaak', saga: 'poseidon', tier: 'marina' },
        { id: 'io', name: 'Io · Cila', emoji: '🐍', image: 'io', saga: 'poseidon', tier: 'marina' },
        { id: 'krishna', name: 'Krishna · Chrysaor', emoji: '🔱', image: 'krishna', saga: 'poseidon', tier: 'marina' },
        { id: 'baian', name: 'Baian · Cavalo Marinho', emoji: '🐴', image: 'baian', saga: 'poseidon', tier: 'marina' },
        { id: 'thetis', name: 'Thetis · Sereia', emoji: '🧜‍♀️', image: 'thetis', saga: 'poseidon', tier: 'marina' },
        { id: 'caca', name: 'Caça · Lyumnades', emoji: '🏹', image: 'caca', saga: 'poseidon', tier: 'marina' },
    ];

    // Sagas do deck "Cavaleiros" — cada uma filtra `knights` pelo campo
    // `saga`. Conforme novas sagas ganham arte, entram aqui.
    const sagas = {
        santuario: { id: 'santuario', label: 'Santuário' },
        asgard: { id: 'asgard', label: 'Ásgard' },
        poseidon: { id: 'poseidon', label: 'Poseidon' },
    };

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
        saga: 'game-saga',
        countdown: 'game-countdown',
        ranking: 'sanctuary-ranking',
    };

    return { houses, knights, sagas, difficulties, decks, STORAGE_KEYS };
})();
