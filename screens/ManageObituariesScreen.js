import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// فایلەکەت:
import { supabase } from "../lib/supabase";

// ============================================
// Helpers
// ============================================

const normalizeDigits = (value = "") => {
  return String(value)
    .replace(/[۰-۹]/g, (d) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    )
    .replace(/[٠-٩]/g, (d) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(d))
    );
};

const getDateSortValue = (value = "") => {
  const clean = normalizeDigits(value)
    .replace(/[-.]/g, "/")
    .trim();

  const parts = clean.split("/");

  if (parts.length !== 3) {
    return 0;
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return 0;
  }

  return year * 10000 + month * 100 + day;
};

const sortObituariesByDeathDate = (items) => {
  return [...items].sort((a, b) => {
    const dateA = getDateSortValue(a.death_date);
    const dateB = getDateSortValue(b.death_date);

    return dateB - dateA;
  });
};

const base64ToArrayBuffer = (base64) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, "");

  let padding = 0;

  if (clean.endsWith("==")) {
    padding = 2;
  } else if (clean.endsWith("=")) {
    padding = 1;
  }

  const bufferLength =
    (clean.length * 3) / 4 - padding;

  const bytes = new Uint8Array(bufferLength);

  let buffer = 0;
  let bits = 0;
  let byteIndex = 0;

  for (let i = 0; i < clean.length; i++) {
    const value = chars.indexOf(clean[i]);

    if (value === -1) {
      continue;
    }

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;

      if (byteIndex < bytes.length) {
        bytes[byteIndex++] =
          (buffer >> bits) & 255;
      }
    }
  }

  return bytes.buffer;
};

// ============================================
// Screen
// ============================================

export default function ManageObituariesScreen({
  navigation,
}) {
  const [deceasedName, setDeceasedName] = useState("");
  const [fullName, setFullName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");

  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const [obituaries, setObituaries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  // ==========================================
  // Load data
  // ==========================================

  useEffect(() => {
    loadObituaries();
  }, []);

  const loadObituaries = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("obituaries")
        .select("*");

      if (error) {
        console.log("LOAD ERROR:", error);

        Alert.alert(
          "هەڵە",
          error.message || "نەتوانرا پەیامەکان وەربگیرێن."
        );

        return;
      }

      const sortedData =
        sortObituariesByDeathDate(data || []);

      setObituaries(sortedData);
    } catch (error) {
      console.log("LOAD EXCEPTION:", error);

      Alert.alert(
        "هەڵە",
        error?.message ||
          "نەتوانرا پەیامەکان وەربگیرێن."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Pick image
  // ==========================================

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "ڕێگەپێدان پێویستە",
          "تکایە مۆڵەتی Gallery بدە."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
          base64: true,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset) {
        Alert.alert(
          "هەڵە",
          "وێنەیەک هەڵنەبژێردرا."
        );

        return;
      }

      setImageUri(asset.uri);
      setImageBase64(asset.base64 || null);
    } catch (error) {
      console.log("PICK IMAGE ERROR:", error);

      Alert.alert(
        "هەڵە",
        error?.message ||
          "نەتوانرا وێنە هەڵبژێردرێت."
      );
    }
  };

  // ==========================================
  // Remove image
  // ==========================================

  const removeImage = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  // ==========================================
  // Upload image
  // ==========================================

  const uploadImage = async () => {
    if (!imageBase64) {
      return null;
    }

    try {
      const arrayBuffer =
        base64ToArrayBuffer(imageBase64);

      const fileName =
        `obituary_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.jpg`;

      const filePath =
        `photos/${fileName}`;

      const { data, error } =
        await supabase.storage
          .from("obituaries")
          .upload(
            filePath,
            arrayBuffer,
            {
              contentType: "image/jpeg",
              cacheControl: "3600",
              upsert: false,
            }
          );

      console.log("UPLOAD DATA:", data);
      console.log("UPLOAD ERROR:", error);

      if (error) {
        throw error;
      }

      const {
        data: publicData,
      } = supabase.storage
        .from("obituaries")
        .getPublicUrl(filePath);

      if (!publicData?.publicUrl) {
        throw new Error(
          "لینکی گشتیی وێنەکە بەدەست نەهات."
        );
      }

      return publicData.publicUrl;
    } catch (error) {
      console.log(
        "UPLOAD IMAGE ERROR:",
        error
      );

      throw new Error(
        error?.message ||
          "وێنەکە upload نەکرا."
      );
    }
  };

  // ==========================================
  // Clear form
  // ==========================================

  const clearForm = () => {
    setDeceasedName("");
    setFullName("");
    setFatherName("");
    setMotherName("");
    setBirthDate("");
    setDeathDate("");
    setPhone("");
    setDetails("");

    setImageUri(null);
    setImageBase64(null);

    setEditingId(null);
  };

  // ==========================================
  // Edit
  // ==========================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setDeceasedName(
      item.deceased_name || ""
    );

    setFullName(
      item.full_name || ""
    );

    setFatherName(
      item.father_name || ""
    );

    setMotherName(
      item.mother_name || ""
    );

    setBirthDate(
      item.birth_date || ""
    );

    setDeathDate(
      item.death_date || ""
    );

    setPhone(
      item.contact_phone || ""
    );

    setDetails(
      item.details || ""
    );

    setImageUri(
      item.image_url || null
    );

    // وێنەی کۆن already online ـە
    setImageBase64(null);
  };

  // ==========================================
  // Add / Update
  // ==========================================

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    // -----------------------------
    // Required
    // -----------------------------

    if (!deceasedName.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوی کۆچکردوو بنووسە."
      );
      return;
    }

    if (!fullName.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوی تەواو بنووسە."
      );
      return;
    }

    if (!deathDate.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە بەرواری کۆچکردن بنووسە."
      );
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl =
        imageUri || null;

      // -----------------------------
      // New image
      // -----------------------------

      if (imageBase64) {
        finalImageUrl =
          await uploadImage();
      }

      // -----------------------------
      // Row
      // -----------------------------

      const row = {
        deceased_name:
          deceasedName.trim(),

        full_name:
          fullName.trim(),

        father_name:
          fatherName.trim() || null,

        mother_name:
          motherName.trim() || null,

        birth_date:
          birthDate.trim() || null,

        death_date:
          deathDate.trim(),

        contact_phone:
          phone.trim() || null,

        details:
          details.trim() || null,

        image_url:
          finalImageUrl,

        updated_at:
          new Date().toISOString(),
      };

      // -----------------------------
      // UPDATE
      // -----------------------------

      if (editingId) {
        const { error } = await supabase
          .from("obituaries")
          .update(row)
          .eq("id", editingId);

        if (error) {
          console.log(
            "UPDATE ERROR:",
            error
          );

          throw error;
        }

        Alert.alert(
          "سەرکەوتوو بوو ✅",
          "زانیارییەکە نوێکرایەوە."
        );
      }

      // -----------------------------
      // INSERT
      // -----------------------------

      else {
        const { error } =
          await supabase
            .from("obituaries")
            .insert([
              {
                ...row,
                created_at:
                  new Date().toISOString(),
              },
            ]);

        if (error) {
          console.log(
            "INSERT ERROR:",
            error
          );

          throw error;
        }

        Alert.alert(
          "سەرکەوتوو بوو ✅",
          "پەیامەکە بە سەرکەوتوویی تۆمار کرا."
        );
      }

      clearForm();

      await loadObituaries();
    } catch (error) {
      console.log(
        "SUBMIT ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "بڵاوکردنەوە سەرکەوتوو نەبوو."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // Delete
  // ==========================================

  const handleDelete = async (id) => {
  try {
    console.log("DELETE START");
    console.log("DELETE ID:", id);

    if (!id) {
      Alert.alert(
        "هەڵە",
        "ID ـی ئەم پەیامە نەدۆزرایەوە."
      );
      return;
    }

    const { data, error } = await supabase
      .from("obituaries")
      .delete()
      .eq("id", id)
      .select("id");

    console.log("DELETE DATA:", data);
    console.log("DELETE ERROR:", error);

    if (error) {
      Alert.alert(
        "هەڵەی سڕینەوە",
        error.message || "نەتوانرا پەیامەکە بسڕدرێتەوە."
      );
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert(
        "سڕینەوە نەکرا",
        "Supabase هیچ رکۆردێکی بەو ID ـە نەسڕییەوە."
      );
      return;
    }

    // لە شاشەش یەکسەر لای دەبەین
    setObituaries((oldList) =>
      oldList.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      clearForm();
    }

    Alert.alert(
      "سەرکەوتوو بوو ✅",
      "پەیامەکە سڕایەوە."
    );
  } catch (error) {
    console.log("DELETE CATCH:", error);

    Alert.alert(
      "هەڵە",
      error?.message || "سڕینەوە سەرکەوتوو نەبوو."
    );
  }
};
  // ==========================================
  // UI
  // ==========================================

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <MaterialCommunityIcons
            name="arrow-right"
            size={25}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          پرسە و سەرەخۆشی
        </Text>

        <View
          style={styles.headerSpace}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ============================= */}
        {/* FORM */}
        {/* ============================= */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {editingId
              ? "دەستکاریکردنی پەیام"
              : "زیادکردنی پەیامی پرسە"}
          </Text>

          {/* 1 - ناو */}

          <Text style={styles.label}>
            ١. ناو
          </Text>

          <TextInput
            style={styles.input}
            value={deceasedName}
            onChangeText={
              setDeceasedName
            }
            placeholder="ناوی کۆچکردوو"
            placeholderTextColor="#6B7280"
            textAlign="right"
          />

          {/* 2 - ناوی تەواو */}

          <Text style={styles.label}>
            ٢. ناوی تەواو
          </Text>

          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="ناوی تەواو"
            placeholderTextColor="#6B7280"
            textAlign="right"
          />

          {/* 3 - باوک */}

          <Text style={styles.label}>
            ٣. ناوی باوک
          </Text>

          <TextInput
            style={styles.input}
            value={fatherName}
            onChangeText={
              setFatherName
            }
            placeholder="ناوی باوک"
            placeholderTextColor="#6B7280"
            textAlign="right"
          />

          {/* 4 - دایک */}

          <Text style={styles.label}>
            ٤. ناوی دایک
          </Text>

          <TextInput
            style={styles.input}
            value={motherName}
            onChangeText={
              setMotherName
            }
            placeholder="ناوی دایک"
            placeholderTextColor="#6B7280"
            textAlign="right"
          />

          {/* 5 - Birth */}

          <Text style={styles.label}>
            ٥. بەرواری لەدایکبوون
          </Text>

          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="بۆ نموونە: 1350/05/12"
            placeholderTextColor="#6B7280"
            textAlign="right"
          />

          {/* 6 - Death */}

          <Text style={styles.label}>
            ٦. بەرواری کۆچکردن
          </Text>

          <TextInput
            style={styles.input}
            value={deathDate}
            onChangeText={
              setDeathDate
            }
            placeholder="بۆ نموونە: 1405/07/14"
            placeholderTextColor="#6B7280"
            textAlign="right"
          />

          {/* 7 - Phone */}

          <Text style={styles.label}>
            ٧. ژمارەی تەلەفۆنی کەس و کار
          </Text>

          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="ژمارەی تەلەفۆن"
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            textAlign="right"
          />

          {/* 8 - Details */}

          <Text style={styles.label}>
            ٨. زانیاری وردتر
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
            ]}
            value={details}
            onChangeText={setDetails}
            placeholder="هەر زانیارییەکی پێویست..."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={7}
            textAlign="right"
            textAlignVertical="top"
          />

          {/* 9 - Image */}

          <Text style={styles.label}>
            ٩. وێنە
          </Text>

          <TouchableOpacity
            style={
              styles.imageButton
            }
            onPress={pickImage}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="image-plus"
              size={24}
              color="#fff"
            />

            <Text
              style={
                styles.imageButtonText
              }
            >
              زیادکردنی وێنە
            </Text>
          </TouchableOpacity>

          {/* Preview */}

          {imageUri ? (
            <View
              style={
                styles.previewBox
              }
            >
              <Image
                source={{
                  uri: imageUri,
                }}
                style={
                  styles.previewImage
                }
                resizeMode="cover"
              />

              <TouchableOpacity
                style={
                  styles.removeImageButton
                }
                onPress={
                  removeImage
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Publish */}

          <TouchableOpacity
            style={[
              styles.publishButton,
              submitting &&
                styles.disabledButton,
            ]}
            onPress={
              handleSubmit
            }
            disabled={
              submitting
            }
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#fff"
              />
            ) : (
              <MaterialCommunityIcons
                name={
                  editingId
                    ? "content-save"
                    : "send"
                }
                size={22}
                color="#fff"
              />
            )}

            <Text
              style={
                styles.publishText
              }
            >
              {editingId
                ? "پاشەکەوتکردن"
                : "بڵاوکردنەوە"}
            </Text>
          </TouchableOpacity>

          {/* Cancel */}

          {editingId ? (
            <TouchableOpacity
              style={
                styles.cancelButton
              }
              onPress={
                clearForm
              }
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                هەڵوەشاندنەوەی دەستکاری
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ============================= */}
        {/* LIST */}
        {/* ============================= */}

        <View
          style={
            styles.listHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            پەیامەکان
          </Text>

          <TouchableOpacity
            onPress={
              loadObituaries
            }
          >
            <MaterialCommunityIcons
              name="refresh"
              size={23}
              color="#D97706"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View
            style={
              styles.centerBox
            }
          >
            <ActivityIndicator
              size="large"
              color="#D97706"
            />

            <Text
              style={
                styles.mutedText
              }
            >
              چاوەڕێ بە...
            </Text>
          </View>
        ) : obituaries.length === 0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <MaterialCommunityIcons
              name="candle"
              size={45}
              color="#6B7280"
            />

            <Text
              style={
                styles.emptyText
              }
            >
              هێشتا هیچ پەیامێک نییە.
            </Text>
          </View>
        ) : (
          obituaries.map(
            (item) => (
              <View
                key={item.id}
                style={
                  styles.obituaryCard
                }
              >
                {/* Image */}

                {item.image_url ? (
                  <Image
                    source={{
                      uri:
                        item.image_url,
                    }}
                    style={
                      styles.obituaryImage
                    }
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={
                      styles.imagePlaceholder
                    }
                  >
                    <MaterialCommunityIcons
                      name="candle"
                      size={38}
                      color="#6B7280"
                    />
                  </View>
                )}

                <View
                  style={
                    styles.obituaryContent
                  }
                >
                  {/* Name */}

                  <Text
                    style={
                      styles.obituaryName
                    }
                  >
                    {item.deceased_name}
                  </Text>

                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    ناوی تەواو:{" "}
                    {item.full_name}
                  </Text>

                  {/* Father */}

                  {item.father_name ? (
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      ناوی باوک:{" "}
                      {item.father_name}
                    </Text>
                  ) : null}

                  {/* Mother */}

                  {item.mother_name ? (
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      ناوی دایک:{" "}
                      {item.mother_name}
                    </Text>
                  ) : null}

                  {/* Birth */}

                  {item.birth_date ? (
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      لەدایکبوون:{" "}
                      {item.birth_date}
                    </Text>
                  ) : null}

                  {/* Death */}

                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    کۆچکردن:{" "}
                    {item.death_date}
                  </Text>

                  {/* Phone */}

                  {item.contact_phone ? (
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      ژمارە:{" "}
                      {item.contact_phone}
                    </Text>
                  ) : null}

                  {/* Details */}

                  {item.details ? (
                    <Text
                      style={
                        styles.detailsText
                      }
                    >
                      {item.details}
                    </Text>
                  ) : null}

                  {/* Actions */}

                  <View
                    style={
                      styles.actionsRow
                    }
                  >
                    <TouchableOpacity
                      style={
                        styles.editButton
                      }
                      onPress={() =>
                        handleEdit(
                          item
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={18}
                        color="#fff"
                      />

                      <Text
                        style={
                          styles.actionText
                        }
                      >
                        دەستکاری
                      </Text>
                    </TouchableOpacity>

                   <TouchableOpacity
  style={styles.deleteButton}
  activeOpacity={0.6}
  onPress={() => {
    console.log("DELETE BUTTON CLICKED");
    handleDelete(item.id);
  }}
>
  <MaterialCommunityIcons
    name="delete"
    size={18}
    color="#fff"
  />

  <Text style={styles.actionText}>
    سڕینەوە
  </Text>
</TouchableOpacity>
                  </View>
                </View>
              </View>
            )
          )
        )}
      </ScrollView>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B131F",
  },

  header: {
    height: 64,
    backgroundColor: "#131D2A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E2C3D",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1E2C3D",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  headerSpace: {
    width: 42,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 16,
    padding: 16,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
  },

  label: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 13,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#0B131F",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  textArea: {
    minHeight: 135,
  },

  imageButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#D97706",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  imageButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },

  previewBox: {
    marginTop: 14,
    position: "relative",
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#0B131F",
  },

  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      "rgba(0,0,0,0.70)",
    alignItems: "center",
    justifyContent: "center",
  },

  publishButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#D97706",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  disabledButton: {
    opacity: 0.6,
  },

  publishText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  cancelButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelText: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "600",
  },

  listHeader: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  centerBox: {
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  mutedText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 10,
  },

  emptyBox: {
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
  },

  obituaryCard: {
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },

  obituaryImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#0B131F",
  },

  imagePlaceholder: {
    height: 180,
    backgroundColor: "#0B131F",
    alignItems: "center",
    justifyContent: "center",
  },

  obituaryContent: {
    padding: 14,
  },

  obituaryName: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 8,
  },

  infoText: {
    color: "#C7CDD6",
    fontSize: 14,
    textAlign: "right",
    marginTop: 5,
  },

  detailsText: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "right",
    marginTop: 10,
    marginBottom: 14,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },

  editButton: {
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: "#1E2C3D",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  deleteButton: {
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: "#7F1D1D",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

   actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
});