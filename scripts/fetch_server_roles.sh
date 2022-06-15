#!/bin/bash

SERVER_ID=801516188836167740
BOT_TOKEN=$(cat ../.env | grep CLIENT_TOKEN | sed 's/CLIENT_TOKEN=//g')

curl -s https://discord.com/api/guilds/$SERVER_ID/roles -H "Authorization: Bot $BOT_TOKEN" | jq '.[] | "\(.id): \(.name)"'
