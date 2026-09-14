/* =====================================================
   TRAVEL EXPLORER - API BASED JAVASCRIPT
   ===================================================== */

/* ================= API URLs ================= */

const APIS = {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",

    weather: "https://api.open-meteo.com/v1/forecast",

    countries: "https://restcountries.com/v3.1/name",

    wikimedia:
        "https://commons.wikimedia.org/w/api.php",

    wikipedia:
        "https://en.wikipedia.org/w/api.php",

    overpass:
        "https://overpass-api.de/api/interpreter"
};


/* ================= DOM ELEMENTS ================= */

const searchInput =
    document.getElementById("searchInput");

const destinationGrid =
    document.getElementById("destinationGrid");

const placesContainer =
    document.getElementById("placesContainer");

const foodContainer =
    document.getElementById("foodContainer");

const staysContainer =
    document.getElementById("staysContainer");

const temperature =
    document.getElementById("temperature");

const weatherStatus =
    document.getElementById("weatherStatus");

const weatherLocation =
    document.getElementById("weatherLocation");

const population =
    document.getElementById("population");

const language =
    document.getElementById("language");

const localTime =
    document.getElementById("localTime");

const heroLocation =
    document.getElementById("heroLocation");

const loadingScreen =
    document.getElementById("loadingScreen");

const exploreButton =
    document.getElementById("exploreButton");

const createTrip =
    document.getElementById("createTrip");

const viewMapButton =
    document.getElementById("viewMapButton");

const mapNav =
    document.getElementById("mapNav");


/* =====================================================
   POPULAR DESTINATIONS
   These are SEARCH QUERIES, not hardcoded
   destination information.
   ===================================================== */

const popularCities = [
    "Tokyo",
    "Paris",
    "Dubai",
    "Bali"
];


/* =====================================================
   MAP
   ===================================================== */

let map;

let mapMarker;

function initializeMap() {

    map = L.map("map", {
        zoomControl: true
    }).setView(
        [35.6762, 139.6503],
        11
    );

    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
            attribution:
                '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 19
        }
    ).addTo(map);

    mapMarker = L.marker(
        [35.6762, 139.6503]
    ).addTo(map);
}


/* =====================================================
   LOADING
   ===================================================== */

function showLoading() {

    loadingScreen.classList.remove("hidden");

}

function hideLoading() {

    setTimeout(() => {
        loadingScreen.classList.add("hidden");
    }, 300);

}


/* =====================================================
   OPEN-METEO GEOCODING
   ===================================================== */

async function getCoordinates(city) {

    const url =
        `${APIS.geocoding}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response =
        await fetch(url);

    if (!response.ok) {
        throw new Error("Location search failed");
    }

    const data =
        await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
    }

    return data.results[0];
}


/* =====================================================
   WEATHER API
   ===================================================== */

async function getWeather(latitude, longitude) {

    const url =
        `${APIS.weather}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,weather_code` +
        `&timezone=auto`;

    const response =
        await fetch(url);

    if (!response.ok) {
        throw new Error("Weather unavailable");
    }

    return await response.json();
}


/* =====================================================
   REST COUNTRIES API
   ===================================================== */

async function getCountryInfo(country) {

    const url =
        `${APIS.countries}/${encodeURIComponent(country)}` +
        "?fields=name,population,languages,flags";

    const response =
        await fetch(url);

    if (!response.ok) {
        return null;
    }

    const data =
        await response.json();

    return data[0] || null;
}


/* =====================================================
   WIKIMEDIA IMAGE API
   ===================================================== */

async function getWikiImage(searchTerm) {

    const url =
        `${APIS.wikimedia}` +
        `?action=query` +
        `&generator=search` +
        `&gsrsearch=${encodeURIComponent(searchTerm)}` +
        `&gsrnamespace=6` +
        `&gsrlimit=1` +
        `&prop=imageinfo` +
        `&iiprop=url` +
        `&iiurlwidth=800` +
        `&format=json` +
        `&origin=*`;

    try {

        const response =
            await fetch(url);

        const data =
            await response.json();

        const pages =
            data.query?.pages;

        if (!pages) {
            return null;
        }

        const firstPage =
            Object.values(pages)[0];

        return (
            firstPage.imageinfo?.[0]?.thumburl ||
            firstPage.imageinfo?.[0]?.url ||
            null
        );

    } catch (error) {

        console.error(
            "Image API error:",
            error
        );

        return null;
    }
}


/* =====================================================
   WIKIPEDIA SEARCH
   ===================================================== */

async function searchWikipedia(query) {

    const url =
        `${APIS.wikipedia}` +
        `?action=query` +
        `&list=search` +
        `&srsearch=${encodeURIComponent(query)}` +
        `&srlimit=5` +
        `&format=json` +
        `&origin=*`;

    try {

        const response =
            await fetch(url);

        const data =
            await response.json();

        return data.query?.search || [];

    } catch (error) {

        console.error(error);

        return [];
    }
}


/* =====================================================
   WEATHER DESCRIPTION
   ===================================================== */

function weatherDescription(code) {

    const weatherCodes = {

        0: "Clear Sky",

        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",

        45: "Foggy",
        48: "Foggy",

        51: "Light Drizzle",
        53: "Drizzle",
        55: "Heavy Drizzle",

        61: "Light Rain",
        63: "Rain",
        65: "Heavy Rain",

        71: "Light Snow",
        73: "Snow",
        75: "Heavy Snow",

        80: "Rain Showers",
        81: "Rain Showers",
        82: "Heavy Rain Showers",

        95: "Thunderstorm",
        96: "Thunderstorm",
        99: "Thunderstorm"
    };

    return weatherCodes[code] ||
        "Current Conditions";
}


/* =====================================================
   WEATHER ICON
   ===================================================== */

function weatherIcon(code) {

    if (code === 0) {
        return "fa-sun";
    }

    if ([1, 2, 3].includes(code)) {
        return "fa-cloud-sun";
    }

    if ([45, 48].includes(code)) {
        return "fa-smog";
    }

    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        return "fa-cloud-rain";
    }

    if ([95, 96, 99].includes(code)) {
        return "fa-cloud-bolt";
    }

    return "fa-cloud";
}


/* =====================================================
   FORMAT POPULATION
   ===================================================== */

function formatPopulation(value) {

    if (!value) {
        return "N/A";
    }

    return new Intl.NumberFormat(
        "en-US"
    ).format(value);
}


/* =====================================================
   GET COUNTRY FROM LOCATION
   ===================================================== */

function getCountryName(location) {

    return location.country || "";
}


/* =====================================================
   UPDATE WEATHER ICON
   ===================================================== */

function updateWeatherIcon(code) {

    const icon =
        document.querySelector(
            ".weather-icon i"
        );

    if (!icon) return;

    icon.className =
        `fa-solid ${weatherIcon(code)}`;
}


/* =====================================================
   UPDATE MAP
   ===================================================== */

function updateMap(
    latitude,
    longitude,
    cityName
) {

    if (!map) return;

    map.setView(
        [latitude, longitude],
        11,
        {
            animate: true
        }
    );

    if (mapMarker) {
        map.removeLayer(mapMarker);
    }

    mapMarker =
        L.marker([
            latitude,
            longitude
        ])
        .addTo(map)
        .bindPopup(
            `<b>${cityName}</b>`
        )
        .openPopup();
}


/* =====================================================
   UPDATE WEATHER CARD
   ===================================================== */

async function updateWeather(location) {

    const data =
        await getWeather(
            location.latitude,
            location.longitude
        );

    const current =
        data.current;

    temperature.textContent =
        Math.round(
            current.temperature_2m
        );

    weatherStatus.textContent =
        weatherDescription(
            current.weather_code
        );

    weatherLocation.textContent =
        `${location.name}, ${location.country_code}`;

    updateWeatherIcon(
        current.weather_code
    );


    /* Local time */

    if (data.current.time) {

        const date =
            new Date(data.current.time);

        localTime.textContent =
            date.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
    }
}


/* =====================================================
   UPDATE COUNTRY INFORMATION
   ===================================================== */

async function updateCountry(location) {

    const country =
        await getCountryInfo(
            location.country
        );

    if (!country) {
        return;
    }


    population.textContent =
        formatPopulation(
            country.population
        );


    const languages =
        country.languages
            ? Object.values(
                country.languages
            ).join(", ")
            : "N/A";

    language.textContent =
        languages;


    weatherLocation.textContent =
        `${location.name}, ${country.name.common}`;

    heroLocation.textContent =
        `${location.name}, ${country.name.common}`;
}


/* =====================================================
   DESTINATION IMAGE
   ===================================================== */

async function destinationImage(
    city,
    country
) {

    const image =
        await getWikiImage(
            `${city} ${country}`
        );

    return image ||
        "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80";
}


/* =====================================================
   CREATE DESTINATION CARD
   ===================================================== */

async function createDestinationCard(
    city
) {

    try {

        const location =
            await getCoordinates(city);

        const image =
            await destinationImage(
                location.name,
                location.country
            );

        const card =
            document.createElement("article");

        card.className =
            "destination-card";

        card.innerHTML = `

            <img
                src="${image}"
                alt="${location.name}"
                loading="lazy"
            >

            <div class="rating">
                <i class="fa-solid fa-star"></i>
                Explore
            </div>

            <div class="destination-info">

                <h3>
                    ${location.name}
                </h3>

                <p>
                    ${location.country}
                </p>

            </div>

            <div class="destination-arrow">

                <i class="fa-solid fa-arrow-right"></i>

            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                loadCity(
                    location.name
                );

            }
        );


        return card;

    } catch (error) {

        console.error(error);

        return null;
    }
}


/* =====================================================
   LOAD POPULAR DESTINATIONS
   ===================================================== */

async function loadPopularDestinations() {

    destinationGrid.innerHTML = "";

    const cards =
        await Promise.all(
            popularCities.map(
                city =>
                    createDestinationCard(city)
            )
        );

    cards.forEach(card => {

        if (card) {
            destinationGrid.appendChild(card);
        }

    });
}


/* =====================================================
   WIKIPEDIA PLACES
   ===================================================== */

async function loadFamousPlaces(
    city
) {

    placesContainer.innerHTML =
        `<p class="api-loading">Loading...</p>`;


    const results =
        await searchWikipedia(
            `famous places in ${city}`
        );


    placesContainer.innerHTML = "";


    const selected =
        results.slice(0, 4);


    for (const item of selected) {

        const image =
            await getWikiImage(
                item.title
            );


        const card =
            document.createElement("article");

        card.className =
            "mini-card";

        card.innerHTML = `

            <img
                src="${
                    image ||
                    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=500&q=80"
                }"
                alt="${item.title}"
                loading="lazy"
            >

            <div class="mini-card-content">

                <h3>
                    ${item.title}
                </h3>

                <p>
                    ${city}
                </p>

                <div class="mini-rating">
                    <i class="fa-solid fa-star"></i>
                    Explore
                </div>

            </div>

        `;

        placesContainer.appendChild(card);
    }
}


/* =====================================================
   LOCAL FOOD
   ===================================================== */

async function loadLocalFood(
    city
) {

    foodContainer.innerHTML =
        `<p class="api-loading">Loading...</p>`;


    const results =
        await searchWikipedia(
            `traditional food of ${city}`
        );


    foodContainer.innerHTML = "";


    const selected =
        results.slice(0, 4);


    for (const item of selected) {

        const image =
            await getWikiImage(
                item.title
            );


        const card =
            document.createElement("article");

        card.className =
            "mini-card";

        card.innerHTML = `

            <img
                src="${
                    image ||
                    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80"
                }"
                alt="${item.title}"
                loading="lazy"
            >

            <div class="mini-card-content">

                <h3>
                    ${item.title}
                </h3>

                <p>
                    Local Cuisine
                </p>

                <div class="mini-rating">
                    <i class="fa-solid fa-star"></i>
                    Discover
                </div>

            </div>

        `;

        foodContainer.appendChild(card);
    }
}


/* =====================================================
   OPENSTREETMAP / OVERPASS
   NEARBY HOTELS
   ===================================================== */

async function loadNearbyStays(
    latitude,
    longitude
) {

    staysContainer.innerHTML =
        `<p class="api-loading">Loading...</p>`;


    const query = `
        [out:json];
        (
            node
                ["tourism"="hotel"]
                (around:8000,${latitude},${longitude});

            way
                ["tourism"="hotel"]
                (around:8000,${latitude},${longitude});
        );
        out center 4;
    `;


    try {

        const response =
            await fetch(
                `${APIS.overpass}?data=${encodeURIComponent(query)}`
            );


        const data =
            await response.json();


        staysContainer.innerHTML = "";


        const hotels =
            data.elements || [];


        hotels
            .slice(0, 4)
            .forEach(
                hotel => {

                    const name =
                        hotel.tags?.name ||
                        "Nearby Hotel";


                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "mini-card";


                    card.innerHTML = `

                        <img
                            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80"
                            alt="${name}"
                            loading="lazy"
                        >

                        <div class="mini-card-content">

                            <h3>
                                ${name}
                            </h3>

                            <p>
                                Nearby Stay
                            </p>

                            <div class="mini-rating">

                                <i class="fa-solid fa-location-dot"></i>
                                Nearby

                            </div>

                        </div>

                    `;


                    staysContainer.appendChild(
                        card
                    );

                }
            );


        if (hotels.length === 0) {

            staysContainer.innerHTML =
                `<p class="api-loading">
                    No nearby hotels found.
                </p>`;
        }


    } catch (error) {

        console.error(
            "Hotel API error:",
            error
        );

        staysContainer.innerHTML =
            `<p class="api-loading">
                Nearby stays unavailable.
            </p>`;
    }
}


/* =====================================================
   LOAD COMPLETE CITY
   ===================================================== */

async function loadCity(
    city
) {

    showLoading();


    try {

        const location =
            await getCoordinates(city);


        /*
         * Update weather
         */

        await updateWeather(
            location
        );


        /*
         * Update country data
         */

        await updateCountry(
            location
        );


        /*
         * Update map
         */

        updateMap(
            location.latitude,
            location.longitude,
            location.name
        );


        /*
         * Load famous places
         */

        await loadFamousPlaces(
            location.name
        );


        /*
         * Load food
         */

        await loadLocalFood(
            location.name
        );


        /*
         * Load nearby hotels
         */

        await loadNearbyStays(
            location.latitude,
            location.longitude
        );


        /*
         * Update hero
         */

        const hero =
            document.querySelector(".hero");


        const heroImage =
            await destinationImage(
                location.name,
                location.country
            );


        hero.style.setProperty(
            "--hero-image",
            `url("${heroImage}")`
        );


        /*
         * Update text
         */

        heroLocation.textContent =
            `${location.name}, ${location.country}`;


        /*
         * Scroll to top

         */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "Sorry, this destination could not be found."
        );

    } finally {

        hideLoading();

    }
}


/* =====================================================
   SEARCH
   ===================================================== */

async function searchCity() {

    const city =
        searchInput.value.trim();


    if (!city) {

        searchInput.focus();

        return;
    }


    await loadCity(city);
}


/* Search button through ENTER */

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchCity();

        }

    }
);


/* =====================================================
   EXPLORE BUTTON
   ===================================================== */

exploreButton.addEventListener(
    "click",
    () => {

        document
            .querySelector(".section")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =====================================================
   VIEW MAP
   ===================================================== */

viewMapButton.addEventListener(
    "click",
    () => {

        document
            .querySelector(".map-card")
            .scrollIntoView({
                behavior: "smooth"
            });

        setTimeout(() => {

            map.invalidateSize();

        }, 500);

    }
);


/* =====================================================
   SIDEBAR MAP BUTTON
   ===================================================== */

mapNav.addEventListener(
    "click",
    () => {

        document
            .querySelector(".map-card")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =====================================================
   CREATE TRIP BUTTON
   ===================================================== */

createTrip.addEventListener(
    "click",
    () => {

        alert(
            "Trip planner coming soon! You can extend this using localStorage or a travel API."
        );

    }
);


/* =====================================================
   THEME BUTTON
   ===================================================== */

const moonButton =
    document.querySelector(
        ".icon-button"
    );


moonButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-mode"
        );

    }
);


/* =====================================================
   HERO CAROUSEL
   ===================================================== */

const heroCities = [
    "Tokyo",
    "Paris",
    "Dubai",
    "Bali"
];

let heroIndex = 0;


const heroNext =
    document.querySelector(
        ".hero-controls button:last-child"
    );


const heroPrevious =
    document.querySelector(
        ".hero-controls button:first-of-type"
    );


function changeHeroCity(
    direction
) {

    heroIndex += direction;


    if (heroIndex >= heroCities.length) {
        heroIndex = 0;
    }


    if (heroIndex < 0) {
        heroIndex =
            heroCities.length - 1;
    }


    loadCity(
        heroCities[heroIndex]
    );


    const dots =
        document.querySelectorAll(
            ".hero-controls .dot"
        );


    dots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "active",
                index === heroIndex
            );

        }
    );
}


heroNext.addEventListener(
    "click",
    () => {
        changeHeroCity(1);
    }
);


heroPrevious.addEventListener(
    "click",
    () => {
        changeHeroCity(-1);
    }
);


/* =====================================================
   INITIALIZE
   ===================================================== */

async function initializeApp() {

    try {

        initializeMap();

        await loadPopularDestinations();

        await loadCity("Tokyo");

    } catch (error) {

        console.error(
            "Application initialization error:",
            error
        );

    } finally {

        hideLoading();

    }
}


initializeApp();