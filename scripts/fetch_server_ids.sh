#!/bin/bash

BOT_TOKEN=$(cat ../.env | grep CLIENT_TOKEN | sed 's/CLIENT_TOKEN=//g')

curl -s https://discord.com/api/users/@me/guilds -H "Authorization: Bot $BOT_TOKEN" | jq '.[] | "\(.id): \(.name)"'
