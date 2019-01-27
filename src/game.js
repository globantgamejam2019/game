var config = {
    type: Phaser.AUTO,
    width: 840,
    height: 420,
    parent: "game-canvas",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 750 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var platforms;
var cursors;
var gameOver = false;
var scoreText;
var lastMovement = "";
var currentRoom = "LIVING";
var usingLadder = false;
var xKey;
var gameTime = 70000;
var minimumWinningScore = 300;

var graphics;
var timerEvent;
var clockSize = 20;

var game = new Phaser.Game(config);

function preload() {
    this.load.audio('wrong_sound', 'sounds/wrong_sound.ogg');

    this.load.image('tasks_bathroom', 'assets/tasks_bathroom.png');
    this.load.image('tasks_bedroom', 'assets/tasks_bedroom.png');
    this.load.image('tasks_kitchen', 'assets/tasks_kitchen.png');
    this.load.image('tasks_living', 'assets/tasks_living.png');
    this.load.image('background', 'assets/background.png');
    this.load.image('background_grey', 'assets/background_grey.png');
    this.load.image('you_won', 'assets/won.png');
    this.load.image('you_lost', 'assets/lost.png');
    this.load.image('ceiling', 'assets/ceiling.png');
    this.load.image('second_floor_1', 'assets/second_floor_1.png');
    this.load.image('second_floor_2', 'assets/second_floor_2.png');
    this.load.image('second_floor_3', 'assets/second_floor_3.png');
    this.load.image('first_floor', 'assets/first_floor.png');
    this.load.image('wall', 'assets/wall.png');
    this.load.image('open_wall', 'assets/open_wall.png');
    this.load.spritesheet('static_dude', 'assets/static_dude.gif', { frameWidth: 36, frameHeight: 36 });
    this.load.spritesheet('running_left', 'assets/running_left.gif', { frameWidth: 36, frameHeight: 36 });
    this.load.spritesheet('running_right', 'assets/running_right.gif', { frameWidth: 36, frameHeight: 36 });
    this.load.spritesheet('climbing', 'assets/climbing.gif', { frameWidth: 36, frameHeight: 36 });
    this.load.image('UP', 'assets/up_arrow.png');
    this.load.image('DOWN', 'assets/down_arrow.png');
    this.load.image('LEFT', 'assets/left_arrow.png');
    this.load.image('RIGHT', 'assets/right_arrow.png');
}

function create() {
    this.add.image(420, 210, 'background');

    this.add.image(235, 100, 'tasks_bathroom');
    this.add.image(550, 100, 'tasks_bedroom');
    this.add.image(200, 235, 'tasks_kitchen');
    this.add.image(590, 235, 'tasks_living');

    platforms = this.physics.add.staticGroup();

    platforms.create(414, 328, 'first_floor');
    platforms.create(172, 201, 'second_floor_1');
    platforms.create(389, 201, 'second_floor_2');
    platforms.create(630, 201, 'second_floor_3');
    platforms.create(414, 65, 'ceiling');
    platforms.create(97, 193, 'wall');
    platforms.create(728, 193, 'wall');
    platforms.create(363, 105, 'open_wall');
    platforms.create(433, 238, 'open_wall');

    timerEvent = this.time.addEvent({ delay: gameTime, callback: timesOut, callbackScope: this });
    graphics = this.add.graphics({ x: 0, y: 0 });

    player = this.physics.add.sprite(670, 220, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('running_left', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'static_left',
        frames: this.anims.generateFrameNumbers('static_dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'static_right',
        frames: this.anims.generateFrameNumbers('static_dude', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('running_right', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'climbing',
        frames: this.anims.generateFrameNumbers('climbing', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.physics.add.collider(player, platforms);

    startEvents(this);

    scoreText = this.add.text(760, 16, "Score: " + globalScore, { fontSize: '12px', fill: '#fff' });
}

function timesOut() {
    if (globalScore >= minimumWinningScore) {
        this.add.image(420, 210, 'you_won');
    }
    else {
        this.add.image(420, 210, 'you_lost');
    }
    gameOver = true;
    clearAllTimers();
    player.setTint(0x555555);
    player.setVelocityX(0);
    usingLadder = false;
    player.body.allowGravity = true;
    if (lastMovement == "RIGHT") {
        player.anims.play('static_right', true);
    }
    else {
        player.anims.play('static_left', true);
    }
}

function update() {
    currentRoom = getCurrentRoom(player.x, player.y);
    scoreText.setText("Score: " + globalScore);

    if (gameOver) {
        return;
    }

    graphics.clear();
    drawClock(40, 40, timerEvent);

    graphics.fillStyle((decayingRooms["BATHROOM"] ? 0xff0000 : 0x00ff00), 1);
    graphics.fillRect(214, 109, percentageToProgress(decayingRooms["BATHROOM"]), 5);

    graphics.fillStyle((decayingRooms["BEDROOM"] ? 0xff0000 : 0x00ff00), 1);
    graphics.fillRect(529, 109, percentageToProgress(decayingRooms["BEDROOM"]), 5);

    graphics.fillStyle((decayingRooms["KITCHEN"] ? 0xff0000 : 0x00ff00), 1);
    graphics.fillRect(179, 244, percentageToProgress(decayingRooms["KITCHEN"]), 5);

    graphics.fillStyle((decayingRooms["LIVING"] ? 0xff0000 : 0x00ff00), 1);
    graphics.fillRect(569, 244, percentageToProgress(decayingRooms["LIVING"]), 5);

    if (usingLadder && player.y <= 170) {
        usingLadder = false;
        player.body.allowGravity = true;
    }

    if (cursors.left.isDown && !usingLadder && !activityIsActive()) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        lastMovement = "LEFT";
    }
    else if (cursors.right.isDown && !usingLadder && !activityIsActive()) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        lastMovement = "RIGHT";
    }
    else {
        player.setVelocityX(0);
        if (usingLadder) {
            player.anims.play('climbing', true);
        }
        else if (lastMovement == "RIGHT") {
            player.anims.play('static_right', true);
        }
        else {
            player.anims.play('static_left', true);
        }
    }

    if (cursors.up.isDown && !activityIsActive() &&
        (player.body.touching.down || usingLadder)) {
        if (useLadder(player.x, player.y)) {
            usingLadder = true;
            player.body.allowGravity = false;
            player.setVelocityY(-80);
        }
        else {
            usingLadder = false;
            player.body.allowGravity = true;
            player.setVelocityY(-330);
        }
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
    if (Phaser.Input.Keyboard.JustDown(zKey)) {
        zWasPressed();
    }

    if (Phaser.Input.Keyboard.JustDown(xKey)) {
        xWasPressed();
    } else if (!xKey.isDown) {
        clearEventCompletionTimer();
    }
}

function getCurrentRoom(x, y) {
    if (y > 176 && y <= 309) {
        if (x >= 435) {
            return "LIVING";
        }
        else {
            return "KITCHEN";
        }
    }
    else if (x >= 366) {
        return "BEDROOM";
    }
    else {
        return "BATHROOM";
    }
}

function useLadder(x, y) {
    return (y > 179 && y <= 309 &&
        ((x >= 482 && x <= 512) || (x >= 267 && x <= 294)));
}

function percentageToProgress(percentage) {
    if (!percentage && percentage != 0) {
        return 42;
    }
    else {
        let percentageInt = Math.ceil(percentage);
        if (percentageInt == 100) {
            return 42;
        }
        else {
            return ((percentage * 42) / 100);
        }
    }
}