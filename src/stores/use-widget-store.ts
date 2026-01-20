import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { WIDGET_CONFIGS, type WidgetType } from '@/types/widgets';
import { createMMKVStorage } from '@/utils/storage';

interface WidgetState {
  enabledWidgets: Set<WidgetType>;
  toggleWidget: (widgetId: WidgetType) => void;
  isWidgetEnabled: (widgetId: WidgetType) => boolean;
  resetToDefaults: () => void;
}

const getDefaultEnabledWidgets = (): WidgetType[] => {
  return WIDGET_CONFIGS.filter((config) => config.defaultEnabled).map((config) => config.id);
};

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      enabledWidgets: new Set(getDefaultEnabledWidgets()),
      toggleWidget: (widgetId) =>
        set((state) => {
          const newEnabledWidgets = new Set(state.enabledWidgets);
          if (newEnabledWidgets.has(widgetId)) {
            newEnabledWidgets.delete(widgetId);
          } else {
            newEnabledWidgets.add(widgetId);
          }
          return { enabledWidgets: newEnabledWidgets };
        }),
      isWidgetEnabled: (widgetId) => get().enabledWidgets.has(widgetId),
      resetToDefaults: () => set({ enabledWidgets: new Set(getDefaultEnabledWidgets()) }),
    }),
    {
      name: 'widget-storage',
      storage: createJSONStorage(() => createMMKVStorage('widget-storage')),
      partialize: (state) => ({
        enabledWidgets: Array.from(state.enabledWidgets),
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { enabledWidgets?: WidgetType[] };
        return {
          ...currentState,
          enabledWidgets: new Set(persisted?.enabledWidgets ?? getDefaultEnabledWidgets()),
        };
      },
    }
  )
);
