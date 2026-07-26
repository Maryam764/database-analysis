// --- 1. CONFIGURATION & SCHEMA (Matches your SQL) ---
const dbSchema = {
    Person: { columns: ['PersonID', 'Name', 'Age', 'Gender', 'Contact'], types: ['number', 'text', 'number', 'select', 'text'], options: { Gender: ['Male', 'Female'] }, icon: 'fa-user' },
    Category: { columns: ['CategoryID', 'CategoryName'], types: ['number', 'text'], icon: 'fa-tags' },
    Products: { columns: ['ProductID', 'ProductName', 'CategoryID', 'Price', 'Stock', 'ManufactureDate', 'WarrantyExpiry'], types: ['number', 'text', 'number', 'number', 'number', 'date', 'date'], icon: 'fa-box' },
    Customers: { columns: ['CustomerID', 'PersonID'], types: ['number', 'number'], icon: 'fa-users' },
    Roles: { columns: ['RoleID', 'RoleName', 'RoleDescription'], types: ['number', 'text', 'text'], icon: 'fa-id-badge' },
    Staff: { columns: ['StaffID', 'RoleID', 'PersonID'], types: ['number', 'number', 'number'], icon: 'fa-user-tie' },
    Sales: { columns: ['SaleID', 'ProductID', 'CustomerID', 'StaffID', 'Quantity', 'SaleDate', 'TotalAmount'], types: ['number', 'number', 'number', 'number', 'number', 'date', 'number'], icon: 'fa-chart-line' },
    Invoice: { columns: ['InvoiceID', 'SaleID', 'InvoiceDate', 'PaymentMethod'], types: ['number', 'number', 'date', 'text'], icon: 'fa-file-invoice-dollar' }
};

// --- 2. APPLICATION LOGIC & DATABASE CONNECTION ---
const app = {
    currentUser: null,
    currentTable: 'Person',
    currentData: [],
    clockInterval: null,

    permissions: {
        'Admin': { canRead: true, canCreate: true, canUpdate: true, canDelete: true },
        'Sales': { canRead: true, canCreate: true, canUpdate: false, canDelete: true },
        'Viewer': { canRead: true, canCreate: false, canUpdate: false, canDelete: false }
    },

    // ---------- LOGIN ----------
    login(role) {
        this.currentUser = role;

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-screen').style.display = 'block';
        document.getElementById('userDisplay').innerText = role.toUpperCase();

        const userRoleElement = document.querySelector('.user-role');
        if (userRoleElement) {
            userRoleElement.innerText = role === 'Admin' ? 'Administrator' : 
                                       role === 'Sales' ? 'Sales Operator' : 'Public Viewer';
        }

        this.applyPermissions();
        this.renderSidebar();
        this.loadTable('Person');
        this.updateClock();

        // Start clock interval
        if (this.clockInterval) clearInterval(this.clockInterval);
        this.clockInterval = setInterval(() => this.updateClock(), 1000);
    },

    // ---------- LOGOUT ----------
    logout() {
        // Stop clock interval
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }

        // Reset app state
        this.currentUser = null;
        this.currentTable = 'Person';
        this.currentData = [];

        // Clear UI
        document.getElementById('userDisplay').innerText = '';
        const userRole = document.querySelector('.user-role');
        if(userRole) userRole.innerText = '';
        document.getElementById('sidebarNav').innerHTML = '';
        document.getElementById('tableHead').innerHTML = '';
        document.getElementById('tableBody').innerHTML = '';
        document.getElementById('recordInfo').innerText = 'No records loaded';
        document.getElementById('statTotalRecords').innerText = '0';
        document.getElementById('statTableName').innerText = '-';
        document.getElementById('searchInput').value = '';

        // Show login screen
        document.getElementById('dashboard-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
    },

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const clockElement = document.getElementById('currentTime');
        if (clockElement) clockElement.innerText = timeString;
    },

    applyPermissions() {
        const btnAdd = document.getElementById('btnAdd');
        if (this.currentUser === 'Viewer') btnAdd.classList.add('restricted');
        else btnAdd.classList.remove('restricted');
    },

    renderSidebar() {
        const nav = document.getElementById('sidebarNav');
        nav.innerHTML = '';
        Object.keys(dbSchema).forEach(table => {
            const a = document.createElement('a');
            a.className = `nav-item ${table === this.currentTable ? 'active' : ''}`;
            a.onclick = () => {
                this.loadTable(table);
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                a.classList.add('active');
            };
            a.innerHTML = `<i class="fa-solid ${dbSchema[table].icon}"></i> ${table}`;
            nav.appendChild(a);
        });
    },

    async loadTable(tableName) {
        this.currentTable = tableName;

        let data = [];
        try {
            const res = await fetch(`/api/${tableName}`);
            this.currentData = await res.json();
            data = this.currentData;
        } catch (err) {
            console.error(err);
            this.showToast("Database error", "error");
            return;
        }

        const schema = dbSchema[tableName];
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if(searchTerm) {
            data = this.currentData.filter(row =>
                Object.values(row).some(v => String(v).toLowerCase().includes(searchTerm))
            );
        }

        // Update UI
        document.getElementById('pageTitle').innerText = tableName;
        document.getElementById('statTableName').innerText = tableName;
        document.getElementById('statTotalRecords').innerText = data.length;

        const recordInfo = document.getElementById('recordInfo');
        if(recordInfo) recordInfo.innerText = `Showing ${data.length} of ${this.currentData.length} records`;

        // Table header
        document.getElementById('tableHead').innerHTML =
            `<tr>${schema.columns.map(c => `<th>${c}</th>`).join('')}<th style="width:80px;">Actions</th></tr>`;

        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';
        if (!data.length) {
            tbody.innerHTML = `<tr><td colspan="${schema.columns.length + 1}" style="text-align:center;padding:30px;color:var(--text-muted);">No records found</td></tr>`;
            return;
        }

        const perms = this.permissions[this.currentUser];
        data.forEach((row, index) => {
            let html = '<tr>';
            schema.columns.forEach(col => {
                let val = row[col];
                if (col.endsWith('ID')) val = `<span class="badge">${val}</span>`;
                if (typeof row[col] === 'number' && (col.includes('Price') || col.includes('Amount')))
                    val = `$${row[col].toFixed(2)}`;
                html += `<td>${val}</td>`;
            });

            html += `<td style="white-space:nowrap;">`;
            if (perms.canUpdate && this.currentUser === 'Admin') {
                html += `<button class="action-btn" onclick="app.showToast('Edit feature coming soon','info')"><i class="fa-solid fa-pen"></i></button>`;
            }

            let canDelete = this.currentUser === 'Admin' ||
                (this.currentUser === 'Sales' && ['Sales','Invoice'].includes(tableName));

            if (canDelete) {
                html += `<button class="action-btn delete" onclick="app.deleteRow(${index})"><i class="fa-solid fa-trash"></i></button>`;
            }

            html += `</td></tr>`;
            tbody.innerHTML += html;
        });
    },

    openAddModal() {
        if (this.currentUser === 'Viewer') return;
        if (this.currentUser === 'Sales' && !['Sales', 'Invoice'].includes(this.currentTable)) {
            this.showToast("RESTRICTED: Sales cannot add here", "error");
            return;
        }

        const form = document.getElementById('dynamicForm');
        const schema = dbSchema[this.currentTable];
        document.getElementById('modalTitle').innerText = `Add New Record to ${this.currentTable}`;
        form.innerHTML = '';

        schema.columns.forEach((col, i) => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `<label>${col}</label>`;

            if (schema.types[i] === 'select') {
                const sel = document.createElement('select');
                sel.className = 'form-control';
                sel.name = col;
                (schema.options[col] || []).forEach(o => sel.innerHTML += `<option value="${o}">${o}</option>`);
                div.appendChild(sel);
            } else {
                const inp = document.createElement('input');
                inp.type = schema.types[i];
                inp.className = 'form-control';
                inp.name = col;
                inp.placeholder = `Enter ${col}`;
                div.appendChild(inp);
            }

            form.appendChild(div);
        });

        document.getElementById('modalOverlay').classList.add('open');
    },

    async saveRecord() {
        const form = document.getElementById('dynamicForm');
        const payload = {};
        [...form.elements].forEach(e => {
            if (e.name) payload[e.name] = e.value;
        });

        try {
            await fetch(`/api/${this.currentTable}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error(err);
            this.showToast("Failed to save record", "error");
            return;
        }

        this.closeModal();
        this.loadTable(this.currentTable);
        this.showToast("Record added successfully", "success");
    },

    deleteRow(index) {
        this.showToast("Delete feature requires backend implementation", "info");
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('open');
    },

    showToast(msg, type = 'success') {
        const c = document.getElementById('toastContainer');
        const t = document.createElement('div');
        t.className = 'toast';

        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'info') icon = 'fa-info-circle';

        t.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
};

// --- EVENT LISTENERS ---
document.getElementById('searchInput').addEventListener('input', () => {
    if (app.currentUser) app.loadTable(app.currentTable);
});

document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') app.closeModal();
});
// Example of fetching data from a backend API endpoint
fetch('/api/products/123')
  .then(response => response.json()) // Parse the JSON response
  .then(data => {
    // Use the data in your frontend application
    console.log(data);
  })
  .catch(error => console.error('Error fetching data:', error));

