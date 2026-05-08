# Air Pollution Awareness Dashboard

This is a simplified dashboard project built with HTML, CSS, and JavaScript.

## Step-by-step workflow

1. Request live air-quality pollutant data from the Open-Meteo Air Quality API for each tracked city.
2. Request current weather support data from the Open-Meteo Forecast API.
3. Convert pollutant concentrations into Indian AQI values using CPCB AQI breakpoints.
4. Fall back to the local sample CSV in `data/aqi_data.csv` if live requests fail.
5. Show the results using summary cards, trend charts, the AQI scale, and the pollutant table.
6. Add AQI health descriptions so users understand the meaning of each level.

Current setup note:

- The main city snapshot is designed to use official real-time AQI through the Cloudflare Worker proxy.
- Weather uses the Open-Meteo forecast API.
- Trend and forecast panels can use fallback sample data until official historical endpoints are connected.

## Project files

- `index.html` builds the page structure.
- `styles.css` controls the visual design and responsive layout.
- `script.js` loads live pollutant data, computes Indian AQI values, and renders the dashboard.
- `data/aqi_data.csv` contains sample fallback data used when live API requests are unavailable.

## Run locally

Use a simple local server so the browser can read the CSV file.

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Publish on GitHub Pages

1. Create an empty GitHub repository.
2. Push this project to the `main` branch of that repository.
3. In GitHub, open `Settings -> Pages`.
4. Set the source to `GitHub Actions`.
5. After the workflow finishes, the site will be available on your GitHub Pages URL.

## Safe official real-time setup

The official Indian real-time AQI feed on `data.gov.in` requires an API key, so it should not be called directly from a public GitHub Pages frontend.

This repo now includes a safe proxy scaffold in `worker/`.

Recommended flow:

1. Create a free `data.gov.in` account and generate your API key.
2. Use the Cloudflare Worker in `worker/` as the private backend/proxy.
3. Store the key as a Worker secret using `DATA_GOV_API_KEY`.
4. Deploy the Worker.
5. Update the frontend to call the Worker URL instead of the approximate Open-Meteo AQI source.

See `worker/README.md` for the deployment steps.
