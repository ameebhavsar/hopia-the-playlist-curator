from fastapi import APIRouter, Query
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# Weather API endpoint
@router.get("/weather")
async def get_weather(city: str = Query("Toronto", description="City to fetch weather for (default:Toronto)")):
    api_key = os.getenv("WEATHER_API_KEY")  # API key from .env file (temp; shift to settings.py)

    # Weather API URL and parameters
    url = "http://api.weatherapi.com/v1/current.json"
    params = {
        "key": api_key,
        "q": city,
        "aqi": "no"
    }

    try:
        async with httpx.AsyncClient() as client:
            # Make async HTTP request to Weather API
            response = await client.get(url, params=params)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            # Grab relevantdata from response
            data = response.json()
            weather_data = {
                "city": city,
                "country": data["location"]["country"],
                "temperature": data["current"]["temp_c"],
                "condition": data["current"]["condition"]["text"],
                "humidity": data["current"]["humidity"],
                "wind_speed": data["current"]["wind_kph"],
                "cloud": data["current"]["cloud"],
                "last_updated": data["current"]["last_updated"]
            }
            return weather_data

    # Handle any HTTP errors or exceptions that occur
    except httpx.HTTPStatusError as e:
        return {"error": f"Weather API error: {e.response.status_code}"}
    except Exception as e:
        return {"error": f"Failed to fetch weather: {str(e)}"}
