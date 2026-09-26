
import React, { useCallback, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
 
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import AdBanner from "../Components/AdBanner";
import AdminAccessButton from "../Components/AdminAccesButton.js";
import { supabase } from "../lib/supabase";

export default function HomeScreen({ navigation }) {
  // =====================================================
  // Quick News State
  // =====================================================

  const [quickNews, setQuickNews] = useState(null);
  const [loadingQuickNews, setLoadingQuickNews] =
    useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const currentTheme = getQuickNewsStyles();

  // =====================================================
  // Focus & Refresh
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      fetchQuickNews();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuickNews();
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
      rootNavigation.navigate(screenName);
    } else {
      navigation.navigate(screenName);
    }
  };

  // =====================================================
  // Weather Navigation
  // =====================================================

  const openWeather = () => {
    navigateTo("Weather");
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
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
          <TouchableOpacity
            style={styles.profileBtn}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
              }}
              style={styles.profileImg}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            ئاوایی بڵەسەن
          </Text>

          <View style={styles.headerActions}>
            <AdminAccessButton
              navigation={navigation}
              compact
            />

            <TouchableOpacity
              style={styles.notificationBtn}
              activeOpacity={0.8}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#fff"
              />

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  3
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* =====================================================
            Quick News Section
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

                <Text style={styles.alertUpdateText}>
                  هەواڵی خێرا⚡
                </Text>
              </View>

              {quickNews.news_date ? (
                <Text
                  style={[
                    styles.alertDateText,
                    {
                      color: currentTheme.accent,
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
            Quick Access Buttons
        ===================================================== */}

        <View style={styles.quickAccessRow}>
          {/* شەجەرەنامە */}

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

            <Text style={styles.quickCardText}>
              شەجەرەنامە
            </Text>
          </TouchableOpacity>

          {/* نووسەرانی بڵەسەن */}

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

            <Text style={styles.quickCardText}>
              نووسەرانی بڵەسەن
            </Text>
          </TouchableOpacity>

          {/* وێنەخانە */}

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

            <Text style={styles.quickCardText}>
              وێنەخانە
            </Text>
          </TouchableOpacity>

          {/* ژمارە تەلەفۆنەکان */}

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigation.navigate("Contact")
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="call"
              size={22}
              color="#f59e0b"
            />

            <Text style={styles.quickCardText}>
              ژمارە تەلەفۆنەکان
            </Text>
          </TouchableOpacity>

          {/* پرسە و سەرەخۆشی */}

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigation.navigate("Memorial")
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="candle"
              size={24}
              color="#f59e0b"
            />

            <Text style={styles.quickCardText}>
              پرسە و سەرەخۆشی
            </Text>
          </TouchableOpacity>

          {/* دهیاری */}

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() =>
              navigateTo("Municipality")
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="office-building"
              size={23}
              color="#f59e0b"
            />

            <Text style={styles.quickCardText}>
              دهیاری
            </Text>
          </TouchableOpacity>
        </View>

        {/* =====================================================
            Advertisement
        ===================================================== */}

        <AdBanner navigation={navigation} />

        {/* =====================================================
            Weather Card - کادری سەربەخۆ
        ===================================================== */}

        <TouchableOpacity
          style={styles.weatherCard}
          onPress={openWeather}
          activeOpacity={0.85}
        >
          <View style={styles.weatherIconBox}>
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={38}
              color="#f59e0b"
            />
          </View>

          <View style={styles.weatherContent}>
            <Text style={styles.weatherTitle}>
              کەشناسی بڵەسەن
            </Text>

            <Text style={styles.weatherSubtitle}>
              ابوالحسن، بانە، کوردستان
            </Text>

            <Text style={styles.weatherMore}>
              بینینی کەشناسی و پێشبینی ٧ ڕۆژ
            </Text>
          </View>

          <Ionicons
            name="chevron-back"
            size={22}
            color="#f59e0b"
          />
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

  // =====================================================
  // Header
  // =====================================================

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  profileBtn: {
    borderWidth: 1.5,
    borderColor: "#f59e0b",
    borderRadius: 20,
    padding: 2,
  },

  profileImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  notificationBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#172554",
    borderRadius: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },

  // =====================================================
  // Quick News
  // =====================================================

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

  // =====================================================
  // Quick Access
  // =====================================================

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

  // =====================================================
  // Weather Card
  // =====================================================

  weatherCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    backgroundColor: "#172554",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    minHeight: 92,
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 14,
  },

  weatherIconBox: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: "#0f1b3a",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  weatherContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  weatherTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },

  weatherSubtitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },

  weatherMore: {
    color: "#f59e0b",
    fontSize: 10,
    marginTop: 7,
    textAlign: "right",
  },
});

