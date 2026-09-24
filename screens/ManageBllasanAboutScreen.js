import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Trash2,
} from "lucide-react-native";

import { supabase } from "../lib/supabase";

const DEFAULT_CONTENT = {
  hero: {
    title: "دێهاتی بڵەسەن",
    subtitle: "مێژوو، ناسنامە و یادەوەری",
    image_url: "",
  },

  intro: {
    kicker: "دەربارەی بڵەسەن",
    title: "بڵەسەن؛ نیشتمانێکی بچووک، مێژوویەکی گەورە",
    paragraphs: [
      "بڵەسەن گوندێکە سەر بە شاری بانە لە پارێزگای کوردستانی ئێران.",
      "بەپێی زانیارییە بەردەستەکان، ئەم گوندە مێژوویەکی درێژەی هەیە و بەپێی گومان و زانیارییە کۆکراوەکان، مێژووەکەی دەگەڕێتەوە بۆ نزیکەی ٣٠٠ ساڵ یان زیاتر و نزیکەی ٨ نەوە.",
      "ئەم زانیارییەکان بە شێوەی بەردەوام کۆدەکرێنەوە و ڕێکدەخرێن بۆ ئەوەی مێژوو و ناسنامەی بڵەسەن بۆ نەوەکانی داهاتوو بپارێزرێت.",
    ],
  },

  stats: [
    {
      label: "مێژووی گوند",
      value: "٣٠٠+ ساڵ",
    },
    {
      label: "نەوە",
      value: "نزیکەی ٨",
    },
    {
      label: "شوێن",
      value: "بانە",
    },
  ],

  history: {
    kicker: "مێژووی بڵەسەن",
    title: "لە ڕابردووەوە بۆ ئەمڕۆ",
    items: [
      {
        title: "بنەما و دەستپێک",
        text: "بڵەسەن بە درێژایی ساڵان و نەوەکان بووەتە شوێنی ژیان و پەیوەندیی خێزان و کۆمەڵگا.",
      },
      {
        title: "بەرە کۆنەکان",
        text: "لە زانیارییە کۆکراوەکاندا بەرەی مەلاک، بەرەی حوسەین و بەرەی ئازیز لە بەرە و بنەما کۆنەکانن.",
      },
      {
        title: "بڵەسەن لە ئەمڕۆ",
        text: "ئەمڕۆش بڵەسەن بە یەکگرتوویی، سینەفراوانی و پشتیوانیی نێوان خەڵکەکەی ناسراوە.",
      },
    ],
  },

  roots: [
    {
      title: "بەرەی مەلاک",
      text: "لە زانیارییە بەردەستەکاندا، بەرەی مەلاک بە پەیوەندی بە دەستە و بەستەی مەحموود مەلا و نادر شابان ناسراوە.",
    },
    {
      title: "بەرەی حوسەین",
      text: "یەکێکە لە بەرە و بنەما کۆنەکانی بڵەسەن.",
    },
    {
      title: "بەرەی ئازیز",
      text: "یەکێکی تر لە بەرە کۆن و بنەماکانی بڵەسەنە.",
    },
  ],

  geography: {
    title: "شوێن و سروشتی بڵەسەن",
    text: "بڵەسەن سەر بە شاری بانەیە لە پارێزگای کوردستانی ئێران. گوندەکە پشت بە کێوی گاکڕ دەبەستێت و لە نزیکی ناودێ ڕووبارێکی گەورە نییە، بەڵام چەند کیلۆمەترێک لە ڕووبارەکانی چۆمان و شابەدین دوورە.",
  },

  values: [
    {
      title: "یەکگرتوویی",
      text: "کاتێک تەنگانەیەک ڕوودەدات، خەڵکی بڵەسەن ناکۆکییەکانیان لادەنێن و پشتی یەکتری دەگرن.",
    },
    {
      title: "سینەفراوانی",
      text: "مێژووی بڵەسەن تەنها مێژووی بیناکان نییە؛ مێژووی مرۆڤ و پەیوەندی و میواندارییە.",
    },
    {
      title: "بیرەوەری",
      text: "پاراستنی وێنە، چیرۆک، ناو و یادەوەرییەکان بۆ نەوەکانی داهاتوو بنەمای ئەم ئەرشیفەیە.",
    },
  ],

  footer: {
    title: "ئەرشیفی بڵەسەن",
    text: "ئەمە تەنها پڕۆژەیەکی تاک نییە؛ دەستپێکی ئەرشیفێکی هاوبەشە بۆ ئێمە، منداڵەکانمان و نەوە دوای نەوە.",
  },
};

const cloneContent = (value) => {
  return JSON.parse(JSON.stringify(value));
};

export default function ManageBllasanAboutScreen({ navigation }) {
  const [content, setContent] = useState(cloneContent(DEFAULT_CONTENT));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState("hero");

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setSaved(false);

      const { data, error } = await supabase
        .from("bllasan_about")
        .select("id, content")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data?.content) {
        setContent(cloneContent(data.content));
      }
    } catch (error) {
      console.log("LOAD BLLASAN ABOUT ERROR:", error);

      Alert.alert(
        "هەڵە",
        error?.message ||
          error?.details ||
          error?.hint ||
          "نەتوانرا زانیاریی بڵەسەن بخوێندرێتەوە."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateRootField = (section, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    setSaved(false);
  };

  const updateArrayItem = (section, index, field, value) => {
    setContent((prev) => {
      const items = Array.isArray(prev[section])
        ? [...prev[section]]
        : [];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...prev,
        [section]: items,
      };
    });

    setSaved(false);
  };

  const updateHistoryItem = (index, field, value) => {
    setContent((prev) => {
      const items = Array.isArray(prev.history?.items)
        ? [...prev.history.items]
        : [];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...prev,
        history: {
          ...prev.history,
          items,
        },
      };
    });

    setSaved(false);
  };

  const updateParagraph = (index, value) => {
    setContent((prev) => {
      const paragraphs = Array.isArray(prev.intro?.paragraphs)
        ? [...prev.intro.paragraphs]
        : [];

      paragraphs[index] = value;

      return {
        ...prev,
        intro: {
          ...prev.intro,
          paragraphs,
        },
      };
    });

    setSaved(false);
  };

  const addStat = () => {
    setContent((prev) => ({
      ...prev,
      stats: [
        ...(prev.stats || []),
        {
          label: "",
          value: "",
        },
      ],
    }));

    setSaved(false);
  };

  const removeStat = (index) => {
    setContent((prev) => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index),
    }));

    setSaved(false);
  };

  const addHistoryItem = () => {
    setContent((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        items: [
          ...(prev.history?.items || []),
          {
            title: "",
            text: "",
          },
        ],
      },
    }));

    setSaved(false);
  };

  const removeHistoryItem = (index) => {
    setContent((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        items: (prev.history?.items || []).filter(
          (_, i) => i !== index
        ),
      },
    }));

    setSaved(false);
  };

  const addRoot = () => {
    setContent((prev) => ({
      ...prev,
      roots: [
        ...(prev.roots || []),
        {
          title: "",
          text: "",
        },
      ],
    }));

    setSaved(false);
  };

  const removeRoot = (index) => {
    setContent((prev) => ({
      ...prev,
      roots: (prev.roots || []).filter((_, i) => i !== index),
    }));

    setSaved(false);
  };

  const addValue = () => {
    setContent((prev) => ({
      ...prev,
      values: [
        ...(prev.values || []),
        {
          title: "",
          text: "",
        },
      ],
    }));

    setSaved(false);
  };

  const removeValue = (index) => {
    setContent((prev) => ({
      ...prev,
      values: (prev.values || []).filter((_, i) => i !== index),
    }));

    setSaved(false);
  };

  const addParagraph = () => {
    setContent((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        paragraphs: [
          ...(prev.intro?.paragraphs || []),
          "",
        ],
      },
    }));

    setSaved(false);
  };

  const removeParagraph = (index) => {
    setContent((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        paragraphs: (prev.intro?.paragraphs || []).filter(
          (_, i) => i !== index
        ),
      },
    }));

    setSaved(false);
  };

  const saveContent = async () => {
  try {
    setSaving(true);
    setSaved(false);

    const cleanContent = cloneContent(content);

    console.log(
      "SAVE START:",
      JSON.stringify(cleanContent)
    );

    const { data, error } = await supabase
      .from("bllasan_about")
      .update({
        content: cleanContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select("id, content, updated_at")
      .single();

    console.log("SAVE DATA:", data);
    console.log("SAVE ERROR:", error);

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("هیچ داتایەک لە Supabase وەرنەگیرا.");
    }

    setContent(cloneContent(data.content));
    setSaved(true);

    Alert.alert(
      "سەرکەوتوو بوو ✅",
      "گۆڕانکارییەکان پاشەکەوت کران."
    );
  } catch (error) {
    console.log("SAVE FINAL ERROR:", error);

    setSaved(false);

    Alert.alert(
      "هەڵەی پاشەکەوتکردن",
      error?.message ||
        error?.details ||
        error?.hint ||
        "نەتوانرا گۆڕانکارییەکان پاشەکەوت بکرێن."
    );
  } finally {
    setSaving(false);
  }
};

  const resetContent = () => {
    Alert.alert(
      "گەڕاندنەوە",
      "دڵنیایت دەتەوێت زانیارییەکان بگەڕێنیتەوە بۆ زانیاریی بنەڕەتی؟",
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ",
          style: "destructive",
          onPress: () => {
            setContent(cloneContent(DEFAULT_CONTENT));
            setSaved(false);
          },
        },
      ]
    );
  };

  const toggleSection = (section) => {
    setOpenSection((prev) =>
      prev === section ? "" : section
    );
  };

  const renderSectionHeader = (key, title) => {
    const isOpen = openSection === key;

    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        activeOpacity={0.85}
        onPress={() => toggleSection(key)}
      >
        <View style={styles.sectionHeaderTextWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        {isOpen ? (
          <ChevronUp size={22} color="#E7C77B" />
        ) : (
          <ChevronDown size={22} color="#E7C77B" />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#E7C77B" />
        <Text style={styles.loadingText}>
          چاوەڕێی خوێندنەوەی زانیارییەکان...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <ArrowRight size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>
          بەڕێوەبردنی بڵەسەن
        </Text>

        <View style={styles.topBarSpace} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.sectionBox}>
          {renderSectionHeader("hero", "١. سەرپەڕە")}

          {openSection === "hero" && (
            <View style={styles.sectionBody}>
              <Field
                label="ناونیشان"
                value={content.hero?.title || ""}
                onChangeText={(value) =>
                  updateRootField("hero", "title", value)
                }
              />

              <Field
                label="ناونیشانی لاوەکی"
                value={content.hero?.subtitle || ""}
                onChangeText={(value) =>
                  updateRootField("hero", "subtitle", value)
                }
              />

              <Field
                label="بەستەری وێنە"
                value={content.hero?.image_url || ""}
                onChangeText={(value) =>
                  updateRootField("hero", "image_url", value)
                }
              />
            </View>
          )}
        </View>

        {/* INTRO */}
        <View style={styles.sectionBox}>
          {renderSectionHeader("intro", "٢. پێشەکی")}

          {openSection === "intro" && (
            <View style={styles.sectionBody}>
              <Field
                label="کلیلەوشە"
                value={content.intro?.kicker || ""}
                onChangeText={(value) =>
                  updateRootField("intro", "kicker", value)
                }
              />

              <Field
                label="ناونیشان"
                value={content.intro?.title || ""}
                onChangeText={(value) =>
                  updateRootField("intro", "title", value)
                }
              />

              {(content.intro?.paragraphs || []).map(
                (paragraph, index) => (
                  <View
                    key={`paragraph-${index}`}
                    style={styles.itemCard}
                  >
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemNumber}>
                        دەق {index + 1}
                      </Text>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          removeParagraph(index)
                        }
                        activeOpacity={0.85}
                      >
                        <Trash2
                          size={18}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                      ]}
                      multiline
                      value={paragraph || ""}
                      onChangeText={(value) =>
                        updateParagraph(index, value)
                      }
                      placeholder="دەق بنووسە..."
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                )
              )}

              <AddButton
                title="زیادکردنی دەق"
                onPress={addParagraph}
              />
            </View>
          )}
        </View>

        {/* STATS */}
        <View style={styles.sectionBox}>
          {renderSectionHeader("stats", "٣. ژمارە و ئامار")}

          {openSection === "stats" && (
            <View style={styles.sectionBody}>
              {(content.stats || []).map((item, index) => (
                <View
                  key={`stat-${index}`}
                  style={styles.itemCard}
                >
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemNumber}>
                      ئامار {index + 1}
                    </Text>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeStat(index)}
                      activeOpacity={0.85}
                    >
                      <Trash2
                        size={18}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  </View>

                  <Field
                    label="ناونیشان"
                    value={item?.label || ""}
                    onChangeText={(value) =>
                      updateArrayItem(
                        "stats",
                        index,
                        "label",
                        value
                      )
                    }
                  />

                  <Field
                    label="بڕ / نرخ"
                    value={item?.value || ""}
                    onChangeText={(value) =>
                      updateArrayItem(
                        "stats",
                        index,
                        "value",
                        value
                      )
                    }
                  />
                </View>
              ))}

              <AddButton
                title="زیادکردنی ئامار"
                onPress={addStat}
              />
            </View>
          )}
        </View>

        {/* HISTORY */}
        <View style={styles.sectionBox}>
          {renderSectionHeader("history", "٤. مێژوو")}

          {openSection === "history" && (
            <View style={styles.sectionBody}>
              <Field
                label="کلیلەوشە"
                value={content.history?.kicker || ""}
                onChangeText={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    history: {
                      ...prev.history,
                      kicker: value,
                    },
                  }))
                }
              />

              <Field
                label="ناونیشان"
                value={content.history?.title || ""}
                onChangeText={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    history: {
                      ...prev.history,
                      title: value,
                    },
                  }))
                }
              />

              {(content.history?.items || []).map(
                (item, index) => (
                  <View
                    key={`history-${index}`}
                    style={styles.itemCard}
                  >
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemNumber}>
                        بەشی {index + 1}
                      </Text>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          removeHistoryItem(index)
                        }
                        activeOpacity={0.85}
                      >
                        <Trash2
                          size={18}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    </View>

                    <Field
                      label="ناونیشان"
                      value={item?.title || ""}
                      onChangeText={(value) =>
                        updateHistoryItem(
                          index,
                          "title",
                          value
                        )
                      }
                    />

                    <Field
                      label="دەق"
                      value={item?.text || ""}
                      multiline
                      onChangeText={(value) =>
                        updateHistoryItem(
                          index,
                          "text",
                          value
                        )
                      }
                    />
                  </View>
                )
              )}

              <AddButton
                title="زیادکردنی بەشی مێژوو"
                onPress={addHistoryItem}
              />
            </View>
          )}
        </View>

        {/* ROOTS */}
        <View style={styles.sectionBox}>
          {renderSectionHeader("roots", "٥. بنەما و بەرەکان")}

          {openSection === "roots" && (
            <View style={styles.sectionBody}>
              {(content.roots || []).map((item, index) => (
                <View
                  key={`root-${index}`}
                  style={styles.itemCard}
                >
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemNumber}>
                      بەرە {index + 1}
                    </Text>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeRoot(index)}
                      activeOpacity={0.85}
                    >
                      <Trash2
                        size={18}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  </View>

                  <Field
                    label="ناونیشان"
                    value={item?.title || ""}
                    onChangeText={(value) =>
                      updateArrayItem(
                        "roots",
                        index,
                        "title",
                        value
                      )
                    }
                  />

                  <Field
                    label="دەق"
                    value={item?.text || ""}
                    multiline
                    onChangeText={(value) =>
                      updateArrayItem(
                        "roots",
                        index,
                        "text",
                        value
                      )
                    }
                  />
                </View>
              ))}

              <AddButton
                title="زیادکردنی بەرە"
                onPress={addRoot}
              />
            </View>
          )}
        </View>

        {/* GEOGRAPHY */}
        <View style={styles.sectionBox}>
          {renderSectionHeader(
            "geography",
            "٦. شوێن و جوگرافیا"
          )}

          {openSection === "geography" && (
            <View style={styles.sectionBody}>
              <Field
                label="ناونیشان"
                value={content.geography?.title || ""}
                onChangeText={(value) =>
                  updateRootField(
                    "geography",
                    "title",
                    value
                  )
                }
              />

              <Field
                label="دەق"
                value={content.geography?.text || ""}
                multiline
                onChangeText={(value) =>
                  updateRootField(
                    "geography",
                    "text",
                    value
                  )
                }
              />
            </View>
          )}
        </View>

        {/* VALUES */}
        <View style={styles.sectionBox}>
          {renderSectionHeader("values", "٧. بەهاکان")}

          {openSection === "values" && (
            <View style={styles.sectionBody}>
              {(content.values || []).map(
                (item, index) => (
                  <View
                    key={`value-${index}`}
                    style={styles.itemCard}
                  >
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemNumber}>
                        بەها {index + 1}
                      </Text>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          removeValue(index)
                        }
                        activeOpacity={0.85}
                      >
                        <Trash2
                          size={18}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    </View>

                    <Field
                      label="ناونیشان"
                      value={item?.title || ""}
                      onChangeText={(value) =>
                        updateArrayItem(
                          "values",
                          index,
                          "title",
                          value
                        )
                      }
                    />

                    <Field
                      label="دەق"
                      value={item?.text || ""}
                      multiline
                      onChangeText={(value) =>
                        updateArrayItem(
                          "values",
                          index,
                          "text",
                          value
                        )
                      }
                    />
                  </View>
                )
              )}

              <AddButton
                title="زیادکردنی بەها"
                onPress={addValue}
              />
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.sectionBox}>
          {renderSectionHeader("footer", "٨. کۆتایی")}

          {openSection === "footer" && (
            <View style={styles.sectionBody}>
              <Field
                label="ناونیشان"
                value={content.footer?.title || ""}
                onChangeText={(value) =>
                  updateRootField(
                    "footer",
                    "title",
                    value
                  )
                }
              />

              <Field
                label="دەق"
                value={content.footer?.text || ""}
                multiline
                onChangeText={(value) =>
                  updateRootField(
                    "footer",
                    "text",
                    value
                  )
                }
              />
            </View>
          )}
        </View>

        {/* SAVE */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={saving}
          onPress={saveContent}
        >
          {saving ? (
            <>
              <ActivityIndicator
                color="#08111F"
                style={styles.saveIcon}
              />

              <Text style={styles.saveButtonText}>
                پاشەکەوتکردن...
              </Text>
            </>
          ) : (
            <>
              <Save
                size={20}
                color="#08111F"
                style={styles.saveIcon}
              />

              <Text style={styles.saveButtonText}>
                پاشەکەوتکردنی گۆڕانکاری
              </Text>
            </>
          )}
        </TouchableOpacity>

        {saved && (
          <View style={styles.savedMessage}>
            <Text style={styles.savedMessageText}>
              ✓ گۆڕانکارییەکان پاشەکەوت کران
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.resetButton}
          activeOpacity={0.85}
          onPress={resetContent}
          disabled={saving}
        >
          <Text style={styles.resetButtonText}>
            گەڕاندنەوە بۆ زانیاریی بنەڕەتی
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
        ]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlign="right"
        placeholder="بنوسە..."
        placeholderTextColor="#6B7280"
      />
    </View>
  );
}

function AddButton({ title, onPress }) {
  return (
    <TouchableOpacity
      style={styles.addButton}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Plus size={18} color="#E7C77B" />

      <Text style={styles.addButtonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#08111F",
  },

  topBar: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#172337",
    backgroundColor: "#0A1526",
  },

  topTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  topBarSpace: {
    width: 40,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#132238",
  },

  scrollView: {
    flex: 1,
  },

  container: {
    padding: 14,
  },

  sectionBox: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#0D1929",
    borderWidth: 1,
    borderColor: "#1A2A40",
  },

  sectionHeader: {
    minHeight: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#102034",
  },

  sectionHeaderTextWrap: {
    flex: 1,
    paddingRight: 12,
  },

  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },

  sectionBody: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#1A2A40",
  },

  fieldWrap: {
    marginBottom: 14,
  },

  fieldLabel: {
    color: "#D5DCE8",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
    textAlign: "right",
  },

  input: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: "#08111F",
    borderWidth: 1,
    borderColor: "#20314A",
    color: "#FFFFFF",
    fontSize: 13,
    writingDirection: "rtl",
  },

  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  itemCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#0A1526",
    borderWidth: 1,
    borderColor: "#1D2E47",
  },

  itemTopRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  itemNumber: {
    color: "#E7C77B",
    fontSize: 12,
    fontWeight: "900",
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25171B",
    borderWidth: 1,
    borderColor: "#48252C",
  },

  addButton: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#122238",
    borderWidth: 1,
    borderColor: "#314867",
  },

  addButtonText: {
    color: "#E7C77B",
    fontSize: 12,
    fontWeight: "900",
  },

  saveButton: {
    minHeight: 56,
    borderRadius: 15,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7C77B",
    paddingHorizontal: 18,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveIcon: {
    marginRight: 8,
  },

  saveButtonText: {
    color: "#08111F",
    fontSize: 14,
    fontWeight: "900",
  },

  savedMessage: {
    marginTop: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#12351F",
    borderWidth: 1,
    borderColor: "#1F7A3A",
    alignItems: "center",
  },

  savedMessageText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "900",
  },

  resetButton: {
    marginTop: 10,
    minHeight: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#101C2D",
    borderWidth: 1,
    borderColor: "#24364F",
  },

  resetButtonText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "800",
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#08111F",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    color: "#D5DCE8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  bottomSpace: {
    height: 35,
  },
});