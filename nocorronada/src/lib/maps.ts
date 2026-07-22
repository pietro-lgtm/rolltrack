/** Navigation links auto-generated from a plain-text place name. */

export const gmapsUrl = (place: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

export const wazeUrl = (place: string) =>
  `https://waze.com/ul?q=${encodeURIComponent(place)}&navigate=yes`;

/** A location is "navigable" when it names a real place, not a TBA note. */
export const isNavigable = (place: string) =>
  place.trim().length > 3 && !/por anunciar|se anuncia|rotativo/i.test(place);
