# Teste Simples da AlarmActivity Nativa

## 🎯 O que foi implementado

Uma implementação **muito simples** para testar a AlarmActivity nativa:

1. ✅ Módulo Expo local (`expo-alarm-activity`)
2. ✅ AlarmActivity.kt que acorda a tela
3. ✅ Botão de teste na tela home (roxo com ícone Android)
4. ✅ Integração com deep linking React Native

---

## 📁 Arquivos Criados

```
modules/expo-alarm-activity/
├── android/src/main/
│   ├── AndroidManifest.xml              # AlarmActivity registrada
│   └── java/expo/modules/alarmactivity/
│       ├── ExpoAlarmActivityModule.kt   # Função testOpenActivity()
│       └── AlarmActivity.kt             # Activity transparente
└── index.ts                             # Export para React Native
```

---

## 🧪 Como Testar

### Passo 1: Rebuild do App

```bash
cd /Users/wallysongalvao/Documents/workspace/wakemind
npx expo run:android
```

### Passo 2: Abrir o App

Quando o app abrir, você verá **2 botões flutuantes** no canto inferior esquerdo:

- 🟠 **Laranja** (ícone sino) = Testa tela React Native
- 🟣 **Roxo** (ícone Android) = **Testa AlarmActivity NATIVA**

### Passo 3: Testar

1. **Tocar no botão roxo** (ícone Android)
2. Observar logs no Logcat
3. Ver se a AlarmActivity abre
4. Ver se redireciona para a tela de alarme React Native

---

## 📊 Logs Esperados

No Logcat (`adb logcat *:E | grep AlarmActivity`), você deve ver:

```
AlarmActivity: ========================================
AlarmActivity: AlarmActivity ABERTA!
AlarmActivity: ========================================
AlarmActivity: Dados: alarmId=test-123, time=07:00, period=AM
AlarmActivity: Deep Link: wakemind://alarm/trigger?alarmId=test-123&...
AlarmActivity: Abrindo MainActivity...
AlarmActivity: Finalizando AlarmActivity
AlarmActivity: ========================================
```

---

## ✅ Sucesso se...

- ✅ Tocar botão roxo → AlarmActivity abre
- ✅ Logs aparecem no Logcat
- ✅ App navega para tela `/alarm/trigger`
- ✅ Dados do alarme aparecem na tela

---

## ❌ Problemas Comuns

### 1. Botão roxo não aparece

**Solução:** Certifique-se que está em modo desenvolvimento (`__DEV__`)

### 2. Erro: "ExpoAlarmActivityModule is null"

**Solução:**

```bash
npx expo prebuild --clean
npx expo run:android
```

### 3. AlarmActivity não abre

**Solução:** Verifique logs do Logcat:

```bash
adb logcat | grep -i "AlarmActivity\|ExpoAlarmActivity"
```

---

## 🔧 Código da Função de Teste

A função `testOpenActivity()` faz isso:

```kotlin
// ExpoAlarmActivityModule.kt
Function("testOpenActivity") {
  val context = appContext.reactContext ?: return@Function

  val intent = Intent(context, AlarmActivity::class.java).apply {
    flags = Intent.FLAG_ACTIVITY_NEW_TASK
    putExtra("alarmId", "test-123")
    putExtra("time", "07:00")
    putExtra("period", "AM")
    putExtra("challenge", "Test Challenge")
  }

  context.startActivity(intent)
}
```

---

## 🎨 Botão de Teste na UI

Localização: `src/features/alarms/screens/index.tsx`

```tsx
// Botão roxo - AlarmActivity nativa
<Pressable
  onPress={handleTestNativeActivity}
  className="absolute bottom-24 left-6 h-14 w-14 items-center justify-center rounded-full bg-purple-600"
>
  <MaterialSymbol name="android" size={24} className="text-white" />
</Pressable>
```

---

## 📝 Próximos Passos

Se este teste funcionar:

1. ✅ **Confirma** que módulo Expo funciona
2. ✅ **Confirma** que AlarmActivity pode ser aberta
3. ✅ **Confirma** que deep linking funciona

Depois podemos:

- Integrar com Notifee `fullScreenAction`
- Adicionar AlarmManager para agendamento real
- Testar com tela bloqueada

---

## 🐛 Debug

```bash
# Ver todos os logs
adb logcat | grep -i "expo\|alarm"

# Ver apenas erros
adb logcat *:E

# Limpar logs e começar fresh
adb logcat -c && adb logcat | grep AlarmActivity
```

---

**Status:** ✅ Pronto para testar  
**Última atualização:** 24 de Janeiro de 2026
