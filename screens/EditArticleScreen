
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
  Save,
} from "lucide-react-native";

import { COLORS } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function EditArticleScreen({
  navigation,
  route,
}) {
  const article = route?.params?.article || {};
  const writer = route?.params?.writer || {};

  const [title, setTitle] = useState(
    article.title || ""
  );

  const [content, setContent] = useState(
    article.content || ""
  );

  const [loading, setLoading] = useState(false);

  const updateArticle = async () => {
    if (!title.trim()) {
      Alert.alert(
        "ناونیشان",
        "تکایە ناونیشانی بابەتەکە بنووسە."
      );
      return;
    }

    if (!content.trim()) {
      Alert.alert(
        "دەقی بابەت",
        "تکایە دەقی بابەتەکە بنووسە."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          content: content.trim(),
        })
        .eq("id", article.id)
        .eq("writer_id", writer.id)
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        "نوێکرایەوە",
        "بابەتەکە بە سەرکەوتوویی نوێکرایەوە.",
        [
          {
            text: "باشە",
            onPress: () => {
              navigation.navigate(
                "ArticleDetails",
                {
                  article: data,
                  writer,
                }
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "Update article error:",
        error
      );

      Alert.alert(
        "هەڵە",
        "نەتوانرا بابەتەکە نوێ بکرێتەوە."
      );
    } finally {
      setLoading(false);
    }
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <ArrowRight
              size={21}
              color="#26332A"
            />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              دەستکاری بابەت
            </Text>

            <Text style={styles.headerSubtitle}>
              بابەتەکەت نوێ بکەرەوە
            </Text>
          </View>
        </View>

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
            placeholder="دەقی بابەتەکە..."
            placeholderTextColor="#A0A8A2"
            style={styles.contentInput}
            multiline
            textAlign="right"
            writingDirection="rtl"
            textAlignVertical="top"
          />
        </View>

        <View style={styles.authorCard}>
          <Text style={styles.authorLabel}>
            نووسەر
          </Text>

          <Text style={styles.authorName}>
            {writer.name ||
              writer.full_name ||
              "نووسەر"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.disabled,
          ]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={updateArticle}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Save
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.saveText}>
                پاشەکەوتکردنی گۆڕانکارییەکان
              </Text>
            </>
          )}
        </TouchableOpacity>
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
    marginBottom: 20,
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
  },

  titleInput: {
    minHeight: 70,
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
    minHeight: 390,
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 18,
    color: "#26332A",
    fontSize: 15,
    lineHeight: 27,
  },

  authorCard: {
    backgroundColor: "#EAF0EB",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 17,
  },

  authorLabel: {
    color: "#6A766E",
    fontSize: 10,
    textAlign: "right",
  },

  authorName: {
    color: "#26332A",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 3,
  },

  saveButton: {
    height: 54,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 17,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.65,
  },
});

