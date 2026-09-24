import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "../lib/supabase";

/* =====================================================
   Base64 → Blob
===================================================== */

const b64toBlob = (
  b64Data,
  contentType = "",
  sliceSize = 512
) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (
    let offset = 0;
    offset < byteCharacters.length;
    offset += sliceSize
  ) {
    const slice = byteCharacters.slice(
      offset,
      offset + sliceSize
    );

    const byteNumbers = new Array(slice.length);

    for (
      let i = 0;
      i < slice.length;
      i++
    ) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(
      byteNumbers
    );

    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, {
    type: contentType,
  });
};

/* =====================================================
   Tree Screen
===================================================== */

export default function TreeScreen({
  route,
  navigation,
}) {
  /*
   * تێبینی گرنگ:
   *
   * TreeScreen بە شێوەی ئاسایی = isAdmin false
   *
   * تەنها ManageTreeScreen:
   *
   * route.params.isAdmin === true
   *
   * دەسەڵاتی زیادکردن، دەستکاری و سڕینەوەی
   * کەسانی شجرەنامەی هەیە.
   */
  const [isAdmin, setIsAdmin] =
    useState(false);

  const [
    selectedMember,
    setSelectedMember,
  ] = useState(null);

  const [
    allMembers,
    setAllMembers,
  ] = useState([]);

  const [children, setChildren] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  /* -----------------------------------------------------
     Search
  ----------------------------------------------------- */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  /* -----------------------------------------------------
     Member Modal
  ----------------------------------------------------- */

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    relationType,
    setRelationType,
  ] = useState("son");

  const [
    birthYear,
    setBirthYear,
  ] = useState("");

  const [
    deathYear,
    setDeathYear,
  ] = useState("");

  const [
    imageUrl,
    setImageUrl,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  /* -----------------------------------------------------
     Social
  ----------------------------------------------------- */

  const [
    likesCount,
    setLikesCount,
  ] = useState(0);

  const [
    hasLiked,
    setHasLiked,
  ] = useState(false);

  const [comments, setComments] =
    useState([]);

  const [
    newComment,
    setNewComment,
  ] = useState("");

  /* -----------------------------------------------------
     Comment Identity
  ----------------------------------------------------- */

  const [
    clientId,
    setClientId,
  ] = useState(null);

  const [
    editingCommentId,
    setEditingCommentId,
  ] = useState(null);

  const [
    editingCommentText,
    setEditingCommentText,
  ] = useState("");

  /* =====================================================
     Client ID
===================================================== */

  const initializeComments =
    useCallback(async () => {
      try {
        let id =
          await AsyncStorage.getItem(
            "blesan_family_comment_client_id"
          );

        if (!id) {
          id = `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 10)}`;

          await AsyncStorage.setItem(
            "blesan_family_comment_client_id",
            id
          );
        }

        setClientId(id);
      } catch (error) {
        console.log(
          "CLIENT ID ERROR:",
          error
        );
      }
    }, []);

  /* =====================================================
     Admin + Members
===================================================== */

  const checkAdminAndFetchData =
    useCallback(async () => {
      setLoading(true);

      try {
        /*
         * گرنگ:
         *
         * لە TreeScreen ـی ئاسایی هەرگیز لە
         * Supabase user/email ـەوە admin دروست ناکرێت.
         *
         * تەنها ManageTreeScreen دەتوانێت:
         *
         * isAdmin: true
         *
         * بنێرێت.
         */

        const adminMode =
          route?.params?.isAdmin === true;

        setIsAdmin(adminMode);

        const {
          data,
          error,
        } = await supabase
          .from("family_tree")
          .select("*");

        if (!error && data) {
          setAllMembers(data);
        } else if (error) {
          console.log(
            "TREE DATA ERROR:",
            error
          );

          setAllMembers([]);
        }
      } catch (error) {
        console.log(
          "TREE LOAD ERROR:",
          error
        );

        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }, [route?.params?.isAdmin]);

  /* =====================================================
     Initial Load
===================================================== */

  useEffect(() => {
    initializeComments();
    checkAdminAndFetchData();
  }, [
    initializeComments,
    checkAdminAndFetchData,
  ]);

  /* =====================================================
     Search
===================================================== */

  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered =
      allMembers.filter((member) =>
        String(member.name || "")
          .toLowerCase()
          .includes(
            text.toLowerCase()
          )
      );

    setSearchResults(filtered);
  };

  /* =====================================================
     Build Ancestry
===================================================== */

  const buildAncestryTree = (
    member,
    membersList
  ) => {
    const chain = [];
    let current = member;

    while (current) {
      chain.unshift(current);

      if (current.parent_id) {
        current =
          membersList.find(
            (item) =>
              item.id ===
              current.parent_id
          ) || null;
      } else {
        current = null;
      }
    }

    return chain;
  };

  /* =====================================================
     Count All Descendants
===================================================== */

  const getDescendantCount = (
    parentId
  ) => {
    let count = 0;

    const countChildren = (
      currentParentId
    ) => {
      const directChildren =
        allMembers.filter(
          (member) =>
            member.parent_id ===
            currentParentId
        );

      count += directChildren.length;

      directChildren.forEach(
        (child) => {
          countChildren(child.id);
        }
      );
    };

    countChildren(parentId);

    return count;
  };

  /* =====================================================
     Select Member
===================================================== */

  const handleSelectMember = (
    member
  ) => {
    setSelectedMember(member);

    setSearchQuery("");
    setSearchResults([]);

    const fullHistory =
      buildAncestryTree(
        member,
        allMembers
      );

    setHistory(fullHistory);

    fetchChildren(member.id);
    fetchSocialData(member.id);
  };

  /* =====================================================
     Children
===================================================== */

  const fetchChildren = async (
    parentId
  ) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("family_tree")
        .select("*")
        .eq(
          "parent_id",
          parentId
        );

      if (!error && data) {
        setChildren(data);
      } else {
        setChildren([]);
      }
    } catch (error) {
      console.log(
        "FETCH CHILDREN ERROR:",
        error
      );

      setChildren([]);
    }
  };

  /* =====================================================
     Breadcrumb Navigation
===================================================== */

  const handleBreadcrumbClick = (
    index
  ) => {
    const updatedHistory =
      history.slice(0, index + 1);

    const targetMember =
      updatedHistory[
        updatedHistory.length - 1
      ];

    if (!targetMember) {
      return;
    }

    setHistory(updatedHistory);
    setSelectedMember(targetMember);

    fetchChildren(
      targetMember.id
    );

    fetchSocialData(
      targetMember.id
    );
  };

  /* =====================================================
     Back Navigation
===================================================== */

  const handleGoBack = () => {
    if (history.length > 1) {
      const newHistory = [
        ...history,
      ];

      newHistory.pop();

      const previousMember =
        newHistory[
          newHistory.length - 1
        ];

      setHistory(newHistory);
      setSelectedMember(
        previousMember
      );

      fetchChildren(
        previousMember.id
      );

      fetchSocialData(
        previousMember.id
      );

      return;
    }

    if (selectedMember) {
      setSelectedMember(null);
      setChildren([]);
      setHistory([]);

      setSearchQuery("");
      setSearchResults([]);

      setLikesCount(0);
      setHasLiked(false);
      setComments([]);

      setEditingCommentId(null);
      setEditingCommentText("");

      return;
    }

    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  /* =====================================================
     Social Data
===================================================== */

  const fetchSocialData = async (
    memberId
  ) => {
    try {
      const {
        data: likes,
        error: likesError,
      } = await supabase
        .from("family_likes")
        .select("*")
        .eq(
          "member_id",
          memberId
        );

      if (!likesError) {
        setLikesCount(
          likes ? likes.length : 0
        );
      } else {
        setLikesCount(0);
      }

      const {
        data: comms,
        error: commentsError,
      } = await supabase
        .from("family_comments")
        .select("*")
        .eq(
          "member_id",
          memberId
        )
        .order("created_at", {
          ascending: false,
        });

      if (!commentsError) {
        setComments(comms || []);
      } else {
        console.log(
          "COMMENTS LOAD ERROR:",
          commentsError
        );

        setComments([]);
      }

      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (error) {
      console.log(
        "SOCIAL DATA ERROR:",
        error
      );

      setLikesCount(0);
      setComments([]);
    }
  };

  /* =====================================================
     Like
===================================================== */

  const handleToggleLike = async () => {
    if (!selectedMember) {
      return;
    }

    setHasLiked(!hasLiked);

    setLikesCount((prev) =>
      hasLiked
        ? Math.max(prev - 1, 0)
        : prev + 1
    );

    if (!hasLiked) {
      const { error } =
        await supabase
          .from("family_likes")
          .insert([
            {
              member_id:
                selectedMember.id,
            },
          ]);

      if (error) {
        console.log(
          "LIKE ERROR:",
          error
        );
      }
    }
  };

  /* =====================================================
     Add Comment
===================================================== */

  const handleAddComment = async () => {
    if (
      !newComment.trim() ||
      !selectedMember ||
      !clientId
    ) {
      return;
    }

    const commentObj = {
      member_id:
        selectedMember.id,
      text: newComment.trim(),
      client_id: clientId,
    };

    try {
      const {
        data,
        error,
      } = await supabase
        .from("family_comments")
        .insert([commentObj])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setComments((previous) => [
          data,
          ...previous,
        ]);

        setNewComment("");
      }
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
    }
  };

  /* =====================================================
     Start Edit Comment
===================================================== */

  const startEditComment = (
    comment
  ) => {
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

    setEditingCommentId(
      comment.id
    );

    setEditingCommentText(
      comment.text || ""
    );
  };

  /* =====================================================
     Save Edited Comment
===================================================== */

  const saveEditedComment =
    async () => {
      if (
        !editingCommentId ||
        !editingCommentText.trim() ||
        !clientId
      ) {
        return;
      }

      try {
        let query = supabase
          .from("family_comments")
          .update({
            text: editingCommentText.trim(),
          })
          .eq(
            "id",
            editingCommentId
          );

        if (!isAdmin) {
          query = query.eq(
            "client_id",
            clientId
          );
        }

        const { error } =
          await query;

        if (error) {
          throw error;
        }

        setComments((previous) =>
          previous.map(
            (comment) =>
              comment.id ===
              editingCommentId
                ? {
                    ...comment,
                    text: editingCommentText.trim(),
                  }
                : comment
          )
        );

        setEditingCommentId(null);
        setEditingCommentText("");
      } catch (error) {
        console.log(
          "EDIT COMMENT ERROR:",
          error
        );

        Alert.alert(
          "هەڵە",
          error?.message ||
            "کۆمێنتەکە دەستکاری نەکرا."
        );
      }
    };

  /* =====================================================
     Delete Comment
===================================================== */

  const handleDeleteComment =
    async (comment) => {
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
          .from("family_comments")
          .delete()
          .eq(
            "id",
            comment.id
          );

        if (!isAdmin) {
          query = query.eq(
            "client_id",
            clientId
          );
        }

        const { error } =
          await query;

        if (error) {
          throw error;
        }

        setComments((previous) =>
          previous.filter(
            (item) =>
              item.id !== comment.id
          )
        );

        if (
          editingCommentId ===
          comment.id
        ) {
          setEditingCommentId(null);
          setEditingCommentText("");
        }

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
     Pick + Upload Image
===================================================== */

  const pickAndUploadImage =
    async () => {
      /*
       * پاراستنی زیادە:
       * بەکارهێنەری ئاسایی ناتوانێت
       * فۆڕمی زیادکردن/دەستکاریکردن بەکاربهێنێت.
       */
      if (!isAdmin) {
        Alert.alert(
          "دەسەڵات نییە",
          "تەنها بەڕێوەبەر دەتوانێت وێنەی کەسەکانی شجرەنامە زیاد یان بگۆڕێت."
        );

        return null;
      }

      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "ڕێگەپێدان",
            "تکایە ڕێگە بدە بە ئەپەکە بۆ گەلەری."
          );

          return null;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            }
          );

        if (
          result.canceled ||
          !result.assets?.[0]
        ) {
          return null;
        }

        const image =
          result.assets[0];

        setUploadingImage(true);

        const fileExt =
          image.uri
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const filePath = `tree/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.${fileExt}`;

        let bodyData;

        if (image.base64) {
          bodyData = b64toBlob(
            image.base64,
            `image/${fileExt}`
          );
        } else {
          const response =
            await fetch(image.uri);

          bodyData =
            await response.blob();
        }

        const { error } =
          await supabase.storage
            .from("images")
            .upload(
              filePath,
              bodyData,
              {
                contentType: `image/${fileExt}`,
                upsert: true,
              }
            );

        if (error) {
          throw error;
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        const publicUrl =
          publicUrlData?.publicUrl;

        if (!publicUrl) {
          throw new Error(
            "Public URL دروست نەکرا."
          );
        }

        setImageUrl(publicUrl);

        return publicUrl;
      } catch (error) {
        console.log(
          "UPLOAD IMAGE ERROR:",
          error
        );

        Alert.alert(
          "هەڵە",
          "وێنەکە بار نەکرا."
        );

        return null;
      } finally {
        setUploadingImage(false);
      }
    };

  /* =====================================================
     Open Member Modal
===================================================== */

  const openAddModal = (
    isEdit = false
  ) => {
    /*
     * بەکارهێنەری ئاسایی ناتوانێت
     * modal ـی زیادکردن/دەستکاری بکات.
     */
    if (!isAdmin) {
      Alert.alert(
        "دەسەڵات نییە",
        "تەنها بەڕێوەبەر دەتوانێت زانیاری شجرەنامە زیاد یان دەستکاری بکات."
      );

      return;
    }

    setIsEditing(isEdit);

    if (
      isEdit &&
      selectedMember
    ) {
      setFullName(
        selectedMember.name || ""
      );

      setRelationType(
        selectedMember.relation_type ||
          "son"
      );

      setBirthYear(
        selectedMember.birth_year
          ? String(
              selectedMember.birth_year
            )
          : ""
      );

      setDeathYear(
        selectedMember.death_year
          ? String(
              selectedMember.death_year
            )
          : ""
      );

      setImageUrl(
        selectedMember.image_url ||
          ""
      );

      setNotes(
        selectedMember.notes || ""
      );
    } else {
      setFullName("");
      setRelationType("son");
      setBirthYear("");
      setDeathYear("");
      setImageUrl("");
      setNotes("");
    }

    setModalVisible(true);
  };

  /* =====================================================
     Save Member
===================================================== */

  const handleSaveMember =
    async () => {
      if (!isAdmin) {
        Alert.alert(
          "دەسەڵات نییە",
          "تەنها بەڕێوەبەر دەتوانێت کەس زیاد یان دەستکاری بکات."
        );

        return;
      }

      if (!fullName.trim()) {
        Alert.alert(
          "ئاگاداری",
          "تکایە ناوی تەواو بنووسە."
        );

        return;
      }

      setLoading(true);

      const memberData = {
        name: fullName.trim(),

        relation_type:
          relationType,

        birth_year: birthYear
          ? parseInt(
              birthYear,
              10
            )
          : null,

        death_year: deathYear
          ? parseInt(
              deathYear,
              10
            )
          : null,

        image_url:
          imageUrl.trim() || null,

        notes:
          notes.trim() || null,

        parent_id: isEditing
          ? selectedMember?.parent_id ||
            null
          : selectedMember
          ? selectedMember.id
          : null,
      };

      try {
        if (isEditing) {
          const {
            error,
          } = await supabase
            .from("family_tree")
            .update(memberData)
            .eq(
              "id",
              selectedMember.id
            );

          if (error) {
            throw error;
          }
        } else {
          const {
            error,
          } = await supabase
            .from("family_tree")
            .insert([
              memberData,
            ]);

          if (error) {
            throw error;
          }
        }

        await checkAdminAndFetchData();

        setModalVisible(false);

        setFullName("");
        setRelationType("son");
        setBirthYear("");
        setDeathYear("");
        setImageUrl("");
        setNotes("");

        if (selectedMember) {
          await fetchChildren(
            selectedMember.id
          );
        }
      } catch (error) {
        console.log(
          "SAVE MEMBER ERROR:",
          error
        );

        Alert.alert(
          "هەڵە",
          error?.message ||
            "پاشەکەوت نەکرا."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     Delete Member
===================================================== */

  const handleDeleteMember =
    async () => {
      /*
       * ئەمە یەکێکە لە گرنگترین
       * پاراستنەکان.
       */
      if (
        !isAdmin ||
        !selectedMember
      ) {
        Alert.alert(
          "دەسەڵات نییە",
          "تەنها بەڕێوەبەر دەتوانێت کەسێک بسڕێتەوە."
        );

        return;
      }

      Alert.alert(
        "سڕینەوە",
        `دڵنیایت لە سڕینەوەی (${selectedMember.name})؟`,
        [
          {
            text: "نەخێر",
            style: "cancel",
          },
          {
            text: "بەڵێ",
            style: "destructive",

            onPress: async () => {
              try {
                const {
                  error,
                } = await supabase
                  .from("family_tree")
                  .delete()
                  .eq(
                    "id",
                    selectedMember.id
                  );

                if (error) {
                  throw error;
                }

                setSelectedMember(null);
                setChildren([]);
                setHistory([]);

                setLikesCount(0);
                setHasLiked(false);
                setComments([]);

                setEditingCommentId(null);
                setEditingCommentText("");

                await checkAdminAndFetchData();
              } catch (error) {
                console.log(
                  "DELETE MEMBER ERROR:",
                  error
                );

                Alert.alert(
                  "هەڵە",
                  error?.message ||
                    "کەسەکە نەسڕایەوە."
                );
              }
            },
          },
        ]
      );
    };

  /* =====================================================
     Root Branches
===================================================== */

  const rootBranches =
    allMembers.filter(
      (item) =>
        !item.parent_id ||
        item.parent_id === "" ||
        item.parent_id === null
    );

  /* =====================================================
     Render
===================================================== */

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* =================================================
          Header
      ================================================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleGoBack}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          {selectedMember
            ? selectedMember.name
            : "شەجەرەنامەی خێزانی"}
        </Text>

        <View
          style={{
            width: 40,
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =================================================
            Search
        ================================================= */}

        <View
          style={
            styles.searchContainer
          }
        >
          <Ionicons
            name="search"
            size={20}
            color="#9ca3af"
            style={{
              marginRight: 8,
            }}
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="گەڕان بەدوای ناوێک..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* =================================================
            Search Results
        ================================================= */}

        {searchResults.length >
          0 && (
          <View
            style={
              styles.searchResultsBox
            }
          >
            {searchResults.map(
              (item) => (
                <TouchableOpacity
                  key={item.id}
                  style={
                    styles.searchItem
                  }
                  onPress={() =>
                    handleSelectMember(
                      item
                    )
                  }
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="#f59e0b"
                  />

                  <Text
                    style={
                      styles.searchItemText
                    }
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* =================================================
            Root Tree
        ================================================= */}

        {!selectedMember ? (
          <View
            style={
              styles.treeVisualBox
            }
          >
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#f59e0b"
              />
            ) : (
              <View
                style={
                  styles.verticalContainer
                }
              >
                <View
                  style={
                    styles.centerNode
                  }
                >
                  <Text
                    style={
                      styles.centerNodeText
                    }
                  >
                    بڵەسەن
                  </Text>
                </View>

                <View
                  style={
                    styles.connectorLine
                  }
                />

                <View
                  style={
                    styles.branchesColumn
                  }
                >
                  {rootBranches.map(
                    (branch) => (
                      <TouchableOpacity
                        key={branch.id}
                        style={
                          styles.branchNodeVertical
                        }
                        onPress={() =>
                          handleSelectMember(
                            branch
                          )
                        }
                      >
                        {branch.image_url ? (
                          <Image
                            source={{
                              uri: branch.image_url,
                            }}
                            style={
                              styles.avatarImg
                            }
                          />
                        ) : (
                          <View
                            style={
                              styles.placeholderAvatarImg
                            }
                          >
                            <Ionicons
                              name="person"
                              size={24}
                              color="#f59e0b"
                            />
                          </View>
                        )}

                        <View
                          style={
                            styles.nodeDetails
                          }
                        >
                          <Text
                            style={
                              styles.nodeName
                            }
                          >
                            {branch.name}
                          </Text>

                          <Text
                            style={
                              styles.nodeCount
                            }
                          >
                            {getDescendantCount(
                              branch.id
                            )}{" "}
                            کەس
                          </Text>

                          <Text
                            style={
                              styles.nodeYear
                            }
                          >
                            {branch.birth_year
                              ? `لەدایکبوون: ${branch.birth_year}`
                              : "---"}
                          </Text>
                        </View>

                        <Ionicons
                          name="chevron-back"
                          size={20}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            )}

            {/* =================================================
                Admin: Add Root
            ================================================= */}

            {isAdmin && (
              <TouchableOpacity
                style={
                  styles.addRootBtn
                }
                onPress={() =>
                  openAddModal(false)
                }
              >
                <Ionicons
                  name="add"
                  size={20}
                  color="#000"
                />

                <Text
                  style={
                    styles.addRootBtnText
                  }
                >
                  زیادکردنی لقی سەرەکی
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View
            style={
              styles.profileContainer
            }
          >
            {/* =================================================
                Breadcrumb
            ================================================= */}

            <View
              style={
                styles.breadcrumbBar
              }
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
              >
                {history.map(
                  (item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() =>
                        handleBreadcrumbClick(
                          index
                        )
                      }
                      style={
                        styles.breadcrumbItem
                      }
                    >
                      <Text
                        style={[
                          styles.breadcrumbText,
                          index ===
                            history.length -
                              1 &&
                            styles.breadcrumbActive,
                        ]}
                      >
                        {item.name}
                      </Text>

                      {index <
                        history.length -
                          1 && (
                        <Ionicons
                          name="chevron-back"
                          size={14}
                          color="#6b7280"
                        />
                      )}
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </View>

            {/* =================================================
                Profile Card
            ================================================= */}

            <View
              style={
                styles.profileCard
              }
            >
              {selectedMember.image_url ? (
                <Image
                  source={{
                    uri: selectedMember.image_url,
                  }}
                  style={
                    styles.largeAvatar
                  }
                />
              ) : (
                <View
                  style={
                    styles.placeholderLargeAvatar
                  }
                >
                  <Ionicons
                    name="person"
                    size={40}
                    color="#f59e0b"
                  />
                </View>
              )}

              <Text
                style={
                  styles.profileName
                }
              >
                {selectedMember.name}
              </Text>

              <Text
                style={
                  styles.profileYears
                }
              >
                {selectedMember.birth_year ||
                  "؟"}{" "}
                -{" "}
                {selectedMember.death_year ||
                  "زیندووە"}
              </Text>

              {selectedMember.notes && (
                <Text
                  style={
                    styles.profileNotes
                  }
                >
                  {selectedMember.notes}
                </Text>
              )}

              {/* =================================================
                  Admin Member Actions
              ================================================= */}

              {isAdmin && (
                <View
                  style={
                    styles.actionButtonsRow
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.editBtn
                    }
                    onPress={() =>
                      openAddModal(true)
                    }
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color="#f59e0b"
                    />

                    <Text
                      style={
                        styles.editBtnText
                      }
                    >
                      دەستکاری
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.deleteBtn
                    }
                    onPress={
                      handleDeleteMember
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#ef4444"
                    />

                    <Text
                      style={
                        styles.deleteBtnText
                      }
                    >
                      سڕینەوە
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* =================================================
                Children
            ================================================= */}

            <View
              style={
                styles.childrenSection
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  منداڵەکان (
                  {children.length})
                </Text>
              </View>

              {children.map(
                (child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={
                      styles.childCard
                    }
                    onPress={() =>
                      handleSelectMember(
                        child
                      )
                    }
                  >
                    {child.image_url ? (
                      <Image
                        source={{
                          uri: child.image_url,
                        }}
                        style={
                          styles.childAvatar
                        }
                      />
                    ) : (
                      <Ionicons
                        name="person-circle-outline"
                        size={36}
                        color="#f59e0b"
                      />
                    )}

                    <View
                      style={{
                        flex: 1,
                        marginLeft: 12,
                      }}
                    >
                      <Text
                        style={
                          styles.childName
                        }
                      >
                        {child.name}
                      </Text>

                      <Text
                        style={
                          styles.childYear
                        }
                      >
                        {child.birth_year ||
                          "---"}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                )
              )}

              {/* =================================================
                  Admin: Add Child
              ================================================= */}

              {isAdmin && (
                <TouchableOpacity
                  style={
                    styles.addChildBtn
                  }
                  onPress={() =>
                    openAddModal(false)
                  }
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#f59e0b"
                  />

                  <Text
                    style={
                      styles.addChildText
                    }
                  >
                    زیادکردنی منداڵ
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* =================================================
                Social
            ================================================= */}

            <View
              style={
                styles.socialSection
              }
            >
              <View
                style={
                  styles.likeRow
                }
              >
                <TouchableOpacity
                  style={
                    styles.likeBtn
                  }
                  onPress={
                    handleToggleLike
                  }
                >
                  <Ionicons
                    name={
                      hasLiked
                        ? "heart"
                        : "heart-outline"
                    }
                    size={24}
                    color={
                      hasLiked
                        ? "#ef4444"
                        : "#9ca3af"
                    }
                  />

                  <Text
                    style={
                      styles.likeCount
                    }
                  >
                    {likesCount} لایک
                  </Text>
                </TouchableOpacity>
              </View>

              {/* =================================================
                  Add Comment
              ================================================= */}

              <View
                style={
                  styles.commentInputRow
                }
              >
                <TextInput
                  style={
                    styles.commentInput
                  }
                  placeholder="کۆمێنتێک بنووسە..."
                  placeholderTextColor="#9ca3af"
                  value={newComment}
                  onChangeText={
                    setNewComment
                  }
                />

                <TouchableOpacity
                  style={
                    styles.sendBtn
                  }
                  onPress={
                    handleAddComment
                  }
                >
                  <Ionicons
                    name="send"
                    size={18}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>

              {/* =================================================
                  Comments
              ================================================= */}

              {comments.map(
                (item, idx) => {
                  const canManageComment =
                    isAdmin ||
                    item.client_id ===
                      clientId;

                  const isEditingThis =
                    editingCommentId ===
                    item.id;

                  return (
                    <View
                      key={
                        item.id ||
                        idx
                      }
                      style={
                        styles.commentBubble
                      }
                    >
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={16}
                        color="#f59e0b"
                      />

                      <View
                        style={
                          styles.commentContent
                        }
                      >
                        {isEditingThis ? (
                          <>
                            <TextInput
                              style={
                                styles.editCommentInput
                              }
                              value={
                                editingCommentText
                              }
                              onChangeText={
                                setEditingCommentText
                              }
                              multiline
                              placeholderTextColor="#9ca3af"
                            />

                            <View
                              style={
                                styles.commentActionsRow
                              }
                            >
                              <TouchableOpacity
                                style={
                                  styles.commentSaveBtn
                                }
                                onPress={
                                  saveEditedComment
                                }
                              >
                                <Text
                                  style={
                                    styles.commentSaveText
                                  }
                                >
                                  پاشەکەوت
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={
                                  styles.commentCancelBtn
                                }
                                onPress={() => {
                                  setEditingCommentId(
                                    null
                                  );

                                  setEditingCommentText(
                                    ""
                                  );
                                }}
                              >
                                <Text
                                  style={
                                    styles.commentCancelText
                                  }
                                >
                                  هەڵوەشاندنەوە
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        ) : (
                          <Text
                            style={
                              styles.commentText
                            }
                          >
                            {item.text}
                          </Text>
                        )}

                        {/* =================================================
                            Comment Actions
                        ================================================= */}

                        {canManageComment &&
                          !isEditingThis && (
                            <View
                              style={
                                styles.commentActionsRow
                              }
                            >
                              <TouchableOpacity
                                style={
                                  styles.commentActionButton
                                }
                                onPress={() =>
                                  startEditComment(
                                    item
                                  )
                                }
                              >
                                <Ionicons
                                  name="create-outline"
                                  size={15}
                                  color="#f59e0b"
                                />

                                <Text
                                  style={
                                    styles.editCommentText
                                  }
                                >
                                  دەستکاری
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={
                                  styles.commentActionButton
                                }
                                onPress={() =>
                                  handleDeleteComment(
                                    item
                                  )
                                }
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={15}
                                  color="#ef4444"
                                />

                                <Text
                                  style={
                                    styles.deleteCommentText
                                  }
                                >
                                  سڕینەوە
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* =====================================================
          Member Modal
      ===================================================== */}

      <Modal
        visible={
          modalVisible && isAdmin
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent:
                "center",
              padding: 20,
            }}
          >
            <View
              style={
                styles.modalContent
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                {isEditing
                  ? "دەستکاری زانیاری"
                  : "زیادکردنی کەسێکی نوێ"}
              </Text>

              {/* =================================================
                  Image
              ================================================= */}

              <TouchableOpacity
                style={
                  styles.imagePickerBtn
                }
                onPress={
                  pickAndUploadImage
                }
                disabled={
                  uploadingImage ||
                  !isAdmin
                }
              >
                {uploadingImage ? (
                  <ActivityIndicator
                    size="small"
                    color="#f59e0b"
                  />
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={20}
                    color="#f59e0b"
                  />
                )}

                <Text
                  style={
                    styles.imagePickerText
                  }
                >
                  {uploadingImage
                    ? "وێنەکە بار دەکرێت..."
                    : imageUrl
                    ? "وێنە هەڵبژێردرا (گۆڕین)"
                    : "دیاریکردنی وێنە"}
                </Text>
              </TouchableOpacity>

              {/* =================================================
                  Name
              ================================================= */}

              <TextInput
                style={
                  styles.modalInput
                }
                placeholder="ناوی تەواو"
                placeholderTextColor="#9ca3af"
                value={fullName}
                onChangeText={
                  setFullName
                }
              />

              {/* =================================================
                  Birth Year
              ================================================= */}

              <TextInput
                style={
                  styles.modalInput
                }
                placeholder="ساڵی لەدایکبوون"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={birthYear}
                onChangeText={
                  setBirthYear
                }
              />

              {/* =================================================
                  Death Year
              ================================================= */}

              <TextInput
                style={
                  styles.modalInput
                }
                placeholder="ساڵی کۆچی دوایی"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={deathYear}
                onChangeText={
                  setDeathYear
                }
              />

              {/* =================================================
                  Notes
              ================================================= */}

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    height: 80,
                  },
                ]}
                placeholder="تێبینی"
                placeholderTextColor="#9ca3af"
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              {/* =================================================
                  Modal Actions
              ================================================= */}

              <View
                style={
                  styles.modalActionButtons
                }
              >
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.cancelBtn,
                  ]}
                  onPress={() =>
                    setModalVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={
                      styles.modalBtnText
                    }
                  >
                    پاشگەزبوونەوە
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.saveBtn,
                  ]}
                  onPress={
                    handleSaveMember
                  }
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      {
                        color:
                          "#000",
                      },
                    ]}
                  >
                    تۆمارکردن
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* =====================================================
   Styles
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },

  iconBtn: {
    padding: 4,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 10,
    textAlign: "right",
  },

  searchResultsBox: {
    backgroundColor: "#1e293b",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 8,
  },

  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor:
      "#334155",
  },

  searchItemText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },

  treeVisualBox: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  verticalContainer: {
    width: "100%",
    alignItems: "center",
  },

  centerNode: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },

  centerNodeText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },

  connectorLine: {
    width: 2,
    height: 24,
    backgroundColor: "#f59e0b",
    marginVertical: 4,
  },

  branchesColumn: {
    width: "100%",
    gap: 12,
  },

  branchNodeVertical: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    width: "100%",
  },

  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },

  placeholderAvatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#334155",
    justifyContent:
      "center",
    alignItems: "center",
  },

  nodeDetails: {
    flex: 1,
    marginRight: 12,
    marginLeft: 12,
    alignItems: "flex-end",
  },

  nodeName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "right",
  },

  nodeCount: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 3,
    textAlign: "right",
  },

  nodeYear: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
  },

  addRootBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
  },

  addRootBtnText: {
    color: "#000",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },

  profileContainer: {
    paddingHorizontal: 16,
  },

  breadcrumbBar: {
    marginBottom: 12,
  },

  breadcrumbItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },

  breadcrumbText: {
    color: "#9ca3af",
    fontSize: 14,
  },

  breadcrumbActive: {
    color: "#f59e0b",
    fontWeight: "bold",
  },

  profileCard: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },

  placeholderLargeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#334155",
    justifyContent:
      "center",
    alignItems: "center",
    marginBottom: 10,
  },

  profileName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  profileYears: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 4,
  },

  profileNotes: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },

  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  editBtnText: {
    color: "#f59e0b",
    marginLeft: 4,
    fontSize: 13,
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  deleteBtnText: {
    color: "#ef4444",
    marginLeft: 4,
    fontSize: 13,
  },

  childrenSection: {
    marginBottom: 16,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },

  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  childAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  childName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  childYear: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  addChildBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  addChildText: {
    color: "#f59e0b",
    fontWeight: "bold",
    marginLeft: 6,
  },

  socialSection: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },

  likeRow: {
    marginBottom: 10,
  },

  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  likeCount: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 13,
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  commentInput: {
    flex: 1,
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    textAlign: "right",
  },

  sendBtn: {
    backgroundColor: "#f59e0b",
    padding: 10,
    borderRadius: 6,
    marginLeft: 8,
  },

  commentBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0f172a",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },

  commentContent: {
    flex: 1,
    marginLeft: 6,
  },

  commentText: {
    color: "#cbd5e1",
    fontSize: 13,
  },

  commentActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },

  commentActionButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  editCommentText: {
    color: "#f59e0b",
    fontSize: 12,
    marginLeft: 4,
  },

  deleteCommentText: {
    color: "#ef4444",
    fontSize: 12,
    marginLeft: 4,
  },

  editCommentInput: {
    backgroundColor: "#1e293b",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: "right",
    minHeight: 60,
  },

  commentSaveBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  commentSaveText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },

  commentCancelBtn: {
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  commentCancelText: {
    color: "#fff",
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.7)",
  },

  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },

  imagePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  imagePickerText: {
    color: "#f59e0b",
    marginLeft: 8,
  },

  modalInput: {
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: "right",
  },

  modalActionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  cancelBtn: {
    backgroundColor: "#ef4444",
  },

  saveBtn: {
    backgroundColor: "#f59e0b",
  },

  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});