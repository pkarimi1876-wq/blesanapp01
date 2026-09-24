
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {
  User,
  Lock,
  LogIn,
  KeyRound,
} from "lucide-react-native";

import { COLORS } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function AuthorsScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // Login
  // =========================
  const handleLogin = async () => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      Alert.alert(
        "زانیاری کەمە",
        "تکایە Username و وشەی نهێنی بنووسە."
      );
      return;
    }

    try {
      setLoading(true);

      // 1. دۆزینەوەی نووسەر بە Username
      const { data: writer, error: writerError } =
        await supabase
          .from("writers")
          .select(
            "id, full_name, username, user_id, email"
          )
          .eq("username", cleanUsername)
          .maybeSingle();

      if (writerError) {
        throw writerError;
      }

      if (!writer) {
        Alert.alert(
          "چوونەژوورەوە سەرکەوتوو نەبوو",
          "ئەم Username ـە لە سیستەمدا نەدۆزرایەوە."
        );
        return;
      }

      // 2. دڵنیابوون لە user_id
      if (!writer.user_id) {
        Alert.alert(
          "هەژمارەکە ئامادە نییە",
          "ئەم نووسەرە هێشتا بە هەژماری چوونەژوورەوە نەبەستراوەتەوە."
        );
        return;
      }

      // 3. دڵنیابوون لە email
      if (!writer.email) {
        Alert.alert(
          "ئیمەیڵ نەدۆزرایەوە",
          "ئیمەیڵی ئەم نووسەرە لە سیستەمدا تۆمار نەکراوە."
        );
        return;
      }

      // 4. Login بە Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: writer.email,
          password: cleanPassword,
        });

      if (authError) {
        console.log("AUTH ERROR:", authError);

        Alert.alert(
          "هەڵەی چوونەژوورەوە",
          authError.message ||
            "هەڵەیەک ڕوویدا."
        );

        return;
      }

      if (!authData?.user) {
        Alert.alert(
          "هەڵە",
          "نەتوانرا هەژماری نووسەر پشتڕاست بکرێتەوە."
        );
        return;
      }

      // 5. دڵنیابوون لە یەکسانبوونی Auth User و Writer
      if (
        authData.user.id !== writer.user_id
      ) {
        await supabase.auth.signOut();

        Alert.alert(
          "هەڵەی پەیوەندی",
          "هەژماری Auth و پڕۆفایلی نووسەر بە یەکەوە نەگونجێن."
        );

        return;
      }

      // 6. چوونە Dashboard
      navigation.replace("WriterDashboard", {
        writer: {
          id: writer.id,
          name: writer.full_name,
          full_name: writer.full_name,
          username: writer.username,
          user_id: writer.user_id,
          auth_user_id: authData.user.id,
          email: writer.email,
        },
      });
    } catch (error) {
      console.log(
        "Writer login error:",
        error
      );

      Alert.alert(
        "هەڵە",
        "کێشەیەک ڕوویدا لە کاتی چوونەژوورەوە. تکایە دووبارە هەوڵ بدە."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Change Password
  // =========================
  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  // =========================
  // UI
  // =========================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoCircle}>
          <LogIn
            size={34}
            color={COLORS.primary}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          چوونەژوورەوەی نووسەر
        </Text>

        <Text style={styles.subtitle}>
          بە Username و وشەی نهێنی خۆت بچۆ ژوورەوە
        </Text>

        {/* Username */}
        <View style={styles.inputBox}>
          <User
            size={20}
            color={COLORS.textSub}
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={
              COLORS.textSub
            }
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {/* Password */}
        <View style={styles.inputBox}>
          <Lock
            size={20}
            color={COLORS.textSub}
          />

          <TextInput
            style={styles.input}
            placeholder="وشەی نهێنی"
            placeholderTextColor={
              COLORS.textSub
            }
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            loading &&
              styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <LogIn
              size={20}
              color="#fff"
            />
          )}

          <Text style={styles.loginText}>
            {loading
              ? "چاوەڕوان بە..."
              : "چوونەژوورەوە"}
          </Text>
        </TouchableOpacity>

        {/* Change Password Button */}
        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={handleChangePassword}
          activeOpacity={0.8}
          disabled={loading}
        >
          <KeyRound
            size={19}
            color={COLORS.primary}
          />

          <Text
            style={styles.changePasswordText}
          >
            گۆڕینی وشەی نهێنی
          </Text>
        </TouchableOpacity>

        <Text style={styles.changePasswordHint}>
          ئەگەر دەتەوێت وشەی نهێنیی هەژمارەکەت بگۆڕیت
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSub,
    textAlign: "center",
    marginBottom: 28,
  },

  inputBox: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 10,
    textAlign: "left",
  },

  loginButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // =========================
  // Change Password
  // =========================

 changePasswordButton: {
  height: 52,
  borderRadius: 14,
  backgroundColor: COLORS.primary,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 9,
  marginTop: 14,
},

changePasswordText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "700",
},

  changePasswordHint: {
    color: COLORS.textSub,
    fontSize: 10,
    textAlign: "center",
    marginTop: 9,
  },
});

