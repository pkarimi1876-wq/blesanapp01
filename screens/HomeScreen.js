import React, { useCallback, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import AdBanner from "../Components/AdBanner";
import AdminAccessButton from "../Components/AdminAccesButton.js";
import { supabase } from "../lib/supabase";
// =====================================================
// Home Screen
// =====================================================
export default function HomeScreen({ navigation }) {

  // =====================================================
  // Quick News State
  // =====================================================
  const [quickNews, setQuickNews] = useState(null);

  const [loadingQuickNews, setLoadingQuickNews] =
    useState(true);


  // =====================================================
  // Weather State
  // =====================================================
  const [todayWeather, setTodayWeather] = useState(null);

  const [loadingWeather, setLoadingWeather] =
    useState(true);


  // =====================================================
  // Refresh
  // =====================================================
  const [refreshing, setRefreshing] =
    useState(false);


  // =====================================================
  // Fetch Quick News From Supabase
  // =====================================================
  const fetchQuickNews = async () => {
    try {

      setLoadingQuickNews(true);

      const { data, error } = await supabase
        .from("quick_news")
        .select(
          "id, title, content, news_date, news_type, is_active, created_at"
        )
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        })
        .limit(1);

      if (error) {
        console.log("Quick News Error:", error);
        setQuickNews(null);
        return;
      }

      setQuickNews(data?.[0] || null);

    } catch (error) {

      console.log("Quick News Error:", error);

      setQuickNews(null);

    } finally {

      setLoadingQuickNews(false);

    }
  };


  // =====================================================
  // Fetch Today's Weather
  // =====================================================
  const fetchTodayWeather = async () => {
    try {

      setLoadingWeather(true);

      const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=35.9942" +
        "&longitude=45.66" +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&timezone=auto";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Weather request failed");
      }

      const data = await response.json();

      setTodayWeather(data);

    } catch (error) {

      console.log(
        "Today Weather Error:",
        error
      );

      setTodayWeather(null);

    } finally {

      setLoadingWeather(false);

    }
  };


  // =====================================================
  // Weather Description
  // =====================================================
  const getWeatherDescription = (code) => {

    if (code === 0) {
      return "ئاسمان ڕوونە";
    }

    if (code === 1) {
      return "زۆر کەم هەورە";
    }

    if (code === 2) {
      return "هەوری کەمە";
    }

    if (code === 3) {
      return "هەوری زۆرە";
    }

    if ([45, 48].includes(code)) {
      return "تەمی هەیە";
    }

    if ([51, 53, 55].includes(code)) {
      return "بارانی سووک";
    }

    if ([56, 57].includes(code)) {
      return "بارانی سارد";
    }

    if ([61, 63, 65].includes(code)) {
      return "باران";
    }

    if ([66, 67].includes(code)) {
      return "بارانی سارد";
    }

    if ([71, 73, 75, 77].includes(code)) {
      return "بەفر";
    }

    if ([80, 81, 82].includes(code)) {
      return "ڕەشەبا و باران";
    }

    if ([85, 86].includes(code)) {
      return "ڕەشەبا و بەفر";
    }

    if (code === 95) {
      return "زریان";
    }

    if ([96, 99].includes(code)) {
      return "زریان و تگر";
    }

    return "کەشوهەوا";
  };


  // =====================================================
  // Weather Icon
  // =====================================================
  const getWeatherIcon = (code) => {

    if (code === 0 || code === 1) {
      return "weather-sunny";
    }

    if (code === 2) {
      return "weather-partly-cloudy";
    }

    if (code === 3) {
      return "weather-cloudy";
    }

    if ([45, 48].includes(code)) {
      return "weather-fog";
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return "weather-snowy";
    }

    if ([95, 96, 99].includes(code)) {
      return "weather-lightning-rainy";
    }

    return "weather-rainy";
  };


  // =====================================================
  // Dynamic Quick News Theme
  // =====================================================
  const getQuickNewsStyles = () => {

    const type = quickNews?.news_type;

    if (type === "red") {
      return {
        bg: "#3b1212",
        border: "#7f1d1d",
        text: "#fca5a5",
        accent: "#ef4444",
      };
    }

    if (type === "yellow") {
      return {
        bg: "#3a2e12",
        border: "#854d0e",
        text: "#fef08a",
        accent: "#eab308",
      };
    }

    return {
      bg: "#062c19",
      border: "#14532d",
      text: "#86efac",
      accent: "#22c55e",
    };
  };


  const currentTheme =
    getQuickNewsStyles();


  // =====================================================
  // Focus
  // =====================================================
  useFocusEffect(
    useCallback(() => {

      fetchQuickNews();
      fetchTodayWeather();

    }, [])
  );


  // =====================================================
  // Pull To Refresh
  // =====================================================
  const onRefresh = async () => {

    setRefreshing(true);

    await Promise.all([
      fetchQuickNews(),
      fetchTodayWeather(),
    ]);

    setRefreshing(false);
  };


  // =====================================================
  // Navigation Handler
  // =====================================================
  const navigateTo = (screenName) => {

    const rootNavigation =
      navigation.getParent("root") ||
      navigation.getParent();

    if (rootNavigation) {

      rootNavigation.navigate(
        screenName
      );

    } else {

      navigation.navigate(
        screenName
      );

    }
  };


  // =====================================================
  // Render
  // =====================================================
  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f59e0b"
          />
        }
      >

        {/* =====================================================
            Header
        ===================================================== */}

        <View style={styles.header}>

          <View style={styles.headerSpacer} />

          <Text style={styles.headerTitle}>
            ئاوایی بڵەسەن
          </Text>

          <View style={styles.headerActions}>

            <AdminAccessButton
              navigation={navigation}
              compact
            />

          </View>

        </View>


        {/* =====================================================
            Quick News
        ===================================================== */}

        {loadingQuickNews ? (

          <View
            style={[
              styles.alertCard,
              {
                backgroundColor: "#172554",
                borderColor: "#1e3a8a",
              },
            ]}
          >

            <View style={styles.alertHeader}>

              <Ionicons
                name="megaphone"
                size={28}
                color="#f59e0b"
              />

              <Text style={styles.alertTitle}>
                هەواڵی خێرا
              </Text>

            </View>


            <View style={styles.alertTimeRow}>

              <ActivityIndicator
                size="small"
                color="#f59e0b"
              />

              <Text
                style={[
                  styles.alertTimeText,
                  {
                    color: "#9ca3af",
                  },
                ]}
              >
                هەواڵەکە دەهێنرێت...
              </Text>

            </View>

          </View>

        ) : !quickNews ? (

          <View
            style={[
              styles.alertCard,
              {
                backgroundColor: "#172554",
                borderColor: "#1e3a8a",
              },
            ]}
          >

            <View style={styles.alertHeader}>

              <Ionicons
                name="megaphone-outline"
                size={28}
                color="#f59e0b"
              />

              <Text style={styles.alertTitle}>
                هەواڵی خێرا
              </Text>

            </View>


            <View style={styles.alertTimeRow}>

              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#f59e0b"
                style={{
                  marginLeft: 6,
                }}
              />

              <Text
                style={[
                  styles.alertTimeText,
                  {
                    color: "#9ca3af",
                  },
                ]}
              >
                ئێستا هیچ هەواڵێکی خێرا نییە
              </Text>

            </View>

          </View>

        ) : (

          <View
            style={[
              styles.alertCard,
              {
                backgroundColor: currentTheme.bg,
                borderColor: currentTheme.border,
              },
            ]}
          >

            <View style={styles.alertHeader}>

              <Ionicons
                name="megaphone"
                size={28}
                color={currentTheme.accent}
              />

              <Text
                style={styles.alertTitle}
                numberOfLines={2}
              >
                {quickNews.title}
              </Text>

            </View>


            {quickNews.content ? (

              <View style={styles.alertTimeRow}>

                <Text
                  style={[
                    styles.alertTimeText,
                    {
                      color: currentTheme.text,
                    },
                  ]}
                  numberOfLines={4}
                >
                  {quickNews.content}
                </Text>

              </View>

            ) : null}


            <View style={styles.alertFooterRow}>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >

                <Ionicons
                  name="flash-outline"
                  size={14}
                  color="#9ca3af"
                  style={{
                    marginLeft: 4,
                  }}
                />

                <Text
                  style={
                    styles.alertUpdateText
                  }
                >
                  هەواڵی خێرا⚡
                </Text>

              </View>


              {quickNews.news_date ? (

                <Text
                  style={[
                    styles.alertDateText,
                    {
                      color:
                        currentTheme.accent,
                    },
                  ]}
                >
                  {quickNews.news_date}
                </Text>

              ) : null}

            </View>

          </View>

        )}


        {/* =====================================================
            Quick Access
        ===================================================== */}

        <View
          style={styles.quickAccessRow}
        >

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigation.navigate("Tree")
            }
            activeOpacity={0.8}
          >

            <FontAwesome5
              name="tree"
              size={22}
              color="#f59e0b"
            />

            <Text
              style={
                styles.quickCardText
              }
            >
              شەجەرەنامە
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigation.navigate("Writers")
            }
            activeOpacity={0.8}
          >

            <FontAwesome5
              name="pen"
              size={20}
              color="#f59e0b"
            />

            <Text
              style={
                styles.quickCardText
              }
            >
              نووسەرانی بڵەسەن
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigateTo("Gallery")
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="images"
              size={22}
              color="#f59e0b"
            />

            <Text
              style={
                styles.quickCardText
              }
            >
              وێنەخانە
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigation.navigate(
                "Contact"
              )
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="call"
              size={22}
              color="#f59e0b"
            />

            <Text
              style={
                styles.quickCardText
              }
            >
              ژمارە تەلەفۆنەکان
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigation.navigate(
                "Memorial"
              )
            }
            activeOpacity={0.8}
          >

            <MaterialCommunityIcons
              name="candle"
              size={24}
              color="#f59e0b"
            />

            <Text
              style={
                styles.quickCardText
              }
            >
              پرسە و سەرەخۆشی
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigateTo(
                "Municipality"
              )
            }
            activeOpacity={0.8}
          >

            <MaterialCommunityIcons
              name="office-building"
              size={23}
              color="#f59e0b"
            />

            <Text
              style={
                styles.quickCardText
              }
            >
              دهیاری
            </Text>

          </TouchableOpacity>

        </View>


        {/* =====================================================
            Advertisement
        ===================================================== */}

        <AdBanner
          navigation={navigation}
        />


        {/* =====================================================
            Today's Weather - Compact
        ===================================================== */}

        <TouchableOpacity
          style={styles.weatherCard}
          onPress={() =>
            navigateTo("Weather")
          }
          activeOpacity={0.88}
        >

          {loadingWeather ? (

            <View
              style={
                styles.weatherLoading
              }
            >

              <ActivityIndicator
                size="small"
                color="#f59e0b"
              />

              <Text
                style={
                  styles.weatherLoadingText
                }
              >
                کەشوهەوا دەهێنرێت...
              </Text>

            </View>

          ) : !todayWeather ? (

            <View
              style={
                styles.weatherError
              }
            >

              <MaterialCommunityIcons
                name="weather-cloudy-alert"
                size={34}
                color="#f59e0b"
              />

              <View
                style={{
                  flex: 1,
                  alignItems: "flex-end",
                }}
              >

                <Text
                  style={
                    styles.weatherCardTitle
                  }
                >
                  کەشوهەوای بڵەسەن
                </Text>

                <Text
                  style={
                    styles.weatherCardSubtitle
                  }
                >
                  زانیاری بەردەست نییە
                </Text>

              </View>

              <Ionicons
                name="chevron-back"
                size={20}
                color="#9ca3af"
              />

            </View>

          ) : (

            <>

              {/* Main Compact Weather */}

              <View
                style={styles.weatherCompactMain}
              >

                <View
                  style={
                    styles.weatherCompactLeft
                  }
                >

                  <Text
                    style={
                      styles.weatherCompactTemp
                    }
                  >
                    {Math.round(
                      todayWeather.current.temperature_2m
                    )}
                    °
                  </Text>

                  <View
                    style={
                      styles.weatherCompactText
                    }
                  >

                    <Text
                      style={
                        styles.weatherCompactTitle
                      }
                    >
                      کەشوهەوای ئەمڕۆ
                    </Text>

                    <Text
                      style={
                        styles.weatherCompactDesc
                      }
                    >
                      {getWeatherDescription(
                        todayWeather.current.weather_code
                      )}
                    </Text>

                  </View>

                </View>


                <View
                  style={
                    styles.weatherCompactRight
                  }
                >

                  <View
                    style={
                      styles.weatherSmallIcon
                    }
                  >

                    <MaterialCommunityIcons
                      name={getWeatherIcon(
                        todayWeather.current.weather_code
                      )}
                      size={37}
                      color="#f59e0b"
                    />

                  </View>

                  <View
                    style={
                      styles.weatherLocationSmall
                    }
                  >

                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#f59e0b"
                    />

                    <Text
                      style={
                        styles.weatherLocation
                      }
                    >
                      بڵەسەن
                    </Text>

                  </View>

                </View>

              </View>


              {/* Small Details */}

              <View
                style={
                  styles.weatherDetailsCompact
                }
              >

                <View
                  style={
                    styles.weatherDetailCompactItem
                  }
                >

                  <Text
                    style={
                      styles.weatherDetailCompactValue
                    }
                  >
                    {todayWeather.current.relative_humidity_2m}٪
                  </Text>

                  <Text
                    style={
                      styles.weatherDetailCompactLabel
                    }
                  >
                    ڕطوبەت
                  </Text>

                </View>


                <View
                  style={
                    styles.weatherDetailCompactItem
                  }
                >

                  <Text
                    style={
                      styles.weatherDetailCompactValue
                    }
                  >
                    {Math.round(
                      todayWeather.current.wind_speed_10m
                    )}
                  </Text>

                  <Text
                    style={
                      styles.weatherDetailCompactLabel
                    }
                  >
                    km/h
                  </Text>

                </View>


                <View
                  style={
                    styles.weatherDetailCompactItem
                  }
                >

                  <Text
                    style={[
                      styles.weatherDetailCompactValue,
                      {
                        color: "#ef4444",
                      },
                    ]}
                  >
                    {Math.round(
                      todayWeather.daily.temperature_2m_max[0]
                    )}
                    °
                  </Text>

                  <Text
                    style={
                      styles.weatherDetailCompactLabel
                    }
                  >
                    زۆرترین
                  </Text>

                </View>


                <View
                  style={
                    styles.weatherDetailCompactItem
                  }
                >

                  <Text
                    style={[
                      styles.weatherDetailCompactValue,
                      {
                        color: "#38bdf8",
                      },
                    ]}
                  >
                    {Math.round(
                      todayWeather.daily.temperature_2m_min[0]
                    )}
                    °
                  </Text>

                  <Text
                    style={
                      styles.weatherDetailCompactLabel
                    }
                  >
                    کەمترین
                  </Text>

                </View>


                <Ionicons
                  name="chevron-back"
                  size={17}
                  color="#f59e0b"
                  style={{
                    marginRight: 2,
                  }}
                />

              </View>

            </>
          )}

        </TouchableOpacity>

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


  // ===================================================
  // Header
  // ===================================================

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  headerSpacer: {
    width: 70,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },

  headerActions: {
    width: 70,
    alignItems: "flex-end",
    justifyContent: "center",
  },


  // ===================================================
  // Quick News
  // ===================================================

  alertCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },

  alertHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  alertTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },

  alertTimeRow: {
    marginBottom: 10,
  },

  alertTimeText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "right",
    lineHeight: 20,
    color: "#9ca3af",
  },

  alertFooterRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  alertUpdateText: {
    color: "#9ca3af",
    fontSize: 11,
  },

  alertDateText: {
    fontSize: 11,
    fontWeight: "bold",
  },


  // ===================================================
  // Quick Access
  // ===================================================

  quickAccessRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 24,
    rowGap: 10,
  },

  quickCard: {
    backgroundColor: "#172554",
    width: "31.5%",
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderWidth: 1,
    borderColor: "#1e3a8a",
  },

  quickCardText: {
    color: "#fff",
    fontSize: 10,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "bold",
  },


  // ===================================================
  // Compact Weather Card
  // ===================================================

  weatherCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    backgroundColor: "#172554",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    paddingHorizontal: 13,
    paddingVertical: 11,

    // Compact size similar to AdBanner
    minHeight: 122,

    overflow: "hidden",
  },

  weatherCompactMain: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weatherCompactLeft: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },

  weatherCompactTemp: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    lineHeight: 38,
  },

  weatherCompactText: {
    alignItems: "flex-end",
    marginRight: 8,
  },

  weatherCompactTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },

  weatherCompactDesc: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  weatherCompactRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  weatherSmallIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#0b1329",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
  },

  weatherLocationSmall: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 3,
  },

  weatherLocation: {
    color: "#dbe3ec",
    fontSize: 10,
    fontWeight: "bold",
  },

  weatherDetailsCompact: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1e3a8a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weatherDetailCompactItem: {
    alignItems: "center",
    flex: 1,
  },

  weatherDetailCompactValue: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },

  weatherDetailCompactLabel: {
    color: "#8b98aa",
    fontSize: 8,
    marginTop: 2,
  },

  weatherLoading: {
    minHeight: 98,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row-reverse",
    gap: 10,
  },

  weatherLoadingText: {
    color: "#9ca3af",
    fontSize: 11,
  },

  weatherError: {
    minHeight: 98,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  weatherCardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  weatherCardSubtitle: {
    color: "#9ca3af",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
});