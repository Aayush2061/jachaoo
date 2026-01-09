import { Stack } from "expo-router";

export default function PeriodOnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="symptoms" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="conditions" />
      <Stack.Screen name="contraceptive" />
      <Stack.Screen name="concern" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
