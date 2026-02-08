

// === CONFIG ===
const BACKEND_URL = 'https://olympic-medals-proxy.elander1811.workers.dev/api/medals';
const REFRESH_INTERVAL_MINUTES = 5;     // how often to auto-refresh (2–10 is good)

let medalData = [];                     // will store the array of countries + medals

// === DOM REFERENCES ===
const leaderboardElement = document.getElementById('leaderboard');

// === FETCH MEDAL DATA ===
async function fetchMedalData() {
    try {
        const response = await fetch(BACKEND_URL);
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        medalData = await response.json();

        // sort just in case the backend didn't
        medalData.sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            return b.gold - a.gold;
        });

        renderLeaderboard();

        // show last update time
        const now = new Date().toLocaleTimeString();
        const updateInfo = document.createElement('p');
        updateInfo.textContent = `Last updated: ${now}`;
        updateInfo.style.fontSize = '0.9em';
        updateInfo.style.color = '#888';
        leaderboardElement.prepend(updateInfo);

    } catch (error) {
        console.error('Error fetching medals:', error);
        leaderboardElement.innerHTML += `
            <p style="color: red; margin-top: 10px;">
                Couldn't load medal data right now.<br>
                Please try again later.
            </p>
        `;
    }
}

// === RENDER THE MEDAL TABLE ===
function renderLeaderboard() {
    let html = '<h2>Medal Standings – Milano Cortina 2026</h2>';

    if (!medalData || medalData.length === 0) {
        html += '<p style="color: #666;">No medal data available yet. Refreshing soon...</p>';
    } else {
        html += `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background: #f0f0f0;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Rank</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Country</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Gold</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Silver</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Bronze</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        medalData.forEach((country, index) => {
            html += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${country.country}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${country.gold}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${country.silver}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${country.bronze}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${country.total}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
    }

    leaderboardElement.innerHTML = html;
}

// === AUTO-REFRESH LOGIC ===
let refreshTimer = null;

function startAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }

    fetchMedalData(); // do it right away

    refreshTimer = setInterval(() => {
        fetchMedalData();
    }, REFRESH_INTERVAL_MINUTES * 60 * 1000);

    console.log(`Auto-refresh started (every ${REFRESH_INTERVAL_MINUTES} minutes)`);
}

// === START EVERYTHING WHEN PAGE LOADS ===
window.addEventListener('load', () => {
    startAutoRefresh();
});

// Optional: clean up when leaving the page
window.addEventListener('beforeunload', () => {
    if (refreshTimer) clearInterval(refreshTimer);
});

// === YOUR EXISTING BUTTON (if you have one) ===
document.getElementById('refreshButton')?.addEventListener('click', fetchMedalData);
