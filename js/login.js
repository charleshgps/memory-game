const config = window.GAME_CONFIG;

const input = document.querySelector(".login_input");
const button = document.querySelector(".login_button");
const form = document.querySelector(".login-form");
const avatarGrid = document.querySelector('[data-role="avatar-grid"]');
const sagaFieldset = document.querySelector('[data-role="saga-fieldset"]');
const sagaGroup = document.querySelector('[data-role="saga-group"]');

const MIN_NAME_LENGTH = 3;
let selectedAvatar = config.houses[0].id;

const createElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

const createAvatarOption = (house, index) => {
    const label = createElement('label', 'avatar_option');

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'avatar';
    radio.value = house.id;
    if (index === 0) {
        radio.checked = true;
    }

    const swatch = createElement('span', 'avatar_swatch');
    swatch.style.backgroundImage = `url('./images/${house.id}.png')`;
    swatch.title = house.name;

    radio.addEventListener('change', () => {
        selectedAvatar = house.id;
    });

    label.appendChild(radio);
    label.appendChild(swatch);

    return label;
}

const renderAvatars = () => {
    if (!avatarGrid) {
        return;
    }

    config.houses.forEach((house, index) => {
        avatarGrid.appendChild(createAvatarOption(house, index));
    });
}

// --- Saga (só relevante pra Cavaleiros; Zodíaco sempre usa as 12 Casas) ---
const createSagaOption = (saga, index) => {
    const label = createElement('label', 'pill');

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'saga';
    radio.value = saga.id;
    if (index === 0) {
        radio.checked = true;
    }

    const span = createElement('span', '');
    span.textContent = saga.label;

    label.appendChild(radio);
    label.appendChild(span);

    return label;
}

const renderSagas = () => {
    if (!sagaGroup) {
        return;
    }

    Object.values(config.sagas).forEach((saga, index) => {
        sagaGroup.appendChild(createSagaOption(saga, index));
    });
}

const toggleSagaVisibility = () => {
    if (!sagaFieldset) {
        return;
    }

    const deck = form.querySelector('input[name="deck"]:checked')?.value || 'zodiaco';
    sagaFieldset.hidden = deck !== 'cavaleiros';
}

const validateInput = ({ target }) => {
    if (target.value.trim().length > MIN_NAME_LENGTH) {
        button.removeAttribute("disabled");
        return;
    }

    button.setAttribute("disabled", "");
};

const handleSubmit = (event) => {
    event.preventDefault();

    const name = input.value.trim();

    if (name.length <= MIN_NAME_LENGTH) {
        return;
    }

    const difficulty = form.querySelector('input[name="difficulty"]:checked')?.value || 'bronze';
    const deck = form.querySelector('input[name="deck"]:checked')?.value || 'zodiaco';
    const saga = form.querySelector('input[name="saga"]:checked')?.value || 'santuario';
    const countdown = form.querySelector('input[name="countdown"]')?.checked || false;

    try {
        localStorage.setItem(config.STORAGE_KEYS.player, name);
        localStorage.setItem(config.STORAGE_KEYS.avatar, selectedAvatar);
        localStorage.setItem(config.STORAGE_KEYS.difficulty, difficulty);
        localStorage.setItem(config.STORAGE_KEYS.deck, deck);
        localStorage.setItem(config.STORAGE_KEYS.saga, saga);
        localStorage.setItem(config.STORAGE_KEYS.countdown, String(countdown));
    } catch (error) {
        console.error("Não foi possível salvar o jogador:", error);
        alert("Não foi possível iniciar o jogo: o armazenamento local está bloqueado neste navegador.");
        return;
    }

    window.location = "pages/game.html";
};

renderAvatars();
renderSagas();
toggleSagaVisibility();
input.addEventListener("input", validateInput);
form.addEventListener("submit", handleSubmit);
form.querySelectorAll('input[name="deck"]').forEach((radio) => {
    radio.addEventListener('change', toggleSagaVisibility);
});
