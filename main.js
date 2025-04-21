let map;
let marker;

// Iniciando mapa
function initMap(lat = 51.505, lng = -0.09) {
    map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lng]).addTo(map);
}

// Actualizando ubicación del mapa
function updateMap(lat, lng) {
    map.setView([lat, lng], 13);
    marker.setLatLng([lat, lng]);
}

// Actualiza el panel de información
function updateInfo(data) {
    document.getElementById('ip').textContent = data.ip || 'Not available';
    document.getElementById('location').textContent = data.location || 'Location data unavailable';
    document.getElementById('timezone').textContent = data.timezone || 'Timezone unknown';
    document.getElementById('isp').textContent = data.isp || 'Not available';
}

// Get user's IP and location data
async function getUserIPAndLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.error) {
            throw new Error('Error fetching location data');
        }

        return {
            ip: data.ip,
            location: `${data.city}, ${data.region} ${data.postal || ''}`,
            timezone: `UTC ${data.utc_offset}`,
            isp: data.org,
            lat: data.latitude,
            lng: data.longitude
        };
    } catch (error) {
        console.error('Error fetching IP and location:', error);
        return null;
    }
}

// Fetch IP data from ipify for searched IPs
async function fetchIPData(ipAddress) {
    const apiKey = 'at_mEG2FNbKnMnON27DdVS86fziOXvmH';
    const baseUrl = 'https://geo.ipify.org/api/v2/country,city';
    const url = `${baseUrl}?apiKey=${apiKey}&ipAddress=${ipAddress}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`API Error: ${data.messages || 'Unknown error'}`);
        }

        updateInfo({
            ip: data.ip,
            location: `${data.location.city}, ${data.location.region} ${data.location.postalCode || ''}`,
            timezone: `UTC ${data.location.timezone}`,
            isp: data.isp
        });
        updateMap(data.location.lat, data.location.lng);
    } catch (error) {
        console.error('Error fetching IP data:', error);
        updateInfo({
            ip: 'Error',
            location: 'Error fetching location',
            timezone: 'Unknown',
            isp: 'Error fetching data'
        });
    }
}

// Event listeners
document.querySelector('.search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('.search-form__input');
    const searchValue = input.value.trim();
    if (searchValue) {
        fetchIPData(searchValue);
    }
});

// Initialize
window.addEventListener('load', async () => {
    initMap();
    const locationData = await getUserIPAndLocation();
    if (locationData) {
        updateInfo(locationData);
        updateMap(locationData.lat, locationData.lng);
    }
});