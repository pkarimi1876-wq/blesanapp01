import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert("تکایە", "ئیمەیڵ و وشەی نهێنی پڕ بکەرەوە.");
      return;
    }

    // لە هەنگاوی داهاتوودا Supabase Login لێرە زیاد دەکەین
    Alert.alert(
      "تێبینی",
      "سیستەمی چوونەژوورەوە لە هەنگاوی داهاتوودا چالاک دەکرێت."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>

          <View style={styles.iconBox}>
            <Ionicons
              name="person-outline"
              size={42}
              color="#f59e0b"
            />
          </View>

          <Text style={styles.title}>
            چوونەژوورەوە
          </Text>

          <Text style={styles.subtitle}>
            بۆ بەکارهێنانی هەژمارەکەت بچۆ ژوورەوە
          </Text>

          <View style={styles.form}>

            <Text style={styles.label}>
              ئیمەیڵ
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#94a3b8"
              />

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="ئیمەیڵەکەت بنووسە"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>
              وشەی نهێنی
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#94a3b8"
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="وشەی نهێنی بنووسە"
                placeholderTextColor="#64748b"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.85}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>
                چوونەژوورەوە
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#0b1329"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("UserSignUp")}
            >
              <Text style={styles.signupText}>
                هەژمارت نییە؟ هەژمارێک دروست بکە
              </Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color="#94a3b8"
            />

            <Text style={styles.backText}>
              گەڕانەوە
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1329",
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },

  iconBox: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#111c38",
    borderWidth: 2,
    borderColor: "#f59e0b",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 29,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 30,
  },

  form: {
    width: "100%",
  },

  label: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 8,
    marginTop: 12,
  },

  inputWrapper: {
    height: 54,
    backgroundColor: "#111c38",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    marginLeft: 10,
    textAlign: "right",
  },

  loginButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: "#f59e0b",
    marginTop: 28,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loginButtonText: {
    color: "#0b1329",
    fontSize: 16,
    fontWeight: "800",
  },

  signupButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 10,
  },

  signupText: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  backButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    gap: 7,
  },

  backText: {
    color: "#94a3b8",
    fontSize: 13,
  },
});