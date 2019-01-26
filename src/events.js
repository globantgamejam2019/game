var game;
var activeRoom;

let minimumRoomState = 0;
let maximumRoomState = 100;
let startingRoomState = maximumRoomState;

let decayTime = 100;
let decayValue = 0.12;

let keySpamIncrease = 0.7;

let possibleKeys = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
let amountOfKeystrokesRequired = 6;
var requiredKeys;

var isSpammingActivityActive = true;
var isKeyPressingActivityActive = false;

let roomStates = {
    "bathroom": startingRoomState,
    "bedroom": startingRoomState,
    "kitchen": startingRoomState,
    "living": startingRoomState
}

Array.prototype.randomElement = function () {
    return this[Math.floor((Math.random() * this.length))];
}

function startEvents(gameObject) {
    game = gameObject
    startRoomDecayTimers();
    startMaintainanceActivity("bathroom");
}

function startRoomDecayTimers() {
    setInterval(decayRooms, decayTime);
}

function decayRooms() {
    for (const room in roomStates) {
        roomStates[room] = Math.max(minimumRoomState,
            roomStates[room] - decayRooms);
    }
}

function startMaintainanceActivity(room) {
    activeRoom = room;
    // let random = Math.random() >= 0.4;
    let random = false;
    if (random) {
        isSpammingActivityActive = true;
    } else {
        fillRequiredKeystrokesArray();
        isKeyPressingActivityActive = true;
    }
}

function xWasPressed() {
    if (isSpammingActivityActive) {
        roomStates[activeRoom] = Math.min(maximumRoomState,
            roomStates[activeRoom] += keySpamIncrease);
    }
}

function fillRequiredKeystrokesArray() {
    requiredKeys = [];
    for (i = 0; i < amountOfKeystrokesRequired; i++) {
        requiredKeys[i] = possibleKeys.randomElement();
    }
    console.log(requiredKeys);
    //TODO Show Icons On Screen. Possibly load array of sprites.
}

function cursorWasPressed(keyName) {
    if (keyName === requiredKeys[0]) {
        roomStates[activeRoom] = pointsAfterKeystroke();
        requiredKeys.shift();
        console.log(requiredKeys);
        //TODO Remove first Icon from Screen. Possibly Shift other array too. Reorganize the position of others?
    } else {
        
    }
}