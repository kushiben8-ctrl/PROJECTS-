// Global state
let currentUser = null;
let patients = {};
let tokenCounter = 1000;

// Logging function
function logAction(user, action, details) {
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] ${user}: ${action} - ${details}`;
    console.log(logEntry);
}

// Login functions
function loginDoctor() {
    const email = document.getElementById('doctorEmail').value;
    const password = document.getElementById('doctorPassword').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    logAction('System', 'Login Attempt', `Doctor login attempt for ${email}`);
    
    currentUser = { role: 'doctor', email: email };
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('doctorDashboard').classList.add('active');
    logAction('Doctor', 'Login Success', `${email} logged in`);
    loadDoctorPatients();
}

function loginReceptionist() {
    const email = document.getElementById('receptionistEmail').value;
    const password = document.getElementById('receptionistPassword').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    logAction('System', 'Login Attempt', `Receptionist login attempt for ${email}`);
    
    currentUser = { role: 'receptionist', email: email };
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('receptionistDashboard').classList.add('active');
    logAction('Receptionist', 'Login Success', `${email} logged in`);
    loadReceptionistPatients();
}

function logout() {
    logAction(currentUser.role, 'Logout', `${currentUser.email} logged out`);
    currentUser = null;
    document.getElementById('loginSection').style.display = 'grid';
    document.getElementById('doctorDashboard').classList.remove('active');
    document.getElementById('receptionistDashboard').classList.remove('active');
}

// Register patient
function registerPatient() {
    const name = document.getElementById('patientName').value;
    const age = document.getElementById('patientAge').value;
    const phone = document.getElementById('patientPhone').value;
    const gender = document.getElementById('patientGender').value;
    const history = document.getElementById('patientHistory').value;

    if (!name || !age || !phone) {
        alert('Please fill all required fields');
        return;
    }

    const token = `TKN${tokenCounter++}`;
    const patientId = Date.now().toString();
    
    const patient = {
        id: patientId,
        token: token,
        name: name,
        age: age,
        phone: phone,
        gender: gender,
        medicalHistory: history,
        status: 'waiting',
        prescription: '',
        registeredAt: new Date().toISOString(),
        registeredBy: currentUser.email
    };

    patients[patientId] = patient;
    
    logAction('Receptionist', 'Patient Registration', `Registered ${name} with token ${token}`);
    
    // Clear form
    document.getElementById('patientName').value = '';
    document.getElementById('patientAge').value = '';
    document.getElementById('patientPhone').value = '';
    document.getElementById('patientHistory').value = '';
    
    loadReceptionistPatients();
    alert(`Patient registered successfully!\nToken: ${token}`);
}

// Load patients for receptionist
function loadReceptionistPatients() {
    const container = document.getElementById('receptionistPatientList');
    container.innerHTML = '';

    Object.values(patients).forEach(patient => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <h4>Token: ${patient.token} - ${patient.name}</h4>
            <div class="patient-info">
                <div class="info-item"><strong>Age:</strong> ${patient.age}</div>
                <div class="info-item"><strong>Gender:</strong> ${patient.gender}</div>
                <div class="info-item"><strong>Phone:</strong> ${patient.phone}</div>
            </div>
            <div class="info-item"><strong>Medical History:</strong> ${patient.medicalHistory || 'None'}</div>
            <div style="margin-top: 10px;">
                <span class="status-badge ${patient.status === 'completed' ? 'status-completed' : 'status-waiting'}">
                    ${patient.status === 'completed' ? 'Completed' : 'Waiting'}
                </span>
            </div>
            ${patient.prescription ? `
                <div class="prescription-section">
                    <strong>Prescription:</strong>
                    <p style="margin-top: 5px; color: #495057;">${patient.prescription}</p>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

// Load patients for doctor
function loadDoctorPatients() {
    const container = document.getElementById('doctorPatientList');
    container.innerHTML = '';

    Object.values(patients).forEach(patient => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        const prescriptionId = `prescription_${patient.id}`;
        
        card.innerHTML = `
            <h4>Token: ${patient.token} - ${patient.name}</h4>
            <div class="patient-info">
                <div class="info-item"><strong>Age:</strong> ${patient.age}</div>
                <div class="info-item"><strong>Gender:</strong> ${patient.gender}</div>
                <div class="info-item"><strong>Phone:</strong> ${patient.phone}</div>
            </div>
            <div class="info-item"><strong>Medical History:</strong> ${patient.medicalHistory || 'None'}</div>
            <div style="margin-top: 10px;">
                <span class="status-badge ${patient.status === 'completed' ? 'status-completed' : 'status-waiting'}">
                    ${patient.status === 'completed' ? 'Completed' : 'Waiting'}
                </span>
            </div>
            ${patient.status === 'waiting' ? `
                <div class="prescription-section">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Add Prescription:</label>
                    <textarea id="${prescriptionId}" placeholder="Enter prescription details..."></textarea>
                    <button class="btn btn-primary btn-small" onclick="savePrescription('${patient.id}', '${prescriptionId}')">
                        Save Prescription
                    </button>
                </div>
            ` : `
                <div class="prescription-section">
                    <strong>Prescription:</strong>
                    <p style="margin-top: 5px; color: #495057;">${patient.prescription}</p>
                </div>
            `}
        `;
        container.appendChild(card);
    });
}

// Save prescription
function savePrescription(patientId, textareaId) {
    const prescription = document.getElementById(textareaId).value;
    
    if (!prescription) {
        alert('Please enter a prescription');
        return;
    }

    patients[patientId].prescription = prescription;
    patients[patientId].status = 'completed';
    patients[patientId].completedAt = new Date().toISOString();
    patients[patientId].completedBy = currentUser.email;

    logAction('Doctor', 'Prescription Added', `Prescription added for ${patients[patientId].name} (${patients[patientId].token})`);
    
    loadDoctorPatients();
    alert('Prescription saved successfully!');
}

// Initial log
console.log('Clinic Management System initialized');
logAction('System', 'Initialization', 'Application started successfully');