import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import OLMapWithLocalTiles from './Map'
import OLMapWithLocalTiles2 from './Map2'

function App() {
  const [count, setCount] = useState(0)
  const [isWebGL, setIsWebGL] = useState(true)
  const [epsg, setEPSG] = useState('EPSG:4326')
  const [y, setY] = useState('y')
  
  return (
    <>
    <button onClick={()=> setY(a => a === 'y' ? '-y': 'y')}>{`${y}`}</button>
    <button onClick={()=> setIsWebGL(a => !a)}>{`webgl=${isWebGL}`}</button>
    <button onClick={()=> setEPSG(a => a === 'EPSG:4326' ? 'EPSG:3857': 'EPSG:4326')}>{`${epsg}`}</button>
    {isWebGL? <OLMapWithLocalTiles epsg={epsg} y={y}/>:<OLMapWithLocalTiles2 epsg={epsg} y={y}/>}
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
