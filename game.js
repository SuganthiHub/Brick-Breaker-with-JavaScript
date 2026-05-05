"use strict";
const STATE = Object.freeze(     {
    MENU: "MENU", PLAYING: "PLAYING", PAUSED: "PAUSED", GAME_OVER: "GAME_OVER"
}
);
class Game      {
    constructor(canvasElement)      {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext("2d");
        this.state = STATE.MENU;
        this.score = 0;
        this.lives = 3;
        this.ball = new Ball();
        this.paddle = new Paddle();
        this.bricks = [
        ];
        this.keys =      {
        }
        ;
        this.bindInputListeners();
        this.loop = this.loop.bind(this);
    }
    buildBricks()      {
        this.bricks = [
        ];
        for (let r = 0;
        r < BRICK_ROWS;
        r++)
        for (let c = 0;
        c < BRICK_COLS;
        c++)
        this.bricks.push(new Brick(c, r));
    }
    resetRound()      {
        this.ball.reset();
        this.paddle.reset();
    }
    bindInputListeners()      {
        window.addEventListener("keydown", e =>      {
            this.keys[
                e.key
            ] = true;
            this.paddle.control = "keyboard";
            // 👈 switch to keyboard
            this.handleKeyPress(e.key);
        }
    );
    window.addEventListener("keyup", e =>      {
        this.keys[
            e.key
        ] = false;
    }
);
this.canvas.addEventListener("mousemove", e =>      {
    this.paddle.mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
    this.paddle.control = 'mouse';
}
);
this.canvas.addEventListener("click", () => this.handleAdvance());
}
handleKeyPress(key)      {
    if (key === " ") this.handleAdvance();
    if (key === "p" || key === "Escape") this.handlePauseToggle();
}
handleAdvance()      {
    if (this.state === STATE.MENU)      {
        this.score = 0;
        this.lives = 3;
        this.buildBricks();
        this.resetRound();
        this.updateHUD();
        this.state = STATE.PLAYING;
        return;
    }
    if (this.state === STATE.PLAYING)      {
        this.ball.launch();
        return;
    }
    if (this.state === STATE.GAME_OVER) this.state = STATE.MENU;
}
handlePauseToggle()      {
    if (this.state === STATE.PLAYING) this.state = STATE.PAUSED;
    else if (this.state === STATE.PAUSED) this.state = STATE.PLAYING;
}
loseLife()      {
    this.lives--;
    this.updateHUD();
    this.lives <= 0 ? (this.state = STATE.GAME_OVER) : this.resetRound();
}
updateHUD()      {
    document.getElementById("hud-score").textContent = `Score: $ {
        this.score
    }
    `;
    document.getElementById("hud-lives").textContent = "♥".repeat(Math.max(0, this.lives));
}
addScore(points)      {
    this.score += points;
    document.getElementById("hud-score").textContent = `Score: $ {
        this.score
    }
    `;
}
getCollisionSide(brick)      {
    const bl = this.ball.x - this.ball.radius, br = this.ball.x + this.ball.radius;
    const bt = this.ball.y - this.ball.radius, bb = this.ball.y + this.ball.radius;
    if (br < brick.x || bl > brick.x + brick.width || bb < brick.y || bt > brick.y + brick.height) return null;
    const oL = br - brick.x, oR = brick.x + brick.width - bl;
    const oT = bb - brick.y, oB = brick.y + brick.height - bt;
    const m = Math.min(oL, oR, oT, oB);
    if (m === oT) return "top";
    if (m === oB) return "bottom";
    return m === oL ? "left" : "right";
}
checkBrickCollisions()      {
    for (const brick of this.bricks)      {
        if (!brick.isAlive) continue;
        const side = this.getCollisionSide(brick);
        if (!side) continue;
        brick.isAlive = false;
        this.addScore(brick.points);
        if (side === "top" || side === "bottom") this.ball.ballSpeedY *= -1;
        else this.ball.ballSpeedX *= -1;
        break;
    }
    if (this.bricks.every(b => !b.isAlive)) this.state = STATE.GAME_OVER;
}
checkPaddleCollision()      {
    const bb = this.ball.y + this.ball.radius;
    const pt = this.paddle.y, pl = this.paddle.x, pr = this.paddle.x + this.paddle.width;
    if (this.ball.ballSpeedY <= 0 || bb < pt || bb > pt + this.paddle.height || this.ball.x < pl || this.ball.x > pr) return;
    const center = pl + this.paddle.width / 2;
    const hitPos = (this.ball.x - center) / (this.paddle.width / 2);
    const angle = hitPos * (60 * Math.PI / 180);
    const speed = Math.hypot(this.ball.ballSpeedX, this.ball.ballSpeedY);
    this.ball.ballSpeedX = speed * Math.sin(angle);
    this.ball.ballSpeedY = -Math.abs(speed * Math.cos(angle));
    this.ball.y = pt - this.ball.radius;
}
checkBallOutOfBounds()      {
    if (this.ball.y - this.ball.radius > CANVAS_HEIGHT) this.loseLife();
}
update()      {
    if (this.state !== STATE.PLAYING) return;
    this.paddle.update(this.keys);
    if (!this.ball.isLaunched)      {
        this.ball.x = this.paddle.x + this.paddle.width / 2;
        this.ball.y = PADDLE_Y - BALL_RADIUS;
    }
    this.ball.update();
    this.checkPaddleCollision();
    this.checkBrickCollisions();
    this.checkBallOutOfBounds();
}
drawOverlayBox(ctx)     {
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, 60, 300, 200);
    ctx.fill();
    ctx.stroke();
}
drawMenuOverlay(ctx)     {
    this.drawOverlayBox(ctx);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    ctx.font = "bold 30px Segoe UI";
    ctx.fillText("Brick Breaker", CANVAS_WIDTH / 2, 105);
    ctx.fillStyle = "#666";
    ctx.font = "15px Segoe UI";
    ctx.fillText("Click or Space to start", CANVAS_WIDTH / 2, 145);
    ctx.fillText("Arrow keys or mouse  •  P to pause", CANVAS_WIDTH / 2, 165);
}
drawLaunchHint(ctx)     {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#aaa";
    ctx.font = "14px Segoe UI";
    ctx.fillText("Click or Space to launch", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);
}
drawPausedOverlay(ctx)     {
    this.drawOverlayBox(ctx);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    ctx.font = "bold 28px Segoe UI";
    ctx.fillText("Paused", CANVAS_WIDTH / 2, 105);
    ctx.fillStyle = "#666";
    ctx.font = "15px Segoe UI";
    ctx.fillText("Press P or Escape to continue", CANVAS_WIDTH / 2, 160);
}
drawGameOverOverlay(ctx)     {
    this.drawOverlayBox(ctx);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const win = this.bricks.every(b => !b.isAlive);
    ctx.fillStyle = win ? "#5a8a5a" : "#c0392b";
    ctx.font = "bold 28px Segoe UI";
    ctx.fillText(win ? "You Win!" : "Game Over", CANVAS_WIDTH / 2, 105);
    ctx.fillStyle = "#333";
    ctx.font = "17px Segoe UI";
    ctx.fillText(`Score: $ {
        this.score
    }
    `, CANVAS_WIDTH / 2, 145);
    ctx.fillStyle = "#666";
    ctx.font = "15px Segoe UI";
    ctx.fillText("Click or Space for menu", CANVAS_WIDTH / 2, 165);
}
draw()      {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.bricks.forEach(b => b.draw(ctx));
    this.paddle.draw(ctx);
    this.ball.draw(ctx);
    if (this.state === STATE.MENU) this.drawMenuOverlay(ctx);
    if (this.state === STATE.PAUSED) this.drawPausedOverlay(ctx);
    if (this.state === STATE.GAME_OVER) this.drawGameOverOverlay(ctx);
    if (this.state === STATE.PLAYING && !this.ball.isLaunched) this.drawLaunchHint(ctx);
}
loop()      {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
}
start()      {
    requestAnimationFrame(this.loop);
}
}
const canvas = document.getElementById("gameCanvas");
const game = new Game(canvas);
game.start();

