import dotenv from 'dotenv';
dotenv.config();

const API = process.env.API_URL || 'http://localhost:3000/api';

const devices = Array.from({ length: 10 }, (_, i) => ({
  username: `dev${String(i + 1).padStart(4, '0')}`,
  password: `Device@${String(i + 1).padStart(4, '0')}`,
  lat: 6.9 + i * 0.01,
  lng: 79.8 + i * 0.01
}));

async function getToken(dev) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: dev.username, password: dev.password })
  });
  const d = await r.json();
  return d.token;
}

async function sendPing(token, dev) {
  dev.lat += (Math.random() - 0.5) * 0.002;
  dev.lng += (Math.random() - 0.5) * 0.002;
  const r = await fetch(`${API}/locations/ping`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      deviceId: dev.username.replace('dev', 'DEV').toUpperCase(),
      latitude:  dev.lat,
      longitude: dev.lng,
      speed:   Math.floor(Math.random() * 60),
      heading: Math.floor(Math.random() * 360)
    })
  });
  const d = await r.json();
  if (d.success) {
    console.log(`${dev.username} → [${dev.lng.toFixed(4)}, ${dev.lat.toFixed(4)}]  ${new Date().toISOString()}`);
  } else {
    console.log(`${dev.username} failed:`, d.message);
  }
}

(async () => {
  console.log('Authenticating devices...');
  const tokens = await Promise.all(devices.map(getToken));
  console.log('All devices authenticated. Sending pings every 10 seconds...\n');

  setInterval(async () => {
    await Promise.all(devices.map((dev, i) => sendPing(tokens[i], dev)));
  }, 10000);
})();