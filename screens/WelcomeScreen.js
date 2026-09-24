// screens/WelcomeScreen.js

import React, { useEffect, useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';

import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { makeRedirectUri } from 'expo-auth-session';

import { COLORS } from '../constants/theme';
import { supabase } from '../lib/supabase';

const redirectTo = makeRedirectUri({
  scheme: 'blesanapp',
  path: 'auth/callback',
});

export default function WelcomeScreen({
  onLoginSuccess,
  onContinue,
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==============================
  // Deep Link / Email Confirmation
  // ==============================
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;

      console.log('AUTH REDIRECT URL:', url);

      try {
        const urlObject = new URL(url);

        // ------------------------------
        // شێوازی code
        // ------------------------------
        const code = urlObject.searchParams.get('code');

        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }

          if (onLoginSuccess) {
            onLoginSuccess();
          }

          return;
        }

        // ------------------------------
        // شێوازی access_token / refresh_token
        // ------------------------------
        const hash = urlObject.hash?.replace('#', '');

        if (hash) {
          const params = new URLSearchParams(hash);

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (error) {
              throw error;
            }

            if (onLoginSuccess) {
              onLoginSuccess();
            }

            return;
          }
        }

        console.log('No auth session found in redirect URL');
      } catch (error) {
        console.log('DEEP LINK ERROR:', error);

        Alert.alert(
          'کێشەیەک ڕوویدا',
          error?.message ||
            'نەتوانرا پشتڕاستکردنەوەی ئیمەیل تەواو بکرێت.'
        );
      }
    };

    Linking.getInitialURL().then(handleDeepLink);

    const subscription = Linking.addEventListener(
      'url',
      ({ url }) => {
        handleDeepLink(url);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [onLoginSuccess]);

  // ==============================
  // Login / Register
  // ==============================
  const handleAuth = async () => {
    if (!emailOrPhone.trim() || !password.trim()) {
      Alert.alert(
        'ئاگاداری',
        'تکایە هەموو خانەکان پڕبکەرەوە.'
      );
      return;
    }

    setLoading(true);

    try {
      // ==============================
      // LOGIN
      // ==============================
      if (isLogin) {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: emailOrPhone.trim(),
            password: password,
          });

        if (error) {
          throw error;
        }

        console.log('LOGIN DATA:', data);

        if (data?.session) {
          // گواستنەوە بۆ MainApp
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        } else {
          Alert.alert(
            'ئاگاداری',
            'نەتوانرا session ـی بەکارهێنەر دروست بکرێت.'
          );
        }

        return;
      }

      // ==============================
      // REGISTER
      // ==============================
      const { data, error } =
        await supabase.auth.signUp({
          email: emailOrPhone.trim(),
          password: password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });

      if (error) {
        throw error;
      }

      console.log('REGISTER DATA:', data);

      // ئەگەر Confirm Email داخراوە
      if (data?.session) {
        if (onLoginSuccess) {
          onLoginSuccess();
        }

        return;
      }

      // ئەگەر Supabase هێشتا confirmation داوادەکات
      Alert.alert(
        'تۆمارکردن',
        'تۆمارکردن سەرکەوتوو بوو. تکایە دۆخی ئیمەیلەکەت بپشکنە.'
      );

    } catch (err) {
      console.log('AUTH ERROR:', err);

      Alert.alert(
        'کێشەیەک ڕوویدا',
        err?.message ||
          'هەڵەیەکی نەناسراو ڕوویدا.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bg-village.jpg')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>

          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : 'height'
            }
            style={styles.keyboardView}
          >

            <View style={styles.headerBox}>
              <Text style={styles.mainTitle}>
                ئاوایی بڵەسەن
              </Text>

              <Text style={styles.subTitle}>
                بەخێربێیت بۆ گوندەکەمان
              </Text>
            </View>

            <View style={styles.authCard}>

              {/* Login / Register Tabs */}
              <View style={styles.tabContainer}>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    !isLogin && styles.activeTabBtn,
                  ]}
                  onPress={() => setIsLogin(false)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      !isLogin && styles.activeTabText,
                    ]}
                  >
                    خۆتۆمارکردن
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    isLogin && styles.activeTabBtn,
                  ]}
                  onPress={() => setIsLogin(true)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isLogin && styles.activeTabText,
                    ]}
                  >
                    چوونە ژوورەوە
                  </Text>
                </TouchableOpacity>

              </View>

              {/* Email */}
              <View style={styles.inputBox}>
                <Mail
                  color="#A0AEC0"
                  size={20}
                />

                <TextInput
                  style={styles.input}
                  placeholder="ئیمەیل"
                  placeholderTextColor="#718096"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password */}
              <View style={styles.inputBox}>

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff
                      color="#A0AEC0"
                      size={20}
                    />
                  ) : (
                    <Eye
                      color="#A0AEC0"
                      size={20}
                    />
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="وشەی نهێنی"
                  placeholderTextColor="#718096"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Lock
                  color="#A0AEC0"
                  size={20}
                />

              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  loading &&
                    styles.submitBtnDisabled,
                ]}
                onPress={handleAuth}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>
                  {loading
                    ? 'تکایە چاوەڕێ بکە...'
                    : isLogin
                    ? 'چوونە ژوورەوە'
                    : 'تۆمارکردن'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.footerNote}>
                بۆ بینین و بەشدارییکردن پێویستە بچیتە ژوورەوە
              </Text>

            </View>

          </KeyboardAvoidingView>

        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 31, 0.65)',
  },

  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },

  headerBox: {
    alignItems: 'center',
    marginTop: 50,
  },

  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 10,
  },

  subTitle: {
    fontSize: 16,
    color: '#E2E8F0',
    marginTop: 6,
    textAlign: 'center',
  },

  authCard: {
    backgroundColor: 'rgba(19, 29, 42, 0.85)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0B131F',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  activeTabBtn: {
    backgroundColor: '#1E2C3D',
  },

  tabText: {
    color: '#718096',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  activeTabText: {
    color: COLORS.primary || '#D97706',
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B131F',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E2C3D',
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    textAlign: 'right',
    paddingHorizontal: 10,
    fontSize: 13,
  },

  submitBtn: {
    backgroundColor: COLORS.primary || '#D97706',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  submitBtnDisabled: {
    opacity: 0.6,
  },

  submitBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  footerNote: {
    color: '#718096',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
});