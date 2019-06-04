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

import './index.css';

const MAPBOX_API_TOKEN = 'pk.eyJ1IjoiY2lyY2xlbWFwIiwiYSI6ImNqd2gxbGd6aDA0eXUzeXBvb2M3ajFmaGcifQ.9oDqFAFGpSKcPkCymM1xcA';
const MAPBOX_STYLE_KEY = 'cjwh1tb69470n1cq9f2922fl5';

const vectorSource = new VectorSource({ wrapX: false });
const vectorLayer = new VectorLayer({ source: vectorSource });

const view = new View({
    center: fromLonLat([0, 0]),
    zoom: 4
});

const circle = new Feature({
    geometry: new Circle([0, 0], 1000),
    name: 'the circle'
});

const circleColor = [251, 129, 38];

circle.setStyle(new Style({
    stroke: new Stroke({
        color: circleColor
    }),
    fill: new Fill({
        color: [...circleColor, 0.1]
    })
}));

vectorSource.addFeature(circle);

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
    getLocation();
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showPosition(position: Position) {
    const radius = parseFloat(radiusInput.value) * 1000;
    const pos = fromLonLat([position.coords.longitude, position.coords.latitude])
    const geom = new Circle(pos, radius);
    circle.setGeometry(geom);
    view.fit(geom.getExtent(), { padding: [10, 10, 10, 10] });
}

getLocation();
