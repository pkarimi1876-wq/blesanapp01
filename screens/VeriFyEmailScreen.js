import React, { useEffect, useRef, useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import {
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";

import { supabase } from "../lib/supabase";

export default function VerifyEmailScreen({ navigation, route }) {
  const email = route?.params?.email || "";
  const fullName = route?.params?.fullName || "";

  const [code, setCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (value, index) => {
    const cleanValue = value.replace(/[^0-9]/g, "");

    const nextCode = [...code];
    nextCode[index] = cleanValue.slice(-1);

    setCode(nextCode);

    if (cleanValue && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (
      event.nativeEvent.key === "Backspace" &&
      !code[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = code.join("");

    if (token.length !== 6) {
      Alert.alert(
        "ئاگاداری",
        "تکایە هەموو ٦ ژمارەی کۆدەکە بنووسە."
      );
      return;
    }

    if (!email) {
      Alert.alert(
        "هەڵە",
        "ئیمەیل نەدۆزرایەوە."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        Alert.alert(
          "کۆدەکە هەڵەیە",
          error.message ||
            "کۆدی پشتڕاستکردنەوە دروست نییە."
        );
        return;
      }

      const user = data?.user;

      if (!user) {
        Alert.alert(
          "هەڵە",
          "بەکارهێنەر نەدۆزرایەوە."
        );
        return;
      }

      // Save user profile
      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email,
            full_name: fullName,
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) {
        console.log(
          "PROFILE SAVE ERROR:",
          profileError
        );

        Alert.alert(
          "تێبینی",
          "چوونەژوورەوە سەرکەوتوو بوو، بەڵام ناوەکەت نەخزایەوە."
        );
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "MainTabs",
          },
        ],
      });
    } catch (error) {
      console.log(
        "VERIFY OTP ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "کێشەیەک لە پشتڕاستکردنەوە ڕوویدا."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) {
      return;
    }

    try {
      setResending(true);

      const {
        error,
      } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        Alert.alert(
          "هەڵە",
          error.message ||
            "نەتوانرا کۆدی نوێ بنێردرێت."
        );
        return;
      }

      setCode([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setCountdown(60);

      inputs.current[0]?.focus();

      Alert.alert(
        "کۆدی نوێ نێردرا",
        "کۆدی نوێمان بۆ ئیمەیلەکەت ناردووە."
      );
    } catch (error) {
      Alert.alert(
        "هەڵە",
        error?.message ||
          "نەتوانرا کۆدی نوێ بنێردرێت."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#071A33"
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowRight
              color="#FFFFFF"
              size={22}
            />
          </TouchableOpacity>

          <View style={styles.iconBox}>
            <Mail
              color="#D9B56A"
              size={36}
            />
          </View>

          <Text style={styles.title}>
            پشتڕاستکردنەوەی ئیمەیل
          </Text>

          <Text style={styles.subtitle}>
            کۆدی ٦ ژمارەیی بۆ ئەم ئیمەیلە نێردراوە:
          </Text>

          <Text style={styles.emailText}>
            {email}
          </Text>

          <View style={styles.card}>
            <View style={styles.topLine} />

            <Text style={styles.cardTitle}>
              کۆدی پشتڕاستکردنەوە
            </Text>

            <Text style={styles.cardDescription}>
              کۆدی نێردراو لە خانەکانی خوارەوە بنووسە.
            </Text>

            <View style={styles.codeRow}>
              {code.map((value, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  value={value}
                  onChangeText={(text) =>
                    handleChange(text, index)
                  }
                  onKeyPress={(event) =>
                    handleKeyPress(event, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                loading && styles.disabledButton,
              ]}
              activeOpacity={0.85}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#071A33"
                />
              ) : (
                <>
                  <ShieldCheck
                    color="#071A33"
                    size={20}
                  />

                  <Text style={styles.verifyButtonText}>
                    پشتڕاستکردنەوە
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              activeOpacity={0.7}
              onPress={handleResend}
              disabled={
                countdown > 0 || resending
              }
            >
              {resending ? (
                <ActivityIndicator
                  size="small"
                  color="#D9B56A"
                />
              ) : countdown > 0 ? (
                <Text style={styles.resendText}>
                  ناردنەوەی کۆد لە {countdown} چرکە
                </Text>
              ) : (
                <Text style={styles.resendTextActive}>
                  دووبارە ناردنەوەی کۆد
                </Text>
              )}
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
    backgroundColor: "#071A33",
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#102846",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  iconBox: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: "#102846",
    borderWidth: 1,
    borderColor: "#D9B56A",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#AFC0D2",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },

  emailText: {
    color: "#D9B56A",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },

  card: {
    backgroundColor: "#102846",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2B4665",
    padding: 20,
  },

  topLine: {
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#D9B56A",
    alignSelf: "center",
    marginBottom: 17,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  cardDescription: {
    color: "#B9C7D8",
    fontSize: 13,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 24,
  },

  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    direction: "ltr",
    marginBottom: 24,
  },

  codeInput: {
    width: 43,
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#294362",
    backgroundColor: "#071A33",
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  verifyButton: {
    minHeight: 55,
    borderRadius: 15,
    backgroundColor: "#D9B56A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  verifyButtonText: {
    color: "#071A33",
    fontSize: 16,
    fontWeight: "900",
  },

  resendButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: 10,
  },

  resendText: {
    color: "#7F91A6",
    fontSize: 13,
    fontWeight: "600",
  },

  resendTextActive: {
    color: "#D9B56A",
    fontSize: 13,
    fontWeight: "800",
  },
});