export async function getToday() {
  const response = await fetch(`${import.meta.env.DEVON_URL}/today`, {
    signal: AbortSignal.timeout(3000),
  });
  const data = await response.json();
  return data;
}

let cachedCoords = { lat: 0, lon: 0 };
let cachedMap = "";
export async function getMapUrl(wttr: any) {
  const lon = wttr.areaLongitude;
  const lat = wttr.areaLatitude - 0.05;
  if (cachedMap && cachedCoords.lat === lat && cachedCoords.lon === lon) {
    return cachedMap;
  }

  const url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${lon},${lat},10,0/1280x380@2x?access_token=${import.meta.env.MAPBOX_KEY}`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  cachedMap = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
  cachedCoords = { lat, lon };
  return cachedMap;
}
