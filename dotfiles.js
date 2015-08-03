var fs = require('fs');
var readline = require('readline');
var cp = require('child_process');
var p = require('path')

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function fixPath(path) {
	var newPath = path;
	if(path[0] === '~' && path[1] === '/') {
		newPath = process.env.HOME + path.substring(1);
	}
	
	newPath = p.normalize(newPath);
	
	try {
		return fs.realpathSync(newPath);
	} catch(e) {
		return newPath;
	}
}

function escapeShell(cmd) {
	return '"' + cmd.replace(/(["\s'$`\\])/g,'\\$1') + '"';
};

function doFiles(file, files)
{
	for(var i in files) {
		var f = files[i];
		var name = fixPath(file + '/' + f['name']);
		var symlink = fixPath(f['symlink']);
		try {
			var fd = fs.openSync(symlink, 'r');
			fs.closeSync(fd);
			rl.write('Skipping symlinking "' + name + '" to "' + symlink + '" as target exists\n')
		} catch(e) { // Doesn't exist, make it
			fs.symlinkSync(name, symlink);
		}
	}
}

function doGsettings(file, gsettings)
{
	for(var key in gsettings) {
		var value = gsettings[key];
		value = escapeShell(JSON.stringify(value));
		cp.execSync('gsettings set ' + key + ' ' + value, {stdio: [0,1,2]});
	}
}

function doGit(file, gits) {
	for(var i in gits) {
		var repo = gits[i];
		var url = repo['url'];
		var destination = fixPath(repo['destination']);
		
		try {
			var dir = fs.readdirSync(destination);
			cp.execSync('git pull', {stdio: [0,1,2], cwd: destination});
		} catch(e) { // Doesn't yet exist
			console.log(e);
			cp.execSync('git clone ' + url + ' ' + destination, {stdio: [0,1,2]});
		}
	}
}

function doDotfileJson(file, contents) {
	var json = JSON.parse(contents);
	if(json['files']) doFiles(file, json['files']);
	if(json['gsettings']) doGsettings(file, json['gsettings']);
	if(json['git']) doGit(file, json['git']);
}

var files = fs.readdirSync(fixPath('.'))

function loadFile(idx) {
	if(idx === files.length) process.exit(0);;
	
	var file = files[idx];
	var fd;
	try {
		fd = fs.openSync(fixPath(file + '/dotfiles.json'), 'r');
	}
	catch(e) { loadFile(idx+1); } // Means the file doesn't exist, skip
	
	rl.question('Would you like to load "' + file + '"? (Y/n): ', function(answer) {
		fs.closeSync(fd);
		
		if(answer === 'n') {
			rl.write('Skipping "' + file + '"\n');
		} else {
			var contents = fs.readFileSync(fixPath(file + '/dotfiles.json'));
			doDotfileJson(file, contents);
		}
		
		loadFile(idx+1);
	});
}

loadFile(0);