import UTILS from "./hashUtils.js";

const INDEX_FLAG = 11;
const INDEX_LATITUDE = 3;
const INDEX_LONGITUDE = 4;
const INDEX_PLACENAME = 2;
const LAT_LON_PARSER = /\((.*),'(.*)',(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),'(.*)'\)/;
const MAX_MARKER_ZOOM = 10;
const LOCATION_AMERICAS = {lat: 0, lng: -82.25, zoom: 3};
const LOCATION_JERUSALEM = {lat: 31.7683, lng: 35.2137, zoom: 8};
const LOCATION_USA = {lat: 39.5, lng: -98.5833, zoom: 5};

let gmMarkers = [];

const addMarker = function (name, lat, lon) {
    let needNewMarker = gmMarkers.every(function (existingMarker) {
        if (Number(lat) === existingMarker.position.lat() && Number(lon) === existingMarker.position.lng()) {
            if (!existingMarker.label.includes(name)) {
                existingMarker.label += `, ${name}`;
            }
            return false;
        }
        return true;
    });

    if (!needNewMarker) {
        return;
    }

    let marker = new google.maps.Marker({
        position: {lat: Number(lat), lng: Number(lon)},
        map,
        title: name,
        label: name,
        animation: google.maps.Animation.DROP
    });
    gmMarkers.push(marker);
};

const clearMarkers = function () {
    gmMarkers.forEach(function (marker) {
        marker.setMap(null);
    });
    gmMarkers = [];
};

const setupMarkers = function () {
    clearMarkers();
    document.querySelectorAll("a[onclick^=\"showLocation(\"]").forEach(function (element) {
        let matches = LAT_LON_PARSER.exec(element.getAttribute("onclick"));

        if (matches) {
            let placename = matches[INDEX_PLACENAME];
            let flag = matches[INDEX_FLAG];
            if (flag !== "") {
                placename += ` ${flag}`;
            }

            addMarker(placename, matches[INDEX_LATITUDE], matches[INDEX_LONGITUDE]);
        }
    });
    zoomMap();
};

const zoomMap = function () {
    if (gmMarkers.length <= 0) {
        let currentHash = UTILS.getCurrentHash();
        currentHash = (currentHash === undefined ? 0 : Number(currentHash[0]));
        if (currentHash[0] <= 2 || currentHash === 5) {
            // if there is no hash or we're in one of the bible volumes or PGP zoom to jerusalem
            map.panTo(LOCATION_JERUSALEM);
            map.setZoom(LOCATION_JERUSALEM.zoom);
        } else if (currentHash [0] === 3) {
            // if hash indicates we're in the Book of Mormon, zoom to "americas"
            map.panTo(LOCATION_AMERICAS);
            map.setZoom(LOCATION_AMERICAS.zoom);
        } else if (currentHash [0] === 4) {
            // if hash indicates we're in D&C, zoom to USA
            map.panTo(LOCATION_USA);
            map.setZoom(LOCATION_USA.zoom);
        }
    } else if (gmMarkers.length === 1) {
        map.panTo(gmMarkers[0].position);
        map.setZoom(MAX_MARKER_ZOOM);
    } else {
        let bounds = new google.maps.LatLngBounds();
        gmMarkers.forEach(function (marker) {
            bounds.extend(marker.position);
        });
        map.fitBounds(bounds);
    }
};

const showLocation = function (geotagId, placename, latitude, longitude, viewLatitude, viewLongitude, viewTilt, viewRoll, viewAltitude, viewHeading) {
    map.panTo({lat: latitude, lng: longitude});
    map.setZoom((viewAltitude >= MAX_MARKER_ZOOM ? MAX_MARKER_ZOOM : viewAltitude));
};

const MAP = {
    addMarker,
    clearMarkers,
    setupMarkers,
    showLocation,
    zoomMap,
};

export default Object.freeze(MAP);