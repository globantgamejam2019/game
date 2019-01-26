var game;
var activeRoom;

let decayTime = 100;
let decayValue = 0.12;

let keySpamIncrease = 0.7;

var keysToBePressed;

var isSpammingActivityActive = true;
var isKeyPressingActivityActive = false;

let roomStates = {
    "bathroom": 100,
    "bedroom": 100,
    "kitchen": 100,
    "living": 100
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
        roomStates[room] -= decayValue;
    }
}

function cursorWasPressed(keyName) {
    console.log(keyName);
}

function startMaintainanceActivity(room) {
    activeRoom = room;
    // let random = Math.random() >= 0.4;
    let random = true;
    if (random) {
        isSpammingActivityActive = true;
    } else {
        isKeyPressingActivityActive = true;
    }
}

function xWasPressed() {
    if (isSpammingActivityActive) {
        roomStates[activeRoom] += keySpamIncrease;
    }
}