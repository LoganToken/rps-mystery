const levels = [];

levels[0] = {
	level: 0,
	'win-condition': {
		metric: 'streak',
		value: 10,
		'minimum-turns': 10
	},
	choice: function() {
		// random RPS
		return 'rock';
	}
};

levels[1] = {
	level: 1,
	'win-condition': {
		metric: 'streak',
		value: 10,
		'minimum-turns': 10
	},
	choice: function() {
		// Always chooses rock
		return 'rock';
	}
};

levels[2] = {
	level: 2,
	'win-condition': {
		metric: 'streak',
		value: 10,
		'minimum-turns': 10
	},
	choice: function(gameState) {
		// Always chooses in order rock -> scissors -> paper -> loop
		const turnNumber = gameState.turn;
		if (turnNumber % 3 === 0) {
			return 'rock';
		} else if (turnNumber % 3 === 1) {
			return 'scissors';
		} else if (turnNumber % 3 === 2) {
			return 'paper';
		}
	}
};

levels[3] = {
	level: 3,
	'win-condition': {
		metric: 'streak',
		value: 10,
		'minimum-turns': 10
	},
	choice: function(gameState) {
		// Always chooses your last move, except the first turn
		if (gameState['player-choices'].length === 0) {
			return makeRandomChoice();
		}

		return gameState['player-choices'].slice(-1)[0];
	}
};

levels[4] = {
	level: 4,
	'win-condition': {
		metric: 'streak',
		value: 10,
		'minimum-turns': 10
	},
	choice: function(gameState) {
		// Always chooses the move that beats your last move, except the first turn
		if (gameState['player-choices'].length === 0) {
			return makeRandomChoice();
		}

		const lastPlayerMove = gameState['player-choices'].slice(-1)[0];
		const choice = beatsMove(lastPlayerMove);
		return choice;
	}
};

levels[5] = {
	level: 5,
	'win-condition': {
		metric: 'winrate',
		value: 0.75,
		'minimum-turns': 15
	},
	choice: function(gameState) {
		// Prefers Paper
		return makeRandomChoice(0.15, 0.7, 0.15);
	}
};

levels[6] = {
	level: 6,
	'win-condition': {
		metric: 'winrate',
		value: 0.8,
		'minimum-turns': 15
	},
	choice: function(gameState) {
		// Prefers what it last picked
		if (gameState['player-choices'].length === 0) {
			return makeRandomChoice();
		}
		
		let rockWeight = 0.15;
		let paperWeight = 0.15;
		let scissorsWeight = 0.15;
		const lastChoice = gameState['computer-choices'].slice(-1)[0];
		if (lastChoice === 'rock') {
			rockWeight = 0.7;
		} else if (lastChoice === 'paper') {
			paperWeight = 0.7;
		} else if (lastChoice === 'scissors') {
			scissorsWeight = 0.7;
		}
		return makeRandomChoice(rockWeight, paperWeight, scissorsWeight);
	}
};

levels[7] = {
	level: 7,
	'win-condition': {
		metric: 'streak',
		value: 10,
		'minimum-turns': 10
	},
	choice: function(gameState) {
		// Cycles a random sequence of 5 moves
		if (gameState['computer-choices'].length < 5) {
			return makeRandomChoice();
		}

		return gameState['computer-choices'][gameState.turn - 6];
	}
};

levels[8] = {
	level: 8,
	'win-condition': {
		metric: 'winrate',
		value: 0.9,
		'minimum-turns': 15
	},
	choice: function(gameState) {
		// switch -> stay -> switch -> stay
		if (gameState['computer-choices'].length === 0) {
			return makeRandomChoice();
		}

		const lastComputerMove = gameState['computer-choices'].slice(-1)[0];
		if (gameState.turn % 2 === 1) {
			// reused code, figure out how to refactor
			let rockWeight = 0.5;
			let paperWeight = 0.5;
			let scissorsWeight = 0.5;
			if (lastComputerMove === 'rock') {
				rockWeight = 0;
			} else if (lastComputerMove === 'paper') {
				paperWeight = 0;
			} else if (lastComputerMove === 'scissors') {
				scissorsWeight = 0;
			}
			return makeRandomChoice(rockWeight, paperWeight, scissorsWeight);
		} else if (gameState.turn % 2 === 0) {
			return lastComputerMove;
		}
	}
};

levels[9] = {
	level: 9,
	'win-condition': {
		metric: 'streak',
		value: 10,
		'minimum-turns': 10
	},
	choice: function(gameState) {
		// copies your move from 5 moves ago
		if (gameState['player-choices'].length < 5) {
			return makeRandomChoice();
		}

		return gameState['player-choices'][gameState.turn - 6];
	}
};

levels[10] = {
	level: 10,
	'win-condition': {
		metric: 'streak',
		value: 15,
		'minimum-turns': 15
	},
	choice: function(gameState) {
		// beats your most common move
		if (gameState['player-choices'].length === 0) {
			return makeRandomChoice();
		}

		const frequencies = countCopies(gameState['player-choices']);
		const numRock = frequencies.rock || 0;
		const numPaper = frequencies.paper || 0;
		const numScissors = frequencies.scissors || 0;
		const maxFrequency = Math.max(numRock, numPaper, numScissors);

		const rockWeight = (numRock === maxFrequency) ? 1 : 0;
		const paperWeight = (numPaper === maxFrequency) ? 1 : 0;
		const scissorsWeight = (numScissors === maxFrequency) ? 1 : 0;

		const predictedMove = makeRandomChoice(rockWeight, paperWeight, scissorsWeight);
		return beatsMove(predictedMove);
	}
};

function makeRandomChoice(rockWeight = 1/3, paperWeight = 1/3, scissorsWeight = 1/3) {
	const normalizedWeights = normalizeValues([rockWeight, paperWeight, scissorsWeight]);

	const firstCutoff = normalizedWeights[0];
	const secondCutoff = firstCutoff + normalizedWeights[1]
	const randomNumber = Math.random();
	let choice = '';

	if (randomNumber >= 0 && randomNumber < firstCutoff) {
		choice = 'rock';
	} else if (randomNumber >= firstCutoff && randomNumber < secondCutoff) {
		choice = 'paper';
	} else if (randomNumber >= secondCutoff) {
		choice = 'scissors';
	}

	return choice;
}

function beatsMove(move) {
	if (move === 'rock') {
		return 'paper';
	} else if (move === 'paper') {
		return 'scissors';
	} else if (move === 'scissors') {
		return 'rock';
	}
}

function countCopies(moves) {
	const counts = {};
	moves.forEach( function (x) {
		counts[x] = (counts[x] || 0) + 1;
	});
	return counts;
}

function normalizeValues(values) {
	let sum = 0;
	values.forEach( function (x) {
		sum += x;
	});
	
	if (sum === 0) {
		return values;
	}

	let normalizedValues = [];
	values.forEach( function (x) {
		normalizedValues.push(x/sum);
	});
	return normalizedValues;
}