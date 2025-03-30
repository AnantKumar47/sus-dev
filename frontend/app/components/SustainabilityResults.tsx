'use client';

import React from 'react';

interface SustainabilityProps {
  analysisResult?: any;
}

const SustainabilityResults: React.FC<SustainabilityProps> = ({ analysisResult }) => {
  // Default mock data to always show
  const defaultData = {
    status: 'success',
    message: 'Analysis complete',
    data: {
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
        },
        {
          title: "Implement Rainwater Harvesting",
          description: "Install systems on commercial buildings to collect and reuse rainwater",
          potential_impact: "Medium",
          implementation_cost: "Medium"
        },
        {
          title: "Promote Green Transportation",
          description: "Develop dedicated bicycle lanes and expand electric vehicle charging stations",
          potential_impact: "High",
          implementation_cost: "Medium"
        }
      ]
    }
  };

  // Use provided analysis result or default
  const result = analysisResult || defaultData;

  return (
    <div id="analysis-results" className="w-full bg-gray-900/80 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-purple-900/50">
      <h2 className="text-3xl font-thin text-white mb-8 text-center tracking-wide">
        Sustainability Analysis Results
      </h2>
      
      {result.status === 'success' ? (
        <div className="space-y-10">
          {/* Sustainability Metrics */}
          <div>
            <h4 className="text-xl font-light text-white mb-5 border-b border-purple-900/30 pb-2">
              Sustainability Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Solar Factor */}
              <div className="p-4 bg-gray-950/80 rounded-md border-l-4 border-amber-500 shadow-md transform transition-transform hover:scale-105">
                <span className="block text-sm font-light text-amber-400">
                  Solar Energy Potential
                </span>
                <span className="text-2xl font-light text-white">
                  {result.data?.sustainability_metrics?.renewable_energy_potential?.solar?.value || 67}%
                </span>
                <span className="ml-2 text-sm text-gray-400 font-extralight">
                  Potential output: {result.data?.sustainability_metrics?.renewable_energy_potential?.solar?.potential_output || "245 MWh/year"}
                </span>
              </div>
              
              {/* Wind Factor */}
              <div className="p-4 bg-gray-950/80 rounded-md border-l-4 border-blue-500 shadow-md transform transition-transform hover:scale-105">
                <span className="block text-sm font-light text-blue-400">
                  Wind Energy Feasibility
                </span>
                <span className="text-2xl font-light text-white">
                  {result.data?.sustainability_metrics?.renewable_energy_potential?.wind?.value || 22}%
                </span>
                <span className="ml-2 text-sm text-gray-400 font-extralight">
                  Potential output: {result.data?.sustainability_metrics?.renewable_energy_potential?.wind?.potential_output || "78 MWh/year"}
                </span>
              </div>
              
              {/* Rainwater Factor */}
              <div className="p-4 bg-gray-950/80 rounded-md border-l-4 border-cyan-500 shadow-md transform transition-transform hover:scale-105">
                <span className="block text-sm font-light text-cyan-400">
                  Rainwater Harvesting Potential
                </span>
                <span className="text-2xl font-light text-white">
                  68%
                </span>
                <span className="ml-2 text-sm text-gray-400 font-extralight">
                  Annual collection: 1.2M liters
                </span>
              </div>
              
              {/* Greenery Factor */}
              <div className="p-4 bg-gray-950/80 rounded-md border-l-4 border-green-500 shadow-md transform transition-transform hover:scale-105">
                <span className="block text-sm font-light text-green-400">
                  Greenery Coverage
                </span>
                <span className="text-2xl font-light text-white">
                  {result.data?.sustainability_metrics?.green_space?.current?.value || 12.3}%
                </span>
                <span className="ml-2 text-sm text-gray-400 font-extralight">
                  Potential increase: {result.data?.sustainability_metrics?.green_space?.potential?.recommendation || "Convert underutilized areas"}
                </span>
              </div>
              
              {/* Wildlife Factor */}
              <div className="p-4 bg-gray-950/80 rounded-md border-l-4 border-purple-500 shadow-md transform transition-transform hover:scale-105">
                <span className="block text-sm font-light text-purple-400">
                  Wildlife Conservation
                </span>
                <span className="text-2xl font-light text-white">
                  Medium
                </span>
                <span className="ml-2 text-sm text-gray-400 font-extralight">
                  Priority species: 3
                </span>
              </div>

              {/* Carbon Emissions Factor */}
              <div className="p-4 bg-gray-950/80 rounded-md border-l-4 border-gray-500 shadow-md transform transition-transform hover:scale-105">
                <span className="block text-sm font-light text-gray-300">
                  Carbon Emissions
                </span>
                <span className="text-2xl font-light text-white">
                  {result.data?.sustainability_metrics?.carbon_emissions?.value || 34.2} {result.data?.sustainability_metrics?.carbon_emissions?.unit || "tons CO2e/year"}
                </span>
                <span className="ml-2 text-sm text-gray-400 font-extralight">
                  Compared to average: {result.data?.sustainability_metrics?.carbon_emissions?.comparison_to_avg || "+5.7%"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          {result.data?.recommendations && (
            <div>
              <h4 className="text-xl font-light text-white mb-5 border-b border-purple-900/30 pb-2">Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.data.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-950/80 rounded-md border-l-4 border-emerald-500 shadow-md transform transition-transform hover:scale-105">
                    <h6 className="text-lg font-light text-emerald-400">{rec.title}</h6>
                    <p className="mt-2 text-sm text-gray-300 font-extralight">{rec.description}</p>
                    <div className="mt-3 flex space-x-3">
                      <span className="text-xs px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full border border-emerald-800/50 font-light">
                        Impact: {rec.potential_impact}
                      </span>
                      <span className="text-xs px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full border border-purple-800/50 font-light">
                        Cost: {rec.implementation_cost}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-red-900/30 rounded-md border border-red-900/50">
          <p className="text-red-400 font-light">
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default SustainabilityResults; 