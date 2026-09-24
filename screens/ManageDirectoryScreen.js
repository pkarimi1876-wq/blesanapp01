import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowRight,
  Edit3,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react-native";

import { supabase } from "../lib/supabase";

const normalizePhone = (value) => {
  let phone = String(value || "")
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");

  if (phone.startsWith("0098")) {
    phone = "+" + phone.slice(2);
  } else if (phone.startsWith("98")) {
    phone = "+" + phone;
  } else if (phone.startsWith("09")) {
    phone = "+98" + phone.slice(1);
  } else if (phone.startsWith("9")) {
    phone = "+98" + phone;
  }

  return phone;
};

const isValidIranPhone = (phone) => {
  return /^\+989\d{9}$/.test(phone);
};

export default function ManageDirectoryScreen({
  navigation,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] =
    useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  // =====================================================
  // Check Admin
  // =====================================================

  const checkAdmin = useCallback(async () => {
    try {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const session = sessionData?.session;

      if (!session?.user) {
        setIsAdmin(false);
        return false;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (profile?.role !== "admin") {
        setIsAdmin(false);
        return false;
      }

      setIsAdmin(true);
      return true;
    } catch (error) {
      console.log(
        "MANAGE DIRECTORY ADMIN CHECK ERROR:",
        error
      );

      setIsAdmin(false);
      return false;
    }
  }, []);

  // =====================================================
  // Load Contacts
  // =====================================================

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setContacts(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.log(
        "MANAGE DIRECTORY LOAD ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "نەتوانرا ژمارە تەلەفۆنەکان بخوێندرێنەوە."
      );

      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    const initialize = async () => {
      const admin = await checkAdmin();

      if (!admin) {
        Alert.alert(
          "دەسەڵاتت نییە",
          "تەنها Admin دەتوانێت ئەم بەشە بەکاربهێنێت.",
          [
            {
              text: "باشە",
              onPress: () =>
                navigation.goBack(),
            },
          ]
        );

        setLoading(false);
        return;
      }

      await loadContacts();
    };

    initialize();
  }, [
    checkAdmin,
    loadContacts,
    navigation,
  ]);

  // =====================================================
  // Reload when Screen Focuses
  // =====================================================

  useEffect(() => {
    const unsubscribe =
      navigation.addListener("focus", async () => {
        const admin = await checkAdmin();

        if (admin) {
          loadContacts();
        }
      });

    return unsubscribe;
  }, [
    navigation,
    checkAdmin,
    loadContacts,
  ]);

  // =====================================================
  // Open Add Form
  // =====================================================

  const openAddForm = () => {
    setEditingContact(null);
    setName("");
    setPhone("");
    setModalVisible(true);
  };

  // =====================================================
  // Open Edit Form
  // =====================================================

  const openEditForm = (contact) => {
    setEditingContact(contact);
    setName(contact?.name || "");
    setPhone(contact?.phone || "");
    setModalVisible(true);
  };

  // =====================================================
  // Close Modal
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setEditingContact(null);
    setName("");
    setPhone("");
  };

  // =====================================================
  // Save Contact
  // =====================================================

  const saveContact = async () => {
    if (!isAdmin) {
      Alert.alert(
        "دەسەڵاتت نییە",
        "تەنها Admin دەتوانێت ژمارە زیاد یان دەستکاری بکات."
      );
      return;
    }

    const cleanName = name.trim();
    const cleanPhone = normalizePhone(phone);

    if (!cleanName) {
      Alert.alert(
        "ناو پێویستە",
        "تکایە ناوی کەسەکە بنووسە."
      );
      return;
    }

    if (!cleanPhone) {
      Alert.alert(
        "ژمارە پێویستە",
        "تکایە ژمارەی تەلەفۆن بنووسە."
      );
      return;
    }

    if (!isValidIranPhone(cleanPhone)) {
      Alert.alert(
        "ژمارەی هەڵە",
        "تکایە ژمارەکە بە شێوەی دروست بنووسە.\n\nنموونە:\n09123456789"
      );
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // Add
      // =================================================

      if (!editingContact) {
        const {
          data,
          error,
        } = await supabase
          .from("contacts")
          .insert({
            name: cleanName,
            phone: cleanPhone,
            category: "ژمارەی پێویست",
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        setContacts((prev) => [
          data,
          ...prev,
        ]);

        Alert.alert(
          "سەرکەوتوو بوو ✅",
          "ژمارەکە بە سەرکەوتوویی زیاد کرا."
        );
      }

      // =================================================
      // Edit
      // =================================================

      else {
        const {
          data,
          error,
        } = await supabase
          .from("contacts")
          .update({
            name: cleanName,
            phone: cleanPhone,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", editingContact.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setContacts((prev) =>
          prev.map((item) =>
            item.id === data.id
              ? data
              : item
          )
        );

        Alert.alert(
          "سەرکەوتوو بوو ✅",
          "زانیارییەکە بە سەرکەوتوویی دەستکاری کرا."
        );
      }

      closeModal();
    } catch (error) {
      console.log(
        "SAVE CONTACT ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "نەتوانرا زانیارییەکە پاشەکەوت بکرێت."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // Delete Contact
  // =====================================================

  const deleteContact = (contact) => {
    if (!isAdmin) {
      Alert.alert(
        "دەسەڵاتت نییە",
        "تەنها Admin دەتوانێت ژمارە بسڕێتەوە."
      );
      return;
    }

    Alert.alert(
      "سڕینەوەی ژمارە",
      `دڵنیایت لە سڕینەوەی «${
        contact?.name || ""
      }»؟`,
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
              const {
                error,
              } = await supabase
                .from("contacts")
                .delete()
                .eq("id", contact.id);

              if (error) {
                throw error;
              }

              setContacts((prev) =>
                prev.filter(
                  (item) =>
                    item.id !== contact.id
                )
              );

              Alert.alert(
                "سڕایەوە ✅",
                "ژمارەکە بە سەرکەوتوویی سڕایەوە."
              );
            } catch (error) {
              console.log(
                "DELETE CONTACT ERROR:",
                error
              );

              Alert.alert(
                "هەڵە",
                error?.message ||
                  "نەتوانرا ژمارەکە بسڕدرێتەوە."
              );
            }
          },
        },
      ]
    );
  };

  // =====================================================
  // Call
  // =====================================================

  const callContact = async (phoneNumber) => {
    const phone = normalizePhone(
      phoneNumber
    );

    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      Alert.alert(
        "هەڵە",
        "نەتوانرا ئەپەکانی پەیوەندی کردن بکرێتەوە."
      );
    }
  };

  // =====================================================
  // Filter Contacts
  // =====================================================

  const filteredContacts = contacts.filter(
    (item) => {
      const query =
        searchQuery.trim().toLowerCase();

      if (!query) return true;

      return (
        String(item?.name || "")
          .toLowerCase()
          .includes(query) ||
        String(item?.phone || "")
          .toLowerCase()
          .includes(query)
      );
    }
  );

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centerContent,
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#D97706"
        />

        <Text style={styles.loadingText}>
          ژمارەکان دەخوێندرێنەوە...
        </Text>
      </SafeAreaView>
    );
  }

  // =====================================================
  // Unauthorized
  // =====================================================

  if (!isAdmin) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centerContent,
        ]}
      >
        <ShieldCheck
          color="#D97706"
          size={48}
        />

        <Text style={styles.noAccessTitle}>
          دەسەڵاتت نییە
        </Text>

        <Text style={styles.noAccessText}>
          تەنها Admin دەتوانێت ئەم بەشە ببینێت.
        </Text>

        <TouchableOpacity
          style={styles.backMainButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text style={styles.backMainButtonText}>
            گەڕانەوە
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // =====================================================
  // Main Screen
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <ArrowRight
            color="#FFF"
            size={23}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            بەڕێوەبردنی ژمارەکان
          </Text>

          <Phone
            color="#D97706"
            size={22}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Admin Info */}
        <View style={styles.adminCard}>
          <View style={styles.adminIconBox}>
            <ShieldCheck
              color="#D97706"
              size={24}
            />
          </View>

          <View style={styles.adminTextBox}>
            <Text style={styles.adminTitle}>
              بەڕێوەبردنی ژمارە تەلەفۆنەکان
            </Text>

            <Text style={styles.adminSubtitle}>
              زیادکردن، دەستکاری و سڕینەوەی ژمارەکان
            </Text>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddForm}
          activeOpacity={0.85}
        >
          <Plus
            color="#000"
            size={21}
          />

          <Text style={styles.addButtonText}>
            زیادکردنی ژمارە
          </Text>
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchBox}>
          <Search
            color="#94A3B8"
            size={20}
          />

          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="گەڕان بە ناو یان ژمارە..."
            placeholderTextColor="#64748B"
            textAlign="right"
            autoCorrect={false}
          />
        </View>

        {/* Counter */}
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            {filteredContacts.length} ژمارە
          </Text>

          <Text style={styles.counterLabel}>
            لیستی ژمارەکان
          </Text>
        </View>

        {/* Empty */}
        {filteredContacts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Phone
              color="#64748B"
              size={42}
            />

            <Text style={styles.emptyTitle}>
              هیچ ژمارەیەک نەدۆزرایەوە
            </Text>

            <Text style={styles.emptyText}>
              {searchQuery
                ? "گەڕانەکەت هیچ ئەنجامێکی نەدۆزییەوە."
                : "هێشتا هیچ ژمارەیەک زیاد نەکراوە."}
            </Text>
          </View>
        ) : (
          filteredContacts.map((item) => (
            <View
              key={item.id}
              style={styles.contactCard}
            >
              <View style={styles.contactTop}>
                <View style={styles.contactIconBox}>
                  <User
                    color="#D97706"
                    size={22}
                  />
                </View>

                <View style={styles.contactInfo}>
                  <Text
                    style={styles.contactName}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={styles.contactPhone}
                    numberOfLines={1}
                  >
                    {item.phone}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() =>
                    callContact(item.phone)
                  }
                  activeOpacity={0.85}
                >
                  <Phone
                    color="#FFF"
                    size={18}
                  />

                  <Text style={styles.callText}>
                    پەیوەندی
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    openEditForm(item)
                  }
                  activeOpacity={0.85}
                >
                  <Edit3
                    color="#D97706"
                    size={18}
                  />

                  <Text style={styles.editText}>
                    دەستکاری
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    deleteContact(item)
                  }
                  activeOpacity={0.85}
                >
                  <Trash2
                    color="#EF4444"
                    size={18}
                  />

                  <Text style={styles.deleteText}>
                    سڕینەوە
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                disabled={saving}
              >
                <X
                  color="#CBD5E1"
                  size={22}
                />
              </TouchableOpacity>

              <View style={styles.modalTitleBox}>
                <Text style={styles.modalTitle}>
                  {editingContact
                    ? "دەستکاریکردنی ژمارە"
                    : "زیادکردنی ژمارە"}
                </Text>

                <Phone
                  color="#D97706"
                  size={21}
                />
              </View>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Name */}
              <Text style={styles.label}>
                ناوی کەس
              </Text>

              <View style={styles.inputBox}>
                <User
                  color="#94A3B8"
                  size={19}
                />

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="ناوی کەس..."
                  placeholderTextColor="#64748B"
                  textAlign="right"
                  editable={!saving}
                  autoCorrect={false}
                />
              </View>

              {/* Phone */}
              <Text style={styles.label}>
                ژمارەی مۆبایل
              </Text>

              <View style={styles.inputBox}>
                <Phone
                  color="#94A3B8"
                  size={19}
                />

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="09123456789"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                  textAlign="right"
                  editable={!saving}
                />
              </View>

              <Text style={styles.helperText}>
                نموونە: 09123456789
              </Text>

              {/* Save */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving &&
                    styles.disabledButton,
                ]}
                onPress={saveContact}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator
                    color="#000"
                    size="small"
                  />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingContact
                      ? "پاشەکەوتکردنی گۆڕانکاری"
                      : "زیادکردن"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B131F",
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    color: "#A0AEC0",
    marginTop: 12,
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2C3D",
  },

  backButton: {
    padding: 6,
  },

  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  adminCard: {
    backgroundColor: "#131D2A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    padding: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },

  adminIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor:
      "rgba(217, 119, 6, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  adminTextBox: {
    flex: 1,
    alignItems: "flex-end",
  },

  adminTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },

  adminSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },

  addButton: {
    minHeight: 54,
    borderRadius: 13,
    backgroundColor: "#D97706",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  addButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "900",
  },

  searchBox: {
    minHeight: 52,
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 13,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    marginHorizontal: 10,
    paddingVertical: 12,
  },

  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },

  counterLabel: {
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "800",
  },

  counterText: {
    color: "#D97706",
    fontSize: 13,
    fontWeight: "900",
  },

  contactCard: {
    backgroundColor: "#131D2A",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    padding: 15,
    marginBottom: 10,
  },

  contactTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  contactIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor:
      "rgba(217, 119, 6, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  contactInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  contactName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
  },

  contactPhone: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 4,
    textAlign: "right",
  },

  actionsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 14,
    gap: 7,
  },

  callButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: "#166534",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  callText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },

  editButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor:
      "rgba(217, 119, 6, 0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(217, 119, 6, 0.30)",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  editText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor:
      "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor:
      "rgba(239, 68, 68, 0.25)",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  deleteText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#131D2A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    padding: 35,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  emptyTitle: {
    color: "#CBD5E1",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.72)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    maxHeight: "90%",
    backgroundColor: "#131D2A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#253247",
    padding: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  modalTitleBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 8,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#172033",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 13,
    marginBottom: 8,
  },

  inputBox: {
    minHeight: 54,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  input: {
    flex: 1,
    color: "#FFF",
    marginHorizontal: 10,
    paddingVertical: 12,
    fontSize: 14,
  },

  helperText: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
  },

  saveButton: {
    minHeight: 54,
    borderRadius: 13,
    backgroundColor: "#D97706",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  saveButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  noAccessTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 15,
  },

  noAccessText: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  backMainButton: {
    backgroundColor: "#D97706",
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 13,
    marginTop: 20,
  },

  backMainButtonText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 14,
  },
});