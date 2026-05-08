# AirWatch Official AQI Proxy

This Cloudflare Worker is the safe backend/proxy for the AirWatch dashboard.

It keeps the `data.gov.in` API key out of the public frontend and exposes a small browser-safe endpoint for the dashboard.

## Endpoints

- `GET /health`
- `GET /cities`
- `GET /aqi?city=Delhi`

## Before deployment

1. Create a free account on `data.gov.in`
2. Generate an API key for the real-time AQI dataset
3. Install Wrangler in this folder:

```powershell
cd worker
npm install -D wrangler
```

4. Log in to Cloudflare:

```powershell
npx wrangler login
```

5. Add the API key as a Worker secret:

```powershell
npx wrangler secret put DATA_GOV_API_KEY
```

6. Start local development if you want:

```powershell
npx wrangler dev
```

7. Deploy the Worker:

```powershell
npx wrangler deploy
```

After deployment, you will get a `workers.dev` URL such as:

```text
https://airwatch-aqi-proxy.<your-subdomain>.workers.dev
```

## Expected response shape

`GET /aqi?city=Delhi`

Returns:

- `source`
- `datasetId`
- `city`
- `state`
- `fetchedAt`
- `recordCount`
- `summary.lastUpdateIso`
- `summary.stations`
- `summary.pollutants`
- `latestRecords`
- `records`

The Worker currently supports:

- Delhi
- Mumbai
- Kolkata
- Bangalore
- Jalandhar
- Chennai

## Next frontend step

Once the Worker is live, update the frontend to call the Worker instead of Open-Meteo.

That switch is intentionally not forced yet, so the repo can be prepared safely before the API key exists.
