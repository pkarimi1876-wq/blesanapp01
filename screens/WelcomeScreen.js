import React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const WELCOME_IMAGE =
  "https://cdn.imgurl.ir/uploads/a966067_IMG_20230318_135501_676.jpg";

export default function WelcomeScreen({ navigation }) {
  const handleStart = () => {
    navigation.replace("MainTabs");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
        translucent
      />

      {/* ================================================ */}
      {/* BACKGROUND IMAGE */}
      {/* ================================================ */}

      <Image
        source={{ uri: WELCOME_IMAGE }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* ================================================ */}
      {/* OVERLAY */}
      {/* ================================================ */}

      <View style={styles.darkOverlay} />

      <View style={styles.topOverlay} />

      <View style={styles.bottomOverlay} />

      {/* ================================================ */}
      {/* CONTENT */}
      {/* ================================================ */}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          {/* ============================================ */}
          {/* APP LOGO */}
          {/* ============================================ */}

          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>
                B
              </Text>
            </View>

            <View style={styles.logoTextArea}>
              <Text style={styles.logoText}>
                APP
              </Text>

              <Text style={styles.logoName}>
                BLLASAN
              </Text>
            </View>
          </View>


      


          {/* ============================================ */}
          {/* BOTTOM MESSAGE + BUTTON */}
          {/* ============================================ */}

          <View style={styles.bottomSection}>

            <View style={styles.textBox}>
              <Text style={styles.description}>
                شوێنێک بۆ پاراستنی مێژوو،
                {"\n"}
                وێنە و بیرەوەرییەکانی بڵەسەن
              </Text>
            </View>


            <View style={styles.divider}>
              <View style={styles.dividerLine} />

              <View style={styles.dividerDot} />

              <View style={styles.dividerLine} />
            </View>


            {/* START BUTTON */}

            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.88}
              onPress={handleStart}
            >
              <Text style={styles.startButtonText}>
                دەستپێکردن
              </Text>
            </TouchableOpacity>


            <Text style={styles.footerText}>
              بۆ ئێستا • بۆ سبەی • بۆ نەوەکانمان
            </Text>

          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}


// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  safeArea: {
    flex: 1,
  },

  // =====================================================
  // IMAGE
  // =====================================================

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
  },

  // =====================================================
  // OVERLAY
  // =====================================================

  darkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(4,9,15,0.28)",
  },

  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.30,
    backgroundColor: "rgba(3,8,13,0.20)",
  },

  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.42,
    backgroundColor: "rgba(3,8,13,0.38)",
  },

  // =====================================================
  // CONTENT
  // =====================================================

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    justifyContent: "space-between",
  },

  // =====================================================
  // LOGO
  // =====================================================

  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 2,
  },

  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F59E0B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.30,
    shadowRadius: 5,
    elevation: 5,
  },

  logoLetter: {
    color: "#0B1329",
    fontSize: 23,
    fontWeight: "900",
  },

  logoTextArea: {
    marginLeft: 9,
  },

  logoText: {
    color: "#F59E0B",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
  },

  logoName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  // =====================================================
  // TITLE
  // =====================================================

 

  // =====================================================
  // BOTTOM SECTION
  // =====================================================

  bottomSection: {
    alignItems: "center",
    width: "100%",
    marginBottom: 2,
  },

  textBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(11,19,31,0.46)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 17,
    paddingHorizontal: 18,
    paddingVertical: 13,
    marginBottom: 13,
  },

  description: {
    color: "#F8FAFC",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "500",

    textShadowColor: "rgba(0,0,0,0.60)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  divider: {
    width: "55%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(245,158,11,0.48)",
  },

  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
    marginHorizontal: 8,
  },

  // =====================================================
  // START BUTTON
  // =====================================================

  startButton: {
    width: "100%",
    maxWidth: 420,
    height: 56,
    borderRadius: 15,
    backgroundColor: "#F59E0B",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },

  startButtonText: {
    color: "#0B1329",
    fontSize: 18,
    fontWeight: "900",
  },

  // =====================================================
  // FOOTER
  // =====================================================

  footerText: {
    color: "#E2E8F0",
    textAlign: "center",
    fontSize: 10.5,
    marginTop: 10,

    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },
});