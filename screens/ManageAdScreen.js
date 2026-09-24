import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

// =====================================================
// POSITION OPTIONS
// =====================================================

const POSITION_OPTIONS = [
  {
    value: "top",
    label: "سەرەوە",
    icon: "arrow-up-outline",
  },
  {
    value: "center",
    label: "ناوەڕاست",
    icon: "scan-outline",
  },
  {
    value: "bottom",
    label: "خوارەوە",
    icon: "arrow-down-outline",
  },
  {
    value: "left",
    label: "چەپ",
    icon: "arrow-back-outline",
  },
  {
    value: "right",
    label: "ڕاست",
    icon: "arrow-forward-outline",
  },
];

// =====================================================
// DEFAULT SLIDE
// =====================================================

const createSlide = () => ({
  text: "",
  position: "center",
});

// =====================================================
// POSITION STYLE
// =====================================================

const getPositionStyle = (position) => {
  switch (position) {
    case "top":
      return {
        justifyContent: "flex-start",
        alignItems: "center",
        textAlign: "center",
      };

    case "bottom":
      return {
        justifyContent: "flex-end",
        alignItems: "center",
        textAlign: "center",
      };

    case "left":
      return {
        justifyContent: "center",
        alignItems: "flex-start",
        textAlign: "left",
      };

    case "right":
      return {
        justifyContent: "center",
        alignItems: "flex-end",
        textAlign: "right",
      };

    case "center":
    default:
      return {
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      };
  }
};

// =====================================================
// NORMALIZE SLIDES
// =====================================================

const normalizeSlides = (slides) => {
  if (!Array.isArray(slides) || slides.length === 0) {
    return [createSlide()];
  }

  return slides.map((slide) => ({
    text: String(slide?.text || ""),
    position:
      slide?.position || "center",
  }));
};

// =====================================================
// COMPONENT
// =====================================================

export default function ManageAdsScreen({
  navigation,
}) {
  // ===================================================
  // ADS
  // ===================================================

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // FORM
  // ===================================================

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [slides, setSlides] = useState([
    createSlide(),
  ]);

  const [activeSlide, setActiveSlide] = useState(0);

  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ===================================================
  // FETCH ADS
  // ===================================================

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("ads")
        .select(`
          id,
          title,
          image_url,
          link_url,
          slides,
          is_active,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.log(
          "FETCH ADS ERROR:",
          error
        );

        Alert.alert(
          "هەڵە",
          error.message ||
            "تەبلیغەکان نەهێنران."
        );

        setAds([]);
        return;
      }

      setAds(data || []);
    } catch (error) {
      console.log(
        "FETCH ADS EXCEPTION:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "کێشەیەک لە هێنانی تەبلیغەکان ڕوویدا."
      );

      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // ===================================================
  // CLEAR FORM
  // ===================================================

  const clearForm = () => {
    setTitle("");
    setImageUrl("");
    setLinkUrl("");

    setSlides([
      createSlide(),
    ]);

    setActiveSlide(0);
    setIsActive(true);
    setEditingId(null);
  };

  // ===================================================
  // ADD SLIDE
  // ===================================================

  const addSlide = () => {
    setSlides((previous) => [
      ...previous,
      createSlide(),
    ]);

    setActiveSlide(slides.length);
  };

  // ===================================================
  // REMOVE SLIDE
  // ===================================================

  const removeSlide = (index) => {
    if (slides.length === 1) {
      Alert.alert(
        "تێبینی",
        "دەبێت لانیکەم یەک سلاید هەبێت."
      );

      return;
    }

    setSlides((previous) =>
      previous.filter(
        (_, slideIndex) =>
          slideIndex !== index
      )
    );

    setActiveSlide((previous) => {
      if (previous > index) {
        return previous - 1;
      }

      if (
        previous === index &&
        previous >= slides.length - 1
      ) {
        return Math.max(
          0,
          slides.length - 2
        );
      }

      return previous;
    });
  };

  // ===================================================
  // UPDATE SLIDE TEXT
  // ===================================================

  const updateSlideText = (text) => {
    setSlides((previous) =>
      previous.map(
        (slide, index) =>
          index === activeSlide
            ? {
                ...slide,
                text,
              }
            : slide
      )
    );
  };

  // ===================================================
  // UPDATE SLIDE POSITION
  // ===================================================

  const updateSlidePosition = (
    position
  ) => {
    setSlides((previous) =>
      previous.map(
        (slide, index) =>
          index === activeSlide
            ? {
                ...slide,
                position,
              }
            : slide
      )
    );
  };

  // ===================================================
  // START EDIT
  // ===================================================

  const startEdit = (item) => {
    setEditingId(item.id);

    setTitle(
      item.title || ""
    );

    setImageUrl(
      item.image_url || ""
    );

    setLinkUrl(
      item.link_url || ""
    );

    setSlides(
      normalizeSlides(item.slides)
    );

    setActiveSlide(0);

    setIsActive(
      item.is_active !== false
    );
  };

  // ===================================================
  // SAVE
  // ===================================================

  const saveAd = async () => {
    const cleanTitle = title.trim();
    const cleanImageUrl =
      imageUrl.trim();
    const cleanLinkUrl =
      linkUrl.trim();

    const cleanSlides =
      slides
        .map((slide) => ({
          text: String(
            slide?.text || ""
          ).trim(),

          position:
            slide?.position ||
            "center",
        }))
        .filter(
          (slide) =>
            slide.text.length > 0
        );

    if (!cleanTitle) {
      Alert.alert(
        "ناونیشان",
        "تکایە ناوی تەبلیغ بنووسە."
      );

      return;
    }

    if (cleanSlides.length === 0) {
      Alert.alert(
        "نووسین",
        "تکایە لانیکەم یەک دەق بۆ سلاید بنووسە."
      );

      return;
    }

    const payload = {
      title: cleanTitle,
      image_url: cleanImageUrl,
      link_url: cleanLinkUrl,
      slides: cleanSlides,
      is_active: isActive,
    };

    try {
      setSaving(true);

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {
        const {
          error,
        } = await supabase
          .from("ads")
          .update(payload)
          .eq(
            "id",
            editingId
          );

        if (error) {
          console.log(
            "UPDATE AD ERROR:",
            error
          );

          throw error;
        }

        await fetchAds();

        clearForm();

        Alert.alert(
          "سەرکەوتوو",
          "تەبلیغەکە بە سەرکەوتوویی نوێ کرایەوە."
        );

        return;
      }

      // =================================================
      // INSERT
      // =================================================

      const {
        error,
      } = await supabase
        .from("ads")
        .insert([
          payload,
        ]);

      if (error) {
        console.log(
          "INSERT AD ERROR:",
          error
        );

        throw error;
      }

      await fetchAds();

      clearForm();

      Alert.alert(
        "سەرکەوتوو",
        "تەبلیغەکە زیاد کرا."
      );
    } catch (error) {
      console.log(
        "SAVE AD ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          error?.details ||
          error?.hint ||
          "تەبلیغەکە پاشەکەوت نەکرا."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // DELETE
  // ===================================================

  const deleteAd = async (id) => {
    try {
      setDeletingId(id);

      const {
        error,
      } = await supabase
        .from("ads")
        .delete()
        .eq(
          "id",
          id
        );

      if (error) {
        console.log(
          "DELETE AD ERROR:",
          error
        );

        Alert.alert(
          "هەڵە",
          error.message ||
            "تەبلیغەکە نەسڕایەوە."
        );

        return;
      }

      setAds((previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
      );

      if (editingId === id) {
        clearForm();
      }

      Alert.alert(
        "سەرکەوتوو",
        "تەبلیغەکە سڕایەوە."
      );
    } catch (error) {
      console.log(
        "DELETE AD EXCEPTION:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "کێشەیەک لە سڕینەوە ڕوویدا."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===================================================
  // TOGGLE ACTIVE
  // ===================================================

  const toggleActive = async (
    item
  ) => {
    const newValue =
      !item.is_active;

    try {
      const {
        error,
      } = await supabase
        .from("ads")
        .update({
          is_active: newValue,
        })
        .eq(
          "id",
          item.id
        );

      if (error) {
        throw error;
      }

      setAds((previous) =>
        previous.map(
          (ad) =>
            ad.id === item.id
              ? {
                  ...ad,
                  is_active:
                    newValue,
                }
              : ad
        )
      );
    } catch (error) {
      console.log(
        "TOGGLE AD ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "دۆخی تەبلیغەکە نەگۆڕدرا."
      );
    }
  };

  // ===================================================
  // CURRENT SLIDE
  // ===================================================

  const currentSlide =
    slides[activeSlide] ||
    createSlide();

  const previewPositionStyle =
    useMemo(
      () =>
        getPositionStyle(
          currentSlide.position
        ),
      [currentSlide.position]
    );

  // ===================================================
  // PREVIEW
  // ===================================================

  const renderPreview = () => {
    return (
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <Text style={styles.sectionTitle}>
            پێشبینینی تەبلیغ
          </Text>

          <Text style={styles.slideCount}>
            {activeSlide + 1} /{" "}
            {slides.length}
          </Text>
        </View>

        <View style={styles.previewCard}>
          {imageUrl.trim() ? (
            <Image
              source={{
                uri: imageUrl.trim(),
              }}
              style={styles.previewImage}
            />
          ) : null}

          <View
            style={[
              styles.previewTextArea,
              {
                justifyContent:
                  previewPositionStyle.justifyContent,

                alignItems:
                  previewPositionStyle.alignItems,
              },
            ]}
          >
            <Text
              style={[
                styles.previewText,
                {
                  textAlign:
                    previewPositionStyle.textAlign,
                },
              ]}
            >
              {currentSlide.text ||
                "دەقی سلاید لێرە دەردەکەوێت"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ===================================================
  // SLIDE TABS
  // ===================================================

  const renderSlideTabs = () => {
    return (
      <View style={styles.slideTabsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            سلایدەکان
          </Text>

          <TouchableOpacity
            style={styles.addSlideButton}
            activeOpacity={0.85}
            onPress={addSlide}
          >
            <Ionicons
              name="add"
              size={19}
              color="#08111f"
            />

            <Text style={styles.addSlideText}>
              زیادکردنی سلاید
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.slideTabsContent
          }
        >
          {slides.map(
            (slide, index) => {
              const selected =
                index ===
                activeSlide;

              return (
                <View
                  key={index}
                  style={[
                    styles.slideTabWrap,
                    selected &&
                      styles.slideTabWrapSelected,
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      setActiveSlide(
                        index
                      )
                    }
                    style={[
                      styles.slideTab,
                      selected &&
                        styles.slideTabSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slideTabText,
                        selected &&
                          styles.slideTabTextSelected,
                      ]}
                    >
                      سلاید {index + 1}
                    </Text>
                  </TouchableOpacity>

                  {slides.length >
                    1 && (
                    <TouchableOpacity
                      style={
                        styles.removeSlideButton
                      }
                      activeOpacity={
                        0.85
                      }
                      onPress={() =>
                        removeSlide(
                          index
                        )
                      }
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }
          )}
        </ScrollView>
      </View>
    );
  };

  // ===================================================
  // SLIDE EDITOR
  // ===================================================

  const renderSlideEditor =
    () => {
      const selectedPosition =
        currentSlide.position ||
        "center";

      return (
        <View style={styles.editorSection}>
          <View style={styles.editorHeader}>
            <View>
              <Text style={styles.editorTitle}>
                دەقی سلاید{" "}
                {activeSlide + 1}
              </Text>

              <Text
                style={
                  styles.editorSubtitle
                }
              >
                دەقی خۆت لێرە بنووسە
              </Text>
            </View>
          </View>

          <TextInput
            value={
              currentSlide.text
            }
            onChangeText={
              updateSlideText
            }
            placeholder="دەقی تەبلیغ بنووسە..."
            placeholderTextColor="#64748b"
            multiline
            textAlign="right"
            textAlignVertical="top"
            style={styles.slideInput}
          />

          <Text style={styles.positionTitle}>
            شوێنی نووسین
          </Text>

          <View style={styles.positionGrid}>
            {POSITION_OPTIONS.map(
              (option) => {
                const selected =
                  selectedPosition ===
                  option.value;

                return (
                  <TouchableOpacity
                    key={
                      option.value
                    }
                    activeOpacity={0.85}
                    onPress={() =>
                      updateSlidePosition(
                        option.value
                      )
                    }
                    style={[
                      styles.positionButton,
                      selected &&
                        styles.positionButtonSelected,
                    ]}
                  >
                    <Ionicons
                      name={
                        option.icon
                      }
                      size={17}
                      color={
                        selected
                          ? "#f59e0b"
                          : "#94a3b8"
                      }
                    />

                    <Text
                      style={[
                        styles.positionButtonText,
                        selected &&
                          styles.positionButtonTextSelected,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </View>
      );
    };

  // ===================================================
  // AD CARD
  // ===================================================

  const renderAd = ({
    item,
  }) => {
    const isDeleting =
      deletingId === item.id;

    const itemSlides =
      normalizeSlides(
        item.slides
      );

    return (
      <View style={styles.adCard}>
        <View style={styles.adCardTop}>
          <View style={styles.adCardInfo}>
            <Text
              style={styles.adCardTitle}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <Text
              style={
                styles.adCardSlides
              }
            >
              {
                itemSlides.length
              }{" "}
              سلاید
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.is_active
                    ? "#14532d"
                    : "#334155",
              },
            ]}
          >
            <Text
              style={styles.statusText}
            >
              {item.is_active
                ? "چالاک"
                : "ناچالاک"}
            </Text>
          </View>
        </View>

        {item.image_url ? (
          <Image
            source={{
              uri: item.image_url,
            }}
            style={styles.listImage}
          />
        ) : null}

        <View style={styles.adActions}>
          <View
            style={styles.activeBox}
          >
            <Text
              style={styles.activeLabel}
            >
              چالاک
            </Text>

            <Switch
              value={
                item.is_active
              }
              onValueChange={() =>
                toggleActive(item)
              }
              trackColor={{
                false: "#334155",
                true: "#92400e",
              }}
              thumbColor={
                item.is_active
                  ? "#f59e0b"
                  : "#cbd5e1"
              }
            />
          </View>

          <TouchableOpacity
            style={
              styles.editButton
            }
            activeOpacity={0.8}
            onPress={() =>
              startEdit(item)
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#f59e0b"
            />

            <Text
              style={
                styles.editText
              }
            >
              دەستکاری
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.deleteButton
            }
            activeOpacity={0.8}
            disabled={isDeleting}
            onPress={() =>
              deleteAd(item.id)
            }
          >
            {isDeleting ? (
              <ActivityIndicator
                size="small"
                color="#ef4444"
              />
            ) : (
              <>
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#ef4444"
                />

                <Text
                  style={
                    styles.deleteText
                  }
                >
                  سڕینەوە
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ===================================================
  // EMPTY
  // ===================================================

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View
        style={styles.emptyList}
      >
        <Ionicons
          name="megaphone-outline"
          size={42}
          color="#64748b"
        />

        <Text
          style={
            styles.emptyListText
          }
        >
          هێشتا هیچ تەبلیغێک نییە
        </Text>
      </View>
    );
  };

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="arrow-forward"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <View
          style={styles.headerCenter}
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            بەڕێوەبردنی تەبلیغ
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            دروستکردن و ڕێکخستنی تەبلیغ
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.8}
          onPress={fetchAds}
        >
          <Ionicons
            name="refresh-outline"
            size={21}
            color="#f59e0b"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={ads}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderAd}
        ListHeaderComponent={
          <>
            {/* FORM */}

            <View
              style={styles.formCard}
            >
              <Text
                style={
                  styles.formTitle
                }
              >
                {editingId
                  ? "دەستکاریی تەبلیغ"
                  : "دروستکردنی تەبلیغ"}
              </Text>

              {/* TITLE */}

              <Text
                style={styles.label}
              >
                ناوی تەبلیغ
              </Text>

              <TextInput
                value={title}
                onChangeText={
                  setTitle
                }
                placeholder="ناوی فرۆشگا / تەبلیغ..."
                placeholderTextColor="#64748b"
                style={
                  styles.textInput
                }
                textAlign="right"
              />

              {/* IMAGE */}

              <Text
                style={styles.label}
              >
                لینک / URL ـی وێنە
              </Text>

              <TextInput
                value={imageUrl}
                onChangeText={
                  setImageUrl
                }
                placeholder="https://..."
                placeholderTextColor="#64748b"
                style={[
                  styles.textInput,
                  styles.urlInput,
                ]}
                autoCapitalize="none"
                textAlign="left"
              />

              {/* LINK */}

              <Text
                style={styles.label}
              >
                لینک ـی تەبلیغ
              </Text>

              <TextInput
                value={linkUrl}
                onChangeText={
                  setLinkUrl
                }
                placeholder="https://..."
                placeholderTextColor="#64748b"
                style={[
                  styles.textInput,
                  styles.urlInput,
                ]}
                autoCapitalize="none"
                textAlign="left"
              />

              {/* PREVIEW */}

              {renderPreview()}

              {/* SLIDES */}

              {renderSlideTabs()}

              {/* EDITOR */}

              {renderSlideEditor()}

              {/* ACTIVE */}

              <View
                style={styles.switchRow}
              >
                <Text
                  style={
                    styles.switchLabel
                  }
                >
                  تەبلیغ چالاک بێت
                </Text>

                <Switch
                  value={isActive}
                  onValueChange={
                    setIsActive
                  }
                  trackColor={{
                    false: "#334155",
                    true: "#92400e",
                  }}
                  thumbColor={
                    isActive
                      ? "#f59e0b"
                      : "#cbd5e1"
                  }
                />
              </View>

              {/* SAVE */}

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving &&
                    styles.saveButtonDisabled,
                ]}
                activeOpacity={0.85}
                disabled={saving}
                onPress={saveAd}
              >
                {saving ? (
                  <ActivityIndicator
                    color="#08111f"
                  />
                ) : (
                  <>
                    <Ionicons
                      name={
                        editingId
                          ? "save-outline"
                          : "add-circle-outline"
                      }
                      size={20}
                      color="#08111f"
                    />

                    <Text
                      style={
                        styles.saveText
                      }
                    >
                      {editingId
                        ? "پاشەکەوتکردنی گۆڕانکاری"
                        : "زیادکردنی تەبلیغ"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* CANCEL */}

              {editingId ? (
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  activeOpacity={0.8}
                  onPress={
                    clearForm
                  }
                >
                  <Ionicons
                    name="close-outline"
                    size={18}
                    color="#cbd5e1"
                  />

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
          </>
        }
        ListEmptyComponent={
          renderEmpty()
        }
        refreshing={loading}
        onRefresh={fetchAds}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1329",
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 14,
    backgroundColor: "#0f1b31",
    borderBottomWidth: 1,
    borderBottomColor:
      "#1e3a8a",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      "#172554",
    justifyContent: "center",
    alignItems: "center",
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      "rgba(245,158,11,0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(245,158,11,0.20)",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#64748b",
    fontSize: 9,
    marginTop: 3,
  },

  // ===================================================
  // LIST
  // ===================================================

  listContent: {
    padding: 14,
    paddingBottom: 40,
  },

  // ===================================================
  // FORM
  // ===================================================

  formCard: {
    backgroundColor:
      "#172554",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor:
      "#1e3a8a",
    marginBottom: 16,
  },

  formTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 15,
  },

  label: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 6,
    marginTop: 10,
  },

  textInput: {
    minHeight: 47,
    width: "100%",
    backgroundColor:
      "#0f1f46",
    borderWidth: 1,
    borderColor:
      "#334155",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#fff",
    fontSize: 12,
  },

  urlInput: {
    textAlign: "left",
  },

  // ===================================================
  // PREVIEW
  // ===================================================

  previewSection: {
    marginTop: 18,
  },

  previewHeader: {
    flexDirection:
      "row-reverse",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },

  slideCount: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
  },

  previewCard: {
  height: 125,
  width: 125,
  alignSelf: "flex-end",
  backgroundColor: "#0b1527",
  borderRadius: 17,
  borderWidth: 1,
  borderColor: "#263b5d",
  overflow: "hidden",
  position: "relative",
},

previewImage: {
  position: "absolute",
  right: 8,
  top: 8,
  width: 88,
  height: 88,
  borderRadius: 14,
  resizeMode: "cover",
  backgroundColor: "#0f1f46",
},

previewTextArea: {
  position: "absolute",
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
  padding: 8,
  paddingRight: 16,
},

  previewText: {
    color: "#fff",
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "800",
    width: "100%",
  },

  // ===================================================
  // SLIDES
  // ===================================================

  slideTabsSection: {
    marginTop: 18,
  },

  sectionHeaderRow: {
    flexDirection:
      "row-reverse",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  addSlideButton: {
    minHeight: 38,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor:
      "#f59e0b",
    flexDirection:
      "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  addSlideText: {
    color: "#08111f",
    fontSize: 10,
    fontWeight: "900",
  },

  slideTabsContent: {
    flexDirection:
      "row-reverse",
    gap: 8,
    paddingBottom: 3,
  },

  slideTabWrap: {
    position: "relative",
  },

  slideTabWrapSelected: {
    // no extra layout shift
  },

  slideTab: {
    minWidth: 92,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor:
      "#101c31",
    borderWidth: 1,
    borderColor:
      "#263b5d",
    alignItems: "center",
    justifyContent:
      "center",
  },

  slideTabSelected: {
    backgroundColor:
      "rgba(245,158,11,0.10)",
    borderColor:
      "rgba(245,158,11,0.45)",
  },

  slideTabText: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
  },

  slideTabTextSelected: {
    color: "#fbbf24",
  },

  removeSlideButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor:
      "#3b1212",
    borderWidth: 1,
    borderColor:
      "#7f1d1d",
    alignItems: "center",
    justifyContent:
      "center",
  },

  // ===================================================
  // EDITOR
  // ===================================================

  editorSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor:
      "#263b5d",
  },

  editorHeader: {
    flexDirection:
      "row-reverse",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  editorTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },

  editorSubtitle: {
    color: "#64748b",
    fontSize: 9,
    marginTop: 3,
    textAlign: "right",
  },

  slideInput: {
    marginTop: 11,
    minHeight: 110,
    backgroundColor:
      "#0f1f46",
    borderWidth: 1,
    borderColor:
      "#334155",
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    color: "#fff",
    fontSize: 13,
    lineHeight: 22,
  },

  positionTitle: {
    marginTop: 13,
    marginBottom: 8,
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
  },

  positionGrid: {
    flexDirection:
      "row-reverse",
    flexWrap: "wrap",
    gap: 7,
  },

  positionButton: {
    minWidth: 88,
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor:
      "#101c31",
    borderWidth: 1,
    borderColor:
      "#263b5d",
    flexDirection:
      "row-reverse",
    alignItems: "center",
    justifyContent:
      "center",
    gap: 5,
  },

  positionButtonSelected: {
    backgroundColor:
      "rgba(245,158,11,0.10)",
    borderColor:
      "rgba(245,158,11,0.42)",
  },

  positionButtonText: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "800",
  },

  positionButtonTextSelected: {
    color: "#fbbf24",
  },

  // ===================================================
  // ACTIVE
  // ===================================================

  switchRow: {
    marginTop: 16,
    minHeight: 58,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor:
      "#0f1f46",
    borderWidth: 1,
    borderColor:
      "#334155",
    flexDirection:
      "row-reverse",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  switchLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  // ===================================================
  // SAVE
  // ===================================================

  saveButton: {
    marginTop: 15,
    height: 50,
    borderRadius: 13,
    backgroundColor:
      "#f59e0b",
    flexDirection:
      "row",
    alignItems: "center",
    justifyContent:
      "center",
    gap: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: "#08111f",
    fontSize: 12,
    fontWeight: "900",
  },

  cancelButton: {
    marginTop: 9,
    height: 43,
    borderRadius: 12,
    backgroundColor:
      "#1e293b",
    borderWidth: 1,
    borderColor:
      "#334155",
    flexDirection:
      "row-reverse",
    justifyContent:
      "center",
    alignItems: "center",
    gap: 5,
  },

  cancelText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800",
  },

  // ===================================================
  // AD LIST
  // ===================================================

  adCard: {
    backgroundColor:
      "#172554",
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      "#1e3a8a",
    padding: 14,
    marginBottom: 12,
  },

  adCardTop: {
    flexDirection:
      "row-reverse",
    alignItems:
      "flex-start",
    justifyContent:
      "space-between",
  },

  adCardInfo: {
    flex: 1,
    paddingLeft: 10,
    alignItems: "flex-end",
  },

  adCardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },

  adCardSlides: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },

  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },

  listImage: {
    marginTop: 11,
    width: 72,
    height: 72,
    borderRadius: 12,
    resizeMode: "cover",
    alignSelf: "flex-end",
    backgroundColor:
      "#0f1f46",
  },

  adActions: {
    marginTop: 12,
    flexDirection:
      "row-reverse",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: 7,
  },

  activeBox: {
    flex: 1,
    flexDirection:
      "row-reverse",
    alignItems:
      "center",
    gap: 3,
  },

  activeLabel: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },

  editButton: {
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor:
      "#3a2e12",
    borderWidth: 1,
    borderColor:
      "#854d0e",
    flexDirection:
      "row-reverse",
    alignItems:
      "center",
    justifyContent:
      "center",
    gap: 5,
  },

  editText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "900",
  },

  deleteButton: {
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor:
      "#3b1212",
    borderWidth: 1,
    borderColor:
      "#7f1d1d",
    flexDirection:
      "row-reverse",
    alignItems:
      "center",
    justifyContent:
      "center",
    gap: 5,
  },

  deleteText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "900",
  },

  // ===================================================
  // EMPTY
  // ===================================================

  emptyList: {
    alignItems: "center",
    paddingVertical: 35,
  },

  emptyListText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 8,
  },
});