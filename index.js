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
    }

    draw() {
        /* ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, 100, 100) */
        ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false)
        ctx.fillStyle = 'red';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.position.x + 30, this.position.y);
        ctx.lineTo(this.position.x - 10, this.position.y - 10);
        ctx.lineTo(this.position.x - 10, this.position.y + 10);
        ctx.closePath()

        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

const player = new Player({
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 }
})
player.draw();

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

function animate() {
    window.requestAnimationFrame(animate);

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    player.update();

    player.velocity.x = keys.w.pressed ? 1 : 0;

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