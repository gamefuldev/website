class HomePage extends Phaser.Scene {
    containerDiv;
    gameActive;
    player;
    pipes;
    platforms;
    prevHole;
    rowHeight;
    score;
    timer;

    constructor () {
        super({ key: 'homepage' });
    }

    preload() {
        this.load.image('player', '../img/game/bird.png');
        this.load.image('pipe', '../img/game/pipe.png');
    }

    create() {
        // Set the game's background colour
        this.containerDiv = document.getElementById('gameContainer');
        this.containerDiv.style.backgroundColor = "#ffc93c";
        // Set height of a pipe row based on browser window size
        this.rowHeight = game.config.height / 89.5;
        this.prevHole = Math.floor(this.rowHeight / 2);

        // Create player
        this.player = this.physics.add.sprite(100, 350, 'player').setScale(1);
        this.input.keyboard.on('keydown-SPACE', this.flapBird, this);
        this.input.on('pointerdown', this.flapBird, this);
    
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(0, 200, 'pipe').setScale(100, 0.25).refreshBody();
        this.platforms.create(0, game.config.height, 'pipe').setScale(100, 0.25).refreshBody();
    
        // Create pipes
        this.pipes = this.physics.add.staticGroup();
        this.pipes.maxSize = 20;
    
        // Set what happens if the player hits a pipe
        this.physics.add.collider(this.player, this.platforms, this.flattenBird, null, this);
        // this.physics.add.collider(this.player, this.pipes, this.gameOver, null, this);
        
        this.timer = this.time.addEvent({
            delay: 1500, 
            callback: this.addRowOfPipes,
            callbackScope: this,
            loop: true
        });

        this.gameActive = true;
        
        this.score = 0;
        this.labelScore = this.add.text(game.config.width - 50, 232, this.score, { font: "30px Arial", fill: "#111111" });
    }

    update() {
        this.player.body.velocity.y += 20;

        if (!this.gameActive) {
            return;
        }
    
        if (this.player.angle < 20) {
            this.player.angle += 1;
        }
    }

    flapBird() {
        if (this.gameActive) {
            this.player.body.velocity.y = -400;
        }
    
        if (this.player.angle > -20) {
            this.player.angle -= 30;
        }
    }

    flattenBird() {
        this.player.angle = 0;
    }

    addOnePipe(x, y) {
        var newPipe = this.physics.add.sprite(x, y, 'pipe');
        newPipe.body.velocity.x = -200;
        newPipe.body.velocity.y = 0;
        this.pipes.add(newPipe);
        this.physics.add.overlap(this.player, newPipe, this.gameOver, null, this);
    }

    addRowOfPipes() {
        
        var hole = this.prevHole + Math.floor(Math.random() * 7) - 3;

        if (hole < 0)
            hole = 0;

        if (hole > this.rowHeight - 3) 
            hole = this.rowHeight - 3;

        hole = Math.round(hole, 0);

        // console.log(hole);

        for (let i = 0; i < this.rowHeight; i ++) {
            if (i != hole && i != hole + 1 && i != hole + 2) {
                this.addOnePipe(game.config.width, i * 69 + 270);
            }
        }

        if (this.gameActive) {
            this.prevHole = hole;
            this.score += 1;
            this.labelScore.text = this.score;
        }
    }

    gameOver() {
        this.gameActive = false;
        this.containerDiv.style.backgroundColor = "#fdf6e5";
        this.physics.pause();   

        this.add.rectangle(game.config.width / 2, game.config.height / 2, 320, 320, 0xffffff).setOrigin(0.5);

        this.add.text(
            game.config.width / 2, game.config.height / 2 - 45, 
            'Game Over', 
            { font: '24px Arial', fill: '#111111' }
        ).setOrigin(0.5);

        this.add.text(
            game.config.width / 2, game.config.height / 2 - 10, 
            'Final score: ' + this.score, 
            { font: '32px Arial', fill: '#111111' }
        ).setOrigin(0.5);

        this.add.text(
            game.config.width / 2, game.config.height / 2 + 40, 
            'Click to restart', 
            { font: '20px Arial', fill: '#111111' }
        ).setOrigin(0.5);

        this.input.once('pointerup', function (event) {
            this.scene.start('homepage');
        }, this);
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'gameContainer',
    transparent: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y : 0 },
            debug: false
        }
    },
    scene: HomePage
}

const game = new Phaser.Game(config);