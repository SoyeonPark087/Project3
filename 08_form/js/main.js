/* ========================================
   Canvas
======================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");


const scoreElement = document.getElementById("score");
const linesElement = document.getElementById("lines");
const levelElement = document.getElementById("level");

const pauseButton = document.getElementById("pauseButton");

const gameOverScreen =
  document.getElementById("gameOverScreen");

const finalScoreElement =
  document.getElementById("finalScore");

const restartButton =
  document.getElementById("restartButton");


/* ========================================
   게임 설정
======================================== */

const COLS = 10;
const ROWS = 20;

const BLOCK_SIZE = 30;


canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;


/* ========================================
   블록 모양
======================================== */

const SHAPES = {

  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],

  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],

  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],

  O: [
    [1, 1],
    [1, 1]
  ],

  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],

  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],

  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]

};


/* ========================================
   블록 색상
======================================== */

const COLORS = {

  I: "#42d7f5",

  J: "#5378ff",

  L: "#ff9f43",

  O: "#ffd93d",

  S: "#58e879",

  T: "#b56cff",

  Z: "#ff5c73"

};


/* ========================================
   게임 변수
======================================== */

let board;

let currentPiece;
let nextPiece;

let score;
let lines;
let level;

let dropCounter;
let dropInterval;

let lastTime;

let gameOver;
let paused;


/* ========================================
   보드 생성
======================================== */

function createBoard() {

  return Array.from(
    { length: ROWS },
    () => Array(COLS).fill(null)
  );

}


/* ========================================
   랜덤 블록 생성
======================================== */

function createRandomPiece() {

  const types =
    Object.keys(SHAPES);

  const type =
    types[
      Math.floor(
        Math.random() * types.length
      )
    ];


  return {

    type: type,

    matrix:
      SHAPES[type].map(
        row => [...row]
      ),

    x: 0,

    y: 0

  };

}


/* ========================================
   블록 시작 위치
======================================== */

function positionPiece(piece) {

  piece.x =
    Math.floor(
      COLS / 2
    )
    -
    Math.ceil(
      piece.matrix[0].length / 2
    );

  piece.y = 0;

}


/* ========================================
   새 블록 가져오기
======================================== */

function spawnPiece() {

  currentPiece = nextPiece;

  positionPiece(currentPiece);


  nextPiece =
    createRandomPiece();


  drawNextPiece();


  if (
    collision(
      currentPiece,
      0,
      0
    )
  ) {

    endGame();

  }

}


/* ========================================
   블록 그리기
======================================== */

function drawBlock(
  context,
  x,
  y,
  color,
  size
) {

  context.fillStyle = color;

  context.fillRect(
    x * size,
    y * size,
    size,
    size
  );


  /* 밝은 내부 면 */

  context.fillStyle =
    "rgba(255,255,255,0.12)";

  context.fillRect(
    x * size + 3,
    y * size + 3,
    size - 6,
    size - 6
  );


  /* 테두리 */

  context.strokeStyle =
    "rgba(255,255,255,0.15)";

  context.lineWidth = 1;

  context.strokeRect(
    x * size + 0.5,
    y * size + 0.5,
    size - 1,
    size - 1
  );

}


/* ========================================
   보드 그리기
======================================== */

function drawBoard() {

  ctx.fillStyle = "#090c17";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* 그리드 */

  ctx.strokeStyle =
    "rgba(255,255,255,0.035)";

  ctx.lineWidth = 1;


  for (
    let x = 0;
    x <= COLS;
    x++
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x * BLOCK_SIZE,
      0
    );

    ctx.lineTo(
      x * BLOCK_SIZE,
      canvas.height
    );

    ctx.stroke();

  }


  for (
    let y = 0;
    y <= ROWS;
    y++
  ) {

    ctx.beginPath();

    ctx.moveTo(
      0,
      y * BLOCK_SIZE
    );

    ctx.lineTo(
      canvas.width,
      y * BLOCK_SIZE
    );

    ctx.stroke();

  }


  /* 쌓여 있는 블록 */

  board.forEach(
    (row, y) => {

      row.forEach(
        (cell, x) => {

          if (cell) {

            drawBlock(
              ctx,
              x,
              y,
              COLORS[cell],
              BLOCK_SIZE
            );

          }

        }
      );

    }
  );

}


/* ========================================
   현재 블록
======================================== */

function drawPiece(piece) {

  piece.matrix.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (value) {

            drawBlock(
              ctx,
              piece.x + x,
              piece.y + y,
              COLORS[piece.type],
              BLOCK_SIZE
            );

          }

        }
      );

    }
  );

}


/* ========================================
   다음 블록
======================================== */

function drawNextPiece() {

  nextCtx.clearRect(
    0,
    0,
    nextCanvas.width,
    nextCanvas.height
  );


  nextCtx.fillStyle = "#0e1220";

  nextCtx.fillRect(
    0,
    0,
    nextCanvas.width,
    nextCanvas.height
  );


  const matrix =
    nextPiece.matrix;

  const blockSize = 24;


  const width =
    matrix[0].length * blockSize;

  const height =
    matrix.length * blockSize;


  const offsetX =
    (nextCanvas.width - width)
    / 2;

  const offsetY =
    (nextCanvas.height - height)
    / 2;


  matrix.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (value) {

            nextCtx.fillStyle =
              COLORS[nextPiece.type];

            nextCtx.fillRect(

              offsetX +
              x * blockSize,

              offsetY +
              y * blockSize,

              blockSize - 2,

              blockSize - 2

            );


            nextCtx.fillStyle =
              "rgba(255,255,255,0.12)";

            nextCtx.fillRect(

              offsetX +
              x * blockSize + 3,

              offsetY +
              y * blockSize + 3,

              blockSize - 8,

              blockSize - 8

            );

          }

        }
      );

    }
  );

}


/* ========================================
   충돌 확인
======================================== */

function collision(
  piece,
  offsetX,
  offsetY,
  matrix = piece.matrix
) {

  for (
    let y = 0;
    y < matrix.length;
    y++
  ) {

    for (
      let x = 0;
      x < matrix[y].length;
      x++
    ) {

      if (!matrix[y][x]) {
        continue;
      }


      const newX =
        piece.x +
        x +
        offsetX;

      const newY =
        piece.y +
        y +
        offsetY;


      /* 좌우 벽 */

      if (
        newX < 0 ||
        newX >= COLS
      ) {

        return true;

      }


      /* 바닥 */

      if (
        newY >= ROWS
      ) {

        return true;

      }


      /* 기존 블록 */

      if (
        newY >= 0 &&
        board[newY][newX]
      ) {

        return true;

      }

    }

  }


  return false;

}


/* ========================================
   블록 고정
======================================== */

function mergePiece() {

  currentPiece.matrix.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (value) {

            const boardY =
              currentPiece.y + y;

            const boardX =
              currentPiece.x + x;


            if (
              boardY >= 0
            ) {

              board[boardY][boardX] =
                currentPiece.type;

            }

          }

        }
      );

    }
  );

}


/* ========================================
   라인 제거
======================================== */

function clearLines() {

  let cleared = 0;


  for (
    let y = ROWS - 1;
    y >= 0;
    y--
  ) {

    const isFull =
      board[y].every(
        cell => cell !== null
      );


    if (isFull) {

      board.splice(
        y,
        1
      );


      board.unshift(
        Array(COLS).fill(null)
      );


      cleared++;

      y++;

    }

  }


  if (
    cleared > 0
  ) {

    const points = [
      0,
      100,
      300,
      500,
      800
    ];


    score +=
      points[cleared]
      * level;


    lines += cleared;


    level =
      Math.floor(
        lines / 10
      )
      + 1;


    dropInterval =
      Math.max(
        100,
        800 -
        (level - 1) * 70
      );


    updateInfo();

  }

}


/* ========================================
   블록 아래 이동
======================================== */

function dropPiece() {

  if (
    collision(
      currentPiece,
      0,
      1
    )
  ) {

    mergePiece();

    clearLines();

    spawnPiece();

  } else {

    currentPiece.y++;

  }


  dropCounter = 0;

}


/* ========================================
   좌우 이동
======================================== */

function movePiece(direction) {

  if (
    gameOver ||
    paused
  ) {

    return;

  }


  if (
    !collision(
      currentPiece,
      direction,
      0
    )
  ) {

    currentPiece.x +=
      direction;

  }

}


/* ========================================
   블록 회전
======================================== */

function rotateMatrix(matrix) {

  return matrix[0]
    .map(
      (_, index) =>
        matrix.map(
          row =>
            row[index]
        ).reverse()
    );

}


/* ========================================
   회전
======================================== */

function rotatePiece() {

  if (
    gameOver ||
    paused
  ) {

    return;

  }


  const rotated =
    rotateMatrix(
      currentPiece.matrix
    );


  /* 기본 위치에서 회전 */

  if (
    !collision(
      currentPiece,
      0,
      0,
      rotated
    )
  ) {

    currentPiece.matrix =
      rotated;

    return;

  }


  /*
     벽에 붙어 있는 경우
     좌우로 조금 이동하며 회전 시도
  */

  const wallKick =
    [-1, 1, -2, 2];


  for (
    const offset of wallKick
  ) {

    if (
      !collision(
        currentPiece,
        offset,
        0,
        rotated
      )
    ) {

      currentPiece.x +=
        offset;

      currentPiece.matrix =
        rotated;

      return;

    }

  }

}


/* ========================================
   하드 드롭
======================================== */

function hardDrop() {

  if (
    gameOver ||
    paused
  ) {

    return;

  }


  let distance = 0;


  while (
    !collision(
      currentPiece,
      0,
      1
    )
  ) {

    currentPiece.y++;

    distance++;

  }


  /*
     하드 드롭 보너스
  */

  score +=
    distance * 2;


  updateInfo();


  mergePiece();

  clearLines();

  spawnPiece();

  dropCounter = 0;

}


/* ========================================
   점수 표시
======================================== */

function updateInfo() {

  scoreElement.textContent =
    score.toLocaleString();

  linesElement.textContent =
    lines;

  levelElement.textContent =
    level;

}


/* ========================================
   게임 화면 그리기
======================================== */

function draw() {

  drawBoard();

  if (
    currentPiece &&
    !gameOver
  ) {

    drawPiece(
      currentPiece
    );

  }


  /*
     일시정지 화면
  */

  if (
    paused &&
    !gameOver
  ) {

    ctx.fillStyle =
      "rgba(5,7,15,0.72)";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    ctx.fillStyle =
      "#ffffff";

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 28px Arial";

    ctx.fillText(
      "PAUSED",
      canvas.width / 2,
      canvas.height / 2
    );

  }

}


/* ========================================
   게임 루프
======================================== */

function update(time = 0) {

  if (
    gameOver
  ) {

    draw();

    return;

  }


  const deltaTime =
    time - lastTime;

  lastTime = time;


  if (
    !paused
  ) {

    dropCounter +=
      deltaTime;


    if (
      dropCounter >
      dropInterval
    ) {

      dropPiece();

    }

  }


  draw();


  requestAnimationFrame(
    update
  );

}


/* ========================================
   게임 오버
======================================== */

function endGame() {

  gameOver = true;

  finalScoreElement.textContent =
    score.toLocaleString();

  gameOverScreen.classList.remove(
    "hidden"
  );

}


/* ========================================
   일시정지
======================================== */

function togglePause() {

  if (
    gameOver
  ) {

    return;

  }


  paused =
    !paused;


  pauseButton.textContent =
    paused
      ? "계속하기"
      : "일시정지";


  /*
     일시정지 후 복귀 시
     시간 차이로 블록이 바로 떨어지는 현상 방지
  */

  lastTime =
    performance.now();

}


/* ========================================
   게임 초기화
======================================== */

function startGame() {

  board =
    createBoard();


  score = 0;

  lines = 0;

  level = 1;


  dropCounter = 0;

  dropInterval = 800;

  lastTime =
    performance.now();


  gameOver = false;

  paused = false;


  pauseButton.textContent =
    "일시정지";


  gameOverScreen.classList.add(
    "hidden"
  );


  nextPiece =
    createRandomPiece();


  spawnPiece();


  updateInfo();

}


/* ========================================
   키보드 이벤트
======================================== */

document.addEventListener(
  "keydown",
  function(event) {

    /*
       방향키와 스페이스바로
       페이지가 스크롤되는 것 방지
    */

    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowDown",
        "ArrowUp",
        "Space"
      ].includes(event.code)
    ) {

      event.preventDefault();

    }


    if (
      gameOver
    ) {

      return;

    }


    switch (
      event.code
    ) {

      case "ArrowLeft":

        movePiece(-1);

        break;


      case "ArrowRight":

        movePiece(1);

        break;


      case "ArrowDown":

        if (!paused) {

          dropPiece();

          score += 1;

          updateInfo();

        }

        break;


      case "ArrowUp":

        rotatePiece();

        break;


      case "Space":

        hardDrop();

        break;


      case "KeyP":

        togglePause();

        break;

    }

  }
);


/* ========================================
   버튼
======================================== */

pauseButton.addEventListener(
  "click",
  togglePause
);


restartButton.addEventListener(
  "click",
  function() {

    startGame();

    /*
       이전 requestAnimationFrame이
       게임 오버 시 종료되었으므로
       다시 실행
    */

    lastTime =
      performance.now();

    requestAnimationFrame(
      update
    );

  }
);


/* ========================================
   게임 실행
======================================== */

startGame();

requestAnimationFrame(
  update
);