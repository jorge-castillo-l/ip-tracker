let map;
let marker;

// Inicia mapa
function initMap(lat = 51.505, lng = -0.09) {
    map = L.map('map').setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'}).addTo(map);
    marker = L.marker([lat, lng]).addTo(map);
}

// Actualiza mapa
function updateMap(lat, lng) {
    map = map.setView([lat, lng], 13);
    marker = marker.setLatLng([lat, lng]);
}

// Actualiza el panel de información
function updateInfo(data) {
    document.getElementById('ip').textContent = data.ip || 'No disponible';
    document.getElementById('location').textContent = data.location || 'No disponible';
    document.getElementById('timezone').textContent = data.timezone || 'No disponible';
    document.getElementById('isp').textContent = data.isp || 'No disponible';
}

// Obtiene la dirección IP pública del usuario y su ubicación
async function getUserIpAndLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json();
        if (!response.ok) {
            let msg = `HTTP error, Status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData?.message) {
                    msg = errorData.message;
                }
            } catch {
            }
            throw new Error(msg);
        }

        return { 
            ip : data.ip,
            location : `${data.city}, ${data.region} ${data.postal || ''}`,
            timezone : `UTC ${data.utc_offset}`,
            isp : data.org,
            lat : data.latitude,
            lng : data.longitude,
        }
    }
    catch(error) {
        console.error('Error fetching IP y ubicación', error.message);
        return null;
    }
}

// Busca datos de una IP específica
async function fetchIpData(ipAddress) {
    const apiKey = 'at_mEG2FNbKnMnON27DdVS86fziOXvmH';
    const baseUrl = 'https://geo.ipify.org/api/v2/country,city';
    const url = `${baseUrl}?apiKey=${apiKey}&ipAddress=${ipAddress}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if(!response.ok) {
            throw new Error(`API Error: ${data.messages || data.message || 'Error desconocido'}`);
        }

        updateInfo({
            ip: data.ip,
            location: `${data.location.city}, ${data.location.region} ${data.location.postalCode || ''}`,
            timezone: `UTC ${data.location.timezone}`,
            isp: data.isp
        });
        updateMap(data.location.lat, data.location.lng);
    }
    catch(error) {
        console.error('Error fetching IP data:', error);
        updateInfo({
            ip: 'Error',
            location: 'Error fetching ubicación',
            timezone: 'Desconocida',
            isp: 'Error'
        });
    };
}

// Event listeners
document.querySelector('.search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('.search-form__input');
    const searchValue = input.value.trim();
    
    if(searchValue) {
        fetchIpData(searchValue);
    }
})

// Inicializar
window.addEventListener('load', async () => {
    initMap();
    const locationData = await(getUserIpAndLocation());
    if(locationData) {
        updateInfo(locationData);
        updateMap(locationData.lat, locationData.lng);
    }
})

