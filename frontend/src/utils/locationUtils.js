export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};
    const label = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    return {
      lat,
      lng,
      label,
      area: address.suburb || address.neighbourhood || address.village || address.hamlet || null,
      city: address.city || address.town || address.village || address.county || null,
      state: address.state || null,
      country: address.country || null,
      postcode: address.postcode || null,
    };
  } catch (error) {
    return {
      lat,
      lng,
      label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };
  }
}

export function formatLocationLabel(location) {
  if (!location) {
    return 'Unknown location';
  }

  if (location.label) {
    return location.label;
  }

  if (location.address) {
    return location.address;
  }

  if (location.lat != null && location.lng != null) {
    return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
  }

  return 'Unknown location';
}
