import React from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { ProtocolToggle } from './protocol-toggle';

import { MaterialSymbol } from '@/components/material-symbol';
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
  const router = useRouter();

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

  const handleInfoPress = () => {
    router.push('/alarm/backup-protocols-info');
  };

  return (
    <View>
      {/* Section header */}
      <View className="flex-row items-center gap-2 px-4 pb-4 pt-2">
        <Text className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          {t('newAlarm.backupProtocols.title')}
        </Text>
        <Pressable
          onPress={handleInfoPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.info')}
          accessibilityHint={t('common.infoModal.accessibilityHint')}
        >
          <MaterialSymbol name="info" size={20} className="text-slate-400 dark:text-slate-500" />
        </Pressable>
      </View>

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
