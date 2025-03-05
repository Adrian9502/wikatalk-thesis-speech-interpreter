import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { House, Mic, Scan, History, Settings } from "lucide-react-native";

interface TabIconProps {
  Icon: any;
  color: string;
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ Icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-1 w-20">
      <Icon color={color} size={26} />
      <Text
        className={`text-xs text-center ${
          focused ? "font-psemibold" : "font-pregular"
        }`}
        style={{ color: color }}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#FACC15",
        tabBarInactiveTintColor: "#F0F0F0",
        tabBarStyle: {
          backgroundColor: "#0038A8",
          paddingBottom: 0,
          borderTopWidth: 2,
          borderTopColor: "#CE1126",
          paddingTop: 10,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={House} color={color} name="Home" focused={focused} />
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
              Icon={Mic}
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
            <TabIcon Icon={Scan} color={color} name="Scan" focused={focused} />
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
              Icon={History}
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
