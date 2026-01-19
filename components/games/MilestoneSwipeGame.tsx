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
  Extrapolation,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import {
  Check,
  X,
  AlertTriangle,
  Smile,
  Moon,
  Thermometer,
  Droplets,
  Heart,
  Baby,
  Stethoscope,
  HelpCircle,
} from 'lucide-react-native';
import LioMascot from '@/components/LioMascot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// --- 1. INTERNAL ICON MAP (Covers all Day 1-9 topics) ---
const ICON_MAP: Record<string, React.ElementType> = {
  check: Check,
  alert: AlertTriangle,
  warning: AlertTriangle,
  smile: Smile,
  moon: Moon,
  thermometer: Thermometer,
  droplet: Droplets,
  heart: Heart,
  baby: Baby,
  doctor: Stethoscope,
};

// --- TYPES ---
export type Card = {
  id: string;
  icon?: string;
  text: string;
  answer: 'left' | 'right';
  feedback: string;
};

type Props = {
  content: {
    intro?: { text: string };
    cards: Card[];
    reward?: { text: string; reward: string };
  };
  onComplete: (score: number) => void;
};

// --- SWIPEABLE CARD ---
function SwipeableCard({
  card,
  onSwipe,
  isActive,
}: {
  card: Card;
  onSwipe: (dir: 'left' | 'right') => void;
  isActive: boolean;
}) {
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
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        runOnJS(onSwipe)('left');
      } else if (event.translationX > SWIPE_THRESHOLD) {
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
      Extrapolation.CLAMP
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

  // Get Icon
  const IconComponent = card.icon
    ? ICON_MAP[card.icon] || HelpCircle
    : HelpCircle;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        <View style={styles.card}>
          {/* Overlays */}
          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.leftOverlay,
              { opacity: translateX.value < -50 ? 1 : 0 },
            ]}
          >
            <X size={80} color="white" />
            <Text style={styles.overlayText}>FALSE / UNSAFE</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.rightOverlay,
              { opacity: translateX.value > 50 ? 1 : 0 },
            ]}
          >
            <Check size={80} color="white" />
            <Text style={styles.overlayText}>TRUE / SAFE</Text>
          </Animated.View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <View style={styles.iconBadge}>
              <IconComponent size={60} color={Colors.white} />
            </View>
            <Text style={styles.cardText}>{card.text}</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// --- MAIN GAME ---
export default function MilestoneSwipeGame({ content, onComplete }: Props) {
  const [phase, setPhase] = useState<'intro' | 'game' | 'reward'>(
    content.intro ? 'intro' : 'game'
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    correct: boolean;
    feedback: string;
  } | null>(null);

  const currentCard = content.cards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    const isCorrect = direction === currentCard.answer;
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    setLastAnswer({ correct: isCorrect, feedback: currentCard.feedback });
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIndex < content.cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (content.reward) {
        setPhase('reward');
      } else {
        const score = Math.round((correctCount / content.cards.length) * 100);
        onComplete(score);
      }
    }
  };

  const finishGame = () => {
    const score = Math.round((correctCount / content.cards.length) * 100);
    onComplete(score);
  };

  if (phase === 'intro' && content.intro) {
    return (
      <View style={styles.centerContainer}>
        <LioMascot state="excited" size={160} />
        <Text style={styles.introTitle}>The Final Check!</Text>
        <Text style={styles.introText}>{content.intro.text}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => setPhase('game')}>
          <Text style={styles.btnText}>Start Exam</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'reward' && content.reward) {
    return (
      <View style={styles.centerContainer}>
        <LioMascot state="happy" size={160} />
        <Text style={styles.introTitle}>All Done!</Text>
        <Text style={styles.introText}>{content.reward.text}</Text>
        <Text style={styles.rewardAmount}>{content.reward.reward}</Text>
        <Text style={styles.scoreText}>
          You got {correctCount} out of {content.cards.length} right!
        </Text>
        <TouchableOpacity style={styles.btn} onPress={finishGame}>
          <Text style={styles.btnText}>Finish Course</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressLabel}>FINAL MILESTONE</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentIndex / content.cards.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {content.cards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {!showFeedback && (
          <SwipeableCard
            card={currentCard}
            onSwipe={handleSwipe}
            isActive={true}
          />
        )}
      </View>

      {/* FEEDBACK MODAL */}
      {showFeedback && lastAnswer && (
        <View
          style={[
            styles.feedback,
            lastAnswer.correct ? styles.correct : styles.incorrect,
          ]}
        >
          <View style={styles.feedbackIcon}>
            {lastAnswer.correct ? (
              <Check color="white" size={32} />
            ) : (
              <X color="white" size={32} />
            )}
          </View>
          <Text style={styles.feedbackTitle}>
            {lastAnswer.correct ? 'Correct!' : 'Incorrect'}
          </Text>
          <Text style={styles.feedbackText}>{lastAnswer.feedback}</Text>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>
              {currentIndex < content.cards.length - 1
                ? 'Next Question'
                : 'See Results'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.legendItem}>
          <X size={20} color={Colors.error} />
          <Text style={styles.legendText}>False / Unsafe</Text>
        </View>
        <View style={styles.legendItem}>
          <Check size={20} color={Colors.success} />
          <Text style={styles.legendText}>True / Safe</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },

  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray[400],
    marginBottom: 5,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary },
  progressText: { marginTop: 5, color: Colors.gray[500], fontWeight: 'bold' },

  cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardWrapper: { width: CARD_WIDTH, height: 420 },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    ...Shadow.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },

  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  cardText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.gray[800],
    lineHeight: 30,
  },

  swipeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftOverlay: { backgroundColor: Colors.error },
  rightOverlay: { backgroundColor: Colors.success },
  overlayText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 24,
    marginTop: 10,
    letterSpacing: 1,
  },

  feedback: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 20,
    ...Shadow.large,
  },
  correct: { backgroundColor: Colors.success },
  incorrect: { backgroundColor: Colors.error },
  feedbackIcon: {
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 50,
  },
  feedbackTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  feedbackText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  continueBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
  continueBtnText: {
    fontWeight: 'bold',
    color: Colors.gray[800],
    fontSize: 16,
  },

  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
    marginTop: 20,
  },
  introText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    color: Colors.gray[600],
    lineHeight: 26,
  },
  rewardAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.accent,
    marginVertical: 20,
  },
  scoreText: {
    fontSize: 16,
    color: Colors.gray[500],
    marginBottom: 30,
    fontWeight: 'bold',
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    ...Shadow.medium,
  },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 40,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendText: { fontSize: 14, color: Colors.gray[500], fontWeight: 'bold' },
});
