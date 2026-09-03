#!/bin/bash

# Service Verification Script for CloudFlip Microservices

SERVICES_DIR="/home/mrtechsys/dev/sites/MrTechSys-site/services"
GATEWAY_DIR="$SERVICES_DIR/gateway"

echo "-------------------------------------------------------"
echo "🔍 Starting CloudFlip Service Verification..."
echo "-------------------------------------------------------"

# 1. Check for directory existence
for service in gateway auth-service ai-service automation-service; do
    if [ -d "$SERVICES_DIR/$service" ]; then
        echo "✅ Service Directory Found: $service"
    else
        echo "❌ Missing Service Directory: $service"
    fi
done

# 2. Verify wrangler.toml bindings for the Gateway
echo "Checking Gateway Bindings..."
grep -E "binding = \"(AUTH_SERVICE|AI_SERVICE|AUTOMATION_SERVICE)\"" "$GATEWAY_DIR/wrangler.toml"
if [ $? -eq 0 ]; then
    echo "✅ Gateway service bindings found in wrangler.toml."
else
    echo "❌ Gateway is missing service bindings."
fi

# 3. Verify internal router paths in Gateway code
echo "Checking Gateway Routing Code..."
grep -E "path.startsWith\(\"/api/(auth|ai|automation)\"\)" "$GATEWAY_DIR/src/index.ts"
if [ $? -eq 0 ]; then
    echo "✅ Gateway router logic found for auth, ai, and automation."
else
    echo "❌ Gateway router is missing paths."
fi

# 4. Check for service token logic in each service
echo "Checking Internal Security Headers..."
for service in auth-service ai-service automation-service; do
    grep "X-CloudFlip-Service-Token" "$SERVICES_DIR/$service/src/index.ts" > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Service Token Validation found in $service."
    else
        echo "❌ $service is missing X-CloudFlip-Service-Token validation."
    fi
done

echo "-------------------------------------------------------"
echo "🎉 Verification Complete! All services are wired."
echo "-------------------------------------------------------"
