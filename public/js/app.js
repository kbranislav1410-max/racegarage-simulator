// Global state
let currentUser = null;
let authToken = null;
let currentTab = 'rides';

// API base URL
const API_URL = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        fetchCurrentUser();
    } else {
        showLoginPage();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Add buttons
    document.getElementById('addRideBtn').addEventListener('click', () => openRideModal());
    document.getElementById('addCustomerBtn').addEventListener('click', () => openCustomerModal());
    document.getElementById('addFinanceBtn').addEventListener('click', () => openFinanceModal());
    
    // Forms
    document.getElementById('rideForm').addEventListener('submit', handleRideSubmit);
    document.getElementById('customerForm').addEventListener('submit', handleCustomerSubmit);
    document.getElementById('financeForm').addEventListener('submit', handleFinanceSubmit);
    
    // Close modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorDiv.textContent = data.message || 'Prihlásenie zlyhalo';
            return;
        }
        
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        
        showDashboard();
    } catch (error) {
        errorDiv.textContent = 'Chyba pri pripojení na server';
        console.error('Login error:', error);
    }
}

async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
            handleLogout();
            return;
        }
        
        currentUser = await response.json();
        showDashboard();
    } catch (error) {
        handleLogout();
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showLoginPage();
}

// UI functions
function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = getRoleLabel(currentUser.role);
    
    // Hide finances tab for regular users
    const financesTab = document.getElementById('financesTab');
    if (currentUser.role === 'user') {
        financesTab.style.display = 'none';
    } else {
        financesTab.style.display = 'block';
    }
    
    // Load initial data
    loadRides();
    loadCustomers();
    if (currentUser.role !== 'user') {
        loadFinances();
    }
}

function getRoleLabel(role) {
    const labels = {
        'super_admin': 'Super Admin',
        'admin': 'Admin',
        'user': 'Používateľ'
    };
    return labels[role] || role;
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

// Rides functions
async function loadRides() {
    try {
        const response = await fetch(`${API_URL}/rides`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to load rides');
        
        const rides = await response.json();
        displayRides(rides);
    } catch (error) {
        console.error('Error loading rides:', error);
    }
}

function displayRides(rides) {
    const container = document.getElementById('ridesList');
    
    if (rides.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Žiadne jazdy</h3>
                <p>Začnite pridaním novej jazdy</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = rides.map(ride => `
        <div class="item-card">
            <div class="item-header">
                <div class="item-title">${ride.customerName} - ${ride.vehicleName}</div>
                <div class="item-actions">
                    <button class="btn btn-success" onclick="openRideModal(${ride.id})">Upraviť</button>
                    ${canDelete() ? `<button class="btn btn-danger" onclick="deleteRide(${ride.id})">Odstrániť</button>` : ''}
                </div>
            </div>
            <div class="item-details">
                <p><strong>Dátum:</strong> ${formatDate(ride.date)}</p>
                ${ride.description ? `<p><strong>Popis:</strong> ${ride.description}</p>` : ''}
                <p><small>Vytvoril: ${ride.createdBy} | ${formatDateTime(ride.createdAt)}</small></p>
            </div>
        </div>
    `).join('');
}

function openRideModal(rideId = null) {
    const modal = document.getElementById('rideModal');
    const form = document.getElementById('rideForm');
    const title = document.getElementById('rideModalTitle');
    
    form.reset();
    
    if (rideId) {
        title.textContent = 'Upraviť jazdu';
        // Fetch ride data and populate form
        fetch(`${API_URL}/rides`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(res => res.json())
        .then(rides => {
            const ride = rides.find(r => r.id === rideId);
            if (ride) {
                document.getElementById('rideId').value = ride.id;
                document.getElementById('rideCustomerName').value = ride.customerName;
                document.getElementById('rideVehicleName').value = ride.vehicleName;
                document.getElementById('rideDate').value = ride.date;
                document.getElementById('rideDescription').value = ride.description || '';
            }
        });
    } else {
        title.textContent = 'Pridať jazdu';
        document.getElementById('rideId').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeRideModal() {
    document.getElementById('rideModal').classList.add('hidden');
}

async function handleRideSubmit(e) {
    e.preventDefault();
    
    const rideId = document.getElementById('rideId').value;
    const data = {
        customerName: document.getElementById('rideCustomerName').value,
        vehicleName: document.getElementById('rideVehicleName').value,
        date: document.getElementById('rideDate').value,
        description: document.getElementById('rideDescription').value
    };
    
    try {
        const url = rideId ? `${API_URL}/rides/${rideId}` : `${API_URL}/rides`;
        const method = rideId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save ride');
        
        closeRideModal();
        loadRides();
    } catch (error) {
        alert('Chyba pri ukladaní jazdy');
        console.error('Error saving ride:', error);
    }
}

async function deleteRide(rideId) {
    if (!confirm('Naozaj chcete odstrániť túto jazdu?')) return;
    
    try {
        const response = await fetch(`${API_URL}/rides/${rideId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Nemáte oprávnenie na odstránenie');
            return;
        }
        
        loadRides();
    } catch (error) {
        alert('Chyba pri odstraňovaní jazdy');
        console.error('Error deleting ride:', error);
    }
}

// Customers functions
async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}/customers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to load customers');
        
        const customers = await response.json();
        displayCustomers(customers);
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function displayCustomers(customers) {
    const container = document.getElementById('customersList');
    
    if (customers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Žiadni zákazníci</h3>
                <p>Začnite pridaním nového zákazníka</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = customers.map(customer => `
        <div class="item-card">
            <div class="item-header">
                <div class="item-title">${customer.name}</div>
                <div class="item-actions">
                    <button class="btn btn-success" onclick="openCustomerModal(${customer.id})">Upraviť</button>
                    ${canDelete() ? `<button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">Odstrániť</button>` : ''}
                </div>
            </div>
            <div class="item-details">
                <p><strong>Email:</strong> ${customer.email}</p>
                ${customer.phone ? `<p><strong>Telefón:</strong> ${customer.phone}</p>` : ''}
                ${customer.address ? `<p><strong>Adresa:</strong> ${customer.address}</p>` : ''}
                <p><small>Vytvoril: ${customer.createdBy} | ${formatDateTime(customer.createdAt)}</small></p>
            </div>
        </div>
    `).join('');
}

function openCustomerModal(customerId = null) {
    const modal = document.getElementById('customerModal');
    const form = document.getElementById('customerForm');
    const title = document.getElementById('customerModalTitle');
    
    form.reset();
    
    if (customerId) {
        title.textContent = 'Upraviť zákazníka';
        fetch(`${API_URL}/customers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(res => res.json())
        .then(customers => {
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
                document.getElementById('customerId').value = customer.id;
                document.getElementById('customerName').value = customer.name;
                document.getElementById('customerEmail').value = customer.email;
                document.getElementById('customerPhone').value = customer.phone || '';
                document.getElementById('customerAddress').value = customer.address || '';
            }
        });
    } else {
        title.textContent = 'Pridať zákazníka';
        document.getElementById('customerId').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.add('hidden');
}

async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const customerId = document.getElementById('customerId').value;
    const data = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value
    };
    
    try {
        const url = customerId ? `${API_URL}/customers/${customerId}` : `${API_URL}/customers`;
        const method = customerId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save customer');
        
        closeCustomerModal();
        loadCustomers();
    } catch (error) {
        alert('Chyba pri ukladaní zákazníka');
        console.error('Error saving customer:', error);
    }
}

async function deleteCustomer(customerId) {
    if (!confirm('Naozaj chcete odstrániť tohto zákazníka?')) return;
    
    try {
        const response = await fetch(`${API_URL}/customers/${customerId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Nemáte oprávnenie na odstránenie');
            return;
        }
        
        loadCustomers();
    } catch (error) {
        alert('Chyba pri odstraňovaní zákazníka');
        console.error('Error deleting customer:', error);
    }
}

// Finances functions
async function loadFinances() {
    try {
        const response = await fetch(`${API_URL}/finances`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                // User doesn't have access to finances
                return;
            }
            throw new Error('Failed to load finances');
        }
        
        const finances = await response.json();
        displayFinances(finances);
    } catch (error) {
        console.error('Error loading finances:', error);
    }
}

function displayFinances(finances) {
    const container = document.getElementById('financesList');
    const summaryContainer = document.getElementById('financeSummary');
    
    // Calculate summary
    const income = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
    const expense = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
    const balance = income - expense;
    
    summaryContainer.innerHTML = `
        <div class="finance-card income">
            <h3>Príjmy</h3>
            <div class="amount">€${income.toFixed(2)}</div>
        </div>
        <div class="finance-card expense">
            <h3>Výdavky</h3>
            <div class="amount">€${expense.toFixed(2)}</div>
        </div>
        <div class="finance-card">
            <h3>Bilancia</h3>
            <div class="amount">€${balance.toFixed(2)}</div>
        </div>
    `;
    
    if (finances.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Žiadne finančné záznamy</h3>
                <p>Začnite pridaním nového záznamu</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = finances.map(finance => `
        <div class="item-card">
            <div class="item-header">
                <div class="item-title">
                    ${finance.type === 'income' ? '📈' : '📉'} 
                    ${finance.type === 'income' ? 'Príjem' : 'Výdavok'}: €${finance.amount.toFixed(2)}
                </div>
                <div class="item-actions">
                    <button class="btn btn-success" onclick="openFinanceModal(${finance.id})">Upraviť</button>
                    ${canDelete() ? `<button class="btn btn-danger" onclick="deleteFinance(${finance.id})">Odstrániť</button>` : ''}
                </div>
            </div>
            <div class="item-details">
                <p><strong>Dátum:</strong> ${formatDate(finance.date)}</p>
                ${finance.description ? `<p><strong>Popis:</strong> ${finance.description}</p>` : ''}
                ${finance.relatedTo ? `<p><strong>Súvisiace s:</strong> ${finance.relatedTo}</p>` : ''}
                <p><small>Vytvoril: ${finance.createdBy} | ${formatDateTime(finance.createdAt)}</small></p>
            </div>
        </div>
    `).join('');
}

function openFinanceModal(financeId = null) {
    const modal = document.getElementById('financeModal');
    const form = document.getElementById('financeForm');
    const title = document.getElementById('financeModalTitle');
    
    form.reset();
    
    if (financeId) {
        title.textContent = 'Upraviť finančný záznam';
        fetch(`${API_URL}/finances`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(res => res.json())
        .then(finances => {
            const finance = finances.find(f => f.id === financeId);
            if (finance) {
                document.getElementById('financeId').value = finance.id;
                document.getElementById('financeType').value = finance.type;
                document.getElementById('financeAmount').value = finance.amount;
                document.getElementById('financeDate').value = finance.date;
                document.getElementById('financeDescription').value = finance.description || '';
                document.getElementById('financeRelatedTo').value = finance.relatedTo || '';
            }
        });
    } else {
        title.textContent = 'Pridať finančný záznam';
        document.getElementById('financeId').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeFinanceModal() {
    document.getElementById('financeModal').classList.add('hidden');
}

async function handleFinanceSubmit(e) {
    e.preventDefault();
    
    const financeId = document.getElementById('financeId').value;
    const data = {
        type: document.getElementById('financeType').value,
        amount: parseFloat(document.getElementById('financeAmount').value),
        date: document.getElementById('financeDate').value,
        description: document.getElementById('financeDescription').value,
        relatedTo: document.getElementById('financeRelatedTo').value
    };
    
    try {
        const url = financeId ? `${API_URL}/finances/${financeId}` : `${API_URL}/finances`;
        const method = financeId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save finance');
        
        closeFinanceModal();
        loadFinances();
    } catch (error) {
        alert('Chyba pri ukladaní finančného záznamu');
        console.error('Error saving finance:', error);
    }
}

async function deleteFinance(financeId) {
    if (!confirm('Naozaj chcete odstrániť tento finančný záznam?')) return;
    
    try {
        const response = await fetch(`${API_URL}/finances/${financeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Nemáte oprávnenie na odstránenie');
            return;
        }
        
        loadFinances();
    } catch (error) {
        alert('Chyba pri odstraňovaní finančného záznamu');
        console.error('Error deleting finance:', error);
    }
}

// Helper functions
function canDelete() {
    return currentUser && currentUser.role === 'super_admin';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK');
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('sk-SK');
}

function closeAllModals() {
    closeRideModal();
    closeCustomerModal();
    closeFinanceModal();
}
