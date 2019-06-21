import Vue from "vue";
import loadGoogleMapsApi from 'load-google-maps-api';

import App from "./App.vue";
import mapStyle from "./mapStyle";

import "./styles/index.css";

const circleColor = `rgb(${[251, 129, 38].join(",")})`;

let map: google.maps.Map;
let circle: google.maps.Circle;
let point: google.maps.Circle;
let currentPosition: google.maps.LatLngLiteral = { lat: 0, lng: 0 };

const app = new Vue({
  el: "#app",
  render: h => h(App),
  data: {
    query: "",
    radiusText: "1"
  },
  computed: {
    radius: function (): number {
      return parseFloat(this.radiusText) * 1000;
    }
  },
  methods: {
    selectLocation(location: google.maps.LatLngLiteral) {
      setPosition(location);
    },
    updateRadius() {
      setRadius(this.radius);
    },
    centerOnUserLocation() {
      getUserLocation().then(position => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }
});

function setRadius(radius: number) {
  circle.setRadius(radius);
  fitToCircle();
}

function setPosition(pos: google.maps.LatLngLiteral) {
  currentPosition = pos;
  if (!circle) return;
  circle.setCenter(pos);
  point.setCenter(pos);
  setRadius(app.radius);
  fitToCircle();
}

function constrainBounds(
  target: google.maps.LatLngBounds,
  container: google.maps.LatLngBounds
): google.maps.LatLngBounds {
  const tsw = target.getSouthWest();
  const tne = target.getNorthEast();
  const csw = container.getSouthWest();
  const cne = container.getNorthEast();
  return new google.maps.LatLngBounds(
    {
      lat: Math.max(tsw.lat(), csw.lat()),
      lng: Math.max(tsw.lng(), csw.lng())
    },
    { lat: Math.min(tne.lat(), cne.lat()), lng: Math.min(tne.lng(), cne.lng()) }
  );
}

function fitToCircle() {
  const worldBounds = new google.maps.LatLngBounds(
    { lat: -80, lng: -170 },
    { lat: 80, lng: 170 }
  );
  const circleBounds = circle.getBounds();
  map.fitBounds(constrainBounds(circleBounds, worldBounds), 20);
}

function getUserLocation(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        resolve(position);
      });
    } else {
      reject("Geolocation API not available");
    }
  });
}

loadGoogleMapsApi({ key: process.env.GOOGLEMAPS_KEY }).then(function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: currentPosition,
    styles: mapStyle,
    controlSize: 25,
    disableDefaultUI: true,
    mapTypeControl: true,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT
    }
  });

  const commonCircleOptions = {
    center: map.getCenter(),
    fillColor: circleColor,
    strokeColor: circleColor,
    map
  };

  circle = new google.maps.Circle({
    radius: 1000,
    ...commonCircleOptions,
    fillOpacity: 0.1,
    strokeWeight: 1
  });

  point = new google.maps.Circle({
    ...commonCircleOptions,
    radius: 0.1,
    fillOpacity: 1,
    strokeWeight: 8
  });

  app.centerOnUserLocation();
});
