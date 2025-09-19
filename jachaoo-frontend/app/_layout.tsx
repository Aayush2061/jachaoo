import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error(
      "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your environment"
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

// // app/_layout.tsx
// import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
// import { tokenCache } from "@clerk/clerk-expo/token-cache";
// import { Slot } from "expo-router";
// import { useState } from "react";
// import { View } from "react-native";
// import CustomSplashScreen from "../app/components/CustomSplashScreen";

// export default function RootLayout() {
//   const [isSplashVisible, setIsSplashVisible] = useState(true);
//   const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

//   if (!publishableKey) {
//     throw new Error(
//       "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your environment"
//     );
//   }

//   if (isSplashVisible) {
//     return (
//       <CustomSplashScreen
//         onAnimationComplete={() => setIsSplashVisible(false)}
//       />
//     );
//   }

//   return (
//     <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
//       <ClerkLoaded>
//         <View style={{ flex: 1 }}>
//           <Slot />
//         </View>
//       </ClerkLoaded>
//     </ClerkProvider>
//   );
// }
