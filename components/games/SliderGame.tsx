import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
  interpolate,
  Extrapolation,
  interpolateColor,
} from 'react-native-reanimated';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadow,
} from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check } from 'lucide-react-native';

// 1. TYPES
type BilingualText = string | { en: string; ka: string };

type Props = {
  content: {
    min: number;
    max: number;
    optimal: number;
    unit: string;
    instructions: BilingualText;
    // Updated to expect BilingualText
    feedbackLow: BilingualText;
    feedbackHigh: BilingualText;
    feedbackPerfect: BilingualText;
    targetRange?: { min: number; max: number };
  };
  onComplete: (score: number) => void;
};

const TRACK_HEIGHT = 300;
const KNOB_SIZE = 40;

export default function SliderGame({ content, onComplete }: Props) {
  const { t } = useLanguage();
  const [isComplete, setIsComplete] = useState(false);
  const [currentVal, setCurrentVal] = useState(content.min);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // 2. HELPER
  const getText = (text: BilingualText | undefined) => {
    if (!text) return '';
    return typeof text === 'object' ? t(text) : text;
  };

  const min = content.min || 0;
  const max = content.max || 100;
  const targetMin = content.targetRange?.min || content.optimal - 1;
  const targetMax = content.targetRange?.max || content.optimal + 1;

  // Animation Value (0 = Top/Hot, TRACK_HEIGHT = Bottom/Cold)
  // We start at the bottom (Cold)
  const translateY = useSharedValue(TRACK_HEIGHT);

  const checkValue = (y: number) => {
    // Map Y position back to Temperature Value
    const val = interpolate(
      y,
      [0, TRACK_HEIGHT],
      [max, min],
      Extrapolation.CLAMP,
    );
    const rounded = Math.round(val * 10) / 10;
    setCurrentVal(rounded);

    // Live Feedback (Dynamic Translation)
    if (rounded < targetMin) setFeedbackMsg(getText(content.feedbackLow));
    else if (rounded > targetMax) setFeedbackMsg(getText(content.feedbackHigh));
    else setFeedbackMsg(getText(content.feedbackPerfect));
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // Logic to map touch to slider track
      // offset is roughly where the finger is relative to the view
      translateY.value = interpolate(
        e.y,
        [0, TRACK_HEIGHT],
        [0, TRACK_HEIGHT],
        Extrapolation.CLAMP,
      );
      runOnJS(checkValue)(translateY.value);
    })
    .onEnd(() => {
      const val = interpolate(
        translateY.value,
        [0, TRACK_HEIGHT],
        [max, min],
        Extrapolation.CLAMP,
      );

      // Check if inside target range
      if (val >= targetMin && val <= targetMax) {
        runOnJS(setIsComplete)(true);
        // Wait a moment then finish
        setTimeout(() => {
          runOnJS(onComplete)(100);
        }, 1000);
      }
    });

  // 3. ANIMATED STYLES
  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const height = interpolate(
      translateY.value,
      [0, TRACK_HEIGHT],
      [TRACK_HEIGHT, 0],
    );
    // Dynamic Color: Red (Top) -> Green (Middle) -> Blue (Bottom)
    const color = interpolateColor(
      translateY.value,
      [0, TRACK_HEIGHT / 2, TRACK_HEIGHT],
      [Colors.error, Colors.success, '#3498db'],
    );
    return { height, backgroundColor: color };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>{getText(content.instructions)}</Text>

      <View style={styles.gameArea}>
        {/* Thermometer Visual */}
        <View style={styles.thermometer}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fillStyle]} />
          </View>

          {/* Target Line Indicator */}
          <View
            style={[
              styles.targetLine,
              {
                bottom: interpolate(
                  content.optimal,
                  [min, max],
                  [0, TRACK_HEIGHT],
                ),
              },
            ]}
          />

          {/* Drag Area */}
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.knobContainer, knobStyle]}>
              <View style={styles.knob}>
                <View style={styles.knobInner} />
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Text Display */}
        <View style={styles.readout}>
          <Text style={styles.tempText}>
            {currentVal}
            {content.unit}
          </Text>
          <Text
            style={[
              styles.feedback,
              {
                color:
                  currentVal > targetMax
                    ? Colors.error
                    : currentVal < targetMin
                      ? '#3498db'
                      : Colors.success,
              },
            ]}
          >
            {feedbackMsg}
          </Text>
        </View>

        {isComplete && (
          <View style={styles.successOverlay}>
            <Check size={48} color={Colors.success} />
            <Text style={styles.successText}>
              {t({ en: 'Safe!', ka: 'უსაფრთხოა!' })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  instructions: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    color: Colors.gray[800],
  },
  gameArea: {
    flexDirection: 'row',
    height: TRACK_HEIGHT + 50,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  thermometer: {
    width: 80,
    height: TRACK_HEIGHT,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  track: {
    width: 24,
    height: TRACK_HEIGHT,
    backgroundColor: Colors.gray[200],
    borderRadius: 12,
    overflow: 'hidden',
  },
  fill: { width: '100%', position: 'absolute', bottom: 0 },
  knobContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    height: KNOB_SIZE,
    marginTop: -KNOB_SIZE / 2,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.medium,
    borderWidth: 4,
    borderColor: Colors.gray[100],
  },
  knobInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gray[400],
  },
  targetLine: {
    position: 'absolute',
    width: 50,
    height: 4,
    backgroundColor: Colors.gray[800],
    zIndex: -1,
    opacity: 0.3,
  },
  readout: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tempText: { fontSize: 64, fontWeight: 'bold', color: Colors.gray[800] },
  feedback: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  successOverlay: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadow.large,
    zIndex: 99,
  },
  successText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: 'bold',
    color: Colors.success,
  },
});
