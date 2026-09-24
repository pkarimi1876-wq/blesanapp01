
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  ArrowRight,
  Image as ImageIcon,
  Send,
  Save,
  X,
} from "lucide-react-native";

import { COLORS } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function CreateArticleScreen({ navigation, route }) {
  const writer = route?.params?.writer || {};

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const saveArticle = async () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanImageUrl = imageUrl.trim();

    if (!cleanTitle) {
      Alert.alert(
        "ناونیشان",
        "تکایە ناونیشانی بابەتەکە بنووسە."
      );
      return;
    }

    if (!cleanContent) {
      Alert.alert(
        "دەقی بابەت",
        "تکایە دەقی بابەتەکە بنووسە."
      );
      return;
    }

    if (!writer || !writer.id) {
      Alert.alert(
        "هەڵە",
        "ناسنامەی نووسەر نەدۆزرایەوە."
      );
      return;
    }

    try {
      setLoading(true);

      const articleData = {
        writer_id: writer.id,
        title: cleanTitle,
        content: cleanContent,
      };

      if (cleanImageUrl) {
        articleData.image_url = cleanImageUrl;
      }

      console.log(
        "ARTICLE DATA:",
        articleData
      );

      const { data, error } = await supabase
        .from("articles")
        .insert([articleData])
        .select()
        .single();

      if (error) {
       if (error) {
  Alert.alert(
    "هەڵەی Supabase",
    JSON.stringify(error, null, 2)
  );

  console.log("SUPABASE ERROR:", error);

  return;
}

        throw error;
      }

      console.log(
        "ARTICLE CREATED:",
        data
      );

      Alert.alert(
        "سەرکەوتوو بوو ✓",
        "بابەتەکە بە سەرکەوتوویی پاشەکەوت کرا.",
        [
          {
            text: "باشە",
            onPress: () => {
              navigation.navigate(
                "WriterDashboard",
                {
                  writer: writer,
                  newArticle: data,
                }
              );
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        "CREATE ARTICLE ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          error?.details ||
          "نەتوانرا بابەتەکە پاشەکەوت بکرێت."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImageUrl("");
  };

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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() =>
              navigation.goBack()
            }
          >
            <ArrowRight
              size={21}
              color="#26332A"
            />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              بابەتی نوێ
            </Text>

            <Text style={styles.headerSubtitle}>
              نووسینێکی نوێ دروست بکە
            </Text>
          </View>
        </View>

        {/* EDITOR */}

        <View style={styles.editor}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="ناونیشانی بابەتەکە..."
            placeholderTextColor="#A0A8A2"
            style={styles.titleInput}
            textAlign="right"
            writingDirection="rtl"
            multiline
          />

          <View style={styles.divider} />

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="دەست بە نووسین بکە..."
            placeholderTextColor="#A0A8A2"
            style={styles.contentInput}
            multiline
            textAlign="right"
            writingDirection="rtl"
            textAlignVertical="top"
          />

          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.toolButton}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  "وێنە",
                  "لە هەنگاوی دواتردا هەڵبژاردنی وێنە لە گەلەری زیاد دەکەین."
                );
              }}
            >
              <ImageIcon
                size={19}
                color={COLORS.primary}
              />

              <Text style={styles.toolText}>
                وێنە
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* IMAGE */}

        <View style={styles.imageSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.optional}>
              ئیختیاری
            </Text>

            <Text style={styles.sectionTitle}>
              وێنەی سەرەکی
            </Text>
          </View>

          <View style={styles.imageInput}>
            <ImageIcon
              size={19}
              color="#68756D"
            />

            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="لینکی وێنە بنووسە..."
              placeholderTextColor="#A0A8A2"
              style={styles.imageTextInput}
              textAlign="right"
              writingDirection="rtl"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {imageUrl.length > 0 && (
              <TouchableOpacity
                onPress={clearImage}
                style={styles.clearButton}
              >
                <X
                  size={17}
                  color="#7A847D"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* AUTHOR */}

        <View style={styles.authorCard}>
          <View>
            <Text style={styles.authorLabel}>
              نووسەر
            </Text>

            <Text style={styles.authorName}>
              {writer.name ||
                writer.full_name ||
                "نووسەر"}
            </Text>
          </View>

          <View style={styles.authorDot} />
        </View>

        {/* ACTIONS */}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.draftButton}
            activeOpacity={0.75}
            onPress={() => {
              Alert.alert(
                "ڕەشنووس",
                "سیستەمی ڕەشنووس لە هەنگاوی داهاتوودا زیاد دەکرێت."
              );
            }}
          >
            <Save
              size={18}
              color="#314036"
            />

            <Text style={styles.draftText}>
              ڕەشنووس
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.publishButton,
              loading &&
                styles.disabledButton,
            ]}
            activeOpacity={0.8}
            disabled={loading}
            onPress={() => {
  Alert.alert("تاقیکردنەوە", "دوگمەکە کار دەکات");
  saveArticle();
}}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <>
                <Send
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.publishText}>
                  بڵاوکردنەوە
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.bottomNote}>
          بابەتەکە بە ناوی تۆ تۆمار دەکرێت.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F3",
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 40,
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E4E0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    color: "#18221C",
    fontSize: 21,
    fontWeight: "700",
    textAlign: "right",
  },

  headerSubtitle: {
    color: "#68756D",
    fontSize: 11,
    marginTop: 3,
    textAlign: "right",
  },

  editor: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#DDE2DE",
    overflow: "hidden",
    marginBottom: 18,
  },

  titleInput: {
    minHeight: 68,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 12,
    color: "#17221A",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 29,
  },

  divider: {
    height: 1,
    backgroundColor: "#E8EBE8",
    marginHorizontal: 17,
  },

  contentInput: {
    minHeight: 330,
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 18,
    color: "#26332A",
    fontSize: 15,
    lineHeight: 27,
  },

  toolbar: {
    minHeight: 49,
    borderTopWidth: 1,
    borderTopColor: "#E8EBE8",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  toolButton: {
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: "#F0F3F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  toolText: {
    color: "#354239",
    fontSize: 11,
    fontWeight: "600",
  },

  imageSection: {
    marginBottom: 17,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  sectionTitle: {
    color: "#202B23",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },

  optional: {
    color: "#7A847D",
    fontSize: 10,
  },

  imageInput: {
    minHeight: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE2DE",
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  imageTextInput: {
    flex: 1,
    marginLeft: 9,
    color: "#26332A",
    fontSize: 12,
  },

  clearButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  authorCard: {
    minHeight: 61,
    backgroundColor: "#EAF0EB",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  authorLabel: {
    color: "#6A766E",
    fontSize: 10,
    textAlign: "right",
    marginBottom: 2,
  },

  authorName: {
    color: "#26332A",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },

  authorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  draftButton: {
    flex: 0.9,
    height: 54,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DFDA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  draftText: {
    color: "#314036",
    fontSize: 13,
    fontWeight: "600",
  },

  publishButton: {
    flex: 1.3,
    height: 54,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },

  publishText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  bottomNote: {
    color: "#7A847D",
    fontSize: 10,
    textAlign: "center",
    marginTop: 12,
  },
});

