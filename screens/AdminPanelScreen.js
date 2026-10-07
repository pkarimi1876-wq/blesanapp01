import React from "react";

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";

import {
  ShieldCheck,
  ArrowRight,
  Users,
  UserPlus,
  BookOpen,
  Heart,
  Phone,
  Megaphone,
  UserCheck,
  Lock,
  Building2,
  Mail,
  Eye,
  EyeOff,
  Home,
  ImageIcon,
} from "lucide-react-native";

export default function AdminPanelScreen({
  route,
  navigation,
}) {

  // =====================================================
  // Admin Info
  // =====================================================

  const adminInfo =
    route?.params?.adminInfo || null;

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          Header
      ================================================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.8}
        >

          <ArrowRight
            color="#FFF"
            size={22}
          />

        </TouchableOpacity>

        <View
          style={
            styles.headerTitleBox
          }
        >

          <Text
            style={
              styles.headerTitle
            }
          >
            پانێڵی بەڕێوەبەڕایەتی
          </Text>

          <ShieldCheck
            color="#D97706"
            size={22}
          />

        </View>

      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* =================================================
            Admin Profile
        ================================================= */}

        <View
          style={
            styles.profileCard
          }
        >

          <View
            style={
              styles.profileTextGroup
            }
          >

            <Text
              style={
                styles.adminName
              }
            >
              {adminInfo?.full_name ||
                "ئەدمین"}
            </Text>

            <Text
              style={
                styles.adminRole
              }
            >
              {adminInfo?.email ||
                "ئیمەیڵ دیاری نەکراوە"}
            </Text>

            <Text
              style={
                styles.adminBadge
              }
            >
              {adminInfo
                ?.is_super_admin
                ? "سوپەر ئەدمین (بەڕێوەبەری گشتی)"
                : "ئەدمینی دەسەڵات سنووردار"}
            </Text>

          </View>

          <View
            style={styles.avatarBox}
          >

            <UserCheck
              color="#D97706"
              size={24}
            />

          </View>

        </View>

        {/* =================================================
            Super Admin Management
        ================================================= */}

        {adminInfo
          ?.is_super_admin ===
          true && (

          <TouchableOpacity
            style={
              styles.superAdminBtn
            }
            onPress={() =>
              navigation.navigate(
                "AdminManagement"
              )
            }
            activeOpacity={0.85}
          >

            <Text
              style={
                styles.superAdminBtnText
              }
            >
              بەڕێوەبردنی ئەدمینەکان و دەسەڵاتەکان
            </Text>

            <UserPlus
              color="#000"
              size={20}
            />

          </TouchableOpacity>
        )}

        {/* =================================================
            Logout
        ================================================= */}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.8}
        >

          <Text
            style={
              styles.logoutText
            }
          >
            دەرچوون لە هەژماری Admin
          </Text>

        </TouchableOpacity>

        {/* =================================================
            Section Title
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          بەشەکانی بەڕێوەبردن
        </Text>

        {/* =================================================
            Family Tree
        ================================================= */}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_tree) && (

          <TouchableOpacity
            style={
              styles.moduleCard
            }
            onPress={() =>
              navigation.navigate(
                "ManageTree"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={
                styles.moduleTitle
              }
            >
              بەڕێوەبردنی شەجرەنامە
            </Text>

            <View
              style={styles.iconBox}
            >

              <Users
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {/* =================================================
            Bllasan
        ================================================= */}

        {adminInfo?.is_super_admin === true && (

          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() =>
              navigation.navigate(
                "ManageBllasanAbout"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={styles.moduleTitle}
            >
              بەڕێوەبردنی بڵەسەن
            </Text>

            <View
              style={styles.iconBox}
            >

              <Home
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {/* =================================================
            Gallery
        ================================================= */}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_gallery) && (

          <TouchableOpacity
            style={
              styles.moduleCard
            }
            onPress={() =>
              navigation.navigate(
                "ManageGallery"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={
                styles.moduleTitle
              }
            >
              بەڕێوەبردنی وێنەخانە
            </Text>

            <View
              style={styles.iconBox}
            >

              <ImageIcon
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {/* =================================================
            Writers
        ================================================= */}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_writers) && (

          <TouchableOpacity
            style={
              styles.moduleCard
            }
            onPress={() =>
              navigation.navigate(
                "ManageWriters"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={
                styles.moduleTitle
              }
            >
              بەڕێوەبردنی نووسەرانی بڵەسەن
            </Text>

            <View
              style={styles.iconBox}
            >

              <BookOpen
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {/* =================================================
            Obituaries
        ================================================= */}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_obituaries) && (

          <TouchableOpacity
            style={
              styles.moduleCard
            }
            onPress={() =>
              navigation.navigate(
                "ManageObituaries"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={
                styles.moduleTitle
              }
            >
              بەڕێوەبردنی پرسە و سەرەخۆشی
            </Text>

            <View
              style={styles.iconBox}
            >

              <Heart
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {/* =================================================
            Directory
        ================================================= */}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_directory) && (

          <TouchableOpacity
            style={
              styles.moduleCard
            }
            onPress={() =>
              navigation.navigate(
                "ManageDirectory"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={
                styles.moduleTitle
              }
            >
              بەڕێوەبردنی ژمارە تەلەفۆنەکان
            </Text>

            <View
              style={styles.iconBox}
            >

              <Phone
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {/* =================================================
            News
        ================================================= */}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_news) && (

          <TouchableOpacity
            style={
              styles.moduleCard
            }
            onPress={() =>
              navigation.navigate(
                "ManageNews"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={
                styles.moduleTitle
              }
            >
              بەڕێوەبردنی هەواڵی خێرا و ئاگاداری
            </Text>

            <View
              style={styles.iconBox}
            >

              <Megaphone
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_news) && (

          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() =>
              navigation.navigate(
                "ManageQuickNews"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={styles.moduleTitle}
            >
              بەڕێوەبردنی هەواڵی کورت
            </Text>

            <View
              style={styles.iconBox}
            >

              <Megaphone
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {/* =================================================
            Ads
        ================================================= */}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_news) && (

          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() =>
              navigation.navigate(
                "ManageAds"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={styles.moduleTitle}
            >
              بەڕێوەبردنی تبلیغ
            </Text>

            <View
              style={styles.iconBox}
            >

              <Megaphone
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

        {/* =================================================
            Municipality
        ================================================= */}

        {(adminInfo?.is_super_admin ||
          adminInfo?.can_manage_municipality) && (

          <TouchableOpacity
            style={
              styles.moduleCard
            }
            onPress={() =>
              navigation.navigate(
                "AdminMunicipality"
              )
            }
            activeOpacity={0.8}
          >

            <Text
              style={
                styles.moduleTitle
              }
            >
              بەڕێوەبردنی دهیاری
            </Text>

            <View
              style={styles.iconBox}
            >

              <Building2
                color="#D97706"
                size={22}
              />

            </View>

          </TouchableOpacity>
        )}

      </ScrollView>

    </SafeAreaView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor:
      "#1E2C3D",
  },

  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 8,
  },

  backBtn: {
    padding: 6,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  profileCard: {
    backgroundColor: "#131D2A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 12,
  },

  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor:
      "rgba(217, 119, 6, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  profileTextGroup: {
    alignItems: "flex-end",
    flex: 1,
    marginRight: 12,
  },

  adminName: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  adminRole: {
    color: "#A0AEC0",
    fontSize: 12,
    marginTop: 2,
  },

  adminBadge: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },

  superAdminBtn: {
    backgroundColor: "#D97706",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  superAdminBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 8,
  },

  logoutBtn: {
    backgroundColor: "#1E2C3D",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 18,
  },

  logoutText: {
    color: "#A0AEC0",
    fontWeight: "bold",
    fontSize: 13,
  },

  sectionTitle: {
    color: "#718096",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 12,
  },

  moduleCard: {
    backgroundColor: "#131D2A",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2C3D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 10,
  },

  moduleTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
    marginRight: 12,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor:
      "rgba(217, 119, 6, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

});