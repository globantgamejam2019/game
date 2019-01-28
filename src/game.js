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
var gameTime = 180000;
var minimumWinningScore = 600;
var gameStarted = false;

var phoneRingingImage;
var doorknockImage;

var graphics;
var timerEvent;
var clockSize = 20;

var game = new Phaser.Game(config);
var backgroundMusic;

var loadingText;

function preload() {   

    loadingText = this.add.text(380, 200, "Loading...", { fontSize: '12px', fill: '#fff' });

    this.load.audio('wrong_sound', 'sounds/wrongSound.ogg');
    this.load.audio('background_music', 'sounds/backgroundMusic.ogg');
    this.load.audio('you_win', 'sounds/you_win.ogg');
    this.load.audio('you_lose', 'sounds/you_lose.ogg');
    this.load.audio('PHONE', 'sounds/phoneRing.ogg');
    this.load.audio('DOOR', 'sounds/knockDoor.ogg');

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
    this.load.image('UP', 'assets/up_arrow.png');
    this.load.image('DOWN', 'assets/down_arrow.png');
    this.load.image('LEFT', 'assets/left_arrow.png');
    this.load.image('RIGHT', 'assets/right_arrow.png');
    this.load.image('PHONE', 'assets/phone.png');
    this.load.image('DOOR', 'assets/door.png');
    this.load.image('game_logo', 'assets/logo.png');

    this.load.spritesheet('start_game', 'assets/start_button_basico.png', { frameWidth: 119, frameHeight: 24 });
    this.load.spritesheet('bg_grey', 'assets/background_grey.png', { frameWidth: 840, frameHeight: 420 });
    this.load.spritesheet('tutorial_image', 'assets/tutorial_image.png', { frameWidth: 180, frameHeight: 216 });
    this.load.spritesheet('static_dude', 'assets/static_dude.gif', { frameWidth: 36, frameHeight: 36 });
    this.load.spritesheet('running_left', 'assets/running_left.gif', { frameWidth: 36, frameHeight: 36 });
    this.load.spritesheet('running_right', 'assets/running_right.gif', { frameWidth: 36, frameHeight: 36 });
    this.load.spritesheet('climbing', 'assets/climbing.gif', { frameWidth: 36, frameHeight: 36 });
    this.load.spritesheet('x_pressed', 'assets/press_x_key.png', { frameWidth: 20, frameHeight: 20 });
}

function create() {

    backgroundMusic = this.sound.add('background_music');
    backgroundMusic.volume = 0.25;
    backgroundMusic.play();

    this.add.image(420, 210, 'background');

    this.add.image(221, 102, 'tasks_bathroom');
    this.add.image(540, 102, 'tasks_bedroom');
    this.add.image(334, 229, 'tasks_kitchen');
    this.add.image(638, 236, 'tasks_living');

    phoneRingingImage = this.add.image(693, 125, 'PHONE');
    //phoneRingingImage.visible = false;

    doorknockImage = this.add.image(767, 240, 'DOOR');
    //doorknockImage.visible = false;

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

    timerEvent = this.time.addEvent({ delay: gameTime, callback: timesUp, callbackScope: this });
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

    this.anims.create({
        key: 'pressed',
        frames: this.anims.generateFrameNumbers('x_pressed', { start: 0, end: 1 }),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'pushing_start',
        frames: this.anims.generateFrameNumbers('start_game', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: 1
    });

    cursors = this.input.keyboard.createCursorKeys();
    xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.physics.add.collider(player, platforms);

    scoreText = this.add.text(750, 16, "Score: " + globalScore, { fontSize: '12px', fill: '#fff' });

    backgroundGrey = this.physics.add.sprite(420, 210, 'bg_grey');
    backgroundGrey.body.allowGravity = false;
    backgroundGrey.visible = true;

    buttonPlay = this.physics.add.sprite(414, 300, 'start_game');
    buttonPlay.body.allowGravity = false;
    buttonPlay.visible = true;

    tutorialImage = this.physics.add.sprite(220, 200, 'tutorial_image');
    tutorialImage.body.allowGravity = false;

    gameLogo = this.physics.add.sprite(415, 150, 'game_logo');
    gameLogo.body.allowGravity = false;

    programmers = this.add.text(200, 370, "Programming: Lucas Astor, Sebastián Uriarte, Bruno Cattáneo", { fontSize: '12px', fill: '#fff' });
    designers = this.add.text(200, 385, "Art: Juan Fernández, Ramiro Nieto", { fontSize: '12px', fill: '#fff' });
}

function timesUp() {
    if (globalScore >= minimumWinningScore) {
        this.add.image(420, 210, 'you_won');
        this.sound.add('you_win').play();
    }
    else {
        this.add.image(420, 210, 'you_lost');
        this.sound.add('you_lose').play();
    }
    gameOver = true;
    backgroundMusic.stop();
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
    updateActivitiesGraphics();
    updateEventsGraphics();

    if (usingLadder && player.y <= 170) {
        usingLadder = false;
        player.body.allowGravity = true;
    }

    if (cursors.left.isDown && !usingLadder && !activityIsActive() && gameStarted) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        lastMovement = "LEFT";
    }
    else if (cursors.right.isDown && !usingLadder && !activityIsActive() && gameStarted) {
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

    if (cursors.up.isDown && !activityIsActive() && gameStarted &&
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

    if (gameStarted) {
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

        if (Phaser.Input.Keyboard.JustDown(xKey)) {
            xWasPressed();
            timeKeyPressingStarted = Date.now();
        }
        if (!xKey.isDown) {
            clearEventCompletionTimer();
        }
    }

    if (Phaser.Input.Keyboard.JustDown(zKey)) {
        if (gameStarted) {

            zWasPressed();
        }
        else {
            buttonPlay.anims.play('pushing_start', true);
            gameStarted = true;
            startEvents(this);
            tutorialImage.destroy();
            gameLogo.destroy();
            buttonPlay.destroy();
            backgroundGrey.destroy();
            programmers.destroy();
            designers.destroy();
        }
    }
}

function updateActivitiesGraphics() {
    graphics.fillStyle((decayingRooms["BATHROOM"] ? 0xff0000 : 0x00ff00), 1);
    graphics.fillRect(200, 111, percentageToProgress(decayingRooms["BATHROOM"]), 5);

    graphics.fillStyle((decayingRooms["BEDROOM"] ? 0xff0000 : 0x00ff00), 1);
    graphics.fillRect(519, 111, percentageToProgress(decayingRooms["BEDROOM"]), 5);

    graphics.fillStyle((decayingRooms["KITCHEN"] ? 0xff0000 : 0x00ff00), 1);
    graphics.fillRect(313, 238, percentageToProgress(decayingRooms["KITCHEN"]), 5);

    graphics.fillStyle((decayingRooms["LIVING"] ? 0xff0000 : 0x00ff00), 1);
    graphics.fillRect(617, 245, percentageToProgress(decayingRooms["LIVING"]), 5);
}

function updateEventsGraphics() {
    for (i = 0; i < randomEvents.length; i++) {
        updateGraphicsForEvent(randomEvents[i]);
    }
}

function updateGraphicsForEvent(event) {
    const eventIsActive = activeRandomEvents[event];
    const coordinates = getCoordinatesForBarAndShowIcon(event, eventIsActive);
    if (eventIsActive) {
        const eventIsBeingAddressed = event === getAssociatedEventForPlayerPosition() &&
            xKey.isDown;
        if (eventIsBeingAddressed) {
            graphics.fillStyle(0x00ff00, 1);
            const progress = (Date.now() - timeKeyPressingStarted) / eventCompletionTimeRequired;
            const percentage = percentageToProgress(progress * 100);
            graphics.fillRect(coordinates[0], coordinates[1], percentage, 5);
        } else {
            graphics.fillStyle(0xff0000, 1);
            const percentage = percentageToProgress(activeRandomEvents[event]);
            console.log(percentage);
            graphics.fillRect(coordinates[0], coordinates[1], percentage, 5);
        }
    }
}

function getCoordinatesForBarAndShowIcon(event, eventIsActive) {
    switch (event) {
        case 'PHONE':
            phoneRingingImage.visible = eventIsActive;
            return [672, 134];
        case 'DOOR':
            doorknockImage.visible = eventIsActive;
            return [746, 249];
        default:
            throw "Unknown coordinates for given event."
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
        ((x >= 484 && x <= 512) || (x >= 267 && x <= 294)));
}

function percentageToProgress(percentage) {
    if (percentage > 100) {
        return 0;
    }
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