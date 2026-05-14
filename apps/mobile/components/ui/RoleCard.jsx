import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function RoleCard({ title, description, icon: Icon, isSelected, onPress }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(isSelected ? '#8B5CF6' : '#E5E7EB', { duration: 200 }),
      backgroundColor: withTiming(isSelected ? '#EDE9FE' : '#FFFFFF', { duration: 200 }),
      transform: [{ scale: withTiming(isSelected ? 0.98 : 1, { duration: 150 }) }]
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} className="mb-3">
      <Animated.View className="flex-row items-center p-5 rounded-card border dark:bg-surface-dark dark:border-gray-800 shadow-card" style={animatedStyle}>
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isSelected ? 'bg-primaryPurple' : 'bg-lightGray dark:bg-gray-800'}`}>
          <Icon color={isSelected ? '#FFFFFF' : '#6B7280'} size={24} />
        </View>
        <View className="flex-1">
          <Text className={`font-inter text-lg font-medium ${isSelected ? 'text-primaryPurple' : 'text-darkText dark:text-white'}`}>
            {title}
          </Text>
          <Text className="font-inter text-secondaryText text-sm mt-0.5">
            {description}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}
