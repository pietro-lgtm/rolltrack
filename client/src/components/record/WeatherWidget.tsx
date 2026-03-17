import { useState } from 'react'
import { Sun, Cloud, CloudRain, Snowflake, Wind, Pencil } from 'lucide-react'
import type { WeatherInfo } from '../../types'

interface WeatherWidgetProps {
  weather: WeatherInfo | null
  onChange: (weather: WeatherInfo) => void
}

const CONDITIONS: {
  value: WeatherInfo['condition']
  icon: React.ElementType
  label: string
}[] = [
  { value: 'sunny', icon: Sun, label: 'Sunny' },
  { value: 'cloudy', icon: Cloud, label: 'Cloudy' },
  { value: 'rainy', icon: CloudRain, label: 'Rainy' },
  { value: 'snowy', icon: Snowflake, label: 'Snowy' },
  { value: 'windy', icon: Wind, label: 'Windy' },
]

export default function WeatherWidget({
  weather,
  onChange,
}: WeatherWidgetProps) {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(weather?.temperature ?? 72)
  const [condition, setCondition] = useState<WeatherInfo['condition']>(
    weather?.condition ?? 'sunny'
  )
  const [humidity, setHumidity] = useState(weather?.humidity ?? 50)

  // Auto-detect mock (simulating geolocation + weather API)
  const handleAutoDetect = () => {
    // Mock weather data
    const mockWeather: WeatherInfo = {
      temperature: 68,
      condition: 'cloudy',
      humidity: 55,
    }
    setTemp(mockWeather.temperature)
    setCondition(mockWeather.condition)
    setHumidity(mockWeather.humidity)
    onChange(mockWeather)
    setEditing(false)
  }

  const handleSave = () => {
    onChange({ temperature: temp, condition, humidity })
    setEditing(false)
  }

  const currentCondition = CONDITIONS.find((c) => c.value === (weather?.condition ?? condition))
  const ConditionIcon = currentCondition?.icon ?? Sun

  if (!editing && weather) {
    return (
      <div className="flex items-center gap-3 bg-navy-800 rounded-xl p-3">
        <ConditionIcon size={24} className="text-yellow-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-white">
              {weather.temperature}&deg;F
            </span>
            <span className="text-gray-500">&middot;</span>
            <span className="text-gray-400 capitalize">
              {weather.condition}
            </span>
            <span className="text-gray-500">&middot;</span>
            <span className="text-gray-400">{weather.humidity}% humidity</span>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-400 hover:bg-navy-700 transition-colors"
        >
          <Pencil size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-navy-800 rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Weather
        </span>
        <button
          onClick={handleAutoDetect}
          className="text-[11px] text-blue-400 font-medium hover:text-blue-300 transition-colors"
        >
          Auto-detect
        </button>
      </div>

      {/* Condition picker */}
      <div className="flex gap-1.5">
        {CONDITIONS.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setCondition(value)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${
              condition === value
                ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40'
                : 'bg-navy-700 text-gray-500 hover:text-gray-400'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Temp + humidity */}
      <div className="flex gap-3">
        <div className="flex-1">
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
            Temp (&deg;F)
          </span>
          <input
            type="number"
            value={temp}
            onChange={(e) => setTemp(parseInt(e.target.value, 10) || 0)}
            className="w-full mt-1 bg-navy-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex-1">
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
            Humidity (%)
          </span>
          <input
            type="number"
            value={humidity}
            onChange={(e) => setHumidity(parseInt(e.target.value, 10) || 0)}
            min={0}
            max={100}
            className="w-full mt-1 bg-navy-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors"
      >
        Save Weather
      </button>
    </div>
  )
}
