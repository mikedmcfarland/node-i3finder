#!/usr/bin/env node

var nomnom = require('nomnom');
var child_process = require('child_process');
var _ = require('lodash');
var Promise = require('promise');

var options = nomnom
	.script('i3finder')
	.help('I3 finder is used to focus or move i3 windows and workspaces. If the move '   +
	'flag is not specified, the chosen item is focused. The dmenu, and workspacePrefix ' +
	'arguments already have reasonable defaults, but are used to customize the look of ' + 
	'the choices in dmenu.')
	.option('move',{
		abbr: 'm',
		flag : true,
		help : "grab element and move it to current workspace"
	})
	.option('dmenu',{
		abbr : 'd',
		help : 'the dmenu command and arguments',
		default : ['dmenu'],
		transform : function(commandString){
			return commandString.split(' ');
		}
	})
	.option('workspacePrefix',{
		abbr : 'w',
		default : 'workspace: ',
		help : 'workspace displayname prefix (to tell them apart from other windows)'
	})
	.option('showScratch',{
		abbr: 's',
		flag : true,
		help: 'Show scratch workspace in list'
	})
	.parse();

var getTreeCommand = ['i3-msg', '-t', 'get_tree'];
var getNodes = function(){
	return exec(getTreeCommand)
		.then(JSON.parse)
		.then(nodeTreeToSeq);
};
//use i3-msg then convert the tree into a sequence of relevant nodes
var nodes = 
	getNodes()
	.then(function(seq){
		var	currentFocused = _(seq).find('focused');
		return _(seq).without(currentFocused);
	});

//format the nodes, then show them as choices in dmenu
var choices = nodes.then(nodesToChoices);
var dmenuOutput = choices.then(function(choices){
	var dmenuInput = 
		_(choices)
		.pluck('display')
		.join('\n');

	return exec(options.dmenu,dmenuInput);
});

//find the choice selected by matching the output from dmenu
var dmenuChoice = Promise.all([choices,dmenuOutput]).then(function(results){
	var choices = results[0];
	var output = results[1].trim();

	return choices
		.find(function(c){
			return c.display === output;
		});
});

//use the choice to either focus or move the selection (by id)
dmenuChoice.done(function(choice){

	var executeAction = function(id,action){
		var command =  ['i3-msg'].concat(['[con_id=' + id + "]"]).concat(action);
		exec(command).done(console.log);	
	};

	if(choice === undefined){
		//Focusing the window that's currently focused
		//because of a bug where when a mouse is over an unfocused
		//window, canceling out of dmenu gives it focus.
		//re-grabbing the tree again since focus can change
		//after opening this.
		getNodes()
		.done(function(nodes){
			var focused = _(nodes).find('focused');
			var id = focused.id;
			var action = ['focus'];
			executeAction(id,action);
		});
		
	}else{
		var id = choice.id;
		var action = options.move === undefined ? ['focus'] : ['move','workspace','current'];
		executeAction(id,action);
	}

		
});

/**
* execute a command with a child process, and provides a promise of the 
* output. The process is fed the input arg on stdin (if defined)
*/
function exec(command,input){
	return new Promise(function(resolve,reject){
		var exe = _.first(command);
		var args = _.rest(command);
		var child = child_process.spawn(exe,args);
		child.stdin.setEncoding = 'utf-8';

		var output = "";
		child.stdout.on('data',function(part){
			output += part;
		});

		child.stderr.pipe(process.stderr);

		child.stdout.on('end',function(){
			resolve(output);
		});
		
		if(input !== undefined)
			child.stdin.write(input);

		child.stdin.end();
	});
}

/**
* given a node, provide it and its children in sequence (recursively)
*/
function nodeAndChildren(node){
	var subNodes = 
		_(node.nodes)
		.map(nodeAndChildren)
		.value();

	return [node].concat(subNodes);
}

/**
* reduce a i3 tree into a sequence of nodes, filtering irrelevant ones 
*/
function nodeTreeToSeq(tree){
	return _(nodeAndChildren(tree))
		.flatten()
		.filter(function(n){
			return (n.type === 'con' && n.window !== null) || 
					n.type === 'workspace'; 
		})
		.filter(function(n){
			var isSratch = _.contains(n.name,'__i3_scratch');
			return options.showScratch | !isSratch;
		});
}

/**
* convert nodes into a human readable choices
*/
function nodesToChoices(nodes){
	return nodes.map(function(node){
		var id = node.id;
		var display = "";
		if(node.mark !== undefined){
			display += node.mark + ": ";
		}
		if(node.type === 'workspace'){
			display += options.workspacePrefix;
		}
		display += node.name;
		return {display : display, id : id};
	});	
}

