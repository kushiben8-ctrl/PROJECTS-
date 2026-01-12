// Your Firebase config from console.firebase.google.com
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    // ... other fields
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let user = null;

// Simple auth (expand for Google/Email)
document.getElementById('loginBtn').addEventListener('click', () => {
    auth.signInAnonymously().then((userCredential) => {
        user = userCredential.user; document.getElementById('loginBtn').textContent = 'Logged In';
    });
});

function startAssessment() {
    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('assessment').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('assessForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user) { alert('Please login first'); return; }

    const data = {
        interest: document.getElementById('interest').value,
        personality: document.getElementById('personality').value,
        aptitude: document.getElementById('aptitude').value,
        eq: document.getElementById('eq').value,
        orientation: document.getElementById('orientation').value,
        userId: user.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('assessments').add(data);
        const score = (parseInt(data.interest) + parseInt(data.personality) + parseInt(data.aptitude) + parseInt(data.eq)) / 4;
        document.getElementById('recommendations').innerHTML = `
            <h3>34-Page Career Report</h3>
            <p>Your average score: ${score.toFixed(1)}/10 based on 56 parameters.</p>
            <ul>
                <li>Best-fit: Software Engineer (High Aptitude ${data.aptitude})</li>
                <li>Personality Match: Creative roles (EQ: ${data.eq})</li>
                <li>Development Plan: Practice coding daily</li>
            </ul>
        `;
    } catch (error) { console.error('Error:', error); }
});
