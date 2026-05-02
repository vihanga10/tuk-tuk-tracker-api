# tuk-tuk-tracker-api
Sri Lanka Police Tuk-Tuk Tracking API

Student ID : COBSCCOMP242P-039

Student Name : U D V Madushamini

Live Deployed API:

https://tuk-tuk-tracker-api-production.up.railway.app

Swagger API Documentation:

https://tuk-tuk-tracker-api-production.up.railway.app/api/docs/

Live Deployed API health:

https://tuk-tuk-tracker-api-production.up.railway.app/health

Role-Based Access Control:

hq_admin — Police Headquarters Administrator:

1. Full access to all endpoints

2. Register, update, and delete vehicles and drivers

3. Register, update, and delete provinces, districts, and police stations

4. Create and manage all user accounts (register, activate/deactivate, change roles)

5. View all users across the system

6. View live locations and full location history for all vehicles nationwide

provincial_admin — Provincial Office Administrator:

1. Register and update vehicles and drivers

2. Create and update police stations

3. View all vehicles, drivers, stations, provinces, and districts

4. View live locations and location history for all vehicles

5. Cannot delete any records

6. Cannot manage user accounts or modify provinces/districts

station_officer — Police Station Officer:

1. View vehicles (scoped to own district only)

2. View live locations (scoped to own district only)

3. View location history (scoped to own district only)

4. View drivers, provinces, districts, and stations (read only)

5. Cannot create, update, or delete any records

6. Cannot access users or submit location pings

device — GPS Tracking Device (Tuk-Tuk)

1. Submit GPS location pings only (POST /api/locations/ping)

2. No access to any other endpoint

   
