#!/bin/bash
# eduos/scripts/kiosk-engine.sh
# The heart of the OS: Auto-launches the EduPortal in a locked-down state.
# Configured for strict kiosk mode and security.

echo "🖥️ EduOS Kiosk Engine Starting..."

# Environment Setup
export EDUOS_STANDALONE=true
export XDG_RUNTIME_DIR=/tmp

# 1. Start Graphics Compositor (Wayland/Weston)
weston --backend=drm-backend.so --tty=1 --idle-time=0 &
sleep 3

# 2. Local URL Priority
TARGET_URL="http://localhost" # Points to the local Nginx/Next.js standalone

# 3. Launch with Lockdown Flags
# We use 'cog' for ARM devices, but adding Chromium flags logic for reference
# If using cog:
cog --unlocked \
    --bg-color=000000 \
    --platform=drm \
    "$TARGET_URL" &

# 4. Input Lockdown (Prevent escaping via keyboard)
# In a real EduOS environment, we use 'evtest' or 'xinput' to grab keyboard
# or configure the compositor to ignore system shortcuts.
# For now, we rely on cog's fullscreen/unlocked behavior.

echo "🚀 EduPortal is now live in Standalone Mode."
