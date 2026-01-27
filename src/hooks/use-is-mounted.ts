/**
 * @file Is Mounted Hook
 * @description Hook to check if a component is still mounted
 * @module hooks
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook that tracks whether a component is currently mounted
 * Useful for preventing state updates and side effects on unmounted components
 *
 * @returns Function that returns true if component is mounted, false otherwise
 *
 * @example
 * const isMounted = useIsMounted();
 *
 * const fetchData = async () => {
 *   const data = await api.getData();
 *   // Only update state if component is still mounted
 *   if (isMounted()) {
 *     setData(data);
 *   }
 * };
 *
 * const handleDelete = async () => {
 *   await deleteAlarm(id);
 *   if (isMounted()) {
 *     router.back(); // Safe navigation
 *   }
 * };
 */
export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Component is mounted
    isMountedRef.current = true;

    // Cleanup: component is unmounting
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Return stable callback that checks current mounted state
  const isMounted = useCallback(() => isMountedRef.current, []);

  return isMounted;
};
