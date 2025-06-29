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
          title: "Period Tracker",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          title: "Period Tracker Setup",
          headerBackTitle: "Back",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="dashboard/index"
        options={{ title: "Dashboard" }} // Add this
      />
      <Stack.Screen
        name="symptoms"
        options={{ title: "Track Symptoms" }} // Add this for your symptoms screen
      />
      <Stack.Screen
        name="daily-result"
        options={{ title: "Daily Test Result" }} // Add this for your symptoms screen
      />
    </Stack>
  );
}
