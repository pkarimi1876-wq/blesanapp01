import React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const WELCOME_IMAGE =
  "https://uploadkon.ir/uploads/8ab811_26IMG-20240429-132634-157.jpg";

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0b1329"
      />

      <View style={styles.content}>

        {/* وێنەی بڵەسەن */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: WELCOME_IMAGE }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* ناونیشان */}
        <Text style={styles.title}>
          دێهاتی بڵەسەن
        </Text>

        {/* ژێرناونیشان */}
        <Text style={styles.subtitle}>
          ئەرشیفی مێژوو و بیرەوەرییەکانی بڵەسەن
        </Text>

        {/* دەقی کورت */}
        <Text style={styles.description}>
          شوێنێک بۆ پاراستنی مێژوو،
          وێنە، شجرەنامە، هەواڵ و بیرەوەرییەکانی
          خەڵکی بڵەسەن.
        </Text>

        {/* هێڵی زێڕین */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Ionicons
            name="leaf-outline"
            size={18}
            color="#f59e0b"
          />
          <View style={styles.dividerLine} />
        </View>

      </View>

      {/* Footer */}
      <View style={styles.footer}>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.replace("MainTabs")
          }
        >
          <Text style={styles.startButtonText}>
            دەستپێکردن
          </Text>

          <View style={styles.arrowBox}>
            <Ionicons
              name="arrow-forward"
              size={19}
              color="#0b1329"
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          بۆ ئێستا • بۆ سبەی • بۆ نەوەکانمان
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1329",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  imageWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#f59e0b",
    marginBottom: 28,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    color: "#f59e0b",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 18,
  },

  description: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 25,
    textAlign: "center",
    maxWidth: 350,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "75%",
    marginTop: 28,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },

  footer: {
    paddingHorizontal: 28,
    paddingBottom: 24,
  },

  startButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,

    shadowColor: "#f59e0b",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  startButtonText: {
    color: "#0b1329",
    fontSize: 17,
    fontWeight: "800",
  },

  arrowBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  footerText: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 11,
    marginTop: 14,
  },
});