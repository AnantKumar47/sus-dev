'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngBounds, LatLng, DrawEvents } from 'leaflet';

// Define selection area types
interface CircleSelection {
  type: 'circle';
  coordinates: {
    center: [number, number]; // [lat, lng]
    radius: number; // meters
  };
}

interface RectangleSelection {
  type: 'rectangle';
  coordinates: {
    bounds: [[number, number], [number, number]]; // [[lat1, lng1], [lat2, lng2]]
  };
}

type AreaSelection = CircleSelection | RectangleSelection | null;

// Analysis result type
interface AnalysisResult {
  status: string;
  message: string;
  data: any;
}

const MapSelectionComponent = () => {
  const [selection, setSelection] = useState<AreaSelection>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const featureGroupRef = useRef<any>(null);
  
  // Fix Leaflet icons when component mounts
  useEffect(() => {
    // This is needed to solve the missing marker icon issue in Leaflet
    delete (window as any)._leaflet_id;
    
    // Fix Leaflet's icon paths
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  
  // Handle selection creation and updates
  const handleCreated = (e: any) => {
    // Clear previous selections first by clearing the feature group
    if (featureGroupRef.current) {
      const leafletFG = featureGroupRef.current.getLayers();
      if (leafletFG.length > 1) {
        // Keep only the newest selection
        for (let i = 0; i < leafletFG.length - 1; i++) {
          featureGroupRef.current.removeLayer(leafletFG[i]);
        }
      }
    }
    
    const { layerType, layer } = e;
    
    if (layerType === 'circle') {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
      
      setSelection({
        type: 'circle',
        coordinates: {
          center: [center.lat, center.lng],
          radius: radius
        }
      });
    } 
    else if (layerType === 'rectangle') {
      const bounds = layer.getBounds();
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      
      setSelection({
        type: 'rectangle',
        coordinates: {
          bounds: [
            [southWest.lat, southWest.lng],
            [northEast.lat, northEast.lng]
          ]
        }
      });
    }
  };
  
  const handleAnalyzeClick = async () => {
    if (!selection) {
      alert('Please select an area on the map first.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selection.type,
          coordinates: selection.coordinates,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error analyzing area:', error);
      setAnalysisResult({
        status: 'error',
        message: 'Failed to analyze area. Please try again.',
        data: null
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Format coordinates for display
  const formatCoordinates = () => {
    if (!selection) return 'No area selected';
    
    if (selection.type === 'circle') {
      const { center, radius } = selection.coordinates;
      return `Circle at [${center[0].toFixed(4)}, ${center[1].toFixed(4)}] with radius ${radius.toFixed(0)}m`;
    } 
    else if (selection.type === 'rectangle') {
      const { bounds } = selection.coordinates;
      return `Rectangle from [${bounds[0][0].toFixed(4)}, ${bounds[0][1].toFixed(4)}] to [${bounds[1][0].toFixed(4)}, ${bounds[1][1].toFixed(4)}]`;
    }
    
    return 'Unknown selection type';
  };

  const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-800">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
        <p className="ml-2 text-gray-600 dark:text-gray-300">Loading map...</p>
      </div>
    )
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 relative h-[60vh] lg:h-[80vh] z-0 rounded-lg overflow-hidden shadow-lg">
        <MapWithNoSSR 
          featureGroupRef={featureGroupRef}
          onCreated={handleCreated}
        />
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Area Selection
        </h3>
        
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Selected Coordinates
          </h4>
          <p className="text-gray-800 dark:text-gray-200 break-words">
            {formatCoordinates()}
          </p>
        </div>
        
        <button
          onClick={handleAnalyzeClick}
          disabled={!selection || isAnalyzing}
          className={`w-full py-3 px-6 rounded-md text-white font-medium
            ${!selection || isAnalyzing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-700'
            } transition-colors`}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
              Analyzing...
            </div>
          ) : 'Analyze Area'}
        </button>
        
        {analysisResult && (
          <div className="mt-6 overflow-y-auto max-h-[40vh]">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Analysis Results
            </h4>
            
            {analysisResult.status === 'success' ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                  <h5 className="font-medium text-emerald-700 dark:text-emerald-400">
                    {analysisResult.message}
                  </h5>
                </div>
                
                {analysisResult.data?.sustainability_metrics && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300">Key Metrics</h5>
                    
                    {analysisResult.data.sustainability_metrics.carbon_emissions && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Carbon Emissions
                        </span>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                          {analysisResult.data.sustainability_metrics.carbon_emissions.value} {analysisResult.data.sustainability_metrics.carbon_emissions.unit}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {analysisResult.data.sustainability_metrics.carbon_emissions.comparison_to_avg}
                        </span>
                      </div>
                    )}
                    
                    {analysisResult.data.recommendations && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</h5>
                        <ul className="space-y-2">
                          {analysisResult.data.recommendations.map((rec: any, i: number) => (
                            <li key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                              <h6 className="font-medium text-gray-800 dark:text-white">{rec.title}</h6>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{rec.description}</p>
                              <div className="mt-1 flex space-x-3">
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                  Impact: {rec.potential_impact}
                                </span>
                                <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded">
                                  Cost: {rec.implementation_cost}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-red-700 dark:text-red-400">
                  {analysisResult.message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSelectionComponent; 