import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export default function ManageQuickNewsScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [colorType, setColorType] = useState("green");

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // =========================================================
  // FETCH
  // =========================================================

  useEffect(() => {
    fetchQuickNews();
  }, []);

  const fetchQuickNews = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("quick_news")
        .select(
          "id, title, content, news_date, news_type, is_active, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setNewsList(data || []);
    } catch (err) {
      console.log(
        "Error fetching quick news:",
        err
      );

      Alert.alert(
        "هەڵە",
        err?.message ||
          "نەتوانرا هەواڵە خێراکان بهێنرێن."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SAVE / UPDATE
  // =========================================================

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە سەردێڕی هەواڵەکە بنووسە."
      );
      return;
    }

    if (!content.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوەڕۆکی هەواڵەکە بنووسە."
      );
      return;
    }

    if (!dateStr.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە بەرواری هەواڵەکە بنووسە."
      );
      return;
    }

    try {
      setLoading(true);

      // ئەمە field ـە ڕاستەقینەکانی quick_news ـن
      const payload = {
        title: title.trim(),
        content: content.trim(),
        news_date: dateStr.trim(),
        news_type: colorType,
        is_active: true,
      };

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingId !== null) {
        const { error } = await supabase
          .from("quick_news")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        // دڵنیابوونەوە کە update بەڕاستی کراوە
        const { data: updatedItem, error: verifyError } =
          await supabase
            .from("quick_news")
            .select(
              "id, title, content, news_date, news_type, is_active"
            )
            .eq("id", editingId)
            .maybeSingle();

        if (verifyError) {
          throw verifyError;
        }

        if (!updatedItem) {
          throw new Error(
            "هەواڵەکە نوێ نەکرایەوە. تکایە RLS و مۆڵەتی UPDATE پشکنە."
          );
        }

        resetForm();

        await fetchQuickNews();

        Alert.alert(
          "سەرکەوتوو بوو ✓",
          "هەواڵەکە بە سەرکەوتوویی نوێکرایەوە."
        );

        return;
      }

      // =====================================================
      // INSERT
      // =====================================================

      const { data: insertedItem, error } =
        await supabase
          .from("quick_news")
          .insert([payload])
          .select(
            "id, title, content, news_date, news_type, is_active"
          )
          .single();

      if (error) {
        throw error;
      }

      if (!insertedItem) {
        throw new Error(
          "هەواڵەکە زیاد نەکرا."
        );
      }

      resetForm();

      await fetchQuickNews();

      Alert.alert(
        "سەرکەوتوو بوو ✓",
        "هەواڵی خێرا بە سەرکەوتوویی پاشەکەوت کرا."
      );
    } catch (err) {
      console.log(
        "QUICK NEWS SAVE ERROR:",
        err
      );

      Alert.alert(
        "هەڵە لە پاشەکەوتکردن",
        err?.message ||
          err?.details ||
          err?.hint ||
          "نەتوانرا هەواڵەکە پاشەکەوت بکرێت."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setTitle(item.title || "");
    setContent(item.content || "");

    // database -> form
    setDateStr(item.news_date || "");
    setColorType(item.news_type || "green");
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteNow = async (id) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("quick_news")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // دڵنیابوونەوە کە row ـەکە سڕاوەتەوە
      const {
        data: remainingItem,
        error: verifyError,
      } = await supabase
        .from("quick_news")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (verifyError) {
        throw verifyError;
      }

      if (remainingItem) {
        throw new Error(
          "هەواڵەکە نەسڕایەوە. تکایە مۆڵەتی DELETE و RLS پشکنە."
        );
      }

      if (editingId === id) {
        resetForm();
      }

      await fetchQuickNews();

      Alert.alert(
        "سڕایەوە ✓",
        "هەواڵەکە بە سەرکەوتوویی سڕایەوە."
      );
    } catch (err) {
      console.log(
        "QUICK NEWS DELETE ERROR:",
        err
      );

      Alert.alert(
        "هەڵە لە سڕینەوە",
        err?.message ||
          err?.details ||
          err?.hint ||
          "نەتوانرا هەواڵەکە بسڕدرێتەوە."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          "ئایا دڵنیایت لە سڕینەوەی ئەم هەواڵە؟"
        )
      ) {
        deleteNow(id);
      }

      return;
    }

    Alert.alert(
      "سڕینەوە",
      "ئایا دڵنیایت لە سڕینەوەی ئەم هەواڵە؟",
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ",
          style: "destructive",
          onPress: () => deleteNow(id),
        },
      ]
    );
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setDateStr("");
    setColorType("green");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          بەڕێوەبردنی هەواڵی خێرا
        </Text>
      </View>

      {/* FORM */}
      <ScrollView
        style={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>
          سەردێڕی هەواڵ:
        </Text>

        <TextInput
          style={styles.input}
          placeholder="نموونە: تصادفی 5 ماشین"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          textAlign="right"
        />

        <Text style={styles.label}>
          ناوەڕۆکی هەواڵ:
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          placeholder="ناوەڕۆک و زانیاری زیاتر..."
          placeholderTextColor="#888"
          value={content}
          onChangeText={setContent}
          multiline
          textAlign="right"
          textAlignVertical="top"
        />

        <Text style={styles.label}>
          بەرواری هەواڵ:
        </Text>

        <TextInput
          style={styles.input}
          placeholder="نموونە: ٢٧ی ئاب ٢٠٢٥"
          placeholderTextColor="#888"
          value={dateStr}
          onChangeText={setDateStr}
          textAlign="right"
        />

        <Text style={styles.label}>
          ڕەنگی باکسەکە لە هۆم سکڕین:
        </Text>

        <View style={styles.colorSelector}>
          {/* GREEN */}
          <TouchableOpacity
            style={[
              styles.colorOption,
              {
                backgroundColor: "#2e7d32",
              },
              colorType === "green" &&
                styles.selectedColor,
            ]}
            onPress={() =>
              setColorType("green")
            }
            activeOpacity={0.8}
          >
            <Text
              style={styles.colorText}
            >
              سەوز
            </Text>
          </TouchableOpacity>

          {/* YELLOW */}
          <TouchableOpacity
            style={[
              styles.colorOption,
              {
                backgroundColor:
                  "#fbc02d",
              },
              colorType === "yellow" &&
                styles.selectedColor,
            ]}
            onPress={() =>
              setColorType("yellow")
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.colorText,
                {
                  color: "#000",
                },
              ]}
            >
              زەرد
            </Text>
          </TouchableOpacity>

          {/* RED */}
          <TouchableOpacity
            style={[
              styles.colorOption,
              {
                backgroundColor:
                  "#c62828",
              },
              colorType === "red" &&
                styles.selectedColor,
            ]}
            onPress={() =>
              setColorType("red")
            }
            activeOpacity={0.8}
          >
            <Text
              style={styles.colorText}
            >
              سور
            </Text>
          </TouchableOpacity>
        </View>

        {/* SAVE */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator
              color="#fff"
            />
          ) : (
            <Text
              style={
                styles.saveBtnText
              }
            >
              {editingId !== null
                ? "نوێکردنەوەی هەواڵ"
                : "پاشەکەوتکردنی هەواڵ"}
            </Text>
          )}
        </TouchableOpacity>

        {/* CANCEL EDIT */}
        {editingId !== null && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={resetForm}
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.cancelBtnText
              }
            >
              پاشگەزبوونەوە
            </Text>
          </TouchableOpacity>
        )}

        <Text
          style={styles.listHeader}
        >
          لیستی هەواڵە خێراکان:
        </Text>
      </ScrollView>

      {/* LIST */}
      {loading &&
      newsList.length === 0 ? (
        <View
          style={styles.loadingBox}
        >
          <ActivityIndicator
            size="small"
            color="#1b2a47"
          />

          <Text
            style={styles.loadingText}
          >
            هەواڵەکان دەهێنرێن...
          </Text>
        </View>
      ) : (
        <FlatList
          data={newsList}
          keyExtractor={(item) =>
            String(item.id)
          }
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false
          }
          ListEmptyComponent={
            <View
              style={styles.emptyBox}
            >
              <Text
                style={styles.emptyText}
              >
                هێشتا هیچ هەواڵێکی خێرا نییە.
              </Text>
            </View>
          }
          renderItem={({
            item,
          }) => {
            let bgBoxColor =
              "#2e7d32";

            if (
              item.news_type ===
              "yellow"
            ) {
              bgBoxColor = "#fbc02d";
            }

            if (
              item.news_type ===
              "red"
            ) {
              bgBoxColor = "#c62828";
            }

            const isEditing =
              editingId === item.id;

            return (
              <View
                style={[
                  styles.newsCard,
                  {
                    borderRightColor:
                      bgBoxColor,
                    borderRightWidth: 6,
                  },
                ]}
              >
                <View
                  style={
                    styles.cardInfo
                  }
                >
                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    {item.title}
                  </Text>

                  {item.content ? (
                    <Text
                      style={
                        styles.cardContent
                      }
                    >
                      {item.content}
                    </Text>
                  ) : null}

                  {item.news_date ? (
                    <Text
                      style={
                        styles.cardDate
                      }
                    >
                      {item.news_date}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={
                    styles.cardActions
                  }
                >
                  {/* EDIT */}
                  <TouchableOpacity
                    onPress={() =>
                      handleEdit(item)
                    }
                    style={[
                      styles.iconBtn,
                      isEditing &&
                        styles.iconBtnEditing,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="pencil"
                      size={20}
                      color="#007AFF"
                    />
                  </TouchableOpacity>

                  {/* DELETE */}
                  <TouchableOpacity
                    onPress={() =>
                      handleDelete(
                        item.id
                      )
                    }
                    style={[
                      styles.iconBtn,
                      styles.deleteIconBtn,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="trash"
                      size={20}
                      color="#e74c3c"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },

  header: {
    height: 60,
    backgroundColor: "#1b2a47",
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  backBtn: {
    padding: 5,
  },

  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
    textAlign: "right",
  },

  formContainer: {
    padding: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 5,
    color: "#333",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    textAlign: "right",
    marginBottom: 12,
    color: "#000",
    minHeight: 45,
  },

  textArea: {
    height: 100,
  },

  colorSelector: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  colorOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },

  selectedColor: {
    borderWidth: 3,
    borderColor: "#000",
  },

  colorText: {
    color: "#fff",
    fontWeight: "bold",
  },

  saveBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 46,
  },

  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelBtn: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },

  cancelBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  listHeader: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 10,
    marginBottom: 10,
    color: "#222",
  },

  listContent: {
    paddingTop: 5,
    paddingBottom: 30,
  },

  newsCard: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  cardInfo: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    textAlign: "right",
  },

  cardContent: {
    width: "100%",
    fontSize: 13,
    color: "#555",
    marginTop: 4,
    textAlign: "right",
    lineHeight: 20,
  },

  cardDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    textAlign: "right",
  },

  cardActions: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef5ff",
  },

  iconBtnEditing: {
    borderWidth: 1,
    borderColor: "#007AFF",
  },

  deleteIconBtn: {
    backgroundColor: "#fff0f0",
  },

  loadingBox: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 13,
  },

  emptyBox: {
    margin: 15,
    padding: 25,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  emptyText: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
  },
});