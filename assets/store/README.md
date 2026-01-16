# WakeMind - Store Screenshots

Este diretório contém os elementos gráficos para as lojas de aplicativos.

## Estrutura

```
store/
└── playstore/
    ├── feature_graphic.png      # 1024×500 - Banner principal
    ├── phone_01_alarms.png      # Lista de alarmes
    ├── phone_02_math_challenge.png
    ├── phone_03_memory_challenge.png
    ├── phone_04_settings.png
    ├── tablet_7_01_dashboard.png
    ├── tablet_7_02_challenge.png
    ├── tablet_10_01_dashboard.png
    └── tablet_10_02_challenge.png
```

## Requisitos Google Play Console

### Recurso Gráfico (Feature Graphic)

- **Dimensões**: 1024×500 pixels
- **Formato**: PNG ou JPEG
- **Tamanho máximo**: 15 MB

### Capturas de Tela - Telefone

- **Quantidade**: 2 a 8 screenshots
- **Proporção**: 16:9 ou 9:16
- **Dimensões**: Entre 320 e 3.840 px por lado
- **Recomendado para promoção**: Mínimo 1080px de cada lado
- **Formato**: PNG ou JPEG
- **Tamanho máximo**: 8 MB cada

### Capturas de Tela - Tablet 7"

- **Quantidade**: Até 8 screenshots
- **Proporção**: 16:9 ou 9:16
- **Dimensões**: Entre 320 e 3.840 px por lado

### Capturas de Tela - Tablet 10"

- **Quantidade**: Até 8 screenshots
- **Proporção**: 16:9 ou 9:16
- **Dimensões**: Entre 1080 e 7.680 px por lado

## Gerando Screenshots Automaticamente

### Usando Maestro (Recomendado)

```bash
# Rodar o flow de screenshots
./scripts/generate-store-screenshots.sh

# Ou manualmente:
maestro test .maestro/flows/playstore-screenshots.yaml
```

### Configurando Emuladores para Diferentes Tamanhos

1. **Telefone (1080×1920)**

   ```bash
   # Pixel 4 ou similar
   emulator -avd Pixel_4_API_34
   ```

2. **Tablet 7" (1200×1920)**

   ```bash
   # Nexus 7 2013
   emulator -avd Nexus_7_2013_API_34
   ```

3. **Tablet 10" (1920×2560)**
   ```bash
   # Pixel Tablet
   emulator -avd Pixel_Tablet_API_34
   ```

## Upload para Google Play Console

1. Acesse [Google Play Console](https://play.google.com/console/)
2. Navegue até **Detalhes do app** → **Elementos gráficos**
3. Faça upload das imagens correspondentes
4. Salve as alterações

## Ferramentas Externas Recomendadas

- **[AppLaunchpad](https://theapplaunchpad.com/)** - Mockups com device frames
- **[Appure](https://appure.io/)** - Gerador de screenshots com texto
- **[Shotbot](https://shotbot.io/)** - Screenshots automatizados
