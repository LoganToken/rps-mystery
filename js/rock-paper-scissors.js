let level = levels[1];
const MAX_LEVEL = 10;

const score = {
	wins: 0,
	losses: 0,
	ties: 0,
	streak: 0,
	winrate: 0
}

const gameState = {
	turn: 1,
	'player-choices': [],
	'computer-choices': []
}

// Initialize
updateDisplay();

// This is the main game loop
function playGame(playerChoice) {
	const computerChoice = makeComputerChoice();
	const outcome = determineOutcome(playerChoice, computerChoice);
	updateGameState(playerChoice, computerChoice);	
	updateScore(outcome);
	console.log(outcome);
	if (checkWinCondition()) {
		console.log('Level Completed!');
		nextLevel();
	}
}

// this will be different for each stage
function makeComputerChoice() {
	return level.choice(gameState);
}

// returns 'win', 'tie', or 'loss'
function determineOutcome(playerChoice, computerChoice) {

	const rockOutcomes = {
		rock: 'tie',
		paper: 'loss',
		scissors: 'win'
	}

	const paperOutcomes = {
		rock: 'win',
		paper: 'tie',
		scissors: 'loss'
	}

	const scissorsOutcomes = {
		rock: 'loss',
		paper: 'win',
		scissors: 'tie'
	}

	const outcomes = {
		rock: rockOutcomes,
		paper: paperOutcomes,
		scissors: scissorsOutcomes
	}

	return outcomes[playerChoice][computerChoice];
}

function updateScore(outcome) {
	if (outcome === 'win') {
		score.wins += 1;
		score.streak += 1;
	} else if (outcome === 'loss') {
		score.losses += 1;
		score.streak = 0;
	} else if (outcome === 'tie') {
		score.ties += 1;
		score.streak = 0;
	}

	const untiedGames = score.wins + score.losses;
	score.winrate = score.wins / untiedGames || 0;

	updateDisplay();
}

function displayScore() {
	$('#wins-display').html(`Wins: ${score.wins}`);
	$('#losses-display').html(`Losses: ${score.losses}`);
	$('#ties-display').html(`Ties: ${score.ties}`);
	$('#streak-display').html(`Win Streak: ${score.streak}`);

	const roundedWinRate = Math.floor(score.winrate * 100);
	$('#winrate-display').html(`Win Rate: ${roundedWinRate}%`);
}

function displayLevelInfo() {
	$('#level-number').html(`LEVEL: ${level.level}`);
	$('#win-condition').html(makeWinConditionString());
	$('#status-message').html(makeStatusMessage());
}

function makeWinConditionString() {
	const winCondition = level['win-condition'];
	const metric = getMetricString(winCondition.metric);
	let requiredValue = winCondition.value;
	if (metric === 'win rate') {
		requiredValue *= 100;
		requiredValue += '%';
	}
	const requiredMoves = winCondition['minimum-turns'];
	const winConditionString = `Achieve a ${metric} of ${requiredValue} in at least ${requiredMoves} moves.`;
	return winConditionString;
}

function makeStatusMessage() {
	if (gameState.turn === 1) {
		if (level.level === 1) {
			return 'Select Rock, Paper, or Scissors to being.'
		}

		return `Congratulations on clearing level ${level.level - 1}!`;
	}

	const playerChoice = gameState['player-choices'].slice(-1)[0];
	const computerChoice = gameState['computer-choices'].slice(-1)[0];
	const outcome = determineOutcome(playerChoice, computerChoice);
	const pastTenseOutcome = getOutcomePastTense(outcome);
	const statusMessage = `You ${pastTenseOutcome}! You selected ${playerChoice} and the agent selected ${computerChoice}.`;
	return statusMessage;
}

function getOutcomePastTense(outcome) {
	const pastTenses = {
		win: 'won',
		loss: 'lost',
		tie: 'tied'
	};

	return pastTenses[outcome];
}

function updateDisplay() {
	displayScore();
	displayLevelInfo();
}

function updateGameState(playerChoice, computerChoice) {
	gameState.turn += 1;
	gameState['player-choices'].push(playerChoice);
	gameState['computer-choices'].push(computerChoice);
}

function resetScore() {
	score.wins = 0;
	score.losses = 0;
	score.ties = 0;
	score.streak = 0;
	score.winrate = 0;
}

function resetGameState() {
	gameState.turn = 1;
	gameState['player-choices'] = [];
	gameState['computer-choices'] = [];
}

function resetLevel() {
	resetScore();
	resetGameState();
	updateDisplay();
}

function loadLevel(levelNumber) {
	level = levels[levelNumber];
	resetLevel();
}

function checkWinCondition() {
	const winCondition = level['win-condition'];

	if (gameState.turn <= winCondition['minimum-turns']) {
		return false;
	}

	let metric = '';
	if (winCondition.metric === 'streak') {
		metric = score.streak;
	} else if (winCondition.metric === 'winrate') {
		metric = score.winrate;
	}

	const requiredValue = winCondition.value;
	if (metric >= requiredValue) {
		return true;
	}

	return false;
}

function nextLevel() {
	const levelNumber = level.level;
	if (levelNumber === MAX_LEVEL) {
		console.log("Game End");
		$('#level-number').html('GAME END');
		alert('Congratulations, you have cleared all 10 levels!');
		return;
	}

	const nextLevelNumber = levelNumber + 1;
	loadLevel(nextLevelNumber);
}

function getMetricString (metricName) {
	if (metricName === 'streak') {
		return 'streak';
	} else if (metricName === 'winrate') {
		return 'win rate';
	}
}