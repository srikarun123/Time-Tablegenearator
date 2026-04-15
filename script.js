// This object holds the underlying data structure of our editable timetable
let tableData = {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    times: ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'],
    corner: 'Time / Day',
    slots: []
};

// Initialize an empty matrix array for subjects originally
function initSlots() {
    tableData.slots = Array(tableData.times.length).fill().map(() => Array(tableData.days.length).fill(''));
}
initSlots();

const timetable = document.getElementById('timetable');

// Read the DOM state periodically to maintain the custom edits user makes in the contenteditable cells
function captureGridState() {
    const dayHeaders = document.querySelectorAll('.day-header');
    if (dayHeaders.length) {
        tableData.days = Array.from(dayHeaders).map(el => el.textContent.trim());
    }
    
    const timeHeaders = document.querySelectorAll('.time-header');
    if (timeHeaders.length) {
        tableData.times = Array.from(timeHeaders).map(el => el.textContent.trim());
    }
    
    const cornerCell = document.querySelector('.corner');
    if (cornerCell) {
        tableData.corner = cornerCell.textContent.trim();
    }
    
    const slots = document.querySelectorAll('.slot');
    if (slots.length) {
        let idx = 0;
        tableData.slots = [];
        for (let r = 0; r < tableData.times.length; r++) {
            let rowData = [];
            for (let c = 0; c < tableData.days.length; c++) {
                rowData.push(slots[idx] ? slots[idx].textContent.trim() : '');
                idx++;
            }
            tableData.slots.push(rowData);
        }
    }
}

// Generate the visual representation based on current state
function renderGrid() {
    timetable.innerHTML = '';
    
    // Grid Setup: 1st column is Time (120px), remaining columns distribute equally
    timetable.style.gridTemplateColumns = `140px repeat(${tableData.days.length}, 1fr)`;

    // Corner Cell
    const cornerCell = document.createElement('div');
    cornerCell.className = 'cell header-cell corner';
    cornerCell.contentEditable = "true";
    cornerCell.spellcheck = false;
    cornerCell.textContent = tableData.corner;
    timetable.appendChild(cornerCell);

    // Day Headers
    tableData.days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'cell header-cell day-header';
        dayHeader.contentEditable = "true";
        dayHeader.spellcheck = false;
        dayHeader.textContent = day;
        timetable.appendChild(dayHeader);
    });

    // Sub Grids
    tableData.times.forEach((timeStr, r) => {
        // Time Header (Row Starter)
        const timeHeader = document.createElement('div');
        timeHeader.className = 'cell header-cell time-header';
        timeHeader.contentEditable = "true";
        timeHeader.spellcheck = false;
        timeHeader.textContent = timeStr;
        timetable.appendChild(timeHeader);

        // Subject Slots
        for (let c = 0; c < tableData.days.length; c++) {
            const slot = document.createElement('div');
            slot.className = 'cell slot';
            slot.contentEditable = "true";
            slot.spellcheck = false;
            
            // Re-apply previous text if exists
            if (tableData.slots[r] && tableData.slots[r][c] !== undefined) {
                slot.textContent = tableData.slots[r][c];
            } else {
                slot.textContent = '';
            }
            timetable.appendChild(slot);
        }
    });
}

// GUI Actions
function addDay() {
    captureGridState();
    if (tableData.days.length >= 7) {
        alert("Maximum 7 days supported visually.");
        return;
    }
    const standardDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let newDayIndex = tableData.days.length;
    tableData.days.push(standardDays[newDayIndex] || `Day ${newDayIndex + 1}`);
    
    // Add empty slot to each existing row
    tableData.slots.forEach(row => row.push(''));
    renderGrid();
}

function removeDay() {
    captureGridState();
    if (tableData.days.length <= 1) return;
    tableData.days.pop();
    // Remove last slot from each row
    tableData.slots.forEach(row => row.pop());
    renderGrid();
}

function addTimeSlot() {
    captureGridState();
    if (tableData.times.length >= 15) {
        alert("Maximum 15 time slots supported.");
        return;
    }
    
    // Sensible default logic to generate next hour increment
    let lastTime = tableData.times[tableData.times.length - 1] || "15:00 - 16:00";
    let newStart = parseInt(lastTime.split(':')[0]) + 1;
    if (isNaN(newStart) || newStart > 23) newStart = 16;
    let nextStartStr = String(newStart).padStart(2, '0') + ":00";
    let nextEndStr = String(newStart + 1).padStart(2, '0') + ":00";
    
    tableData.times.push(`${nextStartStr} - ${nextEndStr}`);
    
    // Push new row of empty subjects
    tableData.slots.push(Array(tableData.days.length).fill(''));
    renderGrid();
}

function removeTimeSlot() {
    captureGridState();
    if (tableData.times.length <= 1) return;
    tableData.times.pop();
    tableData.slots.pop();
    renderGrid();
}

// Bind Events
document.getElementById('add-col-btn').addEventListener('click', addDay);
document.getElementById('remove-col-btn').addEventListener('click', removeDay);
document.getElementById('add-row-btn').addEventListener('click', addTimeSlot);
document.getElementById('remove-row-btn').addEventListener('click', removeTimeSlot);

document.getElementById('print-btn').addEventListener('click', () => {
    // Calling print automatically triggers our @print CSS hiding sidebar & tweaking colors
    window.print();
});

document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all cells? Headers and times will remain.")) {
        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => slot.textContent = '');
    }
});

// Clock module
function tick() {
    const timeDisplay = document.getElementById('current-time');
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    timeDisplay.textContent = now.toLocaleDateString('en-US', options);
}

// Boot up
document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
    tick();
    setInterval(tick, 1000);
});
