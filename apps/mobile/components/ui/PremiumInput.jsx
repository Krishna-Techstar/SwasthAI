import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

export function PremiumInput({ label, error, secureTextEntry, ...props }) {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(
        error ? '#EF4444' : isFocused ? '#8B5CF6' : '#E5E7EB',
        { duration: 200 }
      ),
      backgroundColor: withTiming(
        isFocused ? '#FFFFFF' : '#F9FAFB',
        { duration: 200 }
      )
    };
  });

  return (
    <View className="mb-4">
      {label && <Text className="text-secondaryText dark:text-gray-400 font-inter text-sm mb-2">{label}</Text>}
      <Animated.View 
        className="border rounded-input px-4 h-14 justify-center dark:bg-surface-dark dark:border-gray-800"
        style={containerStyle}
      >
        <TextInput
          className="flex-1 font-inter text-base text-darkText"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          {...props}
        />
      </Animated.View>
      {error && (
        <Text className="text-danger font-inter text-xs mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
