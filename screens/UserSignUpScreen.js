
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export default function UserSignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "تکایە",
        "تکایە هەموو خانەکان پڕ بکەرەوە."
      );
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        "ئیمەیڵ هەڵەیە",
        "تکایە ئیمەیڵێکی دروست بنووسە."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "وشەی نهێنی",
        "وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "وشەی نهێنی",
        "وشەی نهێنی و دووبارەکردنەوەکەی یەکسان نین."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (error) {
        Alert.alert(
          "هەڵە",
          error.message
        );
        return;
      }

      if (data?.user) {
        Alert.alert(
          "هەژمارەکەت دروست کرا ✓",
          "ئیمەیڵێکت بۆ نێردراوە.\n\nتکایە بچۆ بۆ ئیمەیڵەکەت و بەستەری پشتڕاستکردنەوەکە بکەرەوە، پاشان بگەڕێوە و بچۆ ژوورەوە.",
          [
            {
              text: "باشە",
              onPress: () => navigation.navigate("UserLogin"),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "هەڵە",
        "کێشەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            {/* ICON */}
            <View style={styles.iconBox}>
              <Ionicons
                name="person-add-outline"
                size={40}
                color="#f59e0b"
              />
            </View>

            {/* TITLE */}
            <Text style={styles.title}>
              دروستکردنی هەژمار
            </Text>

            <Text style={styles.subtitle}>
              هەژمارێکی تایبەت دروست بکە بۆ بەشداری کردن لە کۆمەڵگەی بڵەسەن
            </Text>

            {/* FORM */}
            <View style={styles.form}>

              {/* FIRST NAME */}
              <Text style={styles.label}>
                ناوی یەکەم
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#94a3b8"
                />

                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="ناوی یەکەم بنووسە"
                  placeholderTextColor="#64748b"
                  textAlign="right"
                  autoCapitalize="words"
                />
              </View>

              {/* LAST NAME */}
              <Text style={styles.label}>
                ناوی کۆتایی
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#94a3b8"
                />

                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="ناوی کۆتایی بنووسە"
                  placeholderTextColor="#64748b"
                  textAlign="right"
                  autoCapitalize="words"
                />
              </View>

              {/* EMAIL */}
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
                  placeholder="example@email.com"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textAlign="right"
                />
              </View>

              {/* PASSWORD */}
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
                  placeholder="لانیکەم ٦ پیت"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textAlign="right"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={21}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>

              {/* CONFIRM PASSWORD */}
              <Text style={styles.label}>
                دووبارەی وشەی نهێنی
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#94a3b8"
                />

                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="وشەی نهێنی دووبارە بنووسە"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textAlign="right"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={21}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>

              {/* SIGN UP BUTTON */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  loading && styles.signupButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#0b1329"
                  />
                ) : (
                  <>
                    <Text style={styles.signupButtonText}>
                      دروستکردنی هەژمار
                    </Text>

                    <Ionicons
                      name="person-add-outline"
                      size={20}
                      color="#0b1329"
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* LOGIN */}
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("UserLogin")}
                disabled={loading}
              >
                <Text style={styles.loginText}>
                  هەژمارم هەیە، بچمە ژوورەوە
                </Text>
              </TouchableOpacity>

            </View>

            {/* BACK */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              disabled={loading}
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
        </ScrollView>
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

  scrollContent: {
    flexGrow: 1,
    paddingVertical: 25,
  },

  content: {
    paddingHorizontal: 28,
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

    shadowColor: "#f59e0b",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
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
    marginBottom: 25,
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
    marginTop: 10,
  },

  inputWrapper: {
    minHeight: 54,
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
    marginHorizontal: 10,
    minHeight: 52,
  },

  signupButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: "#f59e0b",
    marginTop: 25,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    shadowColor: "#f59e0b",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  signupButtonDisabled: {
    opacity: 0.65,
  },

  signupButtonText: {
    color: "#0b1329",
    fontSize: 16,
    fontWeight: "800",
  },

  loginButton: {
    marginTop: 15,
    alignItems: "center",
    paddingVertical: 10,
  },

  loginText: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  backButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingBottom: 10,
    gap: 7,
  },

  backText: {
    color: "#94a3b8",
    fontSize: 13,
  },
});

