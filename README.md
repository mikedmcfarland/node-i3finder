#I3 Finder

I3 finder is a node js script for finding windows/workspaces/marks in the I3 Tiling window manager.

Use it to focus or move I3 windows and workspaces.
Similar to quickswitch.py, however the list of choices to select includes 
marks, workspaces, and windows all together (rather then requiring different parameters for each).

#Installation
If you have node installed, you can install i3finder using npm and this Github repository. For example:
`sudo npm install -g git+https://github.com/mikedmcfarland/node-i3finder.git`
#Usage
If you've installed it globally, then i3finder should be on your path and it should be as simple as running
`i3finder` to focus a choice with demenu or `i3finder -m` to move a choice to the current focus. This is assuming
dmenu is installed and on your path as well.


You can also specify custom dmenu parameters, and other various options. Here's an example from my i3 config:
```
bindsym $mod+p exec i3finder -d "dmenu -fn 'inconsolata:pixelsize=30' -y 400 -x 550 -w 800 -l 10 -i -dim 0.7"
bindsym $mod+g exec i3finder -m -d "dmenu -fn 'inconsolata:pixelsize=30' -y 400 -x 550 -w 800 -l 10 -i -dim 0.7" 
```
$mod+p to focusing a window, and $mod+g to moving it (grab). I am passing in parameters to dmenu2 for adjustments to the font, positioning, etc...
There's no reason you have to use dmenu at all (you can replace dmenu with say yeganesh ).
 You can see all available flags / settings by running
`i3finder --help`	 