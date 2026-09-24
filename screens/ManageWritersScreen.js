
import React, { useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
} from "lucide-react-native";

import { supabase } from "../lib/supabase";

const SUPABASE_URL =
  "https://quvnwtkxmvhklnkqvvfc.supabase.co";

export default function ManageWritersScreen({
  navigation,
}) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddWriter = async () => {
    if (loading) return;

    const name = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!name) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوی تەواوی نووسەر بنووسە."
      );
      return;
    }

    if (!cleanUsername) {
      Alert.alert(
        "ئاگاداری",
        "تکایە Username ـی نووسەر بنووسە."
      );
      return;
    }

    const usernameRegex = /^[a-z0-9._-]+$/;

    if (!usernameRegex.test(cleanUsername)) {
      Alert.alert(
        "Username هەڵەیە",
        "Username تەنها دەتوانێت پیتی ئینگلیزی، ژمارە، نقطە، _ و - لەخۆ بگرێت."
      );
      return;
    }

    if (!cleanEmail) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ئیمەیڵی نووسەر بنووسە."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        "ئیمەیڵ هەڵەیە",
        "تکایە ئیمەیڵێکی دروست بنووسە."
      );
      return;
    }

    if (!cleanPassword) {
      Alert.alert(
        "ئاگاداری",
        "تکایە وشەی نهێنی بنووسە."
      );
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert(
        "وشەی نهێنی زۆر کورتە",
        "وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت."
      );
      return;
    }

    try {
      setLoading(true);

      // --------------------------------
      // Get current Admin session
      // --------------------------------

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        Alert.alert(
          "هەڵە",
          sessionError.message ||
            "کێشەیەک لە وەرگرتنی Session ـی Admin ڕوویدا."
        );
        return;
      }

      const session = sessionData?.session;

      if (!session?.access_token) {
        Alert.alert(
          "چوونەژوورەوە پێویستە",
          "Session ـی Admin نەدۆزرایەوە. تکایە سەرەتا بە Admin بچۆ ژوورەوە."
        );
        return;
      }

      // --------------------------------
      // Direct request to Edge Function
      // --------------------------------

     const response = await fetch(
  `${SUPABASE_URL}/functions/v1/create-writer`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      full_name: name,
      username: cleanUsername,
      email: cleanEmail,
      password: cleanPassword,
    }),
  }
);
      const rawText = await response.text();

      let result = null;

      try {
        result = rawText
          ? JSON.parse(rawText)
          : null;
      } catch {
        result = {
          success: false,
          error: rawText || "وەڵامی نەناسراو لە Supabase.",
        };
      }

      // --------------------------------
      // HTTP error
      // --------------------------------

      if (!response.ok) {
        Alert.alert(
          "نەتوانرا نووسەر زیاد بکرێت",
          result?.error ||
            `Supabase error: ${response.status}`
        );
        return;
      }

      // --------------------------------
      // Backend error
      // --------------------------------

      if (!result?.success) {
        Alert.alert(
          "نەتوانرا نووسەر زیاد بکرێت",
          result?.error ||
            "Edge Function وەڵامی سەرکەوتوو نەدا."
        );
        return;
      }

      // --------------------------------
      // Success
      // --------------------------------

      Alert.alert(
        "نووسەر زیادکرا ✅",
        `نووسەری "${name}" بە سەرکەوتوویی دروست کرا.\n\nUsername: ${cleanUsername}\nEmail: ${cleanEmail}`,
        [
          {
            text: "باشە",
            onPress: () => {
              setFullName("");
              setUsername("");
              setEmail("");
              setPassword("");
      
              setShowPassword(false);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "هەڵە",
        error?.message ||
          "نەتوانرا پەیوەندی بە Supabase بکرێت."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTitleBox}>
            <ShieldCheck
              color="#D97706"
              size={22}
            />

            <Text style={styles.headerTitle}>
              بەڕێوەبردنی نووسەران
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <ArrowRight
              color="#FFF"
              size={22}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <UserPlus
                color="#D97706"
                size={24}
              />
            </View>

            <Text style={styles.infoTitle}>
              زیادکردنی نووسەری نوێ
            </Text>

            <Text style={styles.infoText}>
              لەم بەشەدا دەتوانیت هەژماری نووسەرێکی نوێ
              دروست بکەیت. نووسەر دواتر بە Username و
              وشەی نهێنی خۆی دەچێتە ناو بەشی تایبەتی خۆی.
            </Text>
          </View>

          <Text style={styles.label}>
            ناوی تەواو
          </Text>

          <View style={styles.inputBox}>
            <User
              color="#94A3B8"
              size={19}
            />

            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="بۆ نموونە: پەیمان"
              placeholderTextColor="#64748B"
              textAlign="right"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>
            Username
          </Text>

          <View style={styles.inputBox}>
            <UserPlus
              color="#94A3B8"
              size={19}
            />

            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="بۆ نموونە: peyman"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              autoCorrect={false}
              textAlign="right"
              editable={!loading}
            />
          </View>

          <Text style={styles.hint}>
            تەنها پیتی ئینگلیزی، ژمارە و . _ -
            بەکاربهێنە.
          </Text>

          <Text style={styles.label}>
            ئیمەیڵ
          </Text>

          <View style={styles.inputBox}>
            <Mail
              color="#94A3B8"
              size={19}
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textAlign="right"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>
            وشەی نهێنی
          </Text>

          <View style={styles.inputBox}>
            <Lock
              color="#94A3B8"
              size={19}
            />

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="وشەی نهێنی"
              placeholderTextColor="#64748B"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textAlign="right"
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff
                  color="#94A3B8"
                  size={19}
                />
              ) : (
                <Eye
                  color="#94A3B8"
                  size={19}
                />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت.
          </Text>

          <View style={styles.securityCard}>
            <Check
              color="#D97706"
              size={19}
            />

            <Text style={styles.securityText}>
              وشەی نهێنی بە شێوەی ئاسایی لە writers ـدا
              هەڵناگیرێت؛ Supabase Auth بەڕێوەی دەبات.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleAddWriter}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#000"
                size="small"
              />
            ) : (
              <UserPlus
                color="#000"
                size={21}
              />
            )}

            <Text style={styles.addButtonText}>
              {loading
                ? "چاوەڕوان بە..."
                : "زیادکردنی نووسەر"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B131F",
  },

  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2C3D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#172554",
  },

  content: {
    padding: 16,
    paddingBottom: 60,
  },

  infoCard: {
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },

  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor:
      "rgba(217, 119, 6, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 12,
  },

  infoTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
  },

  infoText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right",
    marginTop: 8,
  },

  label: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 8,
    marginTop: 10,
  },

  inputBox: {
    minHeight: 54,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  input: {
    flex: 1,
    color: "#FFF",
    marginHorizontal: 10,
    paddingVertical: 12,
    textAlign: "right",
  },

  eyeButton: {
    padding: 5,
  },

  hint: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
    marginBottom: 4,
  },

  securityCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor:
      "rgba(217, 119, 6, 0.08)",
    borderWidth: 1,
    borderColor:
      "rgba(217, 119, 6, 0.25)",
    borderRadius: 12,
    padding: 13,
    marginTop: 18,
  },

  securityText: {
    flex: 1,
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "right",
  },

  addButton: {
    minHeight: 56,
    borderRadius: 13,
    backgroundColor: "#D97706",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },

  disabledButton: {
    opacity: 0.6,
  },

  addButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "900",
  },
});
