import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export default function WriterProfileScreen({ route, navigation }) {
  const { writerId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [writer, setWriter] = useState(null);
  const [articles, setArticles] = useState([]);

  const loadData = useCallback(async () => {
  try {
    setLoading(true);

    // 1. هێنانی نووسەر
    const { data: writerData, error: writerError } =
      await supabase
        .from("writers")
        .select("*")
        .eq("id", writerId)
        .single();

    if (writerError) {
      console.log("WRITER ERROR:", writerError);
      throw writerError;
    }

    setWriter(writerData);

    // 2. هێنانی وتارەکانی نووسەر
    const { data: articleData, error: articleError } =
      await supabase
        .from("articles")
        .select("*")
        .eq("writer_id", writerId)
        .order("created_at", {
          ascending: false,
        });

    console.log("WRITER ID:", writerId);
    console.log("ARTICLE DATA:", articleData);
    console.log("ARTICLE ERROR:", articleError);

    if (articleError) {
      Alert.alert(
        "هەڵەی وتار",
        articleError.message
      );
      setArticles([]);
    } else {
      setArticles(articleData || []);
    }
  } catch (error) {
    console.log("PROFILE ERROR:", error);

    Alert.alert(
      "هەڵە",
      "زانیارییەکانی نووسەر نەهاتن."
    );
  } finally {
    setLoading(false);
  }
}, [writerId]);

useEffect(() => {
  loadData();
}, [loadData]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2C402E" />
        <Text style={styles.loadingText}>
          چاوەڕوان بە...
        </Text>
      </View>
    );
  }

  if (!writer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            پڕۆفایلی نووسەر نەدۆزرایەوە
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>
              گەڕانەوە
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          پڕۆفایلی نووسەر
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* پڕۆفایلی نووسەر */}
        <View style={styles.profileCard}>

          <Image
            source={{
              uri:
                writer.avatar_url ||
                writer.image_url ||
                "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>
            {writer.full_name || "ناوی نووسەر"}
          </Text>

          <Text style={styles.field}>
            {writer.field_of_work || "نووسەر"}
          </Text>

          <Text style={styles.bio}>
            {writer.bio ||
              "هیچ زانیارییەک لەبارەی ئەم نووسەرەوە نییە."}
          </Text>

        </View>

        {/* ژمارەی وتارەکان */}
        <View style={styles.articleHeader}>
          <Text style={styles.articleCount}>
            {articles.length} وتار
          </Text>

          <Text style={styles.articleTitle}>
            نووسینەکانی {writer.full_name}
          </Text>
        </View>

        {/* وتارەکان */}
        {articles.length === 0 ? (

          <View style={styles.noArticle}>
            <Ionicons
              name="document-text-outline"
              size={45}
              color="#999"
            />

            <Text style={styles.noArticleText}>
              هێشتا هیچ وتارێک بڵاونەکراوەتەوە.
            </Text>
          </View>

        ) : (

          articles.map((article) => (
  <TouchableOpacity
    key={article.id}
    style={styles.articleCard}
    activeOpacity={0.8}
    onPress={() =>
      navigation.navigate("ArticleDetails", {
        article,
        writer,
      })
    }
  >
    <Text style={styles.title}>
      {article.title || "بێ ناونیشان"}
    </Text>

    <Text style={styles.category}>
      {article.category || "گشتی"}
    </Text>

    <Text style={styles.contentText} numberOfLines={4}>
      {article.content || ""}
    </Text>

    <Text style={styles.readMore}>
      خوێندنەوەی تەواوی وتار ←
    </Text>
  </TouchableOpacity>
))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F0",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F6F0",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  header: {
    backgroundColor: "#2C402E",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: "#DDD",
    marginBottom: 12,
  },

  name: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
  },

  field: {
    color: "#588157",
    marginTop: 5,
  },

  bio: {
    marginTop: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
  },

  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  articleTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C402E",
  },

  articleCount: {
    fontSize: 13,
    color: "#777",
  },

  articleCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    textAlign: "right",
  },

  category: {
    color: "#588157",
    fontSize: 12,
    marginTop: 7,
    textAlign: "right",
  },

  contentText: {
    marginTop: 12,
    color: "#555",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "right",
  },

  noArticle: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
  },

  noArticleText: {
    marginTop: 12,
    color: "#777",
    textAlign: "center",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: "#2C402E",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  
  backText: {
    color: "#FFF",
    fontWeight: "bold",
  },
readMore: {
  marginTop: 12,
  color: "#2C402E",
  fontSize: 13,
  fontWeight: "bold",
  textAlign: "right",
},

});