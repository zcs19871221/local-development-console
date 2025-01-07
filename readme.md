# Local Development Console

## Main Purpose

The front-end node service is based on cmd. You need to spend a lot of time to
remember the command, open cmd, and input you command and enter. You can't
restart it, you can only shutdown it and start it again.

It's also hard to find the error and useful information in cmd terminal, and the log will disappear after closing the terminal.
And if you need to open multiple services at the same time, you have to open a lot of cmd terminals and it
will make you confused about which one is which, and it's a mess.

So this program help you control these processes (not only nodeJs process but any process you like),
and you can easily manage your process on the browser without opening any cmd terminals.

## Features

### Start/Stop/Restart your processes in ui with one click
you could configurate with name, directory, how to analyze the log, etc.
### Highlight error messages in live log text
You can configure which text to capture and the color in the log, and also you could quick jump to the error position in the log text.
### Quick open/jump with vscode IDE
1. Open the project address through vscode
2. Open the text in the log that can be identified as a path through vscode
### Group the process 
You can configure multiple processes together to form a tree structure, which I call a process chain. You can quickly start, close, and restart the process chain to quickly manage multiple processes.

## How to use

1. download app from this **[link](https://github.com/zcs19871221/local-development-console/actions/runs/12647816132/artifacts/2394422746)**.

2. double click run.bat (currently only support windows if you need linux or mac
   version, please create issue or contact me). You can close this cmd console, the Console
   still running in background.

3. visit *http://localhost:9981/*

## Program structure
Frontend: vite + React
Backedn: java  + spring boot2


