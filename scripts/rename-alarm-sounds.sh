#!/bin/bash
# Script para renomear os arquivos baixados do Mixkit para os nomes esperados
# Execute após baixar os arquivos na pasta ~/Downloads

SOUNDS_DIR="/Users/wallysongalvao/Documents/workspace/wakemind/assets/sounds"
DOWNLOADS_DIR="$HOME/Downloads"

echo "🎵 Movendo e renomeando arquivos de alarme do Mixkit..."

# Mapeamento: nome do Mixkit -> nome esperado
declare -A FILES=(
  ["mixkit-classic-alarm-995.wav"]="classic-alarm.wav"
  ["mixkit-digital-clock-digital-alarm-buzzer-992.wav"]="digital-clock-buzzer.wav"
  ["mixkit-morning-clock-alarm-1003.wav"]="morning-clock-alarm.wav"
  ["mixkit-alert-alarm-1005.wav"]="alert-alarm.wav"
  ["mixkit-security-facility-breach-alarm-994.wav"]="facility-alarm.wav"
  ["mixkit-retro-game-emergency-alarm-1000.wav"]="retro-game-alarm.wav"
  ["mixkit-vintage-warning-alarm-990.wav"]="vintage-warning-alarm.wav"
  ["mixkit-spaceship-alarm-998.wav"]="spaceship-alarm.wav"
  ["mixkit-critical-alarm-1004.wav"]="critical-alarm.wav"
  ["mixkit-scanning-sci-fi-alarm-999.wav"]="scanning-sci-fi-alarm.wav"
)

moved=0
not_found=0

for mixkit_name in "${!FILES[@]}"; do
  target_name="${FILES[$mixkit_name]}"
  source_path="$DOWNLOADS_DIR/$mixkit_name"
  target_path="$SOUNDS_DIR/$target_name"
  
  if [ -f "$source_path" ]; then
    mv "$source_path" "$target_path"
    echo "✅ $mixkit_name → $target_name"
    ((moved++))
  else
    echo "⚠️  Não encontrado: $mixkit_name"
    ((not_found++))
  fi
done

echo ""
echo "📊 Resultado: $moved movidos, $not_found não encontrados"
echo ""
echo "📁 Arquivos em $SOUNDS_DIR:"
ls -la "$SOUNDS_DIR"
