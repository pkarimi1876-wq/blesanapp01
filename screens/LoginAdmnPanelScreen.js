import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react-native";
import { supabase } from "../lib/supabase";

export default function LoginAdmnPanelScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= فەنکشنی چوونەژوورەوەی ئەمنی =================
  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert("ئاگاداری", "تکایە ئیمەیڵ و وشەی نهێنی بە دروستی بنووسە.");
      return;
    }

    try {
      setLoading(true);

      // ١. پشکنینی ئیمەیڵ و وشەی نهێنی لە ڕێگەی Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError) {
        Alert.alert("هەڵەی چوونەژوورەوە", "ئیمەیڵ یان وشەی نهێنی هەڵەیە!");
        setLoading(false);
        return;
      }

      // ٢. خوێندنەوەی دەسەڵاتەکانی ئەدمین لە جدولی public.admins
      const { data: adminData, error: dbError } = await supabase
        .from("admins")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (dbError || !adminData) {
        Alert.alert("دەسەڵات ڕەتکرایەوە", "ئەم ئیمەیڵە وەک ئەدمین دەسەڵاتی بۆ دیاری نەکراوە.");
        setLoading(false);
        return;
      }

      if (!adminData.is_active) {
        Alert.alert("ئاگاداری", "دەسەڵاتی ئەم هەژمارە ناچالاک کراوە.");
        setLoading(false);
        return;
      }

      // ٣. چوونەژوورەوەی سەرکەوتوو بۆ پانێڵ
      navigation.navigate("AdminPanelHome", { adminInfo: adminData });
    } catch (err) {
      Alert.alert("هەڵەی سیستەم", err.message || "کێشەیەک ڕووی دا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ArrowRight color="#FFF" size={22} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>ورود بە پانل ادمین</Text>
            <ShieldCheck color="#D97706" size={22} />
          </View>
        </View>

        {/* Body Form */}
        <View style={styles.formContainer}>
          <View style={styles.logoBox}>
            <ShieldCheck color="#D97706" size={54} />
            <Text style={styles.title}>پانێڵی بەڕێوەبەڕایەتی بڵەسەن</Text>
            <Text style={styles.subtitle}>
              تەنها سوپەر ئەدمین و ئەدمینە ڕێگەپێدراوەکان دەتوانن بچنە ژوورەوە
            </Text>
          </View>

          {/* Email Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="ئیمەیڵ (Email)"
              placeholderTextColor="#718096"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={true}
              selectTextOnFocus={true}
            />
            <Mail color="#A0AEC0" size={20} style={styles.inputIcon} />
          </View>

          {/* Password Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="وشەی نهێنی (Password)"
              placeholderTextColor="#718096"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={true}
              selectTextOnFocus={true}
            />
            <Lock color="#A0AEC0" size={20} style={styles.inputIcon} />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.loginBtnText}>چوونه‌ژووره‌وەی ئەمنی</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B131F" },
  inner: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2C3D",
  },
  headerTitleBox: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF", marginRight: 8 },
  backBtn: { padding: 6 },
  formContainer: { flex: 1, padding: 20, justifyContent: "center" },
  logoBox: { alignItems: "center", marginBottom: 30 },
  title: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 12 },
  subtitle: { color: "#A0AEC0", fontSize: 12, marginTop: 6, textAlign: "center" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131D2A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: { marginLeft: 10 },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    textAlign: "right",
    height: 52,
  },
  loginBtn: {
    backgroundColor: "#D97706",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginBtnText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});