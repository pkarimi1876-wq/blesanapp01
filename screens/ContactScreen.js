
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";

import {
  Phone,
  User,
  Plus,
  X,
  Save,
  ArrowRight,
  Pencil,
  Trash2,
  Search,
} from "lucide-react-native";

import { COLORS } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function ContactScreen({
  navigation,
  route,
  isAdmin: adminProp,
}) {
  // =====================================================
  // Admin
  // =====================================================

  const isAdmin =
    adminProp === true ||
    route?.params?.isAdmin === true;

  // =====================================================
  // State
  // =====================================================

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] =
    useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [searchText, setSearchText] = useState("");

  // =====================================================
  // Load Contacts
  // =====================================================

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "LOAD CONTACTS ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "نەتوانرا ژمارە پاشەکەوتکراوەکان بخوێندرێنەوە."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Normalize Iran Phone
  // =====================================================

  const normalizeIranPhone = (value) => {
    let digits = String(value || "").replace(
      /\D/g,
      ""
    );

    if (digits.startsWith("0098")) {
      return `+${digits.slice(2)}`;
    }

    if (digits.startsWith("98")) {
      return `+${digits}`;
    }

    if (digits.startsWith("09")) {
      return `+98${digits.slice(1)}`;
    }

    if (digits.startsWith("9")) {
      return `+98${digits}`;
    }

    return digits;
  };

  // =====================================================
  // Validate Iran Mobile
  // =====================================================

  const isValidIranPhone = (value) => {
    const normalized =
      normalizeIranPhone(value);

    return /^\+989\d{9}$/.test(normalized);
  };

  // =====================================================
  // Search
  // =====================================================

  const filteredContacts = useMemo(() => {
    const query = searchText
      .trim()
      .toLowerCase();

    if (!query) {
      return contacts;
    }

    const normalizedSearch =
      normalizeIranPhone(query);

    return contacts.filter((item) => {
      const itemName = String(
        item.name ||
          item.title ||
          ""
      ).toLowerCase();

      const itemPhone = String(
        item.phone || ""
      ).toLowerCase();

      return (
        itemName.includes(query) ||
        itemPhone.includes(query) ||
        itemPhone.includes(normalizedSearch)
      );
    });
  }, [contacts, searchText]);

  // =====================================================
  // Call
  // =====================================================

  const makeCall = async (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert(
        "ئاگاداری",
        "ژمارەی تەلەفۆن بەردەست نییە."
      );
      return;
    }

    try {
      await Linking.openURL(
        `tel:${phoneNumber}`
      );
    } catch (error) {
      console.log("CALL ERROR:", error);

      Alert.alert(
        "هەڵە",
        "نەتوانرا پەیوەندی بکرێت."
      );
    }
  };

  // =====================================================
  // Open Add Form
  // =====================================================

  const openAddForm = () => {
    if (!isAdmin) {
      return;
    }

    setEditingContact(null);
    setName("");
    setPhone("");
    setShowForm(true);
  };

  // =====================================================
  // Open Edit Form
  // =====================================================

  const openEditForm = (item) => {
    if (!isAdmin) {
      return;
    }

    setEditingContact(item);

    setName(
      item.name ||
        item.title ||
        ""
    );

    setPhone(item.phone || "");

    setShowForm(true);
  };

  // =====================================================
  // Close Form
  // =====================================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingContact(null);
    setName("");
    setPhone("");
  };

  // =====================================================
  // Save Contact
  // =====================================================

  const saveContact = async () => {
    if (!isAdmin) {
      return;
    }

    const cleanName = name.trim();
    const cleanPhone =
      normalizeIranPhone(phone);

    // ---------------------------------------------------
    // Validate Name
    // ---------------------------------------------------

    if (!cleanName) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوی کەسەکە بنووسە."
      );
      return;
    }

    // ---------------------------------------------------
    // Validate Phone
    // ---------------------------------------------------

    if (!cleanPhone) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ژمارەی تەلەفۆن بنووسە."
      );
      return;
    }

    if (!isValidIranPhone(cleanPhone)) {
      Alert.alert(
        "ژمارەی هەڵە",
        "تەنها ژمارەی مۆبایلی ئێران قبوڵ دەکرێت.\n\nنموونە:\n09121234567"
      );
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // EDIT
      // =================================================

      if (editingContact) {
        const {
          data,
          error,
        } = await supabase
          .from("contacts")
          .update({
            title: cleanName,
            name: cleanName,
            phone: cleanPhone,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            editingContact.id
          )
          .select()
          .single();

        console.log(
          "SUPABASE UPDATE:",
          data,
          error
        );

        if (error) {
          throw error;
        }

        setContacts((current) =>
          current.map((item) =>
            item.id ===
            editingContact.id
              ? data
              : item
          )
        );

        closeForm();

        Alert.alert(
          "سەرکەوتوو بوو",
          "زانیارییەکە دەستکاری کرا."
        );

        return;
      }

      // =================================================
      // INSERT / ADD
      // =================================================

      const {
        data,
        error,
      } = await supabase
        .from("contacts")
        .insert({
          // title is required in Supabase
          title: cleanName,

          // name is used by the app
          name: cleanName,

          // normalized phone
          phone: cleanPhone,

          // category
          category: "ژمارەی پێویست",
        })
        .select()
        .single();

      console.log(
        "SUPABASE INSERT DATA:",
        data
      );

      console.log(
        "SUPABASE INSERT ERROR:",
        error
      );

      if (error) {
        throw error;
      }

      setContacts((current) => [
        data,
        ...current,
      ]);

      closeForm();

      Alert.alert(
        "سەرکەوتوو بوو",
        "ناو و ژمارەکە پاشەکەوت کرا."
      );
    } catch (error) {
      console.log(
        "SUPABASE SAVE CONTACT ERROR:",
        error
      );

      Alert.alert(
        "هەڵەی پاشەکەوتکردن",
        error?.message ||
          "نەتوانرا زانیارییەکە پاشەکەوت بکرێت."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // Delete
  // =====================================================

  const deleteContact = (item) => {
    if (!isAdmin) {
      return;
    }

    Alert.alert(
      "سڕینەوە",
      `دڵنیایت دەتەوێت «${
        item.name ||
        item.title ||
        "بێ ناو"
      }» بسڕیتەوە؟`,
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ، بسڕەوە",
          style: "destructive",

          onPress: async () => {
            try {
              setSaving(true);

              const { error } =
                await supabase
                  .from("contacts")
                  .delete()
                  .eq(
                    "id",
                    item.id
                  );

              if (error) {
                throw error;
              }

              setContacts(
                (current) =>
                  current.filter(
                    (contact) =>
                      contact.id !==
                      item.id
                  )
              );

              Alert.alert(
                "سەرکەوتوو بوو",
                "ژمارەکە سڕایەوە."
              );
            } catch (error) {
              console.log(
                "SUPABASE DELETE CONTACT ERROR:",
                error
              );

              Alert.alert(
                "هەڵە",
                error?.message ||
                  "نەتوانرا ژمارەکە بسڕدرێتەوە."
              );
            } finally {
              setSaving(false);
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(
              "MainTabs",
              {
                screen: "Home",
              }
            )
          }
        >
          <ArrowRight
            size={21}
            color={COLORS.textMain}
          />

          <Text style={styles.backText}>
            گەڕانەوە بۆ سەرەتا
          </Text>
        </TouchableOpacity>

        {/* Header */}

        <View style={styles.header}>
          <Phone
            size={25}
            color={COLORS.primary}
          />

          <Text style={styles.headerTitle}>
            ژمارەی پێویست
          </Text>
        </View>

        {/* Search */}

        <View style={styles.searchBox}>
          <Search
            size={19}
            color={COLORS.textSub}
          />

          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="گەڕان بە ناو یان ژمارە..."
            placeholderTextColor="#718096"
            textAlign="right"
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() =>
                setSearchText("")
              }
            >
              <X
                size={17}
                color={COLORS.textSub}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Add */}

        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={openAddForm}
          >
            <Plus
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.addButtonText
              }
            >
              زیادکردنی ناو
            </Text>
          </TouchableOpacity>
        )}

        {/* List */}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        ) : filteredContacts.length ===
          0 ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Phone
              size={38}
              color={COLORS.textSub}
            />

            <Text
              style={
                styles.emptyText
              }
            >
              {searchText.trim()
                ? "هیچ ناو یان ژمارەیەک نەدۆزرایەوە."
                : "هیچ ژمارەیەکی پەیوەندی تۆمار نەکراوە."}
            </Text>
          </View>
        ) : (
          filteredContacts.map(
            (item) => (
              <View
                key={String(item.id)}
                style={styles.card}
              >
                <View style={styles.info}>
                  <View
                    style={
                      styles.titleRow
                    }
                  >
                    <User
                      size={18}
                      color={
                        COLORS.primary
                      }
                    />

                    <Text
                      style={
                        styles.nameText
                      }
                    >
                      {item.name ||
                        item.title ||
                        "بێ ناو"}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.phoneText
                    }
                  >
                    {item.phone ||
                      "ژمارە نییە"}
                  </Text>

                  {/* Admin Actions */}

                  {isAdmin && (
                    <View
                      style={
                        styles.actions
                      }
                    >
                      <TouchableOpacity
                        style={
                          styles.editButton
                        }
                        onPress={() =>
                          openEditForm(
                            item
                          )
                        }
                      >
                        <Pencil
                          size={15}
                          color="#FFFFFF"
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
                        style={
                          styles.deleteButton
                        }
                        onPress={() =>
                          deleteContact(
                            item
                          )
                        }
                      >
                        <Trash2
                          size={15}
                          color="#FFFFFF"
                        />

                        <Text
                          style={
                            styles.actionText
                          }
                        >
                          سڕینەوە
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Call */}

                <TouchableOpacity
                  style={
                    styles.callButton
                  }
                  onPress={() =>
                    makeCall(item.phone)
                  }
                >
                  <Phone
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.callText
                    }
                  >
                    پەیوەندی
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )
        )}
      </ScrollView>

      {/* Add / Edit Modal */}

      {isAdmin && (
        <Modal
          visible={showForm}
          transparent
          animationType="slide"
          onRequestClose={closeForm}
        >
          <View
            style={styles.overlay}
          >
            <View
              style={styles.modal}
            >
              <View
                style={
                  styles.modalHeader
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {editingContact
                    ? "دەستکاریکردنی ناو"
                    : "زیادکردنی ناو"}
                </Text>

                <TouchableOpacity
                  style={
                    styles.closeButton
                  }
                  onPress={closeForm}
                  disabled={saving}
                >
                  <X
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Name */}

              <Text
                style={styles.label}
              >
                ناو
              </Text>

              <View
                style={
                  styles.inputBox
                }
              >
                <User
                  size={19}
                  color={
                    COLORS.primary
                  }
                />

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="ناوی کەسەکە"
                  placeholderTextColor="#718096"
                  textAlign="right"
                  editable={!saving}
                />
              </View>

              {/* Phone */}

              <Text
                style={styles.label}
              >
                ژمارەی تەلەفۆن
              </Text>

              <View
                style={
                  styles.inputBox
                }
              >
                <Phone
                  size={19}
                  color={
                    COLORS.primary
                  }
                />

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="09121234567"
                  placeholderTextColor="#718096"
                  keyboardType="phone-pad"
                  textAlign="right"
                  maxLength={15}
                  editable={!saving}
                />
              </View>

              <Text
                style={styles.hint}
              >
                تەنها ژمارەی مۆبایلی ئێران
              </Text>

              {/* Save */}

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving &&
                    styles.disabledButton,
                ]}
                activeOpacity={0.85}
                onPress={saveContact}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.saveText
                      }
                    >
                      پاشەکەوتکردن...
                    </Text>
                  </>
                ) : (
                  <>
                    <Save
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.saveText
                      }
                    >
                      {editingContact
                        ? "پاشەکەوتکردنی گۆڕانکاری"
                        : "پاشەکەوتکردن"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// =======================================================
// Styles
// =======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },

  backText: {
    color: COLORS.textMain,
    fontSize: 13,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
  },

  headerTitle: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: "900",
  },

  searchBox: {
    minHeight: 52,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 14,
    marginHorizontal: 10,
    textAlign: "right",
  },

  clearButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  addButton: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 18,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  loader: {
    marginTop: 40,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },

  emptyText: {
    color: COLORS.textSub,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  info: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 10,
  },

  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  nameText: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: "800",
  },

  phoneText: {
    color: COLORS.textSub,
    fontSize: 13,
    marginTop: 5,
  },

  actions: {
    flexDirection: "row-reverse",
    gap: 7,
    marginTop: 10,
  },

  editButton: {
    backgroundColor: "#3D6B8E",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 9,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  deleteButton: {
    backgroundColor: "#9E3F46",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 9,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  callButton: {
    minWidth: 78,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  callText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.68)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: COLORS.background,
    padding: 20,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  modalTitle: {
    color: COLORS.textMain,
    fontSize: 21,
    fontWeight: "900",
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 8,
  },

  inputBox: {
    minHeight: 54,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  input: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 14,
    marginRight: 10,
    textAlign: "right",
  },

  hint: {
    color: COLORS.textSub,
    fontSize: 11,
    textAlign: "right",
    marginBottom: 10,
  },

  saveButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },
});

