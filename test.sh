#!/bin/bash

DATE=`date +%Y%m%d%H%M%S`

echo ${DATE}>>update.md

git add .

git commit -m"mod"

git push origin master

exit