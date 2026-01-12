import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Thermometer } from 'lucide-react-native';

type Props = {
  content: {
    instructions: string;
    min: number;
    max: number;
    optimal: number;
    unit: string;
    safeRange: [number, number];
  };
  onComplete: (score: number) => void;
};

export default function SliderGame({ content, onComplete }: Props) {
  const [value, setValue] = useState((content.min + content.max) / 2);
  const [submitted, setSubmitted] = useState(false);

  const isInSafeRange = value >= content.safeRange[0] && value <= content.safeRange[1];
  const isOptimal = Math.abs(value - content.optimal) <= 0.5;

  const handleSubmit = () => {
    setSubmitted(true);
    const distance = Math.abs(value - content.optimal);
    const maxDistance = Math.max(
      Math.abs(content.min - content.optimal),
      Math.abs(content.max - content.optimal)
    );
    const accuracy = Math.max(0, 100 - (distance / maxDistance) * 100);
    const score = Math.round(accuracy);

    setTimeout(() => {
      onComplete(score);
    }, 1500);
  };

  const getColor = () => {
    if (!submitted) return Colors.accent;
    if (isOptimal) return Colors.success;
    if (isInSafeRange) return Colors.warning;
    return Colors.error;
  };

  const getMessage = () => {
    if (!submitted) return 'Adjust to the safe temperature';
    if (isOptimal) return 'Perfect temperature!';
    if (isInSafeRange) return 'Safe, but not optimal';
    return 'Outside safe range!';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.instructions}>{content.instructions}</Text>
        <Text style={styles.subInstructions}>
          Safe range: {content.safeRange[0]}{content.unit} - {content.safeRange[1]}{content.unit}
        </Text>
      </View>

      <View style={styles.thermometerContainer}>
        <View style={[styles.thermometer, { borderColor: getColor() }]}>
          <Thermometer size={80} color={getColor()} />
          <Text style={[styles.temperatureText, { color: getColor() }]}>
            {value.toFixed(1)}{content.unit}
          </Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderWrapper}>
          <Text style={styles.minLabel}>{content.min}{content.unit}</Text>
          <View style={styles.slider}>
            <Slider
              style={styles.sliderTrack}
              minimumValue={content.min}
              maximumValue={content.max}
              value={value}
              onValueChange={setValue}
              minimumTrackTintColor={getColor()}
              maximumTrackTintColor={Colors.gray[300]}
              thumbTintColor={getColor()}
              disabled={submitted}
              step={0.1}
            />
            <View style={styles.safeZoneIndicator}>
              <View
                style={[
                  styles.safeZone,
                  {
                    left: `${((content.safeRange[0] - content.min) / (content.max - content.min)) * 100}%`,
                    width: `${((content.safeRange[1] - content.safeRange[0]) / (content.max - content.min)) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.maxLabel}>{content.max}{content.unit}</Text>
        </View>
      </View>

      <View style={styles.feedback}>
        <Text style={[styles.feedbackText, { color: getColor() }]}>
          {getMessage()}
        </Text>
      </View>

      {!submitted && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Check Temperature</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  instructions: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    textAlign: 'center',
  },
  subInstructions: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  thermometerContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xxl,
  },
  thermometer: {
    width: 200,
    height: 200,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    ...Shadow.large,
  },
  temperatureText: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  sliderContainer: {
    paddingHorizontal: Spacing.lg,
  },
  sliderWrapper: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.medium,
  },
  slider: {
    position: 'relative',
    marginVertical: Spacing.md,
  },
  sliderTrack: {
    width: '100%',
    height: 40,
  },
  safeZoneIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    pointerEvents: 'none',
  },
  safeZone: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.sm,
  },
  minLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
  },
  maxLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    alignSelf: 'flex-end',
  },
  feedback: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    minHeight: 60,
  },
  feedbackText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginTop: Spacing.lg,
    ...Shadow.medium,
  },
  submitButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
});
