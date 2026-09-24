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
import { ArrowRight, UserPlus, Trash2, Power, ShieldCheck } from 'lucide-react-native';
import { supabase } from '../lib/supabase'; // مسیر فایلی که supabase را initialize کرده‌اید

export default function AdminManagement({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // مشخصات ادمین جدید
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState({
    can_manage_tree: false,
    can_manage_writers: false,
    can_manage_obituaries: false,
    can_manage_directory: false,
    can_manage_news: false,
    can_manage_municipality: false,
    can_manage_gallery: false,
    can_manage_bllasan: true,
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  // دریافت لیست ادمین‌ها از Supabase
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      Alert.alert('خطا', error.message);
    } finally {
      setLoading(false);
    }
  };

  // افزودن ادمین جدید
  const handleAddAdmin = async () => {
    if (!fullName || !email) {
      Alert.alert('خطا', 'لطفاً نام کامل و ایمیل را وارد کنید.');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('admins').insert([
        {
          full_name: fullName,
          email: email.trim().toLowerCase(),
          is_super_admin: false,
          is_active: true,
          ...permissions,
        },
      ]);

      if (error) throw error;

      Alert.alert('موفقیت', 'ادمین جدید با موفقیت اضافه شد.');
      setFullName('');
      setEmail('');
      setPermissions({
        can_manage_tree: false,
        can_manage_writers: false,
        can_manage_obituaries: false,
        can_manage_directory: false,
        can_manage_news: false,
        can_manage_municipality: false,
        can_manage_gallery: false,
        can_manage_bllasan: false,
      });
      fetchAdmins();
    } catch (error) {
      Alert.alert('خطا', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // تغییر وضعیت فعال/غیرفعال کردن ادمین
  const toggleAdminStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('admins')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchAdmins();
    } catch (error) {
      Alert.alert('خطا', error.message);
    }
  };

  // حذف ادمین
  const handleDeleteAdmin = (id, name) => {
    Alert.alert(
      'تأیید حذف',
      `آیا از حذف ادمین "${name}" مطمئن هستید؟`,
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('admins').delete().eq('id', id);
              if (error) throw error;
              fetchAdmins();
            } catch (error) {
              Alert.alert('خطا', error.message);
            }
          },
        },
      ]
    );
  };

  const togglePermission = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowRight color="#FFF" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مدیریت ادمین‌ها و دسترسی‌ها</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Form Add Admin */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <UserPlus color="#D97706" size={20} />
            <Text style={styles.cardTitle}>افزودن ادمین جدید</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="نام و نام خانوادگی"
            placeholderTextColor="#718096"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="ایمیل ادمین"
            placeholderTextColor="#718096"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.subtitle}>تعیین دسترسی‌های ادمین:</Text>

          {[
            { key: 'can_manage_tree', label: 'مدیریت شجره‌نامه' },
            { key: 'can_manage_writers', label: 'مدیریت نویسندگان' },
            { key: 'can_manage_obituaries', label: 'مدیریت پرسه‌و‌سەرەخۆشی' },
            { key: 'can_manage_directory', label: 'مدیریت شماره تلفن‌ها' },
            { key: 'can_manage_news', label: 'مدیریت اخبار و اطلاعیه‌ها' },
            { key: 'can_manage_municipality', label: 'مدیریت دهیاری' },
            { key: 'can_manage_gallery', label: 'مدیریت نگارخانه (وێنەخانه)' },
          ].map((item) => (
            <View key={item.key} style={styles.switchRow}>
              <Text style={styles.switchLabel}>{item.label}</Text>
              <Switch
                value={permissions[item.key]}
                onValueChange={() => togglePermission(item.key)}
                trackColor={{ false: '#1A2634', true: '#D97706' }}
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddAdmin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.addBtnText}>ثبت ادمین جدید</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* List of Admins */}
        <Text style={styles.sectionTitle}>لیست ادمین‌های موجود</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#D97706" style={{ marginTop: 20 }} />
        ) : (
          admins.map((item) => (
            <View key={item.id} style={styles.adminCard}>
              <View style={styles.adminInfo}>
                <Text style={styles.adminNameText}>{item.full_name}</Text>
                <Text style={styles.adminEmailText}>{item.email}</Text>
                <Text style={styles.adminStatusText}>
                  وضعیت: {item.is_active ? 'فعال' : 'متوقف‌شده'}
                </Text>
              </View>

              {!item.is_super_admin && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: item.is_active ? '#D9770622' : '#22C55E22' },
                    ]}
                    onPress={() => toggleAdminStatus(item.id, item.is_active)}
                  >
                    <Power color={item.is_active ? '#D97706' : '#22C55E'} size={18} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EF444422' }]}
                    onPress={() => handleDeleteAdmin(item.id, item.full_name)}
                  >
                    <Trash2 color="#EF4444" size={18} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B131F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2C3D',
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#131D2A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2C3D',
    marginBottom: 20,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  input: {
    backgroundColor: '#0B131F',
    borderWidth: 1,
    borderColor: '#1E2C3D',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'right',
  },
  subtitle: { color: '#A0AEC0', fontSize: 13, marginVertical: 10, textAlign: 'right' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchLabel: { color: '#FFF', fontSize: 13 },
  addBtn: {
    backgroundColor: '#D97706',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  addBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { color: '#718096', fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginBottom: 10 },
  adminCard: {
    backgroundColor: '#131D2A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E2C3D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminInfo: { flex: 1, alignItems: 'flex-start' },
  adminNameText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  adminEmailText: { color: '#718096', fontSize: 12 },
  adminStatusText: { color: '#D97706', fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 6 },
});