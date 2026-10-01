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
    'lahore': { lat: 31.5204, lng: 74.3587 },
    'karachi': { lat: 24.8607, lng: 67.0011 },
    'islamabad': { lat: 33.6844, lng: 73.0479 },
    'rawalpindi': { lat: 33.5973, lng: 73.0479 },
    'faisalabad': { lat: 31.4187, lng: 73.0791 },
    'multan': { lat: 30.1575, lng: 71.5249 },
    'peshawar': { lat: 34.0151, lng: 71.5249 },
    'quetta': { lat: 30.1798, lng: 66.9750 },
    'hyderabad': { lat: 25.3960, lng: 68.3578 },
    'gujranwala': { lat: 32.1617, lng: 74.1883 },
    'sialkot': { lat: 32.4945, lng: 74.5229 }
};

function getCityCoordinates(city, province) {
    if (!city) return null;
    const lowerCity = city.toLowerCase().trim();
    return cityCoordinates[lowerCity] || null;
}

module.exports = {
    getDistanceAndDuration,
    geocodeAddress,
    getCityCoordinates
};
