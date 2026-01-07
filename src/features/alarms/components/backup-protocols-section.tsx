import React from 'react';

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { ProtocolToggle } from './protocol-toggle';

import { Text } from '@/components/ui/text';

interface BackupProtocol {
  id: 'snooze' | 'wakeCheck' | 'barcodeScan';
  enabled: boolean;
}

interface BackupProtocolsSectionProps {
  protocols: BackupProtocol[];
  onProtocolToggle: (id: BackupProtocol['id']) => void;
}

export function BackupProtocolsSection({
  protocols,
  onProtocolToggle,
}: BackupProtocolsSectionProps) {
  const { t } = useTranslation();

  const getProtocolConfig = (id: BackupProtocol['id']) => {
    const configs = {
      snooze: {
        icon: 'snooze',
        iconColor: '#ef4444',
        iconBgColor: 'bg-red-500/10',
      },
      wakeCheck: {
        icon: 'check-circle',
        iconColor: '#22c55e',
        iconBgColor: 'bg-green-500/10',
      },
      barcodeScan: {
        icon: 'qr-code-scanner',
        iconColor: '#a855f7',
        iconBgColor: 'bg-purple-500/10',
      },
    };
    return configs[id];
  };

  return (
    <View>
      {/* Section header */}
      <Text className="px-4 pb-4 pt-2 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
        {t('newAlarm.backupProtocols.title')}
      </Text>

      {/* Protocol toggles */}
      <View className="flex flex-col gap-3 px-4">
        {protocols.map((protocol) => {
          const config = getProtocolConfig(protocol.id);
          const isBarcodeScan = protocol.id === 'barcodeScan';

          return (
            <ProtocolToggle
              key={protocol.id}
              icon={config.icon}
              iconColor={config.iconColor}
              iconBgColor={config.iconBgColor}
              title={t(`newAlarm.backupProtocols.${protocol.id}.title`)}
              description={t(`newAlarm.backupProtocols.${protocol.id}.description`)}
              isEnabled={protocol.enabled}
              onToggle={() => onProtocolToggle(protocol.id)}
              disabled={isBarcodeScan}
            />
          );
        })}
      </View>
    </View>
  );
}
