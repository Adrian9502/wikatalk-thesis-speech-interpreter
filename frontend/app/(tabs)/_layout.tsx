import { View, Animated } from "react-native";
import React, { useRef, useEffect } from "react";
import { Tabs } from "expo-router";
import {
  Mic,
  Camera,
  Clock,
  Settings,
  Globe,
  Volume2,
} from "react-native-feather";
import useThemeStore from "@/store/useThemeStore";

interface TabIconProps {
  Icon: any;
  color: string;
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ Icon, color, name, focused }) => {
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  // Update opacity when focused state changes
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: focused ? 1 : 0.6,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 70,
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          transform: [{ scale }],
          opacity,
        }}
      >
        <Icon
          stroke={color}
          width={focused ? 22 : 21}
          height={focused ? 22 : 21}
          strokeWidth={1.5}
        />

        <Animated.Text
          style={{
            fontSize: 12,
            textAlign: "center",
            color: color,
            fontFamily: focused ? "Poppins-Medium" : "Poppins-Regular",
            marginTop: 5,
            opacity,
          }}
          numberOfLines={1}
        >
          {name}
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

export default function TabsLayout() {
  // Get the active theme from the store
  const { activeTheme } = useThemeStore();
  // Modern active color with better contrast against dark navy
  const activeColor = activeTheme.tabActiveColor;
  const inactiveColor = activeTheme.tabInactiveColor;

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: activeTheme.tabBarColor,
          height: 68,
          paddingTop: 10,
          borderTopWidth: 0,
        },
        tabBarBackground: () => (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: activeTheme.tabBarColor,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="Speech"
        options={{
          title: "Speech",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Mic} color={color} name="Speech" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Translate"
        options={{
          title: "Translate",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              Icon={Globe}
              color={color}
              name="Translate"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Scan"
        options={{
          title: "Scan",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              Icon={Camera}
              color={color}
              name="Scan"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Pronounce"
        options={{
          title: "Pronounce",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              Icon={Volume2}
              color={color}
              name="Pronounce"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Recent"
        options={{
          title: "Recent",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              Icon={Clock}
              color={color}
              name="Recent"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              Icon={Settings}
              color={color}
              name="Settings"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
