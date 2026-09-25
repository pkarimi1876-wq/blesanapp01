
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

// =====================================================
// شوێنی بڵەسەن
// ابوالحسن / بڵەسەن - بانە - کوردستان - ئێران
// کۆئۆردینات:
// Latitude  = 35.9942
// Longitude = 45.6600
// =====================================================

const BLESAN_LOCATION = {
  latitude: 35.9942,
  longitude: 45.66,
  name: "بڵەسەن",
  subtitle: "ابوالحسن، بانە، کوردستان، ئێران",
};

// =====================================================
// Weather Code
// =====================================================

const getWeatherInfo = (code) => {
  const weatherCode = Number(code);

  if (weatherCode === 0) {
    return {
      title: "ئاسمان ڕوونە",
      icon: "weather-sunny",
      color: "#f59e0b",
    };
  }

  if ([1, 2].includes(weatherCode)) {
    return {
      title: "زۆرتر ڕوونە",
      icon: "weather-partly-cloudy",
      color: "#f59e0b",
    };
  }

  if (weatherCode === 3) {
    return {
      title: "هەورییە",
      icon: "weather-cloudy",
      color: "#94a3b8",
    };
  }

  if ([45, 48].includes(weatherCode)) {
    return {
      title: "تەم",
      icon: "weather-fog",
      color: "#94a3b8",
    };
  }

  if ([51, 53, 55].includes(weatherCode)) {
    return {
      title: "بارانی سووک",
      icon: "weather-rainy",
      color: "#38bdf8",
    };
  }

  if ([56, 57].includes(weatherCode)) {
    return {
      title: "سەهۆڵبارانی سووک",
      icon: "weather-snowy-rainy",
      color: "#38bdf8",
    };
  }

  if ([61, 63, 65].includes(weatherCode)) {
    return {
      title: "باران",
      icon: "weather-pouring",
      color: "#38bdf8",
    };
  }

  if ([66, 67].includes(weatherCode)) {
    return {
      title: "بارانی سارد",
      icon: "weather-snowy-rainy",
      color: "#38bdf8",
    };
  }

  if ([71, 73, 75, 77].includes(weatherCode)) {
    return {
      title: "بەفر",
      icon: "weather-snowy",
      color: "#e2e8f0",
    };
  }

  if ([80, 81, 82].includes(weatherCode)) {
    return {
      title: "رەشەباران",
      icon: "weather-pouring",
      color: "#38bdf8",
    };
  }

  if ([85, 86].includes(weatherCode)) {
    return {
      title: "بارینی بەفر",
      icon: "weather-snowy-heavy",
      color: "#e2e8f0",
    };
  }

  if ([95].includes(weatherCode)) {
    return {
      title: "گەڕمەشە",
      icon: "weather-lightning",
      color: "#f59e0b",
    };
  }

  if ([96, 99].includes(weatherCode)) {
    return {
      title: "گەڕمەشە و تەرز",
      icon: "weather-lightning-rainy",
      color: "#f59e0b",
    };
  }

  return {
    title: "کەشناسی",
    icon: "weather-partly-cloudy",
    color: "#f59e0b",
  };
};

// =====================================================
// Kurdish Digits
// =====================================================

const toKurdishDigits = (value) => {
  return String(value).replace(
    /[0-9]/g,
    (digit) => "٠١٢٣٤٥٦٧٨٩"[digit]
  );
};

// =====================================================
// Format Date
// =====================================================

const formatDay = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("ku-IQ", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return dateString;
  }
};

// =====================================================
// Format Time
// =====================================================

const formatTime = (value) => {
  if (!value) return "";

  const match = String(value).match(
    /T(\d{2}):(\d{2})/
  );

  if (!match) return "";

  return `${toKurdishDigits(
    match[1]
  )}:${toKurdishDigits(match[2])}`;
};

// =====================================================
// Weather Screen
// =====================================================

export default function WeatherScreen({
  navigation,
}) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // Fetch Weather
  // =====================================================

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${BLESAN_LOCATION.latitude}` +
        `&longitude=${BLESAN_LOCATION.longitude}` +
        "&current=" +
        [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "weather_code",
          "wind_speed_10m",
          "wind_direction_10m",
          "cloud_cover",
        ].join(",") +
        "&daily=" +
        [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "apparent_temperature_max",
          "apparent_temperature_min",
          "sunrise",
          "sunset",
          "precipitation_sum",
          "precipitation_probability_max",
          "wind_speed_10m_max",
        ].join(",") +
        "&timezone=auto" +
        "&forecast_days=7";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Weather API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data?.current || !data?.daily) {
        throw new Error(
          "داتای کەشناسی تەواو نییە."
        );
      }

      setWeather(data);
    } catch (err) {
      console.log("WEATHER ERROR:", err);

      setError(
        err?.message ||
          "نەتوانرا زانیاری کەشناسی وەربگیرێت."
      );

      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // Initial + Auto Refresh
  // =====================================================

  useEffect(() => {
    fetchWeather();

    const interval = setInterval(() => {
      fetchWeather();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchWeather]);

  // =====================================================
  // Loading
  // =====================================================

  if (loading && !weather) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <ActivityIndicator
            size="large"
            color="#f59e0b"
          />

          <Text style={styles.loadingText}>
            کەشناسی بڵەسەن دەهێنرێت...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // Error
  // =====================================================

  if (error && !weather) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <MaterialCommunityIcons
            name="weather-cloudy-alert"
            size={52}
            color="#f59e0b"
          />

          <Text style={styles.errorTitle}>
            کێشەیەک ڕوویدا
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchWeather}
            activeOpacity={0.85}
          >
            <Ionicons
              name="refresh"
              size={18}
              color="#0b1329"
            />

            <Text style={styles.retryButtonText}>
              دووبارە هەوڵبدەوە
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#f59e0b"
            />

            <Text style={styles.backButtonText}>
              گەڕانەوە
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = weather?.current;
  const daily = weather?.daily;

  const currentInfo = getWeatherInfo(
    current?.weather_code
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =================================================
            Header
        ================================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-forward"
              size={22}
              color="#f59e0b"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>
              کەشناسی بڵەسەن
            </Text>

            <Text style={styles.headerSubtitle}>
              {BLESAN_LOCATION.subtitle}
            </Text>
          </View>

          <MaterialCommunityIcons
            name="weather-partly-cloudy"
            size={32}
            color="#f59e0b"
          />
        </View>

        {/* =================================================
            Location Card
        ================================================= */}

        <View style={styles.locationCard}>
          <View style={styles.locationIconBox}>
            <Ionicons
              name="location"
              size={25}
              color="#f59e0b"
            />
          </View>

          <View style={styles.locationTextBox}>
            <Text style={styles.locationTitle}>
              {BLESAN_LOCATION.name}
            </Text>

            <Text style={styles.locationSubtitle}>
              {BLESAN_LOCATION.subtitle}
            </Text>
          </View>
        </View>

        {/* =================================================
            Current Weather
        ================================================= */}

        <View style={styles.currentCard}>
          <Text style={styles.currentLabel}>
            کەشناسی ئێستا
          </Text>

          <View style={styles.currentMain}>
            <MaterialCommunityIcons
              name={currentInfo.icon}
              size={76}
              color={currentInfo.color}
            />

            <View style={styles.temperatureBox}>
              <Text style={styles.temperature}>
                {toKurdishDigits(
                  Math.round(
                    Number(current?.temperature_2m || 0)
                  )
                )}
                °
              </Text>

              <Text style={styles.condition}>
                {currentInfo.title}
              </Text>
            </View>
          </View>

          <Text style={styles.apparentText}>
            هەستی پێکراو:
            {" "}
            {toKurdishDigits(
              Math.round(
                Number(
                  current?.apparent_temperature || 0
                )
              )
            )}
            °
          </Text>
        </View>

        {/* =================================================
            Details
        ================================================= */}

        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <MaterialCommunityIcons
              name="water-percent"
              size={26}
              color="#38bdf8"
            />

            <Text style={styles.detailValue}>
              {toKurdishDigits(
                Math.round(
                  Number(
                    current?.relative_humidity_2m || 0
                  )
                )
              )}
              %
            </Text>

            <Text style={styles.detailLabel}>
              شێ
            </Text>
          </View>

          <View style={styles.detailCard}>
            <MaterialCommunityIcons
              name="weather-windy"
              size={26}
              color="#a5b4fc"
            />

            <Text style={styles.detailValue}>
              {toKurdishDigits(
                Math.round(
                  Number(
                    current?.wind_speed_10m || 0
                  )
                )
              )}
              {" "}
              km/h
            </Text>

            <Text style={styles.detailLabel}>
              خێرایی با
            </Text>
          </View>

          <View style={styles.detailCard}>
            <MaterialCommunityIcons
              name="weather-rainy"
              size={26}
              color="#38bdf8"
            />

            <Text style={styles.detailValue}>
              {toKurdishDigits(
                Number(
                  current?.precipitation || 0
                ).toFixed(1)
              )}
              {" "}
              mm
            </Text>

            <Text style={styles.detailLabel}>
              باران
            </Text>
          </View>

          <View style={styles.detailCard}>
            <MaterialCommunityIcons
              name="weather-cloudy"
              size={26}
              color="#94a3b8"
            />

            <Text style={styles.detailValue}>
              {toKurdishDigits(
                Math.round(
                  Number(
                    current?.cloud_cover || 0
                  )
                )
              )}
              %
            </Text>

            <Text style={styles.detailLabel}>
              هەور
            </Text>
          </View>
        </View>

        {/* =================================================
            Forecast Header
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            پێشبینی ٧ ڕۆژ
          </Text>

          <Text style={styles.sectionSource}>
            Open-Meteo
          </Text>
        </View>

        {/* =================================================
            7 Day Forecast
        ================================================= */}

        {daily?.time?.map((date, index) => {
          const dayInfo = getWeatherInfo(
            daily.weather_code?.[index]
          );

          const maxTemp =
            daily.temperature_2m_max?.[index];

          const minTemp =
            daily.temperature_2m_min?.[index];

          const rainProbability =
            daily.precipitation_probability_max?.[
              index
            ];

          const sunrise =
            daily.sunrise?.[index];

          const sunset =
            daily.sunset?.[index];

          return (
            <View
              key={date}
              style={styles.forecastCard}
            >
              <View style={styles.forecastDay}>
                <Text style={styles.forecastDate}>
                  {formatDay(date)}
                </Text>

                {index === 0 && (
                  <Text style={styles.todayBadge}>
                    ئەمڕۆ
                  </Text>
                )}
              </View>

              <View style={styles.forecastWeather}>
                <MaterialCommunityIcons
                  name={dayInfo.icon}
                  size={34}
                  color={dayInfo.color}
                />

                <Text style={styles.forecastCondition}>
                  {dayInfo.title}
                </Text>
              </View>

              <View style={styles.forecastTemps}>
                <Text style={styles.maxTemp}>
                  {toKurdishDigits(
                    Math.round(
                      Number(maxTemp || 0)
                    )
                  )}
                  °
                </Text>

                <Text style={styles.tempSeparator}>
                  /
                </Text>

                <Text style={styles.minTemp}>
                  {toKurdishDigits(
                    Math.round(
                      Number(minTemp || 0)
                    )
                  )}
                  °
                </Text>
              </View>

              <View style={styles.forecastBottom}>
                <View style={styles.forecastInfoItem}>
                  <Ionicons
                    name="rainy-outline"
                    size={15}
                    color="#38bdf8"
                  />

                  <Text style={styles.forecastInfoText}>
                    {toKurdishDigits(
                      Number(
                        rainProbability || 0
                      )
                    )}
                    %
                  </Text>
                </View>

                <View style={styles.forecastInfoItem}>
                  <Ionicons
                    name="sunny-outline"
                    size={15}
                    color="#f59e0b"
                  />

                  <Text style={styles.forecastInfoText}>
                    {formatTime(sunrise)}
                  </Text>
                </View>

                <View style={styles.forecastInfoItem}>
                  <Ionicons
                    name="moon-outline"
                    size={15}
                    color="#a5b4fc"
                  />

                  <Text style={styles.forecastInfoText}>
                    {formatTime(sunset)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* =================================================
            Refresh
        ================================================= */}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchWeather}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#0b1329"
            />
          ) : (
            <Ionicons
              name="refresh"
              size={18}
              color="#0b1329"
            />
          )}

          <Text style={styles.refreshButtonText}>
            نوێکردنەوەی کەشناسی
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          شوێنەکە بەپێی کۆئۆردیناتی بڵەسەن دیاریکراوە.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1329",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // =====================================================
  // Header
  // =====================================================

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#172554",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e3a8a",
  },

  headerTitleBox: {
    flex: 1,
    alignItems: "flex-end",
    marginHorizontal: 12,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
  },

  headerSubtitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },

  // =====================================================
  // Location
  // =====================================================

  locationCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#172554",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    padding: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  locationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0f1b3a",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  locationTextBox: {
    flex: 1,
    alignItems: "flex-end",
  },

  locationTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },

  locationSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },

  // =====================================================
  // Current Weather
  // =====================================================

  currentCard: {
    marginHorizontal: 16,
    backgroundColor: "#172554",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    padding: 20,
    alignItems: "center",
  },

  currentLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 8,
  },

  currentMain: {
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },

  temperatureBox: {
    alignItems: "flex-end",
    marginRight: 18,
  },

  temperature: {
    color: "#fff",
    fontSize: 54,
    fontWeight: "bold",
    lineHeight: 60,
  },

  condition: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
  },

  apparentText: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 10,
  },

  // =====================================================
  // Details
  // =====================================================

  detailsGrid: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  detailCard: {
    width: "48.5%",
    minHeight: 105,
    backgroundColor: "#172554",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },

  detailValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 7,
  },

  detailLabel: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
  },

  // =====================================================
  // Forecast Header
  // =====================================================

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  sectionSource: {
    color: "#64748b",
    fontSize: 10,
  },

  // =====================================================
  // Forecast Card
  // =====================================================

  forecastCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#172554",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    padding: 13,
  },

  forecastDay: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  forecastDate: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
  },

  todayBadge: {
    color: "#0b1329",
    backgroundColor: "#f59e0b",
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  forecastWeather: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  forecastCondition: {
    color: "#cbd5e1",
    fontSize: 11,
    marginRight: 9,
  },

  forecastTemps: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: -28,
    justifyContent: "flex-start",
  },

  maxTemp: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  tempSeparator: {
    color: "#64748b",
    fontSize: 14,
    marginHorizontal: 4,
  },

  minTemp: {
    color: "#94a3b8",
    fontSize: 15,
  },

  forecastBottom: {
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#1e3a8a",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  forecastInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  forecastInfoText: {
    color: "#94a3b8",
    fontSize: 10,
  },

  // =====================================================
  // Buttons
  // =====================================================

  refreshButton: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 48,
    backgroundColor: "#f59e0b",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  refreshButtonText: {
    color: "#0b1329",
    fontSize: 13,
    fontWeight: "bold",
  },

  retryButton: {
    marginTop: 18,
    minHeight: 46,
    paddingHorizontal: 20,
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  retryButtonText: {
    color: "#0b1329",
    fontSize: 13,
    fontWeight: "bold",
  },

  backButton: {
    marginTop: 10,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    backgroundColor: "#172554",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  backButtonText: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "bold",
  },

  // =====================================================
  // Loading / Error
  // =====================================================

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },

  errorTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 14,
  },

  errorText: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },

  footerText: {
    color: "#475569",
    fontSize: 9,
    textAlign: "center",
    marginTop: 15,
    marginHorizontal: 20,
  },
});

