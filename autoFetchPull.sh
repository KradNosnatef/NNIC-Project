#!/bin/bash
cd ~/repos/why2/NNIC-Project
git fetch
if [ -z "$(git diff origin/main)" ]; then
    echo "No changes in the remote repository."
else
    echo "Changes detected, executing another script..."

    screen -S vite -X quit
    screen -S gradio -X quit

    #git pull

    sleep 5
    screen -S gradio -dm sh startGradio.sh
    sleep 1
    echo gradio is running

    screen -S vite -dm sh startVite.sh
    sleep 1
    echo vite is running
fi