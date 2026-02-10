import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CloudSun,
  Droplets,
  Wind,
  ThermometerSun,
  AlertTriangle,
  Umbrella,
  Sun,
  CloudRain,
  Cloud,
  Bell,
} from "lucide-react";

const currentWeather = {
  temperature: 28,
  feelsLike: 31,
  humidity: 65,
  windSpeed: 12,
  condition: "Partly Cloudy",
  icon: CloudSun,
  uv: "Moderate",
  visibility: "10 km",
};

const forecast = [
  { day: "Today", high: 32, low: 24, icon: CloudSun, rain: 10 },
  { day: "Tomorrow", high: 30, low: 23, icon: CloudRain, rain: 80 },
  { day: "Wed", high: 28, low: 22, icon: CloudRain, rain: 60 },
  { day: "Thu", high: 29, low: 23, icon: Cloud, rain: 20 },
  { day: "Fri", high: 31, low: 24, icon: Sun, rain: 5 },
  { day: "Sat", high: 33, low: 25, icon: Sun, rain: 0 },
  { day: "Sun", high: 32, low: 24, icon: CloudSun, rain: 15 },
];

const alerts = [
  {
    type: "warning",
    title: "Heavy Rain Expected",
    message:
      "Rain expected tomorrow with 80% probability. Consider harvesting mature crops today.",
    time: "2 hours ago",
  },
  {
    type: "info",
    title: "Irrigation Advisory",
    message:
      "Due to expected rainfall, skip irrigation for the next 2-3 days to prevent waterlogging.",
    time: "5 hours ago",
  },
];

const farmingTips = [
  "Complete pending harvesting before tomorrow's rain",
  "Store harvested grains in dry place",
  "Check drainage systems in your fields",
  "Postpone fertilizer application until after rain",
];

const WeatherAlerts = () => {
  const WeatherIcon = currentWeather.icon;

  return (
    <PageLayout>
      <div className="container-app py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <CloudSun className="h-4 w-4" />
            Weather & Alerts
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Weather Forecast
          </h1>
          <p className="text-lg text-muted-foreground">
            7-day weather forecast with farming-specific alerts and
            recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Weather */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <p className="text-primary-foreground/80 mb-1">
                      Current Weather
                    </p>
                    <div className="flex items-center gap-4">
                      <WeatherIcon className="h-16 w-16 opacity-90" />
                      <div>
                        <div className="text-5xl font-bold">
                          {currentWeather.temperature}°C
                        </div>
                        <p className="text-primary-foreground/80">
                          {currentWeather.condition}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-5 w-5 opacity-80" />
                      <div>
                        <p className="text-sm opacity-80">Feels Like</p>
                        <p className="font-bold">
                          {currentWeather.feelsLike}°C
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 opacity-80" />
                      <div>
                        <p className="text-sm opacity-80">Humidity</p>
                        <p className="font-bold">{currentWeather.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 opacity-80" />
                      <div>
                        <p className="text-sm opacity-80">Wind</p>
                        <p className="font-bold">
                          {currentWeather.windSpeed} km/h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 opacity-80" />
                      <div>
                        <p className="text-sm opacity-80">UV Index</p>
                        <p className="font-bold">{currentWeather.uv}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast */}
              <CardContent className="p-5">
                <h3 className="font-heading font-bold text-foreground mb-4">
                  7-Day Forecast
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {forecast.map((day, index) => {
                    const Icon = day.icon;
                    return (
                      <div
                        key={day.day}
                        className={`text-center p-3 rounded-lg transition-colors ${
                          index === 0 ? "bg-primary/5" : "hover:bg-muted"
                        }`}
                      >
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {day.day}
                        </p>
                        <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-sm">
                          <span className="font-bold text-foreground">
                            {day.high}°
                          </span>
                          <span className="text-muted-foreground">
                            /{day.low}°
                          </span>
                        </div>
                        {day.rain > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-primary">
                            <Umbrella className="h-3 w-3" />
                            {day.rain}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts & Tips */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  Active Alerts
                </h3>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        alert.type === "warning"
                          ? "bg-warning/10 border border-warning/20"
                          : "bg-primary/5 border border-primary/10"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 mt-0.5 shrink-0 ${
                            alert.type === "warning"
                              ? "text-warning"
                              : "text-primary"
                          }`}
                        />
                        <div>
                          <h4 className="font-bold text-foreground text-sm">
                            {alert.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {alert.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Farming Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-5">
                <h3 className="font-heading font-bold text-foreground mb-4">
                  Today's Farming Tips
                </h3>
                <ul className="space-y-3">
                  {farmingTips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full mt-4" size="sm">
                  Get Personalized Tips
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WeatherAlerts;
