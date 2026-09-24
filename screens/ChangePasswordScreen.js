
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
  Mail,
  Send,
  ArrowLeft,
  KeyRound,
} from "lucide-react-native";

import { COLORS } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function ChangePasswordScreen({ navigation, route }) {
  const initialUsername = route?.params?.username || "";

  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      Alert.alert(
        "Username پێویستە",
        "تکایە Username ـی هەژماری نووسەر بنووسە."
      );
      return;
    }

    try {
      setLoading(true);

      // دۆزینەوەی نووسەر بە Username
      const { data: writer, error: writerError } = await supabase
        .from("writers")
        .select("id, full_name, username, email, user_id")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (writerError) {
        console.log("WRITER LOOKUP ERROR:", writerError);
        Alert.alert(
          "هەڵە",
          "کێشەیەک ڕوویدا لە دۆزینەوەی هەژماری نووسەر."
        );
        return;
      }

      if (!writer) {
        Alert.alert(
          "هەژمار نەدۆزرایەوە",
          "هیچ نووسەرێک بەو Username ـە لە سیستەمدا نەدۆزرایەوە."
        );
        return;
      }

      if (!writer.email) {
        Alert.alert(
          "ئیمەیڵ نەدۆزرایەوە",
          "ئیمەیڵی ئەم هەژمارەیە لە سیستەمدا تۆمار نەکراوە."
        );
        return;
      }

      // ناردنی لینکی گۆڕینی وشەی نهێنی
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          writer.email
        );

      if (resetError) {
        console.log("RESET PASSWORD ERROR:", resetError);

        Alert.alert(
          "ناردنی ئیمەیڵ سەرکەوتوو نەبوو",
          resetError.message ||
            "هەڵەیەک ڕوویدا لە ناردنی لینکی گۆڕینی وشەی نهێنی."
        );

        return;
      }

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        `لینکی گۆڕینی وشەی نهێنی بۆ ئیمەیڵی هەژماری "${writer.full_name}" نێردرا.\n\nتکایە Inbox ـەکەت بپشکنە و لەوێ وشەی نهێنی نوێ دابنێ.`,
        [
          {
            text: "باشە",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log("RESET PASSWORD CATCH ERROR:", error);

      Alert.alert(
        "هەڵە",
        "نەتوانرا داواکاریی گۆڕینی وشەی نهێنی بنێردرێت."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <ArrowLeft size={20} color={COLORS.text} />

          <Text style={styles.backText}>
            گەڕانەوە
          </Text>
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconCircle}>
          <KeyRound
            size={34}
            color={COLORS.primary}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          گۆڕینی وشەی نهێنی
        </Text>

        <Text style={styles.subtitle}>
          Username ـی خۆت بنووسە تا لینکی گۆڕینی وشەی نهێنی بۆ ئیمەیڵەکەت بنێردرێت
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
            placeholderTextColor={COLORS.textSub}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onSubmitEditing={handleResetPassword}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleResetPassword}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <Send
              size={20}
              color="#fff"
            />
          )}

          <Text style={styles.sendText}>
            {loading
              ? "دەنێردرێت..."
              : "ناردنی لینکی گۆڕینی وشەی نهێنی"}
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <Mail
              size={19}
              color={COLORS.primary}
            />

            <Text style={styles.infoTitle}>
              چۆن کار دەکات؟
            </Text>
          </View>

          <Text style={styles.infoText}>
            ١. Username ـی هەژماری نووسەر بنووسە.
            {"\n"}
            ٢. لینکی گۆڕینی وشەی نهێنی بۆ ئیمەیڵی هەژمارەکە دەنێردرێت.
            {"\n"}
            ٣. ئیمەیڵەکەت بکەرەوە و لینکی گۆڕینەکە بکە.
            {"\n"}
            ٤. وشەی نهێنی نوێ دابنێ.
          </Text>
        </View>
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

  backButton: {
    position: "absolute",
    top: 45,
    left: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },

  backText: {
    color: COLORS.text,
    fontSize: 14,
  },

  iconCircle: {
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
    lineHeight: 22,
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

  sendButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },

  sendText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },

  infoBox: {
    marginTop: 28,
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
  },

  infoText: {
    color: COLORS.textSub,
    fontSize: 13,
    lineHeight: 23,
  },
});

