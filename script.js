const GAME_CONFIG = {
    cellsNo: 20,
    cellSize: 400 / 20,
    difficulty: 1,
};

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const btnStart = document.querySelector('.button-start');
const btnPause = document.querySelector('.button-pause');
const scoreVal = document.querySelector('.score-val');

const DIR = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};

let snake = [];
let food = null;
let needsGrowth = false;
let paused = false;
let lastUpdate_game, lastFood, tick;
let state;
let flash = false;
let lastKeyPressed;
let score = 0;
let {cellsNo, cellSize, difficulty} = GAME_CONFIG;

ctx.strokeStyle = "#27373f";
ctx.fillStyle = "#fff";
let direction = DIR.LEFT;
const startX = cellsNo / 2;
snake = [startX, startX + 1, startX + 2, startX + 3].map((x) => ({x, y: 15}));

function Update_game(){
    tick = Date.now();
    if (Encounter()){
        flash = true;
        return;
    }
    const timeDiff = tick - lastUpdate_game;
    if (timeDiff > 500 / difficulty){
        if (lastKeyPressed && lastKeyPressed !== direction){
            setDirection(lastKeyPressed);
        }
        const moveCount = Math.floor(timeDiff / (500 / difficulty));
        for (let i = 0; i < moveCount; i++){
            MotionSnake();
        }
        lastUpdate_game += moveCount * (500 / difficulty);
    }

    const foodDiff = tick - lastFood;
    if (foodDiff > FoodDoorway()){
        PutFood();
    }

    if (HeadTakeFood()){
        needsGrowth = true;
        food = null;
        PutFood();
        setScore(score + difficulty);
    }
}

function FoodDoorway(){
    return 5000 / difficulty * cellsNo;
}

function Encounter(){
    const head = snake[0];
    const check = snake.concat([]);
    check.shift();
    return check.find(
        c => c.x === head.x && c.y === head.y);
}

function SnakeContent(cell){
    return snake.find(c => c.x === cell.x && c.y === cell.y);
}

function HeadTakeFood(){
    const head = snake[0];
    return food && head.x == food.x && head.y === food.y;
}

function MotionSnake(){
    const head = snake[0];
    const next = Object.assign({}, head);
    switch (direction){
        case DIR.LEFT:
            --next.x;
            break;
        case DIR.UP:
            --next.y;
            break;
        case DIR.RIGHT:
            ++next.x;
            break;
        case DIR.DOWN:
            ++next.y;
            break;
    }

    next.x = (next.x + cellsNo) % cellsNo;
    next.y = (next.y + cellsNo) % cellsNo;

    if (!needsGrowth) {
        snake.pop()
    }

    needsGrowth = false;
    snake.unshift(next);
}

function PutFood(){
    const maxCoordinate = cellsNo - 1;
    do{
        food = {
            x: Math.floor(Math.random() * maxCoordinate),
            y: Math.floor(Math.random() * maxCoordinate)
        };
    } while (SnakeContent(food));
    lastFood = tick;

}

function Draw(){
    ctx.clearRect(0, 0, 400, 400);
    DrawCells();
    DrawFood();
    if (flash && Math.floor(Date.now() / 100) % 2 === 0){
        return;
    }
    DrawSnake();
}

function DrawCells(){
    for (var i = 0; i < cellsNo; ++i)
    for (var j = 0; j < cellsNo; ++j)
    DrawCell(i, j);
}

function DrawFood(){
    if (food){
        ctx.fillStyle = "#4fc3f7";
        fillCell(food.x, food.y);
        ctx.fillStyle = "#fff"
    }
}


function DrawCell(i, j){
    ctx.strokeRect(
        i * cellSize,
        j * cellSize,
        cellSize, cellSize);
}

function DrawSnake(){
    snake.forEach(
        ({x, y}) => fillCell(x,y));
}

function fillCell(x, y){
    ctx.beginPath();
    ctx.rect(
        x * cellSize,
        y * cellSize,
        cellSize, cellSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
}
function setScore(next){
    score = next;
    scoreVal.textContent = score;
}

function StartGame(){
    btnStart.textContent = "Restart";
    flash = false;
    lastKeyPressed = null;
    food = null;
    setScore(0);
    direction = DIR.LEFT;
    lastFood = lastUpdate_game = Date.now();
    paused = false;
    PutFood();
    const startX = cellsNo / 2;
    snake = [startX , startX + 1, startX + 2, startX + 3].map(
        x => ({x, y: 15})
    );
    function Animate(){
        if(!paused){
            Update_game();
            Draw();
            requestAnimationFrame(Animate);
        }
    }
    Animate()
}

function loop(){
    requestAnimationFrame(loop);
    Draw();
    if (paused) return;
    Update_game()
}

requestAnimationFrame(loop);
btnStart.addEventListener('click', StartGame);
btnPause.addEventListener('click', pause);

function pause(){
    paused = !paused;
    btnPause.textContent = paused ? 'resume' : 'pause';
}

window.addEventListener('keydown', onKeyDown);
function onKeyDown({keyCode}){
    if ((keyCode === DIR.DOWN && direction === DIR.UP) ||
        (keyCode === DIR.UP && direction === DIR.DOWN) ||
        (keyCode === DIR.LEFT && direction === DIR.RIGHT) ||
        (keyCode === DIR.RIGHT && direction === DIR.LEFT)){
            return;
        }
        lastKeyPressed = keyCode;
}

function setDirection(keyCode){
    direction = keyCode;
}

function checkFood(){
    if (!food) return;
    if (food.x >= cellsNo){
        food.x = cellsNo - 1;
    }
}

class RangeSlider{
    constructor(el, cb){
        this.input = el.querySelector('input');
        this.slider = el.querySelector('.range-slider');
        this.value = el.querySelector('.range-value');
        this.input.addEventListener('input', _ => this.onChange());
        this.input.addEventListener('keydown', e => {
            e.preventDefault();
        });
        this.onChangeCallback = cb;
        this.onChange();
    }

    onChange(){
        this.value.textContent = this.input.value;
        this.slider.style.transform = `scaleX(${this.input.value / this.input.step / 10})`;
        this.onChangeCallback(this.input.value);
    }
}

new RangeSlider(
    document.querySelector('.range-difficulty'),
    value => difficulty = Number(value)
);

new RangeSlider(
    document.querySelector('.range-columns'),
    value =>{
        cellsNo = Number(value);
        cellSize = 400 / cellsNo;
    }
);

canvas.addEventListener('touchstart', onTouchstart);
window.addEventListener('touchmove', onTouchMove);
window.addEventListener('touchend', ontouchend);