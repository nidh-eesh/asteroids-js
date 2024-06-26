const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext('2d')

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)

class Player {
    constructor({ position, velocity }) {
        this.position = position; // {x, y}
        this.velocity = velocity;
        this.rotation = 0;
    }

    draw() {
        /* ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, 100, 100) */
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.translate(-this.position.x, -this.position.y);

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false)
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(this.position.x + 30, this.position.y);
        ctx.lineTo(this.position.x - 10, this.position.y - 10);
        ctx.lineTo(this.position.x - 10, this.position.y + 10);
        ctx.closePath()

        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)

        return [
            {
                x: this.position.x + cos * 30 - sin * 0,
                y: this.position.y + sin * 30 + cos * 0,
            },
            {
                x: this.position.x + cos * -10 - sin * 10,
                y: this.position.y + sin * -10 + cos * 10,
            },
            {
                x: this.position.x + cos * -10 - sin * -10,
                y: this.position.y + sin * -10 + cos * -10,
            },
        ]
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Asteroid {
    constructor({ position, velocity, radius }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

function circleTriangleCollision(circle, triangle) {
    // Check if the circle is colliding with any of the triangle's edges
    for (let i = 0; i < 3; i++) {
        let start = triangle[i]
        let end = triangle[(i + 1) % 3]

        let dx = end.x - start.x
        let dy = end.y - start.y
        let length = Math.sqrt(dx * dx + dy * dy)

        let dot =
            ((circle.position.x - start.x) * dx +
                (circle.position.y - start.y) * dy) /
            Math.pow(length, 2)

        let closestX = start.x + dot * dx
        let closestY = start.y + dot * dy

        if (!isPointOnLineSegment(closestX, closestY, start, end)) {
            closestX = closestX < start.x ? start.x : end.x
            closestY = closestY < start.y ? start.y : end.y
        }

        dx = closestX - circle.position.x
        dy = closestY - circle.position.y

        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= circle.radius) {
            return true
        }
    }

    // No collision
    return false
}

function isPointOnLineSegment(x, y, start, end) {
    return (
        x >= Math.min(start.x, end.x) &&
        x <= Math.max(start.x, end.x) &&
        y >= Math.min(start.y, end.y) &&
        y <= Math.max(start.y, end.y)
    )
}


const player = new Player({
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 }
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
};

const SPEED = 2.5;
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.97;
const PROJECTILE_SPEED = 3;

const projectiles = [];
const asteroids = [];

const intervalId = setInterval(() => {
    const index = Math.floor(Math.random() * 2);
    let x, y, vx, vy;
    const radius = 50 * Math.random() + 10;
    const random = Math.random();
    const positionX = [0 - radius, canvas.width + radius][Math.floor(random * 2)];
    const positionY = [0 - radius, canvas.height + radius][Math.floor(random * 2)];

    switch (index) {
        case 0: // x constant
            x = positionX;
            y = Math.random() * canvas.height;
            vx = Math.cos(random * Math.PI * 2);
            vy = Math.sin(random * Math.PI * 2);
            break;
        case 1: // y constant
            x = Math.random() * canvas.width;
            y = positionY;
            vx = Math.cos(random * Math.PI * 2);
            vy = Math.sin(random * Math.PI * 2);
            break;
        default:
            break;
    }
    asteroids.push(
        new Asteroid({
            position: {
                x: x,
                y: y,
            },
            velocity: {
                x: vx,
                y: vy,
            },
            radius,
        })
    )
}, 1000)

function circleCollission(circle1, circle2) {
    const xDifference = circle2.position.x - circle1.position.x;
    const yDifference = circle2.position.y - circle1.position.y;
    const distance = Math.sqrt(xDifference * xDifference + yDifference * yDifference);

    if (distance <= circle1.radius + circle2.radius) {
        return true;
    }
    return false;
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    player.update();

    // Projectile Management
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.update();

        // Garbage collection for projectiles
        if (projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y + projectile.radius < 0 ||
            projectile.position.y - projectile.radius > canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    // Asteroid Management
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update();

        if (circleTriangleCollision(asteroid, player.getVertices())) {
            alert('Game Over');
            window.cancelAnimationFrame(animationId);
            clearInterval(intervalId);
            location.reload()
        }

        // Garbage collection for asteroids
        if (asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y + asteroid.radius < 0 ||
            asteroid.position.y - asteroid.radius > canvas.height) {
            asteroids.splice(i, 1);
        }

        // Projectile-Asteroid Collision
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];
            if (circleCollission(asteroid, projectile)) {
                if (asteroid.radius > 30) {
                    asteroid.radius -= 20;
                    projectiles.splice(j, 1);
                } else {
                    asteroids.splice(i, 1);
                    projectiles.splice(j, 1);
                }
            }
        }

        // Asteroid-Asteroid Collision
        for (let k = asteroids.length - 2; k >= 1; k--) {
            const asteroid2 = asteroids[k];

            if (i !== k && circleCollission(asteroid, asteroid2)) {
                if (asteroid.radius > asteroid2.radius) {
                    asteroid.radius -= asteroid2.radius * 2 / 3;
                    asteroids.splice(k, 1);
                } else {
                    asteroid2.radius -= asteroid.radius * 2 / 3;
                    asteroids.splice(i, 1);
                }
            }
        }
    }

    player.velocity.x = keys.w.pressed ? Math.cos(player.rotation) * SPEED : player.velocity.x * FRICTION;
    player.velocity.y = keys.w.pressed ? Math.sin(player.rotation) * SPEED : player.velocity.y * FRICTION;
    player.rotation += keys.d.pressed ? ROTATIONAL_SPEED : 0;
    player.rotation -= keys.a.pressed ? ROTATIONAL_SPEED : 0;

}

animate();

window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyW':
            keys.w.pressed = true;
            break;
        case 'KeyA':
            keys.a.pressed = true;
            break;
        case 'KeyS':
            keys.s.pressed = true;
            break;
        case 'KeyD':
            keys.d.pressed = true;
            break;
        case 'Space':
            e.preventDefault();
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + Math.cos(player.rotation) * 30,
                    y: player.position.y + Math.sin(player.rotation) * 30,
                },
                velocity: {
                    x: Math.cos(player.rotation) * PROJECTILE_SPEED,
                    y: Math.sin(player.rotation) * PROJECTILE_SPEED
                },
            }))
            break;
        default:
            break;
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyW':
            keys.w.pressed = false;
            break;
        case 'KeyA':
            keys.a.pressed = false;
            break;
        case 'KeyS':
            keys.s.pressed = false;
            break;
        case 'KeyD':
            keys.d.pressed = false;
            break;

        default:
            break;
    }
})