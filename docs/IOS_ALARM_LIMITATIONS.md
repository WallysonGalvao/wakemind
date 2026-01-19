# Configuração de Alarmes no iOS

## Limitações do iOS

Diferentemente do Android, o iOS tem restrições significativas para aplicativos de alarme de terceiros:

### 1. **Tela Bloqueada**

- ❌ **Não é possível ligar a tela automaticamente** quando o dispositivo está bloqueado
- ❌ **Não é possível mostrar a interface do app por cima da tela de bloqueio**
- ✅ O iOS mostrará a notificação na tela de bloqueio
- ✅ O usuário precisa desbloquear o dispositivo OU tocar na notificação para abrir o app

### 2. **Som do Alarme**

#### Notificações Normais (Implementado)

- ✅ Áudio configurado para tocar mesmo em modo silencioso (`playsInSilentMode: true`)
- ✅ Background audio mode ativado
- ⚠️ O volume segue as configurações do usuário
- ⚠️ Se o dispositivo estiver em "Não Perturbe", o som pode não tocar

#### Critical Alerts (Requer Aprovação Apple)

- ✅ Toca mesmo em modo "Não Perturbe"
- ✅ Toca mesmo com o volume do dispositivo em zero
- ✅ Volume controlado pelo app (não pelo sistema)
- ❌ **Requer aprovação especial da Apple**
- ❌ Precisa justificar o uso (aplicativos médicos, segurança, etc.)

## Configurações Implementadas

### 1. Plugin iOS (`withAlarmIOS.js`)

- ✅ Background audio mode configurado
- ✅ Info.plist configurado corretamente
- ⏸️ Critical alerts comentado (aguardando aprovação)

### 2. Audio Mode (`_layout.tsx`)

```typescript
await setAudioModeAsync({
  playsInSilentMode: true, // Toca mesmo em modo silencioso
  shouldPlayInBackground: true, // Mantém áudio em background
});
```

### 3. Notificações (`alarm-scheduler.ts`)

```typescript
ios: {
  sound: 'alarm_sound.wav',
  critical: true,              // Só funciona com entitlement
  criticalVolume: 1.0,         // Só funciona com entitlement
  interruptionLevel: 'critical', // Só funciona com entitlement
}
```

## Como Funciona Atualmente

### Cenário 1: App em Foreground

- ✅ Tela já está ligada
- ✅ Som toca normalmente
- ✅ Interface de alarme abre automaticamente

### Cenário 2: App em Background (Tela Desbloqueada)

- ✅ Notificação aparece
- ✅ Som toca (respeitando volume do sistema)
- ✅ Ao tocar na notificação, abre a interface de alarme

### Cenário 3: Dispositivo Bloqueado

- ⚠️ Notificação aparece na tela de bloqueio
- ⚠️ Som toca (respeitando volume do sistema e modo "Não Perturbe")
- ❌ Tela NÃO liga automaticamente
- ✅ Usuário pode tocar na notificação para desbloquear e abrir o app

## Recomendações para Usuários

1. **Não use "Não Perturbe" com horário de alarme**
   - Configure exceções no iOS se necessário

2. **Mantenha volume adequado**
   - O iOS respeita o volume do sistema

3. **Toque na notificação ao acordar**
   - A interface de alarme só abre após tocar na notificação

4. **Considere usar o app nativo do iOS Clock**
   - Para alarmes críticos que precisam despertar
   - Use o WakeMind como complemento com desafios

## Para Habilitar Critical Alerts (Futuro)

Se você conseguir aprovação da Apple:

1. Descomente no `plugins/withAlarmIOS.js`:

```javascript
config = withEntitlementsPlist(config, (config) => {
  config.modResults['com.apple.developer.usernotifications.critical-alerts'] = true;
  return config;
});
```

2. Solicite a aprovação no App Store Connect
3. Rebuild o app após aprovação

## Alternativas

### Usar Live Activities (iOS 16.1+)

- Mostra informações do alarme na tela de bloqueio
- Mais visível que notificações normais
- Não liga a tela automaticamente

### Usar Dynamic Island (iPhone 14 Pro+)

- Mostra o alarme de forma proeminente
- Ainda requer usuário desbloquear

## Comparação: Android vs iOS

| Funcionalidade                 | Android            | iOS                      |
| ------------------------------ | ------------------ | ------------------------ |
| Ligar tela automaticamente     | ✅                 | ❌                       |
| Mostrar sobre tela de bloqueio | ✅                 | ❌                       |
| Som em modo silencioso         | ✅                 | ✅                       |
| Som em "Não Perturbe"          | ✅ (com permissão) | ❌ (sem critical alerts) |
| Controle de volume             | ✅                 | ❌ (sem critical alerts) |
| Notificação full screen        | ✅                 | ❌                       |

## Conclusão

O iOS tem limitações de segurança e privacidade que impedem apps de terceiros de terem o mesmo comportamento de alarmes nativos. A melhor experiência será:

1. ✅ **Para alarmes normais**: Use o app para desafios após acordar
2. ⚠️ **Para alarmes críticos**: Use o Clock nativo do iOS ou solicite critical alerts approval
3. 🔮 **Futuro**: Implementar Live Activities para melhor visibilidade
