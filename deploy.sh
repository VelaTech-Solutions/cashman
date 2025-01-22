#!/bin/bash

# Maybe update git here too?


# Delete the build folder
rm -rf build

# Build the app
npm run build

# Deploy using Firebase
firebase deploy

