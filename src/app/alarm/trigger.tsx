// import { useEffect, useState } from 'react';

// import { Stack } from 'expo-router';

// import { AlarmTriggerScreen } from '@/features/alarms/screens/alarm-trigger-screen';

// export default function AlarmTriggerPage() {
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//     // Ensure navigation context is ready before rendering
//     setIsReady(true);
//   }, []);

//   if (!isReady) {
//     return null;
//   }

//   return (
//     <>
//       <Stack.Screen
//         options={{
//           headerShown: false,
//           presentation: 'fullScreenModal',
//           animation: 'fade',
//           gestureEnabled: false,
//         }}
//       />
//       <AlarmTriggerScreen />
//     </>
//   );
// }

import AlarmTriggerScreen from '@/features/alarms/screens/alarm-trigger-screen';

export default AlarmTriggerScreen;
