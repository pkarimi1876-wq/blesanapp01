import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileImage,
  Heart,
  ImagePlus,
  Info,
  Link2,
  MapPin,
  Megaphone,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  BriefcaseBusiness,
  Send,
  Trash2,
  Wallet,
} from "lucide-react-native";

import { supabase } from "../lib/supabase";

/* =====================================================
   Helpers
===================================================== */

const formatDate = (dateValue = new Date()) => {
  const date = new Date(dateValue);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

 
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/* =====================================================
   Announcement Types
===================================================== */

const ANNOUNCEMENT_TYPES = [
  {
    id: "normal",
    label: "ئاسایی",
    color: "#D4AF37",
    backgroundColor: "rgba(212,175,55,0.12)",
  },
  {
    id: "important",
    label: "گرنگ",
    color: "#F59E0B",
    backgroundColor: "rgba(245,158,11,0.12)",
  },
  {
    id: "urgent",
    label: "فۆری",
    color: "#EF4444",
    backgroundColor: "rgba(239,68,68,0.12)",
  },
];

/* =====================================================
   Project Status
===================================================== */

const PROJECT_STATUSES = [
  {
    id: "not_started",
    label: "هێشتا دەستمان پێ نەکردووە",
    color: "#94A3B8",
  },
  {
    id: "started",
    label: "دەستمان پێ کردووە",
    color: "#60A5FA",
  },
  {
    id: "halfway",
    label: "لە نیوەی کاردایین",
    color: "#F59E0B",
  },
  {
    id: "completed",
    label: "تەواومان کردووە",
    color: "#22C55E",
  },
];

/* =====================================================
   Empty Form
===================================================== */

const createEmptyForm = () => ({
  title: "",
  content: "",

  announcementType: "normal",

  serviceName: "",
  serviceContent: "",
  servicePublishDate: "",
  serviceDate: "",
  serviceLocation: "",
  serviceTime: "",

  projectName: "",
  projectStatus: "not_started",
  projectContent: "",
  projectBudget: "",
  projectStartDate: "",
  projectEndDate: "",

  municipalityName: "",
  municipalityPhone: "",
  shortMessage: "",
  sms: "",
  socialLink: "",
});

export default function MunicipalitySectionScreen({
  navigation,
  route,
}) {
  const params = route?.params || {};

  const title = params.title || "دهیاری";
  const type = params.type || "about";
  const isAdmin = params.isAdmin === true;

  /* =====================================================
     State
  ===================================================== */

  const [clientId, setClientId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const [posts, setPosts] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);

  const [editingPost, setEditingPost] = useState(null);

  const [imageUri, setImageUri] = useState("");

  const [form, setForm] = useState(
    createEmptyForm()
  );

  const [likeCounts, setLikeCounts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [commentsByPost, setCommentsByPost] =
    useState({});

  const [commentModalVisible, setCommentModalVisible] =
    useState(false);

  const [selectedPost, setSelectedPost] =
    useState(null);

  const [commentText, setCommentText] =
    useState("");

  const [commentSaving, setCommentSaving] =
    useState(false);

  const [comments, setComments] = useState([]);

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [editingCommentId, setEditingCommentId] =
    useState(null);

  /* =====================================================
     Current Writing Date
  ===================================================== */

  const writingDate = useMemo(
    () => formatDate(new Date()),
    []
  );

  /* =====================================================
     Client ID
  ===================================================== */

  const getClientId = async () => {
    try {
      const savedId =
        await AsyncStorage.getItem(
          "blesan_comment_client_id"
        );

      if (savedId) {
        setClientId(savedId);
        return savedId;
      }

      const newId = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 12)}`;

      await AsyncStorage.setItem(
        "blesan_comment_client_id",
        newId
      );

      setClientId(newId);

      return newId;
    } catch (error) {
      console.log(
        "CLIENT ID ERROR:",
        error
      );

      return null;
    }
  };

  useEffect(() => {
    getClientId();
  }, []);

  /* =====================================================
     Section Information
  ===================================================== */

  const sectionInfo = {
    announcements: {
      icon: Megaphone,
      description:
        "ئاگاداری و ڕاگەیاندنە نوێکانی دهیاری لەم بەشەدا نیشان دەدرێن.",
    },

    services: {
      icon: BriefcaseBusiness,
      description:
        "زانیاریی خزمەتگوزارییەکانی دهیاری بۆ دانیشتووان.",
    },

    projects: {
      icon: FileImage,
      description:
        "پڕۆژە و کارەکانی دهیاری لەم بەشەدا نیشان دەدرێن.",
    },

    contact: {
      icon: Phone,
      description:
        "ژمارە و ڕێگاکانی پەیوەندی بە دهیاری.",
    },

    location: {
      icon: MapPin,
      description:
        "ناونیشان و شوێنی دهیاری بڵەسەن.",
    },

    about: {
      icon: Info,
      description:
        "زانیاریی گشتی و ناساندنی دهیاری.",
    },
  };

  const currentSection =
    sectionInfo[type] ||
    sectionInfo.about;

  const SectionIcon =
    currentSection.icon;

  /* =====================================================
     Form Helpers
  ===================================================== */

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setImageUri("");
    setEditingPost(null);
  };

  /* =====================================================
     Load Posts + Likes + Comments
  ===================================================== */

  const loadPosts = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: postsData,
        error: postsError,
      } = await supabase
        .from("municipality_posts")
        .select("*")
        .eq("section_type", type)
        .order("created_at", {
          ascending: false,
        });

      if (postsError) {
        throw postsError;
      }

      const loadedPosts =
        postsData || [];

      setPosts(loadedPosts);

      if (loadedPosts.length === 0) {
        setLikeCounts({});
        setCommentCounts({});
        setCommentsByPost({});
        return;
      }

      const postIds =
        loadedPosts.map(
          (post) => post.id
        );

      /* Likes */

      const {
        data: likesData,
        error: likesError,
      } = await supabase
        .from("municipality_post_likes")
        .select("post_id")
        .in("post_id", postIds);

      if (likesError) {
        throw likesError;
      }

      const nextLikeCounts = {};

      (likesData || []).forEach(
        (item) => {
          nextLikeCounts[item.post_id] =
            (nextLikeCounts[item.post_id] || 0) + 1;
        }
      );

      setLikeCounts(nextLikeCounts);

      /* Comments */

      const {
        data: commentsData,
        error: commentsError,
      } = await supabase
        .from("municipality_post_comments")
        .select(
          "id, post_id, comment_text, client_id, created_at"
        )
        .in("post_id", postIds)
        .order("created_at", {
          ascending: false,
        });

      if (commentsError) {
        throw commentsError;
      }

      const nextCommentCounts = {};
      const nextCommentsByPost = {};

      (commentsData || []).forEach(
        (comment) => {
          nextCommentCounts[comment.post_id] =
            (nextCommentCounts[comment.post_id] || 0) + 1;

          if (
            !nextCommentsByPost[comment.post_id]
          ) {
            nextCommentsByPost[comment.post_id] = [];
          }

          if (
            nextCommentsByPost[comment.post_id]
              .length < 3
          ) {
            nextCommentsByPost[
              comment.post_id
            ].push(comment);
          }
        }
      );

      setCommentCounts(
        nextCommentCounts
      );

      setCommentsByPost(
        nextCommentsByPost
      );
    } catch (error) {
      console.log(
        "LOAD MUNICIPALITY POSTS ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "نەتوانرا بابەتەکان بار بکرێن."
      );
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  /* =====================================================
     Pick Image
  ===================================================== */

  const pickImage = async () => {
    if (saving) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "ڕێگەپێدان پێویستە",
          "تکایە ڕێگە بە هەڵبژاردنی وێنە بدە."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.85,
        });

      if (
        !result.canceled &&
        result.assets?.length
      ) {
        setImageUri(
          result.assets[0].uri
        );
      }
    } catch (error) {
      console.log(
        "IMAGE PICK ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        "کێشەیەک لە هەڵبژاردنی وێنە ڕوویدا."
      );
    }
  };

  /* =====================================================
     Upload Image
  ===================================================== */

  const uploadImage = async () => {
    if (!imageUri) {
      return null;
    }

    /*
      لە Edit ـدا ئەگەر هەمان وێنەی کۆن بێت،
      دووبارە upload ناکرێت.
    */

    if (
      editingPost?.image_url &&
      imageUri === editingPost.image_url
    ) {
      return editingPost.image_url;
    }

    const response =
      await fetch(imageUri);

    if (!response.ok) {
      throw new Error(
        "نەتوانرا وێنەکە بخوێنرێتەوە."
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    const extension =
      imageUri
        .split(".")
        .pop()
        ?.split("?")[0]
        ?.toLowerCase() || "jpg";

    const safeExtension =
      extension === "png"
        ? "png"
        : "jpg";

    const contentType =
      safeExtension === "png"
        ? "image/png"
        : "image/jpeg";

    const filePath =
      `municipality/${type}/${Date.now()}.${safeExtension}`;

    const {
      error,
    } = await supabase.storage
      .from("images")
      .upload(
        filePath,
        arrayBuffer,
        {
          contentType,
          upsert: false,
        }
      );

    if (error) {
      throw error;
    }

    const {
      data,
    } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  };

  /* =====================================================
     Validate Form
  ===================================================== */

  const validateForm = () => {
    if (
      type === "announcements"
    ) {
      if (!form.title.trim()) {
        return "تکایە ناوی بابەت بنووسە.";
      }

      if (!form.content.trim()) {
        return "تکایە ناوەڕۆکی بابەت بنووسە.";
     

      }
    }

    if (type === "services") {
      if (!form.serviceName.trim()) {
        return "تکایە ناوی خزمەتگوزاری بنووسە.";
      }

      if (!form.serviceContent.trim()) {
        return "تکایە ناوەڕۆکی خزمەتگوزاری بنووسە.";
      }

      if (!form.servicePublishDate.trim()) {
        return "تکایە بەرواری بڵاوکردنەوە بنووسە.";
      }

      if (!form.serviceDate.trim()) {
        return "تکایە بەرواری خزمەت بنووسە.";
      }

      if (!form.serviceLocation.trim()) {
        return "تکایە ناونیشانی شوێنی خزمەت بنووسە.";
      }

      if (!form.serviceTime.trim()) {
        return "تکایە کاتی خزمەت بنووسە.";
     
      }
    }

    if (type === "projects") {
      if (!form.projectName.trim()) {
        return "تکایە ناوی پڕۆژە بنووسە.";
      }

      if (!form.projectContent.trim()) {
        return "تکایە ناوەڕۆکی پڕۆژە بنووسە.";
      }

      if (!form.projectBudget.trim()) {
        return "تکایە بڕی پارەی تەرخانکراو بنووسە.";
      }

      if (!form.projectStartDate.trim()) {
        return "تکایە بەرواری دەستپێکردنی پڕۆژە بنووسە.";
      }

      if (!form.projectEndDate.trim()) {
        return "تکایە بەرواری تەواوبوونی پڕۆژە بنووسە.";
      }
    }

    if (type === "contact") {
      if (!form.municipalityName.trim()) {
        return "تکایە ناوی دهیاری بنووسە.";
      }

      if (!form.municipalityPhone.trim()) {
        return "تکایە ژمارەی مۆبایل بنووسە.";
      }

      if (!form.shortMessage.trim()) {
        return "تکایە کورتەنامەکە بنووسە.";
      }
    }

    if (type === "about") {
      if (!form.title.trim()) {
        return "تکایە ناوی بابەت بنووسە.";
      }

      if (!form.content.trim()) {
        return "تکایە ناوەڕۆکی بابەت بنووسە.";
      
      }
    }

    if (type === "location") {
      if (!form.title.trim()) {
        return "تکایە ناونیشان بنووسە.";
      }

      if (!form.content.trim()) {
        return "تکایە زانیاریی شوێن بنووسە.";
      }
    }

    return null;
  };

  /* =====================================================
     Build Payload
  ===================================================== */

  const buildPayload = (
    uploadedImageUrl
  ) => {
    const payload = {
      section_type: type,

      title: "",
      content: "",

      image_url:
        uploadedImageUrl || null,

      announcement_type:
        type === "announcements"
          ? form.announcementType
          : null,

      service_name:
        type === "services"
          ? form.serviceName.trim()
          : null,

      service_content:
        type === "services"
          ? form.serviceContent.trim()
          : null,

      service_publish_date:
        type === "services"
          ? form.servicePublishDate.trim()
          : null,

      service_date:
        type === "services"
          ? form.serviceDate.trim()
          : null,

      service_location:
        type === "services"
          ? form.serviceLocation.trim()
          : null,

      service_time:
        type === "services"
          ? form.serviceTime.trim()
          : null,

      project_status:
        type === "projects"
          ? form.projectStatus
          : null,

      project_budget:
        type === "projects"
          ? Number(
              String(form.projectBudget)
                .replace(/,/g, "")
                .trim()
            ) || null
          : null,

      project_start_date:
        type === "projects"
          ? form.projectStartDate.trim()
          : null,

      project_end_date:
        type === "projects"
          ? form.projectEndDate.trim()
          : null,

      municipality_name:
        type === "contact"
          ? form.municipalityName.trim()
          : null,

      municipality_phone:
        type === "contact"
          ? form.municipalityPhone.trim()
          : null,

      short_message:
        type === "contact"
          ? form.shortMessage.trim()
          : null,

      sms:
        type === "contact"
          ? form.sms.trim()
          : null,

      social_link:
        type === "contact"
          ? form.socialLink.trim()
          : null,
    };

    if (
      type === "announcements" ||
      type === "about" ||
      type === "location"
    ) {
      payload.title =
        form.title.trim();

      payload.content =
        form.content.trim();
    }

    if (type === "services") {
      payload.title =
        form.serviceName.trim();

      payload.content =
        form.serviceContent.trim();
    }

    if (type === "projects") {
      payload.title =
        form.projectName.trim();

      payload.content =
        form.projectContent.trim();
    }

    if (type === "contact") {
      payload.title =
        form.municipalityName.trim();

      payload.content =
        form.shortMessage.trim();
    }

    return payload;
  };

  /* =====================================================
     Open Edit Post
  ===================================================== */

  const openEditPost = (post) => {
    if (!isAdmin) {
      Alert.alert(
        "دەسەڵات نییە",
        "تەنها بەڕێوەبەر دەتوانێت بابەت دەستکاری بکات."
      );

      return;
    }

    const nextForm =
      createEmptyForm();

    if (type === "announcements") {
      nextForm.title =
        post.title || "";

      nextForm.content =
        post.content || "";

      nextForm.announcementType =
        post.announcement_type ||
        "normal";
    }

    if (type === "services") {
      nextForm.serviceName =
        post.service_name ||
        post.title ||
        "";

      nextForm.serviceContent =
        post.service_content ||
        post.content ||
        "";

      nextForm.servicePublishDate =
        post.service_publish_date ||
        "";

      nextForm.serviceDate =
        post.service_date ||
        "";

      nextForm.serviceLocation =
        post.service_location ||
        "";

      nextForm.serviceTime =
        post.service_time ||
        "";
    }

    if (type === "projects") {
      nextForm.projectName =
        post.project_name ||
        post.title ||
        "";

      nextForm.projectStatus =
        post.project_status ||
        "not_started";

      nextForm.projectContent =
        post.project_content ||
        post.content ||
        "";

      nextForm.projectBudget =
        post.project_budget !==
        null &&
        post.project_budget !==
        undefined
          ? String(post.project_budget)
          : "";

      nextForm.projectStartDate =
        post.project_start_date ||
        "";

      nextForm.projectEndDate =
        post.project_end_date ||
        "";
    }

    if (type === "contact") {
      nextForm.municipalityName =
        post.municipality_name ||
        post.title ||
        "";

      nextForm.municipalityPhone =
        post.municipality_phone ||
        "";

      nextForm.shortMessage =
        post.short_message ||
        post.content ||
        "";

      nextForm.sms =
        post.sms || "";

      nextForm.socialLink =
        post.social_link ||
        "";
    }

    if (
      type === "about" ||
      type === "location"
    ) {
      nextForm.title =
        post.title || "";

      nextForm.content =
        post.content || "";
    }

    setEditingPost(post);
    setForm(nextForm);
    setImageUri(
      post.image_url || ""
    );
    setModalVisible(true);
  };

  /* =====================================================
     Delete Post
  ===================================================== */
  const deleteMunicipalityPost = async (postId) => {
  try {
    setSaving(false);

    const { error } = await supabase
      .from("municipality_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      throw error;
    }

    setPosts((previous) =>
      previous.filter(
        (item) => item.id !== postId
      )
    );

    setLikeCounts((previous) => {
      const next = { ...previous };
      delete next[postId];
      return next;
    });

    setCommentCounts((previous) => {
      const next = { ...previous };
      delete next[postId];
      return next;
    });

    setCommentsByPost((previous) => {
      const next = { ...previous };
      delete next[postId];
      return next;
    });

    Alert.alert(
      "سەرکەوتوو بوو ✅",
      "بابەتەکە سڕایەوە."
    );
  } catch (error) {
    console.log(
      "DELETE ERROR:",
      error
    );

    Alert.alert(
      "هەڵە",
      error?.message ||
        "بابەتەکە نەسڕایەوە."
    );
  }
};
const handleDeletePost = (post) => {
  if (!isAdmin) {
    Alert.alert(
      "دەسەڵات نییە",
      "تەنها بەڕێوەبەر دەتوانێت بابەت بسڕێتەوە."
    );
    return;
  }

  Alert.alert(
    "سڕینەوەی بابەت",
    `دڵنیایت لە سڕینەوەی «${post.title}»؟`,
    [
      {
        text: "پاشگەزبوونەوە",
        style: "cancel",
      },
      {
        text: "سڕینەوە",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.rpc(
              "delete_municipality_post",
              {
                p_post_id: post.id,
              }
            );

            if (error) {
              throw error;
            }

            setPosts((previous) =>
              previous.filter(
                (item) => item.id !== post.id
              )
            );

            setLikeCounts((previous) => {
              const next = { ...previous };
              delete next[post.id];
              return next;
            });

            setCommentCounts((previous) => {
              const next = { ...previous };
              delete next[post.id];
              return next;
            });

            setCommentsByPost((previous) => {
              const next = { ...previous };
              delete next[post.id];
              return next;
            });

            Alert.alert(
              "سەرکەوتوو بوو ✅",
              "بابەتەکە سڕایەوە."
            );
          } catch (error) {
            console.log(
              "RPC DELETE ERROR:",
              error
            );

            Alert.alert(
              "هەڵە",
              error?.message ||
                "بابەتەکە نەسڕایەوە."
            );
          }
        },
      },
    ]
  );
};
  /* =====================================================
     Add / Update Post
  ===================================================== */

  const handleAddPost = async () => {
    if (saving) {
      return;
    }

    if (!isAdmin) {
      Alert.alert(
        "دەسەڵات نییە",
        "تۆ دەسەڵاتی زیادکردن یان دەستکاریکردنی بابەتت نییە."
      );

      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      Alert.alert(
        "ئاگاداری",
        validationError
      );

      return;
    }

    setSaving(true);

    try {
      let uploadedImageUrl =
        editingPost?.image_url ||
        null;

      /*
        تەنها ئەگەر:
        - وێنەی نوێ هەڵبژێردرابێت
        upload بکە.
      */

      if (
        imageUri &&
        imageUri !==
          editingPost?.image_url
      ) {
        uploadedImageUrl =
          await uploadImage();
      }

      const payload =
        buildPayload(
          uploadedImageUrl
        );

      /* =================================================
         UPDATE
      ================================================= */

      if (editingPost) {
        const {
          error,
        } = await supabase
          .from(
            "municipality_posts"
          )
          .update(payload)
          .eq(
            "id",
            editingPost.id
          );

        if (error) {
          throw error;
        }

        resetForm();
        setModalVisible(false);

        await loadPosts();

        Alert.alert(
          "سەرکەوتوو بوو ✅",
          "بابەتەکە نوێکرایەوە."
        );

        return;
      }
      const handleAddPost = async () => {
  if (saving) {
    return;
  }

  if (!isAdmin) {
    Alert.alert(
      "دەسەڵات نییە",
      "تۆ دەسەڵاتی زیادکردن یان دەستکاریکردنی بابەتت نییە."
    );
    return;
  }

  const validationError = validateForm();

  if (validationError) {
    Alert.alert(
      "ئاگاداری",
      validationError
    );
    return;
  }

  setSaving(true);

  try {
    // -----------------------------------------
    // 1. Image
    // -----------------------------------------

    let finalImageUrl = editingPost?.image_url || null;

    // لە Add ـدا یان کاتێک وێنەی نوێ هەڵبژێردراوە
    if (
      imageUri &&
      imageUri !== editingPost?.image_url
    ) {
      finalImageUrl = await uploadImage();
    }

    // -----------------------------------------
    // 2. Build Payload
    // -----------------------------------------

    const payload = buildPayload(
      finalImageUrl
    );

    // -----------------------------------------
    // 3. Edit Existing Post
    // -----------------------------------------

    if (editingPost) {
      const { error } = await supabase
        .from("municipality_posts")
        .update(payload)
        .eq("id", editingPost.id);

      if (error) {
        throw error;
      }

      // داخستنی فۆرم
      resetForm();
      setModalVisible(false);

      // پاشەکەوتی لیست نوێ بکەرەوە
      loadPosts();

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بابەتەکە نوێکرایەوە."
      );

      return;
    }

    // -----------------------------------------
    // 4. Add New Post
    // -----------------------------------------

    const { error } = await supabase
      .from("municipality_posts")
      .insert([payload]);

    if (error) {
      throw error;
    }

    // داخستنی فۆرم و پاککردنەوە
    resetForm();
    setModalVisible(false);

    // نوێکردنەوەی لیست، بەبێ ئەوەی
    // Publish چاوەڕێی بکات
    loadPosts();

    Alert.alert(
      "سەرکەوتوو بوو ✅",
      "بابەتەکە بە سەرکەوتوویی بڵاوکرایەوە."
    );
  } catch (error) {
    console.log(
      "SAVE MUNICIPALITY POST ERROR:",
      error
    );

    Alert.alert(
      "هەڵە",
      error?.message ||
        "بابەتەکە پاشەکەوت نەکرا."
    );
  } finally {
    setSaving(false);
  }
};

      /* =================================================
         INSERT
      ================================================= */

      const {
        error,
      } = await supabase
        .from(
          "municipality_posts"
        )
        .insert([
          payload,
        ]);

      if (error) {
        throw error;
      }

      resetForm();
      setModalVisible(false);

      await loadPosts();

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بابەتەکە بە سەرکەوتوویی بڵاوکرایەوە."
      );
    } catch (error) {
      console.log(
        "SAVE MUNICIPALITY POST ERROR:",
        error
      );

      Alert.alert(
        "هەڵە لە بڵاوکردنەوە",
        error?.message ||
          "بابەتەکە پاشەکەوت نەکرا."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     Like
  ===================================================== */

  const handleLike = async (
    postId
  ) => {
    try {
      const {
        error,
      } = await supabase
        .from(
          "municipality_post_likes"
        )
        .insert({
          post_id:
            postId,
        });

      if (error) {
        throw error;
      }

      setLikeCounts(
        (previous) => ({
          ...previous,
          [postId]:
            (previous[postId] ||
              0) + 1,
        })
      );
    } catch (error) {
      console.log(
        "LIKE ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "لایک نەکرا."
      );
    }
  };

  /* =====================================================
     Open Comments
  ===================================================== */

  const openComments = async (
    post
  ) => {
    setSelectedPost(post);
    setCommentText("");
    setEditingCommentId(null);
    setComments([]);
    setCommentModalVisible(
      true
    );
    setCommentsLoading(
      true
    );

    try {
      const {
        data,
        error,
      } = await supabase
        .from(
          "municipality_post_comments"
        )
        .select(
          "id, post_id, comment_text, client_id, created_at"
        )
        .eq(
          "post_id",
          post.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        throw error;
      }

      const loadedComments =
        data || [];

      setComments(
        loadedComments
      );

      setCommentCounts(
        (previous) => ({
          ...previous,
          [post.id]:
            loadedComments.length,
        })
      );

      setCommentsByPost(
        (previous) => ({
          ...previous,
          [post.id]:
            loadedComments.slice(
              0,
              3
            ),
        })
      );
    } catch (error) {
      console.log(
        "LOAD COMMENTS ERROR:",
        error
      );

      Alert.alert(
        "هەڵە",
        error?.message ||
          "کۆمێنتەکان نەهاتن."
      );
    } finally {
      setCommentsLoading(
        false
      );
    }
  };

  /* =====================================================
     Edit Comment
  ===================================================== */

  const handleEditComment = (
    comment
  ) => {
    if (!clientId) {
      return;
    }

    if (
      comment.client_id !==
        clientId &&
      !isAdmin
    ) {
      Alert.alert(
        "دەسەڵات نییە",
        "ئەم کۆمێنتە هی تۆ نییە."
      );

      return;
    }

    if (
      isAdmin &&
      comment.client_id !==
        clientId
    ) {
      Alert.alert(
        "تێبینی",
        "بەڕێوەبەر ناتوانێت کۆمێنتی بەکارهێنەر دەستکاری بکات."
      );

      return;
    }

    setEditingCommentId(
      comment.id
    );

    setCommentText(
      comment.comment_text
    );
  };

  /* =====================================================
     Delete Comment
  ===================================================== */

 const deleteComment = async (comment) => {
  if (!clientId) {
    Alert.alert(
      "هەڵە",
      "ناسنامەی بەکارهێنەر نەدۆزرایەوە."
    );
    return;
  }

  if (
    !isAdmin &&
    comment.client_id !== clientId
  ) {
    Alert.alert(
      "دەسەڵات نییە",
      "ئەم کۆمێنتە هی تۆ نییە."
    );
    return;
  }

  try {
    let query = supabase
      .from("municipality_post_comments")
      .delete()
      .eq("id", comment.id);

    if (!isAdmin) {
      query = query.eq(
        "client_id",
        clientId
      );
    }

    const { error } = await query;

    if (error) {
      throw error;
    }

    setComments((previous) =>
      previous.filter(
        (item) => item.id !== comment.id
      )
    );

    setCommentsByPost((previous) => {
      const existing =
        previous[comment.post_id] || [];

      return {
        ...previous,
        [comment.post_id]:
          existing.filter(
            (item) =>
              item.id !== comment.id
          ),
      };
    });

    setCommentCounts((previous) => ({
      ...previous,
      [comment.post_id]: Math.max(
        (previous[comment.post_id] || 1) - 1,
        0
      ),
    }));

    Alert.alert(
      "سەرکەوتوو بوو ✅",
      "کۆمێنتەکە سڕایەوە."
    );
  } catch (error) {
    console.log(
      "DELETE COMMENT ERROR:",
      error
    );

    Alert.alert(
      "هەڵە",
      error?.message ||
        "کۆمێنتەکە نەسڕایەوە."
    );
  }
};

  /* =====================================================
     Add / Update Comment
  ===================================================== */

  const handleAddComment =
    async () => {
      if (commentSaving) {
        return;
      }

      if (!selectedPost) {
        return;
      }

      const cleanComment =
        commentText.trim();

      if (!cleanComment) {
        Alert.alert(
          "ئاگاداری",
          "تکایە کۆمێنتەکەت بنووسە."
        );

        return;
      }

      if (!clientId) {
        Alert.alert(
          "هەڵە",
          "ناسنامەی بەکارهێنەر نەدۆزرایەوە."
        );

        return;
      }

      setCommentSaving(
        true
      );

      try {
        /* Update Existing Comment */

        if (editingCommentId) {
          const {
            error,
          } = await supabase
            .from(
              "municipality_post_comments"
            )
            .update({
              comment_text:
                cleanComment,
            })
            .eq(
              "id",
              editingCommentId
            )
            .eq(
              "client_id",
              clientId
            );

          if (error) {
            throw error;
          }

          const updatedComment =
            {
              id:
                editingCommentId,

              post_id:
                selectedPost.id,

              comment_text:
                cleanComment,

              client_id:
                clientId,

              created_at:
                new Date().toISOString(),
            };

          setComments(
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  editingCommentId
                    ? {
                        ...item,
                        comment_text:
                          cleanComment,
                      }
                    : item
              )
          );

          setCommentsByPost(
            (previous) => {
              const existing =
                previous[
                  selectedPost.id
                ] || [];

              return {
                ...previous,

                [selectedPost.id]:
                  existing.map(
                    (item) =>
                      item.id ===
                      editingCommentId
                        ? {
                            ...item,
                            ...updatedComment,
                          }
                        : item
                  ),
              };
            }
          );

          setCommentText("");
          setEditingCommentId(
            null
          );

          Alert.alert(
            "سەرکەوتوو بوو ✅",
            "کۆمێنتەکە دەستکاری کرا."
          );

          return;
        }

        /* New Comment */

        const {
          error,
        } = await supabase
          .from(
            "municipality_post_comments"
          )
          .insert([
            {
              post_id:
                selectedPost.id,

              comment_text:
                cleanComment,

              client_id:
                clientId,
            },
          ]);

        if (error) {
          throw error;
        }

        const newComment = {
          id:
            Date.now(),

          post_id:
            selectedPost.id,

          comment_text:
            cleanComment,

          client_id:
            clientId,

          created_at:
            new Date().toISOString(),
        };

        setComments(
          (previous) => [
            newComment,
            ...previous,
          ]
        );

        setCommentCounts(
          (previous) => ({
            ...previous,

            [selectedPost.id]:
              (
                previous[
                  selectedPost.id
                ] || 0
              ) + 1,
          })
        );

        setCommentsByPost(
          (previous) => {
            const existing =
              previous[
                selectedPost.id
              ] || [];

            return {
              ...previous,

              [selectedPost.id]:
                [
                  newComment,
                  ...existing,
                ].slice(
                  0,
                  3
                ),
            };
          }
        );

        setCommentText("");

        await openComments(
          selectedPost
        );
      } catch (error) {
        console.log(
          "COMMENT SAVE ERROR:",
          error
        );

        Alert.alert(
          "هەڵە",
          error?.message ||
            "کۆمێنتەکە پاشەکەوت نەکرا."
        );
      } finally {
        setCommentSaving(
          false
        );
      }
    };

  /* =====================================================
     Close Add Modal
  ===================================================== */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalVisible(false);
    resetForm();
  };

  /* =====================================================
     Close Comments Modal
  ===================================================== */

  const closeCommentsModal =
    () => {
      if (commentSaving) {
        return;
      }

      setCommentModalVisible(
        false
      );

      setSelectedPost(
        null
      );

      setCommentText("");

      setEditingCommentId(
        null
      );
    };

  /* =====================================================
     Open Phone
  ===================================================== */

  const callPhone = async (
    phone
  ) => {
    if (!phone) {
      return;
    }

    try {
      await Linking.openURL(
        `tel:${phone}`
      );
    } catch (error) {
      Alert.alert(
        "هەڵە",
        "نەتوانرا پەیوەندی بە ژمارەکە بکرێت."
      );
    }
  };

  /* =====================================================
     Open SMS
  ===================================================== */

  const sendSms = async (
    phone
  ) => {
    if (!phone) {
      return;
    }

    try {
      await Linking.openURL(
        `sms:${phone}`
      );
    } catch (error) {
      Alert.alert(
        "هەڵە",
        "نەتوانرا SMS بکرێت."
      );
    }
  };

  /* =====================================================
     Open Social Link
  ===================================================== */

  const openSocialLink =
    async (url) => {
      if (!url) {
        return;
      }

      try {
        await Linking.openURL(
          url
        );
      } catch (error) {
        Alert.alert(
          "هەڵە",
          "لینکەکە نەکرایەوە."
        );
      }
    };

  /* =====================================================
     Render Form Header
  ===================================================== */

  const renderFormHeader =
    () => {
      const headings = {
        announcements:
          "ڕاگەیاندن",
        services:
          "خزمەتگوزاری",
        projects:
          "پڕۆژە",
        contact:
          "زانیاری پەیوەندی",
        about:
          "بابەتی دەربارەی دهیاری",
        location:
          "زانیاری شوێن",
      };

      return (
        <View
          style={
            styles.formHeader
          }
        >
          <View
            style={
              styles.formHeaderIcon
            }
          >
            <SectionIcon
              color="#D97706"
              size={24}
            />
          </View>

          <View
            style={
              styles.formHeaderTextBox
            }
          >
            <Text
              style={
                styles.formHeaderTitle
              }
            >
              {editingPost
                ? `دەستکاریی ${
                    headings[type] ||
                    "بابەت"
                  }`
                : `زیادکردنی ${
                    headings[type] ||
                    "بابەت"
                  }`}
            </Text>

            <Text
              style={
                styles.formHeaderSubtitle
              }
            >
              بەرواری نووسین:{" "}
              {writingDate}
            </Text>
          </View>
        </View>
      );
    };

  /* =====================================================
     Render Date Field
  ===================================================== */

  const renderReadOnlyDate =
    () => (
      <View
        style={
          styles.fieldBlock
        }
      >
        <Text
          style={
            styles.fieldLabel
          }
        >
          بەرواری نووسین
        </Text>

        <View
          style={
            styles.readOnlyField
          }
        >
          <CalendarDays
            color="#D4AF37"
            size={19}
          />

          <Text
            style={
              styles.readOnlyFieldText
            }
          >
            {writingDate}
          </Text>

          <Text
            style={
              styles.autoText
            }
          >
            خۆکار
          </Text>
        </View>
      </View>
    );

  /* =====================================================
     Render Input
  ===================================================== */

  const renderInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    keyboardType = "default",
  }) => (
    <View
      style={
        styles.fieldBlock
      }
    >
      <Text
        style={
          styles.fieldLabel
        }
      >
        {label}
      </Text>

      <TextInput
        style={[
          styles.modalInput,
          multiline &&
            styles.textArea,
        ]}
        value={
          value == null
            ? ""
            : String(value)
        }
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="#64748B"
        textAlign="right"
        multiline={
          multiline
        }
        textAlignVertical={
          multiline
            ? "top"
            : "center"
        }
        keyboardType={
          keyboardType
        }
        editable={!saving}
      />
    </View>
  );

  /* =====================================================
     Render Dynamic Form
  ===================================================== */

  const renderDynamicForm =
    () => {
      if (
        type ===
        "announcements"
      ) {
        const activeType =
          ANNOUNCEMENT_TYPES.find(
            (item) =>
              item.id ===
              form.announcementType
          ) ||
          ANNOUNCEMENT_TYPES[0];

        return (
          <>
            <View
              style={
                styles.sectionBox
              }
            >
              <Text
                style={
                  styles.sectionBoxTitle
                }
              >
                جۆری ڕاگەیاندن
              </Text>

              <View
                style={
                  styles.choiceRow
                }
              >
                {ANNOUNCEMENT_TYPES.map(
                  (item) => {
                    const selected =
                      form.announcementType ===
                      item.id;

                    return (
                      <TouchableOpacity
                        key={
                          item.id
                        }
                        style={[
                          styles.choiceChip,
                          {
                            borderColor:
                              item.color,

                            backgroundColor:
                              selected
                                ? item.backgroundColor
                                : "#0F172A",
                          },
                        ]}
                        onPress={() =>
                          updateForm(
                            "announcementType",
                            item.id
                          )
                        }
                        disabled={
                          saving
                        }
                      >
                        <View
                          style={[
                            styles.colorDot,
                            {
                              backgroundColor:
                                item.color,
                            },
                          ]}
                        />

                        <Text
                          style={[
                            styles.choiceText,
                            {
                              color:
                                item.color,
                            },
                          ]}
                        >
                          {
                            item.label
                          }
                        </Text>

                        {selected && (
                          <Check
                            color={
                              item.color
                            }
                            size={
                              16
                            }
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>

            <View
              style={[
                styles.typePreview,
                {
                  borderColor:
                    activeType.color,

                  backgroundColor:
                    activeType.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.typePreviewLabel,
                  {
                    color:
                      activeType.color,
                  },
                ]}
              >
                {
                  activeType.label
                }
              </Text>

              <Text
                style={[
                  styles.typePreviewTitle,
                  {
                    color:
                      activeType.color,
                  },
                ]}
              >
                شێوازی ناونیشانی ڕاگەیاندن
              </Text>
            </View>

            {renderInput({
              label:
                "ناوی بابەت",
              value:
                form.title,
              onChangeText:
                (value) =>
                  updateForm(
                    "title",
                    value
                  ),
              placeholder:
                "ناوی ڕاگەیاندن بنووسە...",
            })}

            {renderInput({
              label:
                "ناوەڕۆکی بابەت",
              value:
                form.content,
              onChangeText:
                (value) =>
                  updateForm(
                    "content",
                    value
                  ),
              placeholder:
                "ناوەڕۆکی ڕاگەیاندن...",
              multiline:
                true,
            })}

            {renderReadOnlyDate()}

            {renderRequiredImage()}
          </>
        );
      }

      if (
        type ===
        "services"
      ) {
        return (
          <>
            {renderInput({
              label:
                "ناوی خزمەت",
              value:
                form.serviceName,
              onChangeText:
                (value) =>
                  updateForm(
                    "serviceName",
                    value
                  ),
              placeholder:
                "ناوی خزمەتگوزاری...",
            })}

            {renderInput({
              label:
                "ناوەڕۆکی خزمەت",
              value:
                form.serviceContent,
              onChangeText:
                (value) =>
                  updateForm(
                    "serviceContent",
                    value
                  ),
              placeholder:
                "زانیاری و ناوەڕۆکی خزمەت...",
              multiline:
                true,
            })}

            {renderInput({
              label:
                "بەرواری بڵاوکردنەوە",
              value:
                form.servicePublishDate,
              onChangeText:
                (value) =>
                  updateForm(
                    "servicePublishDate",
                    value
                  ),
              placeholder:
                "2026-09-14",
            })}

            {renderInput({
              label:
                "بەرواری ڕۆژی خزمەت",
              value:
                form.serviceDate,
              onChangeText:
                (value) =>
                  updateForm(
                    "serviceDate",
                    value
                  ),
              placeholder:
                "2026-09-20",
            })}

            {renderInput({
              label:
                "ناونیشانی شوێنی خزمەت",
              value:
                form.serviceLocation,
              onChangeText:
                (value) =>
                  updateForm(
                    "serviceLocation",
                    value
                  ),
              placeholder:
                "شوێنی ئەنجامدانی خزمەت...",
            })}

            {renderInput({
              label:
                "کاتی خزمەت",
              value:
                form.serviceTime,
              onChangeText:
                (value) =>
                  updateForm(
                    "serviceTime",
                    value
                  ),
              placeholder:
                "بۆ نموونە: 08:00 - 14:00",
            })}

            {renderReadOnlyDate()}

            {renderRequiredImage()}
          </>
        );
      }

      if (
        type ===
        "projects"
      ) {
        return (
          <>
            {renderInput({
              label:
                "ناوی پڕۆژە",
              value:
                form.projectName,
              onChangeText:
                (value) =>
                  updateForm(
                    "projectName",
                    value
                  ),
              placeholder:
                "ناوی پڕۆژە...",
            })}

            <View
              style={
                styles.sectionBox
              }
            >
              <Text
                style={
                  styles.sectionBoxTitle
                }
              >
                ئاستی پڕۆژە
              </Text>

              <View
                style={
                  styles.statusList
                }
              >
                {PROJECT_STATUSES.map(
                  (item) => {
                    const selected =
                      form.projectStatus ===
                      item.id;

                    return (
                      <TouchableOpacity
                        key={
                          item.id
                        }
                        style={[
                          styles.statusOption,
                          selected &&
                            styles.statusOptionActive,
                        ]}
                        onPress={() =>
                          updateForm(
                            "projectStatus",
                            item.id
                          )
                        }
                        disabled={
                          saving
                        }
                      >
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                item.color,
                            },
                          ]}
                        />

                        <Text
                          style={[
                            styles.statusOptionText,
                            selected &&
                              styles.statusOptionTextActive,
                          ]}
                        >
                          {
                            item.label
                          }
                        </Text>

                        {selected && (
                          <Check
                            color="#D4AF37"
                            size={
                              18
                            }
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>

            {renderInput({
              label:
                "ناوەڕۆکی پڕۆژە",
              value:
                form.projectContent,
              onChangeText:
                (value) =>
                  updateForm(
                    "projectContent",
                    value
                  ),
              placeholder:
                "ناوەڕۆکی پڕۆژە و زانیارییەکان...",
              multiline:
                true,
            })}

            {renderInput({
              label:
                "بڕی پارەی تەرخانکراو",
              value:
                form.projectBudget,
              onChangeText:
                (value) =>
                  updateForm(
                    "projectBudget",
                    value
                  ),
              placeholder:
                "بۆ نموونە: 250000000",
              keyboardType:
                "numeric",
            })}

            {renderInput({
              label:
                "بەرواری دەستپێکردنی پڕۆژە",
              value:
                form.projectStartDate,
              onChangeText:
                (value) =>
                  updateForm(
                    "projectStartDate",
                    value
                  ),
              placeholder:
                "2026-09-20",
            })}

            {renderInput({
              label:
                "بەرواری تەواوبوونی پڕۆژە",
              value:
                form.projectEndDate,
              onChangeText:
                (value) =>
                  updateForm(
                    "projectEndDate",
                    value
                  ),
              placeholder:
                "2027-01-20",
            })}

            {renderReadOnlyDate()}
          </>
        );
      }

      if (
        type ===
        "contact"
      ) {
        return (
          <>
            {renderInput({
              label:
                "ناوی دهیاری",
              value:
                form.municipalityName,
              onChangeText:
                (value) =>
                  updateForm(
                    "municipalityName",
                    value
                  ),
              placeholder:
                "ناوی دهیاری...",
            })}

            <View
              style={
                styles.fieldBlock
              }
            >
              <Text
                style={
                  styles.fieldLabel
                }
              >
                ژمارەی مۆبایل
              </Text>

              <View
                style={
                  styles.phoneInputBox
                }
              >
                <TouchableOpacity
                  style={
                    styles.phoneActionButton
                  }
                  onPress={() =>
                    callPhone(
                      form.municipalityPhone
                    )
                  }
                  disabled={
                    !form.municipalityPhone
                  }
                >
                  <Phone
                    color="#22C55E"
                    size={18}
                  />
                </TouchableOpacity>

                <TextInput
                  style={
                    styles.phoneInput
                  }
                  value={
                    form.municipalityPhone
                  }
                  onChangeText={(
                    value
                  ) =>
                    updateForm(
                      "municipalityPhone",
                      value
                    )
                  }
                  placeholder="07xxxxxxxxx"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                  textAlign="right"
                  editable={
                    !saving
                  }
                />
              </View>
            </View>

            {renderInput({
              label:
                "کورتەنامە",
              value:
                form.shortMessage,
              onChangeText:
                (value) =>
                  updateForm(
                    "shortMessage",
                    value
                  ),
              placeholder:
                "کورتە زانیارییەک لەبارەی پەیوەندی...",
              multiline:
                true,
            })}

            <View
              style={
                styles.fieldBlock
              }
            >
              <Text
                style={
                  styles.fieldLabel
                }
              >
                SMS
              </Text>

              <View
                style={
                  styles.phoneInputBox
                }
              >
                <TouchableOpacity
                  style={
                    styles.phoneActionButton
                  }
                  onPress={() =>
                    sendSms(
                      form.sms ||
                        form.municipalityPhone
                    )
                  }
                  disabled={
                    !(
                      form.sms ||
                      form.municipalityPhone
                    )
                  }
                >
                  <Send
                    color="#60A5FA"
                    size={18}
                  />
                </TouchableOpacity>

                <TextInput
                  style={
                    styles.phoneInput
                  }
                  value={
                    form.sms
                  }
                  onChangeText={(
                    value
                  ) =>
                    updateForm(
                      "sms",
                      value
                    )
                  }
                  placeholder="ژمارەی SMS..."
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                  textAlign="right"
                  editable={
                    !saving
                  }
                />
              </View>
            </View>

            <View
              style={
                styles.fieldBlock
              }
            >
              <Text
                style={
                  styles.fieldLabel
                }
              >
                ڕێگای مەجازی
              </Text>

              <View
                style={
                  styles.phoneInputBox
                }
              >
                <TouchableOpacity
                  style={
                    styles.phoneActionButton
                  }
                  onPress={() =>
                    openSocialLink(
                      form.socialLink
                    )
                  }
                  disabled={
                    !form.socialLink
                  }
                >
                  <Link2
                    color="#D4AF37"
                    size={18}
                  />
                </TouchableOpacity>

                <TextInput
                  style={
                    styles.phoneInput
                  }
                  value={
                    form.socialLink
                  }
                  onChangeText={(
                    value
                  ) =>
                    updateForm(
                      "socialLink",
                      value
                    )
                  }
                  placeholder="https://..."
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  keyboardType="url"
                  textAlign="right"
                  editable={
                    !saving
                  }
                />
              </View>
            </View>

            {renderReadOnlyDate()}
          </>
        );
      }

      if (
        type ===
        "about"
      ) {
        return (
          <>
            {renderInput({
              label:
                "ناوی بابەت",
              value:
                form.title,
              onChangeText:
                (value) =>
                  updateForm(
                    "title",
                    value
                  ),
              placeholder:
                "ناوی بابەت...",
            })}

            {renderInput({
              label:
                "ناوەڕۆکی بابەت",
              value:
                form.content,
              onChangeText:
                (value) =>
                  updateForm(
                    "content",
                    value
                  ),
              placeholder:
                "ناوەڕۆکی بابەت...",
              multiline:
                true,
            })}

            {renderReadOnlyDate()}

            {renderRequiredImage()}
          </>
        );
      }

      return (
        <>
          {renderInput({
            label:
              "ناوی بابەت",
            value:
              form.title,
            onChangeText:
              (value) =>
                updateForm(
                  "title",
                  value
                ),
            placeholder:
              "ناوی بابەت...",
          })}

          {renderInput({
            label:
              "ناوەڕۆکی بابەت",
            value:
              form.content,
            onChangeText:
              (value) =>
                updateForm(
                  "content",
                  value
                ),
            placeholder:
              "ناوەڕۆکی بابەت...",
            multiline:
              true,
          })}

          {renderReadOnlyDate()}
        </>
      );
    };

  /* =====================================================
     Required Image
  ===================================================== */

  const renderRequiredImage =
    () => (
      <View
        style={
          styles.fieldBlock
        }
      >
        <Text
          style={
            styles.fieldLabel
          }
        >
          وێنەی بابەت
          <Text
            style={
              styles.requiredMark
            }
          >
            {" "}
            *
          </Text>
        </Text>

        <TouchableOpacity
          style={
            styles.imageButton
          }
          onPress={
            pickImage
          }
          activeOpacity={
            0.8
          }
          disabled={saving}
        >
          {imageUri ? (
            <>
              <Image
                source={{
                  uri: imageUri,
                }}
                style={
                  styles.previewImage
                }
              />

              <View
                style={
                  styles.imageOverlay
                }
              >
                <ImagePlus
                  color="#FFF"
                  size={
                    21
                  }
                />

                <Text
                  style={
                    styles.imageOverlayText
                  }
                >
                  گۆڕینی وێنە
                </Text>
              </View>
            </>
          ) : (
            <View
              style={
                styles.imageEmpty
              }
            >
              <View
                style={
                  styles.imageIconBox
                }
              >
                <ImagePlus
                  color="#D97706"
                  size={
                    25
                  }
                />
              </View>

              <Text
                style={
                  styles.imageButtonText
                }
              >
                دانانی وێنە
              </Text>

              <Text
                style={
                  styles.imageHint
                }
              >
                وێنە بۆ ئەم بەشە پێویستە
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );

  /* =====================================================
     Post Meta
  ===================================================== */

  const renderPostMeta = (
    post
  ) => {
    if (
      type ===
      "announcements"
    ) {
      const announcement =
        ANNOUNCEMENT_TYPES.find(
          (item) =>
            item.id ===
            post.announcement_type
        );

      if (!announcement) {
        return null;
      }

      return (
        <View
          style={[
            styles.metaBadge,
            {
              borderColor:
                announcement.color,

              backgroundColor:
                announcement.backgroundColor,
            },
          ]}
        >
          <View
            style={[
              styles.metaDot,
              {
                backgroundColor:
                  announcement.color,
              },
            ]}
          />

          <Text
            style={[
              styles.metaBadgeText,
              {
                color:
                  announcement.color,
              },
            ]}
          >
            {
              announcement.label
            }
          </Text>
        </View>
      );
    }

    if (
      type ===
      "services"
    ) {
      return (
        <View
          style={
            styles.metaGrid
          }
        >
          {post.service_publish_date && (
            <MetaInfo
              icon={
                CalendarDays
              }
              label="بڵاوکردنەوە"
              value={
                post.service_publish_date
              }
            />
          )}

          {post.service_date && (
            <MetaInfo
              icon={
                CalendarDays
              }
              label="ڕۆژی خزمەت"
              value={
                post.service_date
              }
            />
          )}

          {post.service_time && (
            <MetaInfo
              icon={
                Clock3
              }
              label="کات"
              value={
                post.service_time
              }
            />
          )}

          {post.service_location && (
            <MetaInfo
              icon={
                MapPin
              }
              label="شوێن"
              value={
                post.service_location
              }
            />
          )}
        </View>
      );
    }

    if (
      type ===
      "projects"
    ) {
      const status =
        PROJECT_STATUSES.find(
          (item) =>
            item.id ===
            post.project_status
        );

      return (
        <View>
          {status && (
            <View
              style={[
                styles.projectStatusBadge,
                {
                  borderColor:
                    status.color,
                },
              ]}
            >
              <View
                style={[
                  styles.metaDot,
                  {
                    backgroundColor:
                      status.color,
                  },
                ]}
              />

              <Text
                style={[
                  styles.projectStatusText,
                  {
                    color:
                      status.color,
                  },
                ]}
              >
                {
                  status.label
                }
              </Text>
            </View>
          )}

          <View
            style={
              styles.metaGrid
            }
          >
            {post.project_budget !==
              null &&
              post.project_budget !==
                undefined && (
                <MetaInfo
                  icon={
                    Wallet
                  }
                  label="بودجە"
                  value={Number(
                    post.project_budget
                  ).toLocaleString()}
                />
              )}

            {post.project_start_date && (
              <MetaInfo
                icon={
                  CalendarDays
                }
                label="دەستپێک"
                value={
                  post.project_start_date
                }
              />
            )}

            {post.project_end_date && (
              <MetaInfo
                icon={
                  CalendarDays
                }
                label="کۆتایی"
                value={
                  post.project_end_date
                }
              />
            )}
          </View>
        </View>
      );
    }

    if (
      type ===
      "contact"
    ) {
      return (
        <View
          style={
            styles.contactMetaBox
          }
        >
          {post.municipality_phone && (
            <TouchableOpacity
              style={
                styles.contactAction
              }
              onPress={() =>
                callPhone(
                  post.municipality_phone
                )
              }
            >
              <Phone
                color="#22C55E"
                size={
                  17
                }
              />

              <Text
                style={
                  styles.contactActionText
                }
              >
                {
                  post.municipality_phone
                }
              </Text>
            </TouchableOpacity>
          )}

          {post.sms && (
            <TouchableOpacity
              style={
                styles.contactAction
              }
              onPress={() =>
                sendSms(
                  post.sms
                )
              }
            >
              <Send
                color="#60A5FA"
                size={
                  17
                }
              />

              <Text
                style={
                  styles.contactActionText
                }
              >
                SMS
              </Text>
            </TouchableOpacity>
          )}

          {post.social_link && (
            <TouchableOpacity
              style={
                styles.contactAction
              }
              onPress={() =>
                openSocialLink(
                  post.social_link
                )
              }
            >
              <Link2
                color="#D4AF37"
                size={
                  17
                }
              />

              <Text
                style={
                  styles.contactActionText
                }
              >
                ڕێگای مەجازی
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return null;
  };

  /* =====================================================
     Render
  ===================================================== */

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      {/* Header */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerTitleBox
          }
        >
          <Building2
            color="#D97706"
            size={
              22
            }
          />

          <Text
            style={
              styles.headerTitle
            }
          >
            {title}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={
            0.8
          }
        >
          <ArrowRight
            color="#FFF"
            size={
              22
            }
          />
        </TouchableOpacity>
      </View>

      {/* Main */}

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Hero */}

        <View
          style={
            styles.heroCard
          }
        >
          <View
            style={
              styles.iconBox
            }
          >
            <SectionIcon
              color="#D97706"
              size={
                30
              }
            />
          </View>

          <Text
            style={
              styles.title
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.description
            }
          >
            {
              currentSection.description
            }
          </Text>
        </View>

        {/* Admin Add */}

        {isAdmin && (
          <TouchableOpacity
            style={
              styles.addButton
            }
            onPress={() => {
              if (saving) {
                return;
              }

              resetForm();
              setModalVisible(
                true
              );
            }}
            activeOpacity={
              0.85
            }
            disabled={
              saving
            }
          >
            <Plus
              color="#000"
              size={
                21
              }
            />

            <Text
              style={
                styles.addButtonText
              }
            >
              زیادکردنی بابەت
            </Text>
          </TouchableOpacity>
        )}

        {/* Posts */}

        {loading ? (
          <View
            style={
              styles.loadingBox
            }
          >
            <ActivityIndicator
              size="large"
              color="#D97706"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              بابەتەکان بار دەکرێن...
            </Text>
          </View>
        ) : posts.length ===
          0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              هیچ بابەتێک نییە
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              هێشتا هیچ بابەتێک
              بۆ ئەم بەشە زیاد
              نەکراوە.
            </Text>
          </View>
        ) : (
          posts.map(
            (post) => {
              const postComments =
                commentsByPost[
                  post.id
                ] || [];

              const totalComments =
                commentCounts[
                  post.id
                ] || 0;

              return (
                <View
                  key={
                    post.id
                  }
                  style={
                    styles.postCard
                  }
                >
                  {post.image_url ? (
                    <Image
                      source={{
                        uri: post.image_url,
                      }}
                      style={
                        styles.postImage
                      }
                      resizeMode="cover"
                    />
                  ) : null}

                  <View
                    style={
                      styles.postContent
                    }
                  >
                    {renderPostMeta(
                      post
                    )}

                    <View
                      style={
                        styles.postTitleRow
                      }
                    >
                      <Text
                        style={[
                          styles.postTitle,

                          type ===
                            "announcements" &&
                            post.announcement_type ===
                              "urgent" &&
                            styles.urgentPostTitle,

                          type ===
                            "announcements" &&
                            post.announcement_type ===
                              "important" &&
                            styles.importantPostTitle,
                        ]}
                      >
                        {
                          post.title
                        }
                      </Text>

                      {isAdmin && (
                        <View
                          style={
                            styles.adminPostActions
                          }
                        >
                          <TouchableOpacity
                            style={
                              styles.editPostButton
                            }
                            onPress={() =>
                              openEditPost(
                                post
                              )
                            }
                            disabled={
                              saving
                            }
                            activeOpacity={
                              0.75
                            }
                          >
                            <Pencil
                              color="#D4AF37"
                              size={
                                17
                              }
                            />
                          </TouchableOpacity>

                        <TouchableOpacity
                        style={styles.deletePostButton}
                         onPress={() =>
                          deleteMunicipalityPost(post.id)
                        }
                          activeOpacity={0.7}
>
                    <Trash2
                        color="#EF4444"
                         size={17}
                        />
                        </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    <Text
                      style={
                        styles.postText
                      }
                    >
                      {
                        post.content
                      }
                    </Text>

                    <View
                      style={
                        styles.writtenDateRow
                      }
                    >
                      <CalendarDays
                        color="#64748B"
                        size={
                          15
                        }
                      />

                      <Text
                        style={
                          styles.writtenDateText
                        }
                      >
                        نووسین:{" "}
                        {formatDisplayDate(
                          post.created_at
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.postFooter
                      }
                    >
                      <TouchableOpacity
                        style={
                          styles.engagementButton
                        }
                        onPress={() =>
                          handleLike(
                            post.id
                          )
                        }
                        activeOpacity={
                          0.7
                        }
                      >
                        <Heart
                          color="#D97706"
                          size={
                            19
                          }
                        />

                        <Text
                          style={
                            styles.engagementText
                          }
                        >
                          {
                            likeCounts[
                              post.id
                            ] || 0
                          }
                        </Text>

                        <Text
                          style={
                            styles.engagementLabel
                          }
                        >
                          لایک
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={
                          styles.engagementButton
                        }
                        onPress={() =>
                          openComments(
                            post
                          )
                        }
                        activeOpacity={
                          0.7
                        }
                      >
                        <MessageCircle
                          color="#94A3B8"
                          size={
                            19
                          }
                        />

                        <Text
                          style={
                            styles.engagementText
                          }
                        >
                          {
                            totalComments
                          }
                        </Text>

                        <Text
                          style={
                            styles.engagementLabel
                          }
                        >
                          کۆمێنت
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Inline Comments */}

                    {postComments.length >
                      0 && (
                      <View
                        style={
                          styles.inlineComments
                        }
                      >
                        {postComments
                          .slice(
                            0,
                            3
                          )
                          .map(
                            (
                              comment
                            ) => (
                              <View
                                key={
                                  comment.id
                                }
                                style={
                                  styles.inlineComment
                                }
                              >
                                <Text
                                  style={
                                    styles.inlineCommentText
                                  }
                                >
                                  {
                                    comment.comment_text
                                  }
                                </Text>
                              </View>
                            )
                          )}

                        {totalComments >
                          3 && (
                          <TouchableOpacity
                            style={
                              styles.moreCommentsButton
                            }
                            onPress={() =>
                              openComments(
                                post
                              )
                            }
                            activeOpacity={
                              0.75
                            }
                          >
                            <Text
                              style={
                                styles.moreCommentsText
                              }
                            >
                              بینینی هەموو
                              کۆمێنتەکان
                            </Text>

                            <ChevronDown
                              color="#D4AF37"
                              size={
                                17
                              }
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            }
          )
        )}
      </ScrollView>

      {/* =================================================
          Add / Edit Post Modal
      ================================================= */}

      <Modal
        visible={
          modalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <KeyboardAvoidingView
            behavior={
              Platform.OS ===
              "ios"
                ? "padding"
                : "height"
            }
            style={
              styles.keyboardContainer
            }
          >
            <View
              style={
                styles.modalCard
              }
            >
              {renderFormHeader()}

              <ScrollView
                style={
                  styles.formScroll
                }
                contentContainerStyle={
                  styles.formScrollContent
                }
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
              >
                {renderDynamicForm()}
              </ScrollView>

              <View
                style={
                  styles.modalActions
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  onPress={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  <Text
                    style={
                      styles.cancelText
                    }
                  >
                    پاشگەزبوونەوە
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.disabledButton,
                  ]}
                  onPress={
                    handleAddPost
                  }
                  disabled={
                    saving
                  }
                  activeOpacity={
                    0.7
                  }
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#000"
                    />
                  ) : (
                    <>
                      <Check
                        color="#000"
                        size={
                          19
                        }
                      />

                      <Text
                        style={
                          styles.saveText
                        }
                      >
                        {editingPost
                          ? "پاشەکەوتکردنی گۆڕانکاری"
                          : "بڵاوکردنەوە"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* =================================================
          Comments Modal
      ================================================= */}

      <Modal
        visible={
          commentModalVisible
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
            style={[
              styles.modalCard,
              styles.commentModalCard,
            ]}
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              هەموو کۆمێنتەکان
            </Text>

            {selectedPost && (
              <Text
                style={
                  styles.modalSection
                }
              >
                {
                  selectedPost.title
                }
              </Text>
            )}

            <ScrollView
              style={
                styles.commentsList
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {commentsLoading ? (
                <View
                  style={
                    styles.commentLoading
                  }
                >
                  <ActivityIndicator
                    color="#D97706"
                  />
                </View>
              ) : comments.length ===
                0 ? (
                <Text
                  style={
                    styles.noComments
                  }
                >
                  هێشتا هیچ کۆمێنتێک
                  نییە.
                </Text>
              ) : (
                comments.map(
                  (comment) => {
                    const isOwner =
                      !!clientId &&
                      comment.client_id ===
                        clientId;

                    return (
                      <View
                        key={
                          comment.id
                        }
                        style={
                          styles.commentCard
                        }
                      >
                        <Text
                          style={
                            styles.commentText
                          }
                        >
                          {
                            comment.comment_text
                          }
                        </Text>

                        {(
                          isOwner ||
                          isAdmin
                        ) && (
                          <View
                            style={
                              styles.commentActions
                            }
                          >
                            {isOwner && (
                              <TouchableOpacity
                                style={
                                  styles.commentActionButton
                                }
                                onPress={() =>
                                  handleEditComment(
                                    comment
                                  )
                                }
                                disabled={
                                  commentSaving
                                }
                              >
                                <Pencil
                                  color="#D4AF37"
                                  size={
                                    15
                                  }
                                />

                                <Text
                                  style={
                                    styles.editCommentText
                                  }
                                >
                                  دەستکاری
                                </Text>
                              </TouchableOpacity>
                            )}

                          <TouchableOpacity
  style={styles.commentActionButton}
  onPress={() => deleteComment(comment)}
  activeOpacity={0.7}
>
  <Trash2
    color="#EF4444"
    size={15}
  />

  <Text style={styles.deleteCommentText}>
    سڕینەوە
  </Text>
</TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  }
                )
              )}
            </ScrollView>

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
              placeholder={
                editingCommentId
                  ? "کۆمێنتەکە دەستکاری بکە..."
                  : "کۆمێنتەکەت بنووسە..."
              }
              placeholderTextColor="#64748B"
              textAlign="right"
              multiline
              editable={
                !commentSaving
              }
            />

            <View
              style={
                styles.commentActionsBottom
              }
            >
              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={
                  closeCommentsModal
                }
                disabled={
                  commentSaving
                }
              >
                <Text
                  style={
                    styles.cancelText
                  }
                >
                  داخستن
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  commentSaving &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleAddComment
                }
                disabled={
                  commentSaving
                }
              >
                {commentSaving ? (
                  <ActivityIndicator
                    size="small"
                    color="#000"
                  />
                ) : (
                  <>
                    {editingCommentId ? (
                      <Pencil
                        color="#000"
                        size={
                          18
                        }
                      />
                    ) : (
                      <MessageCircle
                        color="#000"
                        size={
                          18
                        }
                      />
                    )}

                    <Text
                      style={
                        styles.saveText
                      }
                    >
                      {editingCommentId
                        ? "پاشەکەوتکردن"
                        : "ناردن"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* =====================================================
   Meta Info Component
===================================================== */

function MetaInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <View
      style={
        styles.metaInfo
      }
    >
      <Icon
        color="#D4AF37"
        size={
          16
        }
      />

      <View
        style={
          styles.metaInfoTextBox
        }
      >
        <Text
          style={
            styles.metaInfoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.metaInfoValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* =====================================================
   Styles
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B131F",
  },

  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2C3D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 19,
    fontWeight: "900",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#172554",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  heroCard: {
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor:
      "rgba(217,119,6,0.12)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 14,
  },

  title: {
    color: "#FFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 8,
  },

  description: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "right",
  },

  addButton: {
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: "#D97706",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },

  addButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "900",
  },

  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  loadingText: {
    color: "#718096",
    marginTop: 12,
    fontSize: 13,
  },

  emptyBox: {
    backgroundColor: "#131D2A",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    color: "#718096",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 7,
  },

  postCard: {
    backgroundColor: "#131D2A",
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    padding: 1,
  },

  postImage: {
    width: "100%",
    height: 190,
  },

  postContent: {
    padding: 17,
  },

  postTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  postTitle: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 28,
    flex: 1,
  },

  importantPostTitle: {
    color: "#F59E0B",
    fontSize: 19,
    fontWeight: "900",
  },

  urgentPostTitle: {
    color: "#EF4444",
    fontSize: 20,
    fontWeight: "900",
  },

  adminPostActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  editPostButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1B2433",
    borderWidth: 1,
    borderColor: "#66551D",
    alignItems: "center",
    justifyContent: "center",
  },

  deletePostButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#24151A",
    borderWidth: 1,
    borderColor: "#6B2932",
    alignItems: "center",
    justifyContent: "center",
  },

  postText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 25,
    textAlign: "right",
  },

  writtenDateRow: {
    marginTop: 13,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },

  writtenDateText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },

  postFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 22,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A3748",
  },

  engagementButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },

  engagementText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "800",
  },

  engagementLabel: {
    color: "#7F8EA3",
    fontSize: 11,
    fontWeight: "700",
  },

  inlineComments: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#2A3748",
    paddingTop: 10,
    gap: 7,
  },

  inlineComment: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#263447",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  inlineCommentText: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "right",
  },

  moreCommentsButton: {
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: "#1B2433",
    borderWidth: 1,
    borderColor: "#66551D",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 10,
    marginTop: 2,
  },

  moreCommentsText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "800",
  },

  /* ===================================================
     Meta
  =================================================== */

  metaBadge: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 11,
  },

  metaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  metaBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  metaGrid: {
    gap: 8,
    marginBottom: 12,
  },

  metaInfo: {
    minHeight: 42,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#243244",
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  metaInfoTextBox: {
    flex: 1,
    alignItems: "flex-end",
  },

  metaInfoLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },

  metaInfoValue: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "right",
  },

  projectStatusBadge: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 11,
  },

  projectStatusText: {
    fontSize: 11,
    fontWeight: "900",
  },

  contactMetaBox: {
    gap: 8,
    marginBottom: 12,
  },

  contactAction: {
    minHeight: 44,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#243244",
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  contactActionText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "800",
  },

  /* ===================================================
     Modal
  =================================================== */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },

  keyboardContainer: {
    width: "100%",
    maxHeight: "94%",
  },

  modalCard: {
    backgroundColor: "#131D2A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    borderTopWidth: 1,
    borderColor: "#334155",
    maxHeight: "94%",
  },

  commentModalCard: {
    minHeight: "68%",
    maxHeight: "88%",
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right",
  },

  modalSection: {
    color: "#D97706",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 5,
    marginBottom: 15,
  },

  formHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },

  formHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor:
      "rgba(217,119,6,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  formHeaderTextBox: {
    flex: 1,
    alignItems: "flex-end",
  },

  formHeaderTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
  },

  formHeaderSubtitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "right",
  },

  formScroll: {
    flexGrow: 0,
  },

  formScrollContent: {
    paddingBottom: 10,
  },

  fieldBlock: {
    marginBottom: 14,
  },

  fieldLabel: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 7,
  },

  requiredMark: {
    color: "#EF4444",
  },

  modalInput: {
    minHeight: 52,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    color: "#FFF",
    paddingHorizontal: 13,
    fontSize: 14,
  },

  textArea: {
    minHeight: 125,
    paddingTop: 13,
  },

  readOnlyField: {
    minHeight: 52,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },

  readOnlyFieldText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    textAlign: "right",
  },

  autoText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "900",
    backgroundColor:
      "rgba(212,175,55,0.12)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  sectionBox: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#263447",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },

  sectionBoxTitle: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 10,
  },

  choiceRow: {
    gap: 8,
  },

  choiceChip: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 11,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 11,
  },

  colorDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  choiceText: {
    fontSize: 12,
    fontWeight: "900",
  },

  typePreview: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    marginBottom: 14,
  },

  typePreviewLabel: {
    fontSize: 10,
    fontWeight: "900",
    textAlign: "right",
  },

  typePreviewTitle: {
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 4,
  },

  statusList: {
    gap: 7,
  },

  statusOption: {
    minHeight: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#263447",
    backgroundColor: "#131D2A",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },

  statusOptionActive: {
    borderColor: "#D4AF37",
    backgroundColor:
      "rgba(212,175,55,0.06)",
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  statusOptionText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },

  statusOptionTextActive: {
    color: "#FFF",
    fontWeight: "900",
  },

  imageButton: {
    minHeight: 150,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  imageEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },

  imageIconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor:
      "rgba(217,119,6,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  imageButtonText: {
    color: "#D97706",
    fontSize: 13,
    fontWeight: "900",
  },

  imageHint: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },

  previewImage: {
    width: "100%",
    height: 170,
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 48,
    backgroundColor:
      "rgba(0,0,0,0.55)",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  imageOverlayText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
  },

  phoneInputBox: {
    minHeight: 52,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 7,
  },

  phoneInput: {
    flex: 1,
    color: "#FFF",
    paddingHorizontal: 9,
    fontSize: 14,
    textAlign: "right",
  },

  phoneActionButton: {
    width: 39,
    height: 39,
    borderRadius: 10,
    backgroundColor: "#172033",
    alignItems: "center",
    justifyContent: "center",
  },

  modalActions: {
    flexDirection: "row-reverse",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#263447",
  },

  cancelButton: {
    flex: 1,
    minHeight: 50,
    backgroundColor: "#374151",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: "#FFF",
    fontWeight: "800",
  },

  saveButton: {
    flex: 1,
    minHeight: 50,
    backgroundColor: "#D97706",
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  saveText: {
    color: "#000",
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },

  /* ===================================================
     Comments
  =================================================== */

  commentsList: {
    flex: 1,
    marginBottom: 12,
  },

  commentLoading: {
    paddingVertical: 30,
    alignItems: "center",
  },

  noComments: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 25,
  },

  commentCard: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#263447",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  commentText: {
    color: "#E2E8F0",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "right",
  },

  commentActions: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#263447",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 18,
  },

  commentActionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },

  editCommentText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "800",
  },

  deleteCommentText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "800",
  },

  commentInput: {
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    color: "#FFF",
    paddingHorizontal: 13,
    paddingTop: 12,
    marginBottom: 10,
    textAlign: "right",
    textAlignVertical: "top",
  },

  commentActionsBottom: {
    flexDirection: "row-reverse",
    gap: 10,
  },
});