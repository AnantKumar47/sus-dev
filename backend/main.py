from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

app = FastAPI(
    title="Sustainability AI Platform API",
    description="API for a sustainability-focused AI platform providing actionable insights for urban planning",
    version="0.1.0"
)

# Configure CORS for development - allows all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - in production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify API connectivity."""
    return {
        "status": "success",
        "message": "Welcome to the Sustainability AI Platform API",
        "data": {
            "key_metrics": [
                {"name": "Carbon Footprint", "value": 28.5, "unit": "tons CO2e/year"},
                {"name": "Energy Efficiency", "value": 72, "unit": "percent"},
                {"name": "Green Space Coverage", "value": 15.3, "unit": "percent"}
            ]
        }
    }

class AreaCoordinates(BaseModel):
    type: str  # "circle" or "rectangle"
    coordinates: Dict[str, Any]  # For flexibility with different selection types

@app.post("/analyze")
async def analyze_area(area_data: AreaCoordinates):
    """Analyze sustainability metrics for a specified geographical area."""
    
    # Here you would normally perform actual analysis based on the area
    # For demo purposes, we'll return simulated results
    
    area_type = area_data.type
    coordinates = area_data.coordinates
    
    # Simulate analysis results (would be generated from actual ML models in production)
    analysis_results = {
        "area_type": area_type,
        "coordinates": coordinates,
        "sustainability_metrics": {
            "carbon_emissions": {
                "value": 34.2,
                "unit": "tons CO2e/year",
                "comparison_to_avg": "+5.7%"
            },
            "renewable_energy_potential": {
                "solar": {
                    "value": 67,
                    "unit": "percent",
                    "potential_output": "245 MWh/year"
                },
                "wind": {
                    "value": 22,
                    "unit": "percent",
                    "potential_output": "78 MWh/year"
                }
            },
            "green_space": {
                "current": {
                    "value": 12.3,
                    "unit": "percent"
                },
                "potential": {
                    "value": 23.5,
                    "unit": "percent",
                    "recommendation": "Convert underutilized areas to green spaces"
                }
            },
            "air_quality": {
                "value": "Moderate",
                "aqi": 63,
                "main_pollutants": ["PM2.5", "NO2"]
            }
        },
        "recommendations": [
            {
                "title": "Increase Urban Tree Coverage",
                "description": "Plant native trees along main streets to improve air quality and reduce urban heat island effect",
                "potential_impact": "High",
                "implementation_cost": "Medium"
            },
            {
                "title": "Install Solar Panels",
                "description": "Identified 12 buildings suitable for rooftop solar installation",
                "potential_impact": "Medium",
                "implementation_cost": "High"
            },
            {
                "title": "Implement Green Infrastructure",
                "description": "Add permeable surfaces and rain gardens to improve stormwater management",
                "potential_impact": "Medium",
                "implementation_cost": "Medium"
            }
        ]
    }
    
    # Simulate a small delay to represent processing time
    import asyncio
    await asyncio.sleep(1.5)
    
    return {
        "status": "success",
        "message": f"Analysis complete for {area_type} area",
        "data": analysis_results
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 