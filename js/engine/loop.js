class Loop {
	constructor(updateLoop) {
		this.id = 0;
		this.now = performance.now();
		this.last = this.now;
		this.elapsed = 0;
		this.elapsedTime = 0;
		this.fps = 0;
		this.elapsedList = [];
		this.updateLoop = updateLoop;
	};
	reset() {
		this.now = performance.now();
		this.elapsed = 0;
		this.last = this.now;
		this.elapsedTime = 0;
	};
	start() {
		this.now = performance.now();
		this.elapsed = 0;
		this.elapsedList = [];
		this.fps = 0;
		this.last = this.now;
		this.id = window.requestAnimationFrame( () => this.updater() );
	};
	stop() {
		window.cancelAnimationFrame(this.id);
	};
	updater() {
		this.id = window.requestAnimationFrame( () => this.updater() );
		this.now = performance.now();
		this.elapsed = this.now - this.last;
		this.elapsedTime += this.elapsed;
		this.last = this.now;
		this.updateFPS(this.elapsed);
		this.updateLoop();
	};
	updateFPS(currentElapsed) {
	  this.elapsedList.unshift(currentElapsed);
	  if (this.elapsedList.length > 60) {
	    this.elapsedList.length = 60;
	  }
	  let sum = 0;
	  for (let i = 0; i < this.elapsedList.length; i++) {
	    sum += this.elapsedList[i];
	  }
	  this.fps = Math.round(1000 / (sum / this.elapsedList.length));
	};
};