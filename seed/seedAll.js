import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Province      from '../src/models/Province.js';
import District      from '../src/models/District.js';
import PoliceStation from '../src/models/PoliceStation.js';
import Driver        from '../src/models/Driver.js';
import Vehicle       from '../src/models/Vehicle.js';
import User          from '../src/models/User.js';
import LocationPing  from '../src/models/LocationPing.js';
import provinceData  from './data/provinces.js';
import districtData  from './data/districts.js';

dotenv.config();

const SL_BOUNDS = { minLat: 5.9, maxLat: 9.9, minLng: 79.6, maxLng: 81.9 };
const randomCoord = () => ({
  lat: +(Math.random() * (SL_BOUNDS.maxLat - SL_BOUNDS.minLat) + SL_BOUNDS.minLat).toFixed(6),
  lng: +(Math.random() * (SL_BOUNDS.maxLng - SL_BOUNDS.minLng) + SL_BOUNDS.minLng).toFixed(6)
});

const stationNames = [
  'Colombo Fort',   'Wellawatte',    'Nugegoda',      'Kandy Central', 'Galle Fort',
  'Jaffna HQ',      'Matara',        'Kurunegala',    'Anuradhapura',  'Batticaloa',
  'Trincomalee',    'Ratnapura',     'Kegalle',       'Badulla',       'Puttalam',
  'Negombo',        'Gampaha',       'Vavuniya',      'Ampara',        'Polonnaruwa',
  'Hambantota',     'Kalutara',      'Nuwara Eliya',  'Matale',        'Mannar'
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear all existing data
  await Promise.all([
    Province.deleteMany(),      District.deleteMany(),
    PoliceStation.deleteMany(), Driver.deleteMany(),
    Vehicle.deleteMany(),       User.deleteMany(),
    LocationPing.deleteMany()
  ]);
  console.log('Cleared existing data');

  // Seed Provinces
  const provinces = await Province.insertMany(provinceData);
  const provMap   = Object.fromEntries(provinces.map(p => [p.name, p._id]));
  console.log(`${provinces.length} provinces seeded`);

  // Seed Districts
  const districts = await District.insertMany(
    districtData.map(d => ({ name: d.name, code: d.code, province: provMap[d.provinceName] }))
  );
  console.log(`${districts.length} districts seeded`);

  // Seed Police Stations
  const stations = await PoliceStation.insertMany(
    stationNames.map((name, i) => {
      const dist = districts[i % districts.length];
      return {
        name, code: `ST${String(i + 1).padStart(3, '0')}`,
        district: dist._id, province: dist.province,
        address: `${name} Police Station, Sri Lanka`
      };
    })
  );
  console.log(`${stations.length} stations seeded`);

  // Seed HQ Admin User
  await User.create({ username: 'hq_admin', password: 'Admin@123', role: 'hq_admin' });
  // Provincial Admin
await User.create({
  username: 'provincial_admin_wp',
  password: 'Provincial@123',
  role: 'provincial_admin',
  province: provinces[0]._id  // Western Province
});

// Station Officer
await User.create({
  username: 'station_officer_01',
  password: 'Officer@123',
  role: 'station_officer',
  province:      provinces[0]._id,
  district:      districts[0]._id,
  policeStation: stations[0]._id
});

console.log('Admin, Provincial Admin and Station Officer created');

  // Seed 200 Drivers + Vehicles + Device Users
  const drivers = await Driver.insertMany(
    Array.from({ length: 200 }, () => ({
      fullName:      faker.person.fullName(),
      nic:           `${faker.number.int({ min: 700000000, max: 999999999 })}V`,
      licenseNumber: `LIC${faker.number.int({ min: 100000, max: 999999 })}`,
      phone:         `07${faker.number.int({ min: 10000000, max: 99999999 })}`,
      address:       faker.location.streetAddress()
    }))
  );

  const vehicleDocs  = [];
  const deviceUsers  = [];

  for (let i = 0; i < 200; i++) {
    const deviceId   = `DEV${String(i + 1).padStart(4, '0')}`;
    const dist       = districts[i % districts.length];
    const { lat, lng } = randomCoord();
    vehicleDocs.push({
      registrationNumber: `${['WP','CP','SP','NP','EP'][i % 5]}-${String(i + 1).padStart(4, '0')}`,
      driver:      drivers[i]._id,
      deviceId,
      status:      'active',
      homeDistrict: dist._id,
      currentLocation: { type: 'Point', coordinates: [lng, lat], lastPingAt: new Date() }
    });
    deviceUsers.push({
      username: deviceId.toLowerCase(),
      password: `Device@${String(i + 1).padStart(4, '0')}`,
      role: 'device'
    });
  }

  const vehicles = await Vehicle.insertMany(vehicleDocs);

  // Save device users one by one so pre-save hook hashes passwords
  for (const u of deviceUsers) {
    await User.create(u);
  }
  console.log('200 drivers, vehicles and device users seeded');

  // Seed 7 Days Location History for first 20 vehicles
  console.log('Generating 7 days location history...');
  const now          = new Date();
  const INTERVAL_MIN = 5;
  const totalSteps   = (7 * 24 * 60) / INTERVAL_MIN;
  const pings        = [];

  for (let v = 0; v < 20; v++) {
    const vehicle = vehicles[v];
    const dist    = districts[v % districts.length];
    let { lat, lng } = randomCoord();

    for (let s = 0; s < totalSteps; s++) {
      const timestamp = new Date(now.getTime() - (totalSteps - s) * INTERVAL_MIN * 60000);

// Simulate realistic pattern:
// Day (6am-10pm)   → full movement
// Night (10pm-6am) → 80% chance to skip (less movement)
const hour = timestamp.getHours();
const isNightTime = hour >= 22 || hour < 6;
if (isNightTime && Math.random() < 0.80) continue;
      lat = Math.max(SL_BOUNDS.minLat, Math.min(SL_BOUNDS.maxLat, lat + (Math.random() - 0.5) * 0.002));
      lng = Math.max(SL_BOUNDS.minLng, Math.min(SL_BOUNDS.maxLng, lng + (Math.random() - 0.5) * 0.002));
      pings.push({
        vehicle:  vehicle._id,
        location: { type: 'Point', coordinates: [+lng.toFixed(6), +lat.toFixed(6)] },
        speed:    +(Math.random() * 60).toFixed(1),
        heading:  +(Math.random() * 360).toFixed(0),
        province: dist.province,
        district: dist._id,
        timestamp
      });
    }
  }

  // Insert pings in batches of 5000
  const BATCH = 5000;
  for (let b = 0; b < pings.length; b += BATCH) {
    await LocationPing.insertMany(pings.slice(b, b + BATCH));
    console.log(`Inserted ${Math.min(b + BATCH, pings.length)} / ${pings.length} pings`);
  }

  console.log('\nSeeding complete!');
  console.log('Login → username: hq_admin  password: Admin@123');
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });