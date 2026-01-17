#!/bin/bash

# Generate Store Screenshots using Maestro
# This script runs Maestro flows to capture screenshots for app stores
#
# Prerequisites:
# - Maestro CLI installed: https://maestro.mobile.dev/
# - Android emulator running OR iOS simulator running
# - A PREVIEW or PRODUCTION build installed (NOT development build)
#   OR have Metro server running for development builds
#
# For best results, use a preview build:
#   eas build --profile preview --platform android --local
#
# Usage:
#   ./scripts/generate-store-screenshots.sh [android|ios]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📱 WakeMind - Store Screenshots Generator${NC}"
echo "=========================================="

# Check if Maestro is installed
if ! command -v maestro &> /dev/null; then
    echo -e "${RED}❌ Maestro is not installed.${NC}"
    echo "Install it with: curl -Ls \"https://get.maestro.mobile.dev\" | bash"
    exit 1
fi

# Platform selection
PLATFORM=${1:-android}
echo -e "${YELLOW}📲 Platform: $PLATFORM${NC}"

# Check if this is a development build scenario
echo ""
echo -e "${YELLOW}⚠️  Build Type Check:${NC}"
echo "   For store-quality screenshots, ensure you have a PREVIEW build installed."
echo "   Development builds will show the Expo Dev Client launcher."
echo ""
echo "   To build a preview APK locally:"
echo "   ${BLUE}eas build --profile preview --platform android --local${NC}"
echo ""
echo "   Or if using development build, ensure Metro is running:"
echo "   ${BLUE}npx expo start${NC}"
echo ""

# Screenshot output directory
SCREENSHOT_DIR="assets/store/playstore"
mkdir -p "$SCREENSHOT_DIR"

echo -e "${BLUE}🎬 Running Maestro screenshot flow...${NC}"

# Run the screenshot flow
maestro test .maestro/flows/playstore-screenshots.yaml

# Move screenshots to project folder
echo -e "${BLUE}📁 Moving screenshots to $SCREENSHOT_DIR...${NC}"

MAESTRO_SCREENSHOTS="$HOME/.maestro/screenshots"
if [ -d "$MAESTRO_SCREENSHOTS" ]; then
    cp "$MAESTRO_SCREENSHOTS"/playstore_*.png "$SCREENSHOT_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✅ Screenshots copied successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  No screenshots found in $MAESTRO_SCREENSHOTS${NC}"
fi

# List generated files
echo ""
echo -e "${GREEN}📋 Generated screenshots:${NC}"
ls -la "$SCREENSHOT_DIR"/playstore_*.png 2>/dev/null || echo "No playstore screenshots found"

echo ""
echo -e "${BLUE}💡 Next steps:${NC}"
echo "1. Review screenshots in: $SCREENSHOT_DIR"
echo "2. Edit them if needed (add device frames, text overlays)"
echo "3. Upload to Google Play Console"
echo ""
echo -e "${YELLOW}📐 Required dimensions for Play Store:${NC}"
echo "   • Phone: 1080×1920 to 1440×2560 (9:16 or 16:9)"
echo "   • Tablet 7\": 1200×1920 (similar ratio)"
echo "   • Tablet 10\": 1920×2560 (similar ratio)"
echo "   • Feature Graphic: 1024×500"
echo ""
echo -e "${GREEN}🎉 Done!${NC}"
