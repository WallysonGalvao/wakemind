User: Meu app está com 178mb quando instalado ? Tá muito pesado

GitHub Copilot: Vou analisar o que está deixando seu app tão pesado. Vamos verificar os principais fatores que contribuem para o tamanho.

Ran terminal command: du -sh assets/sounds assets/images 2>/dev/null

Read [](file:///Users/wallysongalvao/Documents/workspace/wakemind/package.json#1-1), lines 1 to 100

Ran terminal command: ls -lh build-1769558776172.aab 2>/dev/null

Ran terminal command: cd /Users/wallysongalvao/Documents/workspace/wakemind/assets/sounds && ls -lh

Ran terminal command: cd /Users/wallysongalvao/Documents/workspace/wakemind && npx expo-atlas --stats-file

Identifiquei os principais problemas que estão deixando seu app pesado:

## Principais Culpados (149MB AAB → 178MB instalado):

### 1. **Sons de Alarme: 23MB** 🔊

- 15 arquivos WAV descomprimidos
- Maior arquivo: `retro-game-alarm.wav` (4.3MB)
- `facility-alarm.wav` (3.0MB)
- Vários com 1.5-2.3MB cada

### 2. **Imagens: 11MB**

### 3. **Dependências pesadas**

- Muitas bibliotecas nativas (@shopify/react-native-skia, Sentry, etc.)

## Soluções Rápidas:

### 1. **Converter WAV → MP3** (economiza ~18-20MB)

```bash
# Instalar ffmpeg se não tiver
brew install ffmpeg

# Converter todos os WAVs para MP3
for f in assets/sounds/*.wav; do
  ffmpeg -i "$f" -codec:a libmp3lame -b:a 128k "${f%.wav}.mp3"
done
```

### 2. **Otimizar imagens**

```bash
# Comprimir PNGs
npx @expo/image-utils optimize assets/images
```

### 3. **Remover dependências não usadas**

Verificar se todas essas libs são necessárias:

- `react-native-chart-kit`
- `react-native-volume-manager`
- Múltiplas libs de ícones

### 4. **Habilitar ProGuard/R8** (Android)

Em build.gradle:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

### 5. **Usar App Bundle otimizado**

```bash
# Gerar com splits de ABI
eas build --profile production --platform android
```

**Economia estimada: 20-30MB** (chegaria a ~148MB ou menos)

Quer que eu implemente alguma dessas otimizações?
