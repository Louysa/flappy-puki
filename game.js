class FlappyCat {
    constructor() {
        this.cat = document.getElementById('cat');
        this.gameContainer = document.querySelector('.game-container');
        this.scoreElement = document.getElementById('score');
        this.maxScoreElement = document.getElementById('maxScore');
        this.startMessage = document.getElementById('start-message');
        this.gameOverMessage = document.getElementById('game-over');
        
        this.gravity = 0.02;
        this.jumpForce = -1.5;
        this.velocity = 0;
        this.position = 300;
        this.score = 0;
        if(!sessionStorage.maxScore){
            sessionStorage.maxScore = 0;            
        }
        this.maxScore = sessionStorage.maxScore
        this.gameStarted = false;
        this.gameOver = false;

        this.pipes = [];
        this.pipeSpeed = 2;
        
        this.initialPipeInterval = 2500;
        this.pipeInterval        = 2500;
        this.initialPipeGap      = 250;
        this.pipeGap             = 250;
        this.pipeWidth           = 60;
        
        this.pipeGenerator = null;
        this.spinAngle = 0;

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (!this.gameStarted) {
                    this.startGame();
                } else if (this.gameOver) {
                    this.resetGame();
                } else {
                    this.jump();
                }
            }
        });
    }

    startGame() {
        this.gameStarted = true;
        this.startMessage.classList.add('hidden');
        this.gameLoop();
        this.startPipeGeneration();
    }

    resetGame() {
        this.position = 300;
        this.velocity = 0;
        this.score = 0;
        this.gameOver = false;  
        
        this.pipeSpeed    = 2;
        this.pipeInterval = this.initialPipeInterval;
        this.pipeGap      = this.initialPipeGap;

        clearInterval(this.pipeGenerator);
        this.pipeGenerator = null;
        this.pipes = [];
        document
                .querySelectorAll('.pipe')
                .forEach(p => p.remove());
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.gameOverMessage.classList.add('hidden');
        this.startGame();
    }

    jump() {
        this.velocity = this.jumpForce;
    }

    update() {
        if (!this.gameStarted || this.gameOver) return;

        this.velocity += this.gravity;
        this.position += this.velocity;
        this.cat.style.top = `${this.position}px`;
      
        this.spinAngle = (this.spinAngle + 0.5) % 360;
        this.cat.style.transform = `rotate(${this.spinAngle}deg)`;

        if (this.checkCollision()) {
            this.endGame();
            return;
        }


        this.updatePipes();
    }   

    checkCollision() {
        const catRect = this.cat.getBoundingClientRect();
        const containerRect = this.gameContainer.getBoundingClientRect();

 
        if (this.position <= 0 || this.position >= containerRect.height - catRect.height) {
            return true;
        }

   
        for (let pipe of this.pipes) {
            const pipeRect = pipe.element.getBoundingClientRect();
            if (this.isColliding(catRect, pipeRect)) {
                return true;
            }
        }

        return false;
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    createPipe() {
        const containerHeight = this.gameContainer.clientHeight;
        const minHeight = 100;
        const maxHeight = containerHeight - this.pipeGap - minHeight;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        const topPipe = document.createElement('div');
        topPipe.className = 'pipe top-pipe';
        topPipe.style.height = `${height}px`;
        topPipe.style.left = '1600px';
        topPipe.style.top = '0px';

        const bottomPipe = document.createElement('div');
        bottomPipe.className = 'pipe bottom-pipe';
        bottomPipe.style.height = `${containerHeight - height - this.pipeGap}px`;
        bottomPipe.style.left = '1600px';
        bottomPipe.style.bottom = '0px';



        this.gameContainer.appendChild(topPipe);
        this.gameContainer.appendChild(bottomPipe);
     

        this.pipes.push({
            element: topPipe,
            passed: false,
            x: 1600
        });
        this.pipes.push({
            element: bottomPipe,
            passed: false,
            x: 1600
        });
        
    }

    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            pipe.element.style.left = `${pipe.x}px`;

            
            if (pipe.x < -this.pipeWidth) {
                pipe.element.remove();
                this.pipes.splice(i, 1);
                continue;
            }


            if (!pipe.passed && pipe.x < 50 && i % 2 === 0) {
                pipe.passed = true;
                this.score++;
                this.scoreElement.textContent = `Score: ${this.score}`;

                this.adjustDifficulty();    
            }
            
        }
    }

    startPipeGeneration() {
       clearInterval(this.pipeGenerator);
       
        this.pipeGenerator = setInterval(() => {
            if (this.gameStarted && !this.gameOver) {
                this.createPipe();
            }
        }, this.pipeInterval);
    }

    endGame() {
        if(sessionStorage.maxScore){
           if(Number(sessionStorage.maxScore) < this.score){
            sessionStorage.maxScore = this.score
            this.maxScoreElement.innerHTML = 'Max Score: ' + Number(sessionStorage.maxScore);
           } 
        }else
        {
            sessionStorage.maxScore = 0;
        }
        this.gameOver = true;   
        this.gameOverMessage.classList.remove('hidden');
        if (this.pipeGenerator) {
            clearInterval(this.pipeGenerator);
            this.pipeGenerator = null;
        }
    }

    gameLoop() {
        this.update();
        if (!this.gameOver) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    adjustDifficulty(){
        this.pipeSpeed = this.pipeSpeed + this.score * 0.1;

        this.pipeInterval = Math.max(800,this.initialPipeInterval - this.score * 100);

        this.pipeGap = Math.max(120,this.initialPipeGap - this.score * 10);

        if(this.pipeGenerator){
            clearInterval(this.pipeGenerator);
            this.startPipeGeneration();
        }
    }
}

window.addEventListener('load', () => {
    new FlappyCat();
}); 