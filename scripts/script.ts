"use strict";

let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let canvasWidth:number = innerWidth
let canvasHeight: number = innerHeight
let ship: Ship;
let clicks: Record <string, boolean> = {} // storing mouse click inputs in an object
let enemies: Enemy[] = []
let score = 0

function SetupCanvas() {
    canvas = <HTMLCanvasElement>document.getElementById("canvas")!
    ctx = canvas.getContext('2d')!
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.width = canvasWidth + "px"
    canvas.style.height = canvasHeight + "px"
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ship = new Ship(canvasWidth / 2, canvasHeight / 2, 60, 600)
    for(let i  = 0; i < 15; i++) {
        enemies.push(new Enemy(0, 0, 0, 0, 0)) //0, 0, 0, 0, 60, 0
    }
    document.body.addEventListener('mousemove', function(e) {
        // console.log(e.pageX, e.pageY)
    })
    document.body.addEventListener('mousedown', function(e){
        // console.log(e.buttons)
        let relativeX = e.offsetX - canvasWidth / 2
        let relativeY = e.offsetY - canvasHeight / 2
        let dist = pythag(ship.x, ship.y, e.offsetX, e.offsetY) 
        ship.shoot(relativeX / dist * 8, relativeY / dist * 8)
    })
}

// ship attributes
class Ship {
    public bullets: Bullet[] = [] //had to change this to public to be used for collision detection
    constructor(
        public x: number,
        public y: number,
        private radius: number,
        public HP: number
        ){}

    shoot(dx: number, dy: number){
        this.bullets.push(new Bullet(this.x, this.y, dx, dy, 5))
    }

    draw(){
        ctx.strokeStyle = "cyan"
        ctx.fillStyle = "navy"
        ctx.beginPath()
        let sides = 6
        let vertAngle =((Math.PI * 2) / sides)
        
        for(let i = 0; i < sides; i++){
            ctx!.lineTo(this.x - this.radius * Math.cos(vertAngle * i),
                       this.y - this.radius * Math.sin(vertAngle * i))
        }
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        ship.drawBullets()
    }

    private drawBullets(){
        for(let i = 0; i < this.bullets.length; i++){
            this.bullets[i].draw()
            this.bullets[i].move()
        }
    }

    shipHitDetection(enemies: Enemy[]){
        // use a for loop to check whether this alien is in contact with any bullet.
        // this alien is at this.x, this.y. The bullets are at ship.bullets[i]
        for(let i = 0; i < enemies.length; i++){
            if (pythag(this.x, this.y, enemies[i].x, enemies[i].y) < this.radius + enemies[i].radius){
                ship.HP -= enemies[i].radius
                enemies.splice(i,1)
                --i
                console.log("hp: " + ship.HP)
            }
        }
    }
}


// bullet attributes
class Bullet{
    constructor(
        public x: number,
        public y: number,
        public velX: number,
        public velY: number,
        public radius: number   
    ){}
    
    move(){
        this.x += this.velX
        this.y += this.velY
    }

    draw(){
        ctx.fillStyle = 'white'
        ctx.fillRect(this.x, this.y, 10, 10)
    }
}

class Enemy{
    constructor(
        public x: number,
        public y: number,
        public velX: number,
        public velY: number,
        public radius: number,
    ){
        this.x = Math.floor(Math.random() * canvasWidth)
        this.y = Math.floor(Math.random() * canvasHeight)
        this.velX = Math.random() * 4 - 2.5
        this.velY = Math.random() * 4 - 2.5
        this.radius = 50
    }

    update(){
        this.x += this.velX
        this.y += this.velY
        if(this.x <this.radius){
            this.x = canvas.width
        }
        if(this.x > canvas.width){
            this.x = this.radius
        }
        if(this.y < this.radius){
            this.y = canvas.height
        }
        if(this.y > canvas.height){
            this.y = this.radius
        }
    }

    draw(){
        ctx.beginPath()
        ctx.strokeStyle = "red"
        ctx.fillStyle = "yellow"
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke()
        ctx.fill()    
    }

    enemyHitDetection(ship:Ship){
        // use a for loop to check whether this alien is in contact with any bullet.
        // this alien is at this.x, this.y. The bullets are at ship.bullets[i]
        for(let i = 0; i < ship.bullets.length; i++){
            if (pythag(this.x, this.y, ship.bullets[i].x, ship.bullets[i].y,) < this.radius){
                this.destroy()
                ship.bullets.splice(i,1)
                i--;
            }
        }
    }

    destroy(){
        this.radius -= 10
    }
}

// function respawnEnemies(toSpawn: number){
//     // Respawns enemies that are "dead"
//     // for loop that checks all enemies, those that have radius of 0, will set to 50. And, incrememnt a counter - 
//     // when that counter is equal to toSpawn(), then exit the for loop. break
//     for(let i = 0; i < enemies.length && toSpawn > 0; i++){
//         if(enemies[i].radius == 0){
//             enemies[i].radius = 50
//             toSpawn--
//         }
//     }
// }


function respawnEnemies(){
    for(let i = 0; i < enemies.length; i++){
        if(enemies.length == 0){
            enemies.push(new Enemy(0, 0, 0, 0, 0))
        }
    }
}

function pythag(x1: number, y1:number, x2:number, y2:number):number{
    let a = x1 - x2
    let b= y1 - y2
    return Math.sqrt(a*a+b*b)
}

function Render(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = 'white'
    ctx.font = '21px Arial'
    ctx.fillText("SCORE: " + score.toString(), 20, 35)
    if(ship.HP <= 0){
        ctx.fillStyle = 'white'
        ctx.font = '50px Arial'
        ctx.fillText("GAME OVER", canvasWidth / 2 - 150, canvasHeight / 2)
    }
    ship.draw()

    ship.shipHitDetection(enemies)
    
    // let alive = 0
    // for(let i = 0; i < enemies.length; i++){
    //     enemies[i].draw()
    //     if(enemies[i].radius != 0){
    //         alive++
    //     }
    // }

    // if(alive <= 1){
    //     respawnEnemies()
    // }

    if(enemies.length !== 0) {
        for(let i = 0; i < enemies.length; i++){
            enemies[i].update()
            enemies[i].draw()
            enemies[i].enemyHitDetection(ship)
        } 
    }
    requestAnimationFrame(Render)
}

SetupCanvas()
Render()