const monthNameEl = document.getElementById('month-name');
const yearEl = document.getElementById('year');
const dayNameEl = document.getElementById('day-name');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const gridEl = document.getElementById('calendar-grid');
const eventsEl = document.getElementById('events');

let currentDate = new Date(2026, 0); // Start from Jan 2026
let today = new Date();

// Mock events data (replace with real data source)
const events = {
    '2026-01-15': ['Team Meeting', 'Project Deadline']
};

function updateDisplay(date = currentDate) {
    monthNameEl.textContent = date.toLocaleString('en', { month: 'long' });
    yearEl.textContent = date.getFullYear();
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const startWeekday = firstDay.getDay();
    
    gridEl.innerHTML = '';
    
    // Weekday headers
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const header = document.createElement('div');
        header.textContent = day;
        header.style.fontWeight = 'bold';
        header.style.color = 'rgb(158, 17, 38)';
        gridEl.appendChild(header);
    });
    
    // Empty slots before month start
    for (let i = 0; i < startWeekday; i++) {
        const empty = document.createElement('div');
        empty.className = 'grid-day other-month';
        gridEl.appendChild(empty);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'grid-day';
        dayEl.textContent = day;
        
        const dayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (events[dayStr]) dayEl.classList.add('has-event');
        
        const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
        if (cellDate.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }
        
        dayEl.addEventListener('click', () => selectDay(cellDate));
        gridEl.appendChild(dayEl);
    }
}

function selectDay(date) {
    currentDate = date;
    dayNameEl.textContent = date.toLocaleString('en', { weekday: 'long' });
    updateDisplay();
    updateEvents(date);
    
    // Highlight selected day
    document.querySelectorAll('.grid-day').forEach(d => d.style.background = '');
    event.target.style.background = 'rgba(252, 45, 45, 0.3)';
}

function updateEvents(date) {
    const dayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayEvents = events[dayStr] || ['No events today'];
    eventsEl.innerHTML = dayEvents.map(e => `<p>${e}</p>`).join('');
}

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateDisplay();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateDisplay();
});

// Initial load
updateDisplay();
