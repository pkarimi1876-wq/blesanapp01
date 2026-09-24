import React, { useState, useEffect, useCallback } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { supabase } from '../lib/supabase';

export default function CondolenceScreen({ navigation }) {
  const [condolences, setCondolences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});

  // =====================================================
  // هێنانی کۆمێنتەکانی سەرەخۆشی
  // =====================================================
  const fetchComments = useCallback(async (condolenceId) => {
    const { data, error } = await supabase
      .from('condolence_comments')
      .select('*')
      .eq('condolence_id', condolenceId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments((prev) => ({
        ...prev,
        [condolenceId]: data,
      }));
    }
  }, []);

  // =====================================================
  // هێنانی لیستی کۆچکردووان لە Supabase
  // =====================================================
  const fetchCondolences = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('condolences')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCondolences(data);

      data.forEach((item) => {
        fetchComments(item.id);
      });
    } else if (error) {
      console.log('Fetch condolences error:', error.message);
      setCondolences([]);
    }

    setLoading(false);
  }, [fetchComments]);

  // =====================================================
  // Load لە سەرەتای پەڕە
  // =====================================================
  useEffect(() => {
    fetchCondolences();
  }, [fetchCondolences]);

  // =====================================================
  // زیاترکردنی پەیامی سەرەخۆشی
  // =====================================================
  const handleAddComment = async (condolenceId) => {
    const text = newComments[condolenceId];

    if (!text || !text.trim()) {
      return;
    }

    const { data, error } = await supabase
      .from('condolence_comments')
      .insert([
        {
          condolence_id: condolenceId,
          text: text.trim(),
        },
      ])
      .select();

    if (!error && data) {
      setComments((prev) => ({
        ...prev,
        [condolenceId]: [
          data[0],
          ...(prev[condolenceId] || []),
        ],
      }));

      setNewComments((prev) => ({
        ...prev,
        [condolenceId]: '',
      }));
    } else if (error) {
      console.log(
        'Add condolence comment error:',
        error.message
      );
    }
  };

  // =====================================================
  // پەیوەندیکردن بە بنەماڵەی کۆچکردوو
  // =====================================================
  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      return;
    }

    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          پرسە و سەرەخۆشی
        </Text>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={fetchCondolences}
        >
          <Ionicons
            name="refresh"
            size={20}
            color="#f59e0b"
          />
        </TouchableOpacity>
      </View>

      {/* Quran Banner */}
      <View style={styles.quranBanner}>
        <Text style={styles.quranText}>
          "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ"
        </Text>

        <Text style={styles.quranSub}>
          انا لله وانا اليه راجعون
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#f59e0b"
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {condolences.length === 0 ? (
            <Text style={styles.emptyText}>
              هیچ ڕاگەیاندنێکی پرسە نەدۆزرایەوە.
            </Text>
          ) : (
            condolences.map((item) => (
              <View
                key={item.id}
                style={styles.card}
              >
                {/* وێنە و ناوی کۆچکردوو */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBorder}>
                    {item.image_url ? (
                      <Image
                        source={{
                          uri: item.image_url,
                        }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.placeholderAvatar}>
                        <MaterialCommunityIcons
                          name="candle"
                          size={32}
                          color="#f59e0b"
                        />
                      </View>
                    )}
                  </View>

                  <View
                    style={{
                      flex: 1,
                      alignItems: 'flex-end',
                      marginRight: 12,
                    }}
                  >
                    <Text style={styles.deceasedName}>
                      {item.name}
                    </Text>

                    <Text style={styles.dateText}>
                      کۆچی دوایی: {item.death_date}
                    </Text>
                  </View>
                </View>

                {/* زانیارییەکانی پرسە */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#f59e0b"
                    />

                    <Text style={styles.infoText}>
                      پرسەی پیاوان:{' '}
                      {item.men_hall || 'مزگەوتی گوند'}
                    </Text>
                  </View>

                  {item.women_hall && (
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#f59e0b"
                      />

                      <Text style={styles.infoText}>
                        پرسەی ئافرەتان:{' '}
                        {item.women_hall}
                      </Text>
                    </View>
                  )}

                  {item.notes && (
                    <Text style={styles.notesText}>
                      {item.notes}
                    </Text>
                  )}
                </View>

                {/* دوگمەی پەیوەندیکردن */}
                {item.phone && (
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() =>
                      handleCall(item.phone)
                    }
                  >
                    <Ionicons
                      name="call"
                      size={18}
                      color="#000"
                    />

                    <Text style={styles.callBtnText}>
                      سەرەخۆشیکردن ({item.phone})
                    </Text>
                  </TouchableOpacity>
                )}

                {/* بەشی سەرەخۆشینوسین */}
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>
                    پەیامەکانی سەرەخۆشی
                  </Text>

                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder="پەیامی سەرەخۆشی بنووسە..."
                      placeholderTextColor="#9ca3af"
                      value={
                        newComments[item.id] || ''
                      }
                      onChangeText={(txt) =>
                        setNewComments((prev) => ({
                          ...prev,
                          [item.id]: txt,
                        }))
                      }
                    />

                    <TouchableOpacity
                      style={styles.sendBtn}
                      onPress={() =>
                        handleAddComment(item.id)
                      }
                    >
                      <Ionicons
                        name="send"
                        size={16}
                        color="#000"
                      />
                    </TouchableOpacity>
                  </View>

                  {comments[item.id] &&
                    comments[item.id].map((c) => (
                      <View
                        key={c.id}
                        style={styles.commentBubble}
                      >
                        <Text style={styles.commentText}>
                          {c.text}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1329',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#172554',
  },

  quranBanner: {
    backgroundColor: '#172554',
    padding: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a8a',
  },

  quranText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },

  quranSub: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },

  scrollContent: {
    padding: 16,
  },

  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 40,
  },

  card: {
    backgroundColor: '#172554',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },

  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarBorder: {
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderRadius: 35,
    padding: 2,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0b1329',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deceasedName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  dateText: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 2,
  },

  infoBox: {
    backgroundColor: '#0b1329',
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    gap: 8,
  },

  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },

  infoText: {
    color: '#cbd5e1',
    fontSize: 13,
  },

  notesText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },

  callBtn: {
    flexDirection: 'row',
    backgroundColor: '#f59e0b',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },

  callBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },

  commentsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e3a8a',
    paddingTop: 10,
  },

  commentsTitle: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 8,
  },

  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  input: {
    flex: 1,
    backgroundColor: '#0b1329',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    textAlign: 'right',
    fontSize: 12,
  },

  sendBtn: {
    backgroundColor: '#f59e0b',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },

  commentBubble: {
    backgroundColor: '#0b1329',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    alignItems: 'flex-end',
  },

  commentText: {
    color: '#e2e8f0',
    fontSize: 12,
  },
});