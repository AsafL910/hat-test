import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileLayerWebGl from 'ol/layer/WebGLTile';
import { ImageTile, XYZ } from 'ol/source';
import 'ol/ol.css';
import { fromLonLat, get } from 'ol/proj';
import { OSM } from 'ol/source';
import RasterSource from 'ol/source/Raster';
import ImageLayer from 'ol/layer/Image';
// import 'ol/ol.css';
// import 'ol-ext/dist/ol-ext.css';
// import {useScript} from './useScript'

// import {} from 'ol-ext/util'
//ol.ext.getElevationFromPixel
const OLMapWithLocalTiles2 = (props: {epsg: string, y: string}) => {
  const [mapState, setMap] = useState<Map>();
    const [level, setLevel] = useState<number>(0);
    const [dtmHeight, setDtmHeight] = useState<number>(0)
    const [labelLocation, setLabelLocation] = useState<[number, number]>([0,0])
    const levelRef = useRef<number>()
    levelRef.current = level;
    function flood(pixels, data) {
        const pixel = pixels[0];
        console.log(data)
        console.log(pixel)

        const height =
          -10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1;
          console.log('height: ' + height)
        // return pixel;
        if (pixel[3]) {
          if (height <= data.level) {
            pixel[0] = 134;
            pixel[1] = 203;
            pixel[2] = 249;
            pixel[3] = 255;
          } else {
            pixel[3] = 0;
          }
        }
        return pixel;
      }

      useEffect(()=>{
        if (!mapState) return;
        const elevation = new ImageTile({
            // The RGB values in the source collectively represent elevation.
            // Interpolation of individual colors would produce incorrect elevations and is disabled.
            url: `http://localhost:3000/{z}/{x}/{y}.png`,
            tileSize: 256,
            maxZoom: 15,
            minZoom: 5,
            interpolate: false,
          });
          
          const raster = new RasterSource({
            sources: [elevation],
            operation: flood,
          });
          raster.on('beforeoperations', function (event) {
            event.data.level = levelRef.current;
          });

          const layer = new ImageLayer({
            opacity: 0.6,
            source: raster,
          });

          mapState.addLayer(layer)
          return ()=> {
            mapState.removeLayer(layer)
          }
      },[mapState, props.y])
      
      useEffect(() => {
    const map = new Map({
      target: 'map',
      layers: [
          new TileLayer({
              source: new OSM(),
            }),
],
view: new View({
        center: fromLonLat([35.71,32.94], props.epsg),
        zoom: 10,
        minZoom: 5,
        maxZoom: 15,
        projection: props.epsg
      }),
    });
    map.on('click', (e)=>console.log(map.getView().getZoom()))

    setMap(map);
    return () => map.setTarget(null); // Clean up on unmount
  }, [props.epsg, level]);

  return (
    <>
    <div style={{top: labelLocation[1]-5, left: labelLocation[0]+5, position: 'absolute', zIndex: 5, pointerEvents: 'none', backgroundColor: 'black', borderRadius: '10px', padding: '5px'}}>{dtmHeight.toFixed(0)}</div>
    <input id="level" type="range" min="0" max="1000" onChange={e => {
        setLevel(parseFloat(e.currentTarget.value))
        }}/>
    <div id="map" style={{ width: '100vw', height: '100vh' }}></div>
    </>)
}

export default OLMapWithLocalTiles2;