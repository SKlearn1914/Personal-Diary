const correctPIN = "1234";

function checkPIN() {
    const pin = document.getElementById("pinInput").value;
    const error = document.getElementById("pinError");
    if (pin === correctPIN) {
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("diaryContainer").style.display = "block";
        loadEntry();
        renderMoodChart();
    } else {
        error.textContent = "Incorrect PIN!";
    }
}

// Save entry
function saveEntry() {
    const date = document.getElementById("entryDate").value;
    const entry = document.getElementById("diaryEntry").value;
    const mood = document.getElementById("moodSelect").value;
    const tags = document.getElementById("tagsInput").value.split(",").map(t => t.trim()).filter(t => t);

    if (!date) { alert("Select a date"); return; }

    const diaryData = { text: entry, mood: mood, tags: tags };
    localStorage.setItem("diary_" + date, JSON.stringify(diaryData));
    alert("Entry saved!");
    renderMoodChart();
}

// Load entry
function loadEntry() {
    const date = document.getElementById("entryDate").value;
    if (!date) return;

    const data = JSON.parse(localStorage.getItem("diary_" + date));
    if (data) {
        document.getElementById("diaryEntry").value = data.text;
        document.getElementById("moodSelect").value = data.mood;
        document.getElementById("tagsInput").value = data.tags.join(", ");
    } else {
        document.getElementById("diaryEntry").value = "";
        document.getElementById("moodSelect").value = "😊";
        document.getElementById("tagsInput").value = "";
    }
}

function newEntry() {
    document.getElementById("diaryEntry").value = "";
    document.getElementById("tagsInput").value = "";
    document.getElementById("moodSelect").value = "😊";
    document.getElementById("entryDate").value = "";
}

// Print event sheet
function printEvents() {
    let html = '<h2>Diary Event Sheet</h2>';
    const keys = Object.keys(localStorage).filter(k => k.startsWith("diary_")).sort();
    if (keys.length === 0) html += "<p>No entries found.</p>";

    keys.forEach(key => {
        const date = key.replace("diary_", "");
        const data = JSON.parse(localStorage.getItem(key));
        html += `<h3>${date}</h3><p>Mood: ${data.mood}</p><p>${data.text.replace(/\n/g, "<br>")}</p>`;
        if (data.tags.length) html += `<p>Tags: ${data.tags.join(", ")}</p>`;
        html += "<hr>";
    });

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Event Sheet</title></head><body>');
    printWindow.document.write(html);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Search entries
function searchEntries() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const keys = Object.keys(localStorage).filter(k => k.startsWith("diary_"));
    let found = false;

    keys.forEach(key => {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.text.toLowerCase().includes(query) || data.tags.some(tag => tag.toLowerCase().includes(query))) {
            console.log("Found on", key.replace("diary_", ""));
            found = true;
        }
    });

    if (!found) console.log("No results found");
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle("dark");
}

// Mood Chart
function renderMoodChart() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("diary_")).sort();
    const moods = keys.map(k => JSON.parse(localStorage.getItem(k)).mood);

    const ctx = document.getElementById('moodChart').getContext('2d');
    if (window.moodChart) window.moodChart.destroy();
    window.moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: keys.map(k => k.replace("diary_", "")),
            datasets: [{
                label: 'Mood Tracker',
                data: moods.map(m => moodToNumber(m)),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.3
            }]
        },
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: function (value) {
                            return numberToMood(value);
                        }
                    },
                    min: 1,
                    max: 10
                }
            }
        }
    });
}

function moodToNumber(mood) {
    const mapping = { "😢": 1, "😐": 3, "😊": 5, "😍": 6, "😎": 7, "😡": 2, "😴": 3, "🤔": 4, "😱": 1, "🤯": 2 };
    return mapping[mood] || 5;
}

function numberToMood(num) {
    const mapping = { 1: "😢", 2: "😡", 3: "😐", 4: "🤔", 5: "😊", 6: "😍", 7: "😎" };
    return mapping[num] || "😊";
}
