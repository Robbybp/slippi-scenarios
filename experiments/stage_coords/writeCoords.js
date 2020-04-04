const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const slp = require('slp-parser-js');
const SlippiGame = slp.default;
const basePath = './';

const outputFilename = './clips.json';


function getSlippiFiles(dir){
	// Returns array of slippi files in directory
	let items = fs.readdirSync(dir);
  let slippiFiles = _.filter(items, (name) => name.endsWith('.slp'));
	return slippiFiles;
};

function writeCoordsFromFiles(fileList) {
	for (const filename of fileList){
    const game = new SlippiGame(filename);
		console.log(filename)
		const stageID = game.getSettings().stageId;
		var newFile;
		if (stageID == 2){
			newFile = 'fountain';
		} else if (stageID == 3){
			newFile = 'pokemon';
		} else if (stageID == 8){
			newFile = 'yoshis';
		} else if (stageID == 28){
			newFile = 'dream_land';
		} else if (stageID == 31){
			newFile = 'battlefield';
		} else if (stageID == 32){
			newFile = 'fd';
		}

		debugger;

		fs.writeFileSync(newFile, '')

		const idx = 0;

		var data;
		const frames = game.getFrames();
		const nFrames = game.getMetadata().lastFrame;
		for (var i = 0; i <= nFrames; i++){
			frame = frames[i]
			const xCoord = frame.players[idx].post.positionX;
			const yCoord = frame.players[idx].post.positionY;
		  data = 'frame: ' + frame.frame.toString()
				     + ', x: ' + xCoord.toString()
			       + ', y: ' + yCoord.toString()
			       + '\n';
			fs.appendFileSync(newFile, data, 
			function (err) {
			if (err) throw err;
			});
		};
	};
};

const fileList = getSlippiFiles(basePath);
const pathList = _.map(fileList,
	(name) => path.join(basePath, name));
const numFiles = pathList.length;
console.log('Directory contains ' + numFiles + ' files.');

writeCoordsFromFiles(pathList);

