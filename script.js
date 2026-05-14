// ==================== EFEK RIPPLE (lingkaran kecil seperti shadow click) ====================
function createRipple(event) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    // Posisikan di titik klik
    ripple.style.left = `${event.clientX - 25}px`;
    ripple.style.top = `${event.clientY - 25}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
}

// Pasang event listener untuk klik di seluruh halaman
document.addEventListener('click', function(e) {
    // Jangan buat ripple di tombol kontrol biar tidak terlalu ramai
    if(!e.target.closest('.menu-controls') && !e.target.closest('.submenu-controls')) {
        createRipple(e);
    }
});

// ==================== EFEK SALJU (berlaku terus) ====================
function createSnow() {
    const snow = document.createElement('div');
    snow.className = 'snow';
    const size = Math.random() * 6 + 2;
    snow.style.width = `${size}px`;
    snow.style.height = `${size}px`;
    snow.style.left = `${Math.random() * window.innerWidth}px`;
    snow.style.opacity = Math.random() * 0.7 + 0.3;
    snow.style.animationDuration = `${Math.random() * 5 + 2}s`;
    snow.style.animationDelay = `${Math.random() * 2}s`;
    document.body.appendChild(snow);
    setTimeout(() => snow.remove(), 7000);
}

// Salju turun setiap 100ms
let snowInterval = setInterval(createSnow, 100);

// ==================== DATA STRUCTURE ====================
let menus = [
    { 
        id: "notepad",
        display: "📝 Notepad", 
        type: "editor",
        content: "",
        subitems: []
    },
    { 
        id: "hotkeys", 
        display: "⚡ Hotkeys", 
        type: "text",
        content: "✨ CTRL + S = Save\n✨ CTRL + Z = Undo\n✨ Klik ↑↓ untuk pindah menu\n✨ Klik 🗑️ untuk hapus menu\n✨ Klik + untuk tambah point kecil",
        subitems: []
    },
    { 
        id: "todo", 
        display: "✅ To Do List", 
        type: "todo",
        content: "[]",
        subitems: []
    },
    { 
        id: "daftar_akun", 
        display: "📂 Daftar Akun", 
        type: "editor",
        content: "",
        subitems: [
            { id: "bank", display: "🔹 Akun Bank", content: "" },
            { id: "email", display: "🔹 Akun Email", content: "" },
            { id: "medsos", display: "🔹 Media Sosial", content: "" }
        ]
    }
];

let currentMenu = null;
let currentSubmenu = null;
let historyData = [];

function saveAllData() {
    localStorage.setItem("master_hans_winter_v4", JSON.stringify(menus));
}

function loadAllData() {
    let saved = localStorage.getItem("master_hans_winter_v4");
    if(saved) {
        menus = JSON.parse(saved);
    }
    menus.forEach(menu => {
        if(!menu.type) menu.type = "editor";
        if(menu.content === undefined) menu.content = "";
        if(!menu.subitems) menu.subitems = [];
        if(menu.type === "todo" && typeof menu.content !== "string") {
            menu.content = JSON.stringify(menu.content || []);
        }
    });
    renderSidebar();
}

function saveHistory() {
    historyData.push(JSON.parse(JSON.stringify(menus)));
    if(historyData.length > 20) historyData.shift();
}

function renderSidebar() {
    const container = document.getElementById("menuContainer");
    if(!container) return;
    container.innerHTML = "";
    
    menus.forEach((menu, idx) => {
        const menuDiv = document.createElement("div");
        menuDiv.className = "menu-item";
        
        const header = document.createElement("div");
        header.className = "menu-header";
        
        const titleSpan = document.createElement("div");
        titleSpan.className = "menu-title";
        titleSpan.innerHTML = menu.display;
        titleSpan.onclick = (e) => {
            e.stopPropagation();
            openMainMenu(menu, idx);
        };
        
        const controls = document.createElement("div");
        controls.className = "menu-controls";
        
        if(idx > 0) {
            const upBtn = document.createElement("button");
            upBtn.innerHTML = "↑";
            upBtn.title = "Pindah ke atas";
            upBtn.onclick = (e) => {
                e.stopPropagation();
                moveMenuUp(idx);
            };
            controls.appendChild(upBtn);
        }
        
        if(idx < menus.length - 1) {
            const downBtn = document.createElement("button");
            downBtn.innerHTML = "↓";
            downBtn.title = "Pindah ke bawah";
            downBtn.onclick = (e) => {
                e.stopPropagation();
                moveMenuDown(idx);
            };
            controls.appendChild(downBtn);
        }
        
        const delBtn = document.createElement("button");
        delBtn.innerHTML = "🗑️";
        delBtn.className = "delete-btn";
        delBtn.title = "Hapus menu";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            konfirmasiHapusMenu(idx);
        };
        controls.appendChild(delBtn);
        
        header.appendChild(titleSpan);
        header.appendChild(controls);
        menuDiv.appendChild(header);
        
        const submenuDiv = document.createElement("div");
        submenuDiv.className = "submenu";
        submenuDiv.id = `submenu_${idx}`;
        
        if(menu.subitems && menu.subitems.length > 0) {
            menu.subitems.forEach((sub, subIdx) => {
                const subItem = document.createElement("div");
                subItem.className = "submenu-item";
                
                const subTitle = document.createElement("div");
                subTitle.className = "item-title";
                subTitle.innerHTML = sub.display;
                subTitle.onclick = () => openSubmenu(menu, subIdx);
                
                const subControls = document.createElement("div");
                subControls.className = "submenu-controls";
                
                const delSubBtn = document.createElement("button");
                delSubBtn.innerHTML = "🗑️";
                delSubBtn.onclick = (e) => {
                    e.stopPropagation();
                    if(confirm(`Hapus point "${sub.display}" dari menu ${menu.display}?`)) {
                        menu.subitems.splice(subIdx, 1);
                        saveAllData();
                        renderSidebar();
                        if(currentSubmenu === sub) {
                            currentSubmenu = null;
                            const contentDiv = document.getElementById("contentArea");
                            if(contentDiv) contentDiv.innerHTML = "<div style='color:white; text-align:center; padding:40px;'>✨ Pilih menu atau point di samping kiri ✨</div>";
                        }
                    }
                };
                subControls.appendChild(delSubBtn);
                
                subItem.appendChild(subTitle);
                subItem.appendChild(subControls);
                submenuDiv.appendChild(subItem);
            });
        }
        
        const addSubBtn = document.createElement("div");
        addSubBtn.className = "add-submenu";
        addSubBtn.innerHTML = "+ Tambah Point Kecil";
        addSubBtn.onclick = () => tambahSubmenu(menu);
        submenuDiv.appendChild(addSubBtn);
        
        menuDiv.appendChild(submenuDiv);
        
        header.onclick = (e) => {
            if(e.target.closest('.menu-controls')) return;
            submenuDiv.classList.toggle("open");
            localStorage.setItem(`submenu_open_${idx}`, submenuDiv.classList.contains("open"));
        };
        
        if(localStorage.getItem(`submenu_open_${idx}`) === "true") {
            submenuDiv.classList.add("open");
        }
        
        container.appendChild(menuDiv);
    });
}

function openMainMenu(menu, idx) {
    currentMenu = menu;
    currentSubmenu = null;
    
    const contentDiv = document.getElementById("contentArea");
    if(!contentDiv) return;
    
    if(menu.type === "editor") {
        contentDiv.innerHTML = `<textarea id="mainEditor" placeholder="✏️ Tulis catatan untuk ${menu.display}...">${menu.content || ""}</textarea>`;
    } else if(menu.type === "text") {
        contentDiv.innerHTML = `<div style="color:white; font-size:17px; white-space:pre-wrap; line-height:1.8;">${menu.content || ""}</div>`;
    } else if(menu.type === "todo") {
        renderTodo(menu);
    } else {
        contentDiv.innerHTML = `<textarea id="mainEditor" placeholder="✏️ Isi untuk ${menu.display}">${menu.content || ""}</textarea>`;
    }
}

function openSubmenu(menu, subIdx) {
    currentMenu = menu;
    currentSubmenu = menu.subitems[subIdx];
    
    const contentDiv = document.getElementById("contentArea");
    if(!contentDiv) return;
    contentDiv.innerHTML = `<textarea id="subEditor" placeholder="📝 Tulis catatan untuk ${currentSubmenu.display}...">${currentSubmenu.content || ""}</textarea>`;
}

function renderTodo(menu) {
    let todoList = [];
    try { todoList = JSON.parse(menu.content || "[]"); } catch(e) { todoList = []; }
    let html = `<div>
        <input type="text" id="newTodo" placeholder="📝 Tugas baru..." style="width:70%; padding:12px; border-radius:40px; border:none;">
        <button onclick="addTodoItem()" style="margin-left:10px;">➕ Tambah</button>
        <ul id="todoItems" style="margin-top:25px;">`;
    todoList.forEach((item, idx) => {
        html += `<li style="color:white; margin:12px 0; padding:8px; background:rgba(255,255,255,0.1); border-radius:12px; display:flex; justify-content:space-between;">
                    <span>📌 ${item}</span>
                    <button onclick="deleteTodoItem(${idx})" style="margin:0; padding:6px 12px;">❌ Hapus</button>
                </li>`;
    });
    html += `</ul></div>`;
    document.getElementById("contentArea").innerHTML = html;
}

function addTodoItem() {
    let input = document.getElementById("newTodo");
    if(input && input.value.trim()) {
        let menu = menus.find(m => m.type === "todo");
        if(menu) {
            let todoList = JSON.parse(menu.content || "[]");
            todoList.push(input.value.trim());
            menu.content = JSON.stringify(todoList);
            saveAllData();
            openMainMenu(menu);
        }
    }
}

function deleteTodoItem(idx) {
    let menu = menus.find(m => m.type === "todo");
    if(menu) {
        let todoList = JSON.parse(menu.content || "[]");
        todoList.splice(idx, 1);
        menu.content = JSON.stringify(todoList);
        saveAllData();
        openMainMenu(menu);
    }
}

function tambahSubmenu(menu) {
    let nama = prompt(`Tambah point kecil di menu "${menu.display}":`, "🔹 Point Baru");
    if(nama && nama.trim()) {
        if(!menu.subitems) menu.subitems = [];
        menu.subitems.push({
            id: "sub_" + Date.now() + Math.random(),
            display: nama.trim(),
            content: ""
        });
        saveAllData();
        renderSidebar();
        showToast(`✅ Point "${nama.trim()}" ditambahkan ke ${menu.display}`);
    }
}

function moveMenuUp(idx) {
    if(idx > 0) {
        [menus[idx-1], menus[idx]] = [menus[idx], menus[idx-1]];
        saveAllData();
        renderSidebar();
    }
}

function moveMenuDown(idx) {
    if(idx < menus.length - 1) {
        [menus[idx], menus[idx+1]] = [menus[idx+1], menus[idx]];
        saveAllData();
        renderSidebar();
    }
}

function konfirmasiHapusMenu(idx) {
    let menuNama = menus[idx].display;
    let konfirmasi = confirm(`⚠️ Yakin ingin menghapus menu "${menuNama}"?\n\nSEMUA point kecil di dalamnya juga akan hilang!`);
    if(konfirmasi) {
        menus.splice(idx, 1);
        saveAllData();
        renderSidebar();
        if(currentMenu === menus[idx]) {
            const contentDiv = document.getElementById("contentArea");
            if(contentDiv) contentDiv.innerHTML = "<div style='color:white; text-align:center; padding:40px;'>🗑️ Menu telah dihapus</div>";
            currentMenu = null;
        }
    }
}

function tambahMenuBaru() {
    let nama = prompt("Nama menu baru:", "Menu Baru");
    if(nama && nama.trim()) {
        menus.push({
            id: "menu_" + Date.now(),
            display: nama.trim(),
            type: "editor",
            content: "",
            subitems: []
        });
        saveAllData();
        renderSidebar();
    }
}

function saveData() {
    if(currentSubmenu && currentMenu) {
        let editor = document.getElementById("subEditor");
        if(editor) currentSubmenu.content = editor.value;
    } else if(currentMenu) {
        let editor = document.getElementById("mainEditor");
        if(editor && currentMenu.type !== "todo" && currentMenu.type !== "text") {
            currentMenu.content = editor.value;
        }
    }
    saveAllData();
    saveHistory();
    showToast("✅ Data tersimpan!");
}

function undoData() {
    if(historyData.length === 0) {
        showToast("⚠️ Tidak ada data untuk undo");
        return;
    }
    let last = historyData.pop();
    menus = last;
    saveAllData();
    renderSidebar();
    showToast("↩️ Undo berhasil");
}

function showToast(msg) {
    let toast = document.createElement("div");
    toast.innerText = msg;
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.background = "#2c7ab1";
    toast.style.color = "white";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "40px";
    toast.style.zIndex = "999";
    toast.style.animation = "fadeIn 0.3s ease-out";
    toast.style.backdropFilter = "blur(10px)";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ==================== LOGIN (TANPA PETUNJUK ID/PASSWORD) ====================
function doLogin() {
    let id = document.getElementById("userId").value.trim();
    let pass = document.getElementById("userPass").value.trim();
    
    if(id === "admin" && pass === "101010") {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainApp").style.display = "block";
        loadAllData();
        saveHistory();
        showToast("❄️ Selamat datang, Master Hans! ❄️");
    } else {
        document.getElementById("loginError").innerHTML = "❌ Username atau Password salah!";
    }
}

document.addEventListener("keydown", function(e) {
    const mainApp = document.getElementById("mainApp");
    if(mainApp && mainApp.style.display === "block") {
        if(e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveData();
        }
        if(e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undoData();
        }
    }
});

const passInput = document.getElementById("userPass");
if(passInput) {
    passInput.addEventListener("keypress", function(e) {
        if(e.key === "Enter") doLogin();
    });
}
