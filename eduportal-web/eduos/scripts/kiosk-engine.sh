#!/bin/bash
# eduos/scripts/kiosk-engine.sh
# The heart of the OS: Auto-launches the EduPortal in a locked-down state.
# Updated with Edge Server prioritization for faster local fetching.

echo "🖥️ EduOS Kiosk Engine Starting..."

EDGE_SERVER="http://eduos.local"
PUBLIC_URL="https://eduportal-shubhams-projects.vercel.app"

# 1. Start Graphics Compositor (Wayland/Weston)
export XDG_RUNTIME_DIR=/tmp
weston --backend=drm-backend.so --tty=1 --idle-time=0 &
sleep 3

# 2. Configure WPE WebKit for Hardware Acceleration (Rockchip RV1106)
export WPE_BCM_DECLARE_RESOURCES=1
export WPE_ROCKCHIP_DRM_DEVICE=/dev/dri/card0

# 3. Check for local Edge Server before falling back to public internet
if curl -s --head --request GET "$EDGE_SERVER" | grep "200 OK" > /dev/null; then
    TARGET_URL="$EDGE_SERVER"
    echo "⚡ Using Local Edge Server for faster fetching!"
else
    TARGET_URL="$PUBLIC_URL"
    echo "🌐 Edge Server offline. Falling back to Public Internet."
fi

# 4. Launch EduPortal with specific Embedded Flags
# --unlocked allows the browser to run as root in a kiosk
cog --unlocked \
    --bg-color=000000 \
    "$TARGET_URL"
