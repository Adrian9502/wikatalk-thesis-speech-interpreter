import { Stack } from "expo-router";

export default function QuizLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Levels" />
      <Stack.Screen name="Questions" />
      <Stack.Screen name="MultipleChoice" />
      <Stack.Screen name="Identification" />
      <Stack.Screen name="FillInTheBlank" />
    </Stack>
  );
}
