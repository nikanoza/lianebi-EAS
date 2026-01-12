import React from 'react';
import Svg, { Path, Circle, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function RootingIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="babyGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFD166" />
          <Stop offset="100%" stopColor="#EF8354" />
        </LinearGradient>
      </Defs>
      <Circle cx="60" cy="60" r="45" fill="url(#babyGradient1)" />
      <Path d="M 40 52 Q 45 48 50 52" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Path d="M 70 52 Q 75 48 80 52" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Circle cx="60" cy="75" r="8" fill="#8B5CF6" />
    </Svg>
  );
}

export function FistSuckingIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="babyGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFD166" />
          <Stop offset="100%" stopColor="#EF8354" />
        </LinearGradient>
      </Defs>
      <Circle cx="60" cy="60" r="45" fill="url(#babyGradient2)" />
      <Path d="M 40 55 Q 45 51 50 55" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Path d="M 70 55 Q 75 51 80 55" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Circle cx="60" cy="72" r="6" fill="#8B5CF6" />
    </Svg>
  );
}

export function SleepyIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="babyGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFD166" />
          <Stop offset="100%" stopColor="#EF8354" />
        </LinearGradient>
      </Defs>
      <Circle cx="60" cy="60" r="45" fill="url(#babyGradient3)" />
      <Path d="M 38 52 Q 48 52 58 52" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Path d="M 62 52 Q 72 52 82 52" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Circle cx="60" cy="72" r="6" fill="#8B5CF6" />
      <Path d="M 75 30 L 70 35 L 80 38 Z" fill="#06B6D4" />
      <Path d="M 85 22 L 82 26 L 88 28 Z" fill="#06B6D4" />
      <Path d="M 92 32 L 89 36 L 95 38 Z" fill="#06B6D4" />
    </Svg>
  );
}

export function LipSmackingIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="babyGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFD166" />
          <Stop offset="100%" stopColor="#EF8354" />
        </LinearGradient>
      </Defs>
      <Circle cx="60" cy="60" r="45" fill="url(#babyGradient4)" />
      <Path d="M 40 52 Q 45 48 50 52" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Path d="M 70 52 Q 75 48 80 52" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Ellipse cx="60" cy="73" rx="10" ry="12" fill="#8B5CF6" />
    </Svg>
  );
}

export function CryingIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="babyGradient5" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFD166" />
          <Stop offset="100%" stopColor="#EF8354" />
        </LinearGradient>
      </Defs>
      <Circle cx="60" cy="60" r="45" fill="url(#babyGradient5)" />
      <Path d="M 40 48 Q 45 44 50 48" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Path d="M 70 48 Q 75 44 80 48" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Circle cx="60" cy="75" r="12" fill="#8B5CF6" />
      <Path d="M 35 55 Q 33 65 30 75" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M 85 55 Q 87 65 90 75" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function TurningAwayIcon({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="babyGradient6" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFD166" />
          <Stop offset="100%" stopColor="#EF8354" />
        </LinearGradient>
      </Defs>
      <Circle cx="60" cy="60" r="45" fill="url(#babyGradient6)" />
      <Path d="M 68 52 Q 73 48 78 52" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Circle cx="50" cy="52" r="3" fill="#5D4037" />
      <Circle cx="75" cy="70" r="6" fill="#8B5CF6" />
    </Svg>
  );
}

export const hungerCueIcons = {
  rooting: RootingIcon,
  fist: FistSuckingIcon,
  sleepy: SleepyIcon,
  lipSmacking: LipSmackingIcon,
  crying: CryingIcon,
  turningAway: TurningAwayIcon,
};
