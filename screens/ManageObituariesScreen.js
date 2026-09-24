
import React, { useState, useEffect } from "react";
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
} from "react-native";
import { ArrowRight, Trash2, Pencil, X } from "lucide-react-native";
import { supabase } from "../lib/supabase";

export default function ManageObituariesScreen({ navigation }) {
  const [obituaries, setObituaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deceasedName, setDeceasedName] = useState("");
  const [details, setDetails] = useState("");
  const [phone, setPhone] = useState("");

  const [editingId, setEditingId] = useState(null);

  // =====================================================
  // هێنانی لیستی پرسەکان
  // =====================================================
  const fetchObituaries = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("obituaries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setObituaries(data || []);
    } catch (err) {
      console.log("FETCH OBITUARIES ERROR:", err);

      Alert.alert(
        "کێشە لە هێنانی زانیاری",
        err?.message || "نەتوانرا لیستی پرسەکان بهێنرێت."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObituaries();
  }, []);

  // =====================================================
  // پاککردنەوەی فۆڕم
  // =====================================================
  const clearForm = () => {
    setDeceasedName("");
    setDetails("");
    setPhone("");
    setEditingId(null);
  };

  // =====================================================
  // دەستپێکردنی دەستکاری
  // =====================================================
  const startEdit = (item) => {
    setEditingId(item.id);
    setDeceasedName(item.deceased_name || "");
    setDetails(item.details || "");
    setPhone(item.contact_phone || "");

    // گەڕانەوە بۆ سەر فۆڕمەکە
    setTimeout(() => {
      // هیچ شتێکی تایبەت پێویست نییە
    }, 100);
  };

  // =====================================================
  // زیادکردن / نوێکردنەوە
  // =====================================================
  const handleSubmit = async () => {
    if (!deceasedName.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوی کۆچکردوو بنووسە."
      );
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      const obituaryData = {
        deceased_name: deceasedName.trim(),
        details: details.trim(),
        contact_phone: phone.trim(),
      };

      // -------------------------------------------------
      // دەستکاری
      // -------------------------------------------------
      if (editingId) {
        const { error } = await supabase
          .from("obituaries")
          .update(obituaryData)
          .eq("id", editingId);

        if (error) throw error;

        Alert.alert(
          "سەرکەوتوو بوو",
          "زانیاریی پرسەکە نوێ کرایەوە."
        );
      }

      // -------------------------------------------------
      // زیادکردنی نوێ
      // -------------------------------------------------
      else {
        const { error } = await supabase
          .from("obituaries")
          .insert([obituaryData]);

        if (error) throw error;

        Alert.alert(
          "سەرکەوتوو بوو",
          "ئاگاداری پرسە بڵاوکرایەوە."
        );
      }

      clearForm();
      await fetchObituaries();
    } catch (err) {
      console.log("SAVE OBITUARY ERROR:", err);

      Alert.alert(
        editingId
          ? "کێشە لە دەستکاریکردن"
          : "کێشە لە زیادکردن",
        err?.message || "کێشەیەک ڕوویدا."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // سڕینەوە
  // =====================================================
  const handleDelete = (id) => {
    Alert.alert(
      "سڕینەوە",
      "دڵنیایت لە سڕینەوەی ئەم ئاگادارییە؟",
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
                .from("obituaries")
                .delete()
                .eq("id", id);

              if (error) throw error;

              // ئەگەر ئەو دانەیە لە دەستکاری بوو
              if (editingId === id) {
                clearForm();
              }

              await fetchObituaries();

              Alert.alert(
                "سڕینەوە سەرکەوتوو بوو",
                "ئاگادارییەکە سڕایەوە."
              );
            } catch (err) {
              console.log(
                "DELETE OBITUARY ERROR:",
                err
              );

              Alert.alert(
                "کێشە لە سڕینەوە",
                err?.message ||
                  "نەتوانرا ئاگادارییەکە بسڕدرێتەوە."
              );
            }
          },
        },
      ]
    );
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <ArrowRight color="#FFF" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          بەڕێوەبردنی پرسە و سەرەخۆشی
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            Form
        ================================================= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {editingId
              ? "دەستکاریکردنی ئاگاداری پرسە"
              : "تۆمارکردنی کۆچکردووی نوێ"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="ناوی کۆچکردوو"
            placeholderTextColor="#718096"
            value={deceasedName}
            onChangeText={setDeceasedName}
            textAlign="right"
          />

          <TextInput
            style={[
              styles.input,
              { marginTop: 8 },
            ]}
            placeholder="ژمارەی مۆبایلی کەسوکار"
            placeholderTextColor="#718096"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            textAlign="right"
          />

          <TextInput
            style={[
              styles.input,
              {
                marginTop: 8,
                height: 80,
                textAlignVertical: "top",
                paddingTop: 12,
              },
            ]}
            placeholder="زانیاری زیاتر (شوێنی پرسە و...)"
            placeholderTextColor="#718096"
            multiline
            value={details}
            onChangeText={setDetails}
            textAlign="right"
          />

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitText}>
                {editingId
                  ? "پاشەکەوتکردنی گۆڕانکاری"
                  : "بڵاوکردنەوە"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Edit */}
          {editingId && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={clearForm}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>
                هەڵوەشاندنەوەی دەستکاری
              </Text>

              <X color="#A0AEC0" size={18} />
            </TouchableOpacity>
          )}
        </View>

        {/* =================================================
            List Header
        ================================================= */}
        <Text style={styles.sectionHeader}>
          لیستی پرسەکان ({obituaries.length})
        </Text>

        {/* =================================================
            Loading
        ================================================= */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="small"
              color="#D97706"
            />
          </View>
        ) : obituaries.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              هێشتا هیچ ئاگادارییەکی پرسە تۆمار نەکراوە.
            </Text>
          </View>
        ) : (
          obituaries.map((item) => (
            <View
              key={item.id}
              style={styles.itemCard}
            >
              {/* Buttons */}
              <View style={styles.actionsBox}>
                {/* Edit */}
                <TouchableOpacity
                  onPress={() => startEdit(item)}
                  style={styles.editBtn}
                  activeOpacity={0.8}
                >
                  <Pencil
                    color="#D97706"
                    size={18}
                  />
                </TouchableOpacity>

                {/* Delete */}
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.8}
                >
                  <Trash2
                    color="#EF4444"
                    size={18}
                  />
                </TouchableOpacity>
              </View>

              {/* Information */}
              <View
                style={styles.itemInfo}
              >
                <Text style={styles.itemName}>
                  {item.deceased_name}
                </Text>

                {item.contact_phone ? (
                  <Text style={styles.itemSub}>
                    پەیوەندی: {item.contact_phone}
                  </Text>
                ) : null}

                {item.details ? (
                  <Text style={styles.itemDetails}>
                    {item.details}
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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

  backBtn: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 12,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#131D2A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    marginBottom: 20,
  },

  cardTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#0B131F",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    color: "#FFF",
    paddingHorizontal: 12,
    height: 44,
  },

  submitBtn: {
    backgroundColor: "#D97706",
    borderRadius: 10,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  submitText: {
    color: "#000",
    fontWeight: "bold",
  },

  cancelBtn: {
    height: 42,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  cancelText: {
    color: "#A0AEC0",
    fontWeight: "bold",
    marginRight: 6,
  },

  sectionHeader: {
    color: "#718096",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 12,
  },

  loadingBox: {
    paddingVertical: 20,
    alignItems: "center",
  },

  emptyBox: {
    backgroundColor: "#131D2A",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E2C3D",
  },

  emptyText: {
    color: "#718096",
    textAlign: "right",
    fontSize: 13,
  },

  itemCard: {
    backgroundColor: "#131D2A",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actionsBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  editBtn: {
    padding: 7,
    backgroundColor: "#0B131F",
    borderRadius: 8,
    marginRight: 6,
  },

  deleteBtn: {
    padding: 7,
    backgroundColor: "#0B131F",
    borderRadius: 8,
  },

  itemInfo: {
    alignItems: "flex-end",
    flex: 1,
    marginRight: 10,
  },

  itemName: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "right",
  },

  itemSub: {
    color: "#A0AEC0",
    fontSize: 12,
    marginTop: 3,
    textAlign: "right",
  },

  itemDetails: {
    color: "#718096",
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
    lineHeight: 18,
  },
});

