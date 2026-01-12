import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

type LioState = 'sleeping' | 'happy' | 'excited' | 'swaddle_happy' | 'standing';

type Props = {
  state?: LioState;
  size?: number;
};

export default function LioMascot({ state = 'happy', size = 120 }: Props) {
  const renderLio = () => {
    switch (state) {
      case 'sleeping':
        return (
          <Svg width={size} height={size} viewBox="0 0 120 120">
            <Circle cx="60" cy="70" r="35" fill="#FFE5B4" />
            <Circle cx="60" cy="50" r="28" fill="#FFE5B4" />
            <Ellipse cx="50" cy="48" rx="3" ry="2" fill="#8B4513" />
            <Ellipse cx="70" cy="48" rx="3" ry="2" fill="#8B4513" />
            <Path d="M 50 58 Q 60 62 70 58" stroke="#FF6B6B" strokeWidth="2" fill="none" />
            <Path d="M 35 45 Q 30 35 25 40" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Path d="M 85 45 Q 90 35 95 40" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Circle cx="45" cy="80" r="8" fill="#FFD4A3" />
            <Circle cx="75" cy="80" r="8" fill="#FFD4A3" />
          </Svg>
        );
      case 'excited':
        return (
          <Svg width={size} height={size} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="35" fill="#FFE5B4" />
            <Circle cx="60" cy="45" r="28" fill="#FFE5B4" />
            <Circle cx="52" cy="40" r="6" fill="#000" />
            <Circle cx="68" cy="40" r="6" fill="#000" />
            <Path d="M 50 52 Q 60 60 70 52" stroke="#FF6B6B" strokeWidth="3" fill="none" />
            <Path d="M 35 40 Q 30 25 25 30" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Path d="M 85 40 Q 90 25 95 30" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Circle cx="45" cy="75" r="8" fill="#FFD4A3" />
            <Circle cx="75" cy="75" r="8" fill="#FFD4A3" />
          </Svg>
        );
      case 'swaddle_happy':
        return (
          <Svg width={size} height={size} viewBox="0 0 120 120">
            <Ellipse cx="60" cy="75" rx="30" ry="40" fill="#E8F5E9" />
            <Circle cx="60" cy="45" r="25" fill="#FFE5B4" />
            <Circle cx="52" cy="42" r="4" fill="#000" />
            <Circle cx="68" cy="42" r="4" fill="#000" />
            <Path d="M 50 52 Q 60 58 70 52" stroke="#FF6B6B" strokeWidth="2" fill="none" />
            <Path d="M 30 60 L 30 85 Q 30 95 40 95 L 80 95 Q 90 95 90 85 L 90 60"
                  stroke="#C8E6C9" strokeWidth="2" fill="none" />
            <Path d="M 35 40 Q 30 30 25 35" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Path d="M 85 40 Q 90 30 95 35" stroke="#FFD700" strokeWidth="3" fill="none" />
          </Svg>
        );
      case 'standing':
        return (
          <Svg width={size} height={size} viewBox="0 0 120 120">
            <Circle cx="60" cy="45" r="25" fill="#FFE5B4" />
            <Ellipse cx="60" cy="80" rx="22" ry="30" fill="#FFE5B4" />
            <Circle cx="52" cy="42" r="4" fill="#000" />
            <Circle cx="68" cy="42" r="4" fill="#000" />
            <Path d="M 50 52 Q 60 58 70 52" stroke="#FF6B6B" strokeWidth="2" fill="none" />
            <Path d="M 35 40 Q 30 30 25 35" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Path d="M 85 40 Q 90 30 95 35" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Path d="M 45 95 L 45 110" stroke="#FFD4A3" strokeWidth="4" strokeLinecap="round" />
            <Path d="M 75 95 L 75 110" stroke="#FFD4A3" strokeWidth="4" strokeLinecap="round" />
            <Path d="M 38 65 Q 30 70 28 75" stroke="#FFD4A3" strokeWidth="3" strokeLinecap="round" />
            <Path d="M 82 65 Q 90 70 92 75" stroke="#FFD4A3" strokeWidth="3" strokeLinecap="round" />
          </Svg>
        );
      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="35" fill="#FFE5B4" />
            <Circle cx="60" cy="45" r="28" fill="#FFE5B4" />
            <Circle cx="52" cy="42" r="5" fill="#000" />
            <Circle cx="68" cy="42" r="5" fill="#000" />
            <Path d="M 50 52 Q 60 58 70 52" stroke="#FF6B6B" strokeWidth="2" fill="none" />
            <Path d="M 35 40 Q 30 30 25 35" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Path d="M 85 40 Q 90 30 95 35" stroke="#FFD700" strokeWidth="3" fill="none" />
            <Circle cx="45" cy="75" r="8" fill="#FFD4A3" />
            <Circle cx="75" cy="75" r="8" fill="#FFD4A3" />
          </Svg>
        );
    }
  };

  return <View style={styles.container}>{renderLio()}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
