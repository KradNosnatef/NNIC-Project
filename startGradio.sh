cd ~/repos/why2/NNIC-Project

screen -S vite -dm sh startVite.sh

source config.env
ipython -c "%run main.ipynb"