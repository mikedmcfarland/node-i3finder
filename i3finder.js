var nomnom = require('nomnom');
var child_process = require('child_process');
var _ = require('lodash');
var Promise = require('promise');

var options = nomnom
	.script('i3finder')
	.help('I3 finder is used to focus or move i3 windows and workspaces. Simliar to '  +
	'')
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
			return commandString.split();
		}
	})
	.option('workspacePrefix',{
		abbr : 'w',
		default : 'workspace: ',
		help : 'workspace displayname prefix (to tell them apart from other windows)'
	})
	.parse();

var getTreeCommand = ['i3-msg', '-t', 'get_tree'];

//use i3-msg then convert the tree into a sequence of relevent nodes
var nodes = 
	exec(getTreeCommand)
	.then(JSON.parse)
	.then(nodeTreeToSeq);

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
	if(choice === undefined)
		return;

	var command =  ['i3-msg','[con_id=' + choice.id + "]"] ;
	if(options.move === undefined){
		command = command.concat(["focus"]);
	}else{
		command = command.concat(["move","workspace","current"]);
	}

	exec(command).done(console.log);
});

/**
* execute a command with a child process, and provides a promise of the 
* output. The process is fed the input arg on stdin (if defined)
*/
function exec(command,input){
	return new Promise(function(resolve,reject){
		var child = child_process.spawn(_.first(command),_.rest(command));
		child.stdin.setEncoding = 'utf-8';

		var output = "";
		child.stdout.on('data',function(part){
			output += part;
		});

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
			var validType = n.type === 'workspace' || n.type === 'con';
			// var isScratch = _(n.name).contains('scratch');
			return validType && n.window !== null; 
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

