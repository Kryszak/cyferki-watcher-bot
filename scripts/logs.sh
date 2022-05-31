#!/bin/bash

heroku logs --source app --ps worker -n 500 | sed -E 's/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}\+[0-9]{2}:[0-9]{2} app\[worker\.1\]: //'
