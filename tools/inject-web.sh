#!/bin/bash

# Stop on first error
set -e

# Ensure following commands are run from script dir
SCRIPTDIR=$(dirname "$0")
cd "$SCRIPTDIR"

# Copy built web into node app /public dir
cp -a ../web/dist/. ../app/public/

echo "App successfully copied into /public"
