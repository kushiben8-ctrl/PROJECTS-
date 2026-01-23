// React/Vue-style custom hooks with vanilla JS
class Store {
    constructor() {
        this.state = {
            currentColor: '#ffffff',
            hex: '#FFFFFF',
            flipCount: 0,
            streak: 0,
            bestStreak: 0
        };
        this.listeners = [];
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.state));
    }
}

const store = new Store();

// DOM elements
const els = {
    body: document.body,
    colorCode: document.getElementById('colorCode'),
    flipCount: document.getElementById('flipCount'),
    streak: document.getElementById('streak'),
    bestStreak: document.getElementById('bestStreak'),
    randomBtn: document.getElementById('randomBtn'),
    pastelBtn: document.getElementById('pastelBtn'),
    neonBtn: document.getElementById('neonBtn'),
    copyBtn: document.getElementById('copyBtn')
};

// Utils
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function getContrast(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}

function randomColor() {
    const r = getRandomInt(0, 255);
    const g = getRandomInt(0, 255);
    const b = getRandomInt(0, 255);
    const hex = rgbToHex(r, g, b);
    return { rgb: `rgb(${r},${g},${b})`, hex: hex.toUpperCase() };
}

function randomPastel() {
    const h = getRandomInt(0, 360);
    const s = getRandomInt(20, 50);
    const l = getRandomInt(70, 95);
    const hex = hslToHex(h, s / 100, l / 100);
    return { rgb: `hsl(${h},${s}%,${l}%)`, hex: hex.toUpperCase() };
}

function randomNeon() {
    const neons = [
        '#FF00FF', '#00FFFF', '#FFFF00', '#FF1493', '#00FF00',
        '#FF4500', '#9400D3', '#FF69B4', '#7FFF00', '#1E90FF'
    ];
    const hex = neons[getRandomInt(0, neons.length - 1)];
    const { r, g, b } = hexToRgb(hex);
    return { rgb: `rgb(${r},${g},${b})`, hex };
}

function hslToHex(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return '#' + [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
        .map(x => x.toString(16).padStart(2, '0')).join('');
}

// Event handlers
function flip(type = 'random') {
    let color;
    switch (type) {
        case 'pastel': color = randomPastel(); break;
        case 'neon': color = randomNeon(); break;
        default: color = randomColor();
    }

    store.setState({
        currentColor: color.rgb,
        hex: color.hex,
        flipCount: store.state.flipCount + 1,
        streak: store.state.streak + 1,
        bestStreak: Math.max(store.state.bestStreak, store.state.streak + 1)
    });

    els.body.classList.add('spin');
    els.colorCode.classList.remove('show');
    setTimeout(() => {
        els.colorCode.classList.add('show');
        els.body.classList.remove('spin');
    }, 400);
}

function copyHex() {
    navigator.clipboard.writeText(store.state.hex).then(() => {
        els.copyBtn.textContent = '✅ Copied!';
        els.copyBtn.classList.add('copied');
        setTimeout(() => {
            els.copyBtn.textContent = '📋 Copy HEX';
            els.copyBtn.classList.remove('copied');
        }, 1500);
    });
}

// Init app
function init() {
    store.subscribe((state) => {
        els.body.style.backgroundColor = state.currentColor;
        els.body.style.color = getContrast(state.hex.toLowerCase()) ? '#000' : '#fff';
        els.colorCode.textContent = state.hex;
        els.flipCount.textContent = state.flipCount;
        els.streak.textContent = state.streak;
        els.bestStreak.textContent = state.bestStreak;
    });

    // Event listeners
    els.randomBtn.addEventListener('click', () => flip('random'));
    els.pastelBtn.addEventListener('click', () => flip('pastel'));
    els.neonBtn.addEventListener('click', () => flip('neon'));
    els.copyBtn.addEventListener('click', copyHex);

    // Keyboard fun: Space for random
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            flip('random');
        }
    });

    // Initial render
    flip('random');
}

init();
