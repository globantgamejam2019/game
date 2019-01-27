// Phaser configuration
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

// Global variables
var player;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var lastMovement = "";
var currentRoom = "LIVING";
var usingLadder = false;

// Clock related globals
var graphics;
var timerEvent;
var clockSize = 20;

// Game
var game = new Phaser.Game(config);

// Preload all assets
function preload ()
{
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
}

// Create game canvas
function create ()
{
    // Add house on the background
    this.add.image(420, 210, 'background');

    // Platforms
    platforms = this.physics.add.staticGroup();

    // Create all ledges
    platforms.create(414, 328, 'first_floor');
    platforms.create(172, 201, 'second_floor_1');
    platforms.create(389, 201, 'second_floor_2');
    platforms.create(630, 201, 'second_floor_3');
    platforms.create(414, 65, 'ceiling');
    platforms.create(97, 193, 'wall');
    platforms.create(728, 193, 'wall');
    platforms.create(363, 105, 'open_wall');
    platforms.create(433, 238, 'open_wall');

    // The player and its settings
    player = this.physics.add.sprite(670, 220, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
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

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);

    // Create clock related objects
    timerEvent = this.time.addEvent({ delay: 60000, callback: timesOut, callbackScope: this });
    graphics = this.add.graphics({ x: 0, y: 0 });

}

// Function called after main timer ran out of time
function timesOut()
{
    //this.add.image(420, 210, 'you_won');
    this.add.image(420, 210, 'you_lost');

    // Set gameover flag
    gameOver = true;
    
    // Change player's color to grey
    player.setTint(0x555555);

    // Stop player movement
    player.setVelocityX(0);

    // Set last movement frame
    if (lastMovement == "RIGHT")
    {
        player.anims.play('static_right', true);
    }
    else
    {
        player.anims.play('static_left', true);
    }
}

// Main update function
function update ()
{

    // Get current room
    currentRoom = getCurrentRoom(player.x, player.y);

    // Return if player already lost the game
    if (gameOver)
    {
        return;
    }

    // Update clock if game is still running
    graphics.clear();
    drawClock(40, 40, timerEvent);

    // Currently using ladder
    if (usingLadder && player.y <= 170)
    {
        usingLadder = false;
        player.body.allowGravity = true;
    }

    // Actions on key press
    if (cursors.left.isDown && !usingLadder)
    {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        lastMovement = "LEFT";
    }
    else if (cursors.right.isDown && !usingLadder)
    {
        player.setVelocityX(160);
        player.anims.play('right', true);
        lastMovement = "RIGHT";
    }
    else
    {
        player.setVelocityX(0);
        if (lastMovement == "RIGHT")
        {
            player.anims.play('static_right', true);
        }
        else
        {
            player.anims.play('static_left', true);
        }
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        if (useLadder(player.x, player.y))
        {
            usingLadder = true;
            player.body.allowGravity = false;
            player.setVelocityY(-80);
        }
        else
        {
            usingLadder = false;
            player.body.allowGravity = true;
            player.setVelocityY(-330);
        }
    }
}

// Returns current room based on (x,y) players location
function getCurrentRoom(x, y)
{
    let room = "";
    if (y > 176 && y <= 309)
    {
        // First floor
        if (x >= 435)
        {
            room = "LIVING";
        }
        else
        {
            room = "KITCHEN";
        }
    }
    else
    {
        // Second floor
        if (x >= 366)
        {
            room = "BEDROOM";
        }
        else
        {
            room = "BATHROOM";
        }
    }
    return room;
}

// Returns true if player is able to use the ladder
function useLadder(x, y)
{
    if (y > 179 && y <= 309)
    {
        if ((x >=478 && x<=512) || (x>=267 && x<=294))
        {
            return true;
        }
    }
    return false;
}