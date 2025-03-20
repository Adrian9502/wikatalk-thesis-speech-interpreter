import { View, Text, Animated, TouchableOpacity } from "react-native";
import React, { useRef, useEffect } from "react";
import { Tabs } from "expo-router";
import {
  MessageCircle,
  Mic,
  Camera,
  Clock,
  Settings,
  Globe,
} from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";

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
    <View style={{ alignItems: "center", justifyContent: "center", width: 70 }}>
      <Animated.View
        style={{
          alignItems: "center",
          transform: [{ scale }],
          opacity,
        }}
      >
        <Icon
          stroke={color}
          width={focused ? 23 : 22}
          height={focused ? 23 : 22}
          strokeWidth={focused ? 2 : 1.5}
        />

        <Animated.Text
          style={{
            fontSize: 12,
            textAlign: "center",
            color: color,
            fontFamily: focused ? "Poppins-Bold" : "Poppins-Regular",
            marginTop: 6,
            opacity,
          }}
          numberOfLines={1}
        >
          {name}
        </Animated.Text>

        {focused && (
          <Animated.View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: color,
              marginTop: 3,
            }}
          />
        )}
      </Animated.View>
    </View>
  );
};

export default function TabsLayout() {
  // Modern active color with better contrast against dark navy
  const activeColor = "#5CB3FF";
  const inactiveColor = "#f5f5f5";

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: "#0a0f28",
          height: 68,
          paddingBottom: 8,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={["rgba(10, 15, 40, 0.9)", "#0a0f28"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
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
