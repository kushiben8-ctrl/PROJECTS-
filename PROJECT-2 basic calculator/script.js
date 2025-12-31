

const display = document.getElementById("display");
const keys = document.querySelector(".keys");

keys.addEventListener("click", (e) => {
    const key = e.target;
    if (!key.classList.contains("key")) return;

    const value = key.dataset.value;
    const action = key.dataset.action;

    if (value) {
        display.value += value;
    }

    if (action === "clear") {
        display.value = "";
    }

    if (action === "backspace") {
        display.value = display.value.slice(0, -1);
    }

    if (action === "percent") {
        display.value = display.value / 100;
    }

    if (action === "sqrt") {
        display.value = Math.sqrt(display.value);
    }

    if (action === "equals") {
        calculate();
    }
});

function calculate() {
    try {
        if (display.value === "") return;
        display.value = eval(display.value);
    } catch {
        display.value = "Error";
    }
}



document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (!isNaN(key)) {
        display.value += key;
    }
    else if (["+", "-", "*", "/"].includes(key)) {
        display.value += key;
    }
    else if (key === ".") {
        display.value += ".";
    }
    else if (key === "Enter") {
        e.preventDefault();
        calculate();
    }
    else if (key === "Backspace") {
        display.value = display.value.slice(0, -1);
    }
    else if (key === "Escape") {
        display.value = "";
    }
});

const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;


const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    html.setAttribute("data-theme", "dark");
    themeToggle.textContent = "LIGHT";
} else {
    themeToggle.textContent = "DARK";
}


themeToggle.addEventListener("click", () => {
    const isDark = html.getAttribute("data-theme") === "dark";

    if (isDark) {
        html.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "DARK";
    } else {
        html.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "LIGHT";
    }
});
