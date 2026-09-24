// screens/FamilyMuseumScreen.js
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  TextInput, Modal, Alert, Image, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { Lock, Plus, Image as ImageIcon, Mic, Video, BookOpen, UserPlus, KeyRound } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { supabase } from '../lib/supabase';

export default function FamilyMuseumScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration States
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [accessPin, setAccessPin] = useState('');

  // Museum Main States
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [gender, setGender] = useState('son'); // 'son' or 'daughter'

  // PIN Login Verification
  const handlePinLogin = async () => {
    if (!accessPin) {
      Alert.alert('ئاگاداری', 'تکایە وشەی نهێنی (PIN) بنووسە');
      return;
    }
    // پشکنین لە داتابەیس
    const { data, error } = await supabase
      .from('family_museums')
      .select('*')
      .eq('access_pin', accessPin)
      .single();

    if (error || !data) {
      Alert.alert('کێشە', 'وشەی نهێنی هەڵەیە یان مۆزەخانەکە نەدۆزرایەوە');
    } else {
      setIsAuthenticated(true);
      fetchMembers(data.id);
    }
  };

  // Register New Museum
  const handleRegisterMuseum = async () => {
    if (!name || !lastName || !phone || !email || !accessPin) {
      Alert.alert('ئاگاداری', 'تکایە هەموو کێڵگەکان پڕبکەرەوە');
      return;
    }

    const { data, error } = await supabase
      .from('family_museums')
      .insert([{
        owner_name: `${name} ${lastName}`,
        phone,
        email,
        access_pin: accessPin
      }])
      .select()
      .single();

    if (error) {
      Alert.alert('کێشە', error.message);
    } else {
      Alert.alert('سەرکەوتوو بوو', 'مۆزەخانەی خێزانیەکەت بە سەرکەوتوویی دروستکرا');
      setIsAuthenticated(true);
    }
  };

  // Fetch Members
  const fetchMembers = async (museumId) => {
    const { data } = await supabase
      .from('family_members')
      .select('*')
      .eq('museum_id', museumId);
    setMembers(data || []);
  };

  // Add Son / Daughter
  const handleAddMember = async () => {
    if (!memberName) return;
    const { error } = await supabase
      .from('family_members')
      .insert([{ full_name: memberName, gender: gender }]);

    if (!error) {
      setAddMemberModal(false);
      setMemberName('');
      Alert.alert('سەرکەوتوو بوو', 'ئەندامی نوێ زیادکرا');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isAuthenticated ? (
        /* بەشی خۆتۆمارکردن / چوونەژوورەوە بە PIN */
        <View style={styles.authContainer}>
          <Lock color={COLORS.primary} size={48} />
          <Text style={styles.authTitle}>مۆزەخانەی خێزانی</Text>
          <Text style={styles.authSub}>ئەرشیفی دیجیتاڵی وێنە، دەنگ و چیرۆکی خێزانەکەت</Text>

          {isRegistering ? (
            <View style={styles.form}>
              <TextInput style={styles.input} placeholder="ناو" placeholderTextColor="#556575" value={name} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="ناوی خێزانی" placeholderTextColor="#556575" value={lastName} onChangeText={setLastName} />
              <TextInput style={styles.input} placeholder="ژمارەی تەلەفۆن" placeholderTextColor="#556575" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              <TextInput style={styles.input} placeholder="ئیمەیڵ" placeholderTextColor="#556575" keyboardType="email-address" value={email} onChangeText={setEmail} />
              <TextInput style={styles.input} placeholder="وشەی نهێنی تایبەت (PIN)" placeholderTextColor="#556575" secureTextEntry value={accessPin} onChangeText={setAccessPin} />
              
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRegisterMuseum}>
                <Text style={styles.btnText}>دروستکردنی مۆزەخانە</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsRegistering(false)}>
                <Text style={styles.switchText}>پێشتر مۆزەخانەت هەیە؟ بڕۆ ژوورەوە</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput 
                style={styles.input} 
                placeholder="وشەی نهێنی مۆزەخانە (PIN)" 
                placeholderTextColor="#556575" 
                secureTextEntry 
                value={accessPin} 
                onChangeText={setAccessPin} 
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handlePinLogin}>
                <Text style={styles.btnText}>چوونەژوورەوە بۆ مۆزەخانە</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsRegistering(true)}>
                <Text style={styles.switchText}>مۆزەخانەی نوێ دروست بکە</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* لاپەڕەی سەرەکی مۆزەخانە دوای چوونەژوورەوە */
        <ScrollView contentContainerStyle={styles.mainContent}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.addMemberBtn} onPress={() => setAddMemberModal(true)}>
              <Plus color="#000" size={18} />
              <Text style={styles.addMemberText}>زیادکردنی کوڕ / کچ</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>ئەندامانی خێزان</Text>
          </View>

          {/* لیستی کوڕ و کچەکان */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersList}>
            {members.map((member) => (
              <TouchableOpacity 
                key={member.id} 
                style={[styles.memberCard, selectedMember?.id === member.id && styles.activeMemberCard]}
                onPress={() => setSelectedMember(member)}
              >
                <Text style={styles.memberName}>{member.full_name}</Text>
                <Text style={styles.memberTag}>{member.gender === 'son' ? 'کوڕ' : 'کچ'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* بەشی ئەرشیفکردنی میدیای ئەندامی هەڵبژێردراو */}
          {selectedMember && (
            <View style={styles.archiveSection}>
              <Text style={styles.archiveTitle}>ئەرشیفی: {selectedMember.full_name}</Text>
              
              <View style={styles.mediaGrid}>
                <TouchableOpacity style={styles.mediaBox}>
                  <ImageIcon color={COLORS.primary} size={28} />
                  <Text style={styles.mediaText}>وێنەکان (منداڵی تا پیری)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaBox}>
                  <Mic color={COLORS.primary} size={28} />
                  <Text style={styles.mediaText}>تۆماری دەنگی</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaBox}>
                  <Video color={COLORS.primary} size={28} />
                  <Text style={styles.mediaText}>ڤیدیۆکان</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaBox}>
                  <BookOpen color={COLORS.primary} size={28} />
                  <Text style={styles.mediaText}>چیرۆک و قسەی خۆش</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* مۆداڵی زیادکردنی کوڕ و کچ */}
      <Modal visible={addMemberModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>زیادکردنی کوڕ یان کچ</Text>
            <TextInput style={styles.input} placeholder="ناوی تەواو" placeholderTextColor="#556575" value={memberName} onChangeText={setMemberName} />
            
            <View style={styles.genderRow}>
              <TouchableOpacity style={[styles.genderBtn, gender === 'son' && styles.activeGender]} onPress={() => setGender('son')}>
                <Text style={styles.genderText}>کوڕ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.genderBtn, gender === 'daughter' && styles.activeGender]} onPress={() => setGender('daughter')}>
                <Text style={styles.genderText}>کچ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleAddMember}>
              <Text style={styles.btnText}>تۆمارکردن</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddMemberModal(false)}><Text style={styles.closeText}>داخستن</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B131F' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  authTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  authSub: { color: COLORS.textSub, fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  form: { width: '100%', gap: 10 },
  input: { backgroundColor: '#131D2A', borderRadius: 10, padding: 12, color: '#FFF', textAlign: 'right', borderWidth: 1, borderColor: '#1E2C3D' },
  primaryBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#000', fontWeight: 'bold' },
  switchText: { color: COLORS.primary, textAlign: 'center', marginTop: 12, fontSize: 12 },

  mainContent: { padding: 16 },
  headerRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  addMemberBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 8, borderRadius: 8, alignItems: 'center', gap: 4 },
  addMemberText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

  membersList: { flexDirection: 'row-reverse', marginBottom: 20 },
  memberCard: { backgroundColor: '#131D2A', padding: 14, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#1E2C3D', alignItems: 'center', minWidth: 90 },
  activeMemberCard: { borderColor: COLORS.primary, backgroundColor: '#162232' },
  memberName: { color: '#FFF', fontWeight: 'bold' },
  memberTag: { color: COLORS.primary, fontSize: 10, marginTop: 4 },

  archiveSection: { marginTop: 10 },
  archiveTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', textAlign: 'right', marginBottom: 12 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  mediaBox: { width: '48%', backgroundColor: '#131D2A', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1E2C3D', gap: 8 },
  mediaText: { color: '#FFF', fontSize: 12, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#131D2A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1E2C3D', gap: 12 },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  genderRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  genderBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#0B131F', alignItems: 'center', borderWidth: 1, borderColor: '#1E2C3D' },
  activeGender: { borderColor: COLORS.primary, backgroundColor: '#162232' },
  genderText: { color: '#FFF', fontWeight: 'bold' },
  closeText: { color: COLORS.textSub, textAlign: 'center', marginTop: 6 }
});