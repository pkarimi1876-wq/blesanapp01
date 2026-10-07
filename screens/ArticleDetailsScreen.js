
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export default function ArticleDetailsScreen({
  route,
  navigation,
}) {
  const { article, writer } = route.params || {};

  const [currentArticle, setCurrentArticle] = useState(article);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [userName, setUserName] = useState("");

  const [loadingComments, setLoadingComments] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState(false);

 const loadComments = useCallback(
  async () => {
    try {
      setLoadingComments(true);

      const { data, error } = await supabase
        .from("article_comments")
        .select("*")
        .eq("article_id", currentArticle.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.log("COMMENTS ERROR:", error);
        throw error;
      }

      setComments(data || []);
    } catch (error) {
      console.log("LOAD COMMENTS ERROR:", error);

      Alert.alert(
        "هەڵە",
        "کۆمێنتەکان نەهێنران."
      );
    } finally {
      setLoadingComments(false);
    }
  },
  [currentArticle?.id]
);

useEffect(() => {
  if (currentArticle?.id) {
    loadComments();
  }
}, [currentArticle?.id, loadComments]);

  // =========================
  // EDIT
  // =========================

  const editArticle = () => {
    navigation.navigate("EditArticle", {
      article: currentArticle,
      writer,
    });
  };

  // =========================
  // DELETE
  // =========================

  const askDeleteArticle = () => {
    Alert.alert(
      "سڕینەوەی وتار",
      "دڵنیایت دەتەوێت ئەم وتارە بسڕیتەوە؟\nئەم کردارە ناگەڕێتەوە.",
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ، بیسڕەوە",
          style: "destructive",
          onPress: deleteArticle,
        },
      ]
    );
  };

  const deleteArticle = async () => {
    if (!currentArticle?.id) {
      return;
    }

    try {
      setDeletingArticle(true);

      let query = supabase
        .from("articles")
        .delete()
        .eq("id", currentArticle.id);

      // ئەگەر writer.id هەبێت،
      // سڕینەوە تەنها بۆ بابەتی ئەو نووسەرە دەبێت.
      if (writer?.id) {
        query = query.eq(
          "writer_id",
          writer.id
        );
      }

      const { error } = await query;

      if (error) {
        console.log(
          "DELETE ARTICLE ERROR:",
          error
        );

        throw error;
      }

      Alert.alert(
        "سڕایەوە",
        "وتارەکە بە سەرکەوتوویی سڕایەوە.",
        [
          {
            text: "باشە",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        "DELETE ARTICLE ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        "نەتوانرا وتارەکە بسڕدرێتەوە."
      );
    } finally {
      setDeletingArticle(false);
    }
  };

  // =========================
  // NO ARTICLE
  // =========================

  if (!currentArticle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={50}
            color="#999"
          />

          <Text style={styles.emptyTitle}>
            وتارەکە نەدۆزرایەوە
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>
              گەڕانەوە
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = currentArticle.created_at
    ? new Date(
        currentArticle.created_at
      ).toLocaleDateString("ku-IQ")
    : "";

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonTop}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          خوێندنەوەی وتار
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ARTICLE HEADER */}

        <View style={styles.articleHeader}>
          <Text style={styles.title}>
            {currentArticle.title ||
              "بێ ناونیشان"}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.category}>
              {currentArticle.category ||
                "گشتی"}
            </Text>

            {formattedDate ? (
              <Text style={styles.date}>
                {formattedDate}
              </Text>
            ) : null}
          </View>
        </View>

        {/* WRITER */}

        <View style={styles.writerBox}>
          <Ionicons
            name="person-circle-outline"
            size={30}
            color="#588157"
          />

          <View style={styles.writerInfo}>
            <Text style={styles.writerLabel}>
              نووسەر
            </Text>

            <Text style={styles.writerName}>
              {writer?.full_name ||
                writer?.name ||
                "ناوی نووسەر"}
            </Text>
          </View>
        </View>

        {/* ARTICLE CONTENT */}

        <View style={styles.contentCard}>
          <Text style={styles.articleContent}>
            {currentArticle.content ||
              "هیچ دەقێک بۆ ئەم وتارە تۆمار نەکراوە."}
          </Text>
        </View>

        {/* AUTHOR CONTROLS */}

        {writer?.id &&
        currentArticle?.writer_id === writer.id ? (
          <View style={styles.managementCard}>
            <View style={styles.managementHeader}>
              <Ionicons
                name="settings-outline"
                size={19}
                color="#2C402E"
              />

              <Text style={styles.managementTitle}>
                بەڕێوەبردنی وتار
              </Text>
            </View>

            <Text style={styles.managementText}>
              دەتوانیت ئەم وتارە دەستکاری یان
              بسڕیتەوە.
            </Text>

            <View style={styles.managementButtons}>
              {/* EDIT */}

              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.8}
                onPress={editArticle}
              >
                <Ionicons
                  name="create-outline"
                  size={19}
                  color="#FFF"
                />

                <Text style={styles.editButtonText}>
                  دەستکاری
                </Text>
              </TouchableOpacity>

              {/* DELETE */}

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  deletingArticle &&
                    styles.deleteButtonDisabled,
                ]}
                activeOpacity={0.8}
                disabled={deletingArticle}
                onPress={askDeleteArticle}
              >
                {deletingArticle ? (
                  <ActivityIndicator
                    size="small"
                    color="#B42318"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color="#B42318"
                    />

                    <Text
                      style={
                        styles.deleteButtonText
                      }
                    >
                      سڕینەوە
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* COMMENTS HEADER */}

        <View style={styles.commentsHeader}>
          <Text style={styles.commentsCount}>
            {comments.length} کۆمێنت
          </Text>

          <Text style={styles.commentsTitle}>
            💬 کۆمێنتەکان
          </Text>
        </View>

        {/* ADD COMMENT */}

        <View style={styles.commentForm}>
          <Text style={styles.formTitle}>
            کۆمێنتێک بنووسە
          </Text>

          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder="ناوت"
            placeholderTextColor="#999"
            style={styles.nameInput}
            textAlign="right"
          />

          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="کۆمێنتەکەت لێرە بنووسە..."
            placeholderTextColor="#999"
            style={styles.commentInput}
            multiline
            textAlign="right"
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              sendingComment &&
                styles.sendButtonDisabled,
            ]}
            onPress={sendComment}
            disabled={sendingComment}
          >
            {sendingComment ? (
              <ActivityIndicator
                size="small"
                color="#FFF"
              />
            ) : (
              <>
                <Ionicons
                  name="send-outline"
                  size={18}
                  color="#FFF"
                />

                <Text
                  style={styles.sendButtonText}
                >
                  ناردنی کۆمێنت
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* COMMENTS LIST */}

        <View style={styles.commentsList}>
          {loadingComments ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator
                size="small"
                color="#2C402E"
              />

              <Text style={styles.loadingText}>
                کۆمێنتەکان بار دەکرێن...
              </Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.noComments}>
              <Ionicons
                name="chatbubble-outline"
                size={38}
                color="#AAA"
              />

              <Text style={styles.noCommentsText}>
                هێشتا هیچ کۆمێنتێک نییە.
              </Text>

              <Text
                style={styles.noCommentsSubText}
              >
                یەکەم کەس بە وەڵامدانەوە
                بەشداری بکە.
              </Text>
            </View>
          ) : (
            comments.map((item) => (
              <View
                key={item.id}
                style={styles.commentCard}
              >
                <View style={styles.commentTop}>
                  <Text style={styles.commentDate}>
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleDateString(
                          "ku-IQ"
                        )
                      : ""}
                  </Text>

                  <Text style={styles.commentUser}>
                    {item.user_name}
                  </Text>
                </View>

                <Text style={styles.commentText}>
                  {item.comment}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F0",
  },

  header: {
    backgroundColor: "#2C402E",
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  backButtonTop: {
    marginRight: 12,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    padding: 16,
    paddingBottom: 50,
  },

  articleHeader: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },

  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#222",
    textAlign: "right",
    lineHeight: 34,
  },

  metaRow: {
    marginTop: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  category: {
    color: "#588157",
    fontSize: 13,
    fontWeight: "bold",
  },

  date: {
    color: "#888",
    fontSize: 12,
  },

  writerBox: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },

  writerInfo: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 10,
  },

  writerLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 3,
  },

  writerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C402E",
  },

  contentCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },

  articleContent: {
    fontSize: 16,
    color: "#444",
    lineHeight: 30,
    textAlign: "right",
  },

  /* MANAGEMENT */

  managementCard: {
    backgroundColor: "#EEF3EC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DCE6DA",
  },

  managementHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  managementTitle: {
    color: "#2C402E",
    fontSize: 15,
    fontWeight: "bold",
  },

  managementText: {
    color: "#69736B",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "right",
    marginTop: 8,
  },

  managementButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 13,
  },

  editButton: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    backgroundColor: "#2C402E",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  editButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  deleteButton: {
    flex: 0.85,
    height: 48,
    borderRadius: 11,
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: "#F1C7C3",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  deleteButtonDisabled: {
    opacity: 0.6,
  },

  deleteButtonText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "bold",
  },

  /* COMMENTS */

  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C402E",
  },

  commentsCount: {
    fontSize: 13,
    color: "#777",
  },

  commentForm: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  formTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 12,
  },

  nameInput: {
    backgroundColor: "#F5F3EE",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },

  commentInput: {
    backgroundColor: "#F5F3EE",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 110,
    fontSize: 14,
    color: "#333",
  },

  sendButton: {
    marginTop: 12,
    backgroundColor: "#2C402E",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  sendButtonDisabled: {
    opacity: 0.6,
  },

  sendButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  commentsList: {
    marginTop: 2,
  },

  commentsLoading: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 8,
    color: "#777",
    fontSize: 13,
  },

  noComments: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
  },

  noCommentsText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
    fontWeight: "bold",
  },

  noCommentsSubText: {
    marginTop: 5,
    color: "#999",
    fontSize: 12,
  },

  commentCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEE9DF",
  },

  commentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  commentUser: {
    color: "#2C402E",
    fontSize: 14,
    fontWeight: "bold",
  },

  commentDate: {
    color: "#999",
    fontSize: 11,
  },

  commentText: {
    color: "#555",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "right",
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#555",
    marginTop: 15,
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: "#2C402E",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

