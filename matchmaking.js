const SCRIPT_URL = 'https://script.google.com/macros/s/18lsrjyDirzDbntaP13s-t080QKU-39uG_CvJJXR7z3F1JcwaBxlwul0W/exec';

// Music toggle functionality
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;

musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
        backgroundMusic.pause();
        musicToggle.style.opacity = 0.5;
    } else {
        backgroundMusic.play().catch(error => {
            console.error("Audio playback failed:", error);
            alert("Please click the music button again to play");
        });
        musicToggle.style.opacity = 1;
    }
    musicPlaying = !musicPlaying;
});

// Load checked-in participants
async function loadCheckedInParticipants() {
    try {
        const checkedInContainer = document.getElementById('checkedInContainer');
        checkedInContainer.innerHTML = '<p>Loading checked-in participants...</p>';

        const response = await fetch(`${SCRIPT_URL}?action=fetchCheckedIn`);
        const data = await response.json();
        
        if (data.length === 0) {
            checkedInContainer.innerHTML = '<p>No participants have checked in yet.</p>';
            return;
        }
        
        checkedInContainer.innerHTML = '';
        const participantsList = document.createElement('ul');
        participantsList.className = 'checked-in-list';
        
        data.forEach(participant => {
            const listItem = document.createElement('li');
            listItem.className = 'participant-item';
            listItem.textContent = participant.name;
            participantsList.appendChild(listItem);
        });
        
        checkedInContainer.appendChild(participantsList);
    } catch (error) {
        console.error("Error loading checked-in participants:", error);
        const checkedInContainer = document.getElementById('checkedInContainer');
        checkedInContainer.innerHTML = '<p>Failed to load checked-in participants. Please try again.</p>';
    }
}

// Random Matchmaking
async function randomMatchmaking() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=randomMatchmaking`);
        const result = await response.json();
        if (result.status === 'success') {
            alert('Random matchmaking completed!');
            populateTree();
        } else {
            alert('Failed to perform random matchmaking: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error("Error in matchmaking:", error);
        alert("Failed to perform matchmaking. Please try again.");
    }
}

// Update Result
async function updateResult() {
    const matchId = document.getElementById('matchId').value.trim();
    const winner = document.getElementById('winner').value.trim();
    if (!matchId || !winner) {
        alert('Please enter both match ID and winner.');
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?action=updateResult&matchId=${encodeURIComponent(matchId)}&winner=${encodeURIComponent(winner)}`);
        const result = await response.json();
        if (result.status === 'success') {
            alert('Result updated successfully!');
            document.getElementById('matchId').value = '';
            document.getElementById('winner').value = '';
            populateTree();
        } else {
            alert('Failed to update result: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error("Error updating result:", error);
        alert("Failed to update result. Please try again.");
    }
}

// Populate Knockout Tree
async function populateTree() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=fetchMatches`);
        const data = await response.json();
        const tree = document.getElementById('tree');
        tree.innerHTML = ''; // Clear existing content

        // Group matches by rounds
        const matchesByRound = {};
        data.forEach((match) => {
            const round = match.round || 'Unassigned';
            if (!matchesByRound[round]) {
                matchesByRound[round] = [];
            }
            matchesByRound[round].push(match);
        });

        // Create round containers and populate matches
        Object.keys(matchesByRound).sort().forEach((round) => {
            const roundContainer = document.createElement('div');
            roundContainer.className = 'round';
            
            const roundTitle = document.createElement('h3');
            roundTitle.textContent = `Round ${round}`;
            roundContainer.appendChild(roundTitle);
            
            matchesByRound[round].forEach((match, index) => {
                const matchElement = document.createElement('div');
                matchElement.className = 'match';
                
                // Display match ID for reference when updating results
                const matchHeader = document.createElement('h4');
                matchHeader.textContent = `Match ${match.id || index + 1}`;
                matchElement.appendChild(matchHeader);
                
                // Team vs Team
                const matchup = document.createElement('p');
                matchup.innerHTML = `<strong>${match.team1 || 'TBD'}</strong> vs <strong>${match.team2 || 'TBD'}</strong>`;
                matchElement.appendChild(matchup);
                
                // Winner display
                const winnerElement = document.createElement('p');
                winnerElement.className = 'winner';
                
                if (match.winner) {
                    winnerElement.innerHTML = `Winner: <span class="winner-name">${match.winner}</span>`;
                    winnerElement.classList.add('decided');
                } else {
                    winnerElement.textContent = 'Winner: TBD';
                }
                
                matchElement.appendChild(winnerElement);
                roundContainer.appendChild(matchElement);
            });
            
            tree.appendChild(roundContainer);
        });

        // If no matches found
        if (Object.keys(matchesByRound).length === 0) {
            const noMatches = document.createElement('p');
            noMatches.textContent = 'No matches have been created yet. Use "Generate Matches" to create the tournament bracket.';
            tree.appendChild(noMatches);
        }
    } catch (error) {
        console.error("Error loading matches:", error);
        const tree = document.getElementById('tree');
        tree.innerHTML = '<p>Failed to load tournament bracket. Please try again later.</p>';
    }
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
    populateTree();
    loadCheckedInParticipants(); // Load checked-in participants on page load
});