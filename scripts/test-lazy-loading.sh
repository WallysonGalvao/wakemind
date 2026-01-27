#!/bin/bash

# Script para testar a implementação de lazy loading
# Este script ajuda a verificar se o lazy loading está funcionando corretamente

echo "🚀 Testando implementação de Lazy Loading no WakeMind"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Verificando arquivos modificados...${NC}"
echo ""

# Lista de arquivos que devem ter lazy loading
files=(
  "src/app/subscription/paywall.tsx"
  "src/app/achievements/index.tsx"
  "src/app/achievements/history.tsx"
  "src/app/alarm/performance-summary.tsx"
  "src/app/alarm/trigger.tsx"
  "src/app/dashboard/modals/execution-score-info.tsx"
  "src/app/dashboard/modals/cognitive-activation-info.tsx"
  "src/app/dashboard/modals/wake-consistency-info.tsx"
  "src/app/settings/privacy-policy.tsx"
  "src/app/settings/support.tsx"
  "src/app/settings/alarm-tone.tsx"
  "src/app/settings/language.tsx"
  "src/app/settings/vibration-pattern.tsx"
  "src/app/settings/database-manager.tsx"
  "src/app/dashboard/widgets.tsx"
  "src/app/alarm/backup-protocols-info.tsx"
  "src/components/lazy-loading-fallback.tsx"
)

count=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    if grep -q "lazy\|Suspense" "$file"; then
      echo -e "${GREEN}✓${NC} $file"
      ((count++))
    else
      echo -e "${YELLOW}⚠${NC} $file (sem lazy/Suspense)"
    fi
  else
    echo -e "${YELLOW}⚠${NC} $file (não encontrado)"
  fi
done

echo ""
echo -e "${GREEN}Total de arquivos com lazy loading: $count${NC}"
echo ""

echo -e "${BLUE}2. Verificando bundle atual...${NC}"
echo ""

# Verifica se existe build anterior
if [ -d "dist" ]; then
  echo "Tamanho do diretório dist atual:"
  du -sh dist
else
  echo "Nenhum build anterior encontrado."
fi

echo ""
echo -e "${BLUE}3. Comandos úteis:${NC}"
echo ""
echo "Para testar em iOS:"
echo "  npx expo run:ios"
echo ""
echo "Para testar em Android:"
echo "  npx expo run:android"
echo ""
echo "Para gerar build e analisar bundle:"
echo "  npx expo export --platform ios"
echo "  npx expo export --platform android"
echo ""
echo "Para verificar erros de compilação:"
echo "  npm run lint"
echo ""
echo -e "${GREEN}✨ Teste concluído!${NC}"
