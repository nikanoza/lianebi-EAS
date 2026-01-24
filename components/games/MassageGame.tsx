import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Vibration } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import Animated, {
  useSharedValue,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Check } from 'lucide-react-native';
import LioMascot from '@/components/LioMascot';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

// --- FIX: Cap the size so it doesn't get huge on tablets/desktop ---
const CANVAS_SIZE = Math.min(width - 40, 340);
const TOLERANCE = 45;

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  'worklet';
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// --- GEOMETRY DEFINITIONS ---
const SHAPE_GEOMETRY: Record<string, any> = {
  I: {
    svgPath: `M ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.2} L ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.8}`,
    checkpoints: [
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.5 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.8 },
    ],
  },
  L: {
    svgPath: `M ${CANVAS_SIZE * 0.25} ${CANVAS_SIZE * 0.2} L ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.2} L ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.8}`,
    checkpoints: [
      { x: CANVAS_SIZE * 0.25, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.5 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.8 },
    ],
  },
  U: {
    svgPath: `M ${CANVAS_SIZE * 0.25} ${CANVAS_SIZE * 0.8} L ${CANVAS_SIZE * 0.25} ${CANVAS_SIZE * 0.2} L ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.2} L ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.8}`,
    checkpoints: [
      { x: CANVAS_SIZE * 0.25, y: CANVAS_SIZE * 0.8 },
      { x: CANVAS_SIZE * 0.25, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.5, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.8 },
    ],
  },
};

type BilingualText = string | { en: string; ka: string };

type PathItem = {
  id: string;
  label: BilingualText;
  hint: BilingualText;
  shape: string;
};

type Props = {
  content: {
    instructions: BilingualText;
    paths: PathItem[];
  };
  onComplete: (score: number) => void;
};

export default function MassageGame({ content, onComplete }: Props) {
  const { t } = useLanguage();
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [userPath, setUserPath] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedAll, setCompletedAll] = useState(false);

  const getText = (text: BilingualText | undefined) => {
    if (!text) return '';
    return typeof text === 'object' ? t(text) : text;
  };

  const currentCheckPointIndex = useSharedValue(0);
  const isDrawing = useSharedValue(false);
  const tempPath = useSharedValue('');

  // Fallback to empty array if paths is undefined (prevents crash)
  const paths = content?.paths || [];
  const pathItem = paths[currentShapeIndex] || {
    label: '',
    hint: '',
    shape: 'I',
  };
  const geometry = SHAPE_GEOMETRY[pathItem.shape] || SHAPE_GEOMETRY['I'];

  useEffect(() => {
    setUserPath('');
    setIsSuccess(false);
    runOnJS(resetSharedValues)();
  }, [currentShapeIndex]);

  const resetSharedValues = () => {
    'worklet';
    currentCheckPointIndex.value = 0;
    isDrawing.value = false;
    tempPath.value = '';
  };

  const handleSuccess = () => {
    Vibration.vibrate(50);
    setIsSuccess(true);

    setTimeout(() => {
      if (currentShapeIndex < paths.length - 1) {
        setCurrentShapeIndex((prev) => prev + 1);
      } else {
        setCompletedAll(true);
        onComplete(100);
      }
    }, 1500);
  };

  const pan = Gesture.Pan()
    .onStart((e) => {
      if (isSuccess || completedAll) return;
      const startPoint = geometry.checkpoints[0];
      const dist = getDistance(e.x, e.y, startPoint.x, startPoint.y);
      if (dist < TOLERANCE) {
        isDrawing.value = true;
        currentCheckPointIndex.value = 1;
        tempPath.value = `${e.x},${e.y}`;
        runOnJS(setUserPath)(tempPath.value);
      } else {
        isDrawing.value = false;
      }
    })
    .onUpdate((e) => {
      if (!isDrawing.value || isSuccess) return;
      tempPath.value = `${tempPath.value} ${e.x},${e.y}`;
      runOnJS(setUserPath)(tempPath.value);
      const targetIndex = currentCheckPointIndex.value;
      if (targetIndex < geometry.checkpoints.length) {
        const target = geometry.checkpoints[targetIndex];
        const dist = getDistance(e.x, e.y, target.x, target.y);
        if (dist < TOLERANCE) {
          currentCheckPointIndex.value += 1;
          if (currentCheckPointIndex.value >= geometry.checkpoints.length) {
            isDrawing.value = false;
            runOnJS(handleSuccess)();
          }
        }
      }
    })
    .onEnd(() => {
      if (!isSuccess) {
        runOnJS(setUserPath)('');
        currentCheckPointIndex.value = 0;
        tempPath.value = '';
      }
    });

  if (completedAll) {
    return (
      <View style={styles.centerContainer}>
        <LioMascot state="happy" size={160} />
        <Text style={styles.title}>
          {t({ en: 'Massage Master!', ka: 'მასაჟის ოსტატი!' })}
        </Text>
        <Text style={styles.subtitle}>
          {t({
            en: 'Baby feels much better now.',
            ka: 'ბავშვი ახლა თავს უკეთ გრძნობს.',
          })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getText(pathItem.label)}</Text>
        <Text style={styles.instruction}>{getText(pathItem.hint)}</Text>
      </View>
      <View style={styles.canvasContainer}>
        <View style={styles.tummyBg}>
          <View style={styles.bellyButton} />
        </View>
        <GestureDetector gesture={pan}>
          <View style={styles.svgWrapper}>
            <Svg height={CANVAS_SIZE} width={CANVAS_SIZE}>
              <Path
                d={geometry.svgPath}
                stroke={Colors.gray[200]}
                strokeWidth={40}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d={geometry.svgPath}
                stroke={Colors.primary}
                strokeWidth={4}
                strokeDasharray="10, 10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.5}
              />
              <Circle
                cx={geometry.checkpoints[0].x}
                cy={geometry.checkpoints[0].y}
                r={12}
                fill={Colors.accent}
              />
              <Polyline
                points={userPath}
                fill="none"
                stroke={isSuccess ? Colors.success : Colors.accent}
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />
            </Svg>
          </View>
        </GestureDetector>
        {isSuccess && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.successOverlay}
          >
            <Check size={64} color="white" />
            <Text style={styles.successText}>
              {t({ en: 'Great!', ka: 'ყოჩაღ!' })}
            </Text>
          </Animated.View>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.helperText}>
          {currentShapeIndex + 1} / {paths.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  instruction: {
    fontSize: Typography.sizes.base,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  canvasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: CANVAS_SIZE,
    width: CANVAS_SIZE,
    alignSelf: 'center',
  },
  tummyBg: {
    position: 'absolute',
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#FFE0BD',
    // FIX: Dynamic radius for perfect circle
    borderRadius: CANVAS_SIZE / 2,
    opacity: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellyButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EAC09A',
    opacity: 0.6,
  },
  svgWrapper: { width: CANVAS_SIZE, height: CANVAS_SIZE, zIndex: 10 },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 9999, // Use huge number or calculate dynamically if needed, 9999 works for circles
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  successText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 32,
    marginTop: 10,
  },
  footer: { alignItems: 'center', marginTop: Spacing.xl },
  helperText: { color: Colors.gray[400], fontWeight: 'bold' },
});
