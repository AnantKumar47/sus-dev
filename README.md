# Sustainability AI Platform

A sustainability-focused AI platform that provides actionable insights for urban planning.

## Project Structure

This project consists of:
- **Frontend**: Next.js with TypeScript and TailwindCSS
- **Backend**: FastAPI with CORS support
- **Container Support**: Docker setup for both services

## Features

- **Dashboard**: Overview of key sustainability metrics
- **Interactive Map**: Select urban areas and analyze them for sustainability metrics
- **API Integration**: RESTful API with endpoints for data analysis
- **Responsive UI**: Modern interface that works on all device sizes

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.10+ 
- Docker and Docker Compose (optional, for containerized deployment)

### Development Setup

#### Backend (FastAPI)

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```
   uvicorn main:app --reload
   ```

5. The API will be available at [http://localhost:8000](http://localhost:8000)
   - Swagger UI documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. The frontend will be available at [http://localhost:3000](http://localhost:3000)

### Docker Deployment

To run the entire stack using Docker:

1. From the project root, build and start the containers:
   ```
   docker-compose up -d
   ```

2. The services will be available at:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:8000](http://localhost:8000)

3. To stop the containers:
   ```
   docker-compose down
   ```

## API Routes

- `/test` - Test endpoint that returns sample sustainability metrics
- `/analyze` - Analyzes a geographical area and returns sustainability insights

## Map Feature

The interactive map feature allows users to:

1. Select an area using either a circle or rectangle tool
2. View the coordinates of the selected area
3. Analyze the area for sustainability metrics
4. View detailed recommendations based on the analysis

### Technologies Used
- React Leaflet for map rendering
- Leaflet Draw for area selection tools
- TailwindCSS for styling
- FastAPI backend for analysis

## Project Features

- **Modern UI**: Clean, responsive interface built with TailwindCSS
- **Type Safety**: TypeScript for enhanced developer experience
- **API Integration**: Frontend-backend communication with CORS support
- **Containerization**: Docker setup for consistent deployment
- **Scalable Architecture**: Structured to allow for easy expansion of features 