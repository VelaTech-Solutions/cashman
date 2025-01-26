#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment process...${NC}"

# # Step 1: Optionally update Git repository
# echo -e "${YELLOW}Checking for uncommitted changes in Git...${NC}"
# if [[ $(git status --porcelain) ]]; then
#     echo -e "${RED}Uncommitted changes found! Please commit or stash your changes before deploying.${NC}"
#     exit 1
# else
#     echo -e "${GREEN}No uncommitted changes. Proceeding with deployment.${NC}"
# fi

# Step 2: Delete the build folder
echo -e "${YELLOW}Deleting old build folder...${NC}"
rm -rf build
if [[ $? -ne 0 ]]; then
    echo -e "${RED}Failed to delete the build folder.${NC}"
    exit 1
fi
echo -e "${GREEN}Build folder deleted.${NC}"

# Step 3: Build the app
echo -e "${YELLOW}Building the app...${NC}"
npm run build
if [[ $? -ne 0 ]]; then
    echo -e "${RED}Build process failed. Please check for errors in your code.${NC}"
    exit 1
fi
echo -e "${GREEN}App built successfully.${NC}"

# Step 4: Deploy using Firebase
echo -e "${YELLOW}Deploying to Firebase...${NC}"
firebase deploy
if [[ $? -ne 0 ]]; then
    echo -e "${RED}Firebase deployment failed. Please check the Firebase logs for details.${NC}"
    exit 1
fi
echo -e "${GREEN}Deployment to Firebase completed successfully!${NC}"
