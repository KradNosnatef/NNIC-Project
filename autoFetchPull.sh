#!/bin/bash
cd ~/repos/why2/NNIC-Projects
git fetch
if [ -z "$(git diff origin/main)" ]; then
    echo "No changes in the remote repository."
else
    echo "Changes detected, executing another script..."
    autoRestart.sh
fi