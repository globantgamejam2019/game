var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var cursors;
var xKey;

function preload() {
    this.load.audio('wrong_sound', 'sounds/wrong_sound.ogg');
}

function create() {
    xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    cursors = this.input.keyboard.createCursorKeys();
    startEvents(this);
}

function update() {
    if (Phaser.Input.Keyboard.JustDown(xKey)) {
        xWasPressed();
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
        cursorWasPressed('LEFT');
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
        cursorWasPressed('RIGHT');
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
        cursorWasPressed('DOWN');
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
        cursorWasPressed('UP');
    }
}