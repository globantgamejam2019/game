// Phaser configuration
var config = {
    type: Phaser.AUTO,
    width: 840,
    height: 420,
    parent: "game-canvas",
    physics: {
        default: 'arcade',
        arcade: {
            //gravity: { y: 750 },
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

// Global variables
var player;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var lastMovement = "";
var currentRoom = "LIVING"; // Starting room

// Clock related globals
var graphics;
var timerEvent;
var clockSize = 20;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('background', 'assets/background.png');
    this.load.image('background_grey', 'assets/background_grey.png');
    this.load.image('you_won', 'assets/won.png');
    this.load.image('you_lost', 'assets/lost.png');
    this.load.image('ceiling', 'assets/ceiling.png');
    //this.load.image('second_floor', 'assets/second_floor.png');
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

function create ()
{

    //console.log("Create");

    // Add house (background)
    this.add.image(420, 210, 'background');

    // Plataformas
    platforms = this.physics.add.staticGroup();

    // Create main ground
    //platforms.create(420, 360, 'ground').setScale(2).refreshBody();

    // Create all ledges
    platforms.create(414, 328, 'first_floor');
    //platforms.create(414, 200, 'second_floor');
    platforms.create(172, 201, 'second_floor_1');
    platforms.create(389, 201, 'second_floor_2');
    platforms.create(630, 201, 'second_floor_3');
    platforms.create(414, 65, 'ceiling');
    platforms.create(97, 193, 'wall');
    platforms.create(728, 193, 'wall');
    platforms.create(363, 105, 'open_wall');
    platforms.create(433, 238, 'open_wall');
    //platforms.create(600, 400, 'ground');
    //platforms.create(50, 250, 'ground');

    // The player and its settings
    player = this.physics.add.sprite(670, 220, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //player.anims.add("running_dude");

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        //frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frames: this.anims.generateFrameNumbers('running_left', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'static_left',
        //frames: [ { key: 'dude', frame: 4 } ],
        //frameRate: 20
        frames: this.anims.generateFrameNumbers('static_dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'static_right',
        //frames: [ { key: 'dude', frame: 4 } ],
        //frameRate: 20
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

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    /*
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    */

    /*
    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    */

    //bombs = this.physics.add.group();

    //  The score

    //scoreText = this.add.text(16, 16, 'texto debug', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    //this.physics.add.collider(stars, platforms);
    //this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    //this.physics.add.overlap(player, stars, collectStar, null, this);

    //this.physics.add.collider(player, bombs, hitBomb, null, this);

    // Create clock related objects
    timerEvent = this.time.addEvent({ delay: 60000, callback: timesOut, callbackScope: this });
    graphics = this.add.graphics({ x: 0, y: 0 });

    //player.enable = false;
    player.allowGravity = false;

}

// Function called after we ran out of time
// TODO: Determine here if player won or lost
function timesOut()
{
    //this.physics.pause();
    //this.add.image(420, 210, 'background_grey');
    this.add.image(420, 210, 'you_won');
    gameOver = true;
    //scoreText = this.add.text(16, 16, 'Perdiste', { fontSize: '32px', fill: '#000' });
    player.setTint(0x555555);
}

function update ()
{

    //console.log(timerEvent);

    //console.log("player.x = " + player.x);
    //console.log("player.y = " + player.y);

    // Get current room
    currentRoom = getCurrentRoom(player.x, player.y);
    //console.log(currentRoom);

    // Is able to use the ladder?
    //console.log(useLadder(player.x, player.y));

    if (gameOver)
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

        return;
    }

    // Update clock if game is still running
    graphics.clear();
    drawClock(40, 40, timerEvent);

    // Actions on key press
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);

        lastMovement = "LEFT";

        //console.log("left");

    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);

        //console.log("right");

        lastMovement = "RIGHT";
    }
    /*
    else if (cursors.down.isDown)
    {
        //player.setVelocityX(80);

        player.anims.play('down', true);

        console.log("down");
    }
    */
    else
    {

        player.setVelocityX(0);

        if (lastMovement == "RIGHT")
        {
            //console.log("static right");
            player.anims.play('static_right', true);
        }
        else
        {
            //console.log("static left");
            player.anims.play('static_left', true);
        }
    }

    if (cursors.up.isDown)
    {
        if (useLadder(player.x, player.y))
        {
            console.log("fdf");
            player.allowGravity = false;
            player.setVelocityY(-120);
            player.setVelocityX(0);
        }
        else
        {
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
function useLadder(x, y) {
    if (y > 179 && y <= 309) {
        if ((x >=478 && x<=512) || (x>=267 && x<=294)) {
            return true;
        }
    }
    /*
    if (y == 176) {
        if ((x >=478 && x<=512) || (x>=267 && x<=296)) {
            return true;
        }
    }
    */
    return false;
}