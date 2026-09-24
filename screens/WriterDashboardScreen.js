
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import {
  ArrowRight,
  Plus,
  FileText,
  ChevronLeft,
  Settings,
} from "lucide-react-native";

import { COLORS } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function WriterDashboardScreen({
  navigation,
  route,
}) {
  const writer = route?.params?.writer || {};

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =========================
  // بارکردنی بابەتەکانی نووسەر
  // =========================
  const loadArticles = useCallback(
  async (isRefresh = false) => {
    if (!writer.id) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("writer_id", writer.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setArticles(data || []);
    } catch (error) {
      console.error(
        "Load writer articles error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  [writer?.id]
);

  // هەر جارێک پەڕەکە دەکرێتەوە، بابەتەکان نوێ دەکرێنەوە
 useFocusEffect(
  useCallback(() => {
    loadArticles();
  }, [loadArticles])
);
  // =========================
  // ڕێکخستنی بەروار
  // =========================
  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    return d.toLocaleDateString("ku-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =========================
  // نیشاندانی هەر بابەتێک
  // =========================
  const renderArticle = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.articleCard}
        onPress={() => {
          navigation.navigate("ArticleDetails", {
            article: item,
            writer,
          });
        }}
      >
        <View style={styles.articleIcon}>
          <FileText
            size={20}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.articleInfo}>
          <Text
            style={styles.articleTitle}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text style={styles.articleDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>

        <ChevronLeft
          size={19}
          color="#89938C"
        />
      </TouchableOpacity>
    );
  };

  // =========================
  // سەرپەڕەی لیستی بابەتەکان
  // =========================
  const ListHeader = () => (
    <>
      <View style={styles.header}>
        {/* گەڕانەوە */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <ArrowRight
            size={21}
            color="#26332A"
          />
        </TouchableOpacity>

        {/* ناونیشان */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            بەڕێوەبردنی نووسینەکان
          </Text>

          <Text style={styles.headerSubtitle}>
            هەموو بابەتەکانی تۆ
          </Text>
        </View>

        {/* دوگمەی ڕێکخستن / گۆڕینی وشەی نهێنی */}
        <TouchableOpacity
          style={styles.headerSettings}
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate("ChangePassword")
          }
        >
          <Settings
            size={21}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* =========================
          کارتی نووسەر
         ========================= */}
      <View style={styles.writerCard}>
        <View style={styles.writerAvatar}>
          <Text style={styles.writerAvatarText}>
            {(
              writer.name ||
              writer.full_name ||
              "ن"
            )[0]}
          </Text>
        </View>

        <View style={styles.writerInfo}>
          <Text style={styles.writerName}>
            {writer.name ||
              writer.full_name ||
              "نووسەر"}
          </Text>

          <Text style={styles.writerUsername}>
            @{writer.username || "writer"}
          </Text>
        </View>

        <View style={styles.countBox}>
          <Text style={styles.countNumber}>
            {articles.length}
          </Text>

          <Text style={styles.countLabel}>
            بابەت
          </Text>
        </View>
      </View>

      {/* =========================
          ناونیشانی بابەتەکان
         ========================= */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionCount}>
          {articles.length} بابەت
        </Text>

        <Text style={styles.sectionTitle}>
          نووسینەکانم
        </Text>
      </View>
    </>
  );

  // =========================
  // کاتێک هیچ بابەتێک نییە
  // =========================
  const EmptyState = () => (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIcon}>
        <FileText
          size={27}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        هێشتا هیچ بابەتێکت نییە
      </Text>

      <Text style={styles.emptyText}>
        یەکەم بابەتەکەت بنووسە و بڵاوی بکەرەوە.
      </Text>

      <TouchableOpacity
        style={styles.emptyButton}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("CreateArticle", {
            writer,
          })
        }
      >
        <Plus
          size={18}
          color="#FFFFFF"
        />

        <Text style={styles.emptyButtonText}>
          نووسینی بابەتی نوێ
        </Text>
      </TouchableOpacity>
    </View>
  );

  // =========================
  // شاشەی سەرەکی
  // =========================
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            بابەتەکان بار دەکرێن...
          </Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) =>
            String(item.id)
          }
          renderItem={renderArticle}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            articles.length === 0
              ? styles.emptyList
              : styles.content
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                loadArticles(true)
              }
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      {/* =========================
          دوگمەی بابەتی نوێ
         ========================= */}
      {!loading && articles.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("CreateArticle", {
              writer,
            })
          }
        >
          <Plus
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.floatingText}>
            بابەتی نوێ
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F3",
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 40,
    paddingBottom: 110,
  },

  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 17,
    paddingTop: 40,
    paddingBottom: 40,
  },

  // =========================
  // Header
  // =========================

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E4E0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  headerTitle: {
    color: "#18221C",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
  },

  headerSubtitle: {
    color: "#68756D",
    fontSize: 11,
    marginTop: 3,
    textAlign: "right",
  },

  // =========================
  // Settings button
  // =========================

  headerSettings: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4DE",
    alignItems: "center",
    justifyContent: "center",

    // Shadow
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  // =========================
  // Writer card
  // =========================

  writerCard: {
    backgroundColor: "#EAF0EB",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  writerAvatar: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  writerAvatarText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  writerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  writerName: {
    color: "#253129",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  writerUsername: {
    color: "#718078",
    fontSize: 10,
    marginTop: 3,
    textAlign: "right",
  },

  countBox: {
    minWidth: 52,
    alignItems: "center",
  },

  countNumber: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  countLabel: {
    color: "#718078",
    fontSize: 9,
    marginTop: 1,
  },

  // =========================
  // Section
  // =========================

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#202B23",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
  },

  sectionCount: {
    color: "#7A847D",
    fontSize: 10,
  },

  // =========================
  // Article card
  // =========================

  articleCard: {
    backgroundColor: "#FFFFFF",
    minHeight: 76,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDE2DE",
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  articleIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#EEF3EF",
    alignItems: "center",
    justifyContent: "center",
  },

  articleInfo: {
    flex: 1,
    marginHorizontal: 11,
  },

  articleTitle: {
    color: "#26332A",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "right",
  },

  articleDate: {
    color: "#8A938D",
    fontSize: 9,
    marginTop: 5,
    textAlign: "right",
  },

  // =========================
  // Empty state
  // =========================

  emptyBox: {
    flex: 1,
    minHeight: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#DDE2DE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#EAF0EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    color: "#26332A",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyText: {
    color: "#7A847D",
    fontSize: 11,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 18,
  },

  emptyButton: {
    height: 45,
    paddingHorizontal: 17,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  // =========================
  // Floating button
  // =========================

  floatingButton: {
    position: "absolute",
    left: 17,
    right: 17,
    bottom: 20,
    height: 53,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  floatingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // =========================
  // Loading
  // =========================

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#718078",
    fontSize: 11,
    marginTop: 10,
  },
});

