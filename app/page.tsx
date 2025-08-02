"use client"
import React, { useState } from "react"
import Image from "next/image"
// A detailed type for the OpenWeatherMap API response
type CityInfo = {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      humidity: number
    }
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    clouds: {
      all: number
    }
    wind: {
      speed: number
    }
    rain?: {
      "3h": number
    }
  }>
  city: {
    id: number
    name: string
    country: string
  }
}

const Home = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<CityInfo[]>([]);
  const [error, setError] = useState("");

  const handleCity = (e:React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.currentTarget.value.trim());
  }

  const handleAdd = async () => {
    const API_KEY = `85475c4801b5229c4f9e9f96891d034f`;

    // Check for an empty city name first.
    if (!city) {
      setError("Please enter the city name first.");
      return;
    }
    
    // Check for a duplicate city.
    const isDublicateCity = weatherData.some((item) => (item.city.name.toLowerCase() === city.toLowerCase()));
    if (isDublicateCity) {
      setError(`'${city}' is already in the list.`);
      return;
    }

    try {
      setError(""); // Clear previous errors.
      
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
      if (!res.ok) {
        const status = res.status;
        throw new Error(`failed to fetch status:${status}`);
      }
      
      const data: CityInfo = await res.json();
      
      if (data) {
        setWeatherData([...weatherData, data]);
      }
      
      // Clear the input field *after* a successful fetch.
      setCity("");
      
    } catch (err:unknown) {
      if(err instanceof Error){
        setError(`Error fetching data. Please try again or check the city name.`);
      }
      
    }
  }

  const handleDel=(id:number)=>{
      const updatedList=weatherData.filter((item)=>item.city.id !==id);
      setWeatherData(updatedList)
  }

  return (
    <div>
      <div className="container">
        <input type="text" className="input-field" placeholder="Enter your city name here..."value={city} onChange={handleCity}/>
        <input type="button" className="add-btn" value="Add" onClick={handleAdd}/>
      </div>

      <hr className="separator-line" />

      <div>
        {error && <p className="text-center text-[1.2rem] bg-red-800 mx-auto w-sm mt-4 text-white animate-bounce rounded-[1rem]">{error}</p>}
        {weatherData.length === 0 ? (
          <p className="text-center text-[1.2rem] bg-red-800 mx-auto w-sm mt-4 text-white animate-bounce rounded-[1rem]">No cities added yet!</p>
        ) : (
          <div className="weather-cards-container">
            {
            weatherData.map((row) => (
              <div key={row.city.id} className="weather-card">
                <h2>{row.city.name}</h2>
                <p><strong>Country:</strong> <span>{row.city.country}</span></p>
                <p>
                  <strong>Temperature:</strong>
                  <span className="temperature"> {(row.list[0].main.temp).toFixed(1)}°C</span>
                </p>
                <p>
                  <strong>Wind Speed:</strong>
                  <span className="wind-speed"> {row.list[0].wind.speed} m/s</span>
                </p>
                <p className="weather-description">
                  <strong>Condition:</strong> <span>{row.list[0].weather[0].description}</span>
                </p>
                <p>
                  <Image src={`https://openweathermap.org/img/wn/${row.list[0].weather[0].icon}@2x.png`} width={80} height={80} alt={row.list[0].weather[0].description} />
                </p>
                <input type="button" className="del-btn" value="X" onClick={()=>handleDel(row.city.id)}/>
              </div>   
            ))

            }
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;