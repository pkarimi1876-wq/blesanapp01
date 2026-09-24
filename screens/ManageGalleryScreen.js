// screens/ManageNewsScreen.js

import React, { useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
  Modal,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import {
  ArrowRight,
  Trash2,
  Pencil,
  ImagePlus,
  X,
  Zap,
  Newspaper,
} from "lucide-react-native";

import { supabase } from "../lib/supabase";

const CATEGORIES = [
  "ئاگاداری",
  "پڕۆژەکان",
  "کۆبوونەوە",
];

export default function ManageNewsScreen({ navigation }) {
  // =====================================================
  // General
  // =====================================================

  const [activeTab, setActiveTab] = useState("quick");

  // =====================================================
  // Quick News
  // =====================================================

  const [quickNews, setQuickNews] = useState([]);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  const [quickTitle, setQuickTitle] = useState("");
  const [quickContent, setQuickContent] = useState("");
  const [quickActive, setQuickActive] = useState(true);

  const [editingQuickId, setEditingQuickId] = useState(null);

  // =====================================================
  // Full News
  // =====================================================

  const [fullNews, setFullNews] = useState([]);
  const [fullLoading, setFullLoading] = useState(false);
  const [fullSubmitting, setFullSubmitting] = useState(false);

  const [fullTitle, setFullTitle] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [fullCategory, setFullCategory] = useState("ئاگاداری");

  const [imageUri, setImageUri] = useState("");
  const [oldImageUrl, setOldImageUrl] = useState("");

  const [editingFullId, setEditingFullId] = useState(null);

  const [imageModalVisible, setImageModalVisible] = useState(false);

  // =====================================================
  // Fetch Quick News
  // =====================================================

  const fetchQuickNews = async () => {
    setQuickLoading(true);

    try {
      const { data, error } = await supabase
        .from("quick_news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setQuickNews(data || []);
    } catch (error) {
      console.log("Quick News Error:", error.message);

      Alert.alert(
        "کێشە",
        "هێنانی هەواڵە خێراکان سەرکەوتوو نەبوو."
      );
    } finally {
      setQuickLoading(false);
    }
  };

  // =====================================================
  // Fetch Full News
  // =====================================================

  const fetchFullNews = async () => {
    setFullLoading(true);

    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFullNews(data || []);
    } catch (error) {
      console.log("Full News Error:", error.message);

      Alert.alert(
        "کێشە",
        "هێنانی هەواڵە تەواوەکان سەرکەوتوو نەبوو."
      );
    } finally {
      setFullLoading(false);
    }
  };

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    fetchQuickNews();
    fetchFullNews();
  }, []);

  // =====================================================
  // Quick News - Reset
  // =====================================================

  const resetQuickForm = () => {
    setQuickTitle("");
    setQuickContent("");
    setQuickActive(true);
    setEditingQuickId(null);
  };

  // =====================================================
  // Quick News - Add / Update
  // =====================================================

  const handleSaveQuickNews = async () => {
    if (!quickTitle.trim() || !quickContent.trim()) {
      Alert.alert(
        "ئاگاداری",
        "سەردێڕ و دەقی هەواڵ پڕ بکەرەوە."
      );
      return;
    }

    setQuickSubmitting(true);

    try {
      const payload = {
        title: quickTitle.trim(),
        content: quickContent.trim(),
        is_active: quickActive,
      };

      if (editingQuickId) {
        const { error } = await supabase
          .from("quick_news")
          .update(payload)
          .eq("id", editingQuickId);

        if (error) throw error;

        Alert.alert(
          "سەرکەوتوو بوو",
          "هەواڵی خێرا نوێکرایەوە."
        );
      } else {
        const { error } = await supabase
          .from("quick_news")
          .insert([payload]);

        if (error) throw error;

        Alert.alert(
          "سەرکەوتوو بوو",
          "هەواڵی خێرا بڵاوکرایەوە."
        );
      }

      resetQuickForm();
      await fetchQuickNews();
    } catch (error) {
      console.log("Save Quick News Error:", error.message);

      Alert.alert(
        "کێشە",
        "هەواڵی خێرا نەخراوە یان نوێ نەکرایەوە."
      );
    } finally {
      setQuickSubmitting(false);
    }
  };

  // =====================================================
  // Quick News - Edit
  // =====================================================

  const handleEditQuick = (item) => {
    setActiveTab("quick");

    setQuickTitle(item.title || "");
    setQuickContent(item.content || "");
    setQuickActive(
      item.is_active === undefined ? true : item.is_active
    );

    setEditingQuickId(item.id);
  };

  // =====================================================
  // Quick News - Delete
  // =====================================================

  const handleDeleteQuick = (id) => {
    Alert.alert(
      "سڕینەوە",
      "دڵنیایت لە سڕینەوەی ئەم هەواڵە خێرایە؟",
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ، بیسڕەوە",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("quick_news")
                .delete()
                .eq("id", id);

              if (error) throw error;

              await fetchQuickNews();
            } catch (error) {
              Alert.alert(
                "کێشە",
                "سڕینەوەی هەواڵەکە سەرکەوتوو نەبوو."
              );
            }
          },
        },
      ]
    );
  };

  // =====================================================
  // Pick Image
  // =====================================================

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "ڕێگەپێدان پێویستە",
          "بۆ هەڵبژاردنی وێنە دەبێت ڕێگە بە گەلەری بدرێت."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Image Picker Error:", error);

      Alert.alert(
        "کێشە",
        "هەڵبژاردنی وێنە سەرکەوتوو نەبوو."
      );
    }
  };

  // =====================================================
  // Upload Image
  // =====================================================

  const uploadNewsImage = async (uri) => {
    try {
      const fileName = `news/img_${Date.now()}.jpg`;

      const response = await fetch(uri);

      if (!response.ok) {
        throw new Error("نەتوانرا وێنە بخوێندرێتەوە.");
      }

      const blob = await response.blob();

      const { error: uploadError } =
        await supabase.storage
          .from("gallery")
          .upload(fileName, blob, {
            contentType: "image/jpeg",
            upsert: true,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("gallery")
          .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          "نەتوانرا لینکی گشتیی وێنە دروست بکرێت."
        );
      }

      return publicUrlData.publicUrl;
    } catch (error) {
      console.log(
        "News Image Upload Error:",
        error.message
      );

      throw error;
    }
  };

  // =====================================================
  // Full News - Reset
  // =====================================================

  const resetFullForm = () => {
    setFullTitle("");
    setFullContent("");
    setFullCategory("ئاگاداری");

    setImageUri("");
    setOldImageUrl("");

    setEditingFullId(null);
  };

  // =====================================================
  // Full News - Add / Update
  // =====================================================

  const handleSaveFullNews = async () => {
    if (!fullTitle.trim() || !fullContent.trim()) {
      Alert.alert(
        "ئاگاداری",
        "سەردێڕ و دەقی هەواڵ پڕ بکەرەوە."
      );
      return;
    }

    if (!editingFullId && !imageUri) {
      Alert.alert(
        "وێنە پێویستە",
        "بۆ هەواڵی تەواو تکایە وێنەیەک هەڵبژێرە."
      );
      return;
    }

    setFullSubmitting(true);

    try {
      let finalImageUrl = oldImageUrl;

      // ئەگەر وێنەی نوێ هەڵبژێردرا
      if (imageUri) {
        finalImageUrl = await uploadNewsImage(imageUri);
      }

      if (!finalImageUrl) {
        throw new Error("وێنەی هەواڵ بەردەست نییە.");
      }

      const payload = {
        title: fullTitle.trim(),
        content: fullContent.trim(),
        category: fullCategory,
        image: finalImageUrl,
      };

      if (editingFullId) {
        const { error } = await supabase
          .from("news")
          .update(payload)
          .eq("id", editingFullId);

        if (error) throw error;

        Alert.alert(
          "سەرکەوتوو بوو",
          "هەواڵی تەواو نوێکرایەوە."
        );
      } else {
        const { error } = await supabase
          .from("news")
          .insert([payload]);

        if (error) throw error;

        Alert.alert(
          "سەرکەوتوو بوو",
          "هەواڵی تەواو بڵاوکرایەوە."
        );
      }

      resetFullForm();
      await fetchFullNews();
    } catch (error) {
      console.log(
        "Save Full News Error:",
        error.message
      );

      Alert.alert(
        "کێشە",
        error.message ||
          "هەواڵی تەواو نەخراوە یان نوێ نەکرایەوە."
      );
    } finally {
      setFullSubmitting(false);
    }
  };

  // =====================================================
  // Full News - Edit
  // =====================================================

  const handleEditFull = (item) => {
    setActiveTab("full");

    setFullTitle(item.title || "");
    setFullContent(item.content || "");
    setFullCategory(item.category || "ئاگاداری");

    setOldImageUrl(item.image || "");
    setImageUri("");

    setEditingFullId(item.id);
  };

  // =====================================================
  // Full News - Delete
  // =====================================================

  const handleDeleteFull = (id) => {
    Alert.alert(
      "سڕینەوە",
      "دڵنیایت لە سڕینەوەی ئەم هەواڵە تەواوە؟",
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ، بیسڕەوە",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("news")
                .delete()
                .eq("id", id);

              if (error) throw error;

              await fetchFullNews();
            } catch (error) {
              Alert.alert(
                "کێشە",
                "سڕینەوەی هەواڵەکە سەرکەوتوو نەبوو."
              );
            }
          },
        },
      ]
    );
  };

  // =====================================================
  // Format Date
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    try {
      return new Date(date).toLocaleDateString("ku");
    } catch {
      return "";
    }
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowRight color="#FFF" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          بەڕێوەبردنی هەواڵەکان
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "quick" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("quick")}
          activeOpacity={0.8}
        >
          <Zap
            color={
              activeTab === "quick"
                ? "#000"
                : "#F59E0B"
            }
            size={19}
          />

          <Text
            style={[
              styles.tabText,
              activeTab === "quick" &&
                styles.activeTabText,
            ]}
          >
            هەواڵی خێرا
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "full" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("full")}
          activeOpacity={0.8}
        >
          <Newspaper
            color={
              activeTab === "full"
                ? "#000"
                : "#D97706"
            }
            size={19}
          />

          <Text
            style={[
              styles.tabText,
              activeTab === "full" &&
                styles.activeTabText,
            ]}
          >
            هەواڵی تەواو
          </Text>
        </TouchableOpacity>

      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ================================================= */}
        {/* QUICK NEWS */}
        {/* ================================================= */}

        {activeTab === "quick" && (
          <>

            <View style={styles.card}>

              <View style={styles.formHeader}>
                <Zap color="#F59E0B" size={20} />

                <Text style={styles.cardTitle}>
                  {editingQuickId
                    ? "دەستکاریکردنی هەواڵی خێرا"
                    : "بڵاوکردنەوەی هەواڵی خێرا"}
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="سەردێڕی هەواڵ"
                placeholderTextColor="#718096"
                value={quickTitle}
                onChangeText={setQuickTitle}
              />

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder="دەقی کورت و خێرای هەواڵ..."
                placeholderTextColor="#718096"
                multiline
                value={quickContent}
                onChangeText={setQuickContent}
              />

              <View style={styles.switchRow}>

                <Text style={styles.switchText}>
                  هەواڵەکە چالاک بێت؟
                </Text>

                <Switch
                  value={quickActive}
                  onValueChange={setQuickActive}
                  trackColor={{
                    false: "#1E2C3D",
                    true: "#D97706",
                  }}
                  thumbColor="#FFF"
                />

              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSaveQuickNews}
                disabled={quickSubmitting}
                activeOpacity={0.8}
              >
                {quickSubmitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitText}>
                    {editingQuickId
                      ? "نوێکردنەوە"
                      : "بڵاوکردنەوە"}
                  </Text>
                )}
              </TouchableOpacity>

              {editingQuickId && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={resetQuickForm}
                >
                  <Text style={styles.cancelText}>
                    هەڵوەشاندنەوە
                  </Text>
                </TouchableOpacity>
              )}

            </View>

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeader}>
                هەواڵە خێراکان ({quickNews.length})
              </Text>
            </View>

            {quickLoading ? (
              <ActivityIndicator
                color="#D97706"
                size="large"
                style={{ marginTop: 20 }}
              />
            ) : quickNews.length === 0 ? (
              <View style={styles.emptyBox}>
                <Zap color="#718096" size={28} />

                <Text style={styles.emptyText}>
                  هیچ هەواڵێکی خێرا نییە.
                </Text>
              </View>
            ) : (
              quickNews.map((item) => (
                <View
                  key={item.id}
                  style={styles.itemCard}
                >

                  <View style={styles.itemActions}>

                    <TouchableOpacity
                      onPress={() =>
                        handleEditQuick(item)
                      }
                      style={styles.editBtn}
                    >
                      <Pencil
                        color="#F59E0B"
                        size={17}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteQuick(item.id)
                      }
                      style={styles.deleteBtn}
                    >
                      <Trash2
                        color="#EF4444"
                        size={17}
                      />
                    </TouchableOpacity>

                  </View>

                  <View style={styles.itemInfo}>

                    <View style={styles.itemTitleRow}>

                      {!item.is_active && (
                        <View
                          style={styles.inactiveBadge}
                        >
                          <Text
                            style={
                              styles.inactiveBadgeText
                            }
                          >
                            ناچالاک
                          </Text>
                        </View>
                      )}

                      <Text style={styles.itemName}>
                        {item.title}
                      </Text>

                    </View>

                    <Text style={styles.itemSub}>
                      {item.content}
                    </Text>

                    <Text style={styles.itemDate}>
                      {formatDate(item.created_at)}
                    </Text>

                  </View>

                </View>
              ))
            )}

          </>
        )}

        {/* ================================================= */}
        {/* FULL NEWS */}
        {/* ================================================= */}

        {activeTab === "full" && (
          <>

            <View style={styles.card}>

              <View style={styles.formHeader}>
                <Newspaper color="#D97706" size={20} />

                <Text style={styles.cardTitle}>
                  {editingFullId
                    ? "دەستکاریکردنی هەواڵی تەواو"
                    : "بڵاوکردنەوەی هەواڵی تەواو"}
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="سەردێڕی هەواڵ"
                placeholderTextColor="#718096"
                value={fullTitle}
                onChangeText={setFullTitle}
              />

              <TextInput
                style={[
                  styles.input,
                  styles.fullTextArea,
                ]}
                placeholder="دەقی تەواوی هەواڵ..."
                placeholderTextColor="#718096"
                multiline
                textAlignVertical="top"
                value={fullContent}
                onChangeText={setFullContent}
              />

              {/* Category */}

              <Text style={styles.fieldLabel}>
                جۆری هەواڵ
              </Text>

              <View style={styles.categoryRow}>

                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      fullCategory === category &&
                        styles.activeCategoryChip,
                    ]}
                    onPress={() =>
                      setFullCategory(category)
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        fullCategory === category &&
                          styles.activeCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}

              </View>

              {/* Image */}

              <Text style={styles.fieldLabel}>
                وێنەی هەواڵ
              </Text>

              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => setImageModalVisible(true)}
                activeOpacity={0.8}
              >

                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.selectedImage}
                  />
                ) : oldImageUrl ? (
                  <Image
                    source={{ uri: oldImageUrl }}
                    style={styles.selectedImage}
                  />
                ) : (
                  <>
                    <ImagePlus
                      color="#D97706"
                      size={30}
                    />

                    <Text style={styles.imagePickerText}>
                      وێنە هەڵبژێرە
                    </Text>
                  </>
                )}

              </TouchableOpacity>

              {(imageUri || oldImageUrl) && (
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => {
                    setImageUri("");

                    if (editingFullId) {
                      setOldImageUrl("");
                    }
                  }}
                >
                  <X color="#EF4444" size={17} />

                  <Text style={styles.removeImageText}>
                    لابردنی وێنە
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSaveFullNews}
                disabled={fullSubmitting}
                activeOpacity={0.8}
              >
                {fullSubmitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitText}>
                    {editingFullId
                      ? "نوێکردنەوەی هەواڵ"
                      : "بڵاوکردنەوەی هەواڵ"}
                  </Text>
                )}
              </TouchableOpacity>

              {editingFullId && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={resetFullForm}
                >
                  <Text style={styles.cancelText}>
                    هەڵوەشاندنەوە
                  </Text>
                </TouchableOpacity>
              )}

            </View>

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeader}>
                هەواڵە تەواوەکان ({fullNews.length})
              </Text>
            </View>

            {fullLoading ? (
              <ActivityIndicator
                color="#D97706"
                size="large"
                style={{ marginTop: 20 }}
              />
            ) : fullNews.length === 0 ? (
              <View style={styles.emptyBox}>
                <Newspaper
                  color="#718096"
                  size={28}
                />

                <Text style={styles.emptyText}>
                  هیچ هەواڵێکی تەواو نییە.
                </Text>
              </View>
            ) : (
              fullNews.map((item) => (
                <View
                  key={item.id}
                  style={styles.fullItemCard}
                >

                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.newsThumbnail}
                    />
                  ) : null}

                  <View style={styles.fullItemInfo}>

                    <View
                      style={styles.fullItemTopRow}
                    >

                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteFull(item.id)
                        }
                        style={styles.deleteBtn}
                      >
                        <Trash2
                          color="#EF4444"
                          size={17}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          handleEditFull(item)
                        }
                        style={styles.editBtn}
                      >
                        <Pencil
                          color="#F59E0B"
                          size={17}
                        />
                      </TouchableOpacity>

                    </View>

                    <View
                      style={styles.badgeRow}
                    >
                      <View style={styles.newsBadge}>
                        <Text
                          style={styles.newsBadgeText}
                        >
                          {item.category}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.fullItemTitle}>
                      {item.title}
                    </Text>

                    <Text
                      style={styles.fullItemContent}
                      numberOfLines={3}
                    >
                      {item.content}
                    </Text>

                    <Text style={styles.itemDate}>
                      {formatDate(item.created_at)}
                    </Text>

                  </View>

                </View>
              ))
            )}

          </>
        )}

      </ScrollView>

      {/* ================================================= */}
      {/* Image Modal */}
      {/* ================================================= */}

      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setImageModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() =>
                setImageModalVisible(false)
              }
            >
              <X color="#FFF" size={22} />
            </TouchableOpacity>

            <ImagePlus
              color="#D97706"
              size={38}
            />

            <Text style={styles.modalTitle}>
              وێنەی هەواڵ
            </Text>

            <Text style={styles.modalText}>
              وێنەیەک لە گەلەری مۆبایلەکەت هەڵبژێرە.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                await pickImage();
                setImageModalVisible(false);
              }}
            >
              <ImagePlus
                color="#000"
                size={19}
              />

              <Text style={styles.modalButtonText}>
                هەڵبژاردنی وێنە
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() =>
                setImageModalVisible(false)
              }
            >
              <Text style={styles.modalCancelText}>
                داخستن
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </Modal>

    </SafeAreaView>
  );
}

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B131F",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#1E2C3D",
  },

  backButton: {
    padding: 5,
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 12,
    textAlign: "right",
  },

  tabsContainer: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },

  tab: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    backgroundColor: "#131D2A",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  activeTab: {
    backgroundColor: "#D97706",
    borderColor: "#D97706",
  },

  tabText: {
    color: "#A0AEC0",
    fontSize: 13,
    fontWeight: "bold",
  },

  activeTabText: {
    color: "#000",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#131D2A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    marginBottom: 22,
  },

  formHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  cardTitle: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },

  input: {
    backgroundColor: "#0B131F",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    color: "#FFF",
    paddingHorizontal: 12,
    height: 46,
    textAlign: "right",
    marginBottom: 9,
  },

  textArea: {
    height: 85,
    textAlignVertical: "top",
    paddingTop: 12,
  },

  fullTextArea: {
    height: 160,
    textAlignVertical: "top",
    paddingTop: 12,
  },

  switchRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },

  switchText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },

  submitBtn: {
    backgroundColor: "#D97706",
    borderRadius: 10,
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  submitText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },

  cancelBtn: {
    backgroundColor: "#1E2C3D",
    borderRadius: 10,
    minHeight: 42,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  cancelText: {
    color: "#CBD5E1",
    fontWeight: "bold",
  },

  fieldLabel: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 5,
    marginBottom: 9,
  },

  categoryRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  categoryChip: {
    backgroundColor: "#0B131F",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },

  activeCategoryChip: {
    backgroundColor: "#D97706",
    borderColor: "#D97706",
  },

  categoryText: {
    color: "#A0AEC0",
    fontSize: 12,
    fontWeight: "bold",
  },

  activeCategoryText: {
    color: "#000",
  },

  imagePicker: {
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
    backgroundColor: "#0B131F",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  imagePickerText: {
    color: "#A0AEC0",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 8,
  },

  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  removeImageBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 8,
  },

  removeImageText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "bold",
  },

  sectionTitleRow: {
    flexDirection: "row-reverse",
    marginBottom: 12,
  },

  sectionHeader: {
    flex: 1,
    color: "#718096",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },

  itemCard: {
    backgroundColor: "#131D2A",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  itemActions: {
    flexDirection: "column",
    gap: 7,
    marginRight: 10,
  },

  itemInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  itemTitleRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
  },

  itemName: {
    flex: 1,
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "right",
  },

  itemSub: {
    width: "100%",
    color: "#A0AEC0",
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
    lineHeight: 20,
  },

  itemDate: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 6,
    textAlign: "right",
  },

  editBtn: {
    padding: 7,
    backgroundColor: "#0B131F",
    borderRadius: 8,
  },

  deleteBtn: {
    padding: 7,
    backgroundColor: "#0B131F",
    borderRadius: 8,
  },

  inactiveBadge: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  inactiveBadgeText: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "bold",
  },

  emptyBox: {
    backgroundColor: "#131D2A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#718096",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },

  fullItemCard: {
    backgroundColor: "#131D2A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    marginBottom: 12,
    padding: 10,
    flexDirection: "row-reverse",
  },

  newsThumbnail: {
    width: 105,
    height: 120,
    borderRadius: 10,
    marginLeft: 10,
  },

  fullItemInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  fullItemTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 7,
    marginBottom: 4,
  },

  badgeRow: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 5,
  },

  newsBadge: {
    backgroundColor: "#232E42",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  newsBadgeText: {
    color: "#D97706",
    fontSize: 10,
    fontWeight: "bold",
  },

  fullItemTitle: {
    width: "100%",
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    lineHeight: 21,
  },

  fullItemContent: {
    width: "100%",
    color: "#A0AEC0",
    fontSize: 11,
    textAlign: "right",
    lineHeight: 18,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBox: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#131D2A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    padding: 22,
    alignItems: "center",
  },

  modalClose: {
    position: "absolute",
    top: 12,
    left: 12,
    padding: 5,
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },

  modalText: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  modalButton: {
    width: "100%",
    minHeight: 46,
    backgroundColor: "#D97706",
    borderRadius: 10,
    marginTop: 20,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  modalButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 13,
  },

  modalCancel: {
    marginTop: 10,
    padding: 10,
  },

  modalCancelText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "bold",
  },
});