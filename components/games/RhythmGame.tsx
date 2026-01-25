import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

type BilingualText = string | { en: string; ka: string };

type Props = {
  content: {
    instructions: BilingualText;
    tempo: number;
    duration: number;
  };
  onComplete: (score: number) => void;
};

export default function RhythmGame({ content, onComplete }: Props) {
  const { t } = useLanguage();

  const [taps, setTaps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(content.duration);
  const [scaleValue] = useState(new Animated.Value(1));

  const getText = (text: BilingualText | undefined) => {
    if (!text) return '';
    return typeof text === 'object' ? t(text) : text;
  };

  const beatInterval = (60 / content.tempo) * 1000;

  useEffect(() => {
    if (isPlaying) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: beatInterval / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: beatInterval / 2,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        pulseAnimation.stop();
      };
    }
  }, [isPlaying]);

  const handleComplete = () => {
    setIsPlaying(false);
    const expectedTaps = Math.floor(content.duration / (beatInterval / 1000));
    const accuracy = Math.min(100, Math.round((taps / expectedTaps) * 100));
    const score = Math.max(0, Math.min(100, accuracy));
    onComplete(score);
  };

  const handleTap = () => {
    setTaps((prev) => prev + 1);
  };

  const handleStart = () => {
    setIsPlaying(true);
    setTaps(0);
    setTimeLeft(content.duration);
  };

  if (!isPlaying && taps === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.startContainer}>
          {/* NEW TITLE ADDED HERE */}
          <Text style={styles.instructions}>
            {t({ en: "Let's do it together", ka: 'მოდი ერთად გავაკეთოთ' })}
          </Text>

          <Text style={styles.instructions}>
            {getText(content.instructions)}
          </Text>

          <Text style={styles.subInstructions}>
            {t({
              en: `Tap the circle to the beat for ${content.duration} seconds`,
              ka: `დააკაკუნე რიტმზე ${content.duration} წამის განმავლობაში`,
            })}
          </Text>

          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>
              {t({ en: 'Start', ka: 'დაწყება' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timer}>
          {t({ en: 'Time', ka: 'დრო' })}: {timeLeft}s
        </Text>
        <Text style={styles.tapsCount}>
          {t({ en: 'Taps', ka: 'დარტყმა' })}: {taps}
        </Text>
      </View>

      <View style={styles.gameArea}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          disabled={!isPlaying}
        >
          <Animated.View
            style={[styles.tapCircle, { transform: [{ scale: scaleValue }] }]}
          >
            <Text style={styles.tapText}>
              {t({ en: 'TAP', ka: 'დააჭირე' })}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.babyContainer}>
          <View style={styles.babyBack}>
            <Text style={styles.babyText}>👶</Text>
          </View>
          <Text style={styles.babyLabel}>
            {t({
              en: "Gentle pats on baby's back",
              ka: 'ნაზი დარტყმები ბავშვის ზურგზე',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  instructions: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    textAlign: 'center',
  },
  subInstructions: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    ...Shadow.medium,
  },
  startButtonText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  timer: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  tapsCount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xxl,
  },
  tapCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.large,
  },
  tapText: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  babyContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  babyBack: {
    width: 150,
    height: 200,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.medium,
  },
  babyText: {
    fontSize: 80,
  },
  babyLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[600],
    textAlign: 'center',
  },
});
