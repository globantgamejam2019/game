var globalScore = 0;
let timers = [];

const pointTickTime = 2000;
const orderedPointAddition = 10;
const unorderedPointSubstraction = 20;

const minimumRoomState = 0;
const maximumRoomState = 100;
const startingRoomState = 50;
const startingDecayValue = maximumRoomState;

const decaySelectionTime = 4000;

const decayTickTime = 50;
const decayTickValue = 0.25;

const keySpamIncrease = 5;

const possibleKeys = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
const amountOfKeystrokesRequired = 6;
var requiredKeys = [];
var requiredKeyImages = [];
var wrongSound;

var isSpammingActivityActive = false;
var isKeyPressingActivityActive = false;

const keyImageSize = 20;
const separationBetweenShownKeys = 24;
const heightOfKeyImagesAbovePlayer = 25;

const rooms = ["BATHROOM", "BEDROOM", "KITCHEN", "LIVING"]
var decayingRooms = {}
var lastRemovedRoom;

var xkeyImage;

Array.prototype.randomElement = function () {
    return this[Math.floor((Math.random() * this.length))];
}

function startEvents(gameObject) {
    game = gameObject
    game.sound.add('wrong_sound');
    startRoomDecayTimers();
    pickRoomToDecay(startingRoomState);
}

function startRoomDecayTimers() {
    timers[0] = setInterval(pickRoomToDecay, decaySelectionTime);
    timers[1] = setInterval(decayRooms, decayTickTime);
    timers[2] = setInterval(calculatePointVariation, pointTickTime);
}

function pickRoomToDecay(value = startingDecayValue) {
    let undecayingRooms = rooms.filter(
        x => !Object.keys(decayingRooms).includes(x) && x !== lastRemovedRoom);
    let roomToDecay = undecayingRooms.randomElement();
    if (roomToDecay) {
        decayingRooms[roomToDecay] = value;
    }
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
    let random = Math.random() >= 0.5;
    if (random) {
        showXonScreen();
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
            xkeyImage.destroy();
            isSpammingActivityActive = false;
        }
    }
}

function fillRequiredKeystrokesArray() {
    clearKeyImages();
    for (i = 0; i < amountOfKeystrokesRequired; i++) {
        requiredKeys[i] = possibleKeys.randomElement();
    }
    showCorrespondingKeysOnScreen();
}

function showCorrespondingKeysOnScreen() {
    let totalSpace = amountOfKeystrokesRequired * keyImageSize;
    let startingX = player.x - (totalSpace / 2);
    let yPosition = player.y - heightOfKeyImagesAbovePlayer;
    for (i = 0; i < requiredKeys.length; i++) {
        let keyImage = game.add.image(startingX, yPosition, requiredKeys[i]);
        requiredKeyImages.push(keyImage)
        startingX += separationBetweenShownKeys;
    }
}
function showXonScreen(){
    let totalSpace = keyImageSize - 10;
    let startingX = player.x - (totalSpace / 2);
    let yPosition = player.y - 28;
    xkeyImage = game.add.sprite(startingX, yPosition, 'x_pressed');
    xkeyImage.anims.play('pressed', true);
}

function cursorWasPressed(keyName) {
    if (isKeyPressingActivityActive) {
        if (keyName === requiredKeys[0]) {
            requiredKeys.shift();
            let keyImage = requiredKeyImages.shift();
            keyImage.destroy();
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
    lastRemovedRoom = currentRoom
    setTimeout(function () {
        lastRemovedRoom = null;
    }, 6000);
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
    xkeyImage.destroy();
    clearKeyImages();
}

function clearKeyImages() {
    for (i = 0; i < requiredKeyImages.length; i++) {
        requiredKeyImages[i].destroy();
    }
    requiredKeyImages = [];
}

function clearAllTimers() {
    for (i = 0; i < timers.length; i++) {
        clearInterval(timers[i]);
    }
}

if (!Object.keys) Object.keys = function (o) {
    if (o !== Object(o))
        throw new TypeError('Object.keys called on non-object');
    var ret = [], p;
    for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) ret.push(p);
    return ret;
}