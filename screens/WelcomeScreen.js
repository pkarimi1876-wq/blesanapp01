// screens/WelcomeScreen.js

import React, { useEffect, useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react-native';

import { makeRedirectUri } from 'expo-auth-session';

import { COLORS } from '../constants/theme';

import { supabase } from '../lib/supabase';

// =====================================================
// Email Confirmation Redirect
// =====================================================

const redirectTo = makeRedirectUri({
  scheme: 'blesanapp',
  path: 'auth/callback',
});

// =====================================================
// Welcome Screen
// =====================================================

export default function WelcomeScreen({
  onLoginSuccess,
  onContinue,
}) {
  const [isLogin, setIsLogin] = useState(true);

  // Login / Email
  const [emailOrPhone, setEmailOrPhone] = useState('');

  // Password
  const [password, setPassword] = useState('');

  // Register
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  // UI
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // Deep Link / Email Confirmation
  // =====================================================

  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;

      console.log(
        'AUTH REDIRECT URL:',
        url
      );

      try {
        const urlObject = new URL(url);

        // -----------------------------------------------
        // PKCE code
        // -----------------------------------------------

        const code =
          urlObject.searchParams.get(
            'code'
          );

        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (error) {
            throw error;
          }

          console.log(
            'EMAIL CONFIRMATION SUCCESS'
          );

          if (onLoginSuccess) {
            onLoginSuccess();
          }

          return;
        }

        // -----------------------------------------------
        // access_token / refresh_token
        // -----------------------------------------------

        const hash =
          urlObject.hash?.replace('#', '');

        if (hash) {
          const params =
            new URLSearchParams(hash);

          const accessToken =
            params.get(
              'access_token'
            );

          const refreshToken =
            params.get(
              'refresh_token'
            );

          if (
            accessToken &&
            refreshToken
          ) {
            const { error } =
              await supabase.auth.setSession({
                access_token:
                  accessToken,
                refresh_token:
                  refreshToken,
              });

            if (error) {
              throw error;
            }

            console.log(
              'EMAIL CONFIRMATION SUCCESS'
            );

            if (onLoginSuccess) {
              onLoginSuccess();
            }

            return;
          }
        }

        console.log(
          'No auth session found in redirect URL'
        );
      } catch (error) {
        console.log(
          'DEEP LINK ERROR:',
          error
        );

        Alert.alert(
          'کێشەیەک ڕوویدا',
          error?.message ||
            'نەتوانرا پشتڕاستکردنەوەی ئیمەیل تەواو بکرێت.'
        );
      }
    };

    // Initial URL
    Linking.getInitialURL().then(
      handleDeepLink
    );

    // URL event
    const subscription =
      Linking.addEventListener(
        'url',
        ({ url }) => {
          handleDeepLink(url);
        }
      );

    return () => {
      subscription.remove();
    };
  }, [onLoginSuccess]);

  // =====================================================
  // Login / Register
  // =====================================================

  const handleAuth = async () => {
    const cleanEmail =
      emailOrPhone
        .trim()
        .toLowerCase();

    const cleanFullName =
      fullName.trim();

    const cleanUsername =
      username.trim();

    // ---------------------------------------------------
    // Email validation
    // ---------------------------------------------------

    const emailRegex =
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

    // ---------------------------------------------------
    // Basic validation
    // ---------------------------------------------------

    if (!cleanEmail) {
      Alert.alert(
        'ئاگاداری',
        'تکایە ئیمەیل بنووسە.'
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert(
        'ئاگاداری',
        'تکایە وشەی نهێنی بنووسە.'
      );
      return;
    }

    if (
      !emailRegex.test(
        cleanEmail
      )
    ) {
      Alert.alert(
        'ئیمەیلی هەڵە',
        'تکایە ئیمەیلێکی دروست بنووسە.\nنموونە: example@gmail.com'
      );
      return;
    }

    // ---------------------------------------------------
    // Register validation
    // ---------------------------------------------------

    if (!isLogin) {
      if (!cleanFullName) {
        Alert.alert(
          'ئاگاداری',
          'تکایە ناوی تەواو بنووسە.'
        );
        return;
      }

      if (!cleanUsername) {
        Alert.alert(
          'ئاگاداری',
          'تکایە Username بنووسە.'
        );
        return;
      }

      if (
        cleanUsername.length < 3
      ) {
        Alert.alert(
          'ئاگاداری',
          'Username دەبێت لانیکەم 3 پیت بێت.'
        );
        return;
      }

      // تەنها پیت و ژمارە و _ و .
      const usernameRegex =
        /^[A-Za-z0-9_.]+$/;

      if (
        !usernameRegex.test(
          cleanUsername
        )
      ) {
        Alert.alert(
          'Username ـی هەڵە',
          'Username تەنها دەتوانێت پیت، ژمارە، _ یان . لەخۆ بگرێت.'
        );
        return;
      }
    }

    setLoading(true);

    try {
      // =================================================
      // LOGIN
      // =================================================

      if (isLogin) {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });

        if (error) {
          throw error;
        }

        console.log(
          'LOGIN DATA:',
          data
        );

        if (data?.session) {
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

      // =================================================
      // REGISTER
      // =================================================

      const { data, error } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password: password,

          options: {
            emailRedirectTo:
              redirectTo,

            data: {
              first_name:
                cleanFullName,

              last_name:
                '',

              username:
                cleanUsername,
            },
          },
        });

      if (error) {
        throw error;
      }

      console.log(
        'REGISTER DATA:',
        data
      );

      // -------------------------------------------------
      // If email confirmation is OFF
      // -------------------------------------------------

      if (data?.session) {
        if (onLoginSuccess) {
          onLoginSuccess();
        }

        return;
      }

      // -------------------------------------------------
      // If email confirmation is ON
      // -------------------------------------------------

      Alert.alert(
        'تۆمارکردن سەرکەوتوو بوو',
        'ئیمەیلێکی پشتڕاستکردنەوە بۆ ئیمەیلەکەت نێردرا. تکایە ئیمەیلەکەت بکەرەوە و لەسەر لینکی پشتڕاستکردنەوە کلیک بکە.',
        [
          {
            text: 'باشە',

            onPress: () => {
              // بگەڕێوە بۆ Login
              setIsLogin(true);

              // Password پاک بکەرەوە
              setPassword('');
            },
          },
        ]
      );
    } catch (err) {
      console.log(
        'AUTH ERROR:',
        err
      );

      // -------------------------------------------------
      // Username duplicate / DB error / Auth error
      // -------------------------------------------------

      const message =
        err?.message || '';

      if (
        message
          .toLowerCase()
          .includes(
            'duplicate'
          ) ||
        message
          .toLowerCase()
          .includes(
            'unique'
          )
      ) {
        Alert.alert(
          'Username بەکارهاتووە',
          'ئەم Username ـە پێشتر بەکارهاتووە. تکایە Username ـێکی تر هەڵبژێرە.'
        );

        return;
      }

      Alert.alert(
        'کێشەیەک ڕوویدا',
        message ||
          'هەڵەیەکی نەناسراو ڕوویدا.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <ImageBackground
      source={require('../assets/bg-village.jpg')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView
          style={styles.container}
        >
          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : 'height'
            }
            style={
              styles.keyboardView
            }
          >
            {/* =========================================
                Header
               ========================================= */}

            <View
              style={styles.headerBox}
            >
              <Text
                style={styles.mainTitle}
              >
                ئاوایی بڵەسەن
              </Text>

              <Text
                style={styles.subTitle}
              >
                بەخێربێیت بۆ گوندەکەمان
              </Text>
            </View>

            {/* =========================================
                Auth Card
               ========================================= */}

            <View
              style={styles.authCard}
            >
              {/* ---------------------------------------
                  Login / Register Tabs
                 --------------------------------------- */}

              <View
                style={
                  styles.tabContainer
                }
              >
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    !isLogin &&
                      styles.activeTabBtn,
                  ]}
                  onPress={() =>
                    setIsLogin(false)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      !isLogin &&
                        styles.activeTabText,
                    ]}
                  >
                    خۆتۆمارکردن
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    isLogin &&
                      styles.activeTabBtn,
                  ]}
                  onPress={() =>
                    setIsLogin(true)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isLogin &&
                        styles.activeTabText,
                    ]}
                  >
                    چوونە ژوورەوە
                  </Text>
                </TouchableOpacity>
              </View>

              {/* =======================================
                  Register Fields
                 ======================================= */}

              {!isLogin && (
                <>
                  {/* Full Name */}

                  <View
                    style={
                      styles.inputBox
                    }
                  >
                    <TextInput
                      style={
                        styles.input
                      }
                      placeholder="ناوی تەواو"
                      placeholderTextColor="#718096"
                      value={
                        fullName
                      }
                      onChangeText={
                        setFullName
                      }
                      textAlign="right"
                      autoCapitalize="words"
                      autoCorrect={
                        false
                      }
                    />
                  </View>

                  {/* Username */}

                  <View
                    style={
                      styles.inputBox
                    }
                  >
                    <TextInput
                      style={
                        styles.input
                      }
                      placeholder="Username"
                      placeholderTextColor="#718096"
                      value={
                        username
                      }
                      onChangeText={
                        setUsername
                      }
                      textAlign="right"
                      autoCapitalize="none"
                      autoCorrect={
                        false
                      }
                    />
                  </View>
                </>
              )}

              {/* =======================================
                  Email
                 ======================================= */}

              <View
                style={
                  styles.inputBox
                }
              >
                <Mail
                  color="#A0AEC0"
                  size={20}
                />

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="ئیمەیل"
                  placeholderTextColor="#718096"
                  value={
                    emailOrPhone
                  }
                  onChangeText={
                    setEmailOrPhone
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* =======================================
                  Password
                 ======================================= */}

              <View
                style={
                  styles.inputBox
                }
              >
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
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
                  style={
                    styles.input
                  }
                  placeholder="وشەی نهێنی"
                  placeholderTextColor="#718096"
                  secureTextEntry={
                    !showPassword
                  }
                  value={
                    password
                  }
                  onChangeText={
                    setPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Lock
                  color="#A0AEC0"
                  size={20}
                />
              </View>

              {/* =======================================
                  Submit
                 ======================================= */}

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  loading &&
                    styles.submitBtnDisabled,
                ]}
                onPress={
                  handleAuth
                }
                disabled={
                  loading
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.submitBtnText
                  }
                >
                  {loading
                    ? 'تکایە چاوەڕێ بکە...'
                    : isLogin
                    ? 'چوونە ژوورەوە'
                    : 'تۆمارکردن'}
                </Text>
              </TouchableOpacity>

              {/* =======================================
                  Footer
                 ======================================= */}

              <Text
                style={
                  styles.footerNote
                }
              >
                بۆ بینین و بەشدارییکردن پێویستە بچیتە ژوورەوە
              </Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(11, 19, 31, 0.65)',
  },

  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
    justifyContent:
      'space-between',
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
    textShadowColor:
      'rgba(0, 0, 0, 0.8)',
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
    backgroundColor:
      'rgba(19, 29, 42, 0.85)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor:
      '#0B131F',
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
    backgroundColor:
      '#1E2C3D',
  },

  tabText: {
    color: '#718096',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  activeTabText: {
    color:
      COLORS.primary ||
      '#D97706',
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      '#0B131F',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
    borderWidth: 1,
    borderColor:
      '#1E2C3D',
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    textAlign: 'right',
    paddingHorizontal: 10,
    fontSize: 13,
  },

  submitBtn: {
    backgroundColor:
      COLORS.primary ||
      '#D97706',
    borderRadius: 12,
    height: 50,
    justifyContent:
      'center',
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