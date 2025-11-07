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

// ✅ Load table.html + after loading, fetch API automatically
async function loadTablePage() {
    loader.classList.remove("hidden");

    const response = await fetch("table.html");
    const html = await response.text();
    app.innerHTML = html;

    loader.classList.add("hidden");

    // ✅ After table loads → now fetch API
    fetchTableData();
}

// ✅ Fetch API data and render table rows
async function fetchTableData() {
    const tableBody = document.querySelector("#userTable tbody");
    if (!tableBody) return;

    try {
        const res = await fetch("https://3f8409b38744.ngrok-free.app/clients");
        const data = await res.json();

        tableBody.innerHTML = ""; // clear existing rows

        data.forEach((item, index) => {
            const statusLower = item.status.toLowerCase();
            const isActive = statusLower === "active";

            const row = `
                <tr class="border-b bg-gray-800 border-gray-700">
                    <td class="px-6 py-4">${index + 1}</td>

                    <th class="flex items-center px-6 py-4 whitespace-nowrap text-white">
                        <img class="w-10 h-10 rounded-full"
                             src="https://kcusrobnqpiqqiycwser.supabase.co/storage/v1/object/public/client_images/${item.phone_number}.png">
                        <div class="pl-3">
                            <div class="text-base font-semibold name">${item.name}</div>
                            <div class="text-gray-400 phone">${item.phone_number}</div>
                        </div>
                    </th>

                    <td class="px-6 py-4">${item.end_date}</td>

                    <td class="px-6 py-4 status">
                        <div class="flex items-center gap-2">
                            <span class="h-3 w-3 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}"></span>
                            <span class="status-text ${isActive ? "text-green-400" : "text-red-400"}">
                                ${isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </td>
                </tr>
            `;

            tableBody.insertAdjacentHTML("beforeend", row);
        });

    } catch (err) {
        console.error("API Load Error:", err);
    }
}

// ✅ LOGIN handler
loginBtn.onclick = async () => {
    const pass = passwordInput.value.trim();
    const hash = await sha256(pass);

    if (hash === config.ADMIN_PASSWORD_HASH) {
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

// ✅ DARK MODE
document.getElementById("modeToggle").onclick = () => {
    document.documentElement.classList.toggle("dark");
};

// ✅ LOGOUT
document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("loggedIn");
    window.location.reload();
};

// ✅ Search filter
window.filterTable = function () {
    const inputEl = document.getElementById('searchInput');
    if (!inputEl) return;

    const query = inputEl.value.toLowerCase();
    const rows = document.querySelectorAll('#userTable tbody tr');

    rows.forEach(row => {
        const name = row.querySelector('.name')?.textContent.toLowerCase() || "";
        const phone = row.querySelector('.phone')?.textContent.toLowerCase() || "";

        row.style.display = (name.includes(query) || phone.includes(query)) ? "" : "none";
    });
};

// ✅ Sort Status column (Active / Inactive)
let statusAsc = true;
window.sortStatusColumn = function () {
    const table = document.getElementById("userTable");
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tbody tr"));

    rows.sort((a, b) => {
        const aStatus = a.querySelector(".status-text")?.textContent.trim() || "";
        const bStatus = b.querySelector(".status-text")?.textContent.trim() || "";

        return statusAsc
            ? aStatus.localeCompare(bStatus)
            : bStatus.localeCompare(aStatus);
    });

    statusAsc = !statusAsc;

    const tbody = table.querySelector("tbody");
    rows.forEach(r => tbody.appendChild(r));
};
