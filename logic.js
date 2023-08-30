
const settings = {
    boardSize: 20,
    tickrate: 10,
    keyToLeft: "ArrowLeft",
    keyToTop: "ArrowUp",
    keyToRight: "ArrowRight",
    keyToDown: "ArrowDown"
}

class Game{
    appleCount = document.getElementById("score");
    finalmessage = document.getElementById("finalmessage");

    #result;
    #runned;

    setResult(status){
        this.result = status;
    }

    getResult(){
        return this.result;
    }


    setRunnedState(state){
        this.runned = state;
    }

    getRunnedState(){
        return this.runned;
    }

    constructor(){
        this.runned = false;
    }
}


class Board{
    board;

    sizeX;
    sizeY;
    content = [];

    spawnApple(){
        let emptyCeils = [];
        for(let cell of this.board){
           if(cell.getAttribute("contains") === "empty"){
                emptyCeils.push(cell);
           } 
        }
    
        const goalCell = emptyCeils[Math.floor(Math.random() * emptyCeils.length)];
        goalCell.setAttribute("contains", "apple");
        goalCell.style.backgroundColor = "white";
    }

    constructor(brd, len = brd.length){
        this.board = brd;
        this.sizeX = len;
        this.sizeY = len;


        for(let i = 0; i < this.sizeX; i++){
            for(let j = 0; j < this.sizeY; j++){
                this.content.push(["empty", i, j]);
            }
        }
    }

};


function changeCellStyle(cell){
    const state = cell.getAttribute("contains");
    
    let bgColor;
    switch(state){
        case "empty":
            bgColor = "black";
        case "apple":
            bgColor = "white";
        case "snake":
            bgColor = "red";
    }


    cell.style.backgroundColor = bgColor;
}

class Snake{
    direction;
    // directions = ["top", "right", "bottom", "left"];
    body = [[6, 14], [7, 14], [8, 14]];

    render(board, reverseMode = false){
        const ceils = board.board;
        this.body.forEach((pixel) => {
            const dot = ceils[pixel[0] % board.sizeX + (pixel[1] % board.sizeY) * board.sizeY];
            
            if(!reverseMode){
                dot.setAttribute("contains", "snake");
                dot.style.backgroundColor = "red";
            }
            else{
                dot.setAttribute("contains", "empty");
                dot.style.backgroundColor = "black";
            }
        });
    }

    async move(board, game){
        if(this.body.length === board.sizeX * board.sizeY){
            game.setResult(true);
        }


        const ceils = board.board;
        let newTileCoords = [this.body.at(-1)[0], this.body.at(-1)[1]]
        switch(this.direction){
            case "top":
                newTileCoords[1]--;
                break;
            case "right":
                newTileCoords[0]++;
                break;
            case "bottom":
                newTileCoords[1]++;
                break;
            case "left":
                newTileCoords[0]--;
                break;
        }  

        if(newTileCoords[0] < 0){
            newTileCoords[0] = board.sizeX - 1;
        }
        if(newTileCoords[1] < 0){
            newTileCoords[1] = board.sizeY - 1;
        }

        const newTile = ceils[newTileCoords[0] % board.sizeX + (newTileCoords[1] % board.sizeY) * board.sizeX];
        const newTileAttribute = newTile.getAttribute("contains");


        if(newTileAttribute === "snake"){
            game.setResult(false);
            game.setRunnedState(false);
            return;
        }

        this.render(board, true); // deleting old snake

        this.body.push(newTileCoords);

        if(newTileAttribute !== "apple"){ 
            //definitely is a empty cell
            this.body.shift();
        }
        else{
            game.appleCount.innerText++;
        }
        // in other variation we don't delete last piece, 
        // because instantly getting it from apple
        

        //let's render that sh*t
        this.render(board); // drawing the new one

    }

    changeDirection(pressedKey){
        switch(pressedKey.key){
            case settings.keyToLeft:
                if(this.direction !== "right"){
                    this.direction = "left";
                }
    
                break;
            case settings.keyToTop:
                if(this.direction !== "bottom"){
                    this.direction = "top";
                }

                break;
            case settings.keyToRight: 
                if(this.direction !== "left"){
                    this.direction = "right";
                } 

                break;
            case settings.keyToDown: 
                if(this.direction !== "top"){
                    this.direction = "bottom";
                }

                break;
        };
    };


    constructor(len = 1, dir = "top"){
        this.length = len;
        this.direction = dir;
    }

};

//Gameplay functions:

function generateViewBoard(){
    const board = document.getElementById("board");

    const size = settings.boardSize;


    for(let i = 0; i < size; i++){
        for(let j = 0; j < size; j++){
            board.innerHTML += `<label class="cell" x="${i}" y="${j}" contains="empty">  </label>`
        }
    }

    return document.getElementsByClassName("cell");
}


let tickCount = 0;
async function tick(game, board, snake, timerId){
    tickCount++;

    snake.move(board, game);

    if(!game.getRunnedState()){
        clearInterval(timerId);

        const msgStyle = game.finalmessage.style;

        msgStyle.zIndex = "1";
        msgStyle.display = "block";

        if(game.getResult()){
            msgStyle.color = "green";
            game.finalmessage.innerText = "Eto pobeda!";
        }
        
    }

    if(tickCount % 4 === 0){
        shouldSpawnApple(board);
    }
    
}



//Non-gameplay functions:

async function shouldSpawnApple(board){
    if(Math.random() < 0.15){
        board.spawnApple()
    }
}

function revealGameModule(){
    const startButton = document.getElementById("start");
    startButton.style.display = "none";

    const field = document.getElementsByClassName("modul");
    field[0].style.display = "flex";
}

async function start(){
    revealGameModule();

    const viewBoard = generateViewBoard();

    const board = new Board(viewBoard, settings.boardSize);

    const snake = new Snake();

    document.addEventListener("keydown", (event) => {
        snake.changeDirection(event);
    });
    

    //starting the Gameplay
    const game = new Game();
    game.setRunnedState(true);

    let timerId = setInterval(() => tick(game, board, snake, timerId), 1000 / settings.tickrate);
    
}