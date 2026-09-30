const $ = id => document.getElementById(id);
const read = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; }
    catch (e) { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const escapeHTML = text => { const d = document.createElement("div"); d.textContent = text || ""; return d.innerHTML; };

function showToast(message, type) {
    let box = document.querySelector(".toast-container");
    if (!box) {
        box = document.createElement("div");
        box.className = "toast-container";
        box.setAttribute("role", "status");
        document.body.appendChild(box);
    }
    const toast = document.createElement("div");
    toast.className = "toast" + (type === "danger" ? " danger" : "");
    toast.textContent = message;
    box.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

function setMessage(id, text, ok) {
    const el = $(id);
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("ok", !!ok);
}

/* Accounts (stored in this browser only) */
function loginUser(event) {
    event.preventDefault();
    const username = $("username").value.trim();
    const password = $("password").value;
    const account = read("userAccount", null);
    if (account && username === account.username && password === account.password) {
        save("loggedInUser", { name: account.name || account.username, username: account.username });
        window.location.href = "index.html";
    } else {
        setMessage("loginMessage", "Incorrect username or password.");
    }
}

function registerUser(event) {
    event.preventDefault();
    const name = $("registerName").value.trim();
    const username = $("registerUsername").value.trim();
    const password = $("registerPassword").value;
    if (!name || !username || !password) return setMessage("registerMessage", "Please fill in all fields.");
    if (password.length < 6) return setMessage("registerMessage", "Password must be at least 6 characters.");
    if (password !== $("confirmPassword").value) return setMessage("registerMessage", "Passwords do not match.");
    save("userAccount", { name, username, password });
    save("loggedInUser", { name, username });
    window.location.href = "index.html";
}

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

function checkLogin() {
    const user = read("loggedInUser", null);
    if (document.body.dataset.protected && !user) {
        window.location.href = "login.html";
        return;
    }
    if (user && $("userGreeting")) {
        const name = user.name || user.username || "User";
        $("userGreeting").textContent = name;
        $("dashboardUsername").textContent = name;
    }
}

/* Data */
let notes = read("notes", []);
let reminders = read("reminders", []);
let editingNoteId = null;

function formatDate(str) {
    return str ? new Date(str + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
}

function openModal(id) { $(id).classList.add("show"); }
function closeModal(id) { $(id).classList.remove("show"); }

/* Notes */
function openNoteForm() {
    editingNoteId = null;
    $("noteTitle").value = "";
    $("noteContent").value = "";
    $("noteFormTitle").textContent = "Add note";
    openModal("noteModal");
    $("noteTitle").focus();
}
function closeNoteForm() { closeModal("noteModal"); }

function saveNote() {
    const title = $("noteTitle").value.trim();
    const content = $("noteContent").value.trim();
    if (!title || !content) return showToast("Enter a title and note text.", "danger");
    if (editingNoteId !== null) {
        const note = notes.find(n => n.id === editingNoteId);
        if (note) { note.title = title; note.content = content; }
        showToast("Note updated.");
    } else {
        notes.push({ id: Date.now(), title, content, createdAt: new Date().toLocaleDateString("en-IN") });
        showToast("Note added.");
    }
    save("notes", notes);
    closeNoteForm();
    displayNotes();
    updateStatistics();
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    editingNoteId = id;
    $("noteTitle").value = note.title;
    $("noteContent").value = note.content;
    $("noteFormTitle").textContent = "Edit note";
    openModal("noteModal");
}

function deleteNote(id) {
    if (!confirm("Delete this note?")) return;
    notes = notes.filter(n => n.id !== id);
    save("notes", notes);
    displayNotes();
    updateStatistics();
    showToast("Note deleted.");
}

function displayNotes() {
    const box = $("notesContainer");
    if (!box) return;
    const q = $("searchNotes").value.toLowerCase();
    const list = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    if (!list.length) {
        box.innerHTML = `<p class="empty">${notes.length ? "No notes match your search." : "No notes yet."}</p>`;
        return;
    }
    box.innerHTML = list.map(n => `
        <div class="card">
            <div><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.content)}</p></div>
            <div>
                <div class="card-date">Created ${escapeHTML(n.createdAt)}</div>
                <div class="card-buttons">
                    <button class="btn ghost small" onclick="editNote(${n.id})">Edit</button>
                    <button class="btn danger small" onclick="deleteNote(${n.id})">Delete</button>
                </div>
            </div>
        </div>`).join("");
}

/* Reminders */
function openReminderForm() {
    ["reminderTitle", "reminderDescription", "reminderDate", "reminderTime"].forEach(id => $(id).value = "");
    openModal("reminderModal");
    $("reminderTitle").focus();
}
function closeReminderForm() { closeModal("reminderModal"); }

function saveReminder() {
    const title = $("reminderTitle").value.trim();
    const date = $("reminderDate").value;
    const time = $("reminderTime").value;
    if (!title || !date || !time) return showToast("Enter a title, date and time.", "danger");
    reminders.push({ id: Date.now(), title, description: $("reminderDescription").value.trim(), date, time, completed: false });
    save("reminders", reminders);
    closeReminderForm();
    displayReminders();
    updateStatistics();
    showToast("Reminder added.");
}

function completeReminder(id) {
    const r = reminders.find(x => x.id === id);
    if (!r) return;
    r.completed = true;
    save("reminders", reminders);
    displayReminders();
    updateStatistics();
}

function deleteReminder(id) {
    if (!confirm("Delete this reminder?")) return;
    reminders = reminders.filter(r => r.id !== id);
    save("reminders", reminders);
    displayReminders();
    updateStatistics();
    showToast("Reminder deleted.");
}

function displayReminders() {
    const box = $("remindersContainer");
    if (!box) return;
    if (!reminders.length) {
        box.innerHTML = `<p class="empty">No reminders yet.</p>`;
        return;
    }
    const now = new Date();
    const sorted = [...reminders].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    box.innerHTML = sorted.map(r => {
        let status = "Upcoming", cls = "upcoming";
        if (r.completed) { status = "Completed"; cls = "completed"; }
        else if (new Date(`${r.date}T${r.time}`) < now) { status = "Overdue"; cls = "overdue"; }
        return `
        <div class="card">
            <div>
                <span class="status ${cls}">${status}</span>
                <h3>${escapeHTML(r.title)}</h3>
                <p>${escapeHTML(r.description)}</p>
            </div>
            <div>
                <div class="card-date">${formatDate(r.date)} at ${escapeHTML(r.time)}</div>
                <div class="card-buttons">
                    ${r.completed ? "" : `<button class="btn ghost small" onclick="completeReminder(${r.id})">Mark complete</button>`}
                    <button class="btn danger small" onclick="deleteReminder(${r.id})">Delete</button>
                </div>
            </div>
        </div>`;
    }).join("");
}

function updateStatistics() {
    if (!$("totalNotes")) return;
    $("totalNotes").textContent = notes.length;
    $("totalReminders").textContent = reminders.length;
    $("completedReminders").textContent = reminders.filter(r => r.completed).length;
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeNoteForm(); closeReminderForm(); }
});
document.addEventListener("click", e => {
    if (e.target === $("noteModal")) closeNoteForm();
    if (e.target === $("reminderModal")) closeReminderForm();
});

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
    if ($("currentDate")) {
        $("currentDate").textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        displayNotes();
        displayReminders();
        updateStatistics();
        setInterval(displayReminders, 60000);
    }
});
