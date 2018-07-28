class Simulation {
	constructor(canvas) {
		this.canvas = canvas;
		this.stage = canvas.getContext('2d');
		this.animals = [];
		this.time = 0;
		this.interval = null;

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	start(animalCount) {
		console.log('Started simulation');

		// Create inital animals
		for (let i = 0; i < animalCount; i++) {
			this.animals.push(new Animal(
				new Position(random(0, this.canvas.width), random(0, this.canvas.height)),
				RED,
				LIFESPAN,
				REPRODUCTIVE_AGE
			))
		};

		this.interval = setInterval(() => this.stepTime(), TIME_STEP_DELAY);
	}

	stepTime() {
		this.clearStage();

		if (this.animals.length == 0) {
			clearInterval(this.interval);
			return;
		};

		for (const animal of this.animals) {
			animal.increaseAge();
			if (animal.isAlive) {
				this.paint(animal);
			};
		};

		// Remove dead animals
		this.animals = this.animals.filter(x => x.isAlive);
		this.time += 1;
		
		elStats.innerHTML = `Time: ${this.time} <br> Animals: ${this.animals.length}`;
	}

	getAnimalsNearPointCount(x, y, radius) {
		let count = 0;
		for (const animal of this.animals) {
			if (
				Math.abs(animal.position.x - x) <= radius ||
				Math.abs(animal.position.y - y) <= radius) {
				count += 1;
			}
		}
		return count;
	}

	paint(animal) {
		const stage = this.stage;
		stage.beginPath();
		stage.arc(animal.position.x, animal.position.y, 2, 0, 2 * Math.PI);
		stage.fillStyle = animal.color.toString();
		stage.fill();
	}

	clearStage() {
		this.stage.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}


class Animal {
	constructor(position, color, lifespan, reproductiveAge) {
		this.position = position;
		this.color = color;
		this.lifespan = lifespan;
		this.reproductiveAge = reproductiveAge;
		this.age = 0;
		this.isAlive = true;
	}

	increaseAge() {
		this.age += 1;

		if (
			// Decide if animal should die due to natural selectiom
			// In this case, the closer the animal is to red, the greater chance of death
			(this.getDistanceFromHueCenter(this.color.h) >= (random(0, 180) * SELECTION_AGRESSION_DIVIDER)) ||
			
			// Death due to old age
			(this.age >= this.lifespan) ||

			// Greater chance of death as world reaches overpopulation
			(sim.animals.length >= random(POPULATION_LIMIT / 1.5, POPULATION_LIMIT))
			//(sim.getAnimalsNearPointCount(this.position.x, this.position.y, 100) >= 1000000)
		) {
			this.die();
		} else if (this.age == this.reproductiveAge) {
			this.reproduce();
		};
	}

	getDistanceFromHueCenter(hue) {
		return 180 - hue;
	}

	reproduce() {
		for (let i = 0; i < 2; i++) {
			sim.animals.push(new Animal(
				new Position(
					random(this.position.x - POSITION_SPREAD, this.position.x + POSITION_SPREAD),
					random(this.position.y - POSITION_SPREAD, this.position.y + POSITION_SPREAD)),
				new Color(
					random(this.color.h - COLOR_MUTATION_AMOUNT, this.color.h + COLOR_MUTATION_AMOUNT),
					this.color.s,
					this.color.l),
				this.lifespan,
				this.reproductiveAge
			));
		}
	}

	die() {
		this.isAlive = false;
	}
}


/**
 * Represents a HSL color.
 * @constructor
 * @param {int} h - Hue
 * @param {int} s - Saturation
 * @param {int} l - Color
 */
class Color {
	constructor(h, s, l) {
		if (h < 0) {h = 0} else if (h > 360) {h = 360};

		this.h = h; // 0..360
		this.s = s; // 0..1
		this.l = l; // 0..1
	};
	
	/**
	 * Returns a CSS string of this color
	 */
	toString() {
		return `hsl(${this.h}, ${this.s * 100}%, ${this.l * 100}%)`;
	}
}


class Position {
	constructor(x, y) {
		if (x < 0) {x = 0} else if (x > canvas.width) {x = canvas.width};
		if (y < 0) {y = 0} else if (y > canvas.height) {y = canvas.height};
		this.x = x;
		this.y = y;
	}

	getValue() {
		return [this.x, this.y];
	}
}

/**
 * Generates a random integer within a given range (inclusive)
 * @param {int} min 
 * @param {int} max 
 */
function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const LIFESPAN = 10;
const REPRODUCTIVE_AGE = 5;
const TIME_STEP_DELAY = 100;
const SELECTION_AGRESSION_DIVIDER = 7; // Higher value = less aggressive natural selection
const POPULATION_LIMIT = 30000;
const RED = new Color(0, 1, 0.5);
const POSITION_SPREAD = 5;
const COLOR_MUTATION_AMOUNT = 10;
const INITIAL_POPULATION_COUNT = 9000;

const canvas = document.getElementById('canvas');
const elStats = document.getElementById('stats');

let sim = null;
sim = new Simulation(canvas);
sim.start(INITIAL_POPULATION_COUNT);