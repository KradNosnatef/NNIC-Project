#!/bin/bash
cd ~/repos/why2/NNIC-Project
git fetch
if [ -z "$(git diff origin/main)" ]; then
    echo "No changes in the remote repository."
else
    echo "Changes detected, executing another script..."

    git pull

    screen -S vite -X quit
    screen -S gradio -X quit

    screen -S vite -dm sh startVite.sh
    echo vite is running

    screen -S gradio -dm sh startGradio.sh
    echo gradio is running
fi