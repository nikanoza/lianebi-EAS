import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { updateStreak } from '@/lib/streakHelper';
import { ArrowLeft, Award, Droplet } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';
import SwipeGame from '@/components/games/SwipeGame';
import RhythmGame from '@/components/games/RhythmGame';
import DragDropGame from '@/components/games/DragDropGame';
import SliderGame from '@/components/games/SliderGame';
import QuizGame from '@/components/games/QuizGame';
import MultiGame from '@/components/games/MultiGame';
import LioMascot from '@/components/LioMascot';

type Lesson = {
  id: string;
  unit_id: string;
  day_number: number;
  title: string;
  description: string | null;
  game_type: string;
  content: any;
  care_drops_reward: number;
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const { profile, refreshProfile, user } = useAuth();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id as string)
        .single();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (finalScore: number) => {
    await refreshProfile();
    if (!lesson || !profile) return;

    setScore(finalScore);
    // Move setShowResults(true) to AFTER the save or keep here but handle loading state
    setShowResults(true);
    console.log(4);
    try {
      // 1. Save Progress
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('id') // Just select ID to be faster
        .eq('user_id', user?.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      console.log(5);
      if (existingProgress) {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            completed: true,
            score: finalScore,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            user_id: profile.id,
            lesson_id: lesson.id,
            completed: true,
            score: finalScore,
            completed_at: new Date().toISOString(),
          });
        if (insertError) throw insertError;
      }
      console.log(6);
      // 2. Transaction (Only if needed, wrap in try/catch to avoid blocking progress)
      // ... (keep your transaction code here)

      // 3. Update Profile
      await supabase
        .from('user_profiles')
        .update({
          care_drops: profile.care_drops + lesson.care_drops_reward,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
      console.log(7);
      // 4. Refresh context
      await updateStreak(profile.id);
      await refreshProfile();
      console.log(8);
    } catch (error: any) {
      console.error('Error saving progress:', error);
      // SHOW THE ERROR TO THE USER
      Alert.alert(
        'Save Error',
        error.message ||
          'Could not save progress. Check your internet or RLS policies.'
      );
    }
  };

  const handleContinue = () => {
    // Hide modal first
    setShowResults(false);

    // Fix Navigation: Try to go back, otherwise go to home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)'); // or wherever your map screen is
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }
  const renderGame = () => {
    switch (lesson.game_type) {
      case 'swipe':
        return (
          <SwipeGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'rhythm':
        return (
          <RhythmGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'drag_drop':
        return (
          <DragDropGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'slider':
        return (
          <SliderGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'quiz':
        return (
          <QuizGame content={lesson.content} onComplete={handleComplete} />
        );
      case 'multi':
        return (
          <MultiGame content={lesson.content} onComplete={handleComplete} />
        );
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unknown game type</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.dayLabel}>Day {lesson.day_number}</Text>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {renderGame()}

      <Modal
        visible={showResults}
        transparent
        animationType="fade"
        onRequestClose={handleContinue}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultsCard}>
            <LioMascot state="happy" size={120} />

            <Text style={styles.resultsTitle}>Great Job!</Text>

            <View style={styles.scoreContainer}>
              <Award size={32} color={Colors.gold} />
              <Text style={styles.scoreText}>{score}%</Text>
            </View>

            <View style={styles.rewardContainer}>
              <Droplet size={24} color={Colors.accent} />
              <Text style={styles.rewardText}>
                +{lesson.care_drops_reward} Care Drops
              </Text>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.error,
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  resultsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...Shadow.large,
  },
  resultsTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  scoreText: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  rewardText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    ...Shadow.medium,
    zIndex: 9999,
  },
  continueButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
});
