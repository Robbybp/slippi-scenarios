class Scenario {
	// Eventually this should contain some info that could be useful
	// for any Scenario, e.g. characters, stage (could be 'ANY'), doubles.
	// Things that could act as filters for any scenario somebody might
	// want to define.
	constructor() {
	  this.testFrame = function(frames, index){
	  	throw 'testFrame not implemented';
	  }
	  this.preValidate = function(game){
	  	throw 'preValidate not implemented';
	  }
	}
}

module.exports = Scenario;
