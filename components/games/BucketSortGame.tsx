import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Check, X, Smile, AlertTriangle, Info } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';

const { width } = Dimensions.get('window');
const DROP_ZONE_HEIGHT = 180;

type Bucket = {
  id: string;
  label: string;
  icon: string;
};

type Item = {
  text: string;
  colorHex: string;
  targetBucket: string;
};

type Props = {
  content: {
    instructions: string;
    buckets: Bucket[];
    items: Item[];
  };
  onComplete: (score: number) => void;
};

export default function BucketSortGame({ content, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);

  // Feedback state
  const [feedback, setFeedback] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  // Animation Values
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const context = useSharedValue({ x: 0, y: 0 });

  const currentItem = content.items[currentIndex];

  // Logic to handle the drop (Runs on JS thread)
  const handleDropLogic = (droppedBucketId: string) => {
    const isCorrect = currentItem.targetBucket === droppedBucketId;

    if (isCorrect) {
      // 1. Show Success Feedback
      setScore((prev) => prev + 1);
      setFeedback({ msg: 'Correct!', type: 'success' });

      // 2. Wait 1.5 seconds so user notices it
      setTimeout(() => {
        if (currentIndex < content.items.length - 1) {
          setFeedback(null); // Hide feedback
          setCurrentIndex((prev) => prev + 1); // Next Item

          // Reset Card Position
          translationX.value = 0;
          translationY.value = 0;
          scale.value = 1;
        } else {
          setIsGameFinished(true);
        }
      }, 1500);
    } else {
      // 1. Show Error Feedback
      setFeedback({ msg: 'Oops! Wrong zone.', type: 'error' });

      // 2. Wait 1.5 seconds, then reset
      setTimeout(() => {
        setFeedback(null);
        translationX.value = withSpring(0);
        translationY.value = withSpring(0);
      }, 1500);
    }
  };

  // The Drag Gesture
  const pan = Gesture.Pan()
    .onStart(() => {
      if (feedback) return; // Disable drag while showing feedback
      context.value = { x: translationX.value, y: translationY.value };
      scale.value = withSpring(1.1);
    })
    .onUpdate((e) => {
      if (feedback) return;
      translationX.value = e.translationX + context.value.x;
      translationY.value = e.translationY + context.value.y;
    })
    .onEnd(() => {
      if (feedback) return;
      scale.value = withSpring(1);

      // Check if dropped low enough (y > 150)
      if (translationY.value > 150) {
        if (translationX.value < -20) {
          // Dropped Left
          runOnJS(handleDropLogic)(content.buckets[0].id);
        } else if (translationX.value > 20) {
          // Dropped Right
          runOnJS(handleDropLogic)(content.buckets[1].id);
        } else {
          // Dropped Middle (Reset)
          translationX.value = withSpring(0);
          translationY.value = withSpring(0);
        }
      } else {
        // Not dropped in zone
        translationX.value = withSpring(0);
        translationY.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translationX.value,
      [-width / 2, width / 2],
      [-15, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
        { scale: scale.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  useEffect(() => {
    if (isGameFinished) {
      const finalScore = Math.round((score / content.items.length) * 100);
      onComplete(finalScore);
    }
  }, [isGameFinished]);

  const renderIcon = (icon: string, color: string, size = 24) => {
    if (icon === 'smile') return <Smile size={size} color={color} />;
    if (icon === 'warning') return <AlertTriangle size={size} color={color} />;
    return <Info size={size} color={color} />;
  };

  if (isGameFinished) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.instructionText}>{content.instructions}</Text>
        <Text style={styles.progressText}>
          Item {currentIndex + 1} of {content.items.length}
        </Text>
      </View>

      {/* Play Area */}
      <View style={styles.playArea}>
        {/* The Card */}
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.card,
              animatedCardStyle,
              { backgroundColor: currentItem.colorHex },
            ]}
          >
            <View style={styles.cardInner}>
              <Text
                style={[
                  styles.cardText,
                  {
                    color: ['#000000', '#4B5320', '#D62828'].includes(
                      currentItem.colorHex
                    )
                      ? '#FFF'
                      : '#333',
                  },
                ]}
              >
                {currentItem.text}
              </Text>
            </View>
          </Animated.View>
        </GestureDetector>

        {/* --- NEW: Big Central Feedback Overlay --- */}
        {feedback && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.feedbackOverlay}
          >
            <Animated.View
              entering={ZoomIn.springify()}
              exiting={ZoomOut.duration(200)}
              style={[
                styles.feedbackCircle,
                feedback.type === 'error'
                  ? styles.feedbackError
                  : styles.feedbackSuccess,
              ]}
            >
              {feedback.type === 'success' ? (
                <Check size={64} color="#FFF" strokeWidth={3} />
              ) : (
                <X size={64} color="#FFF" strokeWidth={3} />
              )}
            </Animated.View>
            <Text style={styles.feedbackTextMain}>{feedback.msg}</Text>
          </Animated.View>
        )}
      </View>

      {/* Drop Zones */}
      <View style={styles.bucketsContainer}>
        {content.buckets.map((bucket, index) => {
          const isLeft = index === 0;
          return (
            <View
              key={bucket.id}
              style={[
                styles.bucket,
                isLeft ? styles.bucketLeft : styles.bucketRight,
              ]}
            >
              <View style={styles.bucketIconContainer}>
                {renderIcon(
                  bucket.icon,
                  isLeft ? Colors.success : Colors.error,
                  32
                )}
              </View>
              <Text style={styles.bucketLabel}>{bucket.label}</Text>
            </View>
          );
        })}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
    zIndex: 1,
  },
  instructionText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    textAlign: 'center',
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[500],
  },
  playArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    position: 'relative', // Needed for absolute overlay
  },
  card: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFF',
    ...Shadow.medium,
  },
  cardInner: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  cardText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },

  // --- Updated Feedback Styles ---
  feedbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent background
    zIndex: 100,
    backdropFilter: 'blur(10px)', // Works on iOS/Web (optional visual candy)
  },
  feedbackCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.large,
  },
  feedbackSuccess: {
    backgroundColor: Colors.success,
  },
  feedbackError: {
    backgroundColor: Colors.error,
  },
  feedbackTextMain: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Buckets
  bucketsContainer: {
    flexDirection: 'row',
    height: DROP_ZONE_HEIGHT,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  bucket: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bucketLeft: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  bucketRight: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  bucketIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.small,
  },
  bucketLabel: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[700],
  },
});
