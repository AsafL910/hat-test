import { useEffect, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileLayerWebGl from 'ol/layer/WebGLTile';
import { XYZ } from 'ol/source';
import 'ol/ol.css';
import { fromLonLat, get } from 'ol/proj';
import { OSM } from 'ol/source';
import { TileGrid } from 'ol/tilegrid';
// import 'ol/ol.css';
// import 'ol-ext/dist/ol-ext.css';
// import {useScript} from './useScript'

// import {} from 'ol-ext/util'
//ol.ext.getElevationFromPixel
const OLMapWithLocalTiles = (props: {epsg: string, y: string}) => {
  const [mapState, setMap] = useState<Map>();
    const [level, setLevel] = useState<number>(0);
    const [dtmHeight, setDtmHeight] = useState<number>(0)
    const [labelLocation, setLabelLocation] = useState<[number, number]>([0,0])
  const elevation = [
    '+',
    -10000,
    ['*', 0.1 * 255 * 256 * 256, ['band', 1]],
    ['*', 0.1 * 255 * 256, ['band', 2]],
    ['*', 0.1 * 255, ['band', 3]],
  ];
  const [layer] = useState(new TileLayerWebGl({
    opacity: 0.3,
    id: 'elevation',
    source: new XYZ({
    //   tileUrlFunction: function(tileCoord) {
    //     const z = tileCoord[0]; // Zoom level
    //     const x = tileCoord[1]; // X-coordinate
    //     const y = Math.pow(2, z) - 1 - tileCoord[2]; // Flip Y-coordinate
    //     return `http://localhost:3001/${z}/${x}/${y}.png`;
    // },
      url: `http://localhost:3001/{z}/{x}/{y}.png`, // Replace this with the path to your tiles
      tileSize: 256, // Set the tile size (usually 256 or 512 pixels)
      minZoom: 5,
      maxZoom: 15,
      tileGrid: new TileGrid({
        origin: [-180,270],
        resolutions: [1.40625,0.703125,0.3515625,0.17578125,0.087890625,0.0439453125,0.02197265625,0.010986328125,0.0054931640625,0.00274658203125,0.001373291015625,0.0006866455078125],
        tileSize: [256, 256]
      }),
      projection: props.epsg
  }),
}))

  useEffect(() => {
    const map = new Map({
      target: 'map',
      layers: [
          new TileLayer({
              source: new OSM(),  // OpenStreetMap source
            }),
            layer
],
view: new View({
        center: [35.000000, 32.000000],
        zoom: 5,
        minZoom: 5,
        maxZoom: 15,
        // projection: get('EPSG:4326')
        projection: props.epsg
      }),
    });

    map.on('click', (e)=>console.log(map.getView().getZoom()))
    setMap(map);
    window.map = map
    return () => map.setTarget(null); // Clean up on unmount
  }, [props.epsg]);

  useEffect(() => {
    // Dynamically update the layer's style variables when level changes
    layer.setStyle({
      color: [
        'case',
        // use the `level` style variable to determine the color
        ['<=', ['-',level, elevation], 100],
        [255, 0, 0, 1], // Red
        ['between', ['-',level, elevation], 100, 250],
        [255, 255, 0, 1], // Yellow
        ['>=', ['-',level, elevation], 400],
        [0, 255, 0, 1], // Green
        [0, 0, 0, 0], // Transparent
      ],
    });
  }, [level, layer]); // Re-run the effect when `level` changes


  useEffect(()=>{
    const func = (event) => {
          const data = layer.getData(event.pixel); // Extract the RGB values (r, g, b)
          if (data)
            {
                const R = data[0];
                const G = data[1];
                const B = data[2];
                const val =  (R * 256 * 256 * 0.1) + (G * 256 * 0.1) + (B * 0.1) - 10000;
                setDtmHeight(val);
                setLabelLocation(event.pixel)
            }
    }

    mapState?.on('pointermove', func)
    return ()=>{
        mapState?.un('pointermove', func)
    }
  },[mapState])

  return (
    <>
    <div style={{top: labelLocation[1]-5, left: labelLocation[0]+5, position: 'absolute', zIndex: 5, pointerEvents: 'none', backgroundColor: 'black', borderRadius: '10px', padding: '5px'}}>{dtmHeight.toFixed(0)}</div>
    <input id="level" type="range" min="0" max="1000" onChange={e => {
        setLevel(parseFloat(e.currentTarget.value))
        }}/>
    <div id="map" style={{ width: '100vw', height: '100vh' }}></div>
    </>
  );
};

export default OLMapWithLocalTiles;
