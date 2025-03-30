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
  
  // Check for page refresh on component mount to clear any selections
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if this is an actual page refresh
      const isPageRefresh = performance.navigation ? 
        performance.navigation.type === 1 : // For older browsers
        document.referrer === '';
        
      if (isPageRefresh) {
        console.log('Page was refreshed, clearing selection state');
        setSelection(null);
        setAnalysisResult(null);
        
        // Also clear any LocalStorage/SessionStorage related to selections
        localStorage.removeItem('lastSelection');
      }
    }
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

    // Save current map view to maintain focus on this area
    if (typeof window !== 'undefined' && (window as any).leafletMap) {
      const map = (window as any).leafletMap;
      sessionStorage.setItem('mapView', JSON.stringify({
        center: map.getCenter(),
        zoom: map.getZoom()
      }));
    }
  };
  
  const handleAnalyzeClick = async () => {
    if (!selection) {
      alert('Please select an area on the map first.');
      return;
    }
    
    setIsAnalyzing(true);
    
    // Save current map view before doing anything else
    if (typeof window !== 'undefined' && (window as any).leafletMap) {
      const map = (window as any).leafletMap;
      const currentView = {
        center: map.getCenter(),
        zoom: map.getZoom()
      };
      sessionStorage.setItem('mapView', JSON.stringify(currentView));
      console.log('Saved map view before analysis:', currentView);
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // For development, if the API is not working, use mock data
      console.log("api = ", apiUrl)
      let data;
      try {
        const response = await fetch(`${apiUrl}/getall`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: selection.coordinates.bounds[0][0],
            longitude: selection.coordinates.bounds[0][1]

          }),
        });
        console.log("coor",  selection)
        console.log("response =",response)
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        data = await response.json();
        console.log("data =",data)
      } catch (fetchError) {
        console.warn('API fetch failed, using mock data instead:', fetchError);
        // Use mock data as fallback for development
        data = {
          status: 'success',
          message: 'Analysis complete (MOCK DATA)',
          data: {
            area_type: selection.type,
            coordinates: selection.coordinates,
            sustainability_metrics: {
              carbon_emissions: {
                value: 34.2,
                unit: "tons CO2e/year",
                comparison_to_avg: "+5.7%"
              },
              renewable_energy_potential: {
                solar: {
                  value: 67,
                  unit: "percent",
                  potential_output: "245 MWh/year"
                },
                wind: {
                  value: 22,
                  unit: "percent",
                  potential_output: "78 MWh/year"
                }
              },
              green_space: {
                current: {
                  value: 12.3,
                  unit: "percent"
                },
                potential: {
                  value: 23.5,
                  unit: "percent",
                  recommendation: "Convert underutilized areas to green spaces"
                }
              }
            },
            recommendations: [
              {
                title: "Increase Urban Tree Coverage",
                description: "Plant native trees along main streets to improve air quality and reduce heat",
                potential_impact: "High",
                implementation_cost: "Medium"
              },
              {
                title: "Install Solar Panels",
                description: "Identified 12 buildings suitable for rooftop solar installation",
                potential_impact: "Medium",
                implementation_cost: "High"
              }
            ]
          }
        };
      }
      
      // First, ensure selection is persisted before ANY state changes
      persistSelectedArea();
      
      // Now set the analysis result WITHOUT clearing existing selection
      setAnalysisResult(data);
      
      // After analysis, trigger the same function that handles snap scrolling
      if (typeof window !== 'undefined') {
        // Simple approach: just scroll to section index 2 (the third section)
        try {
          // This simulates clicking the third dot navigation
          const event = new CustomEvent('scrollToSection', { detail: 2 });
          window.dispatchEvent(event);
          
          // Fallback approach if custom event doesn't work
          setTimeout(() => {
            const sections = document.querySelectorAll('.snap-section');
            if (sections && sections.length > 2) {
              sections[2].scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } catch (e) {
          console.error('Error scrolling to section:', e);
        }
      }
      
      // Add multiple checks to ensure the map doesn't reset
      // Check immediately after state change
      persistSelectedArea();
      
      // Then check again after a delay
      setTimeout(() => {
        if (selection) {
          persistSelectedArea();
          console.log('Persistence check after timeout');
        }
      }, 500);
      
      // And one more time after a longer delay (for Next.js state rehydration)
      setTimeout(() => {
        if (selection) {
          persistSelectedArea();
          console.log('Final persistence check');
        }
      }, 2000);
      
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

  // Add or update the persistSelectedArea function to be more robust
  const persistSelectedArea = () => {
    if (!featureGroupRef.current || !selection) return;

    // If there are no existing layers but we have a selection, we should redraw it
    if (featureGroupRef.current.getLayers().length === 0) {
      // We need to redraw the selection because it may have been lost on map rerender
      const L = require('leaflet');
      
      if (selection.type === 'circle') {
        const { center, radius } = selection.coordinates;
        const circle = L.circle([center[0], center[1]], {
          radius: radius,
          color: '#8b5cf6',
          fillColor: '#7c3aed',
          fillOpacity: 0.2,
          weight: 3,
          opacity: 0.7
        });
        
        featureGroupRef.current.addLayer(circle);
        
        // Center map on the selection if window is available
        if (typeof window !== 'undefined' && (window as any).leafletMap) {
          const map = (window as any).leafletMap;
          map.setView([center[0], center[1]], map.getZoom());
        }
      } else if (selection.type === 'rectangle') {
        const { bounds } = selection.coordinates;
        const rectangle = L.rectangle([
          [bounds[0][0], bounds[0][1]],
          [bounds[1][0], bounds[1][1]]
        ], {
          color: '#10b981',
          fillColor: '#059669',
          fillOpacity: 0.2,
          weight: 3,
          opacity: 0.7
        });
        
        featureGroupRef.current.addLayer(rectangle);
        
        // Fit map to the rectangle bounds if window is available
        if (typeof window !== 'undefined' && (window as any).leafletMap) {
          const map = (window as any).leafletMap;
          map.fitBounds([
            [bounds[0][0], bounds[0][1]],
            [bounds[1][0], bounds[1][1]]
          ]);
        }
      }
    } else {
      // If layers exist, make sure the map is still centered on them
      const layers = featureGroupRef.current.getLayers();
      if (layers.length > 0) {
        const layer = layers[0];
        if (typeof window !== 'undefined' && (window as any).leafletMap) {
          const map = (window as any).leafletMap;
          
          if (selection.type === 'circle') {
            const { center } = selection.coordinates;
            map.setView([center[0], center[1]], map.getZoom());
          } else if (selection.type === 'rectangle') {
            const { bounds } = selection.coordinates;
            map.fitBounds([
              [bounds[0][0], bounds[0][1]],
              [bounds[1][0], bounds[1][1]]
            ]);
          }
        }
      }
    }
  };

  // Add this useEffect hook to restore map view on component mount
  useEffect(() => {
    // Restore saved map view when component mounts
    if (typeof window !== 'undefined' && (window as any).leafletMap) {
      try {
        const savedView = sessionStorage.getItem('mapView');
        if (savedView) {
          const { center, zoom } = JSON.parse(savedView);
          const map = (window as any).leafletMap;
          setTimeout(() => {
            map.setView([center.lat, center.lng], zoom);
          }, 100); // Small delay to ensure map is ready
        }
      } catch (error) {
        console.error('Error restoring map view:', error);
      }
    }
  }, []);

  // Add this useEffect hook to ensure drawings persist
  useEffect(() => {
    // Ensure the selection stays rendered when component updates
    if (selection) {
      persistSelectedArea();
    }
  }, [selection]);

  // Add listener for mapViewReset event
  useEffect(() => {
    const handleMapViewReset = () => {
      console.log('Map view reset event received');
      if (selection) {
        persistSelectedArea();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mapViewReset', handleMapViewReset);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mapViewReset', handleMapViewReset);
      }
    };
  }, [selection]);

  const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-950/80">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-400 text-sm font-light">Loading Map</span>
          </div>
          <svg className="animate-spin-slow w-full h-full" viewBox="0 0 100 100">
            <circle 
              className="opacity-20" 
              cx="50" cy="50" r="40" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round"
              stroke="#10b981" 
            />
            <circle 
              className="opacity-80" 
              cx="50" cy="50" r="40" 
              strokeWidth="6" 
              fill="none" 
              strokeDasharray="60 180"
              strokeLinecap="round"
              stroke="#10b981" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-emerald-500/20 animate-pulse-slow blur-md"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-400 font-extralight text-center max-w-xs">
          Preparing interactive map for sustainability analysis
        </p>
      </div>
    )
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 relative h-[60vh] lg:h-[80vh] z-0 rounded-lg overflow-hidden shadow-lg">
          <MapWithNoSSR 
            featureGroupRef={featureGroupRef}
            onCreated={handleCreated}
            key={selection ? `${selection.type}-${JSON.stringify(selection.coordinates)}` : 'no-selection'}
          />
        </div>
        
        <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-purple-900/50">
          <h3 className="text-xl font-light text-white mb-4">
            Area Selection
          </h3>
          
          <div className="mb-6 p-4 bg-gray-950/80 rounded-md border border-purple-900/30">
            <h4 className="text-sm font-light text-emerald-400 mb-2">
              Selected Coordinates
            </h4>
            <p className="text-gray-300 break-words font-light">
              {formatCoordinates()}
            </p>
          </div>
          
          <button
            onClick={handleAnalyzeClick}
            disabled={!selection || isAnalyzing}
            className={`w-full py-3 px-6 rounded-md font-light
              ${!selection || isAnalyzing 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-800/80 to-purple-800/80 text-white hover:from-emerald-700/80 hover:to-purple-700/80'
              } transition-colors`}
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center">
                <div className="relative w-5 h-5 mr-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400 opacity-40 animate-ping"></div>
                  <div className="absolute inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500"></div>
                </div>
                <span>Analyzing area...</span>
              </div>
            ) : 'Analyze Area'}
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-950/80 backdrop-blur-sm border-t border-purple-900/30 py-4 px-4 sm:px-6 lg:px-8 mt-8 rounded-lg">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-gray-500 font-light">
            © CoffeeOverflow 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MapSelectionComponent; 