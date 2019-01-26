var config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            backgroundColor: '#2d2d2d',
            parent: 'phaser-example',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 500 },
                    debug: false
                }
            },
            scene: {
                create: create,
                update: update,
            }
        };

        var graphics;
        var timerEvent;
        var clockSize = 50;
        var player;

        var game = new Phaser.Game(config);

        function create() {
            timerEvent = this.time.addEvent({ delay: 600, repeat: 9 });

            graphics = this.add.graphics({ x: 0, y: 0 });
        }

        function update() {
            graphics.clear();

            drawClock(160, 160, timerEvent);
        }

        function drawClock(x, y, timer) {
            
            
            graphics.lineStyle(6, 0xffffff, 1);
            graphics.strokeCircle(x, y, clockSize);

            var angle;
            var dest;
            var p1;
            var p2;
            var size;

            //  The overall progress hand (only if repeat > 0)
            if (timer.repeat > 0) {
                size = clockSize * 0.9;

                angle = (360 * timer.getOverallProgress()) - 90;
                dest = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle), size);

                graphics.lineStyle(2, 0x3333ff, 1);

                graphics.beginPath();

                graphics.moveTo(x, y);

                p1 = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle - 5), size * 0.7);

                graphics.lineTo(p1.x, p1.y);
                graphics.lineTo(dest.x, dest.y);

                graphics.moveTo(x, y);

                p2 = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle + 5), size * 0.7);

                graphics.lineTo(p2.x, p2.y);
                graphics.lineTo(dest.x, dest.y);

                graphics.strokePath();
                graphics.closePath();
            }

            //  The current iteration hand
            size = clockSize * 0.95;

            angle = (360 * timer.getProgress()) - 90;
            dest = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle), size);

            graphics.lineStyle(2, 0xffff00, 1);

            graphics.beginPath();

            graphics.moveTo(x, y);

            p1 = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle - 5), size * 0.7);

            graphics.lineTo(p1.x, p1.y);
            graphics.lineTo(dest.x, dest.y);

            graphics.moveTo(x, y);

            p2 = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle + 5), size * 0.7);

            graphics.lineTo(p2.x, p2.y);
            graphics.lineTo(dest.x, dest.y);

            graphics.strokePath();
            graphics.closePath();
        }