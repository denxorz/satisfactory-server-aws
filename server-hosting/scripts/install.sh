#!/bin/sh

# Note: Arguments to this script 
#  1: string - S3 bucket for your backup save files (required)
#  2: true|false - whether to use Satisfactory Experimental build (optional, default false)
S3_SAVE_BUCKET=$1
USE_EXPERIMENTAL_BUILD=${2-false}

USE_DUCK_DNS=${3-false}
DUCK_DNS_DOMAIN=$4
DUCK_DNS_TOKEN=$5

USE_DYNU_DNS=${6-false}
DYNU_DNS_USERNAME=$7
DYNU_DNS_TOKEN=$8

USE_AFRAID_DNS=${9-false}
AFRAID_DNS_TOKEN=$10

# install steamcmd: https://developer.valvesoftware.com/wiki/SteamCMD?__cf_chl_jschl_tk__=pmd_WNQPOiK18.h0rf16RCYrARI2s8_84hUMwT.7N1xHYcs-1635248050-0-gqNtZGzNAiWjcnBszQiR#Linux.2FmacOS)
sudo add-apt-repository multiverse
sudo dpkg --add-architecture i386
sudo apt update

# Needed to accept steam license without hangup
echo steam steam/question 'select' "I AGREE" | sudo debconf-set-selections
echo steam steam/license note '' | sudo debconf-set-selections

sudo apt install -y unzip ca-certificates locales lib32gcc-s1 libsdl2-2.0-0:i386 libcurl4t64 steamcmd

BLUEPRINT_SAVE_DIR="/home/ubuntu/.config/Epic/FactoryGame/Saved/SaveGames/blueprints"
EPIC_SAVE_DIR="/home/ubuntu/.config/Epic/FactoryGame/Saved/SaveGames/server"
STEAM_DIR="/home/ubuntu/.steam/steam/steamapps/common/SatisfactoryDedicatedServer"
SAVED_DIR="$STEAM_DIR/FactoryGame/Saved"
CONFIG_DIR="$SAVED_DIR/Config"
CONFIG_SERVER_DIR="$CONFIG_DIR/LinuxServer"

#/home/ubuntu/.steam/steam/steamapps/common/SatisfactoryDedicatedServer/FactoryGame/Saved/Logs

# install satisfactory: https://satisfactory.fandom.com/wiki/Dedicated_servers
if [ $USE_EXPERIMENTAL_BUILD = "true" ]; then
    #STEAM_INSTALL_SCRIPT="/usr/games/steamcmd +force_install_dir $STEAM_DIR +login anonymous +app_update 1690800 -beta experimental validate +quit"
    STEAM_INSTALL_SCRIPT="/usr/games/steamcmd +login anonymous +app_update 1690800 -beta experimental validate +quit"
else
    #STEAM_INSTALL_SCRIPT="/usr/games/steamcmd +force_install_dir $STEAM_DIR +login anonymous +app_update 1690800 validate +quit"
    STEAM_INSTALL_SCRIPT="/usr/games/steamcmd +login anonymous +app_update 1690800 validate +quit"
fi
# note, we are switching users because steam doesn't recommend running steamcmd as root
su - ubuntu -c "$STEAM_INSTALL_SCRIPT"

# pull down any saved files to new instances
su - ubuntu -c "mkdir -p $EPIC_SAVE_DIR $CONFIG_DIR $BLUEPRINT_SAVE_DIR"
su - ubuntu -c "/usr/local/bin/aws s3 sync s3://$S3_SAVE_BUCKET/blueprints $BLUEPRINT_SAVE_DIR"
su - ubuntu -c "/usr/local/bin/aws s3 sync s3://$S3_SAVE_BUCKET/saves $EPIC_SAVE_DIR"
su - ubuntu -c "/usr/local/bin/aws s3 sync s3://$S3_SAVE_BUCKET/config $CONFIG_DIR"
su - ubuntu -c "mkdir -p $CONFIG_SERVER_DIR"

# enable as server so it stays up and start: https://satisfactory.fandom.com/wiki/Dedicated_servers/Running_as_a_Service
cat << EOF | sudo tee /etc/systemd/system/satisfactory.service
[Unit]
Description=Satisfactory dedicated server
Wants=network-online.target
After=syslog.target network.target nss-lookup.target network-online.target

[Service]
Environment="LD_LIBRARY_PATH=./linux64"
ExecStartPre=$STEAM_INSTALL_SCRIPT
ExecStart=$STEAM_DIR/FactoryServer.sh
User=ubuntu
Group=ubuntu
StandardOutput=journal
Restart=on-failure
KillSignal=SIGINT
WorkingDirectory=$STEAM_DIR

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable satisfactory
sudo systemctl start satisfactory

# enable auto shutdown: https://github.com/feydan/satisfactory-tools/tree/main/shutdown
cat << EOF | sudo tee /home/ubuntu/auto-shutdown.sh
#!/bin/sh

shutdownIdleMinutes=10
idleCheckFrequencySeconds=60

isIdle=0
while [ \$isIdle -le 0 ]; do
    isIdle=1
    iterations=\$((60 / \$idleCheckFrequencySeconds * \$shutdownIdleMinutes))
    while [ \$iterations -gt 0 ]; do
        sleep \$idleCheckFrequencySeconds
        connectionBytes=\$(ss -lu | grep 777 | awk -F ' ' '{s+=\$2} END {print s}')
        if [ ! -z \$connectionBytes ] && [ \$connectionBytes -gt 0 ]; then
            isIdle=0
        fi
        if [ \$isIdle -le 0 ] && [ \$((\$iterations % 21)) -eq 0 ]; then
           echo "Activity detected, resetting shutdown timer to \$shutdownIdleMinutes minutes."
           break
        fi
        iterations=\$((\$iterations-1))
    done
done

sudo /usr/local/bin/aws s3 sync $BLUEPRINT_SAVE_DIR s3://$S3_SAVE_BUCKET/blueprints
sudo /usr/local/bin/aws s3 sync $EPIC_SAVE_DIR s3://$S3_SAVE_BUCKET/saves
sudo /usr/local/bin/aws s3 sync $CONFIG_DIR s3://$S3_SAVE_BUCKET/config
sudo /usr/local/bin/aws s3 sync $SAVED_DIR s3://$S3_SAVE_BUCKET/saved

echo "No activity detected for \$shutdownIdleMinutes minutes, shutting down."
sudo shutdown -h now
EOF
sudo chmod +x /home/ubuntu/auto-shutdown.sh
sudo chown ubuntu:ubuntu /home/ubuntu/auto-shutdown.sh

cat << EOF | sudo tee /etc/systemd/system/auto-shutdown.service
[Unit]
Description=Auto shutdown if no one is playing Satisfactory
After=syslog.target network.target nss-lookup.target network-online.target

[Service]
Environment="LD_LIBRARY_PATH=./linux64"
ExecStart=/home/ubuntu/auto-shutdown.sh
User=ubuntu
Group=ubuntu
StandardOutput=journal
Restart=on-failure
KillSignal=SIGINT
WorkingDirectory=/home/ubuntu

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable auto-shutdown
sudo systemctl start auto-shutdown

# automated backups to s3 every 5 minutes
su - ubuntu -c "(crontab -l; echo \"*/5 * * * * /usr/local/bin/aws s3 sync $EPIC_SAVE_DIR s3://$S3_SAVE_BUCKET/saves && /usr/local/bin/aws s3 sync $CONFIG_DIR s3://$S3_SAVE_BUCKET/config\") | crontab -"

# enable auto dns update
cat << EOF | sudo tee /home/ubuntu/dns-update.sh
#!/bin/sh

if [ "$USE_DUCK_DNS" = "true" ]; then
curl -s "https://www.duckdns.org/update?domains=$DUCK_DNS_DOMAIN&token=$DUCK_DNS_TOKEN"
fi

if [ "$USE_DYNU_DNS" = "true" ]; then
curl -s "http://api.dynu.com/nic/update?username=$DYNU_DNS_USERNAME&password=$DYNU_DNS_TOKEN"
fi

if [ "$USE_AFRAID_DNS" = "true" ]; then
curl -s "http://sync.afraid.org/u/$AFRAID_DNS_TOKEN/"
fi
EOF
sudo chmod +x /home/ubuntu/dns-update.sh
sudo chown ubuntu:ubuntu /home/ubuntu/dns-update.sh

cat << EOF | sudo tee /etc/systemd/system/dns-update.service
[Unit]
Description=Updates DNS with current IP
After=syslog.target network.target nss-lookup.target network-online.target

[Service]
Environment="LD_LIBRARY_PATH=./linux64"
ExecStart=/home/ubuntu/dns-update.sh
User=ubuntu
Group=ubuntu
StandardOutput=journal
Restart=on-failure
KillSignal=SIGINT
WorkingDirectory=/home/ubuntu

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable dns-update
sudo systemctl start dns-update
