#!/bin/bash

# Variables
VERSION="1.0.1"
PLATFORM="linux"
ARCH="amd64"
EXT="tar.gz"
FILENAME="deploys_${VERSION}_${PLATFORM}_${ARCH}.${EXT}"
DOWNLOAD_URL="https://github.com/deploys-app/deploys/releases/download/v${VERSION}/${FILENAME}"
CACHE_DIR="$HOME/.cache/deploys-cli/${VERSION}"
EXE_PATH="${CACHE_DIR}/deploys"

# Functions
download_deploys() {
  echo "Downloading ${DOWNLOAD_URL}..."
  curl -L -o "/tmp/${FILENAME}" "${DOWNLOAD_URL}"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to download Deploys CLI."
    exit 1
  fi
}

extract_deploys() {
  echo "Extracting Deploys CLI..."
  mkdir -p "${CACHE_DIR}"
  tar -xzf "/tmp/${FILENAME}" -C "${CACHE_DIR}"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to extract Deploys CLI."
    exit 1
  fi
}

# Main Script
if [ ! -f "${EXE_PATH}" ]; then
  download_deploys
  extract_deploys
  echo "Deploys CLI installed at ${EXE_PATH}"
else
  echo "Deploys CLI already installed at ${EXE_PATH}"
fi

# Make the CLI executable
chmod +x "${EXE_PATH}"
echo "Executable path: ${EXE_PATH}"
echo "Adding to PATH..."
echo "export PATH=\$PATH:${CACHE_DIR}" >> $GITHUB_PATH
echo "Installation complete."