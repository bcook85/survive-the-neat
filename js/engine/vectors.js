/******************************************************************************
2D Vector
******************************************************************************/

class Vector {
	constructor(x=0,y=0) {
		this.x = x;
		this.y = y;
	};
	add(vec) {
		if (vec instanceof Vector) {
			return new Vector(this.x + vec.x, this.y + vec.y); 
		} else {
			return new Vector(this.x + vec, this.y + vec);
		}
	};
	sub(vec) {
		if (vec instanceof Vector) {
			return new Vector(this.x - vec.x, this.y - vec.y); 
		} else {
			return new Vector(this.x - vec, this.y - vec);
		}
	};
	rot(angle) {
		return new Vector(
			(this.x * Math.cos(angle)) - (this.y * Math.sin(angle))
			,(this.x * Math.sin(angle)) + (this.y * Math.cos(angle))
		);
	};
	mul(vec) {
		if (vec instanceof Vector) {
			return new Vector(this.x * vec.x, this.y * vec.y); 
		} else {
			return new Vector(this.x * vec, this.y * vec);
		}
	};
	div(vec) {
		if (vec instanceof Vector) {
			return new Vector(this.x / vec.x, this.y / vec.y); 
		} else {
			return new Vector(this.x / vec, this.y / vec);
		}
	};
	normalize() {
		let m = this.mag();
		if (m != 0) {
			return this.div(m);
		}
		return this;
	};
	mag() {
		return Math.hypot(this.x, this.y);
	};
	mag2() {
		return (this.x * this.x) + (this.y * this.y);
	};
	getDistance(toVec) {
		return Math.hypot(toVec.x - this.x, toVec.y - this.y);
	};
	getAngle(toVec) {
		return Math.atan2(toVec.y - this.y, toVec.x - this.x);
	};
	static fromAngle(angle) {
		return new Vector(Math.cos(angle), Math.sin(angle));
	};
};

/******************************************************************************
Bounding Box
******************************************************************************/

class Box {
	constructor(pos, size) {
		this.pos = new Vector(pos.x, pos.y);
		this.size = new Vector(size.x, size.y);
		this.vel = new Vector(0, 0);
		this.hasCollision = true;
	};
	vsVector(vector) {
		return (
			vector.x >= this.pos.x
			&& vector.y >= this.pos.y
			&& vector.x < this.pos.x + this.size.x
			&& vector.y < this.pos.y + this.size.y
		);
	};
	vsBox(other) {
		return (
			this.pos.x < other.pos.x + other.size.x
			&& this.pos.x + this.size.x > other.pos.x
			&& this.pos.y < other.pos.y + other.size.y
			&& this.pos.y + this.size.y > other.pos.y
		);
	};
	static vsRay(rayOrigin, rayDir, targetBox) {
		let near = targetBox.pos.sub(rayOrigin).div(rayDir);
		let far = targetBox.pos.add(targetBox.size).sub(rayOrigin).div(rayDir);
		if (!isFinite(near.x) || !isFinite(near.y) || !isFinite(far.x) || !isFinite(far.y)) {
			return undefined;
		}
		if (near.x > far.x) {
			let oldX = far.x;
			far.x = near.x;
			near.x = oldX;
		}
		if (near.y > far.y) {
			let oldY = far.y;
			far.y = near.y;
			near.y = oldY;
		}
		if (near.x > far.y || near.y > far.x) {
			return undefined;
		}
		let hitNear = Math.max(near.x, near.y);
		let hitFar = Math.min(far.x, far.y);
		if (hitFar < 0) {
			return undefined;
		}
		let contactPoint = rayOrigin.add(rayDir.mul(hitNear));
		let contactNormal = new Vector(0, 0);
		if (near.x > near.y) {
			if (rayDir.x < 0) {
				contactNormal = new Vector(1, 0);
			} else {
				contactNormal = new Vector(-1, 0);
			}
		} else if (near.x < near.y) {
			if (rayDir.y < 0) {
				contactNormal = new Vector(0, 1);
			} else {
				contactNormal = new Vector(0, -1);
			}
		}
		return {
			"point": contactPoint
			,"normal": contactNormal
			,"time": hitNear
		};
	};
	static vsDynamic(testBox, targetBox) {
		if (testBox.vel.x == 0 && testBox.vel.y == 0) {
			return undefined;
		}
		let expandedTarget = new Box(
			targetBox.pos.sub(testBox.size.div(2))
			,targetBox.size.add(testBox.size)
		);
		let contact = Box.vsRay(testBox.pos.add(testBox.size.div(2)), testBox.vel, expandedTarget);
		if (contact !== undefined && contact.time <= 1.0) {
			return contact;
		}
		return undefined;
	};
	static vsGrid(testBox, grid) {
		// Tester position
		let newPos = testBox.pos.add(testBox.vel);
		// Limit Search Area
		let areaTL = new Vector(Math.floor(Math.min(testBox.pos.x, newPos.x) - 1), Math.floor(Math.min(testBox.pos.y, newPos.y)) - 1);
		let areaBR = new Vector(Math.floor(Math.max(testBox.pos.x, newPos.x) + 1), Math.floor(Math.max(testBox.pos.y, newPos.y)) + 1);
		let contacts = [];
		for (let x = areaTL.x; x < areaBR.x; x++) {
			for (let y = areaTL.y; y < areaBR.y; y++) {
				// If blocked tile or OOB
				if (x < 0 || y < 0 || x >= grid.length || y >= grid[x].length
					|| grid[x][y] != 0) { // 0 assumed "open" or "not blocked"
					let block = new Box(new Vector(x, y), new Vector(1, 1));
					let contact = Box.vsDynamic(testBox, block);
					if (contact !== undefined) {
						contacts.push(contact);
					}
				}
			}
		}
		return contacts;
	};
	static vsBoxes(testBox, boxes) {
		let contacts = [];
		for (let i = 0; i < boxes.length; i++) {
			if (boxes[i].hasCollision) {
				let contact = Box.vsDynamic(testBox, boxes[i]);
				if (contact !== undefined) {
					contacts.push(contact);
				}
			}
		}
		return contacts;
	};
	static resolveCollisions(testBox, contacts) {
		let modified = false;
		if (contacts.length > 0) {
			contacts.sort((a, b) => a.time - b.time);
			for (let i = 0; i < contacts.length; i++) {
				testBox.vel = testBox.vel.add(contacts[i].normal.mul(new Vector(Math.abs(testBox.vel.x), Math.abs(testBox.vel.y))).mul(1 - contacts[i].time));
				modified = true;
			}
		}
		return modified;
	};
	static resolveFirstCollision(testBox, contacts) {
		let modified = false;
		if (contacts.length > 0) {
			contacts.sort((a, b) => a.time - b.time);
			testBox.vel = testBox.vel.add(contacts[0].normal.mul(new Vector(Math.abs(testBox.vel.x), Math.abs(testBox.vel.y))).mul(1 - contacts[0].time));
				modified = true;
		}
		return modified;
	};
	static returnFirstCollisionBox(testBox, boxes) {
		let contacts = [];
		for (let i = 0; i < boxes.length; i++) {
			if (boxes[i].hasCollision) {
				let contact = Box.vsDynamic(testBox, boxes[i]);
				if (contact !== undefined) {
					contact.id = i;
					contacts.push(contact);
				}
			}
		}
		contacts.sort((a, b) => a.time - b.time);
		if (contacts.length > 0) {
			return boxes[contacts[0].id];
		}
		return undefined;
	};
};

/******************************************************************************
Ball
******************************************************************************/

class Ball {
	constructor(pos, radius) {
		this.pos = new Vector(pos.x, pos.y);
		this.radius = radius;
		this.vel = new Vector(0, 0);
		this.hasCollision = true;
		this.id = 0;
	};
	vsVector(vec) {
		return Math.abs(((vec.x - this.x) * (vec.x - this.x)) + ((vec.y - this.y) * (vec.y - this.y))) < this.radius * this.radius;
	};
	vsBall(ball) {
		if (ball.hasCollision) {
			let diff = ball.pos.sub(this.pos);
			if (Math.abs((diff.x * diff.x) + (diff.y * diff.y)) <= (this.radius + ball.radius) * (this.radius + ball.radius)) {
				return true;
			}
		}
		return false;
	};
	vsCircle(pos, radius) {
		let diff = pos.sub(this.pos);
		if (Math.abs((diff.x * diff.x) + (diff.y * diff.y)) <= (this.radius + radius) * (this.radius + radius)) {
			return true;
		}
		return false;
	};
	static vsRay(startPoint, endPoint, targetBall) {
		let v1 = endPoint.sub(startPoint);
		let v2 = targetBall.pos.sub(startPoint);
		let u = (v2.x * v1.x + v2.y * v1.y) / (v1.y * v1.y + v1.x * v1.x);
		let dist = 0;
		if (u >= 0 && u <= 1) {
			dist = (startPoint.x + v1.x * u - targetBall.pos.x) ** 2 + (startPoint.y + v1.y * u - targetBall.pos.y) ** 2;
		} else {
			dist = u < 0 ?
				(startPoint.x - targetBall.pos.x) ** 2 + (startPoint.y - targetBall.pos.y) ** 2 :
				(endPoint.x - targetBall.pos.x) ** 2 + (endPoint.y - targetBall.pos.y) ** 2;
		}
		return dist < targetBall.radius * targetBall.radius;
	};
	static vsBalls2(ball, balls) {
		for (let i = 0; i < balls.length; i++) {
			if (balls[i].id != ball.id && balls[i].hasCollision && ball.vsBall(balls[i])) {
				let dist = Math.hypot(balls[i].pos.x - ball.pos.x, balls[i].pos.y - ball.pos.y);
				let overlap = (dist - ball.radius - balls[i].radius);
				// let overlap = (dist - ball.radius - balls[i].radius) * 0.5;
				let newPos = ball.pos.sub(ball.pos.sub(balls[i].pos).mul(overlap).div(dist));
				// balls[i].pos = balls[i].pos.sub(balls[i].pos.sub(ball.pos).mul(overlap).div(dist));
			}
		}
	};
	static vsBalls(ball, balls) {
		for (let i = 0; i < balls.length; i++) {
			let potentialPosition = ball.pos.add(ball.vel);
			if (balls[i].id != ball.id && balls[i].hasCollision && balls[i].vsCircle(potentialPosition, ball.radius)) {
				let distanceBetween = Math.hypot(balls[i].pos.x - potentialPosition.x, balls[i].pos.y - potentialPosition.y);
				let overlap = (distanceBetween - ball.radius - balls[i].radius);
				potentialPosition = potentialPosition.sub(potentialPosition.sub(balls[i].pos).mul(overlap).div(distanceBetween));
				ball.vel = Vector.fromAngle(ball.pos.getAngle(potentialPosition)).normalize().mul(ball.pos.getDistance(potentialPosition));
			}
		}
	};
	static resolveGridCollisions(ball, grid) {
		let potentialPosition = ball.pos.add(ball.vel);
		let currentCell = new Vector(Math.floor(ball.pos.x), Math.floor(ball.pos.y));
		let targetCell = potentialPosition;
		let areaTL = new Vector(Math.floor(Math.min(currentCell.x, targetCell.x) - 1), Math.floor(Math.min(currentCell.y, targetCell.y)) - 1);
		let areaBR = new Vector(Math.floor(Math.max(currentCell.x, targetCell.x) + 1), Math.floor(Math.max(currentCell.y, targetCell.y)) + 1);
		let cell = new Vector(0, 0);
		for (cell.y = areaTL.y; cell.y <= areaBR.y; cell.y++) {
			for (cell.x = areaTL.x; cell.x <= areaBR.x; cell.x++) {
				if (cell.x < 0 || cell.y < 0
					|| cell.x >= grid.length || cell.y >= grid[cell.x].length
					|| grid[cell.x][cell.y] != 0) {
					potentialPosition = ball.pos.add(ball.vel);
					let near = new Vector(
						Math.max(cell.x, Math.min(potentialPosition.x, cell.x + 1))
						,Math.max(cell.y, Math.min(potentialPosition.y, cell.y + 1))
					);
					let rayToNear = near.sub(potentialPosition);
					if (rayToNear.x == 0 && rayToNear.y == 0) {
						potentialPosition = potentialPosition.sub(ball.vel.normalize().mul(ball.radius));
					} else {
						let overlap = ball.radius - rayToNear.mag();
						if (!isNaN(overlap) && overlap > 0) {
							potentialPosition = potentialPosition.sub(rayToNear.normalize().mul(overlap));
						}
					}
					ball.vel = Vector.fromAngle(ball.pos.getAngle(potentialPosition)).normalize().mul(ball.pos.getDistance(potentialPosition));
				}
			}
		}
		//ball.vel = Vector.fromAngle(ball.pos.getAngle(potentialPosition)).normalize().mul(ball.pos.getDistance(potentialPosition));
	};
	static collidesBalls(ball, balls) {
		for (let i = 0; i < balls.length; i++) {
			let potentialPosition = ball.pos.add(ball.vel);
			if (balls[i].id != ball.id && balls[i].hasCollision && balls[i].vsCircle(potentialPosition, ball.radius)) {
				return true;
			}
		}
		return false;
	};
	static collidesGrid(ball, grid) {
		let potentialPosition = ball.pos.add(ball.vel);
		let currentCell = new Vector(Math.floor(ball.pos.x), Math.floor(ball.pos.y));
		let targetCell = potentialPosition;
		let areaTL = new Vector(Math.floor(Math.min(currentCell.x, targetCell.x) - 1), Math.floor(Math.min(currentCell.y, targetCell.y)) - 1);
		let areaBR = new Vector(Math.floor(Math.max(currentCell.x, targetCell.x) + 1), Math.floor(Math.max(currentCell.y, targetCell.y)) + 1);
		let cell = new Vector(0, 0);
		for (cell.y = areaTL.y; cell.y <= areaBR.y; cell.y++) {
			for (cell.x = areaTL.x; cell.x <= areaBR.x; cell.x++) {
				if (cell.x < 0 || cell.y < 0
					|| cell.x >= grid.length || cell.y >= grid[cell.x].length
					|| grid[cell.x][cell.y] != 0) {
					let near = new Vector(
						Math.max(cell.x, Math.min(potentialPosition.x, cell.x + 1))
						,Math.max(cell.y, Math.min(potentialPosition.y, cell.y + 1))
					);
					let rayToNear = near.sub(potentialPosition);
					if (rayToNear.x == 0 && rayToNear.y == 0) {
						return true;
					} else {
						let overlap = ball.radius - rayToNear.mag();
						if (!isNaN(overlap) && overlap > 0) {
							return true;
						}
					}
				}
			}
		}
		return false;
	};
};

/******************************************************************************
Ray Casting
******************************************************************************/

function dda(rayOrigin, rayDir, searchDistance, grid) {
	let rayNorm = rayDir.normalize();
	let rayUnitStepSize = new Vector(
		Math.sqrt(1 + ((rayNorm.y / rayNorm.x) * (rayNorm.y / rayNorm.x)))
		,Math.sqrt(1 + ((rayNorm.x / rayNorm.y) * (rayNorm.x / rayNorm.y)))
	);
	let mapCheck = new Vector(
		Math.floor(rayOrigin.x)
		,Math.floor(rayOrigin.y)
	);
	let rayLength = new Vector(0, 0);
	let step = new Vector(0, 0);
	// Starting Condition Check, prime ray length
	if (rayNorm.x < 0) {
		step.x = -1;
		rayLength.x = (rayOrigin.x - mapCheck.x) * rayUnitStepSize.x;
	} else {
		step.x = 1;
		rayLength.x = (mapCheck.x + 1 - rayOrigin.x) * rayUnitStepSize.x;
	}
	if (rayNorm.y < 0) {
		step.y = -1;
		rayLength.y = (rayOrigin.y - mapCheck.y) * rayUnitStepSize.y;
	} else {
		step.y = 1;
		rayLength.y = (mapCheck.y + 1 - rayOrigin.y) * rayUnitStepSize.y;
	}
	let tileFound = false;
	let dist = 0;
	while(!tileFound && dist < searchDistance) {
		if (rayLength.x < rayLength.y) {
			mapCheck.x += step.x;
			dist = rayLength.x;
			rayLength.x += rayUnitStepSize.x;
		} else {
			mapCheck.y += step.y;
			dist = rayLength.y;
			rayLength.y += rayUnitStepSize.y;
		}
		if (mapCheck.x < 0 || mapCheck.y < 0
			|| mapCheck.x >= grid.length || mapCheck.y >= grid[mapCheck.x].length
			|| grid[mapCheck.x][mapCheck.y] != 0) {
			tileFound = true;
		}
	}
	if (tileFound && dist < searchDistance) {
		return rayOrigin.add(rayNorm.mul(dist));
	}
	return rayOrigin.add(rayNorm.mul(searchDistance));
}

