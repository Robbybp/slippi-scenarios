const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const slp = require('slp-parser-js');
const { 
	default: SlippiGame, stages: stageUtil, moves: moveUtil, 
	characters: characterUtil
} = require('slp-parser-js');
const { stages: stages, stageList: stageList, Area: Area }
	= require('../stages/stageInfo.js');
const Scenario = require('./scenario.js')


// Scenarios must implement testFrame(frame, index) and 
// preValidate(game) methods. 
// TODO: Implement Scenario class they can inherit from

class platformUpThrow extends Scenario{
	constructor(char1, char2, stage, percent_range=[0, 999]){
		super();
		this.char1 = char1 // Attacker
		this.char2 = char2 // Defender
		this.stage = stage
		this.percents = percent_range
		this.frameRange = 60 // Number of frames after throw we will check
		                     // for at platform tech/missed tech

		this.wasThrownOntoPlatform = function(frames, fIndex, fRange, pIndex){
			// Given that p1 has up-thrown p2 on frame fIndex, did this 
			// throw put p2 on a platform in the next fRange frames?

			let result = { onPlatform: false, 
				             endFrame: fIndex };
			for (var i=fIndex+1; i<fIndex+fRange; i++){
				result.endFrame = i
				const frame = frames[i]
				const player = frame.players[pIndex]
				if (frame == null) {
					// If frame i does not exist, assume it is beyond the lastFrame
					// and that index is not the start of a platformUpThrow.
					// (If it was, we should have broken out of this loop before this point)
					return result;
			  }

				// TODO: Validate that percent is within desired range.
			  const actionState = player.post.actionStateId;
				if (slp.isDamaged(actionState)) {
					// If still in hitstun, keep searching.
					continue;

				} else if ((slp.isTeching(actionState) || slp.isDown(actionState))
				           && actionState != 0xCA && actionState != 0xCB && 
				              actionState != 0xCC) {
					// Otherwise, if missed tech or teching, but not wall or ceiling
					// tech, check whether player is on a platform
					const stage = stages[this.stagePlayedOn];
					const x = player.post.positionX;
					const y = player.post.positionY;
					result.onPlatform = stage.isOnAPlatform(x, y);
					return result;

				} else {
					// Out of hitstun but not teching. This will cover weak throws
					// onto platforms (with no tech opportunity), but I'm choosing
					// not to include those.
					//
					// Will this accidentally catch some frames of certain up-throws?
					// Going to assume that damage occurs as the character enters hitstun.
					return result;
				}
			}
			result.endFrame = fIndex;
			return result
		}

		this.testFrame = function(frames, index) {
			// First, find a way to test for an up-throw

			const frame = frames[index];
			const prevFrame = frames[index-1];

			const i1 = this.pIndex1;
			const port1 = i1 + 1;
			const i2 = this.pIndex2;
			const port2 = i2 + 1;
			const post1 = frame.players[i1].post;
			const prevPost1 = prevFrame.players[i1].post;
			const post2 = frame.players[i2].post;
			const prevPost2 = prevFrame.players[i2].post;
			var percentChange;
			var result;
			
      // Check if p1 was upthrown
		  percentChange = post1.percent - prevPost1.percent;	
		  if (percentChange > 0 && 
				slp.moves.getMoveName(post2.lastAttackLanded) == 'Up Throw'){	
				result = this.wasThrownOntoPlatform(frames, index, this.frameRange, i1);
				if (result.onPlatform) {
				  console.log('  Player', port1, 'was up-thrown onto a platform on frame',
						          index);
					return {
						isStartOf: true,
						skipTo: result.endFrame,
					};
				}
			}

			// Check if p2 was up-thrown
			percentChange = post2.percent - prevPost2.percent;
		  if (percentChange > 0 && 
				slp.moves.getMoveName(post1.lastAttackLanded) == 'Up Throw'){	
				result = this.wasThrownOntoPlatform(frames, index, this.frameRange, i2);
				debugger;
				if (result.onPlatform) {
				  console.log('Player', port2, 'was up-thrown onto a platform on frame',
						          index);
					return {
						isStartOf: true,
						skipTo: result.endFrame,
					};
				}
			}
			return {
				isStartOf: false,	
			  skipTo: index,
		  };
	  }

		this.preValidate = function(game){
			// For this scenario, just make sure stage is not FD
			// In general, check characters, assign attributes
			// with the indices of each character (e.g. this.falcoIndex = 1)
			const settings = game.getSettings()
			const nPlayers = settings.players.length
			for (var i=0;i<nPlayers;i++) {
				if (settings.players[i].type != 0) {
				  return false;
				}
			}
			if (nPlayers != 2 || settings.isTeams) {
				return false;
			}
			if (settings.stageId == slp.stages.STAGE_FD){
				return false;
			}
			this.pIndex1 = settings.players[0].playerIndex;
			this.pIndex2 = settings.players[1].playerIndex;
			this.stagePlayedOn = settings.stageId;
			return true;
		}
	}
};

module.exports = platformUpThrow;
