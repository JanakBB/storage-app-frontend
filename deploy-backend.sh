ssh storageApp 'bash' << EOF

  set -e

  echo "🚀 Starting backend deployment..."

  cd /home/ubuntu/backend-storage-app

  # Clean old logs
  echo "🧹 Cleaning logs..."
  pm2 flush storageApp 2>/dev/null || true

  # Update code
  echo "📥 Pulling code..."
  git pull

  # Install deps
  echo "📦 Installing backend dependencies (npm ci)..."
  npm ci --no audit --no-fund

  # Restart app
  echo "🔄 Reloading app..."
  pm2 reload storageApp

  # Show status
  echo ""
  echo "✅ Deployment complete!"
  echo "📊 Status:"
  pm2 list storageApp

  echo ""
  echo "📝 Recent logs:"
  pm2 logs storageApp --lines 5 --nostream 2>/dev/null || echo "No logs yet"

EOF