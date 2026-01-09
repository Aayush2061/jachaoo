import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="name" />
      <Stack.Screen name="age" />
      <Stack.Screen name="sex" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="blood-pressure" />
      <Stack.Screen name="diabetes" />
      <Stack.Screen name="smoker" />
      <Stack.Screen name="illness" />
    </Stack>
  );
}
