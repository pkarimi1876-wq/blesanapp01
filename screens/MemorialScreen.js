import React, { useCallback, useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  MapPin,
  Phone,
  User,
  X,
  ArrowRight,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function MemorialScreen({
  navigation,
  isAdmin: adminFromNavigation = false,
}) {
  const isAdmin = adminFromNavigation === true;

  // =========================================================
  // OBITUARIES
  // =========================================================

  const [obituaries, setObituaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CLIENT ID
  // =========================================================

  const [clientId, setClientId] = useState(null);

  // =========================================================
  // LIKES
  // =========================================================

  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likeLoading, setLikeLoading] = useState({});

  // =========================================================
  // COMMENTS
  // =========================================================

  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentLoading, setCommentLoading] = useState({});

  // =========================================================
  // COMMENT EDIT MODAL
  // =========================================================

  const [editCommentModal, setEditCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [editingCommentSaving, setEditingCommentSaving] = useState(false);

  // =========================================================
  // ADD / EDIT OBITUARY MODAL
  // =========================================================

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // =========================================================
  // OBITUARY FORM
  // =========================================================

  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // INITIALIZE CLIENT
  // =========================================================

  const initializeClient = useCallback(async () => {
    try {
      let savedClientId = await AsyncStorage.getItem("blesan_client_id");

      if (!savedClientId) {
        savedClientId =
          "client_" +
          Date.now().toString() +
          "_" +
          Math.random().toString(36).substring(2, 12);

        await AsyncStorage.setItem("blesan_client_id", savedClientId);
      }

      setClientId(savedClientId);
    } catch (error) {
      console.log("Client ID error:", error?.message);
    }
  }, []);

  useEffect(() => {
    initializeClient();
  }, [initializeClient]);

  // =========================================================
  // LOAD OBITUARIES
  // =========================================================

  const fetchObituaries = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("obituaries")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setObituaries(data || []);
    } catch (error) {
      console.log("Fetch obituaries error:", error?.message);

      Alert.alert(
        "کێشە",
        "نەتوانرا زانیارییەکانی پرسەکان بهێنرێن."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObituaries();
  }, [fetchObituaries]);

  // =========================================================
  // LOAD LIKES + COMMENTS
  // =========================================================

  const loadSocialData = useCallback(
    async (list) => {
      if (!clientId || !list || list.length === 0) {
        return;
      }

      try {
        const obituaryIds = list.map((item) => item.id);

        // -----------------------------------------------------
        // LOAD LIKES
        // -----------------------------------------------------

        const {
          data: likesData,
          error: likesError,
        } = await supabase
          .from("obituary_likes")
          .select("id, obituary_id, client_id")
          .in("obituary_id", obituaryIds);

        if (likesError) {
          throw likesError;
        }

        const newLikeCounts = {};
        const newLikedPosts = {};

        list.forEach((item) => {
          newLikeCounts[item.id] = 0;
          newLikedPosts[item.id] = false;
        });

        (likesData || []).forEach((like) => {
          newLikeCounts[like.obituary_id] =
            (newLikeCounts[like.obituary_id] || 0) + 1;

          if (like.client_id === clientId) {
            newLikedPosts[like.obituary_id] = true;
          }
        });

        setLikeCounts(newLikeCounts);
        setLikedPosts(newLikedPosts);

        // -----------------------------------------------------
        // LOAD COMMENTS
        // -----------------------------------------------------

        const {
          data: commentsData,
          error: commentsError,
        } = await supabase
          .from("obituary_comments")
          .select(
            "id, obituary_id, client_id, comment, created_at"
          )
          .in("obituary_id", obituaryIds)
          .order("created_at", {
            ascending: true,
          });

        if (commentsError) {
          throw commentsError;
        }

        const groupedComments = {};

        list.forEach((item) => {
          groupedComments[item.id] = [];
        });

        (commentsData || []).forEach((comment) => {
          if (!groupedComments[comment.obituary_id]) {
            groupedComments[comment.obituary_id] = [];
          }

          groupedComments[comment.obituary_id].push({
            id: comment.id,
            text: comment.comment,
            clientId: comment.client_id,
            createdAt: comment.created_at,
          });
        });

        setComments(groupedComments);
      } catch (error) {
        console.log("Load social data error:", error?.message);
      }
    },
    [clientId]
  );

  useEffect(() => {
    if (clientId && obituaries.length > 0) {
      loadSocialData(obituaries);
    }
  }, [clientId, obituaries, loadSocialData]);

  // =========================================================
  // FORM HELPERS
  // =========================================================

  const clearForm = () => {
    setFullName("");
    setDate("");
    setLocation("");
    setPhone("");
    setImageUrl("");
    setNotes("");
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalVisible(false);
    setEditingId(null);
    clearForm();
  };

  // =========================================================
  // ADD OBITUARY
  // =========================================================

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      return;
    }

    setEditingId(null);
    clearForm();
    setModalVisible(true);
  };

  // =========================================================
  // EDIT OBITUARY
  // =========================================================

  const handleOpenEditModal = (item) => {
    if (!isAdmin) {
      return;
    }

    setEditingId(item.id);
    setFullName(item.full_name || "");
    setDate(item.date || "");
    setLocation(item.location || "");
    setPhone(item.phone || "");
    setImageUrl(item.image_url || "");
    setNotes(item.notes || "");
    setModalVisible(true);
  };

  // =========================================================
  // SAVE OBITUARY
  // =========================================================

  const handleSaveObituary = async () => {
    if (!isAdmin) {
      return;
    }

    if (!fullName.trim() || !location.trim()) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوی کۆچکردوو و شوێنی پرسە پڕبکەرەوە."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        full_name: fullName.trim(),
        date: date.trim() || "ئەمڕۆ",
        location: location.trim(),
        phone: phone.trim(),
        image_url: imageUrl.trim() || null,
        notes: notes.trim(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("obituaries")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        Alert.alert(
          "سەرکەوتوو بوو",
          "زانیارییەکان بە سەرکەوتوویی نوێکرانەوە."
        );
      } else {
        const { error } = await supabase
          .from("obituaries")
          .insert([payload]);

        if (error) {
          throw error;
        }

        Alert.alert(
          "سەرکەوتوو بوو",
          "هەواڵی پرسەکە بە سەرکەوتوویی تۆمارکرا."
        );
      }

      setModalVisible(false);
      setEditingId(null);
      clearForm();

      await fetchObituaries();
    } catch (error) {
      console.log("Save obituary error:", error?.message);

      Alert.alert(
        "کێشەیەک ڕوویدا",
        error?.message || "نەتوانرا زانیارییەکان پاشەکەوت بکرێن."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE OBITUARY
  // =========================================================

  const handleDeleteObituary = (id) => {
    if (!isAdmin) {
      return;
    }

    Alert.alert(
      "دڵنیابوونەوە",
      "ئایا دڵنیایت لە سڕینەوەی ئەم بابەتەی پرسە؟",
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
              setLoading(true);

              const { error } = await supabase
                .from("obituaries")
                .delete()
                .eq("id", id);

              if (error) {
                throw error;
              }

              await fetchObituaries();
            } catch (error) {
              Alert.alert(
                "کێشە لە سڕینەوە",
                error?.message || "نەتوانرا بابەتەکە بسڕدرێتەوە."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // LIKE
  // =========================================================

  const handleLike = async (obituaryId) => {
    if (!clientId) {
      Alert.alert(
        "تکایە چاوەڕێ بکە",
        "ئەپەکە هێشتا ئامادە نییە."
      );
      return;
    }

    if (likeLoading[obituaryId]) {
      return;
    }

    const currentlyLiked = likedPosts[obituaryId] === true;

    try {
      setLikeLoading((previous) => ({
        ...previous,
        [obituaryId]: true,
      }));

      // -----------------------------------------------------
      // REMOVE LIKE
      // -----------------------------------------------------

      if (currentlyLiked) {
        const { error } = await supabase
          .from("obituary_likes")
          .delete()
          .eq("obituary_id", obituaryId)
          .eq("client_id", clientId);

        if (error) {
          throw error;
        }

        setLikedPosts((previous) => ({
          ...previous,
          [obituaryId]: false,
        }));

        setLikeCounts((previous) => ({
          ...previous,
          [obituaryId]: Math.max(
            0,
            (previous[obituaryId] || 0) - 1
          ),
        }));
      }

      // -----------------------------------------------------
      // ADD LIKE
      // -----------------------------------------------------

      else {
        const { error } = await supabase
          .from("obituary_likes")
          .insert([
            {
              obituary_id: obituaryId,
              client_id: clientId,
            },
          ]);

        if (error) {
          if (error.code === "23505") {
            setLikedPosts((previous) => ({
              ...previous,
              [obituaryId]: true,
            }));

            return;
          }

          throw error;
        }

        setLikedPosts((previous) => ({
          ...previous,
          [obituaryId]: true,
        }));

        setLikeCounts((previous) => ({
          ...previous,
          [obituaryId]:
            (previous[obituaryId] || 0) + 1,
        }));
      }
    } catch (error) {
      console.log("Like error:", error?.message);

      Alert.alert(
        "کێشە",
        "نەتوانرا Like بگۆڕدرێت."
      );
    } finally {
      setLikeLoading((previous) => ({
        ...previous,
        [obituaryId]: false,
      }));
    }
  };

  // =========================================================
  // OPEN / CLOSE COMMENTS
  // =========================================================

  const toggleComments = (id) => {
    setOpenComments((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  // =========================================================
  // COMMENT INPUT
  // =========================================================

  const handleCommentChange = (id, text) => {
    setCommentInputs((previous) => ({
      ...previous,
      [id]: text,
    }));
  };

  // =========================================================
  // ADD COMMENT
  // =========================================================

  const handleAddComment = async (obituaryId) => {
    if (!clientId) {
      Alert.alert(
        "تکایە چاوەڕێ بکە",
        "ئەپەکە هێشتا ئامادە نییە."
      );
      return;
    }

    const text = commentInputs[obituaryId]?.trim();

    if (!text) {
      return;
    }

    if (commentLoading[obituaryId]) {
      return;
    }

    if (text.length > 1000) {
      Alert.alert(
        "ئاگاداری",
        "کۆمێنت نابێت لە ١٠٠٠ پیت زیاتر بێت."
      );
      return;
    }

    try {
      setCommentLoading((previous) => ({
        ...previous,
        [obituaryId]: true,
      }));

      const {
        data,
        error,
      } = await supabase
        .from("obituary_comments")
        .insert([
          {
            obituary_id: obituaryId,
            client_id: clientId,
            comment: text,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newComment = {
        id: data.id,
        text: data.comment,
        clientId: data.client_id,
        createdAt: data.created_at,
      };

      setComments((previous) => ({
        ...previous,
        [obituaryId]: [
          ...(previous[obituaryId] || []),
          newComment,
        ],
      }));

      setCommentInputs((previous) => ({
        ...previous,
        [obituaryId]: "",
      }));

      setOpenComments((previous) => ({
        ...previous,
        [obituaryId]: true,
      }));
    } catch (error) {
      console.log("Add comment error:", error?.message);

      Alert.alert(
        "کێشە",
        "نەتوانرا کۆمێنتەکە بنێردرێت."
      );
    } finally {
      setCommentLoading((previous) => ({
        ...previous,
        [obituaryId]: false,
      }));
    }
  };

  // =========================================================
  // OPEN EDIT COMMENT MODAL
  // =========================================================

  const handleEditComment = (comment) => {
    if (!isAdmin) {
      return;
    }

    setEditingComment(comment);
    setEditingCommentText(comment.text || "");
    setEditCommentModal(true);
  };

  // =========================================================
  // CLOSE EDIT COMMENT MODAL
  // =========================================================

  const closeEditCommentModal = () => {
    if (editingCommentSaving) {
      return;
    }

    setEditCommentModal(false);
    setEditingComment(null);
    setEditingCommentText("");
  };

  // =========================================================
  // SAVE EDITED COMMENT
  // =========================================================

  const handleSaveEditedComment = async () => {
    if (!isAdmin) {
      return;
    }

    if (!editingComment) {
      return;
    }

    const updatedText = editingCommentText.trim();

    if (!updatedText) {
      Alert.alert(
        "ئاگاداری",
        "کۆمێنت نابێت بەتاڵ بێت."
      );
      return;
    }

    if (updatedText.length > 1000) {
      Alert.alert(
        "ئاگاداری",
        "کۆمێنت نابێت لە ١٠٠٠ پیت زیاتر بێت."
      );
      return;
    }

    try {
      setEditingCommentSaving(true);

      const { error } = await supabase
        .from("obituary_comments")
        .update({
          comment: updatedText,
        })
        .eq("id", editingComment.id);

      if (error) {
        throw error;
      }

      setComments((previous) => {
        const updated = { ...previous };

        Object.keys(updated).forEach((obituaryId) => {
          updated[obituaryId] = (
            updated[obituaryId] || []
          ).map((item) =>
            item.id === editingComment.id
              ? {
                  ...item,
                  text: updatedText,
                }
              : item
          );
        });

        return updated;
      });

      setEditCommentModal(false);
      setEditingComment(null);
      setEditingCommentText("");

      Alert.alert(
        "سەرکەوتوو بوو",
        "کۆمێنتەکە نوێکرایەوە."
      );
    } catch (error) {
      console.log(
        "Edit comment error:",
        error?.message
      );

      Alert.alert(
        "کێشە",
        "نەتوانرا کۆمێنتەکە دەستکاری بکرێت."
      );
    } finally {
      setEditingCommentSaving(false);
    }
  };

  // =========================================================
  // DELETE COMMENT
  // =========================================================

  const handleDeleteComment = (commentId) => {
    if (!isAdmin) {
      return;
    }

    Alert.alert(
      "سڕینەوەی کۆمێنت",
      "ئایا دڵنیایت لە سڕینەوەی ئەم کۆمێنتە؟",
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
              const { error } = await supabase
                .from("obituary_comments")
                .delete()
                .eq("id", commentId);

              if (error) {
                throw error;
              }

              setComments((previous) => {
                const updated = { ...previous };

                Object.keys(updated).forEach(
                  (obituaryId) => {
                    updated[obituaryId] = (
                      updated[obituaryId] || []
                    ).filter(
                      (item) => item.id !== commentId
                    );
                  }
                );

                return updated;
              });

              Alert.alert(
                "سەرکەوتوو بوو",
                "کۆمێنتەکە سڕایەوە."
              );
            } catch (error) {
              console.log(
                "Delete comment error:",
                error?.message
              );

              Alert.alert(
                "کێشە",
                "نەتوانرا کۆمێنتەکە بسڕدرێتەوە."
              );
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    navigation.goBack();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <ArrowRight color="#FFF" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          پرسە و سەرەخۆشی بڵەسەن
        </Text>

        {isAdmin ? (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>
              ئەدمین
            </Text>
          </View>
        ) : (
          <View style={styles.headerSpace} />
        )}
      </View>

      {/* ADMIN ADD BUTTON */}

      {isAdmin && (
        <TouchableOpacity
          style={styles.addBannerBtn}
          onPress={handleOpenAddModal}
          activeOpacity={0.8}
        >
          <Plus color="#000" size={20} />

          <Text style={styles.addBannerText}>
            تۆمارکردنی هەواڵی پرسەی نوێ
          </Text>
        </TouchableOpacity>
      )}

      {/* LIST */}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loadingIndicator}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {obituaries.length > 0 ? (
            obituaries.map((item) => {
              const isLiked =
                likedPosts[item.id] === true;

              const currentLikes =
                likeCounts[item.id] || 0;

              const itemComments =
                comments[item.id] || [];

              const commentsOpen =
                openComments[item.id];

              const isLikeLoading =
                likeLoading[item.id];

              const isCommentLoading =
                commentLoading[item.id];

              return (
                <View
                  key={item.id}
                  style={styles.card}
                >
                  {/* CARD HEADER */}

                  <View style={styles.cardHeader}>
                    <View
                      style={styles.avatarContainer}
                    >
                      {item.image_url ? (
                        <Image
                          source={{
                            uri: item.image_url,
                          }}
                          style={styles.avatar}
                        />
                      ) : (
                        <User
                          color="#4A5568"
                          size={32}
                        />
                      )}
                    </View>

                    {isAdmin && (
                      <View style={styles.adminActions}>
                        <TouchableOpacity
                          onPress={() =>
                            handleOpenEditModal(item)
                          }
                          style={styles.actionBtn}
                          activeOpacity={0.7}
                        >
                          <Edit3
                            color={COLORS.primary}
                            size={18}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() =>
                            handleDeleteObituary(item.id)
                          }
                          style={styles.actionBtn}
                          activeOpacity={0.7}
                        >
                          <Trash2
                            color="#FF4D4D"
                            size={18}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* CARD BODY */}

                  <View style={styles.cardBody}>
                    <Text style={styles.nameText}>
                      {item.full_name}
                    </Text>

                    {item.date ? (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoText}>
                          {item.date}
                        </Text>

                        <Calendar
                          size={14}
                          color={COLORS.primary}
                        />
                      </View>
                    ) : null}

                    {item.location ? (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoText}>
                          {item.location}
                        </Text>

                        <MapPin
                          size={14}
                          color={COLORS.primary}
                        />
                      </View>
                    ) : null}

                    {item.phone ? (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoText}>
                          {item.phone}
                        </Text>

                        <Phone
                          size={14}
                          color={COLORS.primary}
                        />
                      </View>
                    ) : null}

                    {item.notes ? (
                      <Text style={styles.notesText}>
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>

                  {/* SOCIAL BAR */}

                  <View style={styles.socialBar}>
                    {/* COMMENTS */}

                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() =>
                        toggleComments(item.id)
                      }
                      activeOpacity={0.7}
                    >
                      <MessageCircle
                        size={19}
                        color="#A0AEC0"
                      />

                      <Text style={styles.socialText}>
                        {itemComments.length}
                      </Text>

                      <Text style={styles.socialLabel}>
                        کۆمێنت
                      </Text>
                    </TouchableOpacity>

                    {/* LIKE */}

                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() =>
                        handleLike(item.id)
                      }
                      disabled={isLikeLoading}
                      activeOpacity={0.7}
                    >
                      {isLikeLoading ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.primary}
                        />
                      ) : (
                        <Heart
                          size={19}
                          color={
                            isLiked
                              ? "#EF4444"
                              : "#A0AEC0"
                          }
                          fill={
                            isLiked
                              ? "#EF4444"
                              : "transparent"
                          }
                        />
                      )}

                      <Text
                        style={[
                          styles.socialText,
                          isLiked &&
                            styles.likedText,
                        ]}
                      >
                        {currentLikes}
                      </Text>

                      <Text style={styles.socialLabel}>
                        لایک
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* COMMENTS SECTION */}

                  {commentsOpen && (
                    <View style={styles.commentsSection}>
                      {itemComments.length > 0 ? (
                        itemComments.map((comment) => (
                          <View
                            key={comment.id}
                            style={styles.commentItem}
                          >
                            <View
                              style={
                                styles.commentContent
                              }
                            >
                              <Text
                                style={
                                  styles.commentText
                                }
                              >
                                {comment.text}
                              </Text>

                              {isAdmin && (
                                <View
                                  style={
                                    styles.commentActions
                                  }
                                >
                                  <TouchableOpacity
                                    style={
                                      styles.commentActionBtn
                                    }
                                    onPress={() =>
                                      handleEditComment(
                                        comment
                                      )
                                    }
                                    activeOpacity={0.7}
                                  >
                                    <Edit3
                                      size={16}
                                      color={
                                        COLORS.primary
                                      }
                                    />
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={
                                      styles.commentActionBtn
                                    }
                                    onPress={() =>
                                      handleDeleteComment(
                                        comment.id
                                      )
                                    }
                                    activeOpacity={0.7}
                                  >
                                    <Trash2
                                      size={16}
                                      color="#FF4D4D"
                                    />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noComments}>
                          هێشتا هیچ کۆمێنتێک نییە.
                        </Text>
                      )}

                      {/* COMMENT INPUT */}

                      <View
                        style={
                          styles.commentInputRow
                        }
                      >
                        <TouchableOpacity
                          style={styles.sendButton}
                          onPress={() =>
                            handleAddComment(item.id)
                          }
                          disabled={isCommentLoading}
                          activeOpacity={0.8}
                        >
                          {isCommentLoading ? (
                            <ActivityIndicator
                              size="small"
                              color="#000"
                            />
                          ) : (
                            <Send
                              size={18}
                              color="#000"
                            />
                          )}
                        </TouchableOpacity>

                        <TextInput
                          style={styles.commentInput}
                          placeholder="کۆمێنتەکەت بنووسە..."
                          placeholderTextColor="#556575"
                          value={
                            commentInputs[item.id] || ""
                          }
                          onChangeText={(text) =>
                            handleCommentChange(
                              item.id,
                              text
                            )
                          }
                          textAlign="right"
                          multiline
                          maxLength={1000}
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                هیچ هەواڵێکی پرسە تۆمار نەکراوە.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ADMIN OBITUARY MODAL */}

      {isAdmin && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : "height"
            }
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeBtn}
                  disabled={saving}
                >
                  <X color="#FFF" size={20} />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>
                  {editingId
                    ? "دەستکاریکردنی زانیاریی پرسە"
                    : "تۆمارکردنی پرسەی نوێ"}
                </Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.formContent
                }
              >
                <TextInput
                  style={styles.input}
                  placeholder="ناوی تەواوی کۆچکردوو"
                  placeholderTextColor="#556575"
                  value={fullName}
                  onChangeText={setFullName}
                  textAlign="right"
                />

                <TextInput
                  style={styles.input}
                  placeholder="ڕێکەوتی کۆچی دوایی / پرسە"
                  placeholderTextColor="#556575"
                  value={date}
                  onChangeText={setDate}
                  textAlign="right"
                />

                <TextInput
                  style={styles.input}
                  placeholder="شوێنی پرسە (مزگەوت/ماڵ)"
                  placeholderTextColor="#556575"
                  value={location}
                  onChangeText={setLocation}
                  textAlign="right"
                />

                <TextInput
                  style={styles.input}
                  placeholder="ژمارەی پەیوەندی کەسووکار"
                  placeholderTextColor="#556575"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  textAlign="right"
                />

                <TextInput
                  style={styles.input}
                  placeholder="لینکی وێنە (ئارەزوومەندانە)"
                  placeholderTextColor="#556575"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  textAlign="right"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.notesInput,
                  ]}
                  multiline
                  placeholder="تێبینی / ڕاگەیاندنی پرسە"
                  placeholderTextColor="#556575"
                  value={notes}
                  onChangeText={setNotes}
                  textAlign="right"
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleSaveObituary}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.btnText}>
                      {editingId
                        ? "نوێکردنەوەی زانیارییەکان"
                        : "بڵاوکردنەوەی پرسە"}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={closeModal}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelText}>
                    پاشگەزبوونەوە
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* EDIT COMMENT MODAL */}

      {isAdmin && (
        <Modal
          visible={editCommentModal}
          transparent
          animationType="fade"
          onRequestClose={closeEditCommentModal}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : "height"
            }
          >
            <View style={styles.editCommentModal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={closeEditCommentModal}
                  style={styles.closeBtn}
                  disabled={editingCommentSaving}
                >
                  <X color="#FFF" size={20} />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>
                  دەستکاریکردنی کۆمێنت
                </Text>
              </View>

              <TextInput
                style={styles.editCommentInput}
                value={editingCommentText}
                onChangeText={setEditingCommentText}
                multiline
                maxLength={1000}
                placeholder="کۆمێنت..."
                placeholderTextColor="#556575"
                textAlign="right"
                textAlignVertical="top"
                autoFocus
              />

              <TouchableOpacity
                style={styles.editCommentSaveBtn}
                onPress={handleSaveEditedComment}
                disabled={editingCommentSaving}
                activeOpacity={0.8}
              >
                {editingCommentSaving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text
                    style={styles.editCommentSaveText}
                  >
                    پاشەکەوتکردنی گۆڕانکاری
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editCommentCancelBtn}
                onPress={closeEditCommentModal}
                disabled={editingCommentSaving}
                activeOpacity={0.8}
              >
                <Text
                  style={styles.editCommentCancelText}
                >
                  پاشگەزبوونەوە
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B131F",
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2C3D",
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#2A3B50",
    justifyContent: "center",
    alignItems: "center",
  },

  headerSpace: {
    width: 38,
  },

  adminBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  adminBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },

  addBannerBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    borderRadius: 10,
  },

  addBannerText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 13,
  },

  loadingIndicator: {
    marginTop: 40,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#131D2A",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1E2C3D",
  },

  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#162232",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  adminActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  actionBtn: {
    padding: 7,
    backgroundColor: "#1A2636",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A3B50",
  },

  cardBody: {
    alignItems: "flex-end",
    gap: 6,
  },

  nameText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
  },

  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  infoText: {
    color: COLORS.textSub,
    fontSize: 12,
  },

  notesText: {
    color: "#A0AEC0",
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#1E2C3D",
    paddingTop: 8,
    width: "100%",
    lineHeight: 20,
  },

  socialBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 18,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E2C3D",
  },

  socialButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
  },

  socialText: {
    color: "#A0AEC0",
    fontSize: 12,
    fontWeight: "bold",
  },

  socialLabel: {
    color: "#718096",
    fontSize: 12,
  },

  likedText: {
    color: "#EF4444",
  },

  commentsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E2C3D",
  },

  commentItem: {
    backgroundColor: "#0B131F",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1E2C3D",
  },

  commentContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  commentText: {
    color: "#E2E8F0",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "right",
    flex: 1,
  },

  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  commentActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#2A3B50",
    justifyContent: "center",
    alignItems: "center",
  },

  noComments: {
    color: "#718096",
    fontSize: 12,
    textAlign: "right",
    marginBottom: 10,
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },

  commentInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 90,
    backgroundColor: "#0B131F",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 9,
    textAlign: "right",
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    paddingTop: 40,
    alignItems: "center",
  },

  emptyText: {
    color: COLORS.textSub,
    textAlign: "center",
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#131D2A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    maxHeight: "90%",
  },

  editCommentModal: {
    backgroundColor: "#131D2A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    width: "100%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },

  closeBtn: {
    padding: 4,
  },

  formContent: {
    paddingBottom: 10,
  },

  input: {
    backgroundColor: "#0B131F",
    borderRadius: 10,
    padding: 12,
    color: "#FFF",
    textAlign: "right",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    marginBottom: 10,
    minHeight: 46,
  },

  notesInput: {
    height: 80,
  },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },

  btnText: {
    color: "#000",
    fontWeight: "bold",
  },

  cancelBtn: {
    backgroundColor: "#1A2636",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#2A3B50",
  },

  cancelText: {
    color: "#A0AEC0",
    fontWeight: "bold",
  },

  editCommentInput: {
    minHeight: 100,
    maxHeight: 180,
    backgroundColor: "#0B131F",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    color: "#FFF",
    padding: 12,
    textAlign: "right",
    textAlignVertical: "top",
    marginBottom: 12,
  },

  editCommentSaveBtn: {
    backgroundColor: COLORS.primary,
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  editCommentSaveText: {
    color: "#000",
    fontWeight: "bold",
  },

  editCommentCancelBtn: {
    backgroundColor: "#1A2636",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#2A3B50",
  },

  editCommentCancelText: {
    color: "#A0AEC0",
    fontWeight: "bold",
  },
});