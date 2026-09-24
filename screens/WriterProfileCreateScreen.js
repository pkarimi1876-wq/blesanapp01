import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase'; // دڵنیا ببەوە لە ناوی فایلی سوپابیسەکەت

export default function WriterProfileCreateScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [fieldOfWork, setFieldOfWork] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [imageUri, setImageUri] = useState(null); // بۆ هەڵگرتنی ناونیشانی وێنە
  const [loading, setLoading] = useState(false);

  // ١. فەنکشن بۆ هەڵبژاردنی وێنە لە مۆبایلەوە
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // ٢. فەنکشن بۆ ئاپڵۆدکردنی وێنە بۆ Supabase Storage
  const uploadImageToSupabase = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) {
        throw uploadError;
      }

      // وەرگرتنی لینکی گشتی وێنەکە
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload Error:', error);
      throw new Error('شکست لە ئاپڵۆدکردنی وێنەدا.');
    }
  };

  // ٣. فەنکشن بۆ پاشەکەوتکردن و بڵاوکردنەوەی پڕۆفایل و وتار
  const handlePublish = async () => {
    if (!fullName) {
      Alert.alert('هەڵە', 'تکایە ناوی تەواو بنووسە');
      return;
    }

    setLoading(true);
    try {
      // وەرگرتنی ئەو بەکارهێنەرەی ئێستا چۆتە ژوورەوە
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('هەڵە', 'تکایە سەرەتا چوونەژوورەوە بکە (Login)');
        setLoading(false);
        return;
      }

      let avatarUrl = null;
      if (imageUri) {
        avatarUrl = await uploadImageToSupabase(imageUri);
      }

      // پاشەکەوتکردنی زانیاری پڕۆفایلی نووسەر
      const { data: profileData, error: profileError } = await supabase
        .from('WriterProfileScreen') // دڵنیا ببەوە لە ناوی ڕاستەقینەی خشتەکەت لە سوپابیس
        .upsert({
          user_id: user.id,
          full_name: fullName,
          bio: bio,
          field_of_work: fieldOfWork,
          avatar_url: avatarUrl,
        })
        .select();

      if (profileError) {
        throw profileError;
      }

      // ئەگەر نوسەر وتاریشی نووسیبوو، ئەوا با لە خشتەی وتارەکان تۆمار بکرێت
      if (articleTitle && articleContent) {
        const { error: articleError } = await supabase
          .from('articles') // ناوی خشتەی وتارەکانت
          .insert([
            {
              title: articleTitle,
              content: articleContent,
              user_id: user.id,
            },
          ]);

        if (articleError) {
          throw articleError;
        }
      }

      Alert.alert('سەرکەوتوو بوو', 'پڕۆفایل و وتارەکەت بە سەرکەوتوویی بڵاوکرایەوە!');
      navigation.goBack(); // دەگەرێتەوە دواوە یان دەیبەی بۆ لاپەڕەی تر
    } catch (error) {
      console.error(error);
      Alert.alert('هەڵە ڕوویدا', error.message || 'ناتوانرێت زانیارییەکان پاشەکەوت بکرێن.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>دروستکردنی لاپەڕەی نووسەر</Text>

      {/* بەشی وێنەی پڕۆفایل */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>پێکهاتنی پڕۆفایل</Text>
        <View style={styles.profileRow}>
          <TouchableOpacity style={styles.imagePickerBox} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <Text style={styles.imagePickerText}>وێنە هەڵبژێرە</Text>
            )}
          </TouchableOpacity>

          <View style={styles.inputsColumn}>
            <TextInput
              style={styles.input}
              placeholder="ناوی تەواو"
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="دەربارەی خۆت"
              placeholderTextColor="#888"
              value={bio}
              onChangeText={setBio}
            />
            <TextInput
              style={styles.input}
              placeholder="بواری کارکردن"
              placeholderTextColor="#888"
              value={fieldOfWork}
              onChangeText={setFieldOfWork}
            />
          </View>
        </View>
      </View>

      {/* بەشی نووسینی وتار */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>نووسینی وتار</Text>
        <TextInput
          style={styles.input}
          placeholder="ناونیشانی وتار"
          placeholderTextColor="#888"
          value={articleTitle}
          onChangeText={setArticleTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="وتار، تێبینی مێژوویی یان پۆستێک بنووسە..."
          placeholderTextColor="#888"
          multiline
          value={articleContent}
          onChangeText={setArticleContent}
        />
      </View>

      {/* دوگمەی پاشەکەوتکردن */}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePublish}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>پاشەکەوتکردن و بڵاوکردنەوە</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F4F1EA',
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EAE5D9',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2C402E',
    textAlign: 'right',
  },
  profileRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  imagePickerBox: {
    width: 90,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    overflow: 'hidden',
  },
  imagePickerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  inputsColumn: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EAE5D9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    textAlign: 'right',
    backgroundColor: '#FCFBFA',
    color: '#333',
    fontSize: 13,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2C402E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});