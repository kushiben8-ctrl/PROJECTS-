

const {
    initializeApp, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    onAuthStateChanged, signOut, getDatabase, ref, set, push, onValue, update,
    query, orderByChild, equalTo
} = window.firebaseModules;

const firebaseConfig = {
    apiKey: "AIzaSyDtu18fjHpSoeyFWrPZ_oj9R_1pLCFKk80",
    authDomain: "clinic-management-system-25d0d.firebaseapp.com",
    projectId: "clinic-management-system-25d0d",
    storageBucket: "clinic-management-system-25d0d.firebasestorage.app",
    messagingSenderId: "164911199502",
    appId: "1:164911199502:web:0355cbf60c5270d110135f",
    measurementId: "G-WBBLBRJ81M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let currentUserRole = '';
let patients = [];
let nextToken = 1;
let bills = [];

// PAGE NAVIGATION
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showDashboard() {
    document.getElementById('receptionistDash').style.display = currentUserRole === 'receptionist' ? 'block' : 'none';
    document.getElementById('doctorDash').style.display = currentUserRole === 'doctor' ? 'block' : 'none';
    updateStats();
    startDataListeners();
    showPage('dashboard');
}

// AUTHENTICATION
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.role) {
                currentUserRole = userData.role;
                document.getElementById('welcomeMsg').textContent = `Welcome ${currentUserRole.toUpperCase()} Dashboard`;
                showDashboard();
            }
        });
    } else {
        showPage('loginPage');
    }
});

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.innerHTML = `<div style="color:#e53e3e; margin-top: 10px;">${error.message}</div>`;
    }
});

// SIGNUP
document.getElementById('signupBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('roleSelect').value;

    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(db, `users/${result.user.uid}`), {
            email, role, createdAt: Date.now()
        });
        alert('✅ Account created successfully!');
    } catch (error) {
        document.getElementById('loginError').innerHTML = `<div style="color:#e53e3e;">${error.message}</div>`;
    }
});

// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth);
});

// DATA LISTENERS
function startDataListeners() {
    const patientsRef = ref(db, 'patients');
    onValue(patientsRef, (snapshot) => {
        patients = snapshot.val() ? Object.values(snapshot.val()) : [];
        updateAllDisplays();
    });

    const configRef = ref(db, 'config/nextToken');
    onValue(configRef, (snapshot) => {
        nextToken = snapshot.val() || 1;
        document.getElementById('nextToken').textContent = `T${String(nextToken).padStart(3, '0')}`;
    });

    const billsRef = ref(db, 'bills');
    onValue(billsRef, (snapshot) => {
        bills = snapshot.val() ? Object.values(snapshot.val()) : [];
        updateStats();
    });
}

// NEW PATIENT
document.getElementById('patientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('patientName').value;
    const details = document.getElementById('patientDetails').value;

    const token = `T${String(nextToken).padStart(3, '0')}`;
    const patientData = {
        token, name, details,
        status: 'waiting',
        prescription: [],
        billed: false,
        timestamp: Date.now()
    };

    try {
        await push(ref(db, 'patients'), patientData);
        await set(ref(db, 'config/nextToken'), nextToken + 1);
        document.getElementById('patientSuccess').innerHTML =
            `<div class="success">✅ Token ${token} created for ${name}</div>`;
        document.getElementById('patientForm').reset();
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// GENERATE BILL
document.getElementById('generateBillBtn').addEventListener('click', async () => {
    const token = document.getElementById('billToken').value.trim();
    const charges = parseFloat(document.getElementById('charges').value);

    if (!token || !charges || charges <= 0) {
        alert('Please enter valid token and amount');
        return;
    }

    try {
        await push(ref(db, 'bills'), { token, charges, generatedAt: Date.now() });
        document.getElementById('recentBills').innerHTML +=
            `<div class="bill-item">Token ${token}: ₹${charges.toFixed(2)} ✅</div>`;
        document.getElementById('billToken').value = '';
        document.getElementById('charges').value = '';
    } catch (error) {
        alert('Billing error: ' + error.message);
    }
});

// SAVE PRESCRIPTION
document.getElementById('prescriptionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const prescriptionText = document.getElementById('prescriptionText').value.trim();

    const currentPatient = patients.find(p => p.status === 'waiting' && !p.billed);
    if (!currentPatient || !prescriptionText) {
        alert('No patient waiting or empty prescription!');
        return;
    }

    try {
        const patientsQuery = query(ref(db, 'patients'), orderByChild('token'), equalTo(currentPatient.token));
        onValue(patientsQuery, (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const currentPrescriptions = childSnapshot.val().prescription || [];
                currentPrescriptions.push({
                    text: prescriptionText,
                    time: new Date().toLocaleString()
                });
                update(childSnapshot.ref, { prescription: currentPrescriptions });
            });
        });

        document.getElementById('prescriptionText').value = '';
        alert('✅ Prescription saved successfully!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// UI UPDATES
function updateAllDisplays() {
    updateQueueDisplay();
    updateDoctorDisplay();
    updateStats();
}

function updateQueueDisplay() {
    const waitingPatients = patients.filter(p => !p.billed);
    const queueDiv = document.getElementById('tokenQueue');

    queueDiv.innerHTML = waitingPatients.length ?
        waitingPatients.map(p =>
            `<div class="token-item">${p.token}<br><strong>${p.name}</strong><br><small>${p.details}</small></div>`
        ).join('') :
        '<div class="loading">No patients waiting</div>';
}

function updateDoctorDisplay() {
    const waitingPatient = patients.find(p => !p.billed);
    const currentPatientDiv = document.getElementById('currentPatient');

    if (waitingPatient) {
        document.getElementById('currentToken').textContent = waitingPatient.token;
        currentPatientDiv.innerHTML = `
            <div class="patient-card">
                <strong>${waitingPatient.token} - ${waitingPatient.name}</strong><br>
                ${waitingPatient.details || 'No additional info'}
                ${waitingPatient.prescription?.length > 0 ?
                `<br><strong>Past Prescriptions:</strong><br>${waitingPatient.prescription.map(p => `• ${p.text}`).join('<br>')}` : ''}
            </div>
        `;
    } else {
        currentPatientDiv.innerHTML = '<div class="loading">No patients waiting</div>';
    }
}

function updateStats() {
    const totalPatients = patients.length;
    const waitingPatientsCount = patients.filter(p => !p.billed).length;
    const totalBillAmount = bills.reduce((sum, bill) => sum + (bill.charges || 0), 0);

    document.getElementById('totalPatients').textContent = totalPatients;
    document.getElementById('waitingPatients').textContent = waitingPatientsCount;
    document.getElementById('totalBills').textContent = `₹${totalBillAmount.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Clinic Management System READY!');
});
