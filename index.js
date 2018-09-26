function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 1,
        center: { lat: 0.0000, lng: 0.0000 }
    });
    const geocoder = new google.maps.Geocoder();
    $('.js-form').on('click', '.js-submit-button', function (event) {
        event.preventDefault();
        geocodeAddress(geocoder, map);
    });
}

// Geocodes address (takes location and returns latitude and longitude)
// Places markers on user's location and the antipode 
function geocodeAddress(geocoder, resultsMap) {
    let address = $('.js-location').val();
    geocoder.geocode({ 'address': address }, function (results, status) {
        const latitude = results[0].geometry.location.lat();
        const longitude = results[0].geometry.location.lng();
        onWater(latitude, longitude, displayIfOnWater);

        // creates marker for User's Location 
        if (status === 'OK') {
            const userLocation = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });

            // creates marker for antipode. Longitude calculated differently depending on user's location's longitude 
            if (longitude <= 0) {
                let antipodeLng = longitude + 180;
                const antipodeMarker = new google.maps.Marker({
                    map: resultsMap,
                    position: { lat: latitude * -1, lng: antipodeLng }
                });
            } else {
                let antipodeLng = longitude - 180;
                const antipodeMarker = new google.maps.Marker({
                    map: resultsMap,
                    position: { lat: latitude * -1, lng: antipodeLng }
                });
            }
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}
