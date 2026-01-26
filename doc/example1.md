- Criar módulo nativo pra:
  - Pedir AutoStart
  - Pedir Overlay
  - Lançar FullScreenIntent

- Usar Notifee normalmente

Esse é o caminho mais usado por apps de alarme reais.

---

### 🅑 Expo + Local Native Module (Dev Client)

Você cria um módulo:

```bash
npx expo run:android
```

E adiciona:

```ts
NativeModules.AlarmModule.openOverlayPermission();
NativeModules.AlarmModule.openAutoStartSettings();
NativeModules.AlarmModule.startAlarmActivity();
```

Por baixo isso é Kotlin puro.

---

## 🔥 Resposta direta

> Como o Alarmy consegue abrir a tela sozinho mesmo com o app fechado?

Porque ele:

1. Usa `AlarmManager` (não só Notification)
2. Registra `BroadcastReceiver`
3. Lança `Activity` com `showWhenLocked`
4. Tem permissões de:
   - AutoStart
   - Overlay

5. Roda como app de sistema “quase privilegiado”
