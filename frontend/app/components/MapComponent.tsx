'use client';

import { useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  FeatureGroup,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Helper component to add draw controls after map is initialized
const DrawControls = ({ featureGroupRef, onCreated }: { featureGroupRef: React.RefObject<any>, onCreated: (e: any) => void }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !featureGroupRef.current) return;
    
    // Need to dynamically import to avoid SSR issues
    const L = require('leaflet');
    require('leaflet-draw');
    
    // Create a drawing control
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        rectangle: true,
        circle: true,
        polygon: false,
        polyline: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: featureGroupRef.current,
      }
    });
    
    // Add the control to the map
    map.addControl(drawControl);
    
    // Handle created events
    map.on(L.Draw.Event.CREATED, (e: any) => {
      // Remove previous layers when adding a new one
      featureGroupRef.current.clearLayers();
      
      // Add the new layer
      featureGroupRef.current.addLayer(e.layer);
      onCreated(e);
    });
    
    // Clean up when component unmounts
    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED);
    };
  }, [map, featureGroupRef, onCreated]);
  
  return null;
};

interface MapComponentProps {
  featureGroupRef: React.RefObject<any>;
  onCreated: (e: any) => void;
}

const MapComponent = ({ featureGroupRef, onCreated }: MapComponentProps) => {
  // Initialize Leaflet when component mounts
  useEffect(() => {
    // Fix Leaflet's icon paths
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }
  }, []);

  return (
    <MapContainer 
      center={[51.505, -0.09]} 
      zoom={13} 
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FeatureGroup ref={featureGroupRef}>
        <DrawControls 
          featureGroupRef={featureGroupRef} 
          onCreated={onCreated} 
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default MapComponent; 