---
title: I3 finder
date : 2015-01-29
tags : [linux]
---
# I3finder

[I3 finder](https://github.com/mikedmcfarland/node-i3finder) is a program made for the [I3 Window Manager](https://i3wm.org/).
It gives you dmenu access to your windows tags and workspaces. You can
* focus and move windows, tags and workspaces.
* jump back to previous window configuration, like 'alt tab'.

I made it because I didn't see anything available that provided a unified interface
for tags, windows, and workspaces. And I *need* a keyboard driven fuzzy search for just about everything.

## Installation
It's a node js script, and it's on npm and [github](https://github.com/mikedmcfarland/node-i3finder), and you can install it via
```bash
npm install -g i3-finder
```
You also need dmenu installed and on your path.

## Usage
Here are the command line options
```bash
$ i3finder --help
Usage: i3finder [options]

Options:
   -d, --dmenu             The dmenu command and arguments
   -w, --workspacePrefix   Workspace displayname prefix [workspace: ]
   -s, --showScratch       Show scratch workspace in list
   -t, --dontTrackState    Dont bother saving current state
   -i, --i3msg             Command to execute when using msg action.
   -a, --action            Action to perform.  [focus]
```
###Focusing and Moving windows

To move a window use
```bash
i3finder -a move
```
then select from the list. That window, tag, or workspace will all be moved to your current position.

To focus a window use
```bash
i3finder
```

### Moving back to previous focus / state tracking

To move back to the previous window state use

```bash
i3finder -action back
```

**But be warned**, I3finder only knows about the window configurations because it saves them before making changes.
If I3finder doesn't make the change, then it's unaware of the states.

This can be useful, since normally I only want to save jumps, rather then every directional movement.
But you can also ask i3finder to msg i3 directly, and it will keep track of changes.
You do this through the msg action

```bash
#msg i3 with 'workspace 1' which will focus workspace 1.
i3finder -action msg -i 'workspace 1'
#Back will now go back to the window configuration before focusing workspace 1
```

### Example configuration

Here's a simplified version of my configuration

```bash

# mod p brings up a list of windows/workspaces/tags to focus
bindsym $mod+p exec i3finder

# mod g brings up a list of windows/workspaces/tags to move to the current area
bindsym $mod+g exec i3finder -a move

# mod b triggers the back manuever
bindsym $mod+b exec i3finder -a back

# change focus on vim style keys, without the finder
# that way little motions dont mess up our history
bindsym $mod+h focus left
bindsym $mod+j focus down
bindsym $mod+k focus up
bindsym $mod+l focus right

# bind mod [num] to change to a workspace, but use msg parameter
# so that these motions are added to our history.
bindsym $mod+1 exec i3finder -a msg -i 'workspace 1'
bindsym $mod+2 exec i3finder -a msg -i 'workspace 2'
bindsym $mod+3 exec i3finder -a msg -i 'workspace 3'
bindsym $mod+4 exec i3finder -a msg -i 'workspace 4'
bindsym $mod+5 exec i3finder -a msg -i 'workspace 5'
bindsym $mod+6 exec i3finder -a msg -i 'workspace 6'
bindsym $mod+7 exec i3finder -a msg -i 'workspace 7'
bindsym $mod+8 exec i3finder -a msg -i 'workspace 8'
bindsym $mod+9 exec i3finder -a msg -i 'workspace 9'
bindsym $mod+0 exec i3finder -a msg -i 'workspace 10'
```

## Alternative launchers
I3 finder uses dmenu by default, but you can utilize any application launcher
that you wish. You can specify the command used to show selections via the dmenu
parameter.

## Implementation
It calls the i3-msg CLI, queries the current i3 tree, and then forms a
list of selections. It pipes those selections to dmenu.
Then based on your selection uses i3-msg CLI again to manipulate your windows.
Other then some writing/reading of json to track state, That's about it.
