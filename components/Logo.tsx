import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

type Props = {
  size?: number;
  style?: any;
};

export default function Logo({ size = 120, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Svg
        width={size}
        height={size * 0.99}
        viewBox="0 0 200 198"
      >
        <G>
          <Path
            d="m84.48 67.99c0 0 45.79 9.96 22.01 40.57"
            fill="none"
            stroke="#44ce1b"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Path
            d="m92.24 57.45c0 0 51.06 22.04 16.91 64.23"
            fill="none"
            stroke="#d6a266"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Path
            d="m73.38 93.86c0 0 1.47 23.57 26.9 29.3"
            fill="none"
            stroke="#44ce1b"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Path
            d="m74.94 84.55c2.2 0.61 42.75 6.06 16.33 51.08"
            fill="none"
            stroke="#44ce1b"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Path
            d="m100.84 135.64c3.13-14.89 18.12-52.08-20.87-61.36"
            fill="none"
            stroke="#d6a56a"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Path
            d="m122.12 74.54c-0.04 0 20.78 31.53-14.82 56.58"
            fill="none"
            stroke="#44ce1b"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
