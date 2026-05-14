import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, interpolate } from 'react-native-reanimated';

export function PulseWaveform({ isActive = true }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [isActive]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [1, 1.3], [0.6, 0])
  }));

  return (
    <View className="items-center justify-center py-8">
      <Animated.View className="absolute w-24 h-24 rounded-full bg-primaryPurple" style={style} />
      <View className="w-20 h-20 rounded-full bg-primaryPurple items-center justify-center z-10" style={{ shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10 }}>
      </View>
    </View>
  );
}
