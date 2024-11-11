# Local Development Console

## Main Purpose

The front-end node service is based on cmd. You need to spend a lot of time to
remember the command, open cmd, and input you command and enter. You can't
restart it, you can only close it and reopen it.

It's hard to find the error and info in logs, and they disappear after closing.
And if you need to open multiple services at the same time, a lot of cmd panels
will make you confused about which one is which, and it's a mess.

So this console controls these processes through the background java service,
and you can easily control them on the browser without opening many cmd panels.
And It provides many conveniences such as calling Vscode to locate errors, open
folders, etc.

## Intro

You can use the Console to manage your local services or commands. It is mainly
for front-end Node.js services, but it can support any service or command that
can be started through the cli.

Through the console, you can easily control your lots of service and view the
logs easily without open lots of cmd window and search the logs.

After adding your service, you can perform operations on this service,
including: start, stop, restart, view logs, open the service directory through
Vscode, highlight log errors, locate error addresses through Vscode, and display
service status in real time by configuring log status monitoring.

## how to use

1. download app from this [link]().

2. double click run.bat (currently only support windows if you need linux or mac
   version, please create issue). You can close this cmd console, the Console
   still running in background.

3. visit **http://localhost:9981/**

# Feature

1. In the [Service] menu, you can create/edit/delete services through the add
   icon in the right top and edit/delete icon in the operation column.

2. In the [Service] menu, you can click the icon in the description column to
   perform the following operations on the service you configured:
   start/stop/restart/view logs/clear logs/open directory with vscode.

3. In the [Log status] menu, you can add/edit/del the log status and associate
   them in the [Service] menu. After association, when the log matches the
   matching rule you configured, the label name and color you configured will be
   displayed in the service menu description column to show the current service
   status.

4. You can stop the backend service by clicking the [Shutdown system] button in
   the right top.

5. You can change the language by clicking the selection in the right top.
   It also based on my another
   Tools: [automatic-i18n](https://www.npmjs.com/package/automatic-i18n)
