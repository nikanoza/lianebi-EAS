import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import LioMascot from '@/components/LioMascot';
import { ArrowLeft, Check, Lock } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';

type Lesson = {
  id: string;
  unit_id: string;
  day_number: number;
  title: string;
  description: string | null;
  game_type: string;
  care_drops_reward: number;
  order_index: number;
};

type UserProgress = {
  lesson_id: string;
  completed: boolean;
  score: number;
};

export default function UnitMapScreen() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unitTitle, setUnitTitle] = useState('');

  useEffect(() => {
    if (id) {
      fetchLessons();
    }
  }, [id]);

  const fetchLessons = async () => {
    try {
      setError(null);
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('title')
        .eq('id', id as string)
        .maybeSingle();

      if (unitError) {
        console.error('Error fetching unit:', unitError);
        setError('Failed to load unit: ' + unitError.message);
        throw unitError;
      }

      if (unit) {
        setUnitTitle(unit.title);
      }

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('unit_id', id as string)
        .order('order_index');

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        setError('Failed to load lessons: ' + lessonsError.message);
        throw lessonsError;
      }

      if (lessonsData) {
        console.log('Fetched lessons:', lessonsData.length, lessonsData);
        setLessons(lessonsData);
        if (profile) {
          await fetchProgress(lessonsData);
        }
      } else {
        console.log('No lessons data returned');
        setLessons([]);
      }
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      setError('Failed to load lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (lessonsList: Lesson[]) => {
    if (!profile) return;

    try {
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', profile.id)
        .in('lesson_id', lessonsList.map(l => l.id));

      const progressMap: Record<string, UserProgress> = {};
      progressData?.forEach(p => {
        progressMap[p.lesson_id] = p;
      });

      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const getLessonState = (lesson: Lesson, index: number) => {
    const progress = userProgress[lesson.id];
    if (progress?.completed) return 'completed';

    const prevLesson = index > 0 ? lessons[index - 1] : null;
    const prevProgress = prevLesson ? userProgress[prevLesson.id] : null;

    if (index === 0 || prevProgress?.completed) {
      return 'active';
    }

    return 'locked';
  };

  const handleLessonPress = (lesson: Lesson) => {
    const index = lessons.findIndex(l => l.id === lesson.id);
    const state = getLessonState(lesson, index);

    if (state === 'locked') return;

    router.push(`/lesson/${lesson.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{unitTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchLessons}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && !loading && lessons.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lessons available yet</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchLessons}>
              <Text style={styles.retryButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mapContainer}>
          {lessons.map((lesson, index) => {
            const state = getLessonState(lesson, index);
            const isCompleted = state === 'completed';
            const isActive = state === 'active';
            const isLocked = state === 'locked';

            const isLeft = index % 2 === 0;

            return (
              <View
                key={lesson.id}
                style={[
                  styles.lessonNodeContainer,
                  isLeft ? styles.lessonNodeLeft : styles.lessonNodeRight,
                ]}
              >
                {index > 0 && <View style={styles.pathLine} />}

                <TouchableOpacity
                  style={[
                    styles.lessonNode,
                    isCompleted && styles.lessonNodeCompleted,
                    isActive && styles.lessonNodeActive,
                    isLocked && styles.lessonNodeLocked,
                  ]}
                  onPress={() => handleLessonPress(lesson)}
                  disabled={isLocked}
                  activeOpacity={0.8}
                >
                  <View style={styles.lessonIconContainer}>
                    {isCompleted ? (
                      <View style={styles.checkIcon}>
                        <Check size={24} color={Colors.gold} />
                      </View>
                    ) : isActive ? (
                      <LioMascot state="standing" size={60} />
                    ) : (
                      <Lock size={24} color={Colors.gray[400]} />
                    )}
                  </View>

                  <View style={styles.lessonInfo}>
                    <Text style={styles.dayLabel}>Day {lesson.day_number}</Text>
                    <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]}>
                      {lesson.title}
                    </Text>
                    {lesson.description && (
                      <Text style={[styles.lessonDescription, isLocked && styles.lessonDescriptionLocked]}>
                        {lesson.description}
                      </Text>
                    )}
                    {!isLocked && (
                      <View style={styles.rewardBadge}>
                        <Text style={styles.rewardText}>+{lesson.care_drops_reward} drops</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  mapContainer: {
    paddingVertical: Spacing.lg,
  },
  lessonNodeContainer: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  lessonNodeLeft: {
    alignItems: 'flex-start',
  },
  lessonNodeRight: {
    alignItems: 'flex-end',
  },
  pathLine: {
    position: 'absolute',
    top: -Spacing.xl,
    left: '50%',
    width: 3,
    height: Spacing.xl,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  lessonNode: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '85%',
    flexDirection: 'row',
    gap: Spacing.md,
    ...Shadow.medium,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lessonNodeCompleted: {
    borderColor: Colors.gold,
    backgroundColor: '#FFFEF5',
  },
  lessonNodeActive: {
    borderColor: Colors.primary,
    ...Shadow.large,
  },
  lessonNodeLocked: {
    opacity: 0.6,
  },
  lessonIconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  dayLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  lessonTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
  },
  lessonTitleLocked: {
    color: Colors.gray[500],
  },
  lessonDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    lineHeight: 18,
  },
  lessonDescriptionLocked: {
    color: Colors.gray[400],
  },
  rewardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  rewardText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  errorContainer: {
    padding: Spacing.lg,
    backgroundColor: '#FEE',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    color: '#C33',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
