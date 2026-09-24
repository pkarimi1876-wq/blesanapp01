import React, {
  useState,
  useCallback,
} from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Switch,
  BackHandler,
  TextInput,
  Modal,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import {
  ShieldCheck,
  LogOut,
  ChevronLeft,
  User,
  Bell,
  Info,
  ArrowRight,
  Globe,
  Moon,
  Sun,
  X,
} from "lucide-react-native";

import { supabase } from "../lib/supabase";

/* =====================================================
   Settings Screen
===================================================== */

export default function SettingsScreen({
  navigation,
}) {
  const [language, setLanguage] =
    useState("کوردی");

  const [isDarkMode, setIsDarkMode] =
    useState(true);

  /* -----------------------------------------------------
     Admin Modal
  ----------------------------------------------------- */

  const [
    isAdminModalVisible,
    setIsAdminModalVisible,
  ] = useState(false);

  const [
    inputEmail,
    setInputEmail,
  ] = useState("");

  const [
    inputPassword,
    setInputPassword,
  ] = useState("");

  /* -----------------------------------------------------
     Admin Credentials
  ----------------------------------------------------- */

  const ADMIN_EMAIL =
    "pkarimi1876@gmail.com";

  const ADMIN_PASSWORD =
    "P@karimi#1876#admin$panel";

  /* =====================================================
     Navigation
  ===================================================== */

  const goBackHome = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("MainTabs");
    }
  }, [navigation]);

  /* =====================================================
     Back Handler
  ===================================================== */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        goBackHome();
        return true;
      };

      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );

      return () =>
        subscription.remove();
    }, [goBackHome])
  );

  /* =====================================================
     Admin Login
  ===================================================== */

  const handleAdminLogin = () => {
    const email =
      inputEmail
        .trim()
        .toLowerCase();

    const password =
      inputPassword;

    if (
      email ===
        ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      setIsAdminModalVisible(false);

      setInputEmail("");
      setInputPassword("");

      navigation.navigate(
        "AdminPanel"
      );
    } else {
      Alert.alert(
        "هەڵە",
        "ئیمەیڵ یان وشەی نهێنی هەڵەیە!"
      );
    }
  };

  /* =====================================================
     Profile
  ===================================================== */

  const openProfile = () => {
    Alert.alert(
      "پڕۆفایلی من",
      "چوونە ناو بەشی پڕۆفایل"
    );
  };

  /* =====================================================
     Notifications
  ===================================================== */

  const openNotifications = () => {
    Alert.alert(
      "ئاگادارکردنەوەکان",
      "بەشی ئاگادارکردنەوەکان"
    );
  };

  /* =====================================================
     Language
  ===================================================== */

  const changeLanguage = () => {
    Alert.alert(
      "گۆڕینی زمان",
      "زمانی ئەپەکەت هەڵبژێرە:",
      [
        {
          text: "کوردی",
          onPress: () =>
            setLanguage("کوردی"),
        },

        {
          text: "فارسی",
          onPress: () =>
            setLanguage("فارسی"),
        },

        {
          text: "English",
          onPress: () =>
            setLanguage("English"),
        },

        {
          text: "پاشگەزبوونەوە",
          style: "cancel",
        },
      ]
    );
  };

  /* =====================================================
     About
  ===================================================== */

  const openAbout = () => {
    Alert.alert(
      "دەربارەی دێهاتی بڵەسەن",
      "ئەم ئەپە بۆ پاراستن و کۆکردنەوەی مێژوو و زانیارییەکانی بڵەسەن دروست کراوە."
    );
  };

  /* =====================================================
     Sign Out
  ===================================================== */

  const handleSignOut = async () => {
    Alert.alert(
      "چوونە دەرەوە",
      "دڵنیایت لە چوونە دەرەوەت؟",
      [
        {
          text: "نەخێر",
          style: "cancel",
        },

        {
          text: "بەڵێ",
          style: "destructive",

          onPress: async () => {
            try {
              await supabase.auth.signOut();

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Welcome",
                  },
                ],
              });
            } catch (error) {
              console.log(
                "SIGN OUT ERROR:",
                error
              );

              Alert.alert(
                "هەڵە",
                "چوونە دەرەوە سەرکەوتوو نەبوو."
              );
            }
          },
        },
      ]
    );
  };

  /* =====================================================
     Render
  ===================================================== */

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* =================================================
          Header
      ================================================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBackHome}
          activeOpacity={0.8}
        >
          <ArrowRight
            color="#FFFFFF"
            size={22}
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          ڕێکخستنەکان
        </Text>

        <View
          style={styles.headerSpacer}
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =================================================
            Admin
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          بەڕێوەبەری سیستەم
        </Text>

        <TouchableOpacity
          style={styles.adminOption}
          activeOpacity={0.8}
          onPress={() =>
            setIsAdminModalVisible(
              true
            )
          }
        >
          <ChevronLeft
            color="#A0AEC0"
            size={20}
          />

          <View
            style={
              styles.optionTextGroup
            }
          >
            <Text
              style={
                styles.optionTitle
              }
            >
              پانێڵی بەڕێوەبەر
            </Text>

            <Text
              style={
                styles.optionSub
              }
            >
              کلیک بکە بۆ کردنەوەی پەنجەرەی چوونەژوورەوە
            </Text>
          </View>

          <View
            style={
              styles.iconBoxAdmin
            }
          >
            <ShieldCheck
              color="#D9B56A"
              size={23}
            />
          </View>
        </TouchableOpacity>

        {/* =================================================
            General + Account
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          گشتی و هەژمار
        </Text>

        <View
          style={styles.cardGroup}
        >
          <TouchableOpacity
            style={styles.optionRow}
            onPress={openProfile}
            activeOpacity={0.8}
          >
            <ChevronLeft
              color="#718096"
              size={18}
            />

            <Text
              style={styles.optionText}
            >
              پڕۆفایلی من
            </Text>

            <User
              color="#A0AEC0"
              size={20}
            />
          </TouchableOpacity>

          <View
            style={styles.divider}
          />

          <TouchableOpacity
            style={styles.optionRow}
            onPress={
              openNotifications
            }
            activeOpacity={0.8}
          >
            <ChevronLeft
              color="#718096"
              size={18}
            />

            <Text
              style={styles.optionText}
            >
              ئاگادارکردنەوەکان
            </Text>

            <Bell
              color="#A0AEC0"
              size={20}
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            Appearance + Language
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          ڕووکار و زمان
        </Text>

        <View
          style={styles.cardGroup}
        >
          <TouchableOpacity
            style={styles.optionRow}
            onPress={changeLanguage}
            activeOpacity={0.8}
          >
            <View
              style={styles.rowLeft}
            >
              <ChevronLeft
                color="#718096"
                size={18}
              />

              <Text
                style={
                  styles.subValueText
                }
              >
                {language}
              </Text>
            </View>

            <Text
              style={styles.optionText}
            >
              گۆڕینی زمان
            </Text>

            <Globe
              color="#A0AEC0"
              size={20}
            />
          </TouchableOpacity>

          <View
            style={styles.divider}
          />

          <View
            style={styles.optionRow}
          >
            <Switch
              value={isDarkMode}
              onValueChange={(
                value
              ) =>
                setIsDarkMode(value)
              }
              trackColor={{
                false: "#767577",
                true: "#D9B56A",
              }}
              thumbColor={
                isDarkMode
                  ? "#FFFFFF"
                  : "#f4f3f4"
              }
            />

            <Text
              style={styles.optionText}
            >
              دۆخی تاریکی (Dark Mode)
            </Text>

            {isDarkMode ? (
              <Moon
                color="#A0AEC0"
                size={20}
              />
            ) : (
              <Sun
                color="#A0AEC0"
                size={20}
              />
            )}
          </View>
        </View>

        {/* =================================================
            About
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          دەربارە
        </Text>

        <View
          style={styles.cardGroup}
        >
          <TouchableOpacity
            style={styles.optionRow}
            onPress={openAbout}
            activeOpacity={0.8}
          >
            <ChevronLeft
              color="#718096"
              size={18}
            />

            <Text
              style={styles.optionText}
            >
              دەربارەی ئەپ
            </Text>

            <Info
              color="#A0AEC0"
              size={20}
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            Logout
        ================================================= */}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut
            color="#EF4444"
            size={20}
          />

          <Text
            style={styles.logoutText}
          >
            چوونە دەرەوە لە هەژمار
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* =====================================================
          Admin Login Modal
      ===================================================== */}

      <Modal
        animationType="fade"
        transparent
        visible={
          isAdminModalVisible
        }
        onRequestClose={() =>
          setIsAdminModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <TouchableOpacity
                onPress={() =>
                  setIsAdminModalVisible(
                    false
                  )
                }
                activeOpacity={0.8}
              >
                <X
                  color="#A0AEC0"
                  size={22}
                />
              </TouchableOpacity>

              <Text
                style={
                  styles.modalTitle
                }
              >
                چوونە ژوورەوەی بەڕێوەبەر
              </Text>
            </View>

            {/* Email */}

            <Text
              style={
                styles.inputLabel
              }
            >
              ئیمەیڵی بەڕێوەبەر
            </Text>

            <TextInput
              style={
                styles.textInput
              }
              placeholder="pkarimi1876@gmail.com"
              placeholderTextColor="#556987"
              value={inputEmail}
              onChangeText={
                setInputEmail
              }
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            {/* Password */}

            <Text
              style={
                styles.inputLabel
              }
            >
              وشەی نهێنی (پاسۆرد)
            </Text>

            <TextInput
              style={
                styles.textInput
              }
              placeholder="••••••••••••"
              placeholderTextColor="#556987"
              value={inputPassword}
              onChangeText={
                setInputPassword
              }
              secureTextEntry
            />

            {/* Login */}

            <TouchableOpacity
              style={
                styles.loginButton
              }
              onPress={
                handleAdminLogin
              }
              activeOpacity={0.8}
            >
              <Text
                style={
                  styles.loginButtonText
                }
              >
                چوونە ژوورەوە بۆ پانێڵ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* =====================================================
   Styles
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B131F",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2C3D",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#172554",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  headerSpacer: {
    width: 42,
    height: 42,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionTitle: {
    color: "#718096",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    textAlign: "right",
  },

  adminOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    backgroundColor:
      "rgba(217, 181, 106, 0.08)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      "rgba(217, 181, 106, 0.28)",
    marginBottom: 20,
  },

  iconBoxAdmin: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      "rgba(217, 181, 106, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  optionTextGroup: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 12,
  },

  optionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },

  optionSub: {
    color: "#A0AEC0",
    fontSize: 11,
    marginTop: 3,
    textAlign: "right",
  },

  cardGroup: {
    backgroundColor: "#131D2A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    marginBottom: 20,
    overflow: "hidden",
  },

  optionRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 16,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  subValueText: {
    color: "#D9B56A",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "bold",
  },

  optionText: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
    textAlign: "right",
    marginRight: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#1E2C3D",
    marginHorizontal: 16,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(239, 68, 68, 0.08)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      "rgba(239, 68, 68, 0.25)",
    marginTop: 10,
  },

  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#131D2A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    padding: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  inputLabel: {
    color: "#A0AEC0",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "right",
  },

  textInput: {
    backgroundColor: "#0B131F",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 12,
    color: "#FFFFFF",
    paddingHorizontal: 15,
    height: 50,
    fontSize: 14,
    textAlign: "right",
    marginBottom: 16,
  },

  loginButton: {
    backgroundColor: "#D9B56A",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  loginButtonText: {
    color: "#0B131F",
    fontSize: 15,
    fontWeight: "bold",
  },
});