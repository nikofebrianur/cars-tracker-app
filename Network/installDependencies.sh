#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#


echo "   __ __ ___   ___ ";
echo "  / //_// _ ) / _ |";
echo " / ,<  / _  |/ __ |";
echo "/_/|_|/____//_/ |_|";
echo "                   ";

echo "   ____ __              __ ";
echo "  / __// /_ ___ _ ____ / /_";
echo " _\ \ / __// _ \`// __// __/";
echo "/___/ \__/ \_,_//_/   \__/ ";
echo "                           ";

function nextStep() {
  echo "Reboot your machine after dependency installation"
  echo "To download minifab Binary use.... " 
  echo "./installDependencies.sh bin "
  echo "- 'bin' - Downloads and copies minifab Binary"
}




function program_is_installed {
  # set to 1 initially
  local return_=1
  # set to 0 if not found
  type $1 >/dev/null 2>&1 || { local return_=0; }
  # return value
  echo "$return_"
}

function echo_if {
  if [ $1 == 1 ]; then
    echo_pass $2
  else
    echo_fail $2
  fi
}

function echo_pass {
  # echo first argument in green
  printf "\e[32m✔ ${1}"
  # reset colours back to normal
  printf "\033\e[0m"
}

function echo_fail {
  # echo first argument in red
  printf "\e[31m✘ ${1}"
  # reset colours back to normal
  printf "\033\e[0m"
}


installDocker(){
    echo "################ Docker ################"
    echo "Checking if Docker is installed \\n"
    sudo apt update
    local return_=1
    type docker >/dev/null 2>&1 || { local return_=0; }
    if [ $return_ -eq 0 ]; then
    	 echo "Updating apt repository"
    	 sudo apt install ca-certificates curl gnupg lsb-release -y
    	 
        printf "\e[91m✘ docker is not installed \\n"
        echo "Getting Docker"
        sudo apt install docker.io
        sleep 2
        sudo apt install curl -y
        #curl -fsSL https://get.docker.com -o get-docker.sh
        #chmod +x get-docker.sh
        #echo "Installing Docker"
        #./get-docker.sh
        #echo "Installing docker-compose"
        #sudo apt install docker-compose -y
        #rm get-docker.sh
        echo "Installing docker-compose"
        sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sleep 2
        sudo chmod +x /usr/local/bin/docker-compose
        printf "\e[32m✔ docker installed \\n \\n"
    else 
        type docker
        printf "\e[34m✔ docker is installed, skipping... \\n \\n"
    fi
}

installJq(){
    echo "################ Jq ################"
    echo "Checking if jq is installed"
    local return_=1
    type jq >/dev/null 2>&1 || { local return_=0; }
    if [ $return_ -eq 0 ]; then
        printf "\e[91m✘ jq is not installed"
        echo "Installing jq"
        sudo apt install jq -y
        echo "Installed jq"
        type jq
        printf "\e[32m✔ jq installed \\n \\n"
    else 
        type jq
        printf "\e[34m✔ jq is installed, skipping... \\n \\n"
    fi
}

installSponge(){
    echo "################ Sponge ################"
    echo "Checking if sponge is installed"
    local return_=1
    type sponge >/dev/null 2>&1 || { local return_=0; }
    if [ $return_ -eq 0 ]; then
        printf "\e[91m✘ sponge is not installed"
        echo "Installing Sponge"
        sudo apt install moreutils -y
        echo "Installed Sponge"
        type sponge
        printf "\e[32m✔ sponge installed \\n \\n"
    else 
        type sponge
        printf "\e[34m✔ sponge is installed, skipping... \\n \\n"
    fi
}

installNodeJs(){
    echo "################ NODE.JS ################"
    echo "Checking if node.js is installed"
    local return_0=1
    type node >/dev/null 2>&1 || { local return_0=0; }
    if [ $return_0 -eq 0 ]; then
        printf "\e[91m✘ nodejs is not installed"
        echo "Installing curl"
        sudo apt install curl -y
        cd ~
        curl -fsSL https://deb.nodesource.com/setup_12.x | sudo -E bash -
        sleep 2
        echo "Installing nodejs version 12"
        sudo apt install -y nodejs 
        # wget https://nodejs.org/dist/v12.0.0/node-v12.0.0-linux-x64.tar.gz
        # sleep 2
        # sudo mkdir /usr/local/lib/nodejs
        # sudo tar -xvf node-v12.0.0-linux-x64.tar.gz -C /usr/local/lib/nodejs
        # sleep 2
        # echo 'export PATH=/usr/local/lib/nodejs/node-v12.0.0-linux-x64/bin:$PATH' >> ~/.profile
        # source ~/.profile     
        node -v
        type node
        printf "\e[32m✔ nodejs installed \\n"
        echo "Installing Build Essentials"
        sudo apt install build-essential
    else
        echo "Installing Build Essentials"
        sudo apt install build-essential 
        printf "\e[34m✔ nodejs is installed, skipping... \\n \\n"
    fi
}


installNpm(){
    echo "################ NPM ################"
    echo "Checking if npm is installed"
    local return_0=1
    type npm >/dev/null 2>&1 || { local return_0=0; }
    if [ $return_0 -eq 0 ]; then
        printf "\e[91m✘ npm is not installed, Try installing npm manually..."
        type node
        sudo apt install npm -y
        sleep 1
        npm -v
        type npm
        printf "\e[32m✔ npm installed \\n \\n "
    else 
        type npm
        printf "\e[34m✔ npm is installed, skipping... \\n \\n"
    fi
}


installMinifab(){
    echo "################ MINIFAB ################"
    echo "Checking if Docker is installed"
    echo "Docker    $(echo_if $(program_is_installed docker))"
    curl -o minifab -sL https://tinyurl.com/yxa2q6yr && chmod +x minifab
    echo "Downloaded Minifab"
    sudo cp minifab /usr/local/bin
    echo "Minifab Installed"
    sleep 1
    minifab
}


installDependencies(){
    if [[ $1 == "bin" ]]; then 
        installMinifab
        echo -e "Installation Successfull"
        echo "   ____         __";
        echo "  / __/___  ___/ /";
        echo " / _/ / _ \/ _  / ";
        echo "/___//_//_/\_,_/  ";
        echo "                  ";
    else
        installDocker
        sleep 1
        installJq
        sleep 1
        installSponge
        sleep 1
        installNodeJs
        sleep 1
        installNpm
        sleep 5
        sudo usermod -aG docker $USER
        echo "jq    $(echo_if $(program_is_installed jq))"
        echo "sponge    $(echo_if $(program_is_installed sponge))"
        echo "node    $(echo_if $(program_is_installed node))"
        echo "npm    $(echo_if $(program_is_installed npm))"
        echo -e "Installation Successfull !!"
        nextStep
        echo "   ____         __";
        echo "  / __/___  ___/ /";
        echo " / _/ / _ \/ _  / ";
        echo "/___//_//_/\_,_/  ";
        echo "                  ";
    fi
}

installDependencies $1
