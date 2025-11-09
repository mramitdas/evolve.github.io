import { loadConfig } from "./config.js";
import { searchFragment } from "./searchFragment.js";
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
    .map((b) => b.toString(16).padStart(2, "0"))
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

  // ✅ Inject search UI from JS template (avoid Live Server HTML injection)
  const searchContainer = document.getElementById("searchContainer");
  if (searchContainer) {
    searchContainer.innerHTML = searchFragment;

    // Wire up search input to filter as you type
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", window.filterTable);
    }

    // Wire up filter form submit and reset to do row-level filtering only
    const filterForm = document.getElementById("filterSection");
    if (filterForm) {
      filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        window.filterTable();
      });
      filterForm.addEventListener("reset", () => {
        // Let the browser reset inputs, then apply filter
        setTimeout(() => window.filterTable(), 0);
      });
    }

    // Wire up date pickers to filter on selection as well
    const startDateInput = document.getElementById("datepicker-range-start");
    const endDateInput = document.getElementById("datepicker-range-end");
    if (startDateInput) {
      startDateInput.addEventListener("change", window.filterTable);
      startDateInput.addEventListener("input", window.filterTable);
    }
    if (endDateInput) {
      endDateInput.addEventListener("change", window.filterTable);
      endDateInput.addEventListener("input", window.filterTable);
    }

    // Wire up gender select to filter on selection as well
    const genderSelect = document.getElementById("genderSelect");
    if (genderSelect) {
      genderSelect.addEventListener("change", window.filterTable);
      genderSelect.addEventListener("input", window.filterTable);
    }
  }
  
  // ✅ Initialize filter toggle script AFTER loading HTML
  initFilterToggle();

  // ✅ Initialize Flowbite date range picker for dynamically injected content
  initDatepickers();

  loader.classList.add("hidden");

  // ✅ Now fetch API data
  fetchTableData();
}

// ✅ Toggle filter dropdown (after HTML is loaded)
function initFilterToggle() {
  const toggleBtn = document.getElementById("toggleFilters");
  const filterSection = document.getElementById("filterSection");
  const chevronIcon = document.getElementById("chevronIcon");

  if (!toggleBtn || !filterSection || !chevronIcon) return; // Prevent crash

  let isOpen = false;

  toggleBtn.addEventListener("click", () => {
    isOpen = !isOpen;

    if (isOpen) {
      filterSection.style.maxHeight = filterSection.scrollHeight + "px";
      filterSection.style.opacity = "1";
      chevronIcon.style.transform = "rotate(180deg)";
    } else {
      filterSection.style.maxHeight = "0";
      filterSection.style.opacity = "0";
      chevronIcon.style.transform = "rotate(0deg)";
    }
  });
}

 // ✅ Initialize date pickers for dynamically loaded search form
function initDatepickers() {
  try {
    const startEl = document.getElementById("datepicker-range-start");
    const endEl = document.getElementById("datepicker-range-end");

    if (!startEl || !endEl) {
      console.warn("Datepicker inputs missing");
      return;
    }

    // Always initialize two single pickers to guarantee UI shows
    if (window.Datepicker) {
      const opts = {
        format: "dd-mm-yyyy",
        autohide: true,
        container: document.body, // render dropdown at body level
        orientation: "bottom left",
      };

      const dpStart = new window.Datepicker(startEl, opts);
      const dpEnd = new window.Datepicker(endEl, opts);

      // Show on focus to make it obvious
      startEl.addEventListener("focus", () => dpStart.show());
      endEl.addEventListener("focus", () => dpEnd.show());
    } else if (window.DateRangePicker) {
      // As a fallback, try range mode (some builds only ship DateRangePicker)
      new window.DateRangePicker(document.getElementById("date-range-picker"), {
        format: "dd-mm-yyyy",
        autohide: true,
      });
    } else {
      console.warn("Flowbite Datepicker library not found on window");
    }
  } catch (e) {
    console.error("Datepicker init error:", e);
  }
}

// ✅ Fetch API data and render table rows + mobile cards
async function fetchTableData() {
  const tableBody = document.querySelector("#userTable tbody");
  const mobileList = document.querySelector("#mobileList"); // ✅ Add this div in table.html
  if (!tableBody) return;

  try {
    const res = await fetch("https://evolve-dzlb.onrender.com/clients");
    const data = await res.json();

    tableBody.innerHTML = "";
    if (mobileList) mobileList.innerHTML = "";

    data.forEach((item, index) => {
      const statusLower = item.status.toLowerCase();
      const isActive = statusLower === "active";

      const imgUrl = `https://kcusrobnqpiqqiycwser.supabase.co/storage/v1/object/public/client_images/${item.phone_number}.png`;

      /* ✅ DESKTOP TABLE ROWS */
      const row = `
                <tr class="border-b bg-gray-800 border-gray-700" data-status="${isActive ? "active" : "inactive"}" data-date="${item.end_date || ""}" data-gender="${(item.gender || "").toLowerCase()}">
                    <td class="px-6 py-4">${index + 1}</td>

                    <th class="flex items-center px-6 py-4 whitespace-nowrap text-white">
                        <img class="w-10 h-10 rounded-full" src="${imgUrl}">
                        <div class="pl-3">
                            <div class="text-base font-semibold name">${
                              item.name
                            }</div>
                            <div class="text-gray-400 phone">${
                              item.phone_number
                            }</div>
                        </div>
                    </th>

                    <td class="px-6 py-4">${item.end_date}</td>

                    <td class="px-6 py-4 status">
                        <div class="flex items-center gap-2">
                            <span class="h-3 w-3 rounded-full ${
                              isActive ? "bg-green-500" : "bg-red-500"
                            }"></span>
                            <span class="status-text ${
                              isActive ? "text-green-400" : "text-red-400"
                            }">
                                ${isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </td>
                </tr>
            `;
      tableBody.insertAdjacentHTML("beforeend", row);

      /* ✅ MOBILE CARD VIEW */
      if (mobileList) {
        const card = `
          <div class="bg-gray-800 rounded-xl p-4 shadow flex items-center gap-4" data-status="${isActive ? "active" : "inactive"}" data-date="${item.end_date || ""}" data-gender="${(item.gender || "").toLowerCase()}">
              <div class="text-gray-400 font-bold text-lg w-6">${
                index + 1
              }</div>

              <img src="${imgUrl}" class="w-12 h-12 rounded-full object-cover"/>

              <div class="text-left">
                  <p class="text-white font-semibold text-lg">${item.name}</p>
                  <p class="phone-mobile text-gray-400 text-sm">${
                    item.phone_number
                  }</p>
                  <p class="${
                    isActive ? "text-green-400" : "text-red-400"
                  } text-xs mt-1">${item.end_date || "-"}</p>
              </div>
          </div>
        `;
        mobileList.insertAdjacentHTML("beforeend", card);
      }
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
// document.getElementById("modeToggle").onclick = () => {
//   document.documentElement.classList.toggle("dark");
// };

// ✅ LOGOUT
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("loggedIn");
  window.location.reload();
};

 // ✅ Combined Search + Status + Date Range filter (row-level only)
window.filterTable = function () {
  const inputEl = document.getElementById("searchInput");
  const statusEl = document.getElementById("statusSelect");
  const startEl = document.getElementById("datepicker-range-start");
  const endEl = document.getElementById("datepicker-range-end");
  const genderEl = document.getElementById("genderSelect");

  const query = (inputEl?.value || "").toLowerCase().trim();
  const status = (statusEl?.value || "").toLowerCase().trim(); // "" = All
  const gender = (genderEl?.value || "").toLowerCase().trim(); // "" = All

  const startStr = (startEl?.value || "").trim();
  const endStr = (endEl?.value || "").trim();

  function normalizeYMD(d) {
    // zero out time to ensure date-only compare
    return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;
  }
  function parseDMY(str) {
    const s = (str || "").trim();
    if (!s) return null;
    const parts = s.split("-");
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    const d = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    return isNaN(d.getTime()) ? null : normalizeYMD(d);
  }
  function parseDateFlexible(str) {
    // Try dd-mm-yyyy first, then fallback to Date()
    const d1 = parseDMY(str);
    if (d1) return d1;
    const d2 = new Date(str);
    return isNaN(d2.getTime()) ? null : normalizeYMD(d2);
  }

  const startDate = parseDMY(startStr);
  const endDate = parseDMY(endStr);

  // ✅ Desktop table rows
  const rows = document.querySelectorAll("#userTable tbody tr");
  rows.forEach((row) => {
    const name = row.querySelector(".name")?.textContent.toLowerCase() || "";
    const phone = row.querySelector(".phone")?.textContent.toLowerCase() || "";
    const rowStatus =
      (row.dataset.status ||
        row.querySelector(".status-text")?.textContent ||
        ""
      ).toLowerCase();

    // Prefer data-date; if missing, try to read the 3rd cell text
    const rowDateStr =
      row.dataset.date ||
      row.querySelector("td:nth-child(3)")?.textContent?.trim() ||
      "";
    const rowDate = parseDateFlexible(rowDateStr);

    const matchesQuery =
      !query || name.includes(query) || phone.includes(query);
    const matchesStatus = !status || rowStatus === status;
    const rowGender = (row.dataset.gender || "").toLowerCase();
    const matchesGender = !gender || rowGender === gender;

    let matchesDate = true;
    if (startDate || endDate) {
      if (!rowDate) {
        matchesDate = false;
      } else {
        if (startDate && rowDate < startDate) matchesDate = false;
        if (endDate && rowDate > endDate) matchesDate = false;
      }
    }

    row.style.display = matchesQuery && matchesStatus && matchesDate && matchesGender ? "" : "none";
  });

  // ✅ Mobile cards
  const cards = document.querySelectorAll("#mobileList > div");
  cards.forEach((card) => {
    const name =
      card.querySelector(".text-white")?.textContent.toLowerCase() || "";
    const phone =
      card.querySelector(".phone-mobile")?.textContent.toLowerCase() || "";
    const cardStatus = (card.dataset.status || "").toLowerCase();
    const cardDateStr = (card.dataset.date || "").trim();
    const cardDate = parseDateFlexible(cardDateStr);

    const matchesQuery =
      !query || name.includes(query) || phone.includes(query);
    const matchesStatus = !status || cardStatus === status;
    const cardGender = (card.dataset.gender || "").toLowerCase();
    const matchesGender = !gender || cardGender === gender;

    let matchesDate = true;
    if (startDate || endDate) {
      if (!cardDate) {
        matchesDate = false;
      } else {
        if (startDate && cardDate < startDate) matchesDate = false;
        if (endDate && cardDate > endDate) matchesDate = false;
      }
    }

    card.style.display = matchesQuery && matchesStatus && matchesDate && matchesGender ? "flex" : "none";
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
  rows.forEach((r) => tbody.appendChild(r));
};
