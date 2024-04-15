#!/bin/bash
cd ~/repos/why2/NNIC-Project
git fetch
if [ -z "$(git diff origin/main)" ]; then
    echo "No changes in the remote repository."
else
    echo "Changes detected, executing another script..."

    screen -S vite -X quit
    screen -S gradio -X quit

    git pull

    sleep 3
    screen -S gradio -dm sh startGradio.sh
fi