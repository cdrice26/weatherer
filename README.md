# The Weatherer
This is a webpage that allows the user to request historical weather information and see it graphed, along with a regression line (or curve). You can view multiple metrics or even compare locations if you like.

# Disclaimer
This app is in development. Bugs and inaccuracies may occur. Please use with caution, and note that the software is provided as-is and without assumption of correctness.

# Installation and Usage
This is just a standard Vite project. Install dependencies with `npm install` and run with `npm run dev`. This uses the separate [Weatherer API](https://github.com/cdrice26/weatherer-api) as the backend, so that will need to be set up as well. Then create a `.env.local` file in the root of the erpo and define `VITE_API_URL` as the URL of your copy of that API.

# Data Sources
The data is provided by [Open-Meteo](https://open-meteo.com) and the [Copernicus Climate Change Service](https://climate.copernicus.eu/). 

Zippenfenig, P. (2023). Open-Meteo.com Weather API [Computer software]. Zenodo. https://doi.org/10.5281/ZENODO.7970649

Hersbach, H., Bell, B., Berrisford, P., Biavati, G., Horányi, A., Muñoz Sabater, J., Nicolas, J., Peubey, C., Radu, R., Rozum, I., Schepers, D., Simmons, A., Soci, C., Dee, D., Thépaut, J-N. (2023). ERA5 hourly data on single levels from 1940 to present [Data set]. ECMWF. https://doi.org/10.24381/cds.adbb2d47

Muñoz Sabater, J. (2019). ERA5-Land hourly data from 2001 to present [Data set]. ECMWF. https://doi.org/10.24381/CDS.E2161BAC

Schimanke S., Ridal M., Le Moigne P., Berggren L., Undén P., Randriamampianina R., Andrea U., Bazile E., Bertelsen A., Brousseau P., Dahlgren P., Edvinsson L., El Said A., Glinton M., Hopsch S., Isaksson L., Mladek R., Olsson E., Verrelle A., Wang Z.Q. (2021). CERRA sub-daily regional reanalysis data for Europe on single levels from 1984 to present [Data set]. ECMWF. https://doi.org/10.24381/CDS.622A565A

Generated using Copernicus Climate Change Service information 2022.