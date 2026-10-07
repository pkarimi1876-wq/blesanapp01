import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";


// ======================================================
// 📍 شوێنی بڵەسەن
// ======================================================

const BLESAN_LOCATION = {
  latitude: 35.9942,
  longitude: 45.66,
  name: "بڵەسەن",
  subtitle: "ابوالحسن، بانە، کوردستان، ئێران",
};


// ======================================================
// 🎨 ڕەنگەکانی ئەپ
// ======================================================

const COLORS = {
  background: "#0b1329",
  card: "#172554",
  cardDark: "#101a35",
  border: "#1e3a8a",

  primary: "#f59e0b",
  primaryDark: "#b45309",

  white: "#ffffff",
  text: "#f8fafc",
  muted: "#9ca3af",
  muted2: "#64748b",

  blue: "#38bdf8",
  green: "#22c55e",
  red: "#ef4444",
};


// ======================================================
// 🔢 گۆڕینی ژمارە بۆ ژمارەی کوردی
// ======================================================

const toKurdishNumbers = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/0/g, "٠")
    .replace(/1/g, "١")
    .replace(/2/g, "٢")
    .replace(/3/g, "٣")
    .replace(/4/g, "٤")
    .replace(/5/g, "٥")
    .replace(/6/g, "٦")
    .replace(/7/g, "٧")
    .replace(/8/g, "٨")
    .replace(/9/g, "٩");
};


// ======================================================
// 📅 ناوی ڕۆژەکان بە کوردی
// JavaScript:
// 0 = یەکشەممە
// 1 = دووشەممە
// 2 = سێشەممە
// 3 = چوارشەممە
// 4 = پێنجشەممە
// 5 = هەینی
// 6 = شەممە
// ======================================================

const KURDISH_DAYS = [
  "یەکشەممە",
  "دووشەممە",
  "سێشەممە",
  "چوارشەممە",
  "پێنجشەممە",
  "هەینی",
  "شەممە",
];


// ======================================================
// 📆 دەرهێنانی ناوی ڕۆژ لە Date
// ======================================================

const getKurdishDayName = (dateString) => {
  const date = new Date(`${dateString}T12:00:00`);
  return KURDISH_DAYS[date.getDay()];
};


// ======================================================
// 📆 ناوی مانگەکان
// ======================================================
const KURDISH_MONTHS = [
  "به‌هار",
  "نه‌ورۆز (خاکه‌لێوه‌)",
  "گوڵان (بانه‌مه‌ڕ)",
  "جۆزه‌ردان",
  "هاوین",
  "پووشپه‌ڕ",
  "گه‌لاوێژ",
  "خه‌رمانان",
  "پاییز",
  "ڕه‌زبه‌ر",
  "گه‌ڵارێزان",
  "سه‌رماوه‌ز",
  "زستان",
  "به‌فرانبار",
  "ڕێبه‌ندان",
  "ڕه‌شه‌مێ",
];

// ======================================================
// 📅 بەرواری کوردی بۆ پیشاندان
// ======================================================

const formatKurdishDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  const day = toKurdishNumbers(date.getDate());
  const month = KURDISH_MONTHS[date.getMonth()];
  const year = toKurdishNumbers(date.getFullYear());

  return `${day}ی ${month}ی ${year}`;
};


// ======================================================
// 🌤️ Weather Code ـەکانی Open-Meteo
// ======================================================

const getWeatherInfo = (code) => {
  switch (code) {
    case 0:
      return {
        title: "ئاسمان ڕوونە",
        icon: "weather-sunny",
        color: "#facc15",
      };

    case 1:
      return {
        title: "زۆر کەم هەورە",
        icon: "weather-sunny",
        color: "#facc15",
      };

    case 2:
      return {
        title: "هەوری کەمە",
        icon: "weather-partly-cloudy",
        color: "#fbbf24",
      };

    case 3:
      return {
        title: "هەوری زۆرە",
        icon: "weather-cloudy",
        color: "#cbd5e1",
      };

    case 45:
    case 48:
      return {
        title: "تەمی هەیە",
        icon: "weather-fog",
        color: "#94a3b8",
      };

    case 51:
    case 53:
    case 55:
      return {
        title: "بارانی سووک",
        icon: "weather-rainy",
        color: "#38bdf8",
      };

    case 56:
    case 57:
      return {
        title: "بارانی سارد",
        icon: "weather-rainy",
        color: "#38bdf8",
      };

    case 61:
    case 63:
    case 65:
      return {
        title: "باران",
        icon: "weather-pouring",
        color: "#0ea5e9",
      };

    case 66:
    case 67:
      return {
        title: "بارانی سارد",
        icon: "weather-pouring",
        color: "#38bdf8",
      };

    case 71:
    case 73:
    case 75:
      return {
        title: "بەفر",
        icon: "weather-snowy",
        color: "#e0f2fe",
      };

    case 77:
      return {
        title: "دەنکە بەفر",
        icon: "snowflake",
        color: "#bae6fd",
      };

    case 80:
    case 81:
    case 82:
      return {
        title: "ڕەشەبا و باران",
        icon: "weather-pouring",
        color: "#38bdf8",
      };

    case 85:
    case 86:
      return {
        title: "ڕەشەبا و بەفر",
        icon: "weather-snowy-heavy",
        color: "#e0f2fe",
      };

    case 95:
      return {
        title: "زریان",
        icon: "weather-lightning",
        color: "#facc15",
      };

    case 96:
    case 99:
      return {
        title: "زریان و تگر",
        icon: "weather-lightning-rainy",
        color: "#facc15",
      };

    default:
      return {
        title: "کەشوهەوا",
        icon: "weather-cloudy",
        color: "#94a3b8",
      };
  }
};


// ======================================================
// 🕐 کاتی نوێکردنەوە
// ======================================================

const formatTime = (date) => {
  if (!date) return "";

  return date.toLocaleTimeString("ku-IQ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};


// ======================================================
// 🌦️ Weather Screen
// ======================================================

export default function WeatherScreen({ navigation }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDay, setSelectedDay] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);


  // ====================================================
  // 🌐 وەرگرتنی زانیاری کەشوهەوا
  // ====================================================

  const fetchWeather = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${BLESAN_LOCATION.latitude}` +
        `&longitude=${BLESAN_LOCATION.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
        `&timezone=auto` +
        `&forecast_days=7`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("هەڵە لە وەرگرتنی کەشوهەوا");
      }

      const data = await response.json();

      setWeather(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.log("Weather Error:", error);

      Alert.alert(
        "هەڵە",
        "نەتوانرا زانیاری کەشوهەوا وەربگیرێت. تکایە دووبارە هەوڵ بدەرەوە."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // ====================================================
  // 🔄 Load on screen
  // ====================================================

  useEffect(() => {
    fetchWeather();

    // هەر ١٥ خولەک جارێک نوێ دەکرێتەوە
    const interval = setInterval(() => {
      fetchWeather(false);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);


  // ====================================================
  // 🔄 Pull to refresh
  // ====================================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeather(false);
  }, []);


  // ====================================================
  // ⏳ Loading
  // ====================================================

  if (loading && !weather) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="weather-partly-cloudy"
            size={70}
            color={COLORS.primary}
          />

          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />

          <Text style={styles.loadingText}>
            زانیاری کەشوهەوا دەهێنرێت...
          </Text>

          <Text style={styles.loadingSubText}>
            تکایە چاوەڕێ بکە
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ====================================================
  // ❌ No weather
  // ====================================================

  if (!weather) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="weather-cloudy-alert"
            size={70}
            color={COLORS.primary}
          />

          <Text style={styles.errorTitle}>
            زانیاری بەردەست نییە
          </Text>

          <Text style={styles.errorText}>
            نەتوانرا زانیاری کەشوهەوا وەربگیرێت.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchWeather()}
          >
            <Ionicons
              name="refresh"
              size={20}
              color="#000"
            />

            <Text style={styles.retryButtonText}>
              دووبارە هەوڵدانەوە
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  // ====================================================
  // 📊 Current Weather
  // ====================================================

  const current = weather.current;
  const currentInfo = getWeatherInfo(current.weather_code);


  // ====================================================
  // 📅 Daily data
  // ====================================================

  const daily = weather.daily;


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >

        {/* ============================================ */}
        {/* Header */}
        {/* ============================================ */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-forward"
              size={25}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              کەشوهەوای بڵەسەن
            </Text>

            <Text style={styles.headerSubtitle}>
              {BLESAN_LOCATION.subtitle}
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={27}
              color={COLORS.primary}
            />
          </View>

        </View>


        {/* ============================================ */}
        {/* Location Card */}
        {/* ============================================ */}

        <View style={styles.locationCard}>

          <Ionicons
            name="location"
            size={19}
            color={COLORS.primary}
          />

          <View style={styles.locationTextBox}>
            <Text style={styles.locationName}>
              {BLESAN_LOCATION.name}
            </Text>

            <Text style={styles.locationSubtitle}>
              {BLESAN_LOCATION.subtitle}
            </Text>
          </View>

        </View>


        {/* ============================================ */}
        {/* Current Weather */}
        {/* ============================================ */}

        <View style={styles.currentCard}>

          <View style={styles.currentTop}>

            <View style={styles.currentInfo}>

              <Text style={styles.currentLabel}>
                کەشوهەوای ئێستا
              </Text>

              <Text style={styles.currentTemperature}>
                {toKurdishNumbers(
                  Math.round(current.temperature_2m)
                )}
                °
              </Text>

              <Text
                style={[
                  styles.currentDescription,
                  { color: currentInfo.color },
                ]}
              >
                {currentInfo.title}
              </Text>

            </View>

            <View style={styles.currentIconBox}>

              <MaterialCommunityIcons
                name={currentInfo.icon}
                size={88}
                color={currentInfo.color}
              />

            </View>

          </View>


          {/* Feels Like */}

          <View style={styles.feelsLikeRow}>

            <Ionicons
              name="thermometer-outline"
              size={18}
              color={COLORS.muted}
            />

            <Text style={styles.feelsLikeText}>
              هەستی گەرمی:{" "}
              {toKurdishNumbers(
                Math.round(current.apparent_temperature)
              )}
              °
            </Text>

          </View>


          {/* Current Details */}

          <View style={styles.currentDetails}>

            <View style={styles.detailItem}>

              <MaterialCommunityIcons
                name="water-percent"
                size={24}
                color={COLORS.blue}
              />

              <Text style={styles.detailValue}>
                {toKurdishNumbers(
                  current.relative_humidity_2m
                )}
                ٪
              </Text>

              <Text style={styles.detailLabel}>
                ڕطوبەت
              </Text>

            </View>


            <View style={styles.detailItem}>

              <MaterialCommunityIcons
                name="weather-windy"
                size={24}
                color={COLORS.primary}
              />

              <Text style={styles.detailValue}>
                {toKurdishNumbers(
                  Math.round(current.wind_speed_10m)
                )}
                km/h
              </Text>

              <Text style={styles.detailLabel}>
                خێرایی با
              </Text>

            </View>


            <View style={styles.detailItem}>

              <MaterialCommunityIcons
                name="water"
                size={24}
                color={COLORS.blue}
              />

              <Text style={styles.detailValue}>
                {toKurdishNumbers(
                  current.precipitation || 0
                )}
                mm
              </Text>

              <Text style={styles.detailLabel}>
                باران
              </Text>

            </View>

          </View>

        </View>


        {/* ============================================ */}
        {/* Sunrise / Sunset */}
        {/* ============================================ */}

        <View style={styles.sunCard}>

          <View style={styles.sunItem}>

            <MaterialCommunityIcons
              name="weather-sunset-up"
              size={30}
              color="#fbbf24"
            />

            <View>
              <Text style={styles.sunLabel}>
                هەڵاتنی خۆر
              </Text>

              <Text style={styles.sunValue}>
                {daily.sunrise?.[0]
                  ? daily.sunrise[0].slice(11, 16)
                  : "--:--"}
              </Text>
            </View>

          </View>


          <View style={styles.sunDivider} />


          <View style={styles.sunItem}>

            <MaterialCommunityIcons
              name="weather-sunset-down"
              size={30}
              color="#fb923c"
            />

            <View>
              <Text style={styles.sunLabel}>
                ئاوابوونی خۆر
              </Text>

              <Text style={styles.sunValue}>
                {daily.sunset?.[0]
                  ? daily.sunset[0].slice(11, 16)
                  : "--:--"}
              </Text>
            </View>

          </View>

        </View>


        {/* ============================================ */}
        {/* 7 Days */}
        {/* ============================================ */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            پێشبینی ٧ ڕۆژی داهاتوو
          </Text>

          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={23}
            color={COLORS.primary}
          />

        </View>


        <ScrollView
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >

          {daily.time?.map((date, index) => {

            const info = getWeatherInfo(
              daily.weather_code[index]
            );

            const isSelected =
              selectedDay === index;

            return (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardSelected,
                ]}
                onPress={() => setSelectedDay(index)}
                activeOpacity={0.85}
              >

                <Text
                  style={[
                    styles.dayName,
                    isSelected && styles.dayNameSelected,
                  ]}
                >
                  {index === 0
                    ? "ئەمڕۆ"
                    : getKurdishDayName(date)}
                </Text>

                <Text style={styles.dayDate}>
                  {toKurdishNumbers(
                    date.slice(8, 10)
                  )}/
                  {toKurdishNumbers(
                    date.slice(5, 7)
                  )}
                </Text>

                <MaterialCommunityIcons
                  name={info.icon}
                  size={38}
                  color={info.color}
                  style={{ marginVertical: 8 }}
                />

                <Text style={styles.dayMax}>
                  {toKurdishNumbers(
                    Math.round(
                      daily.temperature_2m_max[index]
                    )
                  )}
                  °
                </Text>

                <Text style={styles.dayMin}>
                  {toKurdishNumbers(
                    Math.round(
                      daily.temperature_2m_min[index]
                    )
                  )}
                  °
                </Text>

              </TouchableOpacity>
            );
          })}

        </ScrollView>


        {/* ============================================ */}
        {/* Selected Day Details */}
        {/* ============================================ */}

        <View style={styles.selectedDayCard}>

          <View style={styles.selectedDayHeader}>

            <View style={{ flex: 1 }}>

              <Text style={styles.selectedDayTitle}>
                {selectedDay === 0
                  ? "ئەمڕۆ"
                  : getKurdishDayName(
                      daily.time[selectedDay]
                    )}
              </Text>

              <Text style={styles.selectedDayDate}>
                {formatKurdishDate(
                  daily.time[selectedDay]
                )}
              </Text>

            </View>

            <MaterialCommunityIcons
              name={
                getWeatherInfo(
                  daily.weather_code[selectedDay]
                ).icon
              }
              size={52}
              color={
                getWeatherInfo(
                  daily.weather_code[selectedDay]
                ).color
              }
            />

          </View>


          <View style={styles.selectedDescription}>

            <Text style={styles.selectedDescriptionText}>
              {
                getWeatherInfo(
                  daily.weather_code[selectedDay]
                ).title
              }
            </Text>

          </View>


          <View style={styles.selectedGrid}>

            {/* Max */}

            <View style={styles.selectedItem}>

              <MaterialCommunityIcons
                name="thermometer-high"
                size={25}
                color="#ef4444"
              />

              <Text style={styles.selectedValue}>
                {toKurdishNumbers(
                  Math.round(
                    daily.temperature_2m_max[
                      selectedDay
                    ]
                  )
                )}
                °
              </Text>

              <Text style={styles.selectedLabel}>
                زۆرترین گەرمی
              </Text>

            </View>


            {/* Min */}

            <View style={styles.selectedItem}>

              <MaterialCommunityIcons
                name="thermometer-low"
                size={25}
                color="#38bdf8"
              />

              <Text style={styles.selectedValue}>
                {toKurdishNumbers(
                  Math.round(
                    daily.temperature_2m_min[
                      selectedDay
                    ]
                  )
                )}
                °
              </Text>

              <Text style={styles.selectedLabel}>
                کەمترین گەرمی
              </Text>

            </View>


            {/* Rain Probability */}

            <View style={styles.selectedItem}>

              <MaterialCommunityIcons
                name="weather-rainy"
                size={25}
                color="#38bdf8"
              />

              <Text style={styles.selectedValue}>
                {toKurdishNumbers(
                  daily
                    .precipitation_probability_max[
                      selectedDay
                    ] ?? 0
                )}
                ٪
              </Text>

              <Text style={styles.selectedLabel}>
                ئەگەری باران
              </Text>

            </View>


            {/* Wind */}

            <View style={styles.selectedItem}>

              <MaterialCommunityIcons
                name="weather-windy"
                size={25}
                color={COLORS.primary}
              />

              <Text style={styles.selectedValue}>
                {toKurdishNumbers(
                  Math.round(
                    daily.wind_speed_10m_max[
                      selectedDay
                    ] ?? 0
                  )
                )}
              </Text>

              <Text style={styles.selectedLabel}>
                km/h با
              </Text>

            </View>

          </View>


          {/* Rain Amount */}

          <View style={styles.rainBox}>

            <MaterialCommunityIcons
              name="water-outline"
              size={23}
              color={COLORS.blue}
            />

            <Text style={styles.rainText}>
              کۆی بارانی پێشبینیکراو:{" "}
              {toKurdishNumbers(
                daily.precipitation_sum[
                  selectedDay
                ] ?? 0
              )}{" "}
              mm
            </Text>

          </View>


          {/* Sunrise / Sunset for selected day */}

          <View style={styles.selectedSunRow}>

            <View style={styles.smallSunItem}>

              <MaterialCommunityIcons
                name="weather-sunset-up"
                size={22}
                color="#fbbf24"
              />

              <Text style={styles.smallSunText}>
                هەڵاتن:{" "}
                {daily.sunrise?.[selectedDay]
                  ? daily.sunrise[
                      selectedDay
                    ].slice(11, 16)
                  : "--:--"}
              </Text>

            </View>


            <View style={styles.smallSunItem}>

              <MaterialCommunityIcons
                name="weather-sunset-down"
                size={22}
                color="#fb923c"
              />

              <Text style={styles.smallSunText}>
                ئاوابوون:{" "}
                {daily.sunset?.[selectedDay]
                  ? daily.sunset[
                      selectedDay
                    ].slice(11, 16)
                  : "--:--"}
              </Text>

            </View>

          </View>

        </View>


        {/* ============================================ */}
        {/* Information */}
        {/* ============================================ */}

        <View style={styles.infoCard}>

          <View style={styles.infoHeader}>

            <Ionicons
              name="information-circle-outline"
              size={23}
              color={COLORS.primary}
            />

            <Text style={styles.infoTitle}>
              زانیاری کەشوهەوا
            </Text>

          </View>

          <Text style={styles.infoText}>
            ئەم زانیارییانە بە شێوەی ئۆتۆماتیکی نوێ دەکرێنەوە
            و پێشبینی کەشوهەوا بۆ بڵەسەن پیشان دەدەن.
          </Text>

          <Text style={styles.infoText}>
            داتا وەک پلەی گەرمی، ڕطوبەت، خێرایی با،
            باران و کاتی هەڵاتن و ئاوابوونی خۆر لەخۆ دەگرێت.
          </Text>

        </View>


        {/* ============================================ */}
        {/* Last Updated */}
        {/* ============================================ */}

        <View style={styles.updatedBox}>

          <Ionicons
            name="sync-outline"
            size={15}
            color={COLORS.muted}
          />

          <Text style={styles.updatedText}>
            دوا نوێکردنەوە:{" "}
            {lastUpdated
              ? formatTime(lastUpdated)
              : "--:--"}
          </Text>

        </View>


        {/* ============================================ */}
        {/* Manual Refresh */}
        {/* ============================================ */}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            setRefreshing(true);
            fetchWeather(false);
          }}
          activeOpacity={0.85}
        >

          <Ionicons
            name="refresh"
            size={20}
            color="#000"
          />

          <Text style={styles.refreshButtonText}>
            نوێکردنەوەی کەشوهەوا
          </Text>

        </TouchableOpacity>


        <View style={{ height: 30 }} />

      </ScrollView>
    </SafeAreaView>
  );
}


// ======================================================
// 🎨 Styles
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 20,
  },


  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },


  // Location
  locationCard: {
    marginHorizontal: 16,
    marginBottom: 15,
    padding: 13,
    borderRadius: 15,
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  locationTextBox: {
    flex: 1,
    marginRight: 10,
  },

  locationName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
  },

  locationSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
    textAlign: "right",
  },


  // Current
  currentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  currentTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  currentInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  currentLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 5,
  },

  currentTemperature: {
    color: COLORS.white,
    fontSize: 55,
    fontWeight: "bold",
    lineHeight: 65,
  },

  currentDescription: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },

  currentIconBox: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },

  feelsLikeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 6,
    gap: 6,
  },

  feelsLikeText: {
    color: COLORS.muted,
    fontSize: 12,
  },


  // Details
  currentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  detailItem: {
    flex: 1,
    alignItems: "center",
  },

  detailValue: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 5,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },


  // Sun
  sunCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  sunItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  sunLabel: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "right",
  },

  sunValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 3,
    textAlign: "right",
  },

  sunDivider: {
    width: 1,
    height: 42,
    backgroundColor: COLORS.border,
  },


  // Section
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
  },


  // Days
  daysContainer: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 5,
  },

  dayCard: {
    width: 105,
    minHeight: 160,
    borderRadius: 17,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    paddingVertical: 12,
  },

  dayCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#1d2b52",
    borderWidth: 1.5,
  },

  dayName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },

  dayNameSelected: {
    color: COLORS.primary,
  },

  dayDate: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 3,
  },

  dayMax: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  dayMin: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },


  // Selected Day
  selectedDayCard: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
  },

  selectedDayHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  selectedDayTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
  },

  selectedDayDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
    textAlign: "right",
  },

  selectedDescription: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.cardDark,
  },

  selectedDescriptionText: {
    color: COLORS.primary,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
  },

  selectedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },

  selectedItem: {
    width: "50%",
    alignItems: "center",
    paddingVertical: 12,
  },

  selectedValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },

  selectedLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },

  rainBox: {
    marginTop: 8,
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  rainText: {
    color: COLORS.muted,
    fontSize: 11,
  },

  selectedSunRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  smallSunItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  smallSunText: {
    color: COLORS.muted,
    fontSize: 10,
  },


  // Info
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 15,
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },

  infoHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  infoTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
  },

  infoText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 19,
    textAlign: "right",
    marginBottom: 7,
  },


  // Updated
  updatedBox: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginBottom: 12,
  },

  updatedText: {
    color: COLORS.muted2,
    fontSize: 10,
  },


  // Refresh
  refreshButton: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  refreshButtonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "bold",
  },


  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
  },

  loadingSubText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
  },


  // Error
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },

  errorText: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingHorizontal: 20,
    height: 45,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  retryButtonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "bold",
  },

});
