import React from 'react';
import { View, StyleSheet } from 'react-native';

export function GlassCard({ children, className = '', style, ...props }) {
  return (
    <View 
      className={`bg-white/90 dark:bg-surface-dark/90 rounded-card p-6 border border-white/40 dark:border-white/10 ${className}`}
      style={[styles.shadow, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 5,
  }
});
