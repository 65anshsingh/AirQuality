# Air Pollution Awareness Dashboard

This is a simplified dashboard project built with HTML, CSS, and JavaScript.

## Step-by-step workflow

1. Request live air-quality data from the Open-Meteo Air Quality API for each tracked city.
2. Request current weather support data from the Open-Meteo Forecast API.
3. Convert the API responses into AQI trends, pollutant cards, forecast values, and comparison summaries.
4. Fall back to the local sample CSV in `data/aqi_data.csv` if live requests fail.
5. Show the results using summary cards, trend charts, the AQI scale, and the pollutant table.
6. Add AQI health descriptions so users understand the meaning of each level.

## Project files

- `index.html` builds the page structure.
- `styles.css` controls the visual design and responsive layout.
- `script.js` loads live AQI data, processes it, and renders the dashboard.
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
