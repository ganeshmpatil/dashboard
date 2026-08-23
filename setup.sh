#!/usr/bin/env bash
set -e

echo "============================================"
echo "  Drug Reaction Dashboard - Auto Setup"
echo "============================================"
echo ""

# -------------------------------------------
# Step 1: Check/Install Docker
# -------------------------------------------
echo "[1/5] Checking for Docker..."

if command -v docker &> /dev/null; then
    echo "      Docker is already installed."
else
    echo "      Docker not found. Installing..."

    if [ -f /etc/os-release ]; then
        . /etc/os-release
        case "$ID" in
            ubuntu|debian|linuxmint|pop)
                sudo apt-get update -qq
                sudo apt-get install -y -qq ca-certificates curl gnupg lsb-release
                sudo install -m 0755 -d /etc/apt/keyrings
                curl -fsSL "https://download.docker.com/linux/$ID/gpg" | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null || \
                curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
                sudo chmod a+r /etc/apt/keyrings/docker.gpg
                CODENAME=$(lsb_release -cs 2>/dev/null || echo "jammy")
                REPO_ID="$ID"
                # Fallback to ubuntu for derivatives
                if [ "$ID" != "ubuntu" ] && [ "$ID" != "debian" ]; then
                    REPO_ID="ubuntu"
                fi
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$REPO_ID $CODENAME stable" | \
                    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
                sudo apt-get update -qq
                sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
                ;;
            fedora|rhel|centos)
                sudo dnf -y install dnf-plugins-core
                sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
                sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
                ;;
            *)
                echo "[ERROR] Unsupported Linux distribution: $ID"
                echo "        Please install Docker manually: https://docs.docker.com/engine/install/"
                exit 1
                ;;
        esac
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install --cask docker
            echo "      Please open Docker Desktop from Applications and wait for it to start."
            echo "      Then run this script again."
            exit 0
        else
            echo "[ERROR] Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
            exit 1
        fi
    else
        echo "[ERROR] Unsupported OS. Please install Docker manually."
        exit 1
    fi

    # Start and enable Docker service (Linux)
    if command -v systemctl &> /dev/null; then
        sudo systemctl start docker
        sudo systemctl enable docker
    fi

    # Add current user to docker group
    if [ "$(uname)" != "Darwin" ]; then
        sudo usermod -aG docker "$USER" 2>/dev/null || true
        echo "      Docker installed. You may need to log out and back in for group changes."
    fi

    echo "      Docker installed successfully."
fi

# -------------------------------------------
# Step 2: Ensure Docker is running
# -------------------------------------------
echo "[2/5] Ensuring Docker is running..."

if ! docker info &> /dev/null; then
    if command -v systemctl &> /dev/null; then
        sudo systemctl start docker
    fi
    # Wait for Docker
    for i in $(seq 1 12); do
        if docker info &> /dev/null; then break; fi
        sleep 5
    done
fi

if ! docker info &> /dev/null; then
    echo "[ERROR] Docker is not running. Please start Docker and try again."
    exit 1
fi
echo "      Docker is running."

# -------------------------------------------
# Step 3: Build and start services
# -------------------------------------------
echo "[3/5] Building and starting all services (first run takes 3-5 minutes)..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if docker compose version &> /dev/null; then
    docker compose up --build -d
else
    docker-compose up --build -d
fi

# -------------------------------------------
# Step 4: Wait for backend
# -------------------------------------------
echo ""
echo "[4/5] Waiting for services to be ready..."

for i in $(seq 1 20); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/login 2>/dev/null | grep -q "4[0-9][0-9]\|200"; then
        break
    fi
    sleep 3
done
echo "      All services are up."

# -------------------------------------------
# Step 5: Extract sample data
# -------------------------------------------
echo "[5/5] Extracting sample data file..."
sleep 5
docker cp med_datagen:/output/drug_reactions_sample.xlsx "$SCRIPT_DIR/drug_reactions_sample.xlsx" 2>/dev/null || true

if [ -f "$SCRIPT_DIR/drug_reactions_sample.xlsx" ]; then
    echo "      Sample file: drug_reactions_sample.xlsx (3000 records)"
else
    echo "      Run later: docker cp med_datagen:/output/drug_reactions_sample.xlsx ."
fi

# -------------------------------------------
# Done!
# -------------------------------------------
echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "  Application:  http://localhost:3000"
echo "  Login:        admin / admin"
echo ""
echo "  Next steps:"
echo "    1. Open http://localhost:3000 in your browser"
echo "    2. Login with admin / admin"
echo "    3. Go to Upload Data page"
echo "    4. Upload drug_reactions_sample.xlsx"
echo "    5. View charts on the Dashboard"
echo ""
echo "  To stop:  docker compose down"
echo "  To reset: docker compose down -v"
echo "============================================"

# Open browser if possible
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 &> /dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi
