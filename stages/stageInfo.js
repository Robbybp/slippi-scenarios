const slp = require('slp-parser-js');

const stageList = [2, 3, 8, 28, 31, 32];

function Stage(id, name) {
	this.id = id;
	this.name = name;
	this.platforms = {};
	this.baseArea = undefined;

	this.isOnBase = function(x, y) {
		if (this.baseArea == undefined) {
			return false;
		}
		const area = this.baseArea;
		return (area.xMin <= x && x <= area.xMax &&
		        area.yMin <= y && y <= area.yMax);
	}
	this.isOnAPlatform = function(x, y) {
		const areas = Object.values(this.platforms);
	  for (var i=0; i<areas.length; i++) {
			area = areas[i];
		  if (area.xMin <= x && x <= area.xMax &&
		      area.yMin <= y && y <= area.yMax) {
				return true;
			}
		}
		return false;
	}
	this.isOnThisPlatform = function(platName, x, y) {
		if (this.platforms[platName] == null) {
			return false;
		}
		const area = this.platforms[platName];
		return (area.xMin <= x && x <= area.xMax &&
		        area.yMin <= y && y <= area.yMax);
	}
};

// Area seems like a bad name for this "type"
// Alternatives: XYBox, Region, Location, XYRange...
function Area(xMin, xMax, yMin, yMax) {
	this.xMin = xMin;
	this.xMax = xMax;
	this.yMin = yMin;
	this.yMax = yMax;
};

let stages = {
  2: new Stage(2, "Fountain of Dreams"),
  3: new Stage(3, "Pokémon Stadium"),
	8: new Stage(8, "Yoshi's Story"),
	28: new Stage(28, "Dream Land N64"),
	31: new Stage(31, "Battlefield"),
	32: new Stage(32, "Final Destination"),
};

Stage.prototype.addPlatform = function(name, area) {
	// e.g. platforms.left = {...}
	// Would like to verify the "type" of area...
  this.platforms[name] = area;
};

Stage.prototype.setLeftPlatform = function(area) {
  this.addPlatform('left', area);
};

Stage.prototype.setRightPlatform = function(area) {
	this.addPlatform('right', area);
};

Stage.prototype.setTopPlatform = function(area) {
  this.addPlatform('top', area);
};

Stage.prototype.clearPlatforms = function() {
	this.platforms = {};
};

Stage.prototype.setBaseArea = function(area) {
	this.baseArea = area;
};

Stage.prototype.clearBaseArea = function() { 
	this.baseArea = {};
};

// Define xy area in which characters will be registered as being
// "on the stage floor" or "on a platform." Not sure what a character's
// position really measures (center of ECB?), so I'm leaving some
// buffer room. It would be nice if I knew the dimensions of each
// character...
// For my current purposes, it is not important for these to be
// precise. Kind of imporant for them to be disjoint though.

// Set base and platforms for FOD
// On FOD and Pokemon, use a yMin for side platforms to count lowered/
// lowering platforms if they are above an arbitrary threshold of 15
// "melee units"
stages[2].setBaseArea(new Area(-65, 65, 0, 15));
stages[2].setLeftPlatform(new Area(-51, -19, 15, 35));
stages[2].setRightPlatform(new Area(19, 51, 15, 35));
stages[2].setTopPlatform(new Area(-16, 16, 41, 53));

// Set base and platforms for Pokemon
stages[3].setBaseArea(new Area(-89, 89, 0, 15));
stages[3].setLeftPlatform(new Area(-56, -24, 15, 35));
stages[3].setRightPlatform(new Area(24, 56, 15, 35));
// TODO: Add custom platforms for the Pokemon transformations

// Set base and platforms for Yoshi's
stages[8].setBaseArea(new Area(-57, 57, -5, 15));
stages[8].setLeftPlatform(new Area(-61, -27, 21, 33));
stages[8].setRightPlatform(new Area(27, 61, 21, 33));
stages[8].setTopPlatform(new Area(-17, 17, 40, 52));
// TODO: Codify the area that can possibly be occupied by Randall

// Set base and platforms for Dream Land
stages[28].setBaseArea(new Area(-78, 78, 0, 15));
stages[28].setLeftPlatform(new Area(-63, -31, 28, 40));
stages[28].setRightPlatform(new Area(31, 64, 28, 40));
stages[28].setTopPlatform(new Area(-20, 20, 50, 62));

// Set base and platforms for Battlefield
stages[31].setBaseArea(new Area(-70, 70, 0, 15));
stages[31].setLeftPlatform(new Area(-57, -19, 25, 37));
stages[31].setRightPlatform(new Area(19, 57, 25, 37));
stages[31].setTopPlatform(new Area(-19, 19, 52, 64));

// Set base for FD
stages[32].setBaseArea(new Area(-87, 87, 0, 15));

exports.stages = stages;
exports.Area = Area;
exports.stageList = stageList;


