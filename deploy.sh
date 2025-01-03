#!/bin/bash
# Delete the build folder
rm -rf build

# Recreate the build folder
npm run build

# Deploy using Firebase
firebase deploy

