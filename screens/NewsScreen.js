// screens/NewsScreen.js

import React, {
  useCallback,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import {
  Newspaper,
  ArrowRight,
  CalendarDays,
  Heart,
  MessageCircle,
  Send,
  X,
  Trash2,
} from "lucide-react-native";

import { useFocusEffect } from "@react-navigation/native";

import { COLORS } from "../constants/theme";
import { supabase } from "../lib/supabase";

const categories = [
  "هەموو",
  "ئاگاداری",
  "پڕۆژەکان",
  "کۆبوونەوە",
];

export default function NewsScreen({
  navigation,
}) {
  const [activeCategory, setActiveCategory] =
    useState("هەموو");

  const [newsList, setNewsList] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [expandedNewsId, setExpandedNewsId] =
    useState(null);

  // =====================================================
  // Social
  // =====================================================

  const [selectedNews, setSelectedNews] =
    useState(null);

  const [
    commentsModalVisible,
    setCommentsModalVisible,
  ] = useState(false);

  const [comments, setComments] =
    useState([]);

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [commentName, setCommentName] =
    useState("");

  const [commentText, setCommentText] =
    useState("");

  const [commentSending, setCommentSending] =
    useState(false);

  // =====================================================
  // Anonymous user
  // =====================================================

 const ensureUser = useCallback(
  async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      return session.user;
    }

    const { data, error } =
      await supabase.auth.signInAnonymously();

    if (error) {
      throw error;
    }

    return data.user;
  },
  []
);

  // =====================================================
  // هێنانی هەواڵەکان
  // =====================================================

 const fetchNews = useCallback(
  async () => {
    try {
      setLoading(true);

      const { data, error } =
        await supabase
          .from("news")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      const baseNews = data || [];

      if (baseNews.length === 0) {
        setNewsList([]);
        return;
      }

      const newsIds =
        baseNews.map((item) => item.id);

      const [
        likesResult,
        commentsResult,
      ] = await Promise.all([
        supabase
          .from("news_likes")
          .select(
            "id, news_id, user_id"
          )
          .in("news_id", newsIds),

        supabase
          .from("news_comments")
          .select("id, news_id")
          .in("news_id", newsIds)
          .eq("is_visible", true),
      ]);

      const likes =
        likesResult.data || [];

      const visibleComments =
        commentsResult.data || [];

      let currentUser = null;

      try {
        currentUser =
          await ensureUser();
      } catch (userError) {
        console.log(
          "NEWS USER ERROR:",
          userError
        );
      }

      const likesMap = {};
      const commentsMap = {};
      const likedMap = {};

      likes.forEach((like) => {
        likesMap[like.news_id] =
          (likesMap[like.news_id] || 0) + 1;

        if (
          currentUser &&
          like.user_id ===
            currentUser.id
        ) {
          likedMap[like.news_id] = true;
        }
      });

      visibleComments.forEach(
        (comment) => {
          commentsMap[comment.news_id] =
            (commentsMap[comment.news_id] ||
              0) + 1;
        }
      );

      const enrichedNews =
        baseNews.map((item) => ({
          ...item,
          likes_count:
            likesMap[item.id] || 0,
          comments_count:
            commentsMap[item.id] || 0,
          has_liked:
            likedMap[item.id] || false,
        }));

      setNewsList(enrichedNews);
    } catch (error) {
      console.log(
        "NewsScreen Error:",
        error.message
      );

      setNewsList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  [ensureUser]
);
  // =====================================================
  // Focus
  // =====================================================

 useFocusEffect(
  useCallback(() => {
    fetchNews();
  }, [fetchNews])
);

  // =====================================================
  // Refresh
  // =====================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  // =====================================================
  // Filter
  // =====================================================

  const filteredNews =
    activeCategory === "هەموو"
      ? newsList
      : newsList.filter(
          (item) =>
            item.category ===
            activeCategory
        );

  // =====================================================
  // Date
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString("ku");
    } catch {
      return "";
    }
  };

  // =====================================================
  // Like
  // =====================================================

  const handleToggleLike = async (
    item
  ) => {
    try {
      const user =
        await ensureUser();

      const currentlyLiked =
        !!item.has_liked;

      if (currentlyLiked) {
        const { error } =
          await supabase
            .from("news_likes")
            .delete()
            .eq(
              "news_id",
              item.id
            )
            .eq(
              "user_id",
              user.id
            );

        if (error) {
          throw error;
        }

        setNewsList((previous) =>
          previous.map((news) =>
            news.id === item.id
              ? {
                  ...news,
                  has_liked: false,
                  likes_count:
                    Math.max(
                      0,
                      (news.likes_count ||
                        0) - 1
                    ),
                }
              : news
          )
        );
      } else {
        const { error } =
          await supabase
            .from("news_likes")
            .insert({
              news_id: item.id,
              user_id: user.id,
            });

        if (error) {
          throw error;
        }

        setNewsList((previous) =>
          previous.map((news) =>
            news.id === item.id
              ? {
                  ...news,
                  has_liked: true,
                  likes_count:
                    (news.likes_count ||
                      0) + 1,
                }
              : news
          )
        );
      }
    } catch (error) {
      console.log(
        "LIKE ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        "نەتوانرا Like بگۆڕدرێت."
      );
    }
  };

  // =====================================================
  // Open Comments
  // =====================================================

  const openComments = async (
    item
  ) => {
    try {
      setSelectedNews(item);
      setCommentsModalVisible(
        true
      );
      setCommentsLoading(true);

      const { data, error } =
        await supabase
          .from("news_comments")
          .select(
            "id, news_id, user_id, user_name, comment_text, created_at"
          )
          .eq(
            "news_id",
            item.id
          )
          .eq(
            "is_visible",
            true
          )
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      setComments(data || []);
    } catch (error) {
      console.log(
        "COMMENTS FETCH ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        "کۆمێنتەکان نەهێنران."
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  // =====================================================
  // Add Comment
  // =====================================================

  const handleAddComment = async () => {
    if (!selectedNews) {
      return;
    }

    if (
      !commentName.trim()
    ) {
      Alert.alert(
        "ئاگاداری",
        "تکایە ناوت بنووسە."
      );
      return;
    }

    if (
      !commentText.trim()
    ) {
      Alert.alert(
        "ئاگاداری",
        "تکایە کۆمێنتەکە بنووسە."
      );
      return;
    }

    try {
      setCommentSending(true);

      const user =
        await ensureUser();

      const { data, error } =
        await supabase
          .from("news_comments")
          .insert({
            news_id:
              selectedNews.id,
            user_id: user.id,
            user_name:
              commentName.trim(),
            comment_text:
              commentText.trim(),
          })
          .select(
            "id, news_id, user_id, user_name, comment_text, created_at"
          )
          .single();

      if (error) {
        throw error;
      }

      setComments(
        (previous) => [
          data,
          ...previous,
        ]
      );

      setCommentText("");

      setNewsList((previous) =>
        previous.map((news) =>
          news.id ===
          selectedNews.id
            ? {
                ...news,
                comments_count:
                  (news.comments_count ||
                    0) + 1,
              }
            : news
        )
      );
    } catch (error) {
      console.log(
        "ADD COMMENT ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "کۆمێنتەکە زیاد نەکرا."
      );
    } finally {
      setCommentSending(false);
    }
  };

  // =====================================================
  // Delete Own Comment
  // =====================================================

  const handleDeleteOwnComment =
    async (comment) => {
      try {
        const user =
          await ensureUser();

        const { error } =
          await supabase
            .from("news_comments")
            .delete()
            .eq(
              "id",
              comment.id
            )
            .eq(
              "user_id",
              user.id
            );

        if (error) {
          throw error;
        }

        setComments((previous) =>
          previous.filter(
            (item) =>
              item.id !==
              comment.id
          )
        );

        if (selectedNews) {
          setNewsList(
            (previous) =>
              previous.map(
                (news) =>
                  news.id ===
                  selectedNews.id
                    ? {
                        ...news,
                        comments_count:
                          Math.max(
                            0,
                            (news.comments_count ||
                              0) - 1
                          ),
                      }
                    : news
              )
          );
        }
      } catch (error) {
        console.log(
          "DELETE COMMENT ERROR:",
          error
        );

        Alert.alert(
          "هەڵە",
          "کۆمێنتەکە نەسڕایەوە."
        );
      }
    };

  // =====================================================
  // Close Comments
  // =====================================================

  const closeCommentsModal = () => {
    setCommentsModalVisible(
      false
    );
    setSelectedNews(null);
    setComments([]);
    setCommentText("");
  };

  // =====================================================
  // Back
  // =====================================================

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(
        "Home"
      );
    }
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <ArrowRight
            color={COLORS.textMain}
            size={23}
          />
        </TouchableOpacity>

        <View
          style={styles.headerCenter}
        >
          <Newspaper
            color={COLORS.primary}
            size={24}
          />

          <Text
            style={styles.headerTitle}
          >
            هەواڵ و ئاگادارییەکان
          </Text>
        </View>

        <View
          style={styles.headerSpace}
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor={
              COLORS.primary
            }
          />
        }
      >
        {/* Categories */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={styles.catRow}
          contentContainerStyle={
            styles.catContent
          }
        >
          {categories.map(
            (cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  activeCategory ===
                    cat &&
                    styles.activeCatChip,
                ]}
                onPress={() =>
                  setActiveCategory(
                    cat
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.catText,
                    activeCategory ===
                      cat &&
                      styles.activeCatText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* Loading */}

        {loading ? (
          <View
            style={styles.loadingBox}
          >
            <ActivityIndicator
              color={
                COLORS.primary
              }
              size="large"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              هەواڵەکان
              دەهێنرێن...
            </Text>
          </View>
        ) : filteredNews.length ===
          0 ? (
          <View
            style={styles.emptyBox}
          >
            <Newspaper
              color={
                COLORS.textSub
              }
              size={42}
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              هیچ هەواڵێک نییە
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              لەم بەشەدا هێشتا
              هەواڵێک
              بڵاونەکراوەتەوە.
            </Text>
          </View>
        ) : (
          filteredNews.map(
            (item) => {
              const isExpanded =
                expandedNewsId ===
                item.id;

              return (
                <View
                  key={item.id}
                  style={
                    styles.newsCard
                  }
                >
                  {/* Image */}

                  {item.image ? (
                    <Image
                      source={{
                        uri: item.image,
                      }}
                      style={
                        styles.newsImg
                      }
                      resizeMode="cover"
                    />
                  ) : null}

                  {/* Info */}

                  <View
                    style={
                      styles.newsInfo
                    }
                  >
                    <View
                      style={
                        styles.badge
                      }
                    >
                      <Text
                        style={
                          styles.badgeText
                        }
                      >
                        {
                          item.category
                        }
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.newsTitle
                      }
                    >
                      {item.title}
                    </Text>

                    {/* Content */}

                    <TouchableOpacity
                      activeOpacity={
                        0.8
                      }
                      style={
                        styles.contentTouchable
                      }
                      onPress={() =>
                        setExpandedNewsId(
                          isExpanded
                            ? null
                            : item.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.newsContent
                        }
                        numberOfLines={
                          isExpanded
                            ? undefined
                            : 4
                        }
                      >
                        {
                          item.content
                        }
                      </Text>

                      <Text
                        style={
                          styles.readMoreText
                        }
                      >
                        {isExpanded
                          ? "کەمتر بخوێنەوە ▲"
                          : "هەمووی بخوێنەوە ▼"}
                      </Text>
                    </TouchableOpacity>

                    {/* Social */}

                    <View
                      style={
                        styles.socialRow
                      }
                    >
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          item.has_liked &&
                            styles.likedButton,
                        ]}
                        onPress={() =>
                          handleToggleLike(
                            item
                          )
                        }
                        activeOpacity={
                          0.8
                        }
                      >
                        <Heart
                          size={17}
                          color={
                            item.has_liked
                              ? "#EF4444"
                              : COLORS.textSub
                          }
                          fill={
                            item.has_liked
                              ? "#EF4444"
                              : "transparent"
                          }
                        />

                        <Text
                          style={[
                            styles.socialText,
                            item.has_liked &&
                              styles.likedText,
                          ]}
                        >
                          {
                            item.likes_count ||
                            0
                          }
                        </Text>
                      </TouchableOpacity>

                     <TouchableOpacity
  style={styles.socialButton}
  onPress={() => openComments(item)}
  activeOpacity={0.8}
>
  <MessageCircle
    size={17}
    color={COLORS.textSub}
  />

  <Text style={styles.socialText}>
    {item.comments_count || 0}
  </Text>
</TouchableOpacity>
                      

                      <View
                        style={
                          styles.socialSpacer
                        }
                      />

                      <View
                        style={
                          styles.dateRow
                        }
                      >
                        <CalendarDays
                          color={
                            COLORS.textSub
                          }
                          size={14}
                        />

                        <Text
                          style={
                            styles.newsDate
                          }
                        >
                          {formatDate(
                            item.created_at
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }
          )
        )}
      </ScrollView>

      {/* =====================================================
          Comments Modal
      ===================================================== */}

      <Modal
        visible={
          commentsModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeCommentsModal
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={
              styles.commentsModal
            }
          >
            {/* Header */}

            <View
              style={
                styles.commentsModalHeader
              }
            >
              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                onPress={
                  closeCommentsModal
                }
              >
                <X
                  size={21}
                  color={
                    COLORS.textMain
                  }
                />
              </TouchableOpacity>

              <View
                style={
                  styles.commentsHeaderCenter
                }
              >
                <MessageCircle
                  size={21}
                  color={
                    COLORS.primary
                  }
                />

                <Text
                  style={
                    styles.commentsModalTitle
                  }
                >
                  کۆمێنتەکان
                </Text>
              </View>
            </View>

            {selectedNews && (
              <Text
                style={
                  styles.selectedNewsTitle
                }
                numberOfLines={2}
              >
                {
                  selectedNews.title
                }
              </Text>
            )}

            {/* Comments */}

            <ScrollView
              style={
                styles.commentsList
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              {commentsLoading ? (
                <View
                  style={
                    styles.commentsLoading
                  }
                >
                  <ActivityIndicator
                    color={
                      COLORS.primary
                    }
                    size="large"
                  />
                </View>
              ) : comments.length ===
                0 ? (
                <View
                  style={
                    styles.noCommentsBox
                  }
                >
                  <MessageCircle
                    color={
                      COLORS.textSub
                    }
                    size={36}
                  />

                  <Text
                    style={
                      styles.noCommentsText
                    }
                  >
                    هێشتا هیچ
                    کۆمێنتێک نییە.
                  </Text>
                </View>
              ) : (
                comments.map(
                  (comment) => (
                    <View
                      key={
                        comment.id
                      }
                      style={
                        styles.commentCard
                      }
                    >
                      <View
                        style={
                          styles.commentTop
                        }
                      >
                        <Text
                          style={
                            styles.commentUser
                          }
                        >
                          {
                            comment.user_name
                          }
                        </Text>

                        <Text
                          style={
                            styles.commentDate
                          }
                        >
                          {formatDate(
                            comment.created_at
                          )}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.commentBody
                        }
                      >
                        {
                          comment.comment_text
                        }
                      </Text>

                      <TouchableOpacity
                        style={
                          styles.commentDeleteButton
                        }
                        onPress={() =>
                          handleDeleteOwnComment(
                            comment
                          )
                        }
                      >
                        <Trash2
                          size={15}
                          color="#EF4444"
                        />

                        <Text
                          style={
                            styles.commentDeleteText
                          }
                        >
                          سڕینەوە
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                )
              )}
            </ScrollView>

            {/* Add Comment */}

            <View
              style={
                styles.commentInputArea
              }
            >
              <TextInput
                style={
                  styles.commentNameInput
                }
                value={commentName}
                onChangeText={
                  setCommentName
                }
                placeholder="ناوت..."
                placeholderTextColor="#64748B"
                textAlign="right"
              />

              <View
                style={
                  styles.commentInputRow
                }
              >
                <TextInput
                  style={
                    styles.commentInput
                  }
                  value={
                    commentText
                  }
                  onChangeText={
                    setCommentText
                  }
                  placeholder="کۆمێنتەکەت بنووسە..."
                  placeholderTextColor="#64748B"
                  multiline
                  textAlign="right"
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={
                    styles.sendCommentButton
                  }
                  onPress={
                    handleAddComment
                  }
                  disabled={
                    commentSending
                  }
                  activeOpacity={
                    0.8
                  }
                >
                  {commentSending ? (
                    <ActivityIndicator
                      size="small"
                      color="#08111D"
                    />
                  ) : (
                    <Send
                      size={19}
                      color="#08111D"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// =====================================================
// Styles
// =====================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    // Header

    header: {
      height: 62,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.cardBorder,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor:
        COLORS.card,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        COLORS.cardBorder,
    },

    headerCenter: {
      flex: 1,
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    headerTitle: {
      color:
        COLORS.textMain,
      fontSize: 18,
      fontWeight:
        "bold",
    },

    headerSpace: {
      width: 40,
    },

    // Content

    scrollContent: {
      padding: 16,
      paddingBottom: 35,
    },

    // Categories

    catRow: {
      marginBottom: 20,
    },

    catContent: {
      flexDirection:
        "row-reverse",
      paddingHorizontal: 2,
    },

    catChip: {
      backgroundColor:
        COLORS.card,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 20,
      marginLeft: 8,
      borderWidth: 1,
      borderColor:
        COLORS.cardBorder,
    },

    activeCatChip: {
      backgroundColor:
        COLORS.primary,
      borderColor:
        COLORS.primary,
    },

    catText: {
      color:
        COLORS.textSub,
      fontSize: 12,
      fontWeight:
        "bold",
    },

    activeCatText: {
      color: "#000",
    },

    // News Card

    newsCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor:
        COLORS.cardBorder,
    },

    newsImg: {
      width: "100%",
      height: 190,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor:
        "#1E293B",
    },

    newsInfo: {
      width: "100%",
      alignItems:
        "flex-end",
    },

    badge: {
      backgroundColor:
        "#232E42",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 6,
    },

    badgeText: {
      color:
        COLORS.primary,
      fontSize: 10,
      fontWeight:
        "bold",
    },

    newsTitle: {
      width: "100%",
      color:
        COLORS.textMain,
      fontSize: 14,
      fontWeight:
        "bold",
      textAlign:
        "right",
      lineHeight: 21,
    },

    contentTouchable: {
      width: "100%",
      alignSelf:
        "stretch",
    },

    newsContent: {
      width: "100%",
      color:
        COLORS.textSub,
      fontSize: 12,
      textAlign:
        "right",
      lineHeight: 20,
      marginTop: 5,
    },

    readMoreText: {
      width: "100%",
      color:
        COLORS.primary,
      fontSize: 11,
      fontWeight:
        "bold",
      textAlign:
        "right",
      marginTop: 6,
    },

    // Social

    socialRow: {
      width: "100%",
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      marginTop: 10,
    },

    socialButton: {
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 9,
      backgroundColor:
        "#172235",
      marginLeft: 7,
    },

    likedButton: {
      backgroundColor:
        "#321A22",
    },

    socialText: {
      color:
        COLORS.textSub,
      fontSize: 11,
      fontWeight:
        "bold",
    },

    likedText: {
      color: "#EF4444",
    },

    socialSpacer: {
      flex: 1,
    },

    dateRow: {
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      gap: 5,
    },

    newsDate: {
      color:
        COLORS.textSub,
      fontSize: 10,
    },

    // Loading

    loadingBox: {
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingVertical: 60,
    },

    loadingText: {
      color:
        COLORS.textSub,
      fontSize: 12,
      marginTop: 12,
    },

    // Empty

    emptyBox: {
      backgroundColor:
        COLORS.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        COLORS.cardBorder,
      padding: 35,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      color:
        COLORS.textMain,
      fontSize: 16,
      fontWeight:
        "bold",
      marginTop: 12,
    },

    emptyText: {
      color:
        COLORS.textSub,
      fontSize: 12,
      textAlign:
        "center",
      marginTop: 7,
      lineHeight: 20,
    },

    // Comments Modal

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.72)",
      justifyContent:
        "flex-end",
    },

    commentsModal: {
      width: "100%",
      maxHeight: "88%",
      backgroundColor:
        COLORS.background,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },

    commentsModalHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.cardBorder,
    },

    modalCloseButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor:
        COLORS.card,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    commentsHeaderCenter: {
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      gap: 7,
    },

    commentsModalTitle: {
      color:
        COLORS.textMain,
      fontSize: 17,
      fontWeight:
        "bold",
    },

    selectedNewsTitle: {
      color:
        COLORS.textSub,
      fontSize: 12,
      textAlign:
        "right",
      lineHeight: 19,
      marginTop: 10,
      marginBottom: 8,
    },

    commentsList: {
      maxHeight: 380,
    },

    commentsLoading: {
      paddingVertical: 40,
      alignItems:
        "center",
    },

    noCommentsBox: {
      alignItems:
        "center",
      paddingVertical: 35,
    },

    noCommentsText: {
      color:
        COLORS.textSub,
      fontSize: 12,
      marginTop: 9,
    },

    commentCard: {
      backgroundColor:
        COLORS.card,
      borderWidth: 1,
      borderColor:
        COLORS.cardBorder,
      borderRadius: 13,
      padding: 11,
      marginBottom: 9,
    },

    commentTop: {
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    commentUser: {
      color:
        COLORS.textMain,
      fontSize: 12,
      fontWeight:
        "bold",
    },

    commentDate: {
      color:
        COLORS.textSub,
      fontSize: 9,
    },

    commentBody: {
      color:
        COLORS.textSub,
      fontSize: 12,
      textAlign:
        "right",
      lineHeight: 20,
      marginTop: 7,
    },

    commentDeleteButton: {
      alignSelf:
        "flex-start",
      flexDirection:
        "row-reverse",
      alignItems:
        "center",
      gap: 4,
      marginTop: 7,
    },

    commentDeleteText: {
      color: "#EF4444",
      fontSize: 10,
      fontWeight:
        "bold",
    },

    commentInputArea: {
      borderTopWidth: 1,
      borderTopColor:
        COLORS.cardBorder,
      paddingTop: 10,
      marginTop: 8,
    },

    commentNameInput: {
      width: "100%",
      minHeight: 42,
      backgroundColor:
        COLORS.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor:
        COLORS.cardBorder,
      paddingHorizontal: 12,
      color:
        COLORS.textMain,
      fontSize: 12,
      marginBottom: 8,
    },

    commentInputRow: {
      flexDirection:
        "row-reverse",
      alignItems:
        "flex-end",
      gap: 8,
    },

    commentInput: {
      flex: 1,
      minHeight: 48,
      maxHeight: 105,
      backgroundColor:
        COLORS.card,
      borderRadius: 11,
      borderWidth: 1,
      borderColor:
        COLORS.cardBorder,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color:
        COLORS.textMain,
      fontSize: 12,
    },

    sendCommentButton: {
      width: 48,
      height: 48,
      borderRadius: 11,
      backgroundColor:
        COLORS.primary,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
  });