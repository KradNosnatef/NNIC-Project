import React from 'react';
import {createRoot} from 'react-dom/client';
import { useState, useEffect, useRef } from "react"; 
import { GoogleMap } from '@react-google-maps/api';
import queryString from "query-string"
import Poly from './googlemaps';
import { useGoogleMap } from '@react-google-maps/api';
import fs from 'fs'

import {
    APIProvider,
    Map,
    useMapsLibrary,
    useMap
} from '@vis.gl/react-google-maps';
import { error } from 'console';

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
                <MapLegend />
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
  const [polylinePath,setPolylinePath]=useState([]);

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
    
    origin = "East coast park, Singapore";
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
    const ds = new routesLibrary.DirectionsService();
    const dr = new routesLibrary.DirectionsRenderer({
      map: map,
      polylineOptions: {
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 6
      }
    });

    setDirectionsService(ds);
    setDirectionsRenderer(dr);
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
  
  //var speedBandResponse=fetch('http://fuqianshan.asuscomm.com:5173/speedBand.json')
  //var speedBandData=speedBandResponse.json()

  /*const polylinePath = [
    {path:[
      //{ lat: speedBandData.value[0].StartLat, lng: speedBandData.value[0].StartLon },
      //{ lat: speedBandData.value[0].EndLat, lng: speedBandData.value[0].EndLon },
      { lat: 1.350438529, lng: 103.6944089 },
      { lat: 1.29779483, lng: 103.8986301 },
    ], color: '#FF0000'},
    {path:[
      //{ lat: speedBandData.value[1].StartLat, lng: speedBandData.value[1].StartLon },
      //{ lat: speedBandData.value[1].EndLat, lng: speedBandData.value[1].EndLon },
      {lat: 1.29779483, lng: 103.8986301},
      { lat: 1.374880256, lng: 103.9344163 },
    ], color: '#0000FF'} 
  ];*/
  useEffect(()=>{
    fetch('http://fuqianshan.asuscomm.com:5173/speedBand.json')
      .then(response=>response.json())
      .then(data=>{
        /*var temper = [
          {path:[
            { lat: parseFloat(data.value[0].StartLat), lng: parseFloat(data.value[0].StartLon) },
            { lat: parseFloat(data.value[0].EndLat), lng: parseFloat(data.value[0].EndLon) },
            //{ lat: 1.350438529, lng: 103.6944089 },
            //{ lat: 1.29779483, lng: 103.8986301 },
          ], color: '#FF0000'},
          {path:[
            { lat: parseFloat(data.value[1].StartLat), lng: parseFloat(data.value[1].StartLon) },
            { lat: parseFloat(data.value[1].EndLat), lng: parseFloat(data.value[1].EndLon) },
            //{lat: 1.29779483, lng: 103.8986301},
            //{ lat: 1.374880256, lng: 103.9344163 },
          ], color: '#0000FF'} 
        ]*/
        var temper=new Array();
        var colorSelector=['','#FF0000','#DF2000','#BF4000','#9F6000','#7F8000','#5FA000','#3FC000','#1FE000']
        var counter=0
        for(var i=0;i<data.value.length;i++){
          if(data.value[i].RoadCategory=='A'||data.value[i].RoadCategory=='B'||data.value[i].RoadCategory=='C'){
            temper[counter]={
              path:[
                { lat: parseFloat(data.value[i].StartLat), lng: parseFloat(data.value[i].StartLon) },
                { lat: parseFloat(data.value[i].EndLat), lng: parseFloat(data.value[i].EndLon) },
              ],
              color:colorSelector[parseInt(data.value[i].SpeedBand)]
            };
            counter=counter+1;
          }
        }
        console.log(data.value.length)
        setPolylinePath(temper);
      })
      .catch(error=>console.error('Error:',error));
  },[]);

  useEffect(() => {
    if (!map) return;

    const createdPolylines = polylinePath.map(poly => {
      const polyline = new google.maps.Polyline({
          path: poly.path,
          geodesic: true,
          strokeColor: poly.color,
          strokeOpacity: 0.35,
          strokeWeight: 2
      });

    polyline.setMap(map);

    return polyline;
    });

    setPolylines(createdPolylines);

    return () => {
      createdPolylines.forEach(polyline => polyline.setMap(null));
    };
  }, [map,polylinePath]);
  

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
            {selected.summary}
          </h2>
          <p>
          {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
          </p>
          <p>Distance: {leg.distance?.text}</p>
          <p>Estimated Arrival Time: {leg.duration?.text}</p>
  
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

function MapLegend() {
  return (
    <div style={{
      position: 'absolute', 
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000 
    }}>
      <h4>Traffic Conditions</h4>
      <div><span style={{ height: '10px', width: '20px', backgroundColor: '#1FE000', display: 'inline-block' }}></span> Smooth Traffic</div>
      <div><span style={{ height: '10px', width: '20px', backgroundColor: '#FF0000', display: 'inline-block' }}></span> Heavy Traffic</div>
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