import React from 'react';
import {createRoot} from 'react-dom/client';
import { useState, useEffect, useRef } from "react"; 
import { GoogleMap } from '@react-google-maps/api';
import queryString from "query-string"
import Poly from './googlemaps';
import { useGoogleMap } from '@react-google-maps/api';

import {
    APIProvider,
    Map,
    useMapsLibrary,
    useMap
} from '@vis.gl/react-google-maps';

export default function App() {
  const mapRef = useRef(null);
  var tester=queryString.parse(window.location.search);
  
  const position = { lat: 43.6532, lng: -79.3832 };

  return (
      <div style={{ width: '100vw', height: '100vh' }}>
          <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY}>
              <Map 
                  ref={mapRef}
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
  
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [polylines, setPolylines] = useState([]);

  var tester=queryString.parse(window.location.search);
  let origin, destination;

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  try {
    
    const points = tester.body ? JSON.parse(tester.body) : null;
    if (points && Array.isArray(points) && points.length >= 2) {
      origin = points[0]; 
      destination = points[1]; 
    } else {
      throw new Error("Invalid or missing origin and destination points in the 'body' parameter.");
    }
  } catch (error) {
    console.error("Failed to parse 'body' as JSON or invalid data format:", error);
    
    origin = "clarke Quay, Singapore";
    destination = "SMU, Singapore"; 
  }

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
      origin: origin,
      destination: destination,
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
  
  const polylinePath = [
    {path:[
    { lat: 1.350438529, lng: 103.6944089 },
    { lat: 1.29779483, lng: 103.8986301 },], color: '#FF0000'},
    {path:[ 
    {lat: 1.29779483, lng: 103.8986301},
    { lat: 1.374880256, lng: 103.9344163 },], color: '#0000FF'} 
  ];

  useEffect(() => {
    if (!map) return;

    const createdPolylines = polylinePath.map(poly => {
      const polyline = new google.maps.Polyline({
          path: poly.path,
          geodesic: true,
          strokeColor: poly.color,
          strokeOpacity: 1.0,
          strokeWeight: 2
      });

    polyline.setMap(map);

    return polyline;
    });

    setPolylines(createdPolylines);

    return () => {
      createdPolylines.forEach(polyline => polyline.setMap(null));
    };
  }, [map]);
  

  if (!leg) return null;

  if (!isOpen) return null;
  
  return (
    <div className="directions" style={{
      padding: '10px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
      borderRadius: '8px',
      margin: '20px',
      maxWidth: '90vw',
      boxSizing: 'border-box'
    }}>
      <button onClick={toggleMinimize} style={{ fontSize: '1rem' }}>
        {isMinimized ? 'Expand' : 'Minimize'}
      </button>
      {!isMinimized && (
        <>
          <h2 style={{ fontSize: '1.2rem' }}>
            {routes[selectedRouteIndex].summary}
          </h2>
          <p>
            {routes[selectedRouteIndex].legs[0].start_address.split(",")[0]} to 
            {routes[selectedRouteIndex].legs[0].end_address.split(",")[0]}
          </p>
          <p>Distance: {routes[selectedRouteIndex].legs[0].distance?.text}</p>
          <p>Duration: {routes[selectedRouteIndex].legs[0].duration?.text}</p>
  
          <h2 style={{ fontSize: '1rem' }}>Other Routes</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {routes.map((route, index) => (
              <li key={route.summary}>
                <button onClick={() => setRouteIndex(index)} style={{
                  backgroundColor: '#007BFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px 15px',
                  margin: '5px',
                  fontSize: '1rem',
                  width: '100%',
                  textAlign: 'left'
                }}>
                  {route.summary}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );  
}

const Markers = () => {
  return null
}

export function renderToDom(container: HTMLElement) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}