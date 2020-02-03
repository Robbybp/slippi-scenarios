const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const slp = require('slp-parser-js');
const SlippiGame = slp.default;

const basePath = '/home/robert/SSBM/slippi-replays/Robby_Max_20191203'

const outputFilename = './clips.json'

const dolphin = {
	'mode': 'queue',
	'replay': '',
	'isRealTimeMode': false,
	'outputOverlayFiles': false,
	'queue': []
};

function getSlippiFiles(dir){
	let items = fs.readdirSync(dir);
  let slippiFiles = _.filter(items, (name) => name.endsWith('.slp'));
	return slippiFiles;
};

function searchGameFor(game, scenario) {
	console.log('searching game...');
	var clipList = [];

	const clip = {
		'path': game.input.filePath,
		'startFrame': 0,
		'endFrame': 120
	};

	clipList.push(clip);

	return clipList;
}

function searchFilesFor(fileList, scenario) {
  let clipList = [];

	for (const filename of fileList){
    const game = new SlippiGame(filename);
		clips = searchGameFor(game, scenario);
		clips.forEach((clip) => {clipList.push(clip)})
	};
  return clipList;
}

const fileList = getSlippiFiles(basePath);
const pathList = _.map(fileList,
	(name) => path.join(basePath, name));
const numFiles = pathList.length;
console.log('Directory contains ' + numFiles + ' files.');

scenario = {};

queue = searchFilesFor(pathList, scenario);

dolphin.queue = queue;

fs.writeFileSync(outputFilename, JSON.stringify(dolphin));
//Watch clips with $dolphin-emu -i /path/to/outputFilename
