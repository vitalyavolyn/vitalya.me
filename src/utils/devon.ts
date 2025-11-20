export async function getToday() {
  const response = await fetch(`${import.meta.env.DEVON_URL}/today`, {
    signal: AbortSignal.timeout(3000),
  });
  const data = await response.json();
  return data;
}

// TODO: cache image??
export async function getMapUrl(wttr: any) {
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${wttr.areaLongitude},${wttr.areaLatitude - 0.05},10,0/1280x380@2x?access_token=${import.meta.env.MAPBOX_KEY}`;
}
