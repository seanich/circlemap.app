import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { Circle } from 'ol/geom';

import { fromLonLat } from 'ol/proj';

const vectorSource = new VectorSource({ wrapX: false });
const vectorLayer = new VectorLayer({ source: vectorSource });

const view = new View({
    center: fromLonLat([37.41, 8.82]),
    zoom: 4
});


const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new XYZ({
                url: 'https://api.mapbox.com/styles/v1/circlemap/cjwh1tb69470n1cq9f2922fl5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2lyY2xlbWFwIiwiYSI6ImNqd2gxbGd6aDA0eXUzeXBvb2M3ajFmaGcifQ.9oDqFAFGpSKcPkCymM1xcA'
            }),
        }),
        vectorLayer
    ],
    view
});

const circle = new Feature({
    geometry: new Circle([0, 0], 1000),
    name: 'the circle'
});

vectorSource.addFeature(circle);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

const radiusInput = document.getElementById('radius-km');

function showPosition(position) {
    const radius = parseFloat(radiusInput.value) * 1000;
    const pos = fromLonLat([position.coords.longitude, position.coords.latitude])
    const geom = new Circle(pos, radius);
    circle.setGeometry(geom);
    view.fit(geom.getExtent(), { padding: [10, 10, 10, 10] });
}

getLocation();

const radiusForm = document.getElementById('radius-form');
radiusForm.addEventListener('submit', (e) => {
    e.preventDefault();
    getLocation();
});
