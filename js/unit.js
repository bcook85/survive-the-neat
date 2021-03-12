class Unit extends Ball {
	constructor(pos, radius, id) {
		super(pos, radius);
		
		this.spawn = new Vector(pos.x, pos.y);
		this.id = id;
		this.name = undefined;
		this.alive = true;
		this.maxHealth = 5;
		this.hp = this.maxHealth;
    this.tookDamage = 0;
    this.searchDistance = 8;

    this.moveSpeed = 0.1;
    this.turnSpeed = 0.1;
		this.dir = Math.random() * Math.PI * 2;

    this.attackDamage = 1;
    this.attackSpeed = 30;// ticks between attacks
    this.attackLast = 0;
    this.fire = 0;

    this.inputs = [];
    this.output = [];
    this.runTime = 0;
    this.hitsAlly = 0;
    this.hitsEnemy = 0;
    this.shots = 0;
    this.target = -1;
    this.aiType = 0;
    this.visited = [];
	};
	takeDamage(amount) {
		this.hp -= amount;
		if (this.hp <= 0) {
			this.alive = false;
			this.hasCollision = false;
			this.hp = 0;
			return true;
		}
		return false;
	};
	processOutput() {
		// Turn
		if (this.output[0] >= 0.5 && this.output[1] < 0.5) {
			this.dir += this.turnSpeed;
		} else if (this.output[1] >= 0.5 && this.output[0] < 0.5) {
			this.dir -= this.turnSpeed;
		}
		this.dir = (this.dir + (Math.PI * 2)) % (Math.PI * 2);
		// Forward/backward
		if (this.output[2] >= 0.5 && this.output[3] < 0.5) {
			this.vel = this.vel.add(new Vector(0, -1));
		} else if (this.output[3] >= 0.5 && this.output[2] < 0.5) {
			this.vel = this.vel.add(new Vector(0, 1));
		}
		// Strafe Left/Right
		if (this.output[4] >= 0.5 && this.output[5] < 0.5) {
			this.vel = this.vel.add(new Vector(1, 0));
		} else if (this.output[5] >= 0.5 && this.output[4] < 0.5) {
			this.vel = this.vel.add(new Vector(-1, 0));
		}
		this.vel = this.vel.rot(this.dir).mul(this.moveSpeed);
		// Shoot
		if (this.output[6] >= 0.5 && this.output[7] < 0.5) {
			this.fire = 1;
		} else {
			this.fire = 0;
		}
	};
	update(grid, allies, enemies) {
		this.runTime += 1;
		// Collision Detection
		Ball.vsBalls(this, allies);
		Ball.vsBalls(this, enemies);
		Ball.resolveGridCollisions(this, grid);
		// Update Position & Reset Velocity
		this.pos = this.pos.add(this.vel);
		this.vel = new Vector(0, 0);
		// Keep in map bounds
		this.pos.x = Math.max(this.radius, Math.min(grid.length - this.radius, this.pos.x));
		this.pos.y = Math.max(this.radius, Math.min(grid[Math.floor(this.pos.x)].length - this.radius, this.pos.y));
	};
	updateVisited() {
		let floored = new Vector(Math.floor(this.pos.x), Math.floor(this.pos.y));
		for (let i = 0; i < this.visited.length; i++) {
			if (this.visited[i].x == floored.x && this.visited[i].y == floored.y) {
				return;
			}
		}
		this.visited.push(floored);
	};
	projectile(grid, allies, enemies) {
		this.runTime += 1;
		if (this.runTime >= 10) {
			this.alive = false;
		}
		// Allies
		if (this.alive) {
			for (let i = 0; i < allies.length; i++) {
				if (this.ownerID != allies[i].id && allies[i].alive) {
					if (Ball.vsRay(this.pos, this.vel, allies[i]) && this.pos.getDistance(allies[i].pos) < allies[i].radius + allies[i].radius) {
						allies[this.internalOwnerID].hitsAlly += 1;
						allies[this.internalOwnerID].takeDamage(allies[this.internalOwnerID].attackDamage * 2);
						this.alive = false;
						this.hasCollision = false;
						break;
					}
				}
			}
		}
		// Enemies
		if (this.alive) {
			for (let i = 0; i < enemies.length; i++) {
				if (enemies[i].alive) {
					if (Ball.vsRay(this.pos, this.vel, enemies[i]) && this.pos.getDistance(enemies[i].pos) < enemies[i].radius + enemies[i].radius) {
						allies[this.internalOwnerID].hitsEnemy += 1;
						enemies[i].takeDamage(allies[this.internalOwnerID].attackDamage);
						this.alive = false;
						this.hasCollision = false;
						break;
					}
				}
			}
		}
		// Grid
		if (this.alive) {
			if (Ball.collidesGrid(this, grid)) {
				this.alive = false;
				this.hasCollision = false;
			}
		}
		if (this.alive) {
			this.pos = this.pos.add(this.vel);
		}
	};
	zombieAI(players, grid) {
		if (this.aiType == 1) {
			this.aiHunterSlow(players, grid);
		} else if (this.aiType == 2) {
			this.aiHunterFast(players, grid);
		} else {
			this.aiWander(players, grid);
		}
	};
	aiHunterSlow(players, grid) {
		let closestPlayer = -1;
		let closestDistance = Infinity;
		for (let i = 0; i < players.length; i++) {
			if (players[i].alive) {
				let distanceToPlayer = this.pos.getDistance(players[i].pos);
				if (distanceToPlayer < closestDistance) {
					closestPlayer = i;
					closestDistance = distanceToPlayer;
				}
			}
		}
		if (closestPlayer > -1) {
			this.target = closestPlayer;
    	let path = Astar(
        Math.floor(this.pos.x)
        ,Math.floor(this.pos.y)
        ,Math.floor(players[this.target].pos.x)
        ,Math.floor(players[this.target].pos.y)
        ,grid
      );
    	if (path.length > this.searchDistance) {
      	this.setHeading(this.pos.getAngle(new Vector(path[1][0] + 0.5, path[1][1] + 0.5)), this.moveSpeed * 0.15);
      } else if (path.length > 2) {
      	this.setHeading(this.pos.getAngle(new Vector(path[1][0] + 0.5, path[1][1] + 0.5)), this.moveSpeed);
      } else {
      	this.setHeading(this.pos.getAngle(players[this.target].pos), this.moveSpeed);
      }
		}
	};
	aiHunterFast(players, grid) {
		let closestPlayer = -1;
		let closestDistance = Infinity;
		for (let i = 0; i < players.length; i++) {
			if (players[i].alive) {
				let distanceToPlayer = this.pos.getDistance(players[i].pos);
				if (distanceToPlayer < closestDistance) {
					closestPlayer = i;
					closestDistance = distanceToPlayer;
				}
			}
		}
		if (closestPlayer > -1) {
			this.target = closestPlayer;
      if (closestDistance < (this.radius * 1.5) + players[this.target].radius) {
      	this.setHeading(this.pos.getAngle(players[this.target].pos), this.moveSpeed);
      } else {
	    	let path = Astar(
	        Math.floor(this.pos.x)
	        ,Math.floor(this.pos.y)
	        ,Math.floor(players[this.target].pos.x)
	        ,Math.floor(players[this.target].pos.y)
	        ,grid
	      );
	    	if (path.length > 2) {
	      	this.setHeading(this.pos.getAngle(new Vector(path[1][0] + 0.5, path[1][1] + 0.5)), this.moveSpeed);
	      } else {
	      	this.setHeading(this.pos.getAngle(players[this.target].pos), this.moveSpeed);
	      }
	    }
		}
	};
	aiWander(players, grid) {
		let closestPlayer = -1;
		let closestDistance = this.searchDistance;
		for (let i = 0; i < players.length; i++) {
			if (players[i].alive) {
				let distanceToPlayer = this.pos.getDistance(players[i].pos);
				if (distanceToPlayer < closestDistance) {
					closestPlayer = i;
					closestDistance = distanceToPlayer;
				}
			}
		}
		if (closestPlayer > -1) {
			this.target = closestPlayer;
      if (closestDistance < (this.radius * 1.5) + players[this.target].radius) {
      	this.setHeading(this.pos.getAngle(players[this.target].pos), this.moveSpeed);
      } else {
      	let path = Astar(
	        Math.floor(this.pos.x)
	        ,Math.floor(this.pos.y)
	        ,Math.floor(players[this.target].pos.x)
	        ,Math.floor(players[this.target].pos.y)
	        ,grid
	      );
      	if (path.length > 2 && path.length) {
	      	this.setHeading(this.pos.getAngle(new Vector(path[1][0] + 0.5, path[1][1] + 0.5)), this.moveSpeed);
	      } else {
	      	this.setHeading(this.pos.getAngle(players[this.target].pos), this.moveSpeed);
	      }
	    }
		} else {
			if (Math.random() < 0.05) {
				this.setHeading(this.dir + Math.PI * 0.05 * (Math.random() < 0.5 ? -1 : 1), this.moveSpeed);
			}
		}
	};
	setHeading(dir, speed) {
		this.dir = (dir + (Math.PI * 2)) % (Math.PI * 2);
		this.vel = Vector.fromAngle(this.dir).normalize().mul(speed);
	};
  melee(timeTick, players) {
    if (timeTick >= this.attackLast + this.attackSpeed) {
      if (this.target != -1) {
        let dist = this.pos.getDistance(players[this.target].pos);
  		  if (dist <= (this.radius * 1.5) + players[this.target].radius) {
          this.attackLast = timeTick;
          players[this.target].takeDamage(this.attackDamage);
  		  }
      }
    }
  };
};