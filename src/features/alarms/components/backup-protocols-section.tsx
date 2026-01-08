import React from 'react';

import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { ProtocolToggle } from './protocol-toggle';

import { Text } from '@/components/ui/text';
import { BackupProtocolId } from '@/types/alarm-enums';

export interface BackupProtocol {
  id: BackupProtocolId;
  enabled: boolean;
}

interface BackupProtocolsSectionProps {
  protocols: BackupProtocol[];
  onProtocolToggle: (id: BackupProtocolId) => void;
}

export function BackupProtocolsSection({
  protocols,
  onProtocolToggle,
}: BackupProtocolsSectionProps) {
  const { t } = useTranslation();

  const getProtocolConfig = (id: BackupProtocolId) => {
    const configs: Record<
      BackupProtocolId,
      { icon: string; iconClassName: string; iconBgColor: string }
    > = {
      [BackupProtocolId.SNOOZE]: {
        icon: 'snooze',
        iconClassName: 'text-red-500',
        iconBgColor: 'bg-red-500/10',
      },
      [BackupProtocolId.WAKE_CHECK]: {
        icon: 'check_circle',
        iconClassName: 'text-green-500',
        iconBgColor: 'bg-green-500/10',
      },
      [BackupProtocolId.BARCODE_SCAN]: {
        icon: 'qr_code_scanner',
        iconClassName: 'text-purple-500',
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
          const isBarcodeScan = protocol.id === BackupProtocolId.BARCODE_SCAN;

          return (
            <ProtocolToggle
              key={protocol.id}
              icon={config.icon}
              iconClassName={config.iconClassName}
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
