#!/bin/bash

SERVER_ID=801516188836167740
BOT_TOKEN=$(grep CLIENT_TOKEN ../.env | sed 's/CLIENT_TOKEN=//g')

curl -s https://discord.com/api/guilds/$SERVER_ID/emojis -H "Authorization: Bot $BOT_TOKEN" | jq '.[] | "\(.id): \(.name)"'
