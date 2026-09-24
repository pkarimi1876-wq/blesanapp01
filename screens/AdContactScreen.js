import React from "react";

import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function AdContactScreen({ navigation }) {
  const phoneNumber = "09188751876";
  const email = "pkarimi1876@gmail.com";
  const telegram = "@karimi1876";

  const callManager = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sendEmail = () => {
    Linking.openURL(`mailto:${email}`);
  };

  const openTelegram = () => {
    Linking.openURL("https://t.me/karimi1876");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-forward"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          پەیوەندی بۆ تبلیغ
        </Text>

        <View style={styles.headerSpace} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="megaphone"
            size={38}
            color="#f59e0b"
          />
        </View>

        <Text style={styles.title}>
          بۆ بڵاوکردنەوەی تبلیغ
        </Text>

        <Text style={styles.description}>
          بۆ بڵاوکردنەوەی ریکلام،
          ئاگاداری و پەیامە تایبەتەکان لە ئەپی بڵەسەن،
          دەتوانیت لە ڕێگەی یەکێک لەم ڕێگایانەوە
          پەیوەندیمان پێوە بکەیت.
        </Text>

        {/* Mobile */}
        <TouchableOpacity
          style={styles.contactCard}
          activeOpacity={0.85}
          onPress={callManager}
        >
          <Ionicons
            name="call-outline"
            size={24}
            color="#f59e0b"
          />

          <View style={styles.contactTextBox}>
            <Text style={styles.contactLabel}>
              موبایل
            </Text>

            <Text style={styles.contactValue}>
              {phoneNumber}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity
          style={styles.contactCard}
          activeOpacity={0.85}
          onPress={sendEmail}
        >
          <Ionicons
            name="mail-outline"
            size={24}
            color="#f59e0b"
          />

          <View style={styles.contactTextBox}>
            <Text style={styles.contactLabel}>
              ئیمەیل
            </Text>

            <Text style={styles.contactValue}>
              {email}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Telegram */}
        <TouchableOpacity
          style={styles.contactCard}
          activeOpacity={0.85}
          onPress={openTelegram}
        >
          <Ionicons
            name="paper-plane-outline"
            size={24}
            color="#f59e0b"
          />

          <View style={styles.contactTextBox}>
            <Text style={styles.contactLabel}>
              تێلەگرام
            </Text>

            <Text style={styles.contactValue}>
              {telegram}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1329",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e3a8a",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#172554",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  headerSpace: {
    width: 40,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  description: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
  },

  contactCard: {
    width: "100%",
    minHeight: 70,
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    borderRadius: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  contactTextBox: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-end",
  },

  contactLabel: {
    color: "#94a3b8",
    fontSize: 11,
    marginBottom: 4,
  },

  contactValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});