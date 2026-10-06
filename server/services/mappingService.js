const axios = require('axios');

const EARTH_RADIUS_KM = 6371;
const ROAD_FACTOR = 1.3;
const AVG_SPEED_KMH = 60;

/**
 * Mapping Service — calculates road distance and duration between two coordinate points.
 * Primary: OpenRouteService Directions API (Matrix endpoint)
 * Fallback: Haversine formula (straight-line distance × road factor 1.3)
 */

function haversineDistance(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return EARTH_RADIUS_KM * c;
}

async function getDistanceAndDuration(originCoords, destCoords) {
    const orsApiKey = process.env.ORS_API_KEY;
    
    if (orsApiKey) {
        try {
            // ORS Matrix API expects locations as [lng, lat]
            const response = await axios.post(
                'https://api.openrouteservice.org/v2/matrix/driving-car',
                {
                    locations: [
                        [originCoords.lng, originCoords.lat],
                        [destCoords.lng, destCoords.lat]
                    ],
                    metrics: ['distance', 'duration']
                },
                {
                    headers: {
                        'Authorization': orsApiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.distances && response.data.durations) {
                // distances are in meters, durations in seconds
                const distanceMeters = response.data.distances[0][1];
                const durationSeconds = response.data.durations[0][1];
                
                if (distanceMeters !== undefined && durationSeconds !== undefined) {
                    return {
                        distanceKm: distanceMeters / 1000,
                        durationHours: durationSeconds / 3600,
                        source: 'OpenRouteService'
                    };
                }
            }
        } catch (error) {
            console.warn('ORS API failed, falling back to Haversine', error.message);
        }
    }

    // Fallback
    const straightDistance = haversineDistance(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng);
    const distanceKm = straightDistance * ROAD_FACTOR;
    const durationHours = distanceKm / AVG_SPEED_KMH;

    return {
        distanceKm,
        durationHours,
        source: 'Haversine-Fallback'
    };
}

async function geocodeAddress(addressString) {
    const orsApiKey = process.env.ORS_API_KEY;
    if (!orsApiKey) {
        console.warn('No ORS API key, cannot geocode');
        return null;
    }

    try {
        const response = await axios.get('https://api.openrouteservice.org/geocode/search', {
            params: {
                api_key: orsApiKey,
                text: addressString,
                'boundary.country': 'PK'
            }
        });

        if (response.data && response.data.features && response.data.features.length > 0) {
            const coords = response.data.features[0].geometry.coordinates; // [lng, lat]
            return {
                lat: coords[1],
                lng: coords[0]
            };
        }
    } catch (error) {
        console.error('Geocoding error', error.message);
    }
    
    return null;
}

const cityCoordinates = {
    // Punjab
    'lahore': { lat: 31.5204, lng: 74.3587 }, 'faisalabad': { lat: 31.4504, lng: 73.1350 },
    'rawalpindi': { lat: 33.5651, lng: 73.0169 }, 'multan': { lat: 30.1575, lng: 71.5249 },
    'gujranwala': { lat: 32.1877, lng: 74.1945 }, 'sialkot': { lat: 32.4945, lng: 74.5229 },
    'sargodha': { lat: 32.0740, lng: 72.6861 }, 'bahawalpur': { lat: 29.3956, lng: 71.6836 },
    'gujrat': { lat: 32.5731, lng: 74.0789 }, 'sheikhupura': { lat: 31.7131, lng: 73.9783 },
    'jhang': { lat: 31.2681, lng: 72.3181 }, 'rahim yar khan': { lat: 28.4202, lng: 70.2952 },
    'chakwal': { lat: 32.9328, lng: 72.8630 }, 'jhelum': { lat: 32.9425, lng: 73.7257 },
    'kasur': { lat: 31.1187, lng: 74.4500 }, 'okara': { lat: 30.8138, lng: 73.4534 },
    'sahiwal': { lat: 30.6682, lng: 73.1114 }, 'narowal': { lat: 32.1019, lng: 74.8730 },
    'mandi bahauddin': { lat: 32.5861, lng: 73.4917 },
    // Sindh
    'karachi': { lat: 24.8607, lng: 67.0011 }, 'hyderabad': { lat: 25.3960, lng: 68.3578 },
    'sukkur': { lat: 27.7052, lng: 68.8574 }, 'larkana': { lat: 27.5590, lng: 68.2123 },
    'mirpurkhas': { lat: 25.5269, lng: 69.0159 }, 'nawabshah': { lat: 26.2442, lng: 68.4100 },
    'khairpur': { lat: 27.5295, lng: 68.7592 }, 'jacobabad': { lat: 28.2769, lng: 68.4514 },
    'shikarpur': { lat: 27.9556, lng: 68.6382 }, 'dadu': { lat: 26.7319, lng: 67.7750 },
    'thatta': { lat: 24.7461, lng: 67.9236 }, 'badin': { lat: 24.6560, lng: 68.8370 },
    'sanghar': { lat: 26.0460, lng: 68.9480 },
    // Khyber Pakhtunkhwa
    'peshawar': { lat: 34.0151, lng: 71.5249 }, 'mardan': { lat: 34.1989, lng: 72.0231 },
    'abbottabad': { lat: 34.1688, lng: 73.2215 }, 'mingora': { lat: 34.7717, lng: 72.3600 },
    'kohat': { lat: 33.5869, lng: 71.4414 }, 'nowshera': { lat: 34.0159, lng: 71.9747 },
    'mansehra': { lat: 34.3333, lng: 73.2000 }, 'dera ismail khan': { lat: 31.8313, lng: 70.9017 },
    'bannu': { lat: 32.9889, lng: 70.6056 }, 'swabi': { lat: 34.1203, lng: 72.4700 },
    'charsadda': { lat: 34.1453, lng: 71.7308 }, 'haripur': { lat: 33.9940, lng: 72.9330 },
    // Balochistan
    'quetta': { lat: 30.1798, lng: 66.9750 }, 'gwadar': { lat: 25.1216, lng: 62.3254 },
    'turbat': { lat: 26.0012, lng: 63.0544 }, 'khuzdar': { lat: 27.8000, lng: 66.6167 },
    'chaman': { lat: 30.9210, lng: 66.4597 }, 'zhob': { lat: 31.3410, lng: 69.4490 },
    'sibi': { lat: 29.5430, lng: 67.8773 }, 'loralai': { lat: 30.3705, lng: 68.5979 },
    'panjgur': { lat: 26.9660, lng: 64.0930 }, 'dera murad jamali': { lat: 28.5461, lng: 68.2231 },
    // Islamabad Capital Territory
    'islamabad': { lat: 33.6844, lng: 73.0479 },
    // Azad Jammu & Kashmir
    'muzaffarabad': { lat: 34.3700, lng: 73.4711 }, 'mirpur': { lat: 33.1478, lng: 73.7518 },
    'rawalakot': { lat: 33.8578, lng: 73.7604 }, 'kotli': { lat: 33.5184, lng: 73.9022 },
    'bhimber': { lat: 32.9746, lng: 74.0780 },
    // Gilgit-Baltistan
    'gilgit': { lat: 35.9208, lng: 74.3080 }, 'skardu': { lat: 35.2971, lng: 75.6333 },
    'ghanche': { lat: 35.1500, lng: 76.3333 }, 'ghizer': { lat: 36.1667, lng: 73.7500 },
    'hunza': { lat: 36.3167, lng: 74.6500 },
};

const provinceCentroids = {
    'punjab': { lat: 31.1704, lng: 72.7097 },
    'sindh': { lat: 25.8943, lng: 68.5247 },
    'khyber pakhtunkhwa': { lat: 34.9526, lng: 72.3311 },
    'balochistan': { lat: 28.4907, lng: 65.0958 },
    'islamabad capital territory': { lat: 33.6844, lng: 73.0479 },
    'azad jammu & kashmir': { lat: 33.9259, lng: 73.7810 },
    'gilgit-baltistan': { lat: 35.8025, lng: 74.9833 },
};

function getCityCoordinates(city, province) {
    if (!city) return null;
    const key = city.toLowerCase().replace(/_/g, ' ').trim();
    if (cityCoordinates[key]) return cityCoordinates[key];
    if (province) return provinceCentroids[province.toLowerCase().trim()] || null;
    return null;
}


module.exports = {
    getDistanceAndDuration,
    geocodeAddress,
    getCityCoordinates
};
