import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

const createUUID = () => {
  if (
    typeof global !== "undefined" &&
    global.crypto &&
    typeof global.crypto.randomUUID === "function"
  ) {
    return global.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
};

const LOCAL_USER_ID = createUUID();

export default function GalleryItem({ item }) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [userName, setUserName] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);

  const [loadingLikes, setLoadingLikes] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingComment, setSavingComment] = useState(false);

  useEffect(() => {
    if (!item?.id) return;

    fetchLikes();
    fetchComments();
  }, [item?.id]);

  // =========================
  // LIKES
  // =========================

  const fetchLikes = async () => {
    if (!item?.id) return;

    setLoadingLikes(true);

    try {
      const { data, count, error } = await supabase
        .from("gallery_likes")
        .select("*", { count: "exact" })
        .eq("photo_id", item.id);

      if (error) {
        console.log("FETCH LIKES ERROR:", error);

        Alert.alert(
          "هەڵە",
          `کێشەیەک لە وەرگرتنی لایکەکان هەیە:\n${error.message}`
        );

        return;
      }

      setLikesCount(count || 0);

      const userHasLiked = (data || []).some(
        (like) => like.user_id === LOCAL_USER_ID
      );

      setIsLiked(userHasLiked);
    } catch (error) {
      console.log("FETCH LIKES EXCEPTION:", error);

      Alert.alert(
        "هەڵە",
        error?.message || "کێشەیەک لە وەرگرتنی لایکەکان ڕوویدا."
      );
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleToggleLike = async () => {
    if (!item?.id || loadingLikes) return;

    setLoadingLikes(true);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("gallery_likes")
          .delete()
          .eq("photo_id", item.id)
          .eq("user_id", LOCAL_USER_ID);

        if (error) {
          console.log("DELETE LIKE ERROR:", error);

          Alert.alert(
            "هەڵەی لایک",
            `${error.message}\n${error.details || ""}`
          );

          return;
        }

        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from("gallery_likes")
          .insert([
            {
              photo_id: item.id,
              user_id: LOCAL_USER_ID,
            },
          ]);

        if (error) {
          console.log("INSERT LIKE ERROR:", error);

          Alert.alert(
            "هەڵەی لایک",
            `${error.message}\n${error.details || ""}`
          );

          return;
        }

        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.log("LIKE EXCEPTION:", error);

      Alert.alert(
        "هەڵە",
        error?.message || "کێشەیەک لە لایککردن ڕوویدا."
      );
    } finally {
      setLoadingLikes(false);
    }
  };

  // =========================
  // COMMENTS - FETCH
  // =========================

  const fetchComments = async () => {
    if (!item?.id) return;

    setLoadingComments(true);

    try {
      const { data, error } = await supabase
        .from("gallery_comments")
        .select("*")
        .eq("photo_id", item.id)
        .order("created_at", { ascending: true });

      console.log("FETCH COMMENTS:", { data, error });

      if (error) {
        Alert.alert(
          "هەڵە",
          `کێشەیەک لە وەرگرتنی کۆمێنتەکان هەیە:\n${error.message}`
        );

        return;
      }

      setComments(data || []);
    } catch (error) {
      console.log("FETCH COMMENTS EXCEPTION:", error);

      Alert.alert(
        "هەڵە",
        error?.message || "کێشەیەک لە وەرگرتنی کۆمێنتەکان ڕوویدا."
      );
    } finally {
      setLoadingComments(false);
    }
  };

  // =========================
  // SAVE COMMENT
  // =========================

  const handleSaveComment = async () => {
    const text = commentText.trim();
    const authorName = userName.trim() || "میوان";

    if (!text) {
      Alert.alert("ئاگاداری", "تکایە کۆمێنتەکەت بنووسە.");
      return;
    }

    if (!item?.id) {
      Alert.alert("هەڵە", "ناسنامەی وێنەکە نەدۆزرایەوە.");
      return;
    }

    setSavingComment(true);

    try {
      // EDIT
      if (editingCommentId) {
        const { data, error } = await supabase
          .from("gallery_comments")
          .update({
            user_name: authorName,
            comment_text: text,
          })
          .eq("id", editingCommentId)
          .select()
          .single();

        console.log("UPDATE COMMENT:", { data, error });

        if (error) {
          Alert.alert(
            "هەڵەی دەستکاریکردن",
            `${error.message}\n${error.details || ""}\n${error.hint || ""}`
          );

          return;
        }

        setComments((prev) =>
          prev.map((comment) =>
            comment.id === editingCommentId ? data : comment
          )
        );

        setEditingCommentId(null);
        setCommentText("");
        setUserName("");

        Alert.alert("سەرکەوتوو", "کۆمێنتەکە نوێکرایەوە.");

        return;
      }

      // NEW COMMENT

      const newComment = {
        photo_id: item.id,
        user_name: authorName,
        comment_text: text,
      };

      console.log("INSERTING COMMENT:", newComment);

      const { data, error } = await supabase
        .from("gallery_comments")
        .insert([newComment])
        .select()
        .single();

      console.log("INSERT COMMENT RESULT:", {
        data,
        error,
      });

      if (error) {
        Alert.alert(
          "هەڵەی کۆمێنت",
          `${error.message}\n\n${error.details || ""}\n\n${error.hint || ""}`
        );

        return;
      }

      if (data) {
        setComments((prev) => [...prev, data]);
      }

      setCommentText("");
      setUserName("");

      Alert.alert("سەرکەوتوو", "کۆمێنتەکەت زیاد کرا.");

      await fetchComments();
    } catch (error) {
      console.log("SAVE COMMENT EXCEPTION:", error);

      Alert.alert(
        "هەڵە",
        error?.message || "کێشەیەک لە ناردنی کۆمێنتەکە ڕوویدا."
      );
    } finally {
      setSavingComment(false);
    }
  };

  // =========================
  // DELETE COMMENT
  // =========================

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      "سڕینەوەی کۆمێنت",
      "دڵنیایت دەتەوێت ئەم کۆمێنتە بسڕیتەوە؟",
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
                .from("gallery_comments")
                .delete()
                .eq("id", commentId);

              console.log("DELETE COMMENT:", error);

              if (error) {
                Alert.alert(
                  "هەڵە",
                  `${error.message}\n${error.details || ""}`
                );

                return;
              }

              setComments((prev) =>
                prev.filter((comment) => comment.id !== commentId)
              );
            } catch (error) {
              console.log("DELETE COMMENT EXCEPTION:", error);

              Alert.alert(
                "هەڵە",
                error?.message || "کێشەیەک لە سڕینەوەی کۆمێنتەکە ڕوویدا."
              );
            }
          },
        },
      ]
    );
  };

  // =========================
  // EDIT COMMENT
  // =========================

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setCommentText(comment.comment_text || "");
    setUserName(comment.user_name || "");
    setShowComments(true);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setCommentText("");
    setUserName("");
  };

  // =========================
  // COMMENT ITEM
  // =========================

  const renderComment = ({ item: comment }) => {
    return (
      <View style={styles.commentBox}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUser}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={17}
                color="#F8FAFC"
              />
            </View>

            <Text style={styles.userName}>
              {comment.user_name || "میوان"}
            </Text>
          </View>

          <Text style={styles.commentDate}>
            {comment.created_at
              ? new Date(comment.created_at).toLocaleDateString(
                  "ku-IQ"
                )
              : ""}
          </Text>
        </View>

        <Text style={styles.commentText}>
          {comment.comment_text}
        </Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => handleStartEdit(comment)}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color="#94A3B8"
            />

            <Text style={styles.commentActionText}>
              دەستکاری
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => handleDeleteComment(comment.id)}
          >
            <Ionicons
              name="trash-outline"
              size={17}
              color="#F87171"
            />

            <Text
              style={[
                styles.commentActionText,
                { color: "#F87171" },
              ]}
            >
              سڕینەوە
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================
  // UI
  // =========================

  return (
    <View style={styles.container}>
      {item?.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImage}>
          <Ionicons
            name="image-outline"
            size={45}
            color="#64748B"
          />

          <Text style={styles.noImageText}>
            وێنە بەردەست نییە
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {item?.title ? (
          <Text style={styles.title}>{item.title}</Text>
        ) : null}

        {item?.description ? (
          <Text style={styles.description}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.actionRow}>
          {/* LIKE */}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleLike}
            disabled={loadingLikes}
          >
            {loadingLikes ? (
              <ActivityIndicator
                size="small"
                color="#F59E0B"
              />
            ) : (
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#F87171" : "#F8FAFC"}
              />
            )}

            <Text style={styles.actionText}>
              {likesCount}
            </Text>
          </TouchableOpacity>

          {/* COMMENTS */}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments((prev) => !prev)}
          >
            <Ionicons
              name={
                showComments
                  ? "chatbubble"
                  : "chatbubble-outline"
              }
              size={22}
              color="#F8FAFC"
            />

            <Text style={styles.actionText}>
              {comments.length}
            </Text>
          </TouchableOpacity>
        </View>

        {showComments && (
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              کۆمێنتەکان
            </Text>

            {loadingComments ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="small"
                  color="#F59E0B"
                />

                <Text style={styles.loadingText}>
                  کۆمێنتەکان بار دەکرێن...
                </Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={30}
                  color="#64748B"
                />

                <Text style={styles.emptyText}>
                  هێشتا هیچ کۆمێنتێک نییە.
                </Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(comment, index) =>
                  String(comment.id || index)
                }
                renderItem={renderComment}
                scrollEnabled={false}
              />
            )}

            <View style={styles.commentForm}>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder="ناوت"
                placeholderTextColor="#64748B"
                style={styles.nameInput}
                textAlign="right"
              />

              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="کۆمێنتەکەت بنووسە..."
                placeholderTextColor="#64748B"
                style={styles.commentInput}
                multiline
                textAlign="right"
              />

              <View style={styles.formButtons}>
                {editingCommentId && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <Ionicons
                      name="close-outline"
                      size={19}
                      color="#94A3B8"
                    />

                    <Text style={styles.cancelButtonText}>
                      هەڵوەشاندنەوە
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSaveComment}
                  disabled={savingComment}
                >
                  {savingComment ? (
                    <ActivityIndicator
                      size="small"
                      color="#0B1329"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name={
                          editingCommentId
                            ? "checkmark-outline"
                            : "send-outline"
                        }
                        size={19}
                        color="#0B1329"
                      />

                      <Text style={styles.sendButtonText}>
                        {editingCommentId
                          ? "نوێکردنەوە"
                          : "ناردن"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111C33",
    borderRadius: 16,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#263B70",
  },

  image: {
    width: "100%",
    height: 240,
    backgroundColor: "#0B1329",
  },

  noImage: {
    width: "100%",
    height: 240,
    backgroundColor: "#0B1329",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  content: {
    padding: 14,
  },

  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 7,
  },

  description: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "right",
    marginBottom: 10,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: "#263B70",
    paddingTop: 12,
    marginTop: 5,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },

  actionText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },

  commentsSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#263B70",
    paddingTop: 14,
  },

  commentsTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 12,
  },

  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },

  loadingText: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },

  emptyComments: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },

  emptyText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },

  commentBox: {
    backgroundColor: "#0B1329",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#172554",
  },

  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  commentUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#263B70",
    alignItems: "center",
    justifyContent: "center",
  },

  userName: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },

  commentDate: {
    color: "#64748B",
    fontSize: 11,
  },

  commentText: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "right",
  },

  commentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 18,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#172554",
  },

  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  commentActionText: {
    color: "#94A3B8",
    fontSize: 12,
  },

  commentForm: {
    marginTop: 12,
    backgroundColor: "#0B1329",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#263B70",
  },

  nameInput: {
    backgroundColor: "#111C33",
    borderWidth: 1,
    borderColor: "#263B70",
    borderRadius: 10,
    color: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 9,
  },

  commentInput: {
    backgroundColor: "#111C33",
    borderWidth: 1,
    borderColor: "#263B70",
    borderRadius: 10,
    color: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 85,
    textAlignVertical: "top",
  },

  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 9,
    marginTop: 10,
  },

  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 90,
  },

  sendButtonText: {
    color: "#0B1329",
    fontSize: 13,
    fontWeight: "700",
  },

  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#263B70",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  cancelButtonText: {
    color: "#94A3B8",
    fontSize: 12,
  },
});