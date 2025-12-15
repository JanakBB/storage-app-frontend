set -e

PROJECT_DIR="/c/Users/ACER/Desktop/storageApp/storage-app-frontend"

echo "🚀 Starting deployment at $(date)"

cd "$PROJECT_DIR"

echo "📥 Pulling latest changes..."
git pull --quiet

echo "Installing Client dependencies (npm ci) ..."
npm ci

echo "🧪 Running tests..."
npm run test

echo "🏗️ Building project..."
npm run build

echo "📤 Uploading to S3..."
aws s3 sync "$PROJECT_DIR/dist" s3://paloma-frontend --delete

echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id E2QAJTNNC6GKXJ --paths "//index.html" --query 'Invalidation.Id' --output text)
echo "✅ CloudFront invalidation created: $INVALIDATION_ID"

echo "📂 Copying to Nginx directory..."

echo "🎉 Deployment completed successfully at $(date)"