import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import LioMascot from '@/components/LioMascot';
import { hungerCueIcons } from '@/components/HungerCueIcons';
// 1. IMPORT THE LANGUAGE HOOK
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// 2. UPDATE TYPES TO SUPPORT BILINGUAL TEXT
type BilingualText = string | { en: string; ka: string };

type Card = {
  type?: 'intro' | 'swipe' | 'reward';
  image?: string;
  icon?: keyof typeof hungerCueIcons;
  text: BilingualText; // Changed from string to BilingualText
  answer?: string;
  feedback?: BilingualText; // Changed from string to BilingualText
  illustration?: string;
  lioMessage?: string;
  reward?: string;
};

type Props = {
  content: {
    intro?: { text: BilingualText };
    cards: Card[];
    reward?: { text: BilingualText; reward: string };
  };
  onComplete: (score: number) => void;
};

type SwipeableCardProps = {
  card: Card;
  index: number;
  totalCards: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
};

// 3. UPDATE SWIPEABLE CARD COMPONENT
function SwipeableCard({ card, onSwipe, isActive }: SwipeableCardProps) {
  // Use the hook inside the component
  const { t } = useLanguage();
  console.log(card);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.2;
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        runOnJS(onSwipe)('left');
      } else if (shouldSwipeRight) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        runOnJS(onSwipe)('right');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
    };
  });

  const leftOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP,
    ),
  }));

  const rightOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP,
    ),
  }));

  // Helper to safely render text
  const getText = (text: BilingualText | undefined) => {
    if (!text) return '';
    return typeof text === 'object' ? t(text) : text;
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        <View style={styles.card}>
          <Animated.View
            style={[styles.swipeOverlay, styles.leftOverlay, leftOverlayStyle]}
          >
            <ChevronLeft size={80} color={Colors.white} />
          </Animated.View>
          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.rightOverlay,
              rightOverlayStyle,
            ]}
          >
            <ChevronRight size={80} color={Colors.white} />
          </Animated.View>

          <View style={styles.cardContent}>
            {card.icon ? (
              <View style={styles.illustrationContainer}>
                {React.createElement(hungerCueIcons[card.icon], { size: 140 })}
                {card.text && (
                  <Text style={styles.illustrationText}>
                    {getText(card.text)}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function SwipeGame({ content, onComplete }: Props) {
  const { t } = useLanguage();

  const [phase, setPhase] = useState<'intro' | 'game' | 'reward'>(
    content.intro ? 'intro' : 'game',
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    correct: boolean;
    feedback?: BilingualText;
  } | null>(null);

  const currentCard = content.cards[currentIndex];

  // Helper inside the main component as well
  const getText = (text: BilingualText | undefined) => {
    if (!text) return '';
    return typeof text === 'object' ? t(text) : text;
  };

  const handleIntroNext = () => {
    setPhase('game');
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentCard?.answer) return;
    const isCorrect = direction === currentCard.answer;
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    setLastAnswer({
      correct: isCorrect,
      feedback: currentCard.feedback,
    });
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setLastAnswer(null);
    if (currentIndex < content.cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (content.reward) {
        setPhase('reward');
      } else {
        const finalScore = Math.round(
          (correctCount / content.cards.length) * 100,
        );
        onComplete(finalScore);
      }
    }
  };

  const handleRewardNext = () => {
    const finalScore = Math.round((correctCount / content.cards.length) * 100);
    onComplete(finalScore);
  };

  if (phase === 'intro' && content.intro) {
    return (
      <View style={styles.container}>
        <View style={styles.introContainer}>
          <LioMascot state="excited" size={160} />
          <Text style={styles.introText}>{getText(content.intro.text)}</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleIntroNext}
          >
            <Text style={styles.startButtonText}>
              {t({ en: 'Start Learning', ka: 'სწავლის დაწყება' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'reward' && content.reward) {
    return (
      <View style={styles.container}>
        <View style={styles.rewardContainer}>
          <LioMascot state="happy" size={160} />
          <Text style={styles.rewardText}>{getText(content.reward.text)}</Text>
          {content.reward.reward && (
            <Text style={styles.rewardAmount}>{content.reward.reward}</Text>
          )}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleRewardNext}
          >
            <Text style={styles.startButtonText}>
              {t({ en: 'Continue', ka: 'გაგრძელება' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          {currentIndex + 1} / {content.cards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {!showFeedback && (
          <SwipeableCard
            card={currentCard}
            index={currentIndex}
            totalCards={content.cards.length}
            onSwipe={handleSwipe}
            isActive={true}
          />
        )}
      </View>

      {showFeedback && lastAnswer && (
        <Animated.View
          style={[
            styles.feedbackOverlay,
            lastAnswer.correct
              ? styles.correctOverlay
              : styles.incorrectOverlay,
          ]}
        >
          <Text style={styles.feedbackTitle}>
            {lastAnswer.correct
              ? t({ en: 'Correct!', ka: 'სწორია!' })
              : t({ en: 'Not quite!', ka: 'არასწორია!' })}
          </Text>
          {lastAnswer.feedback && (
            <Text style={styles.feedbackText}>
              {getText(lastAnswer.feedback)}
            </Text>
          )}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              {currentIndex < content.cards.length - 1
                ? t({ en: 'Next Card', ka: 'შემდეგი' })
                : t({ en: 'Finish', ka: 'დასრულება' })}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.instructions}>
        <View style={styles.instructionRow}>
          <View style={[styles.instructionBadge, styles.leftBadge]}>
            <ChevronLeft size={20} color={Colors.white} />
            <Text style={styles.instructionBadgeText}>
              {t({ en: 'Not Hungry', ka: 'არ შია' })}
            </Text>
          </View>
          <View style={[styles.instructionBadge, styles.rightBadge]}>
            <Text style={styles.instructionBadgeText}>
              {t({ en: 'Hungry', ka: 'შია' })}
            </Text>
            <ChevronRight size={20} color={Colors.white} />
          </View>
        </View>
        <Text style={styles.instructionText}>
          {t({
            en: 'Swipe the card left or right',
            ka: 'გაუსვით ბარათს მარცხნივ ან მარჯვნივ',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  introContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  introText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
    textAlign: 'center',
    lineHeight: Typography.sizes.xxl * 1.5,
  },
  rewardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  rewardText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
    textAlign: 'center',
    lineHeight: Typography.sizes.xl * 1.5,
  },
  rewardAmount: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    ...Shadow.medium,
  },
  startButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  header: { alignItems: 'center', paddingVertical: Spacing.lg },
  progress: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Spacing.xl,
  },
  cardWrapper: { width: CARD_WIDTH, height: 420 },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.large,
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  leftOverlay: { left: 0, backgroundColor: Colors.error + '90' },
  rightOverlay: { right: 0, backgroundColor: Colors.success + '90' },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  illustrationContainer: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  illustrationText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray[800],
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * 1.4,
    paddingHorizontal: Spacing.lg,
  },
  feedbackOverlay: {
    position: 'absolute',
    bottom: 280,
    left: Spacing.lg,
    right: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadow.large,
  },
  correctOverlay: { backgroundColor: Colors.success },
  incorrectOverlay: { backgroundColor: Colors.error },
  feedbackTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  feedbackText: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * 1.4,
  },
  continueButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  continueButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  instructions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  leftBadge: { backgroundColor: Colors.error },
  rightBadge: { backgroundColor: Colors.success },
  instructionBadgeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  instructionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
  },
});
