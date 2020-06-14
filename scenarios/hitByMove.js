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
const Scenario = require('./scenario.js');

debugger;

// Scenarios must implement testFrame(frame, index) and 
// preValidate(game) methods. 

// Utility function for checking inclusion
function isOrIn(item, container) {
	if Array.isArray(container) {
		return container.includes(item);
	} else {
		return item == container;
	}
}

class hitByMove extends Scenario{
	constructor(actor='any', target='any', move='any', 
		stage='any', percent_range=[0, 999]){
		// These 'any's probably be special values on an enum for 
		// characters/stages. Would also like to be able to narrow 
		// down the Scenario by port/color
		super();

		// Would like to support passing in arrays of character/stage IDs to 
		// specify some acceptible subset.
		this.actor = actor; // Attacking character
		this.target = target; // Defending character
		this.move = move;
		this.stage = stage;
		this.percents = percent_range;
		this.frameRange = 60; // Number of frames after throw we will check
		                      
		this.doubles = false;

		this.testFrame = function(frames, index) {

			const frame = frames[index];
			const prevFrame = frames[index-1];

			// For each valid actor-target combination,
			// Check if potential actor hit potential target with
			// the specified move on this frame.
			//  - damage dealt to a target
			//  - actor's lastAttackLanded == this.move
			//    ^ Should this be checked on next frame?
			//  - target's lastHitBy == actor
			//  If this is sufficient, don't need to implement an
			//  additional helper function.
			//  This will not be extensible to moveOnShield and
			//  moveWhiff scenarios, however.
			//  A more comprehensive check would include something
			//  about the actor's and target's action states.

			const nPotentialActors = this.actorIndices.length;
			const nPotentialTargets = this.targetIndices.length;

			for (var i=0; i<nPotentialActors; i++) {
				let aIndex = this.actorIndices[i];
				let actor = frame.players[aIndex];
				let attack = actor.post.lastAttackLanded;
				// Check that attack is this.move
				if (attack != this.move) {
					continue;
				}
				for (var j=0; j<nPotentialTargets; j++){
					let tIndex = this.targetIndices[j];
					if (tIndex == aIndex) {
						break; // Actor and target cannot be the same
					}
					let target = frame.players[tIndex];
					let targetPrev = prevFrame.players[tIndex];
					let damage = target.post.percent - targetPrev.post.percent
					if (damage <= 0 || target.post.lastHitBy != aIndex) {
						break; // Move on to next potential target
					}
					// If we have not broken from the loop, I'm pretty
					// sure the target was hit by the actor with the
					// designated move.
					// TODO: Flag for verbosity
					const aPort = aIndex + 1;
					const tPort = tIndex + 1;
					console.log('Player', tPort, 
						'was thrown off stage on frame', index);
					// Should I try to determine a good endFrame?
					// So I don't count each hit of Fox drill,
					// for instance.
					// No, but should have a good method for 
					// consolidating "duplicates-within-buffer"
					// after a clipList has been generated.
					return {
						isStartOf: true,
						skipTo: index+1,
						};
					}
				}
			}
		}

		this.preValidate = function(game){
			// For this scenario, just make sure stage is not FD
			// In general, check characters, assign attributes
			// with the indices of each character (e.g. this.falcoIndex = 1)
			const settings = game.getSettings()
			const nPlayers = settings.players.length

			// Check no CPU
			for (var i=0;i<nPlayers;i++) {
				if (settings.players[i].type != 0) {
				  return false;
				}
			}

			// Check doubles
			if ((nPlayers != 2 || settings.isTeams) && !this.doubles) {
				return false;
			}
			if ((nPlayers != 4 || !settings.isTeams) && this.doubles) {
				return false;
			}

			// Check stage
			let isValidStage = false;
			if (this.stage != 'any' && !isOrIn(settings.stageId, this.stage)) {
				return false;
			}

			// Check characters
			this.actorIndices = [];
			this.targetIndices = [];
			for (var i=0; i<nPlayers; i++) {
				let charValid = false;
				let character = settings.players[i].characterId;
				// TODO: Allow sheik/zelda to count as each other
				if (isOrIn(character, this.actor) || this.actor == 'any'){
					this.actorIndices.push(i);
					charValid = true;
				}
				if (isOrIn(character, this.target) || this.target == 'any') {
					this.targetIndices.push(i);
					charValid = true;
				}
				if (charValid == false) {
					return false;
				}
			}

			// These should be superceded by actorIndices and 
			// targetIndices.
//			this.pIndex1 = settings.players[0].playerIndex;
//			this.pIndex2 = settings.players[1].playerIndex;
			this.stagePlayedOn = settings.stageId;
			return true;
		}
	}
};

module.exports = throwOffStage;
