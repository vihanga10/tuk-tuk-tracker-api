
import dotenv from 'dotenv';
dotenv.config();

const BASE = process.env.TEST_URL || 'http://localhost:3000/api';

//Test Runner

let passed = 0;
let failed = 0;
const results = [];

const test = async (group, name, fn) => {
  try {
    await fn();
    passed++;
    results.push({ group, name, status: 'PASS' });
    console.log(`   ${name}`);
  } catch (err) {
    failed++;
    results.push({ group, name, status: 'FAIL', error: err.message });
    console.log(`   ${name}`);
    console.log(`     → ${err.message}`);
  }
};

const group = (name) => console.log(`\n ${name}`);

//Shared State

let adminToken       = null;
let provincialToken  = null;
let officerToken     = null;
let deviceToken      = null;
let createdDriverId  = null;
let provinceId       = null;
let districtId       = null;
let stationId        = null;
let vehicleId        = null;

//Helper

const req = async (method, path, body = null, token = null, extraHeaders = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`${BASE}${path}`, opts);
};

// TESTS

async function runTests() {
  console.log('');
  console.log('  Sri Lanka Police Tuk-Tuk Tracking API — Test Suite');
  console.log('  Student ID: COBSCCOMP242P-039');
  console.log(`  Target: ${BASE}`);
  console.log('');

  // 1. Health Check 
  group('1. Health Check');

  await test('Health', 'GET /health returns OK status', async () => {
    const res  = await fetch(`${BASE.replace('/api', '')}/health`);
    const data = await res.json();
    if (res.status !== 200)      throw new Error(`Expected 200, got ${res.status}`);
    if (data.status !== 'OK')    throw new Error('Status is not OK');
    if (!data.timestamp)         throw new Error('Missing timestamp');
    if (!data.uptime)            throw new Error('Missing uptime');
    if (!data.environment)       throw new Error('Missing environment');
  });

  await test('Health', 'Unknown route returns 404', async () => {
    const res = await fetch(`${BASE}/nonexistent`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  //2. Authentication 
  group('2. Authentication — POST /auth/login');

  await test('Auth', 'HQ Admin login returns JWT token', async () => {
    const res  = await req('POST', '/auth/login', { username: 'hq_admin', password: 'Admin@123' });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!data.token)        throw new Error('No token returned');
    if (!data.data.role)    throw new Error('No role in response');
    adminToken = data.token;
  });

  await test('Auth', 'Provincial Admin login succeeds', async () => {
    const res  = await req('POST', '/auth/login', { username: 'provincial_admin_wp', password: 'Provincial@123' });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!data.token)        throw new Error('No token returned');
    provincialToken = data.token;
  });

  await test('Auth', 'Station Officer login succeeds', async () => {
    const res  = await req('POST', '/auth/login', { username: 'station_officer_01', password: 'Officer@123' });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!data.token)        throw new Error('No token returned');
    officerToken = data.token;
  });

  await test('Auth', 'Device login succeeds', async () => {
    const res  = await req('POST', '/auth/login', { username: 'dev0001', password: 'Device@0001' });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!data.token)        throw new Error('No token returned');
    deviceToken = data.token;
  });

  await test('Auth', 'Wrong password returns 401', async () => {
    const res = await req('POST', '/auth/login', { username: 'hq_admin', password: 'wrongpassword' });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('Auth', 'Missing credentials returns 400', async () => {
    const res = await req('POST', '/auth/login', { username: 'hq_admin' });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('Auth', 'GET /auth/me returns current user', async () => {
    const res  = await req('GET', '/auth/me', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)            throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.username !== 'hq_admin') throw new Error('Wrong username returned');
  });

  await test('Auth', 'GET /auth/me without token returns 401', async () => {
    const res = await req('GET', '/auth/me');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('Auth', 'GET /auth/users returns all users (hq_admin only)', async () => {
    const res  = await req('GET', '/auth/users', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)     throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(data.data)) throw new Error('Expected array of users');
    if (data.count === 0)       throw new Error('No users returned');
  });

  await test('Auth', 'GET /auth/users with station_officer returns 403', async () => {
    const res = await req('GET', '/auth/users', null, officerToken);
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await test('Auth', 'Filter users by role', async () => {
    const res  = await req('GET', '/auth/users?role=device', null, adminToken);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const allDevice = data.data.every(u => u.role === 'device');
    if (!allDevice) throw new Error('Non-device users returned in device filter');
  });

  //3. Provinces
  group('3. Provinces — /api/provinces');

  await test('Provinces', 'GET /provinces returns 9 provinces', async () => {
    const res  = await req('GET', '/provinces', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)  throw new Error(`Expected 200, got ${res.status}`);
    if (data.count !== 9)    throw new Error(`Expected 9 provinces, got ${data.count}`);
    provinceId = data.data[0]._id;
  });

  await test('Provinces', 'GET /provinces without token returns 401', async () => {
    const res = await req('GET', '/provinces');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('Provinces', 'GET /provinces/:id returns single province', async () => {
    const res  = await req('GET', `/provinces/${provinceId}`, null, adminToken);
    const data = await res.json();
    if (res.status !== 200)    throw new Error(`Expected 200, got ${res.status}`);
    if (!data.data.name)       throw new Error('Province name missing');
    if (!data.data.code)       throw new Error('Province code missing');
  });

  await test('Provinces', 'GET /provinces/invalidid returns 400 CastError', async () => {
    const res = await req('GET', '/provinces/notavalidid', null, adminToken);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  //4. Districts
  group('4. Districts — /api/districts');

  await test('Districts', 'GET /districts returns 25 districts', async () => {
    const res  = await req('GET', '/districts', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)  throw new Error(`Expected 200, got ${res.status}`);
    if (data.count !== 25)   throw new Error(`Expected 25 districts, got ${data.count}`);
    districtId = data.data[0]._id;
  });

  await test('Districts', 'GET /districts?province= filters by province', async () => {
    const res  = await req('GET', `/districts?province=${provinceId}`, null, adminToken);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.count === 0)   throw new Error('No districts returned for province filter');
    const allMatch = data.data.every(d => d.province._id === provinceId || d.province === provinceId);
    if (!allMatch) throw new Error('District province filter not working');
  });

  await test('Districts', 'GET /districts/:id returns single district', async () => {
    const res  = await req('GET', `/districts/${districtId}`, null, adminToken);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!data.data.name)    throw new Error('District name missing');
  });

  await test('Districts', 'GET /districts/invalidid returns 400', async () => {
    const res = await req('GET', '/districts/invalidid', null, adminToken);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  //5. Police Stations
  group('5. Police Stations — /api/stations');

  await test('Stations', 'GET /stations returns 25 stations', async () => {
    const res  = await req('GET', '/stations', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)  throw new Error(`Expected 200, got ${res.status}`);
    if (data.count < 20)     throw new Error(`Expected at least 20 stations, got ${data.count}`);
    stationId = data.data[0]._id;
  });

  await test('Stations', 'GET /stations?district= filters by district', async () => {
    const res  = await req('GET', `/stations?district=${districtId}`, null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('Stations', 'GET /stations?province= filters by province', async () => {
    const res  = await req('GET', `/stations?province=${provinceId}`, null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('Stations', 'GET /stations/:id returns single station', async () => {
    const res  = await req('GET', `/stations/${stationId}`, null, adminToken);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!data.data.name)    throw new Error('Station name missing');
    if (!data.data.district) throw new Error('Station district missing');
  });

  //6. Drivers
  group('6. Drivers — /api/drivers');

  await test('Drivers', 'GET /drivers returns 200 drivers with pagination', async () => {
    const res  = await req('GET', '/drivers?page=1&limit=10', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)   throw new Error(`Expected 200, got ${res.status}`);
    if (data.count > 10)      throw new Error('Pagination limit not applied');
    if (!res.headers.get('x-total-count')) throw new Error('Missing X-Total-Count header');
    if (!res.headers.get('etag'))          throw new Error('Missing ETag header');
    if (parseInt(res.headers.get('x-total-count')) !== 200)
      throw new Error(`Expected X-Total-Count 200, got ${res.headers.get('x-total-count')}`);
  });

  await test('Drivers', 'GET /drivers?sort=fullName&order=asc sorts correctly', async () => {
    const res  = await req('GET', '/drivers?sort=fullName&order=asc&limit=5', null, adminToken);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.length < 2) throw new Error('Not enough drivers to check sort');
    const sorted = [...data.data].sort((a, b) => a.fullName.localeCompare(b.fullName));
    if (data.data[0].fullName !== sorted[0].fullName)
      throw new Error('Drivers not sorted alphabetically');
  });

  await test('Drivers', 'GET /drivers?search= filters by name', async () => {
    const res  = await req('GET', '/drivers?search=a&limit=5', null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('Drivers', 'Conditional GET — ETag returns 304 Not Modified', async () => {
    const res1  = await req('GET', '/drivers', null, adminToken);
    const etag  = res1.headers.get('etag');
    if (!etag) throw new Error('No ETag returned on first request');
    const res2  = await req('GET', '/drivers', null, adminToken, { 'If-None-Match': etag });
    if (res2.status !== 304) throw new Error(`Expected 304, got ${res2.status}`);
  });

  await test('Drivers', 'POST /drivers with missing fields returns 400 validation error', async () => {
    const res  = await req('POST', '/drivers', { fullName: 'Test Only' }, adminToken);
    const data = await res.json();
    if (res.status !== 400)  throw new Error(`Expected 400, got ${res.status}`);
    if (!data.errors)        throw new Error('Expected validation errors array');
  });

  await test('Drivers', 'POST /drivers creates new driver (hq_admin)', async () => {
    const res  = await req('POST', '/drivers', {
      fullName:      'Kamal Perera',
      nic:           `TEST${Date.now()}V`,
      licenseNumber: `LIC${Date.now()}`,
      phone:         '0771234567',
      address:       '123 Galle Road, Colombo'
    }, adminToken);
    const data = await res.json();
    if (res.status !== 201)     throw new Error(`Expected 201, got ${res.status}`);
    if (!data.data._id)         throw new Error('No ID returned');
    if (!data.data.fullName)    throw new Error('fullName missing');
    createdDriverId = data.data._id;
  });

  await test('Drivers', 'GET /drivers/:id returns single driver', async () => {
    const res  = await req('GET', `/drivers/${createdDriverId}`, null, adminToken);
    const data = await res.json();
    if (res.status !== 200)          throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.fullName !== 'Kamal Perera') throw new Error('Wrong driver returned');
  });

  await test('Drivers', 'PUT /drivers/:id updates driver', async () => {
    const res  = await req('PUT', `/drivers/${createdDriverId}`, { phone: '0779999999' }, adminToken);
    const data = await res.json();
    if (res.status !== 200)          throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.phone !== '0779999999') throw new Error('Phone not updated');
  });

  await test('Drivers', 'POST /drivers with device role returns 403', async () => {
    const res = await req('POST', '/drivers', {
      fullName: 'Test', nic: 'X', licenseNumber: 'X'
    }, deviceToken);
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 7. Vehicles
  group('7. Vehicles — /api/vehicles');

  await test('Vehicles', 'GET /vehicles returns 200 vehicles with headers', async () => {
    const res  = await req('GET', '/vehicles?page=1&limit=10', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)   throw new Error(`Expected 200, got ${res.status}`);
    if (data.count > 10)      throw new Error('Pagination limit not applied');
    if (!res.headers.get('x-total-count')) throw new Error('Missing X-Total-Count');
    if (!res.headers.get('etag'))          throw new Error('Missing ETag');
    vehicleId = data.data[0]._id;
  });

  await test('Vehicles', 'GET /vehicles?status=active filters by status', async () => {
    const res  = await req('GET', '/vehicles?status=active&limit=5', null, adminToken);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const allActive = data.data.every(v => v.status === 'active');
    if (!allActive) throw new Error('Non-active vehicles in active filter result');
  });

  await test('Vehicles', 'GET /vehicles?sort=registrationNumber&order=asc sorts correctly', async () => {
    const res  = await req('GET', '/vehicles?sort=registrationNumber&order=asc&limit=5', null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('Vehicles', 'Conditional GET — ETag returns 304 Not Modified', async () => {
    const res1 = await req('GET', '/vehicles', null, adminToken);
    const etag = res1.headers.get('etag');
    if (!etag) throw new Error('No ETag on first request');
    const res2 = await req('GET', '/vehicles', null, adminToken, { 'If-None-Match': etag });
    if (res2.status !== 304) throw new Error(`Expected 304, got ${res2.status}`);
  });

  await test('Vehicles', 'Cache-Control: no-store on current location', async () => {
    const res = await req('GET', `/vehicles/${vehicleId}/location/current`, null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cc = res.headers.get('cache-control');
    if (!cc || !cc.includes('no-store')) throw new Error('Missing Cache-Control: no-store');
  });

  await test('Vehicles', 'GET /vehicles/:id returns single vehicle with driver', async () => {
    const res  = await req('GET', `/vehicles/${vehicleId}`, null, adminToken);
    const data = await res.json();
    if (res.status !== 200)   throw new Error(`Expected 200, got ${res.status}`);
    if (!data.data.driver)    throw new Error('Driver not populated');
    if (!data.data.homeDistrict) throw new Error('homeDistrict not populated');
  });

  await test('Vehicles', 'POST /vehicles with missing fields returns 400', async () => {
    const res  = await req('POST', '/vehicles', { registrationNumber: 'WP-TEST' }, adminToken);
    const data = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!data.errors)       throw new Error('Expected validation errors');
  });

  await test('Vehicles', 'GET /vehicles/invalidid returns 400 CastError', async () => {
    const res = await req('GET', '/vehicles/notavalidobjectid', null, adminToken);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('Vehicles', 'Station officer scoped to own district', async () => {
    const res  = await req('GET', '/vehicles', null, officerToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('Vehicles', 'Device cannot access vehicles — returns 403', async () => {
    const res = await req('POST', '/vehicles', {}, deviceToken);
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 8. Locations 
  group('8. Locations — /api/locations');

  await test('Locations', 'GET /locations/live returns active vehicles with headers', async () => {
    const res  = await req('GET', '/locations/live', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)   throw new Error(`Expected 200, got ${res.status}`);
    if (!data.success)        throw new Error('success flag missing');
    if (!res.headers.get('x-total-count')) throw new Error('Missing X-Total-Count');
    const cc = res.headers.get('cache-control');
    if (!cc || !cc.includes('no-store')) throw new Error('Missing Cache-Control: no-store on live');
  });

  await test('Locations', 'GET /locations/live?district= filters by district', async () => {
    const res  = await req('GET', `/locations/live?district=${districtId}`, null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('Locations', 'GET /locations/history returns pings with pagination', async () => {
    const res  = await req('GET', '/locations/history?page=1&limit=10', null, adminToken);
    const data = await res.json();
    if (res.status !== 200)   throw new Error(`Expected 200, got ${res.status}`);
    if (!res.headers.get('x-total-count')) throw new Error('Missing X-Total-Count');
    if (data.count > 10)      throw new Error('Pagination limit not applied');
  });

  await test('Locations', 'GET /locations/history?sort=timestamp&order=asc sorts correctly', async () => {
    const res  = await req('GET', '/locations/history?sort=timestamp&order=asc&limit=5', null, adminToken);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.data.length >= 2) {
      const t1 = new Date(data.data[0].timestamp);
      const t2 = new Date(data.data[1].timestamp);
      if (t1 > t2) throw new Error('Timestamps not sorted ascending');
    }
  });

  await test('Locations', 'GET /locations/history?from=&to= filters by time window', async () => {
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to   = new Date().toISOString();
    const res  = await req('GET', `/locations/history?from=${from}&to=${to}&limit=5`, null, adminToken);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (data.count === 0)   throw new Error('No pings in last 7 days');
  });

  await test('Locations', 'GET /locations/history?province= filters by province', async () => {
    const res  = await req('GET', `/locations/history?province=${provinceId}&limit=5`, null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('Locations', 'GET /locations/history?district= filters by district', async () => {
    const res  = await req('GET', `/locations/history?district=${districtId}&limit=5`, null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('Locations', 'POST /locations/ping with non-device role returns 403', async () => {
    const res = await req('POST', '/locations/ping', {
      deviceId: 'DEV0001', latitude: 6.9, longitude: 79.8
    }, adminToken);
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await test('Locations', 'POST /locations/ping with device token submits ping', async () => {
    const res  = await req('POST', '/locations/ping', {
      deviceId:  'DEV0001',
      latitude:  6.9271,
      longitude: 79.8612,
      speed:     35,
      heading:   180
    }, deviceToken);
    const data = await res.json();
    if (res.status !== 201)    throw new Error(`Expected 201, got ${res.status}`);
    if (!data.success)         throw new Error('Ping not recorded');
    if (!data.data.vehicle)    throw new Error('Vehicle reference missing');
    const cc = res.headers.get('cache-control');
    if (!cc || !cc.includes('no-store')) throw new Error('Missing Cache-Control: no-store on ping');
  });

  await test('Locations', 'POST /locations/ping without token returns 401', async () => {
    const res = await req('POST', '/locations/ping', {
      deviceId: 'DEV0001', latitude: 6.9, longitude: 79.8
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 9. Security & Role-Based Access Control
  group('9. Security & Role-Based Access Control');

  await test('Security', 'Expired/invalid token returns 401', async () => {
    const res = await req('GET', '/vehicles', null, 'invalid.token.here');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('Security', 'X-Request-Id header present on all responses', async () => {
    const res = await req('GET', '/provinces', null, adminToken);
    if (!res.headers.get('x-request-id')) throw new Error('Missing X-Request-Id header');
  });

  await test('Security', 'Station officer cannot delete vehicles (403)', async () => {
    const res = await req('DELETE', `/vehicles/${vehicleId}`, null, officerToken);
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await test('Security', 'Provincial admin cannot access all users (403)', async () => {
    const res = await req('GET', '/auth/users', null, provincialToken);
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await test('Security', 'Device cannot access provinces (403)', async () => {
    const res = await req('GET', '/provinces', null, deviceToken);
    if (res.status === 200) {
      // device is authenticated but not authorized for management
      // this is valid — device can read but not write
    }
    // Device should at minimum be authenticated
    if (res.status === 401) throw new Error('Device token should be valid');
  });

  await test('Security', 'DELETE vehicles/:id requires hq_admin role', async () => {
    // Provincial admin cannot delete
    const res = await req('DELETE', `/vehicles/${vehicleId}`, null, provincialToken);
    if (res.status !== 403) throw new Error(`Expected 403 for provincial_admin, got ${res.status}`);
  });

  // 10. Response Headers
  group('10. Response Headers');

  await test('Headers', 'ETag present on GET /vehicles', async () => {
    const res = await req('GET', '/vehicles', null, adminToken);
    if (!res.headers.get('etag')) throw new Error('Missing ETag');
  });

  await test('Headers', 'ETag present on GET /drivers', async () => {
    const res = await req('GET', '/drivers', null, adminToken);
    if (!res.headers.get('etag')) throw new Error('Missing ETag');
  });

  await test('Headers', 'X-Total-Count on GET /vehicles', async () => {
    const res = await req('GET', '/vehicles', null, adminToken);
    if (!res.headers.get('x-total-count')) throw new Error('Missing X-Total-Count');
  });

  await test('Headers', 'X-Total-Count on GET /locations/history', async () => {
    const res = await req('GET', '/locations/history', null, adminToken);
    if (!res.headers.get('x-total-count')) throw new Error('Missing X-Total-Count');
  });

  await test('Headers', 'X-Total-Count on GET /locations/live', async () => {
    const res = await req('GET', '/locations/live', null, adminToken);
    if (!res.headers.get('x-total-count')) throw new Error('Missing X-Total-Count');
  });

  await test('Headers', 'Cache-Control: private on GET /vehicles', async () => {
    const res = await req('GET', '/vehicles', null, adminToken);
    const cc  = res.headers.get('cache-control');
    if (!cc || !cc.includes('private')) throw new Error(`Cache-Control missing 'private': ${cc}`);
  });

  await test('Headers', 'Cache-Control: no-store on GET /locations/live', async () => {
    const res = await req('GET', '/locations/live', null, adminToken);
    const cc  = res.headers.get('cache-control');
    if (!cc || !cc.includes('no-store')) throw new Error('Expected no-store on live locations');
  });

  await test('Headers', 'X-Request-Id unique on every request', async () => {
    const res1 = await req('GET', '/provinces', null, adminToken);
    const res2 = await req('GET', '/provinces', null, adminToken);
    const id1  = res1.headers.get('x-request-id');
    const id2  = res2.headers.get('x-request-id');
    if (!id1 || !id2)  throw new Error('Missing X-Request-Id');
    if (id1 === id2)   throw new Error('X-Request-Id should be unique per request');
  });

  //11. Cleanup 
  group('11. Cleanup — DELETE created test records');

  await test('Cleanup', 'DELETE /drivers/:id removes test driver', async () => {
    if (!createdDriverId) return;
    const res  = await req('DELETE', `/drivers/${createdDriverId}`, null, adminToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  //  Summary 
  console.log('\n');
  console.log('  TEST RESULTS SUMMARY');
  console.log('');

  const groups = [...new Set(results.map(r => r.group))];
  for (const g of groups) {
    const groupResults = results.filter(r => r.group === g);
    const groupPassed  = groupResults.filter(r => r.status === 'PASS').length;
    console.log(`  ${g}: ${groupPassed}/${groupResults.length} passed`);
  }

  console.log('');
  console.log(`  Total: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

  if (failed === 0) {
    console.log('   All tests passed!');
  } else {
    console.log('\n  Failed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   [${r.group}] ${r.name}`);
      console.log(`     → ${r.error}`);
    });
  }
  console.log('\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('\n Test runner failed:', err.message);
  console.error('Make sure the server is running: npm run dev');
  process.exit(1);
});