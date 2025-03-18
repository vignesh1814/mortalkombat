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

// Load registered participants
async function loadRegisteredParticipants() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=fetchRegistered`);
        const data = await response.json();
        const select = document.getElementById('registeredParticipants');
        select.innerHTML = '';
        data.forEach(participant => {
            const option = document.createElement('option');
            option.value = participant.name;
            option.textContent = participant.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading participants:", error);
        alert("Failed to load participants. Please try again.");
    }
}

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

// Register Participant
async function registerParticipant() {
    const name = document.getElementById('participantName').value.trim();
    const phone = document.getElementById('participantPhone').value.trim();
    if (!name || !phone) {
        alert('Please enter both name and phone number.');
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?action=register&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
        const result = await response.json();
        if (result.status === 'success') {
            alert('Participant registered successfully!');
            document.getElementById('participantName').value = '';
            document.getElementById('participantPhone').value = '';
            loadRegisteredParticipants();
        } else {
            alert('Failed to register participant: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error("Error registering participant:", error);
        alert("Failed to register participant. Please try again.");
    }
}

// Check-In Participant
async function checkInParticipant() {
    const name = document.getElementById('registeredParticipants').value;
    if (!name) {
        alert('Please select a participant.');
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?action=checkIn&name=${encodeURIComponent(name)}`);
        const result = await response.json();
        if (result.status === 'success') {
            alert('Participant checked in successfully!');
            loadRegisteredParticipants();
            // Refresh checked-in list if it's already visible
            if (document.querySelector('.checked-in-list')) {
                loadCheckedInParticipants();
            }
        } else {
            alert('Failed to check in participant: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error("Error checking in participant:", error);
        alert("Failed to check in participant. Please try again.");
    }
}

// Drop Checked-In Participant
async function dropCheckedInParticipant() {
    const name = document.getElementById('registeredParticipants').value;
    if (!name) {
        alert('Please select a participant.');
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?action=dropCheckedIn&name=${encodeURIComponent(name)}`);
        const result = await response.json();
        if (result.status === 'success') {
            alert('Participant dropped successfully!');
            loadRegisteredParticipants();
            // Refresh checked-in list if it's already visible
            if (document.querySelector('.checked-in-list')) {
                loadCheckedInParticipants();
            }
        } else {
            alert('Failed to drop participant: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error("Error dropping participant:", error);
        alert("Failed to drop participant. Please try again.");
    }
}

// Form Teams
async function formTeams() {
    const teamSize = parseInt(document.getElementById('teamSize').value);
    if (isNaN(teamSize) || teamSize < 2) {
        alert('Please enter a valid team size (minimum 2).');
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?action=formTeams&teamSize=${teamSize}`);
        const result = await response.json();
        if (result.status === 'success') {
            const teamsContainer = document.getElementById('teamsContainer');
            teamsContainer.innerHTML = '';
            result.teams.forEach((team, index) => {
                const teamElement = document.createElement('div');
                teamElement.className = 'team';
                teamElement.innerHTML = `<h3>Team ${index + 1}</h3><p>${team.join(', ')}</p>`;
                teamsContainer.appendChild(teamElement);
            });
        } else {
            alert('Failed to form teams: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error("Error forming teams:", error);
        alert("Failed to form teams. Please try again.");
    }
}

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
    loadRegisteredParticipants();
});