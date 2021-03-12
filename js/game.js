/******************************************************************************
Engine Setup
******************************************************************************/

let gameLoop = new Loop(updateLoop);

/******************************************************************************
Object Setup
******************************************************************************/

const TILESIZE = 16;
const MAPROOMWIDTH = 4;
const MAPROOMHEIGHT = 3;
const MENUWIDTH = 192;
const MAXPLAYERS = 4;

let map = undefined;
let mapImage = undefined;
let players = [];
let playerConfigs = [];
let playerVisions = [];
let zombies = [];
let zombieID = 0;
let aliveZombies = 0;
let projectiles = [];
let projectileID = 0;

/******************************************************************************
UI Setup
******************************************************************************/

let sideMenu = undefined;
let mousePos = new Vector(0, 0);

/******************************************************************************
NEAT Setup
******************************************************************************/

let generation = 0;
let brainGroup = -1;
let gameSpeed = 1;
let maxPopulation = 100;
let neats = [];
const OUTPUTCOUNT = 8;

// Player Vision
let showRays = false;
const RAYTYPES = 3;
const STACKEDFRAMES = 3;

// Wave
let currentWave = 0;
let maxWave = 0;
let maxWaveGeneration = 0;
let waveTime = 0;
let groupTime = 0;
let maxWaveTime = 1800;//60 seconds
let zombieSpawnLast = 0;
let zombieSpawnSpeed = 30;
let waveZombieCount = 0;

/******************************************************************************
Initialization
******************************************************************************/

let p1RayCount = document.getElementById("Player1Rays");
let p1InputLayers = document.getElementById("Player1InputLayers");
p1RayCount.onchange = () => {
	p1InputLayers.value = parseInt(p1RayCount.value) * STACKEDFRAMES * RAYTYPES + 1;
};
let p2RayCount = document.getElementById("Player2Rays");
let p2InputLayers = document.getElementById("Player2InputLayers");
p2RayCount.onchange = () => {
	p2InputLayers.value = parseInt(p2RayCount.value) * STACKEDFRAMES * RAYTYPES + 1;
};
let p3RayCount = document.getElementById("Player3Rays");
let p3InputLayers = document.getElementById("Player3InputLayers");
p3RayCount.onchange = () => {
	p3InputLayers.value = parseInt(p3RayCount.value) * STACKEDFRAMES * RAYTYPES + 1;
};
let p4RayCount = document.getElementById("Player4Rays");
let p4InputLayers = document.getElementById("Player4InputLayers");
p4RayCount.onchange = () => {
	p4InputLayers.value = parseInt(p4RayCount.value) * STACKEDFRAMES * RAYTYPES + 1;
};

// Simulation Start
function startGame() {
	// Flip UI over to game mode
	document.getElementById("MenuContainer").className = "hide";
	document.getElementById("GameContainer").className = "";
	// Get UI Values
	maxPopulation = parseInt(document.getElementById("PopulationCount").value);
	maxWaveTime = parseInt(document.getElementById("MaxWaveTime").value) * 60;
	playerConfigs = [];
  playerVisions = [];
	neats = [];
  for (let i = 1; i <= MAXPLAYERS; i++) {
    playerConfigs.push({
      "name": document.getElementById(`Player${i}Name`).value
      ,"color": document.getElementById(`Player${i}Color`).value
      ,"maxHealth": parseInt(document.getElementById(`Player${i}Health`).value)

      ,"castRays": parseInt(document.getElementById(`Player${i}Rays`).value)
      ,"fov": parseInt(document.getElementById(`Player${i}FOVSelect`).value)
      ,"viewDistance": parseFloat(document.getElementById(`Player${i}ViewDistance`).value)

      ,"hiddenLayers": document.getElementById(`Player${i}HiddenLayers`).value
      ,"mutationChance": parseFloat(document.getElementById(`Player${i}MutationChance`).value)
      ,"mutationAmount": parseFloat(document.getElementById(`Player${i}MutationAmount`).value)

      ,"pointsAttackEnemy": parseFloat(document.getElementById(`Player${i}AttackEnemy`).value)
      ,"pointsAttackAlly": parseFloat(document.getElementById(`Player${i}AttackAlly`).value)
      ,"pointsAttack": parseFloat(document.getElementById(`Player${i}Attack`).value)
      ,"pointsAlive": parseFloat(document.getElementById(`Player${i}Alive`).value)
      ,"pointsExplore": parseFloat(document.getElementById(`Player${i}Explore`).value)
    });
    // Build Player Vision
		playerVisions.push(buildPlayerVision(
			playerConfigs[i - 1].castRays
			,playerConfigs[i - 1].fov
			,playerConfigs[i - 1].viewDistance
		));
		// Build NEAT
		neats.push(buildNEAT(
			playerVisions[i - 1].totalInputs
			,playerConfigs[i - 1].hiddenLayers
			,playerConfigs[i - 1].mutationChance
			,playerConfigs[i - 1].mutationAmount
		));
  }

  // Start up the game using above values
	initMap();
	initScreen();
	initSideMenu();
	resetWaves();
	gameLoop.start();
	// Add listeners for mouse controls
	gameScreen.canvas.addEventListener(
		"mousemove", (e) => {
			let canvasRect = gameScreen.canvas.getBoundingClientRect();
			let scaleX = gameScreen.canvas.width / canvasRect.width;
			let scaleY = gameScreen.canvas.height / canvasRect.height;
			mousePos.x = Math.floor((e.clientX - canvasRect.left) * scaleX);
			mousePos.y = Math.floor((e.clientY - canvasRect.top) * scaleY);
			sideMenu.hoverCheck(mousePos);
		}
		,false
	);
	gameScreen.canvas.addEventListener(
		"mousedown", (e) => {
			let canvasRect = gameScreen.canvas.getBoundingClientRect();
			let scaleX = gameScreen.canvas.width / canvasRect.width;
			let scaleY = gameScreen.canvas.height / canvasRect.height;
			mousePos.x = Math.floor((e.clientX - canvasRect.left) * scaleX);
			mousePos.y = Math.floor((e.clientY - canvasRect.top) * scaleY);
			sideMenu.clickCheck(mousePos);
		}
		,false
	);
}

// Init Map
function initMap() {
	map = new RandomRoom(
		MAPROOMWIDTH
		,MAPROOMHEIGHT
		,7 + Math.floor(Math.random() * 5));
	mapImage = map.buildImage(TILESIZE);
}

// Init Screen
function initScreen() {
	gameScreen = new Screen(
	  document.getElementById("screen")
	  ,(MAPROOMWIDTH * RandomRoom.roomSize() * TILESIZE) + MENUWIDTH
	  ,MAPROOMHEIGHT * RandomRoom.roomSize() * TILESIZE
	);
}

// Init Player Vision
function buildPlayerVision(count, degrees, viewDistance) {
	let rayCount = 0;
	let rayWidth = 0;
	let playerVisionRays = [];
	if (degrees == 360) {
		rayCount = count;
		rayWidth = (Math.PI * 2) / rayCount;
		for (let i = 0; i < rayCount; i++) {
			playerVisionRays.push(rayWidth * i);
		}
	} else {
		rayCount = count;
		rayWidth = Math.PI / (count - 1);
		for (let i = 0; i < rayCount; i++) {
		  playerVisionRays.push((Math.PI * -0.5) + (rayWidth * i));
		}
	}
	inputsPerFrame = rayCount * RAYTYPES;
	return {
		"count": rayCount
		,"width": rayWidth
		,"rays": playerVisionRays
		,"viewDistance": viewDistance
		,"inputsPerFrame": rayCount * RAYTYPES
		,"totalInputs": rayCount * RAYTYPES * STACKEDFRAMES
	};
}
function buildNEAT(totalInputs, hiddenLayers, mChance, mAmount) {
	let bias = 1;
  let brainDimensions = [];
  // Input Layer
  brainDimensions.push(totalInputs + bias);
  // Hidden Layers
	let layers = hiddenLayers.trim().split(",");
  for (let i = 0; i < layers.length; i++) {
    brainDimensions.push(parseInt(layers[i]));
  }
  // Output Layer
  brainDimensions.push(OUTPUTCOUNT);
	let newNEAT = new Neat(maxPopulation, brainDimensions);
	newNEAT.mutationChance = mChance;
	newNEAT.mutationAmount = mAmount;
	return newNEAT;
};

function speedCallback(speed) {
	gameSpeed = speed;
}

function initSideMenu() {
	sideMenu = new Menu(
		new Vector(gameScreen.width - MENUWIDTH, 0)
		,new Vector(MENUWIDTH, gameScreen.height)
	);
	let buttonSpacerCount = 0;
	let buttonY = sideMenu.lineHeight * 21;
	let buttonWidth = 20;
	let buttonHeight = sideMenu.lineHeight;
	let buttonSpacer = Math.floor((MENUWIDTH - (5 * buttonWidth)) / 6);
	sideMenu.addButton(
		new Vector(buttonSpacer + (buttonSpacer * buttonSpacerCount) + (buttonWidth * buttonSpacerCount), buttonY)
		,new Vector(buttonWidth, buttonHeight)
		,"x1"
		,speedCallback
		,1
	);
	buttonSpacerCount += 1;
	sideMenu.addButton(
		new Vector(buttonSpacer + (buttonSpacer * buttonSpacerCount) + (buttonWidth * buttonSpacerCount), buttonY)
		,new Vector(buttonWidth, buttonHeight)
		,"x5"
		,speedCallback
		,5
	);
	buttonSpacerCount += 1;
	sideMenu.addButton(
		new Vector(buttonSpacer + (buttonSpacer * buttonSpacerCount) + (buttonWidth * buttonSpacerCount), buttonY)
		,new Vector(buttonWidth, buttonHeight)
		,"x10"
		,speedCallback
		,10
	);
	buttonSpacerCount += 1;
	sideMenu.addButton(
		new Vector(buttonSpacer + (buttonSpacer * buttonSpacerCount) + (buttonWidth * buttonSpacerCount), buttonY)
		,new Vector(buttonWidth, buttonHeight)
		,"x20"
		,speedCallback
		,20
	);
	buttonSpacerCount += 1;
	sideMenu.addButton(
		new Vector(buttonSpacer + (buttonSpacer * buttonSpacerCount) + (buttonWidth * buttonSpacerCount), buttonY)
		,new Vector(buttonWidth, buttonHeight)
		,"∞"
		,speedCallback
		,-1
	);
	sideMenu.buttons[0].isSelected = true;
}

/******************************************************************************
Update Functions
******************************************************************************/

function nextWave() {
	currentWave += 1;
	zombieSpawnLast = 0;
	waveTime = 0;
	if (currentWave > maxWave) {
		maxWave = currentWave;
		maxWaveGeneration = generation;
	}

	// Zombies
	zombies = [];
	zombieID = 0;
	waveZombieCount = MAXPLAYERS * currentWave;
	spawnZombies(waveTime);
}

function resetWaves() {
	// Player score
	for (let i = 0; i < players.length; i++) {
		neats[i].brains[brainGroup].score += players[i].runTime * players[i].pAlive;
		neats[i].brains[brainGroup].score += players[i].hitsAlly * players[i].pAlly;
		neats[i].brains[brainGroup].score += players[i].hitsEnemy * players[i].pEnemy;
		neats[i].brains[brainGroup].score += players[i].shots * players[i].pAttack;
		neats[i].brains[brainGroup].score += (players[i].visited.length - 1) * players[i].pExplore;
	}
	currentWave = 0;
	brainGroup += 1;
	if (brainGroup >= maxPopulation) {
    for (let i = 0; i < neats.length; i++) {
      neats[i].nextGeneration();
    }
    generation += 1;
    brainGroup = 0;
    groupTime = 0;
		initMap();
	}
	projectiles = [];
	projectileID = 0;
	spawnPlayers();
	nextWave();
}

function fireProjectile(player) {
	let pid = -1;
	for (let i = 0; i < projectiles.length; i++) {
		if (!projectiles[i].alive) {
			pid = i;
			break;
		}
	}
	if (pid == -1) {
		let pos = player.pos.add(Vector.fromAngle(player.dir).mul(player.radius));
		let p = new Unit(pos, new Vector(0.1, 0.1), "b" + projectileID);
		p.internalOwnerID = player.internalID;
		p.ownerID = player.id;
		p.vel = Vector.fromAngle(player.dir).mul(0.5);
		projectiles.push(p);
		projectileID += 1;
	} else {
		let pos = player.pos.add(Vector.fromAngle(player.dir).mul(player.radius));
		let p = new Unit(pos, new Vector(0.1, 0.1), "b" + pid);
		p.internalOwnerID = player.internalID;
		p.ownerID = player.id;
		p.vel = Vector.fromAngle(player.dir).mul(0.5);
		projectiles[pid] = p;
	}
}

function updatePlayers() {
	let alive = false;
	for (let i = 0; i < players.length; i++) {
		if (players[i].alive) {
			alive = true;
			players[i].inputs.splice(0, playerVisions[i].inputsPerFrame);
			players[i].inputs = players[i].inputs.concat(gridInputs(players[i], playerVisions[i], map.grid));
			players[i].inputs = players[i].inputs.concat(unitInputs(players[i], playerVisions[i], players));
			players[i].inputs = players[i].inputs.concat(unitInputs(players[i], playerVisions[i], zombies));
			players[i].output = neats[i].processInput(brainGroup, players[i].inputs.concat([1]));// Add a bias of 1
			players[i].processOutput();
			if (players[i].fire == 1) {
				if (groupTime >= players[i].attackLast + players[i].attackSpeed) {
					players[i].shots += 1;
					players[i].attackLast = groupTime;
					fireProjectile(players[i]);
				}
			}
			players[i].update(map.grid, players, zombies);
			players[i].updateVisited();
		}
	}
	return alive;
}

function updateZombies() {
	let alive = false;
	aliveZombies = 0;
	for (let i = 0; i < zombies.length; i++) {
		if (zombies[i].alive) {
			alive = true;
			aliveZombies += 1;
			zombies[i].zombieAI(players, map.grid);
			zombies[i].update(map.grid, zombies, players);
			zombies[i].melee(groupTime, players);
		}
	}
	return alive || (zombies.length < waveZombieCount);
}

function updateProjectiles() {
	for (let i = 0; i < projectiles.length; i++) {
		if (projectiles[i].alive) {
			projectiles[i].projectile(map.grid, players, zombies);
		}
	}	
}

function spawnZombies(tick) {
	if (tick >= zombieSpawnLast + zombieSpawnSpeed) {
		if (zombies.length < waveZombieCount) {
			let spawn = map.spawnLocationMob[Math.floor(Math.random() * (map.spawnLocationMob.length - 1))];
			let zombie = new Unit(new Vector(spawn[0] + 0.5, spawn[1] + 0.5), 0.5, "z" + zombieID);
			if (Ball.collidesBalls(zombie, zombies) || Ball.collidesBalls(zombie, players) ) {
				return;
			}
			zombie.maxHealth = 1;
			zombie.color = "rgb(255,0,0)";
			zombie.hp = zombie.maxHealth;
			if (Math.random() < 0.25) {
				zombie.aiType = 1;
			} else if (Math.random() < 0.1) {
				zombie.aiType = 2;
			}
			zombies.push(zombie);
			zombieID += 1;
			zombieSpawnLast = tick;
		}
	}
}

function spawnPlayers() {
	players = [];
	for (let i = 0; i < MAXPLAYERS; i++) {
		let spawn = map.spawnLocationPlayer[i];
		let player = new Unit(new Vector(spawn[0] + 0.5, spawn[1] + 0.5), 0.5, "p" + i);
		player.internalID = i;
		player.output = new Array(OUTPUTCOUNT).fill(0);
		player.inputs = new Array(playerVisions[i].totalInputs).fill(0);
		player.color = playerConfigs[i].color;
		player.name = playerConfigs[i].name;
		player.maxHealth = playerConfigs[i].maxHealth;
		player.hp = player.maxHealth;
		// Points
		player.pEnemy = playerConfigs[i].pointsAttackEnemy;
		player.pAlly = playerConfigs[i].pointsAttackAlly;
		player.pAttack = playerConfigs[i].pointsAttack;
		player.pAlive = playerConfigs[i].pointsAlive;
		player.pExplore = playerConfigs[i].pointsExplore;
		players.push(player);
	}
}

function gridInputs(player, vision, grid) {
	let inputs = [];
	for (let i = 0; i < vision.rays.length; i++) {
		let contactPoint = dda(
			player.pos
			,Vector.fromAngle(player.dir + vision.rays[i])
			,vision.viewDistance
			,grid
		);
		inputs.push(1 - Math.max(0, Math.min(player.pos.getDistance(contactPoint) / vision.viewDistance, 1)));
	}
	return inputs;
}

function unitInputs(player, vision, units) {
	let inputs = [];
	for (let i = 0; i < vision.rays.length; i++) {
		let foundDist = vision.viewDistance;
		for (let j = 0; j < units.length; j++) {
			if (units[j].alive && player.id != units[j].id) {
				if (
					Ball.vsRay(
						player.pos
						,player.pos.add(Vector.fromAngle(player.dir + vision.rays[i]).mul(foundDist))
						,units[j])
					) {
					let dist = Math.max(0, Math.min(player.pos.getDistance(units[j].pos), vision.viewDistance));
					if (dist < foundDist) {
						foundDist = dist;
					}
				}
			}
		}
		inputs.push(1 - Math.max(0, Math.min(foundDist / vision.viewDistance, 1)));
	}
	return inputs;
}

function updateAll() {
	if (!updatePlayers()) {
		resetWaves();
	}
	spawnZombies(waveTime);
	if (!updateZombies()) {
		nextWave();
	}
	updateProjectiles();
	waveTime += 1;
	groupTime += 1;
	if (waveTime >= maxWaveTime) {
		resetWaves();
	}
}

/******************************************************************************
Draw Functions
******************************************************************************/

function drawPlayers() {
	for (let i = 0; i < players.length; i++) {
		if (players[i].alive) {
			// Body
			gameScreen.drawBall(
				Math.floor(players[i].pos.x * TILESIZE)
				,Math.floor(players[i].pos.y * TILESIZE)
				,players[i].radius * TILESIZE
				,players[i].color
			);
			// Face
			let endpoint = players[i].pos.add(Vector.fromAngle(players[i].dir).normalize().mul(players[i].radius));
			gameScreen.drawLine(
				Math.floor(players[i].pos.x * TILESIZE), Math.floor(players[i].pos.y * TILESIZE)
				,Math.floor(endpoint.x * TILESIZE), Math.floor(endpoint.y * TILESIZE)
				,"white", 3
			);

			if (showRays) {
				for (let j = 0; j < playerVisions[i].count; j++) {
					let rayInput = j + (playerVisions[i].count * RAYTYPES * (STACKEDFRAMES - 1));
					// Wall Ray
					gameScreen.ctx.strokeStyle = "rgb(255,255,255)";
					gameScreen.ctx.lineWidth = 5;
					let contactPoint = players[i].pos.add(
						Vector.fromAngle(players[i].dir + playerVisions[i].rays[j])
						.mul((1 - players[i].inputs[rayInput]) * playerVisions[i].viewDistance)
					);
					gameScreen.ctx.beginPath();
					gameScreen.ctx.moveTo(Math.floor(players[i].pos.x * TILESIZE), Math.floor(players[i].pos.y * TILESIZE));
					gameScreen.ctx.lineTo(Math.floor(contactPoint.x * TILESIZE), Math.floor(contactPoint.y * TILESIZE));
					gameScreen.ctx.stroke();
					// Ally Ray
					gameScreen.ctx.strokeStyle = "rgb(0,255,0)";
					gameScreen.ctx.lineWidth = 3;
					contactPoint = players[i].pos.add(
						Vector.fromAngle(players[i].dir + playerVisions[i].rays[j])
						.mul((1 - players[i].inputs[rayInput + playerVisions[i].count]) * playerVisions[i].viewDistance)
					);
					gameScreen.ctx.beginPath();
					gameScreen.ctx.moveTo(Math.floor(players[i].pos.x * TILESIZE), Math.floor(players[i].pos.y * TILESIZE));
					gameScreen.ctx.lineTo(Math.floor(contactPoint.x * TILESIZE), Math.floor(contactPoint.y * TILESIZE));
					gameScreen.ctx.stroke();
					// Enemy Ray
					gameScreen.ctx.strokeStyle = "rgb(255,0,0)";
					gameScreen.ctx.lineWidth = 2;
					contactPoint = players[i].pos.add(
						Vector.fromAngle(players[i].dir + playerVisions[i].rays[j])
						.mul((1 - players[i].inputs[rayInput + playerVisions[i].count + playerVisions[i].count]) * playerVisions[i].viewDistance)
					);
					gameScreen.ctx.beginPath();
					gameScreen.ctx.moveTo(Math.floor(players[i].pos.x * TILESIZE), Math.floor(players[i].pos.y * TILESIZE));
					gameScreen.ctx.lineTo(Math.floor(contactPoint.x * TILESIZE), Math.floor(contactPoint.y * TILESIZE));
					gameScreen.ctx.stroke();
				}
			}

			// Name
			gameScreen.drawText(
				players[i].name
				,Math.floor(players[i].pos.x * TILESIZE)
				,Math.floor(players[i].pos.y * TILESIZE) - 16
				,"12px Arial", "center", "white"
			);

			// Heath
			gameScreen.ctx.fillStyle = "rgb(255,0,0)";
			gameScreen.ctx.fillRect(Math.floor(players[i].pos.x * TILESIZE) - 12, Math.floor(players[i].pos.y * TILESIZE) - 14, 24, 4);
			gameScreen.ctx.fillStyle = "rgb(0,255,0";
			gameScreen.ctx.fillRect(Math.floor(players[i].pos.x * TILESIZE) - 12, Math.floor(players[i].pos.y * TILESIZE) - 14, Math.floor(players[i].hp / players[i].maxHealth * 24), 4);
		}
	}
}

function drawZombies() {
	for (let i = 0; i < zombies.length; i++) {
		if (zombies[i].alive) {
			// Body
			gameScreen.drawBall(
				Math.floor(zombies[i].pos.x * TILESIZE)
				,Math.floor(zombies[i].pos.y * TILESIZE)
				,zombies[i].radius * TILESIZE
				,zombies[i].color
			);
			// Face
			let endpoint = zombies[i].pos.add(Vector.fromAngle(zombies[i].dir).normalize().mul(zombies[i].radius));
			gameScreen.drawLine(
				Math.floor(zombies[i].pos.x * TILESIZE), Math.floor(zombies[i].pos.y * TILESIZE)
				,Math.floor(endpoint.x * TILESIZE), Math.floor(endpoint.y * TILESIZE)
				,"white", 3
			);
		}
	}
}

function drawProjectiles() {
	for (let i = 0; i < projectiles.length; i++) {
		if (projectiles[i].alive) {
			// Body
			gameScreen.drawBall(
				Math.floor(projectiles[i].pos.x * TILESIZE)
				,Math.floor(projectiles[i].pos.y * TILESIZE)
				,2
				,"yellow"
			);
		}
	}
}

function drawMap() {
	gameScreen.ctx.drawImage(
		mapImage
		,0,0
		,mapImage.width,mapImage.height
		,0,0
		,mapImage.width,mapImage.height
	);
}

function drawMenu() {
	// Background
	gameScreen.ctx.fillStyle = "black";
	sideMenu.drawBackground(gameScreen.ctx);
	// Neat
	gameScreen.textStyle("bold 20px Arial", "left", "rgb(0,255,0)");
	sideMenu.drawLineText(gameScreen.ctx, "NEAT", 0.05, 1);
	// Generation
	gameScreen.textStyle("12px Arial", "left", "white");
	sideMenu.drawLineText(gameScreen.ctx, "Generation:", 0.05, 2);
	gameScreen.textStyle("12px Arial", "right", "white");
	sideMenu.drawLineText(gameScreen.ctx, generation, 0.95, 2);
	// Brain Group
	gameScreen.textStyle("12px Arial", "left", "white");
	sideMenu.drawLineText(gameScreen.ctx, "Group:", 0.05, 3);
	gameScreen.textStyle("12px Arial", "right", "white");
	sideMenu.drawLineText(gameScreen.ctx, brainGroup + 1 + "/" + maxPopulation, 0.95, 3);
	// Wave
	gameScreen.textStyle("bold 20px Arial", "left", "rgb(0,255,0)");
	sideMenu.drawLineText(gameScreen.ctx, "Wave", 0.05, 5);
	// Current Wave
	gameScreen.textStyle("12px Arial", "left", "white");
	sideMenu.drawLineText(gameScreen.ctx, "Current:", 0.05, 6);
	gameScreen.textStyle("12px Arial", "right", "white");
	sideMenu.drawLineText(gameScreen.ctx, currentWave, 0.95, 6);
	// Max Wave
	gameScreen.textStyle("12px Arial", "left", "white");
	sideMenu.drawLineText(gameScreen.ctx, "Highest:", 0.05, 7);
	gameScreen.textStyle("12px Arial", "right", "white");
	sideMenu.drawLineText(gameScreen.ctx, maxWave + "(" + maxWaveGeneration + ")", 0.95, 7);
	// Wave Time
	gameScreen.textStyle("12px Arial", "left", "white");
	sideMenu.drawLineText(gameScreen.ctx, "Time:", 0.05, 8);
	gameScreen.textStyle("12px Arial", "right", "white");
	sideMenu.drawLineText(gameScreen.ctx, Math.floor(waveTime / 60) + "/" + Math.floor(maxWaveTime / 60), 0.95, 8);
	// Players
	gameScreen.textStyle("bold 20px Arial", "left", "rgb(0,255,0)");
	sideMenu.drawLineText(gameScreen.ctx, "Players", 0.05, 10);
	gameScreen.textStyle("12px Arial", "left", "white");
	sideMenu.drawLineText(gameScreen.ctx, "Name", 0.05, 11);
	gameScreen.textStyle("12px Arial", "right", "white");
	sideMenu.drawLineText(gameScreen.ctx, "Score", 0.95, 11);
	for (let i = 0; i < MAXPLAYERS; i++) {
		gameScreen.textStyle("12px Arial", "left", "white");
		sideMenu.drawLineText(gameScreen.ctx, players[i].name + ":", 0.05, 12 + i);
		gameScreen.textStyle("12px Arial", "right", "white");
		sideMenu.drawLineText(
			gameScreen.ctx
			,(players[i].hitsEnemy * players[i].pEnemy) + (players[i].hitsAlly * players[i].pAlly)
			,0.95, 12 + i);
	}
	// Zombies
	gameScreen.textStyle("bold 20px Arial", "left", "rgb(0,255,0)");
	sideMenu.drawLineText(gameScreen.ctx, "Zombies", 0.05, 13 + MAXPLAYERS);
	gameScreen.textStyle("12px Arial", "left", "white");
	sideMenu.drawLineText(gameScreen.ctx, "Remaining:", 0.05, 14 + MAXPLAYERS);
	gameScreen.textStyle("12px Arial", "right", "white");
	sideMenu.drawLineText(gameScreen.ctx, aliveZombies + "/" + zombies.length, 0.95, 14 + MAXPLAYERS);
	// Speed Control
	gameScreen.textStyle("bold 20px Arial", "center", "rgb(0,255,0)");
	sideMenu.drawLineText(gameScreen.ctx, "Simulation Speed", 0.5, 16 + MAXPLAYERS);

	// Buttons
	for (let i = 0; i < sideMenu.buttons.length; i++) {
		// Background
		gameScreen.ctx.fillStyle = sideMenu.buttons[i].colorBackground;
		if (sideMenu.buttons[i].isHover) {
			gameScreen.ctx.fillStyle = sideMenu.buttons[i].colorBackgroundHover;
		}
		gameScreen.ctx.fillRect(
			sideMenu.buttons[i].pos.x
			,sideMenu.buttons[i].pos.y
			,sideMenu.buttons[i].size.x
			,sideMenu.buttons[i].size.y
		);
		// Text
		let color = sideMenu.buttons[i].colorText;
		if (sideMenu.buttons[i].isHover) {
			color = sideMenu.buttons[i].colorTextHover;
		}
		gameScreen.drawText(
			sideMenu.buttons[i].text
			,Math.floor(sideMenu.buttons[i].pos.x + (sideMenu.buttons[i].size.x * 0.5))
			,Math.floor(sideMenu.buttons[i].pos.y + (sideMenu.buttons[i].size.y * 0.75))
			,"10px Arial"
			,"center"
			,color
		);
		// Selected box
		if (sideMenu.buttons[i].isSelected) {
			gameScreen.ctx.lineWidth = 3;
			gameScreen.ctx.strokeStyle = "rgb(0,255,0)";
			gameScreen.ctx.beginPath();
			gameScreen.ctx.rect(
				sideMenu.buttons[i].pos.x - 1
				,sideMenu.buttons[i].pos.y - 1
				,sideMenu.buttons[i].size.x + 1
				,sideMenu.buttons[i].size.y + 1
			);
			gameScreen.ctx.stroke();
		}
	}

	// FPS
	gameScreen.drawText(
		`${gameLoop.fps}fps`
		,gameScreen.width
		,gameScreen.height - 4
		,"10px Arial"
		,"right"
		,"red"
	);
}

function drawGame() {
	drawMap();
	drawPlayers();
	drawZombies();
	drawProjectiles();
}

function drawUI() {
	drawMenu();
}

function drawAll() {
	drawGame();
	drawUI();
}

function drawSim() {
	gameScreen.clearScreen("black");
	gameScreen.drawText(
		"Simulating..."
		,Math.floor(gameScreen.width * 0.5) - (MENUWIDTH * 0.5)
		,Math.floor(gameScreen.height * 0.5)
		,"24px Arial"
		,"center"
		,"red"
	);
	drawUI();
}

/******************************************************************************
Game Loop
******************************************************************************/

function updateLoop(RAFTS) {
	if (gameSpeed == -1) {
		let stopTime = performance.now() + 12;
		while (performance.now() < stopTime) {
			updateAll();
		}
		drawSim();
	} else {
		for (let i = 0; i < gameSpeed; i++) {
			updateAll();
		}
		drawAll();
	}
}