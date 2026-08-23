#!/usr/bin/env bash
set -e

echo "============================================"
echo "  Building Drug Reaction Dashboard"
echo "============================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
OUTPUT_DIR="$SCRIPT_DIR/dist"

# -------------------------------------------
# Step 1: Check prerequisites (build machine only)
# -------------------------------------------
echo "[1/4] Checking build tools..."

if ! command -v node &> /dev/null; then
    echo "      Node.js not found. Installing via nvm..."
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    nvm install 18
fi

if ! command -v go &> /dev/null; then
    echo "[ERROR] Go is required to build. Install from https://go.dev/dl/"
    exit 1
fi

echo "      Node $(node -v) | Go $(go version | awk '{print $3}')"

# -------------------------------------------
# Step 2: Build React frontend
# -------------------------------------------
echo "[2/4] Building React frontend..."

cd "$FRONTEND_DIR"
npm install --legacy-peer-deps --silent 2>&1 | tail -1
npm run build 2>&1 | tail -3

# -------------------------------------------
# Step 3: Copy React build into Go embed directory
# -------------------------------------------
echo "[3/4] Embedding frontend into Go binary..."

rm -rf "$BACKEND_DIR/static"
cp -r "$FRONTEND_DIR/build" "$BACKEND_DIR/static"

# -------------------------------------------
# Step 4: Build Go binaries
# -------------------------------------------
echo "[4/4] Compiling binaries..."

cd "$BACKEND_DIR"
go mod tidy

mkdir -p "$OUTPUT_DIR"

# Build for Windows (amd64)
echo "      Building dashboard.exe (Windows amd64)..."
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o "$OUTPUT_DIR/dashboard.exe" .

# Build for Linux (amd64)
echo "      Building dashboard-linux (Linux amd64)..."
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o "$OUTPUT_DIR/dashboard-linux" .

# Build for macOS (amd64)
echo "      Building dashboard-mac (macOS amd64)..."
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o "$OUTPUT_DIR/dashboard-mac" .

# Copy sample data generator
cp "$SCRIPT_DIR/data/generate_data.py" "$OUTPUT_DIR/"

echo ""
echo "============================================"
echo "  Build Complete!"
echo "============================================"
echo ""
echo "  Output directory: $OUTPUT_DIR/"
ls -lh "$OUTPUT_DIR/"
echo ""
echo "  To distribute to a Windows user:"
echo "    1. Send them dashboard.exe"
echo "    2. Send them drug_reactions_sample.xlsx"
echo "    3. They double-click dashboard.exe"
echo "    4. Browser opens at http://localhost:8080"
echo ""
echo "  To generate sample data:"
echo "    pip install openpyxl"
echo "    python dist/generate_data.py"
echo "============================================"
