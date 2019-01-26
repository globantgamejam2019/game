var globalScore;

let pointTickTime = 2000;
let orderedPointAddition = 10;
let unorderedPointSubstraction = 20;

let minimumRoomState = 0;
let maximumRoomState = 100;
let startingRoomState = maximumRoomState;

let decaySelectionTime = 3000;

let decayTickTime = 100;
let decayTickValue = 0.12;

let keySpamIncrease = 0.7;

let possibleKeys = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
let amountOfKeystrokesRequired = 6;
var requiredKeys;
var wrongSound;

var isSpammingActivityActive = false;
var isKeyPressingActivityActive = false;

let rooms = ["BATHROOM", "BEDROOM", "KITCHEN", "LIVING"]

let decayingRooms = {}

Array.prototype.randomElement = function () {
    return this[Math.floor((Math.random() * this.length))];
}

function startEvents(gameObject) {
    game = gameObject
    game.sound.add('wrong_sound');
    startRoomDecayTimers();
}

function startRoomDecayTimers() {
    setInterval(pickRoomToDecay, decaySelectionTime);
    setInterval(decayRooms, decayTickTime);
    setInterval(calculatePointVariation, pointTickTime);
}

function pickRoomToDecay() {
    let undecayingRooms = rooms.filter(
        x => !Object.keys(decayingRooms).includes(x));
    let roomToDecay = undecayingRooms.randomElement();
    if (roomToDecay) {
        decayingRooms[roomToDecay] = startingRoomState;
    }
    console.log(decayingRooms);
}

function decayRooms() {
    for (const room in decayingRooms) {
        let newValue = Math.max(minimumRoomState,
            decayingRooms[room] - decayTickValue);
        decayingRooms[room] = newValue;
    }
}

function calculatePointVariation() {
    let decayingRoomsCount = 0;
    let roomCount = rooms.length;
    for (const room in decayingRooms) {
        if (decayingRooms[room] === maximumRoomState) {
            globalScore += orderedPointAddition;
        } else if (decayingRooms[room] === minimumRoomState) {
            globalScore -= unorderedPointSubstraction;
        }
        decayingRoomsCount += 1;
    }
    globalScore += (roomCount - decayingRoomsCount) * orderedPointAddition;
}

function startMaintenanceActivity() {
    let random = Math.random() >= 0.4;
    if (random) {
        isSpammingActivityActive = true;
    } else {
        fillRequiredKeystrokesArray();
        isKeyPressingActivityActive = true;
    }
}

function xWasPressed() {
    if (isSpammingActivityActive) {
        decayingRooms[currentRoom] = Math.min(maximumRoomState,
            decayingRooms[currentRoom] + keySpamIncrease);
        if (decayingRooms[currentRoom] === maximumRoomState) {
            removeActiveRoomFromDecay();
            isSpammingActivityActive = false;
        }
    }
}

function fillRequiredKeystrokesArray() {
    requiredKeys = [];
    for (i = 0; i < amountOfKeystrokesRequired; i++) {
        requiredKeys[i] = possibleKeys.randomElement();
    }
    // TODO: Show Icons On Screen. Possibly load array of sprites.
}

function cursorWasPressed(keyName) {
    if (isKeyPressingActivityActive) {
        if (keyName === requiredKeys[0]) {
            requiredKeys.shift();
            //TODO Remove first Icon from Screen. Possibly Shift other array too. Reorganize the position of others?
            if (requiredKeys.length === 0) {
                removeActiveRoomFromDecay();
                isKeyPressingActivityActive = false;
            }
        } else {
            game.sound.play('wrong_sound');
            fillRequiredKeystrokesArray();
        }
    }
}

function removeActiveRoomFromDecay() {
    delete decayingRooms[currentRoom];
}

function zWasPressed() {
    if (activityIsActive()) {
        endAllActivities();
    } else if (decayingRooms.hasOwnProperty(currentRoom)) {
        startMaintenanceActivity();
    } else {
        game.sound.play('wrong_sound');
    }
}

function activityIsActive() {
    return isSpammingActivityActive || isKeyPressingActivityActive;
}

function endAllActivities() {
    isSpammingActivityActive = false;
    isKeyPressingActivityActive = false;
    requiredKeys = [];
}

if (!Object.keys) Object.keys = function (o) {
    if (o !== Object(o))
        throw new TypeError('Object.keys called on non-object');
    var ret = [], p;
    for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) ret.push(p);
    return ret;
}