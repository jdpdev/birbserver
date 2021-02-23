#!/bin/bash

cd /home/pi/Documents/Projects/birbserver
/home/pi/.virtualenvs/birbserver/bin/waitress-serve --call "birbserver:create_app" &> debug/log.txt