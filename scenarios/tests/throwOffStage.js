const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const slp = require('slp-parser-js');
const SlippiGame = slp.default;
const platformUpThrow = require('./scenarios/platformUpThrow.js');

const basePath = '/home/robert/SSBM/slippi-replays/Robby_Max_20191203';
//const basePath = '/home/robert/SSBM/slippi-scenarios/test_replays';

const outputFilename = './clips.json';

const dolphin = {
	'mode': 'queue',
	'replay': '',
	'isRealTimeMode': false,
	'outputOverlayFiles': false,
	'queue': []
};


function getSlippiFiles(dir){
	// Returns array of slippi files in directory
	let items = fs.readdirSync(dir);
  let slippiFiles = _.filter(items, (name) => name.endsWith('.slp'));
	return slippiFiles;
};


function searchGameFor(game, scenario, preBuffer=60, postBuffer=60) {
	// Returns list of clips in SlippiGame game
	// in which scenario exists
	
	const path = game.input.filePath
	console.log('Searching game ' + path);
	var clipList = [];

	const metaData = game.getMetadata();
	const frames = game.getFrames();
	const last = metaData.lastFrame
	var nextCheck = 0;
	// Should I make game/frames an attribute of the scenario object?
	for (var i = -120; i < last; i++) {
		if (i < nextCheck){
			continue;
		}
		const test = scenario.testFrame(frames, i);
		nextCheck = test.skipTo;

		if (test.isStartOf) {
			const start = Math.max(i-preBuffer, -120);
			const end = Math.min(nextCheck+postBuffer, last);
			const clip = {
			  'path': path,
			  'startFrame': start,
			  'endFrame': end,
		  }
		  clipList.push(clip);	
	  }
	}
	return clipList;
};


function searchFilesFor(fileList, scenario) {
	// returns list of clips in each SlippiFile
	// in the list
  let clipList = [];

	let i = 0
	for (const filename of fileList){
    const game = new SlippiGame(filename);
		if (scenario.preValidate(game)){
		  var clips = searchGameFor(game, scenario);
			// TODO: Logic for combining clips that overlap
		  clips.forEach((clip) => {clipList.push(clip)});
		}
		i++;
	}
  return clipList;
};


const fileList = getSlippiFiles(basePath);
const pathList = _.map(fileList,
	(name) => path.join(basePath, name));
const numFiles = pathList.length;
console.log('Directory contains ' + numFiles + ' files.');

scenario = new platformUpThrow('any', 'any', 'any', [0, 999]);

queue = searchFilesFor(pathList, scenario);

// For some reason dolphin won't display consecutive clips
// from same replay file.
// Works with r19-dev in debug mode
dolphin.queue = queue;

numClips = queue.length;
console.log('Found ' + numClips + ' clips');

fs.writeFileSync(outputFilename, JSON.stringify(dolphin));
//Watch clips with $dolphin-emu -i /path/to/outputFilename
