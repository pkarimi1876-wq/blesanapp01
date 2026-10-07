import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  ArrowRight,
  UserPlus,
  Trash2,
  Power,
  Save,
  Shield,
  Lock,
  Mail,
  User,
} from 'lucide-react-native';

import { supabase } from '../lib/supabase';

const DEFAULT_PERMISSIONS = {
  can_manage_tree: false,
  can_manage_writers: false,
  can_manage_obituaries: false,
  can_manage_directory: false,
  can_manage_news: false,
  can_manage_municipality: false,
  can_manage_gallery: false,
  can_manage_bllasan: false,
};

const PERMISSION_LIST = [
  {
    key: 'can_manage_tree',
    label: 'مدیریتی شجرەنامە',
  },
  {
    key: 'can_manage_writers',
    label: 'مدیریتی نووسەران',
  },
  {
    key: 'can_manage_obituaries',
    label: 'مدیریتی پرسە و سەرەخۆشی',
  },
  {
    key: 'can_manage_directory',
    label: 'مدیریتی ژمارە تەلەفۆنەکان',
  },
  {
    key: 'can_manage_news',
    label: 'مدیریتی هەواڵ و ئاگادارییەکان',
  },
  {
    key: 'can_manage_municipality',
    label: 'مدیریتی دەهیاری',
  },
  {
    key: 'can_manage_gallery',
    label: 'مدیریتی وێنەخانە',
  },
  {
    key: 'can_manage_bllasan',
    label: 'مدیریتی زانیاری بڵەسەن',
  },
];

export default function AdminManagement({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [permissions, setPermissions] = useState({
    ...DEFAULT_PERMISSIONS,
  });

  // ==========================================
  // Fetch Admins
  // ==========================================

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', {
          ascending: false,
        });

      if (error) throw error;

      setAdmins(data || []);
    } catch (error) {
      Alert.alert(
        'هەڵە',
        error.message || 'نەتوانرا لیستی ئەدمینەکان وەربگیرێت.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Add Admin
  // ==========================================

  const handleAddAdmin = async () => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'هەڵە',
        'تکایە ناو، ئیمەیڵ و وشەی نهێنی پڕ بکەرەوە.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'هەڵە',
        'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'هەڵە',
        'وشەی نهێنی و دووبارەکردنەوەکەی یەکسان نین.'
      );
      return;
    }

    try {
      setSubmitting(true);

      const { data, error } =
        await supabase.functions.invoke(
          'create-admin',
          {
            body: {
              fullName: cleanName,
              email: cleanEmail,
              password,
              permissions,
            },
          }
        );

      if (error) {
        throw new Error(
          error.message ||
            'نەتوانرا ئەدمینی نوێ دروست بکرێت.'
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
            'نەتوانرا ئەدمینی نوێ دروست بکرێت.'
        );
      }

      Alert.alert(
        'سەرکەوتوو بوو',
        'ئەدمینی نوێ بە سەرکەوتوویی زیادکرا.'
      );

      // پاککردنەوەی فۆڕم
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setPermissions({
        ...DEFAULT_PERMISSIONS,
      });

      await fetchAdmins();
    } catch (error) {
      Alert.alert(
        'هەڵە',
        error.message || 'هەڵەیەک ڕوویدا.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // Change Permission Locally
  // ==========================================

  const toggleAdminPermission = (adminId, key) => {
    setAdmins((prev) =>
      prev.map((admin) => {
        if (admin.id !== adminId) {
          return admin;
        }

        return {
          ...admin,
          [key]: !admin[key],
        };
      })
    );
  };

  // ==========================================
  // Save Permissions
  // ==========================================

  const savePermissions = async (admin) => {
    if (admin.is_super_admin) {
      Alert.alert(
        'تێبینی',
        'دەسەڵاتەکانی Super Admin لەم بەشەدا ناگۆڕدرێن.'
      );
      return;
    }

    try {
      setSavingId(admin.id);

      const updateData = {};

      PERMISSION_LIST.forEach((item) => {
        updateData[item.key] =
          admin[item.key] === true;
      });

      const { error } = await supabase
        .from('admins')
        .update(updateData)
        .eq('id', admin.id);

      if (error) throw error;

      Alert.alert(
        'سەرکەوتوو بوو',
        `دەسەڵاتەکانی ${admin.full_name} نوێکرانەوە.`
      );

      await fetchAdmins();
    } catch (error) {
      Alert.alert(
        'هەڵە',
        error.message ||
          'نەتوانرا دەسەڵاتەکان پاشەکەوت بکرێن.'
      );

      await fetchAdmins();
    } finally {
      setSavingId(null);
    }
  };

  // ==========================================
  // Toggle Active / Inactive
  // ==========================================

  const toggleAdminStatus = async (
    adminId,
    currentStatus
  ) => {
    try {
      const { error } = await supabase
        .from('admins')
        .update({
          is_active: !currentStatus,
        })
        .eq('id', adminId);

      if (error) throw error;

      await fetchAdmins();
    } catch (error) {
      Alert.alert(
        'هەڵە',
        error.message ||
          'نەتوانرا دۆخی ئەدمین بگۆڕدرێت.'
      );
    }
  };

  // ==========================================
  // Delete Admin
  // ==========================================

  const handleDeleteAdmin = (admin) => {
    if (admin.is_super_admin) {
      Alert.alert(
        'ڕێگەپێنەدراوە',
        'Super Admin ناتوانرێت لێرە بسڕدرێتەوە.'
      );
      return;
    }

    Alert.alert(
      'سڕینەوەی ئەدمین',
      `دڵنیایت دەتەوێت "${admin.full_name}" بسڕیتەوە؟\n\nئەم کردارە هەردوو شتی خوارەوە دەسڕێتەوە:\n• حسابی Login\n• زانیارییەکەی لە لیستی Admin`,
      [
        {
          text: 'هەڵوەشاندنەوە',
          style: 'cancel',
        },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: () =>
            deleteAdmin(admin),
        },
      ]
    );
  };

  const deleteAdmin = async (admin) => {
    try {
      setDeletingId(admin.id);

      const { data, error } =
        await supabase.functions.invoke(
          'delete-admin',
          {
            body: {
              adminId: admin.id,
              email: admin.email,
            },
          }
        );

      if (error) {
        throw new Error(
          error.message ||
            'نەتوانرا ئەدمین بسڕدرێتەوە.'
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
            'نەتوانرا ئەدمین بسڕدرێتەوە.'
        );
      }

      Alert.alert(
        'سەرکەوتوو بوو',
        'ئەدمین بە تەواوی سڕایەوە.'
      );

      await fetchAdmins();
    } catch (error) {
      Alert.alert(
        'هەڵە',
        error.message ||
          'هەڵەیەک لە سڕینەوە ڕوویدا.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowRight
            color="#FFF"
            size={22}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          بەڕێوەبردنی ئەدمینەکان
        </Text>

      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* =====================================
            Add Admin
        ===================================== */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>
            <UserPlus
              color="#D97706"
              size={21}
            />

            <Text style={styles.cardTitle}>
              زیادکردنی ئەدمینی نوێ
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <User
              color="#718096"
              size={18}
            />

            <TextInput
              style={styles.inputWithIcon}
              placeholder="ناوی تەواو"
              placeholderTextColor="#718096"
              value={fullName}
              onChangeText={setFullName}
              textAlign="right"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Mail
              color="#718096"
              size={18}
            />

            <TextInput
              style={styles.inputWithIcon}
              placeholder="ئیمەیڵ"
              placeholderTextColor="#718096"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              textAlign="right"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock
              color="#718096"
              size={18}
            />

            <TextInput
              style={styles.inputWithIcon}
              placeholder="وشەی نهێنی"
              placeholderTextColor="#718096"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              textAlign="right"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock
              color="#718096"
              size={18}
            />

            <TextInput
              style={styles.inputWithIcon}
              placeholder="دووبارە وشەی نهێنی"
              placeholderTextColor="#718096"
              secureTextEntry
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              textAlign="right"
            />
          </View>

          <Text style={styles.permissionTitle}>
            دەسەڵاتەکانی ئەدمینی نوێ
          </Text>

          {PERMISSION_LIST.map((item) => (
            <View
              key={item.key}
              style={styles.switchRow}
            >

              <Text style={styles.switchLabel}>
                {item.label}
              </Text>

              <Switch
                value={
                  permissions[item.key] === true
                }
                onValueChange={() =>
                  setPermissions((prev) => ({
                    ...prev,
                    [item.key]:
                      !prev[item.key],
                  }))
                }
                trackColor={{
                  false: '#1A2634',
                  true: '#D97706',
                }}
                thumbColor={
                  permissions[item.key]
                    ? '#FFF'
                    : '#718096'
                }
              />

            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.addBtn,
              submitting &&
                styles.disabledButton,
            ]}
            onPress={handleAddAdmin}
            disabled={submitting}
          >

            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.addBtnText}>
                زیادکردنی ئەدمین
              </Text>
            )}

          </TouchableOpacity>

        </View>

        {/* =====================================
            Admin List
        ===================================== */}

        <Text style={styles.sectionTitle}>
          ئەدمینەکانی ئێستا
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#D97706"
            style={{
              marginTop: 25,
            }}
          />
        ) : admins.length === 0 ? (

          <View style={styles.emptyBox}>
            <Shield
              color="#718096"
              size={35}
            />

            <Text style={styles.emptyText}>
              هیچ ئەدمینێک نەدۆزرایەوە.
            </Text>
          </View>

        ) : (

          admins.map((admin) => {

            const isSuperAdmin =
              admin.is_super_admin === true;

            const isSaving =
              savingId === admin.id;

            const isDeleting =
              deletingId === admin.id;

            return (
              <View
                key={admin.id}
                style={styles.adminCard}
              >

                {/* Admin Header */}
                <View style={styles.adminTop}>

                  <View style={styles.adminInfo}>

                    <Text style={styles.adminName}>
                      {admin.full_name}
                    </Text>

                    <Text style={styles.adminEmail}>
                      {admin.email}
                    </Text>

                    <View style={styles.statusRow}>

                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              admin.is_active
                                ? '#22C55E'
                                : '#EF4444',
                          },
                        ]}
                      />

                      <Text
                        style={styles.statusText}
                      >
                        {admin.is_active
                          ? 'چالاک'
                          : 'ناچالاک'}
                      </Text>

                      {isSuperAdmin && (
                        <View
                          style={
                            styles.superBadge
                          }
                        >
                          <Text
                            style={
                              styles.superBadgeText
                            }
                          >
                            Super Admin
                          </Text>
                        </View>
                      )}

                    </View>

                  </View>

                  <Shield
                    color={
                      isSuperAdmin
                        ? '#D97706'
                        : '#718096'
                    }
                    size={28}
                  />

                </View>

                {/* Super Admin */}
                {isSuperAdmin ? (

                  <View
                    style={styles.superAdminBox}
                  >
                    <Text
                      style={
                        styles.superAdminText
                      }
                    >
                      ئەم ئەدمینە دەسەڵاتی
                      Super Admin ـی هەیە و
                      دەسەڵاتەکانی نابێت لێرە
                      بگۆڕدرێن.
                    </Text>
                  </View>

                ) : (

                  <>
                    {/* Active Status */}
                    <View
                      style={styles.activeRow}
                    >

                      <Text
                        style={styles.activeLabel}
                      >
                        دۆخی ئەدمین
                      </Text>

                      <Switch
                        value={
                          admin.is_active === true
                        }
                        onValueChange={() =>
                          toggleAdminStatus(
                            admin.id,
                            admin.is_active
                          )
                        }
                        trackColor={{
                          false: '#1A2634',
                          true: '#D97706',
                        }}
                        thumbColor="#FFF"
                      />

                    </View>

                    {/* Permissions */}
                    <Text
                      style={
                        styles.permissionTitle
                      }
                    >
                      دەسەڵاتەکان
                    </Text>

                    {PERMISSION_LIST.map(
                      (item) => (
                        <View
                          key={item.key}
                          style={
                            styles.permissionRow
                          }
                        >

                          <Text
                            style={
                              styles.permissionLabel
                            }
                          >
                            {item.label}
                          </Text>

                          <Switch
                            value={
                              admin[item.key] ===
                              true
                            }
                            onValueChange={() =>
                              toggleAdminPermission(
                                admin.id,
                                item.key
                              )
                            }
                            trackColor={{
                              false:
                                '#1A2634',
                              true:
                                '#D97706',
                            }}
                            thumbColor="#FFF"
                          />

                        </View>
                      )
                    )}

                    {/* Save Permissions */}
                    <TouchableOpacity
                      style={[
                        styles.saveBtn,
                        isSaving &&
                          styles.disabledButton,
                      ]}
                      disabled={isSaving}
                      onPress={() =>
                        savePermissions(admin)
                      }
                    >

                      {isSaving ? (
                        <ActivityIndicator
                          color="#000"
                        />
                      ) : (
                        <>
                          <Save
                            color="#000"
                            size={18}
                          />

                          <Text
                            style={
                              styles.saveBtnText
                            }
                          >
                            پاشەکەوتکردنی دەسەڵاتەکان
                          </Text>
                        </>
                      )}

                    </TouchableOpacity>

                    {/* Admin Actions */}
                    <View
                      style={styles.actionsRow}
                    >

                      <TouchableOpacity
                        style={
                          styles.disableBtn
                        }
                        onPress={() =>
                          toggleAdminStatus(
                            admin.id,
                            admin.is_active
                          )
                        }
                      >

                        <Power
                          color={
                            admin.is_active
                              ? '#D97706'
                              : '#22C55E'
                          }
                          size={18}
                        />

                        <Text
                          style={[
                            styles.actionText,
                            {
                              color:
                                admin.is_active
                                  ? '#D97706'
                                  : '#22C55E',
                            },
                          ]}
                        >
                          {admin.is_active
                            ? 'ناچالاککردن'
                            : 'چالاککردن'}
                        </Text>

                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        disabled={isDeleting}
                        onPress={() =>
                          handleDeleteAdmin(
                            admin
                          )
                        }
                      >

                        {isDeleting ? (
                          <ActivityIndicator
                            color="#EF4444"
                          />
                        ) : (
                          <>
                            <Trash2
                              color="#EF4444"
                              size={18}
                            />

                            <Text
                              style={
                                styles.deleteText
                              }
                            >
                              سڕینەوە
                            </Text>
                          </>
                        )}

                      </TouchableOpacity>

                    </View>

                  </>
                )}

              </View>
            );
          })
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B131F',
  },

  header: {
    height: 60,
    backgroundColor: '#131D2A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2C3D',
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTitle: {
    flex: 1,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },

  content: {
    padding: 15,
    paddingBottom: 50,
  },

  card: {
    backgroundColor: '#131D2A',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#1E2C3D',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 15,
  },

  cardTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B131F',
    borderWidth: 1,
    borderColor: '#1E2C3D',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  inputWithIcon: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  permissionTitle: {
    color: '#A0AEC0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'right',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B131F',
    borderWidth: 1,
    borderColor: '#1E2C3D',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },

  switchLabel: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    textAlign: 'right',
    marginRight: 10,
  },

  addBtn: {
    backgroundColor: '#D97706',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  addBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.65,
  },

  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 12,
    textAlign: 'right',
  },

  adminCard: {
    backgroundColor: '#131D2A',
    borderWidth: 1,
    borderColor: '#1E2C3D',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  adminTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  adminInfo: {
    flex: 1,
  },

  adminName: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },

  adminEmail: {
    color: '#A0AEC0',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'right',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 7,
    gap: 5,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    color: '#A0AEC0',
    fontSize: 12,
  },

  superBadge: {
    backgroundColor: '#D9770622',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 5,
  },

  superBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },

  superAdminBox: {
    backgroundColor: '#D9770612',
    borderWidth: 1,
    borderColor: '#D9770640',
    borderRadius: 10,
    padding: 12,
  },

  superAdminText: {
    color: '#D97706',
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
  },

  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B131F',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
  },

  activeLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B131F',
    borderWidth: 1,
    borderColor: '#1E2C3D',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 7,
  },

  permissionLabel: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    textAlign: 'right',
    marginRight: 10,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#D97706',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },

  saveBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  disableBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#D9770612',
    borderWidth: 1,
    borderColor: '#D9770630',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  deleteBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#EF444412',
    borderWidth: 1,
    borderColor: '#EF444430',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },

  deleteText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyBox: {
    backgroundColor: '#131D2A',
    borderWidth: 1,
    borderColor: '#1E2C3D',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
  },

  emptyText: {
    color: '#718096',
    fontSize: 14,
    marginTop: 10,
  },
});