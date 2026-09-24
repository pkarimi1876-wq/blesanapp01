import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "../lib/supabase";

const ROTATE_MS = 5000;

const FALLBACK_POSITIONS = [
  "center",
  "center",
  "center",
  "center",
];

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

const normalizeSlidesFromJson = (slides) => {
  if (!Array.isArray(slides)) {
    return [];
  }

  return slides
    .map((slide) => {
      if (!slide || typeof slide !== "object") {
        return null;
      }

      const text = String(
        slide.text ??
          slide.content ??
          slide.title ??
          ""
      ).trim();

      const imageUrl = String(
        slide.image_url ??
          slide.imageUrl ??
          ""
      ).trim();

      const position =
        slide.position ||
        slide.text_position ||
        "center";

      return {
        text,
        image_url: imageUrl,
        position,
      };
    })
    .filter((slide) => slide && slide.text);
};

const normalizeSlidesFromColumns = (ad) => {
  const slides = [];

  for (let i = 1; i <= 4; i += 1) {
    let text = "";

    if (i === 1) {
      text = String(ad?.title || "").trim();
    } else if (i === 2) {
      text = String(ad?.description || "").trim();
    } else if (i === 3) {
      text = String(ad?.address || "").trim();
    } else if (i === 4) {
      text = String(ad?.contact_phone || "").trim();
    }

    if (!text) {
      continue;
    }

    slides.push({
      text,
      image_url:
        String(ad?.image_url || "").trim(),
      position:
        ad?.[`text_position_${i}`] ||
        FALLBACK_POSITIONS[i - 1] ||
        "center",
    });
  }

  return slides;
};

const getAdSlides = (ad) => {
  const jsonSlides = normalizeSlidesFromJson(
    ad?.slides
  );

  if (jsonSlides.length > 0) {
    return jsonSlides;
  }

  return normalizeSlidesFromColumns(ad);
};

export default function AdBanner({
  navigation,
}) {
  const [ad, setAd] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveAd = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const {
          data,
          error,
        } = await supabase
          .from("ads")
          .select(`
  id,
  title,
  description,
  image_url,
  link_url,
  address,
  contact_phone,
  is_active,
  created_at,
  text_position_1,
  text_position_2,
  text_position_3,
  text_position_4
`)
          .eq("is_active", true)
          .order("created_at", {
            ascending: false,
          })
          .limit(1);

        if (error) {
          console.log(
            "FETCH ACTIVE AD ERROR:",
            error
          );

          setAd(null);
          setSlideIndex(0);
          return;
        }

        const activeAd =
          Array.isArray(data) && data.length > 0
            ? data[0]
            : null;

        setAd(activeAd);
        setSlideIndex(0);
      } catch (error) {
        console.log(
          "FETCH ACTIVE AD EXCEPTION:",
          error
        );

        setAd(null);
        setSlideIndex(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchActiveAd(true);
  }, [fetchActiveAd]);

  useFocusEffect(
    useCallback(() => {
      fetchActiveAd(false);
    }, [fetchActiveAd])
  );

  const slides = useMemo(() => {
    return getAdSlides(ad);
  }, [ad]);

  useEffect(() => {
    if (!ad || slides.length <= 1) {
      setSlideIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setSlideIndex(
        (previous) =>
          (previous + 1) % slides.length
      );
    }, ROTATE_MS);

    return () => {
      clearInterval(timer);
    };
  }, [ad, slides.length]);

  useEffect(() => {
    if (slideIndex >= slides.length) {
      setSlideIndex(0);
    }
  }, [slideIndex, slides.length]);

  const currentSlide =
    slides[slideIndex] || null;

  const imageUrl =
    currentSlide?.image_url ||
    String(ad?.image_url || "").trim();

  const position =
    currentSlide?.position || "center";

  const positionStyle =
    getPositionStyle(position);

  const handlePress = () => {
    // تەبلیغ هەیە → هیچ کارێک مەکە
    if (ad && slides.length > 0) {
      return;
    }

    // هیچ تەبلیغێک نییە → بچۆ بۆ پەیوەندی
    navigation?.navigate("AdContact");
  };

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <ActivityIndicator
            size="small"
            color="#f59e0b"
          />
        </View>
      </View>
    );
  }

  const hasAd =
    !!ad && slides.length > 0;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={hasAd ? 1 : 0.85}
        onPress={handlePress}
        disabled={refreshing}
        style={[
          styles.card,
          !hasAd && styles.emptyCard,
        ]}
      >
        {hasAd ? (
          <>
            {imageUrl ? (
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={styles.image}
              />
            ) : null}

            <View
              style={[
                styles.textArea,
                {
                  justifyContent:
                    positionStyle.justifyContent,
                  alignItems:
                    positionStyle.alignItems,
                },
              ]}
            >
              <Text
                style={[
                  styles.slideText,
                  {
                    textAlign:
                      positionStyle.textAlign,
                  },
                ]}
                numberOfLines={4}
              >
                {currentSlide?.text || ""}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContent} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
  },

  card: {
  width: "100%",
  height: 100,
  backgroundColor: "#172554",
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#1e3a8a",
  overflow: "hidden",
  position: "relative",
},

  emptyCard: {
    backgroundColor: "#101a30",
    borderColor: "#263b5d",
  },

  image: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 80,
    height: 80,
    borderRadius: 14,
    resizeMode: "cover",
    backgroundColor: "#0f1f46",
  },

  textArea: {
    position: "absolute",
    left: 12,
    top: 10,
    bottom: 10,
    right: 102,
    paddingVertical: 4,
  },

  slideText: {
    width: "100%",
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "800",
  },

  emptyContent: {
    flex: 1,
    minHeight: 118,
  },
});