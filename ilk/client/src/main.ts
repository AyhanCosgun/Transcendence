import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, Color3 } from "@babylonjs/core";
import { io } from "socket.io-client";

// 🎮 WebSocket bağlantısı
const socket = io("http://localhost:3000");


// 🎮 Canvas ve oyun motoru
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);


// 🎮 Kamera & ışık
import { FreeCamera } from "@babylonjs/core";

const camera = new FreeCamera("Camera", new Vector3(0,0 , -20), scene);
camera.setTarget(Vector3.Zero());
//camera.rotation.x = Math.PI / 2;
camera.inputs.clear();

new HemisphericLight("light", new Vector3(1, 1, 0), scene);
new HemisphericLight("light", new Vector3(-1, -1, 0), scene);


// 🎮 Paddle'lar ve top
const paddleSize = { width: 0.2, height: 3, depth: 0.5 };
const paddle1 = MeshBuilder.CreateBox("paddle1", paddleSize, scene);
paddle1.position.x = -10 + paddleSize.width;
paddle1.position.y = 0;

const paddle2 = MeshBuilder.CreateBox("paddle2",  paddleSize, scene);
paddle2.position.x = 10 - paddleSize.width;
paddle2.position.y = 0;


//PADDLE MATERIALS
import { StandardMaterial } from "@babylonjs/core"; // Bu importu da ekle

const paddleMaterial = new StandardMaterial("paddleMaterial", scene);
paddleMaterial.diffuseColor = new Color3(0, 0, 0.7);
//paddleMaterial.specularColor = new Color3(1, 1, 1);
paddleMaterial.emissiveColor = new Color3(0, 0, 0.5);
//paddleMaterial.alpha = 0.9;

paddle1.material = paddleMaterial;

const paddle2Material = paddleMaterial.clone("paddle2Material") as StandardMaterial;
paddle2Material.diffuseColor = new Color3(0.7, 0, 0);
paddle2Material.emissiveColor = new Color3(0.5, 0, 0);
paddle2.material = paddle2Material;



//TOP
const ballRadius = 0.25;
const ball = MeshBuilder.CreateSphere("ball", { diameter: 2*ballRadius }, scene);
const ballMaterial = new StandardMaterial("ballMaterial", scene);
ballMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7); 
ball.material = ballMaterial;

//Bazı top sabitleri
const ballFirstSpeedFactor = 0.15;
let speedIncreaseFactor = 1.5;
const airResistanceFactor = 0.998; // Her frame'de %0.2 hız kaybı
const minimumSpeed = 0.2; // Top minimum bu hızın altına inemez
let pedalHit = 0;
let ballVelocity = new Vector3(0,0, 0); // top hızının tanımı



// 🎯 Zemin (floor)
const groundSize = { width: 20, height: 10 };
const ground = MeshBuilder.CreatePlane("ground", groundSize, scene);
//ground.rotation.x = Math.PI; // Plane'i dikey çevir


const groundMaterial = new StandardMaterial("groundMaterial", scene);
groundMaterial.diffuseColor = new Color3(0.1, 0.1, 0.1); // Koyu gri
ground.material = groundMaterial;




// DUVARLAR
// Alt duvar
const wallSize = { width: 20, height: 0.3, depth: 0.5 };
const bottomWall = MeshBuilder.CreateBox("bottomWall", wallSize, scene);
bottomWall.position.y = -5 - wallSize.height/2; // alt tarafa
bottomWall.position.x = 0;  // Ortalanmış

const bottomWallMaterial = new StandardMaterial("bottomWallMaterial", scene);
bottomWallMaterial.diffuseColor = new Color3(0.1, 0.5, 0.1); // yeşil tonlu duvar
bottomWall.material = bottomWallMaterial;

// Üst Duvar
const topWall = MeshBuilder.CreateBox("topWall", wallSize, scene);
topWall.position.y = 5 + wallSize.height/2; // üst tarafa
topWall.position.x = 0;

const topWallMaterial = bottomWallMaterial.clone("topWallMaterial");
topWall.material = topWallMaterial;



const scoreTable = document.getElementById("score-table")!;
const setTable = document.getElementById("set-table")!;




// OYUN FONKSİYONLARI

function startGame()
{
  gameState.matchOver = false;
  resetScores();
  resetSets();
  Math.random() <= 0.5  ? resetBall('player1') : resetBall('player2');
}


function resetScores()
{
  gameState.points.player1 = 0;
  gameState.points.player2 = 0;
  updateScoreBoard();
}

function resetSets()
{
  gameState.sets.player1 = 0;
  gameState.sets.player2 = 0;
  updateSetBoard();
}

function updateScoreBoard()
{
   scoreTable.innerText = `${gameState.points.player1}  :  ${gameState.points.player2}`;
}

function updateSetBoard()
{
    setTable.innerText = `${gameState.sets.player1}  :  ${gameState.sets.player2}`;
}


function showSetToast(message: string): Promise<void>
{
  return new Promise((resolve) => {
    const toast = document.getElementById("set-toast")!;
    toast.textContent = message;
    toast.style.opacity = "1";
    gameState.setOver = true;

    setTimeout(() => {
      toast.style.opacity = "0";
      gameState.setOver = false;
      resolve();
    }, 3000);
  });
}


async function startNextSet(message: string)
{
  await showSetToast(message);  // 3 saniye bekler
}



const endMsg = document.getElementById("end-message")!;

function showEndMessage(message: string) {
  
  endMsg.textContent = message;
  endMsg.style.display = "flex";
  if (startButton) {
    startButton.style.display = "inline-block";
    startButton.textContent = "Yeni Maç Başlat";
  }
}





function resetBall(lastScorer: Player) {
  pedalHit = 0;
  speedIncreaseFactor = 1.5;
  // 🎯 Önce topu durdur
  ballVelocity = new Vector3(0, 0, 0);

  // 🎯 Topu ortada sabitle
  ball.position = new Vector3(0, Math.random()*8-4, 0);
  

  // 🎯 Belirli bir süre bekle ( 1 saniye)
  setTimeout(() => {

    const angle = lastScorer == 'player1' ? (Math.random()*2-1)*Math.PI/4 : Math.PI - (Math.random()*2-1)*Math.PI/4;
    // 2 saniye sonra yeni rastgele bir hız ver
    ballVelocity = new Vector3( Math.cos(angle)*ballFirstSpeedFactor,
    Math.sin(angle)*ballFirstSpeedFactor,
      0);

  }, 1000); // 1000ms = 1 saniye
}





// MAÇ VE SET AYARLAMA
type Player = 'player1' | 'player2';

interface GameState {
  points: { player1: number; player2: number };
  sets: { player1: number; player2: number };
  matchOver: boolean;
  setOver: boolean;
}

const gameState: GameState = {
  points: { player1: 0, player2: 0 },
  sets: { player1: 0, player2: 0 },
  matchOver: false,
  setOver: false,
};


function scorePoint(winner: Player)
{
  if (gameState.matchOver) return;

  gameState.points[winner]++;

  updateScoreBoard();

  const p1 = gameState.points.player1;
  const p2 = gameState.points.player2;

  // Kontrol: Set bitti mi?
  if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2)
    {
      if (p1 > p2) {
      gameState.sets.player1++;
    } else {
      gameState.sets.player2++;      
    }

    updateSetBoard();
    const matchControl = (gameState.sets.player1 === 3 || gameState.sets.player2 === 3);
    if (!matchControl)
        startNextSet(`Seti ${winner} kazandı!`);
    resetScores();
    resetBall(winner);
    

    // Kontrol: Maç bitti mi?
    if (matchControl)
      {
        showEndMessage(`${winner} maçı kazandı !`);
        gameState.matchOver = true;
      }
  }
  else
  {
    resetBall(winner);
  }
}


//EVENT LISTENERS

//START BUTTON  
const startButton = document.getElementById("start-button")!;
startButton.addEventListener("click", () => {
  endMsg.style.display = "none";
  startButton.style.display = "none";
  startGame();
});



// 🎮 Klavye ile paddle1 kontrolleri

const upperLimit = (groundSize.height - paddleSize.height)/2; // Yukarı sınır
const lowerLimit = -upperLimit; // Aşağı sınır

//  PADDLE 1 KONTROLÜ
window.addEventListener("keydown", (event) => {
  const step = 1;
  let moved = false;

  if (event.key === 'w' && paddle1.position.y < upperLimit) {
    paddle1.position.y += step;
    moved = true;
  } else if (event.key === 's' && paddle1.position.y > lowerLimit) {
    paddle1.position.y -= step;
    moved = true;
  }

  if (moved) {
    event.preventDefault();
    socket.emit("player-move", {
      paddlePosition: paddle1.position.y,
    });
  }
});

//  PADDLE 2 KONTROLÜ
window.addEventListener("keydown", (event) => {
  const step = 1;
  let moved = false;

  if (event.key ===  "ArrowUp" && paddle2.position.y < upperLimit) {
    paddle2.position.y += step;
    moved = true;
  } else if (event.key === "ArrowDown" && paddle2.position.y > lowerLimit) {
    paddle2.position.y -= step;
    moved = true;
  }

  if (moved) {
    event.preventDefault();
    socket.emit("player-move", {
      paddlePosition: paddle2.position.y,
    });
  }
});


// 🎮 Karşı oyuncunun hareketini al
socket.on("opponent-move", (data) => {
  paddle2.position.y = data.paddlePosition;
});




// 🎮 Oyun döngüsü
engine.runRenderLoop(() => {
  if (gameState.matchOver) return;
  if (gameState.setOver) return;

  // Topu hareket ettir
ball.position.addInPlace(ballVelocity);

// 🎯 Duvar Çarpışması
if (((ball.position.y > (groundSize.height/2 - ballRadius) && ballVelocity.y > 0)
  || (ball.position.y < -(groundSize.height/2 - ballRadius) && ballVelocity.y < 0))
  && Math.abs(ball.position.x) <= groundSize.width/2 + ballRadius) 
  {
     ballVelocity.y *= -1; 
  }



// 🎯 Paddle Çarpışması
const paddleXThreshold = ballRadius + paddleSize.width;  // çarpışma hassasiyeti
const paddleYThreshold = (paddleSize.height + ballRadius)/2;  // paddle genişliğine göre


// Paddle1 (Aşağıdaki oyuncu)
if (Math.abs(ball.position.x - paddle1.position.x) < paddleXThreshold && ballVelocity.x < 0 &&
  Math.abs(ball.position.y - paddle1.position.y) < paddleYThreshold && ball.position.x > paddle1.position.x)
  {
    ballVelocity.x *= -1; 

  // 🎯 Nereden çarptı?
  const offset = ball.position.y - paddle1.position.y;
  
  // 🎯 y yönüne ekstra açı ver
  ballVelocity.y += offset * 0.05;
  if (pedalHit++)
    speedIncreaseFactor = 1.2;

    // 🎯 HIZI ARTTIR
    ballVelocity.x *= speedIncreaseFactor;
    ballVelocity.y *= speedIncreaseFactor;
}

// pedalın köşesinden sektir
if (Math.abs(ball.position.x - paddle1.position.x) < paddleXThreshold && ballVelocity.x < 0
  && Math.abs(ball.position.y - paddle1.position.y) >= paddleYThreshold
  && Math.abs(ball.position.y - paddle1.position.y) <= (paddleSize.height/2 + ballRadius)
  && ball.position.x > paddle1.position.x
  && (ball.position.y - paddle1.position.y) * ballVelocity.y < 0 )
  {
    ballVelocity.y *= -1;
  }


// Paddle2 (Yukarıdaki oyuncu)
if (
  Math.abs(ball.position.x - paddle2.position.x) < paddleXThreshold && ballVelocity.x > 0 &&
  Math.abs(ball.position.y - paddle2.position.y) < paddleYThreshold && ball.position.x < paddle2.position.x 
) {
  ballVelocity.x *= -1;

  const offset = ball.position.y - paddle2.position.y;
  
  // 🎯 y yönüne ekstra açı ver
  ballVelocity.y += offset * 0.05;
  if (pedalHit++)
    speedIncreaseFactor = 1.18;

    // 🎯 HIZI ARTTIR
    ballVelocity.x *= speedIncreaseFactor;
    ballVelocity.y *= speedIncreaseFactor;
}


// pedalın köşesinden sektir
if (Math.abs(ball.position.x - paddle2.position.x) < paddleXThreshold && ballVelocity.x > 0
  && Math.abs(ball.position.y - paddle2.position.y) >= paddleYThreshold
  && Math.abs(ball.position.y - paddle2.position.y) <= (paddleSize.height/2 + ballRadius)
  && ball.position.x < paddle2.position.x
  && (ball.position.y - paddle2.position.y) * ballVelocity.y < 0 )
  {
    ballVelocity.y *= -1;
  }


// 🎯 Skor kontrolü
if (ball.position.x > groundSize.width/2 + 5)
  {
    scorePoint('player1');
  }
else if (ball.position.x < -groundSize.width/2 - 5)
  {
    scorePoint('player2');
  }



// 🎯 HAVA DİRENCİ UYGULA // her bir frame için hızları biraz azalt
ballVelocity.x *= airResistanceFactor;
ballVelocity.y *= airResistanceFactor;

// 🎯 Hız minimumdan küçük olmasın, top durmasın
if (ballVelocity.length() < minimumSpeed)
  {
      ballVelocity = ballVelocity.multiplyByFloats(1.01, 1.01, 1.01);
  }

  scene.render();
});

canvas.focus();






