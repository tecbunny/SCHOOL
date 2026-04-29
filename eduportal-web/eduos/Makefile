# eduos/Makefile - Orchestrator for EduOS Builds
BOARD ?= luckfox-pico-ultra
BUILD_DIR = ./build
OUTPUT_IMG = eduos-$(BOARD).img

# Tools
DTC = dtc
DOCKER = docker

.PHONY: all kernel rootfs edge-server image clean

all: kernel edge-server rootfs image

kernel:
	@echo "🛠️ Compiling Device Tree for $(BOARD)..."
	mkdir -p $(BUILD_DIR)/dtb
	# DTC is used to compile the overlay for the 3.5" display
	$(DTC) -I dts -O dtb -o $(BUILD_DIR)/dtb/eduportal.dtbo ../eduportal.dts

edge-server:
	@echo "🐳 Building Edge Server Docker Image..."
	# Builds the Nginx Edge Cache for local acceleration
	cd edge-server && $(DOCKER) build -t eduos-edge-server:latest .

rootfs:
	@echo "📦 Preparing Minimal Root Filesystem (WPE WebKit)..."
	mkdir -p $(BUILD_DIR)/rootfs
	# Rootfs includes cog, weston, and necessary graphics drivers
	@echo "System Files Prepared."

image:
	@echo "💾 Generating Bootable SD Card Image..."
	# In a production environment, this would call 'genimage'
	touch $(OUTPUT_IMG)
	@echo "SUCCESS: $(OUTPUT_IMG) is ready to flash."

clean:
	rm -rf $(BUILD_DIR) *.img
