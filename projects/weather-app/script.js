/* =========================================================
   SKYCAST WEATHER APP
   API-BASED JAVASCRIPT
   ========================================================= */


/* =========================================================
   API URLS
   ========================================================= */

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const WIKIPEDIA_API =
    "https://en.wikipedia.org/w/api.php";


/* =========================================================
   DEFAULT CITY
   ========================================================= */

let currentLocation = {
    name: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.0060
};


/* =========================================================
   POPULAR CITIES
   ========================================================= */

const popularCities = [
    {
        name: "London",
        country: "United Kingdom",
        latitude: 51.5074,
        longitude: -0.1278
    },

    {
        name: "Tokyo",
        country: "Japan",
        latitude: 35.6762,
        longitude: 139.6503
    },

    {
        name: "Paris",
        country: "France",
        latitude: 48.8566,
        longitude: 2.3522
    },

    {
        name: "Dubai",
        country: "United Arab Emirates",
        latitude: 25.2048,
        longitude: 55.2708
    }
];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const searchInput =
    document.getElementById("searchInput");

const selectedLocation =
    document.getElementById("selectedLocation");

const cityName =
    document.getElementById("cityName");

const countryName =
    document.getElementById("countryName");

const temperature =
    document.getElementById("temperature");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const visibility =
    document.getElementById("visibility");

const weatherCondition =
    document.getElementById("weatherCondition");

const weatherIcon =
    document.getElementById("weatherIcon");

const weatherBackground =
    document.getElementById("weatherBackground");

const currentDate =
    document.getElementById("currentDate");

const currentTime =
    document.getElementById("currentTime");

const forecastContainer =
    document.getElementById("forecastContainer");

const popularCitiesContainer =
    document.getElementById("popularCities");

const loadingScreen =
    document.getElementById("loadingScreen");

const mapLocationLabel =
    document.getElementById("mapLocationLabel");


/* =========================================================
   CONDITION ELEMENTS
   ========================================================= */

const conditionTemp =
    document.getElementById("conditionTemp");

const conditionFeels =
    document.getElementById("conditionFeels");

const conditionHumidity =
    document.getElementById("conditionHumidity");

const conditionWind =
    document.getElementById("conditionWind");

const pressure =
    document.getElementById("pressure");


/* =========================================================
   HIGHLIGHT ELEMENTS
   ========================================================= */

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const uvIndex =
    document.getElementById("uvIndex");

const airQuality =
    document.getElementById("airQuality");


/* =========================================================
   MAP
   ========================================================= */

let weatherMap = null;

let mapMarker = null;


/* =========================================================
   WEATHER CODE DESCRIPTION
   WMO WEATHER CODES
   ========================================================= */

function getWeatherInfo(code) {

    const weather = {

        0: {
            text: "Clear Sky",
            icon: "fa-sun"
        },

        1: {
            text: "Mainly Clear",
            icon: "fa-sun"
        },

        2: {
            text: "Partly Cloudy",
            icon: "fa-cloud-sun"
        },

        3: {
            text: "Overcast",
            icon: "fa-cloud"
        },

        45: {
            text: "Foggy",
            icon: "fa-smog"
        },

        48: {
            text: "Foggy",
            icon: "fa-smog"
        },

        51: {
            text: "Light Drizzle",
            icon: "fa-cloud-rain"
        },

        53: {
            text: "Drizzle",
            icon: "fa-cloud-rain"
        },

        55: {
            text: "Heavy Drizzle",
            icon: "fa-cloud-rain"
        },

        61: {
            text: "Light Rain",
            icon: "fa-cloud-rain"
        },

        63: {
            text: "Rain",
            icon: "fa-cloud-showers-heavy"
        },

        65: {
            text: "Heavy Rain",
            icon: "fa-cloud-showers-heavy"
        },

        71: {
            text: "Light Snow",
            icon: "fa-snowflake"
        },

        73: {
            text: "Snow",
            icon: "fa-snowflake"
        },

        75: {
            text: "Heavy Snow",
            icon: "fa-snowflake"
        },

        80: {
            text: "Rain Showers",
            icon: "fa-cloud-showers-heavy"
        },

        81: {
            text: "Rain Showers",
            icon: "fa-cloud-showers-heavy"
        },

        82: {
            text: "Heavy Rain Showers",
            icon: "fa-cloud-showers-heavy"
        },

        95: {
            text: "Thunderstorm",
            icon: "fa-cloud-bolt"
        },

        96: {
            text: "Thunderstorm",
            icon: "fa-cloud-bolt"
        },

        99: {
            text: "Heavy Thunderstorm",
            icon: "fa-cloud-bolt"
        }

    };

    return weather[code] || {
        text: "Unknown",
        icon: "fa-cloud"
    };
}


/* =========================================================
   SEARCH CITY
   ========================================================= */

async function searchCity(city) {

    if (!city.trim()) {
        return;
    }

    try {

        showLoading();

        const url =
            `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to search city");
        }

        const data =
            await response.json();

        if (!data.results || data.results.length === 0) {

            alert("City not found. Please try another city.");

            hideLoading();

            return;
        }

        const location =
            data.results[0];

        currentLocation = {
            name: location.name,

            country:
                location.country || "",

            latitude:
                location.latitude,

            longitude:
                location.longitude
        };

        await loadWeather();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load this city. Please check your internet connection."
        );

        hideLoading();
    }
}


/* =========================================================
   LOAD WEATHER
   ========================================================= */

async function loadWeather() {

    try {

        showLoading();

        const params = new URLSearchParams({

            latitude:
                currentLocation.latitude,

            longitude:
                currentLocation.longitude,

            current:
                [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "apparent_temperature",
                    "weather_code",
                    "surface_pressure",
                    "wind_speed_10m",
                    "visibility"
                ].join(","),

            hourly:
                [
                    "temperature_2m"
                ].join(","),

            daily:
                [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "sunrise",
                    "sunset",
                    "uv_index_max"
                ].join(","),

            timezone:
                "auto",

            forecast_days:
                "7",

            temperature_unit:
                "celsius",

            wind_speed_unit:
                "kmh"
        });

        const response =
            await fetch(
                `${WEATHER_API}?${params.toString()}`
            );

        if (!response.ok) {
            throw new Error("Weather API failed");
        }

        const data =
            await response.json();

        updateCurrentWeather(data);

        updateForecast(data);

        updateHighlights(data);

        updateMap();

        await updateCityImage();

        hideLoading();

    } catch (error) {

        console.error(error);

        alert(
            "Weather data could not be loaded."
        );

        hideLoading();
    }
}


/* =========================================================
   UPDATE CURRENT WEATHER
   ========================================================= */

function updateCurrentWeather(data) {

    const current =
        data.current;


    /* CITY */

    cityName.textContent =
        currentLocation.name;

    countryName.textContent =
        currentLocation.country;

    selectedLocation.textContent =
        `${currentLocation.name}, ${currentLocation.country}`;


    /* TEMPERATURE */

    temperature.textContent =
        Math.round(
            current.temperature_2m
        );


    feelsLike.textContent =
        `${Math.round(
            current.apparent_temperature
        )}°C`;


    /* WEATHER CONDITION */

    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );

    weatherCondition.textContent =
        weatherInfo.text;


    weatherIcon.innerHTML =
        `<i class="fa-solid ${weatherInfo.icon}"></i>`;


    /* HUMIDITY */

    humidity.textContent =
        `${Math.round(
            current.relative_humidity_2m
        )}%`;


    /* WIND */

    windSpeed.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    /* VISIBILITY */

    const visibilityKm =
        current.visibility != null
            ? current.visibility / 1000
            : 10;

    visibility.textContent =
        `${Math.round(visibilityKm)} km`;


    /* CONDITIONS */

    conditionTemp.textContent =
        `${Math.round(
            current.temperature_2m
        )}°C`;

    conditionFeels.textContent =
        `${Math.round(
            current.apparent_temperature
        )}°C`;

    conditionHumidity.textContent =
        `${Math.round(
            current.relative_humidity_2m
        )}%`;

    conditionWind.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;

    pressure.textContent =
        `${Math.round(
            current.surface_pressure
        )} hPa`;


    /* DATE / TIME */

    updateDateTime();
}


/* =========================================================
   DATE AND TIME
   ========================================================= */

function updateDateTime() {

    const now =
        new Date();

    currentDate.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    currentTime.textContent =
        now.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


/* =========================================================
   7 DAY FORECAST
   ========================================================= */

function updateForecast(data) {

    forecastContainer.innerHTML = "";

    const daily =
        data.daily;


    daily.time.forEach(
        (date, index) => {

            const weatherInfo =
                getWeatherInfo(
                    daily.weather_code[index]
                );


            const dateObject =
                new Date(date);


            const day =
                index === 0
                    ? "Today"
                    : dateObject.toLocaleDateString(
                        "en-US",
                        {
                            weekday: "short"
                        }
                    );


            const maxTemp =
                Math.round(
                    daily.temperature_2m_max[index]
                );


            const minTemp =
                Math.round(
                    daily.temperature_2m_min[index]
                );


            const card =
                document.createElement("div");

            card.className =
                "forecast-card";


            if (index === 0) {
                card.classList.add("active");
            }


            card.innerHTML = `

                <span class="forecast-day">
                    ${day}
                </span>

                <span class="forecast-temp">
                    ${maxTemp}° / ${minTemp}°
                </span>

                <i class="fa-solid ${weatherInfo.icon} forecast-icon"></i>

            `;


            forecastContainer.appendChild(card);

        }
    );
}


/* =========================================================
   HIGHLIGHTS
   ========================================================= */

function updateHighlights(data) {

    const daily =
        data.daily;


    /* SUNRISE */

    sunrise.textContent =
        formatTime(
            daily.sunrise[0]
        );


    /* SUNSET */

    sunset.textContent =
        formatTime(
            daily.sunset[0]
        );


    /* UV INDEX */

    const uv =
        daily.uv_index_max[0];

    let uvText =
        "Low";


    if (uv >= 8) {

        uvText =
            "Very High";

    } else if (uv >= 6) {

        uvText =
            "High";

    } else if (uv >= 3) {

        uvText =
            "Moderate";

    }


    uvIndex.textContent =
        `${Math.round(uv)} (${uvText})`;


    /*
       Air quality is shown as a simple
       visual indicator here because the
       weather API does not directly provide
       AQI in this request.
    */

    airQuality.textContent =
        "Good";
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(dateString) {

    if (!dateString) {
        return "--";
    }

    const date =
        new Date(dateString);


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   GET CITY IMAGE
   ========================================================= */

async function getCityImage(city) {

    try {

        const params =
            new URLSearchParams({

                action: "query",

                generator: "search",

                gsrsearch:
                    `${city} city`,

                gsrnamespace: "6",

                gsrlimit: "5",

                prop: "imageinfo",

                iiprop: "url",

                iiurlwidth: "1200",

                format: "json",

                origin: "*"
            });


        const response =
            await fetch(
                `${WIKIPEDIA_API}?${params.toString()}`
            );


        if (!response.ok) {
            throw new Error("Image API error");
        }


        const data =
            await response.json();


        const pages =
            data.query?.pages;


        if (!pages) {
            return null;
        }


        const page =
            Object.values(pages)[0];


        return (
            page.imageinfo?.[0]?.thumburl ||
            page.imageinfo?.[0]?.url ||
            null
        );

    } catch (error) {

        console.warn(
            "Could not load city image:",
            error
        );

        return null;
    }
}


/* =========================================================
   UPDATE CITY IMAGE
   ========================================================= */

async function updateCityImage() {

    const image =
        await getCityImage(
            currentLocation.name
        );


    if (image) {

        weatherBackground.style.backgroundImage =
            `url("${image}")`;

    } else {

        /*
           Fallback image
        */

        weatherBackground.style.backgroundImage =
            `url(
                "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=85"
            )`;
    }
}


/* =========================================================
   INITIALIZE MAP
   ========================================================= */

function initializeMap() {

    weatherMap =
        L.map(
            "weatherMap",
            {
                zoomControl: true
            }
        ).setView(
            [
                currentLocation.latitude,
                currentLocation.longitude
            ],
            10
        );


    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
            attribution:
                '&copy; OpenStreetMap &copy; CARTO',

            maxZoom: 19
        }
    ).addTo(
        weatherMap
    );


    mapMarker =
        L.marker(
            [
                currentLocation.latitude,
                currentLocation.longitude
            ]
        ).addTo(
            weatherMap
        );


    mapMarker.bindPopup(
        `<strong>
            ${currentLocation.name}
        </strong>`
    );
}


/* =========================================================
   UPDATE MAP
   ========================================================= */

function updateMap() {

    if (!weatherMap) {
        return;
    }


    const coordinates = [
        currentLocation.latitude,
        currentLocation.longitude
    ];


    weatherMap.setView(
        coordinates,
        10,
        {
            animate: true
        }
    );


    if (mapMarker) {

        weatherMap.removeLayer(
            mapMarker
        );
    }


    mapMarker =
        L.marker(
            coordinates
        ).addTo(
            weatherMap
        );


    mapMarker.bindPopup(
        `<strong>
            ${currentLocation.name}
        </strong>`
    );


    mapLocationLabel.innerHTML = `

        <i class="fa-solid fa-location-dot"></i>

        ${currentLocation.name}

    `;
}


/* =========================================================
   LOAD POPULAR CITY WEATHER
   ========================================================= */

async function loadPopularCities() {

    popularCitiesContainer.innerHTML =
        `<div class="api-loading">
            Loading cities...
        </div>`;


    const results = [];


    for (const city of popularCities) {

        try {

            const params =
                new URLSearchParams({

                    latitude:
                        city.latitude,

                    longitude:
                        city.longitude,

                    current:
                        "temperature_2m,weather_code",

                    temperature_unit:
                        "celsius",

                    timezone:
                        "auto"
                });


            const response =
                await fetch(
                    `${WEATHER_API}?${params.toString()}`
                );


            const data =
                await response.json();


            results.push({

                ...city,

                temperature:
                    Math.round(
                        data.current.temperature_2m
                    ),

                weatherCode:
                    data.current.weather_code

            });

        } catch (error) {

            console.warn(
                `Unable to load ${city.name}`
            );

        }
    }


    renderPopularCities(
        results
    );
}


/* =========================================================
   RENDER POPULAR CITIES
   ========================================================= */

// async function renderPopularCities(
//     cities
// ) {

//     popularCitiesContainer.innerHTML = "";


//     for (const city of cities) {

//         const weatherInfo =
//             getWeatherInfo(
//                 city.weatherCode
//             );


//         const cityElement =
//             document.createElement("div");


//         cityElement.className =
//             "popular-city";


//         cityElement.innerHTML = `

//             <img
//                 src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80"
//                 alt="${city.name}"
//                 loading="lazy"
//             >

//             <div class="popular-city-info">

//                 <h3>
//                     ${city.name}
//                 </h3>

//                 <p>
//                     ${city.temperature}°C
//                 </p>

//             </div>

//             <div class="popular-city-weather">

//                 <i class="fa-solid ${weatherInfo.icon}"></i>

//             </div>
//         `;


//         cityElement.addEventListener(
//             "click",
//             () => {

//                 currentLocation = {

//                     name:
//                         city.name,

//                     country:
//                         city.country,

//                     latitude:
//                         city.latitude,

//                     longitude:
//                         city.longitude
//                 };


//                 loadWeather();
//             }
//         );


//         popularCitiesContainer.appendChild(
//             cityElement
//         );
//     }
// }
async function renderPopularCities(cities) {

    popularCitiesContainer.innerHTML = "";

    for (const city of cities) {

        const weatherInfo =
            getWeatherInfo(city.weatherCode);

        const image =
            await getCityImage(city.name);

        const cityElement =
            document.createElement("div");

        cityElement.className =
            "popular-city";

        cityElement.innerHTML = `

            <img
                src="${image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80'}"
                alt="${city.name}"
                loading="lazy"
            >

            <div class="popular-city-info">

                <h3>
                    ${city.name}
                </h3>

                <p>
                    ${city.temperature}°C
                </p>

            </div>

            <div class="popular-city-weather">

                <i class="fa-solid ${weatherInfo.icon}"></i>

            </div>
        `;

        cityElement.addEventListener(
            "click",
            () => {

                currentLocation = {

                    name: city.name,

                    country: city.country,

                    latitude: city.latitude,

                    longitude: city.longitude
                };

                loadWeather();
            }
        );

        popularCitiesContainer.appendChild(
            cityElement
        );
    }
}


/* =========================================================
   SEARCH EVENT
   ========================================================= */

searchInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            searchCity(
                searchInput.value
            );

            searchInput.value = "";
        }
    }
);


/* =========================================================
   SEARCH NAV BUTTON
   ========================================================= */

document
    .getElementById("searchNav")
    .addEventListener(
        "click",
        () => {

            searchInput.focus();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


/* =========================================================
   MAP NAV BUTTON
   ========================================================= */

document
    .getElementById("mapNav")
    .addEventListener(
        "click",
        () => {

            const mapElement =
                document.getElementById(
                    "weatherMap"
                );


            mapElement.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );


/* =========================================================
   NAV BUTTONS
   ========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".nav-item"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );

            }
        );

    });


/* =========================================================
   LOADING FUNCTIONS
   ========================================================= */

function showLoading() {

    loadingScreen.classList.remove(
        "hidden"
    );
}


function hideLoading() {

    loadingScreen.classList.add(
        "hidden"
    );
}


/* =========================================================
   INITIAL APP LOAD
   ========================================================= */

async function initializeApp() {

    try {

        initializeMap();

        await loadWeather();

        await loadPopularCities();

    } catch (error) {

        console.error(
            "App initialization failed:",
            error
        );

        hideLoading();
    }
}


/* =========================================================
   START APPLICATION
   ========================================================= */

initializeApp();


/* =========================================================
   UPDATE CLOCK EVERY MINUTE
   ========================================================= */

setInterval(
    updateDateTime,
    60000
);