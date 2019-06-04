import Feature from 'ol/Feature';
import Fill from 'ol/style/Fill';
import Map from 'ol/Map';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import View from 'ol/View';
import { Circle } from 'ol/geom';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import Geocoder from 'ol-geocoder';

import '~/ol/ol.css';
import '~/ol-geocoder/dist/ol-geocoder.min.css';
import './index.css';

const MAPBOX_API_TOKEN = 'pk.eyJ1IjoiY2lyY2xlbWFwIiwiYSI6ImNqd2gxbGd6aDA0eXUzeXBvb2M3ajFmaGcifQ.9oDqFAFGpSKcPkCymM1xcA';
const MAPBOX_STYLE_KEY = 'cjwh1tb69470n1cq9f2922fl5';

const circleColor = [251, 129, 38];

const vectorSource = new VectorSource({ wrapX: false });
const vectorLayer = new VectorLayer({ source: vectorSource });

let currentPosition = fromLonLat([0, 0]);

const view = new View({
    center: currentPosition,
    zoom: 4
});

const pointGeom = new Circle([0, 0], 1);
const point = new Feature({
    geometry: pointGeom,
    name: 'the point'
});

point.setStyle(new Style({
    stroke: new Stroke({
        color: circleColor,
        width: 6
    }),
    fill: new Fill({
        color: circleColor
    })
}));

const circleGeom = new Circle([0, 0], 1000);
const circle = new Feature({
    geometry: circleGeom,
    name: 'the circle'
});

circle.setStyle(new Style({
    stroke: new Stroke({
        color: circleColor
    }),
    fill: new Fill({
        color: [...circleColor, 0.1]
    })
}));

vectorSource.addFeature(circle);
vectorSource.addFeature(point);

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new XYZ({
                url: `https://api.mapbox.com/styles/v1/circlemap/${MAPBOX_STYLE_KEY}/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_API_TOKEN}`
            }),
        }),
        vectorLayer
    ],
    view
});

const radiusInput = document.getElementById('radius-km') as HTMLInputElement;
const radiusForm = document.getElementById('radius-form');
radiusForm.addEventListener('submit', (e) => {
    e.preventDefault();
    setPosition(currentPosition);
});
const centerOnLocationButton = document.getElementById('center-on-location') as HTMLButtonElement;
centerOnLocationButton.addEventListener('click', e => {
    e.preventDefault();
    centerOnUserLocation();
})

const geocoder = new Geocoder('nominatim', {
    provider: 'osm',
    autoComplete: true,
    keepOpen: true,
    preventDefault: true
});

geocoder.on('addresschosen', function (evt: Event & { coordinate: Coordinate }) {
    setPosition(evt.coordinate);
});

map.addControl(geocoder);

function getRadius() {
    return parseFloat(radiusInput.value) * 1000;
}

function setPosition(pos: Coordinate) {
    const radius = getRadius();
    currentPosition = pos;
    circleGeom.setCenterAndRadius(pos, radius)
    pointGeom.setCenter(pos);
    view.fit(circleGeom.getExtent(), { padding: [10, 10, 10, 10] });
}

function centerOnUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: Position) => {
            setPosition(fromLonLat([position.coords.longitude, position.coords.latitude]));
        });
    }
}

centerOnUserLocation();
