import React from 'react';
import {createRoot} from 'react-dom/client';
import { useState, useEffect, useRef } from "react"; 
import { GoogleMap } from '@react-google-maps/api';
import queryString from "query-string"

import {
    APIProvider,
    Map,
    useMapsLibrary,
    useMap
} from '@vis.gl/react-google-maps';

export default function App() {
  var tester=queryString.parse(window.location.search);
  var tester2=JSON.parse(tester.body)
  const position = { lat: 43.6532, lng: -79.3832 };

  return (
      <div style={{ width: '100vw', height: '100vh' }}>
          <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY}>
              <Map 
                  
                  
                  gestureHandling={'greedy'}
                  fullscreenControl = {false}
                  mapId={process.env.GOOGLE_MAP_ID}
              >
                <Directions />
              </Map>
          </APIProvider> 
      </div>
  );
}

function Directions() {
  var tester=queryString.parse(window.location.search);
  var tester2=JSON.parse(tester.body)
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes")
  const [directionsService, setDirectionsService] = 
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = 
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];


  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if(!directionsService || !directionsRenderer) return;

    directionsService.route({
      origin: tester2[0],
      destination: tester2[1],
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    })
    .then(response => {
      directionsRenderer.setDirections(response);
      setRoutes(response.routes);
  });
  }, [directionsService, directionsRenderer]);
  

  useEffect(() => {
    if(!directionsRenderer) return;

    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer])
  
  if (!leg) return null;

  
  return (
  <div className="directions">
    <h2>{selected.summary}</h2>
    <p>
      {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
    </p>
    <p>Distance: {leg.distance?.text}</p>
    <p>Duration: {leg.duration?.text}</p>

    <h2>Other Routes</h2>
    <ul>
      {routes.map((route,index) => (
      <li key={route.summary}>
        <button onClick={() => setRouteIndex(index)}>{route.summary}</button>
        </li>
      ))}
    </ul>
  </div>
  );
}

export function renderToDom(container: HTMLElement) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}