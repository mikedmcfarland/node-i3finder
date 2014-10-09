#I3 Finder

I3 finder is a node js script for finding windows/workspaces/marks in the I3 Tiling window manager.

Use it to focus or move I3 windows and workspaces.
Similar to quickswitch.py, however the list of choices to select includes 
marks, workspaces, and windows all together (rather then requiring different parameters for each).

##Actions
### Focus 
A list of workspaces/windows/tags show in dmenu, whatever chosen is focused
### Move
A list of workspaces/windows/tags show in dmenu, whatever chosen is pulled and 
moved into the current focused area

### Back 
i3 finder stores the state of visible workspaces / the current focus before 
making maneuvers, if back is executed, i3 will restore those workspaces visibility
and focus. Similar to one press of alt tab in windows, except it only works for 
maneuvers done within the finder. Useful for when you wish to quickly find a window, 
act on it, then immediately restore the previous view you had (very common for me).

#Installation
You must have node, and dmenu installed.
If you have node installed, you can install i3finder using npm and this Github repository. For example:
`npm install -g git+https://github.com/mikedmcfarland/node-i3finder.git`

#Usage
If you've installed it globally, then i3finder should be on your path and it should be as simple as running
`i3finder` to focus a choice with demenu or `i3finder -m` to move a choice to the current focus. This is assuming
dmenu is installed and on your path as well.


You can also specify custom dmenu parameters, and other various options. Here's an example from my i3 config:
```
bindsym $mod+p exec i3finder -d "dmenu -fn 'inconsolata:pixelsize=30' -y 400 -x 550 -w 800 -l 10 -i -dim 0.7"
bindsym $mod+g exec i3finder -a move -d "dmenu -fn 'inconsolata:pixelsize=30' -y 400 -x 550 -w 800 -l 10 -i -dim 0.7"
bindsym $mod+b exec i3finder -a back
 
```
$mod+p to focus a window/workspace, and $mod+g to move it (grab). I am passing in parameters to dmenu2 for adjustments to the font, positioning, etc...

There's no reason you have to use dmenu at all (you can replace dmenu with say, yeganesh, or whatever ).
 You can see all available flags / settings by running
`i3finder --help`	 