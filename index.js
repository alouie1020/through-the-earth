let MARKERS = [];

function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 1,
        center: { lat: 0.0000, lng: 0.0000 }
    });
    const geocoder = new google.maps.Geocoder();
    $('.js-form').on('click', '.js-submit-button', function (event) {
        event.preventDefault();
        $('.results').html('');
        removeMarkers();
        geocodeAddress(geocoder, map);
        $('.js-location').val('');
    });
}

// Geocodes address (takes location and returns latitude and longitude)
// Places markers on user's location and the antipode 
function geocodeAddress(geocoder, resultsMap) {
    let address = $('.js-location').val();
    geocoder.geocode({ 'address': address }, function (results, status) {
        const antipodeLat = results[0].geometry.location.lat() * -1;
        const longitude = results[0].geometry.location.lng();
        
        // creates marker for User's Location 
        if (status === 'OK') {
            const userLocation = results[0].geometry.location;
            addMarkers(userLocation, resultsMap);

            // creates marker for antipode. Longitude calculated differently depending on user's location's longitude 
            let antipodeLng;
            if (longitude <= 0) {
                antipodeLng = longitude + 180;
            } else {
                antipodeLng = longitude - 180;
            } 
            const antipodeMarker = { lat: antipodeLat, lng: antipodeLng };
            addMarkers(antipodeMarker, resultsMap);
            runFunctionsByLatLng(antipodeLat, antipodeLng);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function addMarkers(location, map) {
    const marker = new google.maps.Marker({
        position: location, 
        map: map
    });
    MARKERS.push(marker);
}

function removeMarkers() {
    for (let i = 0; i < MARKERS.length; i++) {
        MARKERS[i].setMap(null);
    };
    MARKERS = [];
}

function runFunctionsByLatLng(antipodeLat, antipodeLng) {
    onWater(antipodeLat, antipodeLng, displayIfOnWater);
    getWeatherData(antipodeLat, antipodeLng, displayWeather);
}

// Determines if antipode is on water or land using Onwater.io API 
function onWater(lat, lon, callback) {
    const query = {
        access_token: 'BxRSa6b5bsKFNaYhneVU'
    };
    $.getJSON(`https://api.onwater.io/api/v1/results/${lat},${lon}`, query, callback);
}

// 
function displayIfOnWater(data) {
    if (data.water === true) {
        $('.results').append(`
            <div class="js-on-water">
                <h2>Oh no! You're in water!</h2>
            </div>
        `)
    }
    else if (data.water === false) {
        displayAntipodeLocation(data.lat, data.lon);
    }
    else {
        $('.results').append(`
            <div class="js-on-water">
                <h2>Oh no! You're in Antarctica!</h2>
            </div>
        `)
    }
}

// Reverse geocodes location to determine on which region/country the user's antipode is  
function displayAntipodeLocation(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: lat, lng: lng };
    geocoder.geocode({ 'location': latlng }, function (results, status) {
        if (status === 'OK') {
            const region = results[results.length - 1].formatted_address;
            $('.results').append(`
          <div class="js-antipode-location">
              <h2>You've landed in ${region}</h2>
          </div>
        `);
            getNewsData(region, displayNews);
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

// calculates date to 1 month before
function calculateDate() {
    const oneMonthAgo = new Date(); oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    let date = oneMonthAgo.getFullYear() + '-' + (oneMonthAgo.getMonth() + 1) + '-' + oneMonthAgo.getDate();
    return date;
}

function getNewsData(region, callback) {
    const newsURL = 'https://newsapi.org/v2/everything';
    const query = {
        sources: 'bbc-news',
        q: `${region}`,
        from: calculateDate,
        sortBy: 'popularity',
        apiKey: '91458b185408465cb08d08d18edeba07'
    }
    $.getJSON(newsURL, query, callback);
}

function displayNews(data) {
    const firstFiveArticles = data.articles.slice(0, 5);
    const results = firstFiveArticles.map(article => renderNews(article));
    $('.results').append(results);
}

function renderNews(article) {
    return `
      <div class="js-news">
        <img src="${article.urlToImage}" alt="article-title">
        <b>${article.title}</b>
        ${article.description}
      </div>
    `
}

function getWeatherData(lat, lng, callback) {
    const weatherURL = 'https://api.weatherbit.io/v2.0/current';
    const query = {
        units: 'I',
        lat: `${lat}`,
        lon: `${lng}`,
        key: 'abef0b511e52490c9e6af27a61632a7c'
    };
    $.getJSON(weatherURL, query, callback);
}

function displayWeather(data) {
    console.log(data);
    if (data.data[0].precip === null) {
        $('.results').append(`
            <div class="weather">
                It is currently ${data.data[0].temp}&#176; F<br />
                ${data.data[0].weather.description} <br />
            </div>
        `);
    } else {
        $('.results').append(`
        <div class="weather">
            It is currently ${data.data[0].temp}&#176; F<br />
            ${data.data[0].weather.description} <br />
            Chance of Rain: ${data.data[0].precip}%
        </div>
    `);
    }
}