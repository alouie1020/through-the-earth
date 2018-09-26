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
