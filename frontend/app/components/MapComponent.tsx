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
        rectangle: {
          shapeOptions: {
            color: '#10b981', // emerald-500
            weight: 3,
            opacity: 0.7,
            fill: true,
            fillColor: '#059669', // emerald-600
            fillOpacity: 0.2,
          }
        },
        circle: {
          shapeOptions: {
            color: '#8b5cf6', // purple-500
            weight: 3,
            opacity: 0.7,
            fill: true,
            fillColor: '#7c3aed', // purple-600
            fillOpacity: 0.2,
          }
        },
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
    
    // Prevent map from resetting view after draw
    map.on('moveend', () => {
      if (typeof window !== 'undefined') {
        const center = map.getCenter();
        const zoom = map.getZoom();
        sessionStorage.setItem('mapView', JSON.stringify({
          center: center,
          zoom: zoom
        }));
      }
    });
    
    // Handle created events
    map.on(L.Draw.Event.CREATED, (e: any) => {
      // Remove previous layers when adding a new one
      featureGroupRef.current.clearLayers();
      
      // Add the new layer
      featureGroupRef.current.addLayer(e.layer);
      
      // Center map on the created shape
      if (e.layerType === 'circle') {
        const center = e.layer.getLatLng();
        map.setView(center, map.getZoom());
      } else if (e.layerType === 'rectangle') {
        const bounds = e.layer.getBounds();
        map.fitBounds(bounds);
      }
      
      // Persist the new view to sessionStorage
      if (typeof window !== 'undefined') {
        const center = map.getCenter();
        const zoom = map.getZoom();
        sessionStorage.setItem('mapView', JSON.stringify({
          center: center,
          zoom: zoom
        }));
      }
      
      onCreated(e);
    });
    
    // Prevent the state change from affecting the map
    map.on('unload', () => {
      // When the map is about to be destroyed (e.g., during component rerenders),
      // save the current view to restore it later
      if (featureGroupRef.current && featureGroupRef.current.getLayers().length > 0) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        sessionStorage.setItem('mapView', JSON.stringify({
          center: center,
          zoom: zoom
        }));
      }
    });
    
    // Prevent the drawing from disappearing when dragging or zooming
    map.on('zoomend', () => {
      if (featureGroupRef.current && featureGroupRef.current.getLayers().length > 0) {
        // Redraw existing layers to make sure they stay visible
        featureGroupRef.current.eachLayer((layer: any) => {
          layer.redraw();
        });
      }
    });
    
    map.on('dragend', () => {
      if (featureGroupRef.current && featureGroupRef.current.getLayers().length > 0) {
        // Redraw existing layers to make sure they stay visible
        featureGroupRef.current.eachLayer((layer: any) => {
          layer.redraw();
        });
      }
    });
    
    // Clean up when component unmounts
    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED);
      map.off('zoomend');
      map.off('dragend');
      map.off('moveend');
    };
  }, [map, featureGroupRef, onCreated]);
  
  return null;
};

interface MapComponentProps {
  featureGroupRef: React.RefObject<any>;
  onCreated: (e: any) => void;
}

// Create a small component to store the map instance
const MapInstanceHandler = () => {
  const map = useMap();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).leafletMap = map;
    }
    
    return () => {
      // Cleanup when component unmounts
      if (typeof window !== 'undefined') {
        (window as any).leafletMap = null;
      }
    };
  }, [map]);
  
  return null;
};

const MapComponent = ({ featureGroupRef, onCreated }: MapComponentProps) => {
  // Initialize Leaflet when component mounts
  useEffect(() => {
    // Clear sessionStorage on actual page refresh, but not during normal app navigation
    if (typeof window !== 'undefined') {
      // Check if this is an actual page refresh
      const isPageRefresh = performance.navigation ? 
        performance.navigation.type === 1 : // For older browsers
        document.referrer === ''; // For modern browsers
        
      if (isPageRefresh) {
        console.log('Page was refreshed, clearing saved map state');
        sessionStorage.removeItem('mapView');
      }
    }
    
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

  // Add an effect to periodically check and restore map view if it changes unexpectedly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let lastMapView = sessionStorage.getItem('mapView');
    
    // Check every second to ensure the map doesn't reset unexpectedly
    const intervalId = setInterval(() => {
      if (!lastMapView) return;
      
      const map = (window as any).leafletMap;
      if (!map) return;
      
      // Only restore if the current view is significantly different from stored view
      // This prevents unnecessary view resets during normal interaction
      try {
        const { center, zoom } = JSON.parse(lastMapView);
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        
        // If distance between current center and saved center is large (more than 0.01 degrees)
        // or zoom has changed drastically, restore the saved view
        const latDiff = Math.abs(currentCenter.lat - center.lat);
        const lngDiff = Math.abs(currentCenter.lng - center.lng);
        const zoomDiff = Math.abs(currentZoom - zoom);
        
        if ((latDiff > 0.05 || lngDiff > 0.05) && zoomDiff > 1) {
          console.log('Map reset detected, restoring previous view');
          map.setView([center.lat, center.lng], zoom);
          
          // Also restore any drawings if they were lost
          if (featureGroupRef.current && featureGroupRef.current.getLayers().length === 0) {
            // Dispatch an event to trigger persistSelectedArea in the parent component
            window.dispatchEvent(new Event('mapViewReset'));
          }
        }
      } catch (error) {
        console.error('Error checking map view:', error);
      }
      
      // Update lastMapView value
      lastMapView = sessionStorage.getItem('mapView');
    }, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [featureGroupRef]);

  // Get initial center from sessionStorage if available
  const getInitialCenter = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedView = sessionStorage.getItem('mapView');
        if (savedView) {
          const { center } = JSON.parse(savedView);
          return [center.lat, center.lng];
        }
      } catch (error) {
        console.error('Error reading saved map view:', error);
      }
    }
    return [12.9716, 77.5946]; // Default: Bangalore, India
  };

  // Get initial zoom from sessionStorage if available
  const getInitialZoom = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedView = sessionStorage.getItem('mapView');
        if (savedView) {
          const { zoom } = JSON.parse(savedView);
          return zoom;
        }
      } catch (error) {
        console.error('Error reading saved map zoom:', error);
      }
    }
    return 13; // Default zoom level
  };

  return (
    <MapContainer 
      center={getInitialCenter() as [number, number]}
      zoom={getInitialZoom()} 
      className="h-full w-full"
      doubleClickZoom={false} // Disable double click zoom to prevent accidental zoom when drawing
    >
      <MapInstanceHandler />
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