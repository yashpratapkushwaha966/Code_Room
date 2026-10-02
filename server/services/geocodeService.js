const ApiError = require('../utils/ApiError');

/**
 * Converts a free-text location (e.g. "MP Nagar, Bhopal") into { lat, lng }.
 * Provider-agnostic: swap the implementation based on GEOCODING_PROVIDER
 * without touching any calling code (controllers just call geocodeLocation()).
 *
 * Supported providers out of the box: 'opencage', 'mapbox'.
 * Add more providers by adding another branch below.
 */
const geocodeLocation = async (query) => {
  const provider = process.env.GEOCODING_PROVIDER || 'opencage';
  const apiKey = process.env.GEOCODING_API_KEY;

  if (!apiKey) {
    throw new ApiError(500, 'Geocoding is not configured on the server');
  }

  if (provider === 'opencage') {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      query
    )}&key=${apiKey}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new ApiError(404, `Could not find a location matching "${query}"`);
    }

    const { lat, lng } = data.results[0].geometry;
    return { lat, lng, formattedAddress: data.results[0].formatted };
  }

  if (provider === 'mapbox') {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${apiKey}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new ApiError(404, `Could not find a location matching "${query}"`);
    }

    const [lng, lat] = data.features[0].center;
    return { lat, lng, formattedAddress: data.features[0].place_name };
  }

  throw new ApiError(500, `Unsupported geocoding provider: ${provider}`);
};

module.exports = { geocodeLocation };
