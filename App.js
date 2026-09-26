
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
} from 'lucide-react-native';

import { COLORS } from '../constants/theme';
import { supabase } from '../lib/supabase';

export default function WelcomeScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();
  const cleanFullName = fullName.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[A-Za-z0-9_.]+$/;

  const handleAuth = async () => {
    if (loading) return;

    // =========================
    // Validation
    // =========================

    if (!cleanEmail) {
      Alert.alert('هەڵە', 'تکایە ئیمەیڵەکەت بنووسە.');
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert('هەڵە', 'تکایە ئیمەیڵێکی دروست بنووسە.');
      return;
    }

    if (!cleanUsername) {
      Alert.alert('هەڵە', 'تکایە ناوی بەکارهێنەر بنووسە.');
      return;
    }

    if (!usernameRegex.test(cleanUsername)) {
      Alert.alert(
        'هەڵە',
        'ناوی بەکارهێنەر تەنها دەتوانێت پیتی ئینگلیزی، ژمارە، _ یان . لەخۆبگرێت.'
      );
      return;
    }

    if (!password) {
      Alert.alert('هەڵە', 'تکایە وشەی نهێنی بنووسە.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'هەڵە',
        'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت.'
      );
      return;
    }

    // =========================
    // LOGIN
    // =========================

    if (isLogin) {
      try {
        setLoading(true);

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (error) {
          console.log('LOGIN ERROR:', error);

          Alert.alert(
            'چوونەژوورەوە سەرکەوتوو نەبوو',
            'ئیمەیڵ، ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە.'
          );

          return;
        }

        const user = data?.user;

        if (!user) {
          Alert.alert(
            'هەڵە',
            'نەتوانرا زانیاری بەکارهێنەر وەربگیرێت.'
          );

          return;
        }

        // =========================
        // Get profile
        // =========================

        const { data: profile, error: profileError } =
          await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
          console.log('PROFILE ERROR:', profileError);

          await supabase.auth.signOut();

          Alert.alert(
            'هەڵە',
            'پرۆفایلی بەکارهێنەر نەدۆزرایەوە.'
          );

          return;
        }

        // =========================
        // Check username
        // =========================

        if (
          (profile.username || '').toLowerCase() !==
          cleanUsername.toLowerCase()
        ) {
          await supabase.auth.signOut();

          Alert.alert(
            'چوونەژوورەوە سەرکەوتوو نەبوو',
            'ئیمەیڵ، ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە.'
          );

          return;
        }

        // =========================
        // GO TO HOME
        // =========================

        navigation.replace('MainTabs');

      } catch (error) {
        console.log('LOGIN CATCH ERROR:', error);

        Alert.alert(
          'هەڵە',
          'کێشەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەرەوە.'
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // =========================
    // REGISTER
    // =========================

    if (!cleanFullName) {
      Alert.alert(
        'هەڵە',
        'تکایە ناوی تەواوت بنووسە.'
      );

      return;
    }

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              first_name: cleanFullName,
              last_name: '',
              username: cleanUsername,
            },
          },
        });

      if (error) {
        console.log('SIGNUP ERROR:', error);

        Alert.alert(
          'تۆمارکردن سەرکەوتوو نەبوو',
          error.message ||
            'کێشەیەک لە تۆمارکردندا ڕوویدا.'
        );

        return;
      }

      const user = data?.user;
      const session = data?.session;

      if (!user) {
        Alert.alert(
          'هەڵە',
          'نەتوانرا هەژمارەکە دروست بکرێت.'
        );

        return;
      }

      // =========================
      // Email confirmation must be OFF
      // =========================

      if (!session) {
        Alert.alert(
          'تۆمارکردن تەواو نەبوو',
          'Email Confirmation لە Supabase هێشتا چالاکە. تکایە Confirm email دابخە.'
        );

        return;
      }

      // =========================
      // GO TO HOME
      // =========================

      navigation.replace('MainTabs');

    } catch (error) {
      console.log('SIGNUP CATCH ERROR:', error);

      Alert.alert(
        'هەڵە',
        'کێشەیەک لە تۆمارکردندا ڕوویدا.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bg-village.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.content}>

            {/* =========================
                HEADER
            ========================== */}

            <View style={styles.header}>
              <Text style={styles.title}>
                دێهاتی بڵەسەن
              </Text>

              <Text style={styles.subtitle}>
                بەخێربێیت بۆ دێهاتی بڵەسەن
              </Text>
            </View>

            {/* =========================
                FORM
            ========================== */}

            <View style={styles.form}>

              {/* Full Name - Register only */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <User
                    size={21}
                    color={COLORS?.primary || '#6b4f2a'}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="ناوی تەواو"
                    placeholderTextColor="#888"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* Email */}
              <View style={styles.inputContainer}>
                <Mail
                  size={21}
                  color={COLORS?.primary || '#6b4f2a'}
                />

                <TextInput
                  style={styles.input}
                  placeholder="ئیمەیڵ"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Username */}
              <View style={styles.inputContainer}>
                <User
                  size={21}
                  color={COLORS?.primary || '#6b4f2a'}
                />

                <TextInput
                  style={styles.input}
                  placeholder="ناوی بەکارهێنەر"
                  placeholderTextColor="#888"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Lock
                  size={21}
                  color={COLORS?.primary || '#6b4f2a'}
                />

                <TextInput
                  style={styles.input}
                  placeholder="وشەی نهێنی"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff
                      size={21}
                      color="#777"
                    />
                  ) : (
                    <Eye
                      size={21}
                      color="#777"
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* =========================
                  MAIN BUTTON
              ========================== */}

              <TouchableOpacity
                style={[
                  styles.mainButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleAuth}
                disabled={loading}
              >
                <Text style={styles.mainButtonText}>
                  {loading
                    ? 'تکایە چاوەڕوان بە...'
                    : isLogin
                    ? 'چوونەژوورەوە'
                    : 'تۆمارکردن'}
                </Text>
              </TouchableOpacity>

              {/* =========================
                  SWITCH LOGIN / REGISTER
              ========================== */}

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isLogin
                    ? 'هەژمارت نییە؟'
                    : 'پێشتر هەژمارت هەیە؟'}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setIsLogin(!isLogin);
                    setPassword('');
                  }}
                >
                  <Text style={styles.switchButton}>
                    {isLogin
                      ? 'تۆمارکردن'
                      : 'چوونەژوورەوە'}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: {
      width: 1,
      height: 2,
    },
    textShadowRadius: 4,
  },

  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 3,
  },

  form: {
    width: '100%',
  },

  inputContainer: {
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 13,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    marginLeft: 10,
    textAlign: 'right',
  },

  eyeButton: {
    padding: 5,
  },

  mainButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS?.primary || '#6b4f2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },

  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },

  switchText: {
    color: '#fff',
    fontSize: 15,
  },

  switchButton: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
