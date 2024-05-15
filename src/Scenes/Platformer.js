class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.score = 0;
        this.startX = 0;
        this.startY = 0;
        this.jumpMulti = 1;
        this.alive = true;
    }

    create() {

        //this.add.image(8, 12, 'tileStuff', 151);
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        
        this.spawn = this.map.createFromObjects("Objects", {
            name: "spawn",
            key: "tilemap_sheet",
            frame: 151
        });
        this.spawn[0].alpha = 0;
        this.spawn[0].setScale(this.SCALE);
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spawn[0].x, this.spawn[0].y, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);
        for (let coin of this.coins) {
            coin.anims.play('coin');
        }
        this.pow = this.map.createFromObjects("Objects", {
            name: "pow",
            key: "tilemap_sheet",
            frame: 67
        });
        this.physics.world.enable(this.pow, Phaser.Physics.Arcade.STATIC_BODY);
        this.powGroup = this.add.group(this.pow);


        this.wasser = this.map.createFromObjects("Objects", {
            name: "wasser",
            key: "tilemap_sheet",
            frame: 151
        });
        this.physics.world.enable(this.wasser, Phaser.Physics.Arcade.STATIC_BODY);
        this.wasserS = this.add.group(this.wasser);
        for (let wasser of this.wasser) {
            wasser.anims.play('water');
        }






        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.score += 1;
            my.vfx.coins = this.add.particles(my.sprite.player.x, my.sprite.player.y, "kenny-particles", {
                frame: 'symbol_02.png',
                angle: { min: 0, max: 360 },
                gravityY: 200,
                speed: 100,
                lifespan: 300,
                quantity: 10,
                scale: { start: .1, end: 0 },
                emitting: true,
                emitZone: { type: 'random', source: my.sprite.player, quantity:10, scale: { start: 2, end: 0 } },
                duration: 10
            });
        });
        this.physics.add.overlap(my.sprite.player, this.wasserS, (obj1, obj2) => {
            if (this.alive == true) {
                this.alive = false;
                my.vfx.wasserrkjkbjekjb = this.add.particles(my.sprite.player.x, my.sprite.player.y, "kenny-particles", {
                    frame: 'circle_02.png',
                    angle: { min: 0, max: 360 },
                    gravityY: 200,
                    speed: 100,
                    lifespan: 300,
                    quantity: 10,
                    scale: { start: .1, end: 0 },
                    emitting: true,
                    emitZone: { type: 'random', source: my.sprite.player, quantity:10, scale: { start: 2, end: 0 } },
                    duration: 10
                });

                my.sprite.player.visible = false;
                this.time.delayedCall(
                    310,                // ms
                    ()=>{
                        my.sprite.player.setPosition(this.spawn[0].x, this.spawn[0].y);
                        this.alive = true;
                        my.sprite.player.visible = true;

                });
            }

            
        });
        this.physics.add.overlap(my.sprite.player, this.powGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.jumpMulti = 2;
        });
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        
        my.sprite.score = this.add.text(450, 250, 'Placeholder', { font: 'Roboto', fontSize: '50px', fill: '#000000', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 10});
        my.sprite.score.setOrigin(.5).setScale(this.SCALE);
        //my.sprite.score.x = 50;
        my.sprite.score.setScrollFactor(0);
        my.sprite.score.setDepth(10);
        my.sprite.jumpjump = this.add.text(450, 350, 'Placeholder', { font: 'Roboto', fontSize: '50px', fill: '#000000', wordWrap: {width: 600},  stroke: '#FFFFFF', strokeThickness: 10}).setScale(this.SCALE);
        my.sprite.jumpjump.setOrigin(.5);
        //my.sprite.score.x = 50;
        my.sprite.jumpjump.setScrollFactor(0);
        my.sprite.jumpjump.setDepth(10);
    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground



        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG * 2.2);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        if (my.sprite.player.body.blocked.down && Math.abs(my.sprite.player.body.velocity.x) >= 100) {

            my.vfx.walking.start();

        } else {
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY * this.jumpMulti);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        if (this.jumpMulti > 1 ) {
            this.time.delayedCall(
                60000,                // ms
                ()=>{
                    this.jumpMulti = 1;
            });

        }
        my.sprite.score.text = "Score: " + this.score;
        my.sprite.jumpjump.text = "Jump Multiplier: " + this.jumpMulti;
    }
}