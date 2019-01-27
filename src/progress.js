var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: {
        create: create,
        update: update
    }
};

var graphics;

var game = new Phaser.Game(config);

function create() {
    graphics = this.add.graphics({ x: 240, y: 36 });
}

function update() {
    graphics.clear();
    graphics.fillStyle(0x0000a0, 1);
    graphics.fillRect(0, 0, 450, 3);
    graphics.fillRect(0, 16, 40, 3);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 32, 450, 3);
} 