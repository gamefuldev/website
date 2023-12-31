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
    welcome;
    welcome2;

    constructor () {
        super({ key: 'homepage' });
    }

    preload() {
        this.load.image('player', '../img/game/bird.png');
        this.load.image('pipe', '../img/game/pipe.png');
        this.load.image('barrier', '../img/game/barrier.png');
    }

    create() {
        // Allow users to scroll
 
        // Set the game's background colour
        this.containerDiv = document.getElementById('gameContainer');
        this.containerDiv.style.backgroundColor = "#ffffff";
        // Set height of a pipe row based on browser window size
        this.rowHeight = game.config.height / 75;
        
        this.prevHole = Math.floor(this.rowHeight / 2);
        this.score = 0;
        this.welcomeMessage();

        // Create player
        if (game.config.width < 700) {
            this.player = this.physics.add.sprite(50, 350, 'player').setScale(1);
        } else {
            this.player = this.physics.add.sprite(100, 350, 'player').setScale(1);
        }
        
        
        this.input.keyboard.on('keydown-SPACE', this.flapBird, this);
        this.input.on('pointerdown', this.flapBird, this);
        
    
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(0, 0, 'barrier').setScale(200, 0.5).refreshBody();
        this.platforms.create(0, game.config.height, 'barrier').setScale(200, 0.5).refreshBody();
        
    
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

        // this.gameActive = true;
        this.physics.pause();  
        
    }

    update() {
        if (!this.gameActive) {
            return;
        }
    
        if (this.player.angle < 20) {
            this.player.angle += 1;
        }

        this.player.body.velocity.y += 20;
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
        if (!this.gameActive) {
            return;
        }

        var hole = this.prevHole + Math.floor(Math.random() * 3) - 1;

        if (hole < 0)
            hole = 0;

        if (hole > this.rowHeight - 3) 
            hole = this.rowHeight - 5;

        hole = Math.round(hole, 0);

        // console.log(hole);

        for (let i = 0; i < this.rowHeight; i ++) {
            if (i != hole && i != hole + 1 && i != hole + 2) {
                this.addOnePipe(game.config.width, i * 68 + 53);
            }
        }

        this.prevHole = hole;
        this.score += 1;
        this.labelScore.text = 'Your current score is: ' + this.score;
    }

    welcomeMessage() {
        // let r1 = this.add.rectangle(game.config.width / 2, game.config.height / 2, 320, 320, 0xffffff).setOrigin(0.5);
        // r1.setStrokeStyle(4, 0x111111);

        this.welcome = this.add.text(
            game.config.width / 2, game.config.height / 2 - 10, 
            'Building fun things.', 
            { font: '32px montserrat', fill: '#111111' }
        ).setOrigin(0.5);

        this.welcome2 = this.labelScore = this.add.text(
            game.config.width / 2, game.config.height / 2 + 40, 
            'Click to begin', 
            { font: '20px montserrat', fill: '#111111' }
        ).setOrigin(0.5);

        this.input.once('pointerup', function (event) {
            this.physics.resume();   
            this.gameActive = true;
            this.welcome.visible = false;
            this.welcome2.visible = false;
        }, this);
    }

    gameOver() {
        this.gameActive = false;
        this.physics.pause();   
        this.add.rectangle(game.config.width / 2, game.config.height / 2, game.config.width, game.config.height, 0x888888, 0.5).setOrigin(0.5); 
        this.add.rectangle(game.config.width / 2, game.config.height / 2, 320, 320, 0xffffff).setOrigin(0.5).setStrokeStyle(4, 0x111111); 

        this.add.text(
            game.config.width / 2, game.config.height / 2 - 45, 
            'Game Over', 
            { font: '24px montserrat', fill: '#111111' }
        ).setOrigin(0.5);

        this.add.text(
            game.config.width / 2, game.config.height / 2 - 10, 
            'Final score: ' + this.score, 
            { font: '32px montserrat', fill: '#111111' }
        ).setOrigin(0.5);

        this.add.text(
            game.config.width / 2, game.config.height / 2 + 40, 
            'Click to restart', 
            { font: '20px montserrat', fill: '#111111' }
        ).setOrigin(0.5);

        this.input.once('pointerup', function (event) {
            this.scene.start('homepage');
        }, this);
    }
}

const container = document.getElementById('gameContainer');

const config = {
    type: Phaser.AUTO,
    width: container.offsetWidth,
    height: 500,
    parent: 'gameContainer',
    backgroundColor: '#ffffff',
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y : 0 },
            debug: false
        }
    },
    scene: HomePage
}

let montserrat = new FontFace(
    "montserrat", 
    "url(https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw0aXpsog.woff2)"
);

var game;

montserrat.load().then((font) => {
    document.fonts.add(font);
    game = new Phaser.Game(config);
});

