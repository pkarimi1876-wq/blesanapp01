
import React, { useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import GalleryItem from "../Components/GalleryItem"
const { width, height } = Dimensions.get("window");

export default function GalleryScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("GALLERY ERROR:", error);
        setPhotos([]);
        return;
      }

      setPhotos(data || []);
    } catch (error) {
      console.log("GALLERY LOAD ERROR:", error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const renderPhoto = ({ item, index }) => {
    const isFeatured = index === 0;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedPhoto(item)}
        style={[
          styles.photoCard,
          isFeatured && styles.featuredCard,
        ]}
      >
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={[
              styles.photo,
              isFeatured && styles.featuredPhoto,
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="image-outline"
              size={40}
              color="#64748B"
            />
          </View>
        )}

        <View style={styles.photoOverlay} />

        <View style={styles.photoInfo}>
          <Text
            style={styles.photoTitle}
            numberOfLines={2}
          >
            {item.title || "وێنەی بڵەسەن"}
          </Text>

          {item.description ? (
            <Text
              style={styles.photoDescription}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.viewIcon}>
          <Ionicons
            name="expand-outline"
            size={18}
            color="#fff"
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-forward"
              size={23}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              وێنەخانە
            </Text>

            <Text style={styles.headerSubtitle}>
              بیرەوەرییەکانی بڵەسەن
            </Text>
          </View>

          <View style={styles.headerPlaceholder} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="images-outline"
              size={30}
              color="#F59E0B"
            />
          </View>

          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              وێنەخانەی بڵەسەن
            </Text>

            <Text style={styles.heroText}>
              بیرەوەرییەکانمان، بە وێنە دەژین.
            </Text>
          </View>

          <View style={styles.photoCount}>
            <Text style={styles.photoCountNumber}>
              {photos.length}
            </Text>

            <Text style={styles.photoCountLabel}>
              وێنە
            </Text>
          </View>
        </View>

        {photos.length > 0 ? (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />

            <Text style={styles.sectionTitle}>
              نوێترین وێنەکان
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="images-outline"
            size={46}
            color="#64748B"
          />
        </View>

        <Text style={styles.emptyTitle}>
          هێشتا وێنەیەک نییە
        </Text>

        <Text style={styles.emptyText}>
          وێنە و بیرەوەرییە نوێکان لەم بەشەدا
          پیشان دەدرێن.
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadGallery}
          activeOpacity={0.8}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color="#fff"
          />

          <Text style={styles.refreshText}>
            دووبارە هەوڵدانەوە
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B1329"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="images-outline"
              size={34}
              color="#F59E0B"
            />
          </View>

          <ActivityIndicator
            size="small"
            color="#F59E0B"
          />

          <Text style={styles.loadingText}>
            وێنەخانە خەریکی بارکردنە...
          </Text>
        </View>
      ) : (
       <FlatList
  data={photos}
  keyExtractor={(item, index) => String(item.id || index)}
  renderItem={({ item }) => <GalleryItem item={item} />}
  ListHeaderComponent={renderHeader}
  showsVerticalScrollIndicator={false}
  refreshing={loading}
  onRefresh={loadGallery}
/>
      )}

      

      {/* Full Screen Viewer */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.viewerContainer}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#000"
          />

          <TouchableOpacity
            style={styles.closeViewer}
            onPress={() => setSelectedPhoto(null)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="close"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          {selectedPhoto ? (
            <>
              {selectedPhoto.image_url ? (
                <Image
                  source={{
                    uri: selectedPhoto.image_url,
                  }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.fullImagePlaceholder}>
                  <Ionicons
                    name="image-outline"
                    size={60}
                    color="#64748B"
                  />
                </View>
              )}

              <View style={styles.viewerInfo}>
                <Text style={styles.viewerTitle}>
                  {selectedPhoto.title ||
                    "وێنەی بڵەسەن"}
                </Text>

                {selectedPhoto.description ? (
                  <Text style={styles.viewerDescription}>
                    {selectedPhoto.description}
                  </Text>
                ) : null}

                {selectedPhoto.created_at ? (
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={15}
                      color="#94A3B8"
                    />

                    <Text style={styles.dateText}>
                      {new Date(
                        selectedPhoto.created_at
                      ).toLocaleDateString("ku-IQ")}
                    </Text>
                  </View>
                ) : null}
              </View>
            </>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1329",
  },

  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#172554",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#263B70",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 3,
  },

  headerPlaceholder: {
    width: 44,
  },

  

  heroCard: {
    minHeight: 118,
    borderRadius: 22,
    backgroundColor: "#111C33",
    borderWidth: 1,
    borderColor: "#263B70",
    padding: 17,
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 22,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#1C2948",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 13,
  },

  heroTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },

  heroText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 6,
    textAlign: "right",
  },

  photoCount: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 52,
    paddingRight: 10,
  },

  photoCountNumber: {
    color: "#F59E0B",
    fontSize: 22,
    fontWeight: "900",
  },

  photoCountLabel: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionTitle: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "800",
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1E293B",
    marginRight: 12,
  },


  photoCard: {
    width: (width - 43) / 2,
    height: 205,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111C33",
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#263B70",
  },

  featuredCard: {
    width: "100%",
    height: 260,
    marginBottom: 13,
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  featuredPhoto: {
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111C33",
  },

  photoOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 105,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  photoInfo: {
    position: "absolute",
    bottom: 13,
    left: 13,
    right: 13,
    alignItems: "flex-end",
  },

  photoTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },

  photoDescription: {
    color: "#CBD5E1",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },

  viewIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#111C33",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  loadingText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: "#111C33",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#263B70",
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  emptyText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20,
  },

  refreshButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#1E3A8A",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  refreshText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  viewerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },

  closeViewer: {
    position: "absolute",
    top: 48,
    right: 18,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  fullImage: {
    width: width,
    height: height * 0.68,
  },

  fullImagePlaceholder: {
    width: width,
    height: height * 0.68,
    alignItems: "center",
    justifyContent: "center",
  },

  viewerInfo: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 35,
    alignItems: "flex-end",
  },

  viewerTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "right",
  },

  viewerDescription: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "right",
    marginTop: 7,
  },

  dateRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 10,
    gap: 5,
  },

  dateText: {
    color: "#94A3B8",
    fontSize: 10,
  },
});

