let level = levels[1];
const MAX_LEVEL = 10;
let START_TIME;

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
loadLevel(1);

// This is the main game loop
function playGame(playerChoice) {
	const computerChoice = makeComputerChoice();
	const outcome = determineOutcome(playerChoice, computerChoice);
	updateGameState(playerChoice, computerChoice);	
	updateScore(outcome);
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
	const displayableStats = ['wins', 'losses', 'ties', 'streak'];
	displayableStats.forEach(stat => document.getElementById(`number-${stat}-display`).innerHTML = score[stat]);
	const roundedWinRate = Math.floor(score.winrate * 100);
	document.getElementById(`number-winrate-display`).innerHTML = (roundedWinRate + '%');

	setWinConditionColor();
}

function setWinConditionColor() {
	const winCondition = level['win-condition'];
	const metric = winCondition.metric;
	const requiredValue = winCondition.value;
	const currentValue = score[metric];
	const metricElementId = `number-${metric}-display`;
	const metricColor = getMetricColorGradient(currentValue, requiredValue);
	
	// remove styling on all metrics first
	const possibleMetrics = ['streak', 'winrate'];
	possibleMetrics.forEach(element => document.getElementById(`number-${element}-display`).style.removeProperty('color'));
	document.getElementById(metricElementId).style.color = metricColor;
}

function getMetricColorGradient(currentValue, requiredValue) {
	/*
	If the currentValue is 0, the color is red
	If the currentValue meets or exceeds the requiredValue, the color is green
	Values in between are scaled along a gradient
	(255, 0, 0) -> (255, 255, 0) -> (0, 255, 0)
	*/
	const difference = Math.max(requiredValue - currentValue, 0);
	const scaledDifference = difference / requiredValue || 0;

	const redScale = (scaledDifference >= 0.5) ? 1 : (2 * scaledDifference);
	const redValue = Math.round(255 * redScale);

	const greenScale = (scaledDifference >= 0.5) ? (2 * (1 - scaledDifference)) : 1;
	const greenValue = Math.round(255 * greenScale);
	
	const blueValue = 0;

	return `rgb(${redValue}, ${greenValue}, ${blueValue})`;
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
			return 'Select Rock, Paper, or Scissors to begin.'
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
		handleEnd();
		// alert('Congratulations, you have cleared all 10 levels!');
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

function handleStart() {
	START_TIME = new Date();
	document.getElementById('start-modal').style.display = 'none';
}

function handleEnd() {
	const endTime = new Date();
	const milisecondsTaken = endTime - START_TIME;
	const timeTaken = convertToMinutesAndSeconds(milisecondsTaken);
	const gameOverModalElement = document.getElementById('game-over-modal');

	document.getElementById('game-over-modal').style.display = 'flex';

	const finalTimeString = `Your final time was ${timeTaken.minutes} minutes and ${timeTaken.seconds} seconds.`;
	document.getElementById('final-time-display').innerHTML = finalTimeString;
}

function convertToMinutesAndSeconds(miliseconds) {
	const totalSeconds = Math.round(miliseconds / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return { minutes, seconds};

}