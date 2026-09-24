import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Switch,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "../lib/supabase";

export default function ManageNewsScreen({
  navigation,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [category, setCategory] =
    useState("ئاگاداری");

  const [imageUri, setImageUri] =
    useState("");

  const [commentsEnabled, setCommentsEnabled] =
    useState(true);

  const [newsList, setNewsList] = useState([]);
  

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [expandedNewsId, setExpandedNewsId] =
    useState(null);
    const [selectedNewsForComments, setSelectedNewsForComments] =
  useState(null);

const [newsComments, setNewsComments] =
  useState([]);

const [newsCommentsLoading, setNewsCommentsLoading] =
  useState(false);

const [commentsModalVisible, setCommentsModalVisible] =
  useState(false);

const [socialStats, setSocialStats] =
  useState({});

  // =====================================================
  // FETCH NEWS
  // =====================================================

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);

      const { data, error } =
        await supabase
          .from("news")
          .select(
            "id, title, content, category, image, comments_enabled, created_at"
          )
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      setNewsList(data || []);
    } catch (error) {
      console.log(
        "FETCH NEWS ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "کێشەیەک لە هێنانی هەواڵەکان ڕوویدا."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // IMAGE PICKER
  // =====================================================

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "ئاگاداری",
          "پێویستە ڕێگە بە دەستگەیشتن بە گەلەری بدەیت."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          }
        );

      if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0
      ) {
        setImageUri(
          result.assets[0].uri
        );
      }
    } catch (error) {
      console.log(
        "IMAGE PICK ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        "نەتوانرا وێنە هەڵبژێردرێت."
      );
    }
  };

  // =====================================================
  // UPLOAD IMAGE
  // =====================================================

  const uploadImageToSupabase =
    async (uri) => {
      try {
        const response =
          await fetch(uri);

        if (!response.ok) {
          throw new Error(
            "نەتوانرا وێنەکە بخوێنرێتەوە."
          );
        }

        const blob =
          await response.blob();

        const originalExtension =
          uri
            .split(".")
            .pop()
            ?.split("?")[0]
            ?.toLowerCase() || "jpg";

        let extension =
          originalExtension;

        if (extension === "jpeg") {
          extension = "jpg";
        }

        const fileName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${extension}`;

        const filePath =
          `news/${fileName}`;

        let contentType =
          "image/jpeg";

        if (extension === "png") {
          contentType = "image/png";
        }

        if (extension === "webp") {
          contentType =
            "image/webp";
        }

        const { error } =
          await supabase.storage
            .from("images")
            .upload(
              filePath,
              blob,
              {
                contentType,
                upsert: false,
              }
            );

        if (error) {
          throw error;
        }

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from("images")
            .getPublicUrl(
              filePath
            );

        if (
          !publicUrlData?.publicUrl
        ) {
          throw new Error(
            "لینکی گشتیی وێنەکە نەدۆزرایەوە."
          );
        }

        return publicUrlData.publicUrl;
      } catch (error) {
        console.log(
          "IMAGE UPLOAD ERROR:",
          error
        );

        throw error;
      }
    };

  // =====================================================
  // SAVE / UPDATE
  // =====================================================

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە سەردێڕی هەواڵ بنووسە."
      );
      return;
    }

    if (!content.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوەڕۆکی هەواڵ بنووسە."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "بەکارهێنەر login نەکراوە."
        );
      }

      // وێنە optional ـە
      let finalImage = "";

      if (imageUri) {
        if (
          imageUri.startsWith(
            "file://"
          )
        ) {
          finalImage =
            await uploadImageToSupabase(
              imageUri
            );
        } else {
          finalImage = imageUri;
        }
      }

      const payload = {
        title: title.trim(),
        content: content.trim(),
        category: category,
        image: finalImage,
        comments_enabled:
          commentsEnabled,
      };
      const fetchNewsSocialStats = async (newsItems) => {
  try {
    if (!newsItems?.length) {
      setSocialStats({});
      return;
    }

    const newsIds = newsItems.map(
      (item) => item.id
    );

    const [
      likesResult,
      commentsResult,
    ] = await Promise.all([
      supabase
        .from("news_likes")
        .select("id, news_id")
        .in("news_id", newsIds),

      supabase
        .from("news_comments")
        .select("id, news_id, is_visible")
        .in("news_id", newsIds),
    ]);

    if (likesResult.error) {
      throw likesResult.error;
    }

    if (commentsResult.error) {
      throw commentsResult.error;
    }

    const stats = {};

    newsItems.forEach((item) => {
      stats[item.id] = {
        likes:
          likesResult.data?.filter(
            (like) =>
              like.news_id === item.id
          ).length || 0,

        comments:
          commentsResult.data?.filter(
            (comment) =>
              comment.news_id === item.id &&
              comment.is_visible === true
          ).length || 0,
      };
    });

    setSocialStats(stats);
  } catch (error) {
    console.log(
      "NEWS SOCIAL STATS ERROR:",
      error
    );
  }
};

      // =================================================
      // EDIT
      // =================================================

      if (editingId !== null) {
        const { error } =
          await supabase
            .from("news")
            .update(payload)
            .eq(
              "id",
              editingId
            );

        if (error) {
          throw error;
        }

        Alert.alert(
          "سەرکەوتوو ✓",
          "هەواڵەکە بە سەرکەوتوویی نوێکرایەوە."
        );
      }

      // =================================================
      // INSERT
      // =================================================

      else {
        const { error } =
          await supabase
            .from("news")
            .insert([payload]);

        if (error) {
          throw error;
        }

        Alert.alert(
          "سەرکەوتوو ✓",
          "هەواڵەکە بە سەرکەوتوویی زیادکرا."
        );
      }

      resetForm();

      await fetchNews();
    } catch (error) {
      console.log(
        "SAVE NEWS ERROR:",
        error
      );

      Alert.alert(
        "هەڵە لە پاشەکەوتکردن",
        error?.message ||
          error?.details ||
          error?.hint ||
          "نەتوانرا هەواڵەکە پاشەکەوت بکرێت."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setTitle(
      item.title || ""
    );

    setContent(
      item.content || ""
    );

    setCategory(
      item.category ||
        "ئاگاداری"
    );

    setImageUri(
      item.image || ""
    );

    setCommentsEnabled(
      item.comments_enabled !==
        false
    );
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = (id) => {
    const performDelete =
      async () => {
        try {
          setLoading(true);

          const {
            data: { user },
            error: userError,
          } =
            await supabase.auth.getUser();

          if (userError) {
            throw userError;
          }

          if (!user) {
            throw new Error(
              "بەکارهێنەر login نەکراوە."
            );
          }

          const { error } =
            await supabase
              .from("news")
              .delete()
              .eq("id", id);

          if (error) {
            throw error;
          }

          if (
            editingId === id
          ) {
            resetForm();
          }

          setNewsList(
            (current) =>
              current.filter(
                (item) =>
                  item.id !== id
              )
          );

          Alert.alert(
            "سڕایەوە ✓",
            "هەواڵەکە بە سەرکەوتوویی سڕایەوە."
          );
        } catch (error) {
          console.log(
            "DELETE NEWS ERROR:",
            error
          );

          Alert.alert(
            "هەڵەی سڕینەوە",
            error?.message ||
              error?.details ||
              error?.hint ||
              "نەتوانرا هەواڵەکە بسڕدرێتەوە."
          );
        } finally {
          setLoading(false);
        }
      };

    if (
      Platform.OS === "web"
    ) {
      if (
        window.confirm(
          "ئایا دڵنیایت لە سڕینەوەی ئەم هەواڵە؟"
        )
      ) {
        performDelete();
      }

      return;
    }

    Alert.alert(
      "سڕینەوەی هەواڵ",
      "دڵنیایت دەتەوێت ئەم هەواڵە بسڕیتەوە؟",
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ، بیسڕەوە",
          style: "destructive",
          onPress:
            performDelete,
        },
      ]
    );
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {
    setEditingId(null);

    setTitle("");

    setContent("");

    setCategory(
      "ئاگاداری"
    );

    setImageUri("");

    setCommentsEnabled(
      true
    );

    setExpandedNewsId(
      null
    );
  };

  // =====================================================
  // HEADER / FORM
  // =====================================================

  const renderHeader = () => (
    <View
      style={
        styles.formContainer
      }
    >
      {/* TITLE */}

      <Text
        style={styles.label}
      >
        سەردێڕی هەواڵ:
      </Text>

      <TextInput
        style={styles.input}
        placeholder="سەردێڕ بنووسە..."
        placeholderTextColor="#888"
        value={title}
        onChangeText={
          setTitle
        }
        textAlign="right"
        autoCorrect={false}
        blurOnSubmit={false}
      />

      {/* CONTENT */}

      <Text
        style={styles.label}
      >
        ناوەڕۆکی هەواڵ:
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        placeholder="ناوەڕۆکی هەواڵەکە بنووسە..."
        placeholderTextColor="#888"
        value={content}
        onChangeText={
          setContent
        }
        multiline
        textAlign="right"
        textAlignVertical="top"
        blurOnSubmit={false}
      />

      {/* CATEGORY */}

      <Text
        style={styles.label}
      >
        پۆلێنی هەواڵ:
      </Text>

      <View
        style={
          styles.categoryRow
        }
      >
        {[
          "ئاگاداری",
          "پڕۆژەکان",
          "کۆبوونەوە",
        ].map(
          (cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBtn,
                category ===
                  cat &&
                  styles.categoryBtnActive,
              ]}
              onPress={() =>
                setCategory(
                  cat
                )
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  category ===
                    cat &&
                    styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* IMAGE */}

      <Text
        style={styles.label}
      >
        وێنەی هەواڵ:
      </Text>

      <TouchableOpacity
        style={
          styles.imagePickerBtn
        }
        onPress={
          pickImage
        }
        activeOpacity={0.8}
      >
        <Ionicons
          name="image-outline"
          size={22}
          color="#f59e0b"
        />

        <Text
          style={
            styles.imagePickerText
          }
        >
          {imageUri
            ? "گۆڕینی وێنە لە گەلەری"
            : "هەڵبژاردنی وێنە لە گەلەری"}
        </Text>
      </TouchableOpacity>

      {imageUri ? (
        <View
          style={
            styles.imagePreviewContainer
          }
        >
          <Image
            source={{
              uri: imageUri,
            }}
            style={
              styles.imagePreview
            }
          />

          <TouchableOpacity
            style={
              styles.removeImageBtn
            }
            onPress={() =>
              setImageUri("")
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="close-circle"
              size={26}
              color="#ef4444"
            />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* COMMENTS */}

      <View
        style={
          styles.commentsCard
        }
      >
        <View
          style={
            styles.commentsTextBox
          }
        >
          <Text
            style={
              styles.commentsTitle
            }
          >
            کۆمێنتەکان
          </Text>

          <Text
            style={
              styles.commentsSubtitle
            }
          >
            {commentsEnabled
              ? "کۆمێنت بۆ ئەم هەواڵە کراوە."
              : "کۆمێنت بۆ ئەم هەواڵە داخراوە."}
          </Text>
        </View>

        <Switch
          value={
            commentsEnabled
          }
          onValueChange={
            setCommentsEnabled
          }
          trackColor={{
            false: "#334155",
            true: "#166534",
          }}
          thumbColor={
            commentsEnabled
              ? "#22c55e"
              : "#94a3b8"
          }
        />
      </View>

      {/* SAVE */}

      <TouchableOpacity
        style={
          styles.saveBtn
        }
        onPress={
          handleSave
        }
        disabled={
          saving
        }
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator
            color="#fff"
          />
        ) : (
          <Text
            style={
              styles.saveBtnText
            }
          >
            {editingId !==
            null
              ? "نوێکردنەوەی هەواڵ"
              : "پاشەکەوتکردنی هەواڵ"}
          </Text>
        )}
      </TouchableOpacity>

      {/* CANCEL */}

      {editingId !==
        null && (
        <TouchableOpacity
          style={
            styles.cancelBtn
          }
          onPress={
            resetForm
          }
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
        style={
          styles.listHeader
        }
      >
        لیستی هەواڵە تۆمارکراوەکان:
      </Text>
    </View>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View
      style={
        styles.container
      }
    >
      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >
        <TouchableOpacity
          style={
            styles.backBtn
          }
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={
            0.8
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          بەڕێوەبردنی هەواڵ و ئاگادارییەکان
        </Text>
      </View>

      {/* FLATLIST */}

      <FlatList
        data={newsList}
        keyExtractor={(item) =>
          String(item.id)
        }
        ListHeaderComponent={
          renderHeader()
        }
        refreshing={
          loading
        }
        onRefresh={
          fetchNews
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        renderItem={({
          item,
        }) => {
          const image =
            item.image;

          const isExpanded =
            expandedNewsId ===
            item.id;

          return (
            <View
              style={
                styles.newsCard
              }
            >
              {/* IMAGE */}

              {image ? (
                <Image
                  source={{
                    uri: image,
                  }}
                  style={
                    styles.cardImage
                  }
                />
              ) : (
                <View
                  style={[
                    styles.cardImage,
                    styles.noImage,
                  ]}
                >
                  <Ionicons
                    name="newspaper-outline"
                    size={28}
                    color="#888"
                  />
                </View>
              )}

              {/* INFO */}

              <View
                style={
                  styles.cardContent
                }
              >
                <View
                  style={
                    styles.categoryBadge
                  }
                >
                  <Text
                    style={
                      styles.categoryBadgeText
                    }
                  >
                    {item.category ||
                      "ئاگاداری"}
                  </Text>
                </View>

                <Text
                  style={
                    styles.cardTitle
                  }
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                {/* تەنها ئەم بەشە گۆڕاوە */}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    setExpandedNewsId(
                      isExpanded
                        ? null
                        : item.id
                    )
                  }
                  style={
                    styles.contentTouchable
                  }
                >
                  <Text
                    style={
                      styles.cardDescription
                    }
                    numberOfLines={
                      isExpanded
                        ? 99999
                        : 2
                    }
                  >
                    {item.content}
                  </Text>

                  <Text
                    style={
                      styles.readMoreText
                    }
                  >
                    {isExpanded
                      ? "کەمتر بخوێنەوە ▲"
                      : "هەمووی بخوێنەوە ▼"}
                  </Text>
                </TouchableOpacity>

                {item.created_at ? (
                  <Text
                    style={
                      styles.cardDate
                    }
                  >
                    {new Date(
                      item.created_at
                    ).toLocaleDateString(
                      "ku-IQ"
                    )}
                  </Text>
                ) : null}
              </View>

              {/* ACTIONS */}

              <View
                style={
                  styles.cardActions
                }
              >
                {/* EDIT */}

                <TouchableOpacity
                  style={
                    styles.editAction
                  }
                  onPress={() =>
                    handleEdit(
                      item
                    )
                  }
                  activeOpacity={
                    0.8
                  }
                >
                  <Ionicons
                    name="pencil"
                    size={20}
                    color="#3b82f6"
                  />
                </TouchableOpacity>

                {/* DELETE */}

                <TouchableOpacity
                  style={
                    styles.deleteAction
                  }
                  onPress={() =>
                    handleDelete(
                      item.id
                    )
                  }
                  activeOpacity={
                    0.8
                  }
                >
                  <Ionicons
                    name="trash"
                    size={20}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#0b1329",
    },

    header: {
      height: 60,
      backgroundColor:
        "#172554",
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      paddingHorizontal: 15,
    },

    backBtn: {
      padding: 5,
    },

    headerTitle: {
      flex: 1,
      color: "#fff",
      fontSize: 17,
      fontWeight:
        "bold",
      marginRight: 10,
      textAlign:
        "right",
    },

    formContainer: {
      padding: 15,
    },

    label: {
      fontSize: 13,
      fontWeight:
        "bold",
      textAlign:
        "right",
      marginBottom: 6,
      color:
        "#cbd5e1",
    },

    input: {
      backgroundColor:
        "#172554",
      borderWidth: 1,
      borderColor:
        "#1e3a8a",
      borderRadius: 8,
      padding: 10,
      textAlign:
        "right",
      marginBottom: 12,
      color: "#fff",
      minHeight:
        46,
    },

    textArea: {
      height: 110,
      textAlignVertical:
        "top",
    },

    categoryRow: {
      flexDirection:
        "row-reverse",
      justifyContent:
        "space-between",
      marginBottom: 15,
    },

    categoryBtn: {
      flex: 1,
      paddingVertical: 9,
      backgroundColor:
        "#172554",
      borderRadius: 8,
      alignItems:
        "center",
      marginHorizontal: 3,
      borderWidth: 1,
      borderColor:
        "#1e3a8a",
    },

    categoryBtnActive: {
      backgroundColor:
        "#f59e0b",
      borderColor:
        "#d97706",
    },

    categoryText: {
      color:
        "#9ca3af",
      fontSize: 12,
      fontWeight:
        "bold",
    },

    categoryTextActive: {
      color: "#000",
    },

    imagePickerBtn: {
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#172554",
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor:
        "#1e3a8a",
      marginBottom: 12,
      gap: 8,
    },

    imagePickerText: {
      color:
        "#f59e0b",
      fontSize: 13,
      fontWeight:
        "bold",
    },

    imagePreviewContainer: {
      position:
        "relative",
      marginBottom:
        15,
      alignItems:
        "center",
    },

    imagePreview: {
      width:
        "100%",
      height: 150,
      borderRadius: 8,
    },

    removeImageBtn: {
      position:
        "absolute",
      top: 5,
      right: 5,
    },

    commentsCard: {
      minHeight: 60,
      backgroundColor:
        "#172554",
      borderWidth: 1,
      borderColor:
        "#1e3a8a",
      borderRadius: 8,
      paddingHorizontal: 12,
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      marginBottom: 12,
    },

    commentsTextBox: {
      flex: 1,
      marginRight: 10,
    },

    commentsTitle: {
      color: "#fff",
      fontSize: 12,
      fontWeight:
        "bold",
      textAlign:
        "right",
    },

    commentsSubtitle: {
      color:
        "#9ca3af",
      fontSize: 10,
      marginTop: 3,
      textAlign:
        "right",
    },

    saveBtn: {
      backgroundColor:
        "#16a34a",
      paddingVertical:
        12,
      borderRadius: 8,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom:
        10,
      minHeight:
        45,
    },

    saveBtnText: {
      color: "#fff",
      fontSize: 15,
      fontWeight:
        "bold",
    },

    cancelBtn: {
      backgroundColor:
        "#475569",
      paddingVertical:
        10,
      borderRadius: 8,
      alignItems:
        "center",
      marginBottom:
        15,
    },

    cancelBtnText: {
      color: "#fff",
      fontSize: 13,
      fontWeight:
        "bold",
    },

    listHeader: {
      color: "#fff",
      fontSize: 15,
      fontWeight:
        "bold",
      textAlign:
        "right",
      marginTop:
        15,
      marginBottom:
        10,
    },

    newsCard: {
      backgroundColor:
        "#172554",
      padding: 10,
      marginHorizontal:
        15,
      marginBottom:
        10,
      borderRadius: 10,
      flexDirection:
        "row-reverse",
      alignItems:
        "flex-start",
      borderWidth: 1,
      borderColor:
        "#1e3a8a",
    },

    cardImage: {
      width: 65,
      height: 65,
      borderRadius: 8,
    },

    noImage: {
      backgroundColor:
        "#1e293b",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    cardContent: {
      flex: 1,
      marginHorizontal:
        10,
      alignItems:
        "flex-end",
    },

    categoryBadge: {
      backgroundColor:
        "#f59e0b22",
      paddingHorizontal:
        6,
      paddingVertical:
        2,
      borderRadius: 4,
      marginBottom:
        4,
    },

    categoryBadgeText: {
      color:
        "#f59e0b",
      fontSize: 10,
      fontWeight:
        "bold",
    },

    cardTitle: {
      fontSize: 13,
      fontWeight:
        "bold",
      color: "#fff",
      textAlign:
        "right",
    },

    contentTouchable: {
      width: "100%",
      alignSelf:
        "stretch",
    },

    cardDescription: {
      fontSize: 11,
      color:
        "#cbd5e1",
      marginTop: 4,
      textAlign:
        "right",
      lineHeight: 20,
    },

    readMoreText: {
      color: "#f59e0b",
      fontSize: 10,
      fontWeight: "bold",
      marginTop: 6,
      textAlign: "right",
    },

    cardDate: {
      fontSize: 10,
      color:
        "#9ca3af",
      marginTop: 4,
      textAlign:
        "right",
    },

    cardActions: {
      marginLeft: 5,
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 12,
    },

    editAction: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor:
        "#0f2744",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    deleteAction: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor:
        "#3a171b",
      alignItems:
        "center",
      justifyContent:
        "center",
    },
  });