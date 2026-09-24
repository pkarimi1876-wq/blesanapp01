import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase'; // دڵنیا ببەوە لە ڕێگەی فایلەکەت

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // بۆ جیاکردنەوەی Login و Signup

  // فەنکشنی چوونەژوورەوە یان خۆتۆمارکردن
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('هەڵە', 'تکایە ئیمەیڵ و پاسوۆرد پڕبکەرەوە.');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        // چوونەژوورەوە
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        
        if (error) throw error;

        
        Alert.alert('سەرکەوتوو بوو', 'بە سەرکەوتوویی چوویتە ژوورەوە!');
        navigation.replace('WriterScreen'); // یان ئەو لاپەڕەیەی کە مەبەستتە
      } else {
        // دروستکردنی هەژماری نوێ
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;

        Alert.alert('سەرکەوتوو بوو', 'هەژمارەکەت دروستکرا! ئێستا دەتوانیت پڕۆفایلەکەت تۆمار بکەیت.');
        navigation.replace('WriterProfileCreateScreen');
      }
    } catch (error) {
      Alert.alert('هەڵە', error.message || 'هەڵەیەک ڕوویدა.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {isLogin ? 'چوونەژوورەوەی نووسەر' : 'دروستکردنی هەژماری نووسەر'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="ئیمەیڵ"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="پاسوۆرد"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'چوونەژوورەوە' : 'تۆمارکردن'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {isLogin
              ? 'هەژمارت نییە؟ خۆتۆمارکردن'
              : 'هەژمارم هەیە؟ چوونەژوورەوە'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F4F1EA',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE5D9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2C402E',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EAE5D9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    textAlign: 'right',
    backgroundColor: '#FCFBFA',
    color: '#333',
  },
  button: {
    backgroundColor: '#2C402E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  switchButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  switchText: {
    color: '#666',
    fontSize: 13,
  },
});