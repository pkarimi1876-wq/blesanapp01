import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Home,
  Landmark,
  MapPin,
  Mountain,
  Users,
} from "lucide-react-native";

import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "../lib/supabase";

// =====================================================
// IMAGE
// =====================================================

const BLLASAN_IMAGE =
  "https://uploadkon.ir/uploads/502a02_26IMG-20230318-135501-676.jpg";

// =====================================================
// SCREEN
// =====================================================

export default function BllasanAboutScreen({
  navigation,
}) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // LOAD CONTENT
  // ===================================================

  const loadContent = useCallback(
    async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("bllasan_about")
          .select("content")
          .eq("id", 1)
          .single();

        if (error) {
          console.log(
            "LOAD BLLASAN ABOUT ERROR:",
            error
          );
          return;
        }

        console.log(
          "BLLASAN ABOUT FROM SUPABASE:",
          JSON.stringify(
            data?.content,
            null,
            2
          )
        );

        console.log(
          "ROOTS FROM SUPABASE:",
          JSON.stringify(
            data?.content?.roots,
            null,
            2
          )
        );

        if (data?.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.log(
          "LOAD BLLASAN ABOUT FINAL ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ===================================================
  // REFRESH WHEN SCREEN GETS FOCUS
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [loadContent])
  );

  // =====================================================
  // ERROR
  // =====================================================

  if (!content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#F59E0B"
            />
          )}

          <Text style={styles.loadingText}>
            نەتوانرا زانیارییەکانی بڵەسەن بار بکرێن.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.85}
            onPress={loadContent}
          >
            <Text
              style={styles.retryButtonText}
            >
              دووبارە هەوڵبدەرەوە
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const hero = content.hero || {};

  const intro = content.intro || {};

  const stats = Array.isArray(content.stats)
    ? content.stats
    : [];

  const history = content.history || {};

  const historyItems = Array.isArray(
    history.items
  )
    ? history.items
    : [];

  const roots = Array.isArray(content.roots)
    ? content.roots
    : [];

  const geography =
    content.geography || {};

  const values = Array.isArray(
    content.values
  )
    ? content.values
    : [];

  const footer = content.footer || {};

  const statIcons = [
    CalendarDays,
    Users,
    MapPin,
  ];

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* =================================================
            HERO
        ================================================= */}

        <View style={styles.heroCard}>
          <ImageBackground
            source={{
              uri:
                hero.image_url ||
                BLLASAN_IMAGE,
            }}
            style={styles.heroImage}
            imageStyle={
              styles.heroImageRadius
            }
          >
            <View
              style={styles.heroOverlay}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.backButton}
                onPress={() =>
                  navigation?.goBack()
                }
              >
                <ArrowLeft
                  size={21}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <View
                style={styles.heroBottom}
              >
                <View
                  style={styles.heroBadge}
                >
                  <Home
                    size={14}
                    color="#F59E0B"
                  />

                  <Text
                    style={
                      styles.heroBadgeText
                    }
                  >
                    ناساندنی بڵەسەن
                  </Text>
                </View>

                <Text
                  style={styles.heroTitle}
                >
                  {hero.title || ""}
                </Text>

                <Text
                  style={
                    styles.heroSubtitle
                  }
                >
                  {hero.subtitle || ""}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* =================================================
            INTRO
        ================================================= */}

        <View style={styles.section}>
          <Text
            style={styles.sectionKicker}
          >
            {intro.kicker || ""}
          </Text>

          <Text
            style={styles.sectionTitle}
          >
            {intro.title || ""}
          </Text>

          {Array.isArray(
            intro.paragraphs
          ) &&
            intro.paragraphs.map(
              (paragraph, index) => (
                <Text
                  key={`intro-${index}`}
                  style={styles.bodyText}
                >
                  {paragraph}
                </Text>
              )
            )}
        </View>

        {/* =================================================
            STATS
        ================================================= */}

        <View style={styles.statsRow}>
          {stats.map((item, index) => {
            const Icon =
              statIcons[index] ||
              MapPin;

            return (
              <View
                key={`${item.label || "stat"}-${index}`}
                style={styles.statCard}
              >
                <View
                  style={styles.statIcon}
                >
                  <Icon
                    size={20}
                    color="#F59E0B"
                  />
                </View>

                <Text
                  style={styles.statLabel}
                >
                  {item.label || ""}
                </Text>

                <Text
                  style={styles.statValue}
                >
                  {item.value || ""}
                </Text>
              </View>
            );
          })}
        </View>

        {/* =================================================
            HISTORY
        ================================================= */}

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <View
              style={
                styles.historyHeaderText
              }
            >
              <Text
                style={
                  styles.sectionKicker
                }
              >
                {history.kicker || ""}
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                {history.title || ""}
              </Text>
            </View>

            <View
              style={styles.sectionIcon}
            >
              <Landmark
                size={22}
                color="#F59E0B"
              />
            </View>
          </View>

          <View
            style={styles.historyCard}
          >
            <View
              style={styles.timelineLine}
            />

            {historyItems.map(
              (item, index) => (
                <View
                  key={`${item.title || "history"}-${index}`}
                  style={[
                    styles.timelineItem,
                    index ===
                      historyItems.length -
                        1 &&
                      styles.timelineItemLast,
                  ]}
                >
                  <View
                    style={
                      styles.timelineDot
                    }
                  />

                  <View
                    style={
                      styles.timelineBody
                    }
                  >
                    <Text
                      style={
                        styles.timelineTitle
                      }
                    >
                      {item.title || ""}
                    </Text>

                    <Text
                      style={
                        styles.timelineText
                      }
                    >
                      {item.text || ""}
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>
        </View>

        {/* =================================================
            ROOTS
        ================================================= */}

        <View style={styles.section}>
          <Text
            style={styles.sectionKicker}
          >
            بنەما و بەرەکان
          </Text>

          <Text
            style={styles.sectionTitle}
          >
            ڕەگ و ڕیشەی بنەماڵەکان
          </Text>

          <View style={styles.rootsList}>
            {roots.map(
              (root, index) => (
                <View
                  key={`${root.title || "root"}-${index}`}
                  style={styles.rootCard}
                >
                  <View
                    style={
                      styles.rootNumber
                    }
                  >
                    <Text
                      style={
                        styles.rootNumberText
                      }
                    >
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </Text>
                  </View>

                  <View
                    style={styles.rootBody}
                  >
                    <Text
                      style={
                        styles.rootTitle
                      }
                    >
                      {root.title || ""}
                    </Text>

                    <Text
                      style={
                        styles.rootText
                      }
                    >
                      {root.text || ""}
                    </Text>
                  </View>

                  <ChevronLeft
                    size={18}
                    color="#F59E0B"
                  />
                </View>
              )
            )}
          </View>
        </View>

        {/* =================================================
            GEOGRAPHY
        ================================================= */}

        <View style={styles.section}>
          <View style={styles.geoCard}>
            <View
              style={styles.geoIconBox}
            >
              <Mountain
                size={28}
                color="#F59E0B"
              />
            </View>

            <View
              style={styles.geoBody}
            >
              <Text
                style={styles.geoTitle}
              >
                {geography.title || ""}
              </Text>

              <Text
                style={styles.geoText}
              >
                {geography.text || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            VALUES
        ================================================= */}

        <View style={styles.section}>
          <Text
            style={styles.sectionKicker}
          >
            ناسنامەی کۆمەڵایەتی
          </Text>

          <Text
            style={styles.sectionTitle}
          >
            ئەو شتانەی بڵەسەن بەهێز دەکەن
          </Text>

          <View
            style={styles.valuesGrid}
          >
            {values.map(
              (item, index) => (
                <View
                  key={`${item.title || "value"}-${index}`}
                  style={
                    styles.valueCard
                  }
                >
                  <View
                    style={
                      styles.valueAccent
                    }
                  />

                  <Text
                    style={
                      styles.valueTitle
                    }
                  >
                    {item.title || ""}
                  </Text>

                  <Text
                    style={
                      styles.valueText
                    }
                  >
                    {item.text || ""}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* =================================================
            ARCHIVE
        ================================================= */}

        <View
          style={styles.archiveCard}
        >
          <View
            style={styles.archiveTop}
          >
            <Text
              style={
                styles.archiveKicker
              }
            >
              ئەرشیفی بڵەسەن
            </Text>

            <Home
              size={22}
              color="#F59E0B"
            />
          </View>

          <Text
            style={styles.archiveTitle}
          >
            {footer.title || ""}
          </Text>

          <Text
            style={styles.archiveText}
          >
            {footer.text || ""}
          </Text>
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <View style={styles.footer}>
          <Text
            style={styles.footerText}
          >
            بڵەسەن — شوێنێک لەناو بیرەوەری
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071A2D",
  },

  content: {
    padding: 14,
    paddingBottom: 35,
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  loadingText: {
    color: "#D7E2EC",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    minHeight: 46,
    paddingHorizontal: 22,
    borderRadius: 13,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    color: "#071A2D",
    fontSize: 12,
    fontWeight: "900",
  },

  // ===================================================
  // HERO
  // ===================================================

  heroCard: {
    width: "100%",
    height: 300,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#102A43",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  heroImage: {
    flex: 1,
  },

  heroImageRadius: {
    borderRadius: 24,
  },

  heroOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
    backgroundColor:
      "rgba(3,15,28,0.45)",
  },

  backButton: {
    alignSelf: "flex-start",
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },

  heroBottom: {
    alignItems: "flex-end",
  },

  heroBadge: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor:
      "rgba(245,158,11,0.18)",
    borderWidth: 1,
    borderColor:
      "rgba(245,158,11,0.45)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    marginBottom: 9,
  },

  heroBadgeText: {
    color: "#FFD166",
    fontSize: 10,
    fontWeight: "900",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "right",
  },

  heroSubtitle: {
    color: "#E6EEF5",
    fontSize: 11,
    lineHeight: 19,
    marginTop: 6,
    textAlign: "right",
    maxWidth: "88%",
  },

  // ===================================================
  // SECTION
  // ===================================================

  section: {
    marginTop: 23,
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  historyHeaderText: {
    flex: 1,
    alignItems: "flex-end",
  },

  sectionKicker: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "right",
    letterSpacing: 0.2,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 26,
    marginTop: 4,
    textAlign: "right",
  },

  bodyText: {
    color: "#C7D3DE",
    fontSize: 13,
    lineHeight: 23,
    marginTop: 12,
    textAlign: "right",
  },

  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // ===================================================
  // STATS
  // ===================================================

  statsRow: {
    marginTop: 16,
    flexDirection: "row-reverse",
    gap: 8,
  },

  statCard: {
    flex: 1,
    minHeight: 115,
    borderRadius: 17,
    backgroundColor: "#102A43",
    borderWidth: 1,
    borderColor: "#D99000",
    padding: 11,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    color: "#D8E1EA",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 9,
  },

  statValue: {
    color: "#FFD166",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 3,
  },

  // ===================================================
  // HISTORY
  // ===================================================

  historyCard: {
    marginTop: 13,
    borderRadius: 18,
    padding: 15,
    backgroundColor: "#102A43",
    borderWidth: 1,
    borderColor: "#D99000",
  },

  timelineLine: {
    position: "absolute",
    top: 26,
    bottom: 26,
    right: 28,
    width: 2,
    backgroundColor: "#F59E0B",
  },

  timelineItem: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 19,
  },

  timelineItemLast: {
    marginBottom: 0,
  },

  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F59E0B",
    borderWidth: 4,
    borderColor: "#FFD166",
    zIndex: 2,
    marginLeft: 11,
  },

  timelineBody: {
    flex: 1,
    alignItems: "flex-end",
  },

  timelineTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },

  timelineText: {
    color: "#C3D0DC",
    fontSize: 11,
    lineHeight: 19,
    marginTop: 5,
    textAlign: "right",
  },

  // ===================================================
  // ROOTS
  // ===================================================

  rootsList: {
    marginTop: 12,
    gap: 9,
  },

  rootCard: {
    minHeight: 76,
    borderRadius: 16,
    backgroundColor: "#102A43",
    borderWidth: 1,
    borderColor: "#D99000",
    padding: 11,
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  rootNumber: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },

  rootNumberText: {
    color: "#071A2D",
    fontSize: 10,
    fontWeight: "900",
  },

  rootBody: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: "flex-end",
  },

  rootTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },

  rootText: {
    color: "#BFCBD6",
    fontSize: 10,
    lineHeight: 17,
    marginTop: 3,
    textAlign: "right",
  },

  // ===================================================
  // GEOGRAPHY
  // ===================================================

  geoCard: {
    borderRadius: 19,
    padding: 14,
    backgroundColor: "#102A43",
    borderWidth: 1,
    borderColor: "#D99000",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },

  geoIconBox: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },

  geoBody: {
    flex: 1,
    paddingRight: 11,
    alignItems: "flex-end",
  },

  geoTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },

  geoText: {
    color: "#C7D3DE",
    fontSize: 11,
    lineHeight: 19,
    marginTop: 6,
    textAlign: "right",
  },

  // ===================================================
  // VALUES
  // ===================================================

  valuesGrid: {
    marginTop: 12,
    gap: 9,
  },

  valueCard: {
    borderRadius: 16,
    backgroundColor: "#102A43",
    borderWidth: 1,
    borderColor: "#D99000",
    padding: 14,
    alignItems: "flex-end",
  },

  valueAccent: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F59E0B",
    marginBottom: 9,
  },

  valueTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },

  valueText: {
    color: "#C3D0DC",
    fontSize: 11,
    lineHeight: 19,
    marginTop: 5,
    textAlign: "right",
  },

  // ===================================================
  // ARCHIVE
  // ===================================================

  archiveCard: {
    marginTop: 24,
    borderRadius: 22,
    padding: 17,
    backgroundColor: "#F59E0B",
  },

  archiveTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  archiveKicker: {
    color: "#071A2D",
    fontSize: 10,
    fontWeight: "900",
  },

  archiveTitle: {
    color: "#071A2D",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "right",
  },

  archiveText: {
    color: "#172B3D",
    fontSize: 11,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "right",
  },

  // ===================================================
  // FOOTER
  // ===================================================

  footer: {
    paddingTop: 17,
    alignItems: "center",
  },

  footerText: {
    color: "#91A3B5",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
});