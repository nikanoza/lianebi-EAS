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

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 40;
const TOLERANCE = 40;

// --- HELPER WORKLET ---
function getDistance(x1: number, y1: number, x2: number, y2: number) {
  'worklet'; // <--- THIS PREVENTS THE CRASH
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

const SHAPES = [
  {
    id: 'path_i',
    label: "Step 1: The 'I'",
    instruction: 'Stroke down the left side',
    svgPath: `M ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.2} L ${
      CANVAS_SIZE * 0.75
    } ${CANVAS_SIZE * 0.8}`,
    checkpoints: [
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.5 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.8 },
    ],
  },
  {
    id: 'path_l',
    label: "Step 2: The 'L'",
    instruction: 'Across and down',
    svgPath: `M ${CANVAS_SIZE * 0.25} ${CANVAS_SIZE * 0.2} L ${
      CANVAS_SIZE * 0.75
    } ${CANVAS_SIZE * 0.2} L ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.8}`,
    checkpoints: [
      { x: CANVAS_SIZE * 0.25, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.5 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.8 },
    ],
  },
  {
    id: 'path_u',
    label: "Step 3: The 'U'",
    instruction: 'Upside down U from right to left',
    svgPath: `M ${CANVAS_SIZE * 0.25} ${CANVAS_SIZE * 0.8} L ${
      CANVAS_SIZE * 0.25
    } ${CANVAS_SIZE * 0.2} L ${CANVAS_SIZE * 0.75} ${CANVAS_SIZE * 0.2} L ${
      CANVAS_SIZE * 0.75
    } ${CANVAS_SIZE * 0.8}`,
    checkpoints: [
      { x: CANVAS_SIZE * 0.25, y: CANVAS_SIZE * 0.8 },
      { x: CANVAS_SIZE * 0.25, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.5, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.2 },
      { x: CANVAS_SIZE * 0.75, y: CANVAS_SIZE * 0.8 },
    ],
  },
];

type Props = {
  onComplete: (score: number) => void;
};

export default function MassageGame({ onComplete }: Props) {
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [userPath, setUserPath] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedAll, setCompletedAll] = useState(false);

  // --- REANIMATED SHARED VALUES (UI Thread State) ---
  const currentCheckPointIndex = useSharedValue(0);
  const isDrawing = useSharedValue(false);
  const tempPath = useSharedValue(''); // Builds the string on UI thread

  const currentShape = SHAPES[currentShapeIndex];

  // Reset logic when shape changes
  useEffect(() => {
    setUserPath('');
    setIsSuccess(false);
    // Reset SharedValues on UI thread
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
      if (currentShapeIndex < SHAPES.length - 1) {
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

      const startPoint = currentShape.checkpoints[0];
      const dist = getDistance(e.x, e.y, startPoint.x, startPoint.y);

      if (dist < TOLERANCE) {
        isDrawing.value = true;
        currentCheckPointIndex.value = 1;

        // Start path string
        tempPath.value = `${e.x},${e.y}`;
        runOnJS(setUserPath)(tempPath.value);
      } else {
        isDrawing.value = false;
      }
    })
    .onUpdate((e) => {
      if (!isDrawing.value || isSuccess) return;

      // Append to path string on UI thread
      tempPath.value = `${tempPath.value} ${e.x},${e.y}`;
      runOnJS(setUserPath)(tempPath.value);

      // Logic check
      const targetIndex = currentCheckPointIndex.value;
      if (targetIndex < currentShape.checkpoints.length) {
        const target = currentShape.checkpoints[targetIndex];
        const dist = getDistance(e.x, e.y, target.x, target.y);

        if (dist < TOLERANCE) {
          currentCheckPointIndex.value += 1;

          if (currentCheckPointIndex.value >= currentShape.checkpoints.length) {
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
        <Text style={styles.title}>Massage Master!</Text>
        <Text style={styles.subtitle}>Baby feels much better now.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentShape.label}</Text>
        <Text style={styles.instruction}>{currentShape.instruction}</Text>
      </View>

      <View style={styles.canvasContainer}>
        <View style={styles.tummyBg}>
          <View style={styles.bellyButton} />
        </View>

        <GestureDetector gesture={pan}>
          <View style={styles.svgWrapper}>
            <Svg height={CANVAS_SIZE} width={CANVAS_SIZE}>
              {/* Guide Lines */}
              <Path
                d={currentShape.svgPath}
                stroke={Colors.gray[300]}
                strokeWidth={30}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d={currentShape.svgPath}
                stroke={Colors.primary}
                strokeWidth={4}
                strokeDasharray="10, 10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.5}
              />

              {/* Target Dot */}
              <Circle
                cx={currentShape.checkpoints[0].x}
                cy={currentShape.checkpoints[0].y}
                r={12}
                fill={Colors.accent}
              />

              {/* User Line */}
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
            <Text style={styles.successText}>Great!</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.helperText}>{currentShapeIndex + 1} / 3</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[800],
    marginBottom: Spacing.xs,
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
    borderRadius: BorderRadius.full,
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
  svgWrapper: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    zIndex: 10,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: BorderRadius.full,
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
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  helperText: {
    color: Colors.gray[400],
    fontWeight: 'bold',
  },
});
