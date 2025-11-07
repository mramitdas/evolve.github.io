import { loadConfig } from "./config.js";
let config = null;

(async () => {
    config = await loadConfig();
})();


// SHA-256 helper
async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// DOM elements
const loginModal = document.getElementById("loginModal");
const errorModal = document.getElementById("errorModal");
const errorCloseBtn = document.getElementById("errorCloseBtn");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loader = document.getElementById("loader");
const app = document.getElementById("app");
const navbar = document.getElementById("navbar");

// Load table.html internally
async function loadTablePage() {
    loader.classList.remove("hidden");

    const response = await fetch("table.html");
    const html = await response.text();
    app.innerHTML = html;

    loader.classList.add("hidden");
}

// LOGIN handler
loginBtn.onclick = async () => {
    const pass = passwordInput.value.trim();
    const hash = await sha256(pass);

    if (hash === config.ADMIN_PASSWORD_HASH) {
        // Hide login modal, enable app
        loginModal.classList.add("hidden");
        app.classList.remove("blurred");
        navbar.classList.remove("hidden");
        localStorage.setItem("loggedIn", "true");

        await loadTablePage();
    } else {
        errorModal.classList.remove("hidden");
    }
};

errorCloseBtn.onclick = () => {
    errorModal.classList.add("hidden");
    passwordInput.value = "";
};

// DARK / LIGHT Mode
document.getElementById("modeToggle").onclick = () => {
    document.documentElement.classList.toggle("dark");
};

// LOGOUT
document.getElementById("logoutBtn").onclick = () => {
    window.location.reload();
    localStorage.removeItem("loggedIn");
};

// ---------- Table functions (make global so inline handlers work) ----------

window.filterTable = function () {
    const inputEl = document.getElementById('searchInput');
    if (!inputEl) return;
    const query = inputEl.value.toLowerCase();
    const rows = document.querySelectorAll('#userTable tbody tr');

    rows.forEach(row => {
        const nameEl = row.querySelector('.name');
        const phoneEl = row.querySelector('.phone');
        const name = nameEl ? nameEl.textContent.toLowerCase() : '';
        const phone = phoneEl ? phoneEl.textContent.toLowerCase() : '';

        row.style.display = (name.includes(query) || phone.includes(query)) ? '' : 'none';
    });
};

// Sort only the status column (Active / Inactive)
let statusAsc = true;
window.sortStatusColumn = function () {
    const table = document.getElementById('userTable');
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    rows.sort((a, b) => {
        const aStatusEl = a.querySelector('.status-text');
        const bStatusEl = b.querySelector('.status-text');
        const aStatus = aStatusEl ? aStatusEl.textContent.trim() : '';
        const bStatus = bStatusEl ? bStatusEl.textContent.trim() : '';

        return statusAsc ? aStatus.localeCompare(bStatus) : bStatus.localeCompare(aStatus);
    });

    statusAsc = !statusAsc;
    const tbody = table.querySelector('tbody');
    rows.forEach(r => tbody.appendChild(r));
};

