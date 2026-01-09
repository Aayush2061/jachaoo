import { Stack } from "expo-router";

export default function PeriodLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Mental Health",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          title: "Mental Health Setup",
          headerBackTitle: "Back",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="track"
        options={{
          title: "Mood Tracker Page",
          headerBackTitle: "Back",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
