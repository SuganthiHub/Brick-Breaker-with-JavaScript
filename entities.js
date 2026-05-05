"use strict";
const CANVAS_WIDTH = 500, CANVAS_HEIGHT = 360;
const BALL_RADIUS = 9, BALL_BASE_SPEED = 4.5, BALL_MAX_SPEED = 9;
const PADDLE_WIDTH = 110, PADDLE_HEIGHT = 14, PADDLE_Y = CANVAS_HEIGHT - 40, PADDLE_KEYBOARD_SPEED = 6;
const BRICK_COLS = 6, BRICK_ROWS = 4, BRICK_WIDTH = 70, BRICK_HEIGHT = 22, BRICK_GAP = 6;
const BRICK_OFFSET_LEFT = 25, BRICK_OFFSET_TOP = 50;
const BRICK_ROW_COLORS = [
    "#E57373", "#F4A261", "#FFD166", "#95C77B"
];
class Ball      {
    constructor()      {
        this.radius = BALL_RADIUS;
        this.ballSpeedX = this.ballSpeedY = 0;
        this.isLaunched = false;
        this.reset();
    }
    reset()      {
        this.x = CANVAS_WIDTH / 2;
        this.y = PADDLE_Y - BALL_RADIUS;
    }
    launch()      {
        if (this.isLaunched) return;
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        this.ballSpeedX = BALL_BASE_SPEED * Math.sin(angle);
        this.ballSpeedY = -BALL_BASE_SPEED * Math.cos(angle);
        this.isLaunched = true;
    }
    clampSpeed()      {
        const s = Math.hypot(this.ballSpeedX, this.ballSpeedY);
        if (s > BALL_MAX_SPEED)      {
            const k = BALL_MAX_SPEED / s;
            this.ballSpeedX *= k;
            this.ballSpeedY *= k;
        }
    }
    update()      {
        if (!this.isLaunched) return;
        this.clampSpeed();
        this.x += this.ballSpeedX;
        this.y += this.ballSpeedY;
        if (this.x - this.radius < 0)      {
            this.x = this.radius;
            this.ballSpeedX = Math.abs(this.ballSpeedX);
        }
        if (this.x + this.radius > CANVAS_WIDTH)      {
            this.x = CANVAS_WIDTH - this.radius;
            this.ballSpeedX = -Math.abs(this.ballSpeedX);
        }
        if (this.y - this.radius < 0)      {
            this.y = this.radius;
            this.ballSpeedY = Math.abs(this.ballSpeedY);
        }
    }
    draw(ctx)      {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#444";
        ctx.fill();
    }
}
class Paddle      {
    constructor()      {
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.y = PADDLE_Y;
        this.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
        this.mouseX = CANVAS_WIDTH / 2;
        this.control = "mouse"
    }
    reset()      {
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.mouseX = CANVAS_WIDTH / 2;
    }
    update(keys)    {
        if (this.control === "keyboard")    {
            if (keys[
                "ArrowLeft"
            ] || keys[
                "a"
            ]) this.x -= PADDLE_KEYBOARD_SPEED;
            if (keys[
                "ArrowRight"
            ] || keys[
                "d"
            ]) this.x += PADDLE_KEYBOARD_SPEED;
        }
        else    {
            this.x += ((this.mouseX - this.width / 2) - this.x) * 0.25;
        }
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
    }
    draw(ctx)      {
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.height / 2);
        ctx.fillStyle = "#555";
        ctx.fill();
    }
}
class Brick      {
    constructor(col, row)      {
        this.col = col;
        this.row = row;
        this.x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_GAP);
        this.y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_GAP);
        this.width = BRICK_WIDTH;
        this.height = BRICK_HEIGHT;
        this.color = BRICK_ROW_COLORS[
            row % BRICK_ROW_COLORS.length
        ];
        this.points = (BRICK_ROWS - row) * 10;
        this.isAlive = true;
    }
    draw(ctx)      {
        if (!this.isAlive) return;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

