var globalScore = 0;
let timers = [];
let timeouts = [];

const pointTickTime = 2000;
const orderedPointAddition = 10;
const unorderedPointSubstraction = 20;

const minimumRoomState = 0;
const maximumRoomState = 100;
const startingRoomState = 50;
const startingDecayValue = maximumRoomState;

const decaySelectionTime = 4000;

const roomDecayTickTime = 50;
const roomDecayTickValue = 0.25;

const keySpamIncrease = 5;
var xKeyImage;

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

const randomEvents = ["PHONE", "DOOR"];
const eventCoordinates = {
    "PHONE": [685, 710, 150, 195],
    "DOOR": [690, 720, 275, 330]
}
var activeRandomEvents = {};

const startingEventState = 100;
const minimumEventState = 0;
const eventDecayTickTime = 50;
const eventDecayTickValue = 0.35;
const eventPointsModifier = 50;

var eventCompletionTimeout;
const eventCompletionTimeRequired = 3500;

var timeKeyPressingStarted;

let roomDecayInmunityTime = 6000;

Array.prototype.randomElement = function () {
    return this[Math.floor((Math.random() * this.length))];
}

function startEvents(gameObject) {
    game = gameObject
    startRoomDecayTimers();
    startRandomEventTimers();
    pickRoomToDecay(startingRoomState);
}

function startRoomDecayTimers() {
    timers[0] = setInterval(pickRoomToDecay, decaySelectionTime);
    timers[1] = setInterval(decayRooms, roomDecayTickTime);
    timers[2] = setInterval(decayEvents, eventDecayTickTime);
    timers[3] = setInterval(calculatePointVariation, pointTickTime);
}

function startRandomEventTimers() {
    timeouts[0] = setTimeout(startRandomEvent, 30000);
    timeouts[1] = setTimeout(startRandomEvent, 90000);
    timeouts[2] = setTimeout(startRandomEvent, 120000);
    timeouts[3] = setTimeout(startRandomEvent, 160000);
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
            decayingRooms[room] - roomDecayTickValue);
        decayingRooms[room] = newValue;
    }
}

function startRandomEvent() {
    let unstartedEvents = randomEvents.filter(
        x => !Object.keys(activeRandomEvents).includes(x));
    let eventToStart = unstartedEvents.randomElement();
    if (eventToStart) {
        game.sound.play(eventToStart);
        activeRandomEvents[eventToStart] = startingEventState;
    }
}

function decayEvents() {
    for (const event in activeRandomEvents) {
        activeRandomEvents[event] -= eventDecayTickValue;
        if (activeRandomEvents[event] <= minimumEventState) {
            processEventFailure(event);
        }
    }
}

function processEventFailure(event) {
    globalScore -= eventPointsModifier;
    delete activeRandomEvents[event];
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
        showXOnScreen();
        isSpammingActivityActive = true;
    } else {
        fillRequiredKeystrokesArray();
        isKeyPressingActivityActive = true;
    }
}

function xWasPressed() {
    eventCompletionTimer = setTimeout(processEventCompletion, eventCompletionTimeRequired);
    if (isSpammingActivityActive) {
        decayingRooms[currentRoom] = Math.min(maximumRoomState,
            decayingRooms[currentRoom] + keySpamIncrease);
        if (decayingRooms[currentRoom] === maximumRoomState) {
            removeActiveRoomFromDecay();
            xKeyImage.destroy();
            isSpammingActivityActive = false;
        }
    }
}

function processEventCompletion() {
    const event = getAssociatedEventForPlayerPosition();
    if (event && activeRandomEvents[event]) {
        globalScore += eventPointsModifier;
        delete activeRandomEvents[event];
    }
}

function clearEventCompletionTimer() {
    clearTimeout(eventCompletionTimeout);
    eventCompletionTimeout = null;
    timeKeyPressingStarted = null;
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
    }, roomDecayInmunityTime);
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
    clearKeyImages();
    if (xKeyImage) {
        xKeyImage.destroy();
    }
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
    for (i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
}

function showXOnScreen() {
    let startingX = player.x;
    let yPosition = player.y - 28;
    xKeyImage = game.add.sprite(startingX, yPosition, 'x_pressed');
    xKeyImage.anims.play('pressed', true);
}

function getAssociatedEventForPlayerPosition() {
    for (const event in eventCoordinates) {
        const coordinates = eventCoordinates[event];
        const minimumX = coordinates[0];
        const maximumX = coordinates[1];
        const minimumY = coordinates[2];
        const maximumY = coordinates[3];
        if (valueIsBetween(player.x, minimumX, maximumX) &&
            valueIsBetween(player.y, minimumY, maximumY)) {
            return event;
        }
    }
    return null;
}

function valueIsBetween(value, minimum, maximum) {
    return minimum <= value && value <= maximum;
}

if (!Object.keys) Object.keys = function (o) {
    if (o !== Object(o))
        throw new TypeError('Object.keys called on non-object');
    var ret = [], p;
    for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) ret.push(p);
    return ret;
}