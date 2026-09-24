import React from "react";

import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  ArrowRight,
  Building2,
  Megaphone,
  BriefcaseBusiness,
  Phone,
  MapPin,
  ChevronLeft,
  Info,
} from "lucide-react-native";

export default function MunicipalityScreen({
  navigation,
  route,
  isAdmin: adminProp = false,
}) {
  /* =====================================================
     Admin State
  ===================================================== */

  const isAdmin =
    adminProp === true ||
    route?.params?.isAdmin === true;

  /* =====================================================
     Open Section
  ===================================================== */

  const openSection = (
    title,
    type
  ) => {
    navigation.navigate(
      "MunicipalitySection",
      {
        title,
        type,
        isAdmin,
      }
    );
  };

  /* =====================================================
     Municipality Sections
  ===================================================== */

  const sections = [
    {
      title: "ڕاگەیاندنەکان",
      type: "announcements",
      icon: Megaphone,
      color: "#D97706",
    },

    {
      title: "خزمەتگوزارییەکان",
      type: "services",
      icon: BriefcaseBusiness,
      color: "#2563EB",
    },

    {
      title: "پڕۆژەکان",
      type: "projects",
      icon: Building2,
      color: "#059669",
    },

    {
      title: "پەیوەندی",
      type: "contact",
      icon: Phone,
      color: "#7C3AED",
    },

    {
      title: "شوێن",
      type: "location",
      icon: MapPin,
      color: "#DC2626",
    },

    {
      title: "دەربارەی دهیاری",
      type: "about",
      icon: Info,
      color: "#0891B2",
    },
  ];

  /* =====================================================
     Screen
  ===================================================== */

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ArrowRight
            color="#FFFFFF"
            size={22}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            دهیاری
          </Text>

          <Text style={styles.headerSubtitle}>
            خزمەت و زانیارییەکانی دهیاری
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Building2
            color="#D4AF37"
            size={24}
          />
        </View>
      </View>

      {/* Content */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* Intro */}

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Building2
              color="#D4AF37"
              size={28}
            />
          </View>

          <Text style={styles.introTitle}>
            بەخێربێیت بۆ بەشی دهیاری
          </Text>

          <Text style={styles.introText}>
            لێرە دەتوانیت زانیاری،
            خزمەتگوزاری و هەواڵەکانی
            دهیاری ببینیت.
          </Text>
        </View>

        {/* Admin Status */}

        {isAdmin && (
          <View style={styles.adminBox}>
            <Text style={styles.adminTitle}>
              🔐 دۆخی بەڕێوەبەر چالاکە
            </Text>

            <Text style={styles.adminText}>
              تۆ بە دۆخی بەڕێوەبردن هاتوویتە ناو
              بەشی دهیاری.
            </Text>
          </View>
        )}

        {/* Sections */}

        <View style={styles.sectionList}>
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <TouchableOpacity
                key={section.type}
                style={styles.card}
                activeOpacity={0.82}
                onPress={() =>
                  openSection(
                    section.title,
                    section.type
                  )
                }
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        `${section.color}18`,
                    },
                  ]}
                >
                  <Icon
                    color={section.color}
                    size={25}
                  />
                </View>

                <View style={styles.cardTextBox}>
                  <Text style={styles.cardTitle}>
                    {section.title}
                  </Text>

                  <Text style={styles.cardHint}>
                    {isAdmin
                      ? "بەڕێوەبردن و بینین"
                      : "بینین و خوێندنەوە"}
                  </Text>
                </View>

                <ChevronLeft
                  color="#9CA3AF"
                  size={20}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================================================
   Styles
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1320",
  },

  header: {
    minHeight: 82,

    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#111827",

    borderBottomWidth: 1,
    borderBottomColor: "#263244",
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#1F2937",
  },

  headerTitleBox: {
    flex: 1,

    alignItems: "flex-end",

    marginHorizontal: 12,
  },

  headerTitle: {
    color: "#FFFFFF",

    fontSize: 22,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 4,

    color: "#9CA3AF",

    fontSize: 12,
  },

  headerIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#1C2432",

    borderWidth: 1,
    borderColor: "#364152",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 35,
  },

  introCard: {
    padding: 20,

    borderRadius: 20,

    backgroundColor: "#111827",

    borderWidth: 1,
    borderColor: "#253247",

    alignItems: "center",

    marginBottom: 14,
  },

  introIcon: {
    width: 58,
    height: 58,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#1B2433",

    borderWidth: 1,
    borderColor: "#354154",

    marginBottom: 12,
  },

  introTitle: {
    color: "#FFFFFF",

    fontSize: 18,
    fontWeight: "800",

    textAlign: "center",
  },

  introText: {
    marginTop: 8,

    color: "#9CA3AF",

    fontSize: 13,
    lineHeight: 22,

    textAlign: "center",
  },

  adminBox: {
    marginBottom: 14,

    padding: 14,

    borderRadius: 16,

    backgroundColor: "#241C0B",

    borderWidth: 1,
    borderColor: "#7C5C12",
  },

  adminTitle: {
    color: "#D4AF37",

    fontSize: 14,
    fontWeight: "800",

    textAlign: "right",
  },

  adminText: {
    marginTop: 5,

    color: "#B8C0CC",

    fontSize: 12,
    lineHeight: 20,

    textAlign: "right",
  },

  sectionList: {
    gap: 12,
  },

  card: {
    minHeight: 82,

    borderRadius: 18,

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#111827",

    borderWidth: 1,
    borderColor: "#253247",
  },

  iconBox: {
    width: 50,
    height: 50,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 12,
  },

  cardTextBox: {
    flex: 1,

    alignItems: "flex-end",
  },

  cardTitle: {
    color: "#FFFFFF",

    fontSize: 16,
    fontWeight: "800",
  },

  cardHint: {
    marginTop: 4,

    color: "#7F8EA3",

    fontSize: 11,
  },
});