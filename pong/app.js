window.addEventListener('load', eventWindowLoaded, false);

function eventWindowLoaded() {
  canvasApp();
}

function canvasSupport() {
  return !document.createElement('testcanvas').getContext;
}

function canvasApp() {
  if (!canvasSupport()) {
    return;
  }

  var canvas = document.getElementById('canvasOne');
  var ctx = canvas.getContext('2d');

  window.addEventListener('keydown', eventKeyDown, false);
  window.addEventListener('keyup', eventKeyUp, false);
  window.addEventListener('click', eventClick, false);

  var isGameBegun = false;
  var isGameEnded = false;

  var ball = {
    posX: 320,
    posY: 0,
    speed: 8,
    size: 10,
    velocityX: 0,
    velocityY: 0,
    nextX: 320,
    nextY: 0
  };

  var paddle = {
    posX: 20,
    posY: 210,
    height: 60,
    width: 10,
    dir: 0,
    speed: 10
  };

  var player = {
    name: '',
    score: 0
  }

  var p1Scoreboard = {
    x: 258,
    y: 20
  };

  var p2Scoreboard = {
    x: 382,
    y: 20
  };

  var player1 = Object.create(player);
  player1.name = 'Player 1';
  var player2 = Object.create(player);
  player2.name = 'Player 2';

  var paddle1 = Object.create(paddle);
  var paddle2 = Object.create(paddle);
  paddle1.speed = 4;
  paddle2.posX = canvas.width - 20 - paddle.width;

  resetBall();

  function renderLoop() {
    if (!isGameBegun) {
      paintStartScreen();
    } else if (!isGameEnded) {
      paintGameFrame();
    }
    window.requestAnimationFrame(renderLoop);
  }

  function paintStartScreen() {
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.rect(0, 0, 640, 480);
    ctx.fill();
    drawText(ctx, "Pong!", { x: 100, y: 40 }, 8, TextAlign.LEFT);
    drawText(ctx, "Click to Start", { x: 190, y: 320 }, 2, TextAlign.LEFT);
  }

  function paintGameFrame() {
    updateBall();
    updateAsAiPaddle(paddle1);
    updateAsPlayerPaddle(paddle2);
    // updateAsAiPaddle(paddle2);

    checkForGoal();
    checkForPaddleBounce(paddle1);
    checkForPaddleBounce(paddle2);
    checkForBounce();

    drawPitch();
    drawScore(p1Scoreboard, player1.score, 4, TextAlign.RIGHT);
    drawScore(p2Scoreboard, player2.score, 4, TextAlign.LEFT);
    drawPaddle(paddle1);
    drawPaddle(paddle2);
    drawBall();
  }

  function updateBall() {
    ball.nextX += ball.velocityX;
    ball.nextY += ball.velocityY;
    ball.posX = ball.nextX;
    ball.posY = ball.nextY;
  }

  function checkForPaddleBounce(paddle) {
    // so we need to know which face of the paddle is being tested
    // for example the left paddle's x position is 10px to the left
    // when compared with the right paddle
    var dir = (ball.velocityX > 0) ? 1 : -1;
    var paddleFaceX = (dir > 0) ? paddle.posX : paddle.posX + paddle.width;
    var dx = Math.abs(ball.posX - paddleFaceX);

    if (dx < Math.abs(ball.velocityX) && ball.posY >= paddle.posY 
        && ball.posY < (paddle.posY + paddle.height)) {
      ball.velocityX *= -1;
    }
  }

  function checkForGoal() {
    if (ball.nextX + ball.size > canvas.width) {
      registerGoal(player1);
    } else if (ball.nextX < 0) {
      registerGoal(player2);
    }
  }

  function checkForBounce() {
    if (ball.nextY + ball.size > canvas.height) {
      ball.velocityY = ball.velocityY * -1;
      ball.nextY = canvas.height - ball.size;
    } else if (ball.nextY < 0) {
      ball.velocityY = ball.velocityY * -1;
      ball.nextY = 0;
    }
  }

  function drawPitch() {
    // outer box
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.rect(0, 0, 640, 480);
    ctx.fill();

    // dashed halfway line
    var mid = canvas.width / 2;
    var dashSize = 9;

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.setLineDash([dashSize, dashSize]);

    ctx.beginPath();
    ctx.moveTo(mid, dashSize);
    ctx.lineTo(mid, canvas.height - dashSize);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawPaddle(paddle) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paddle.posX, paddle.posY, paddle.width, paddle.height);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.rect(ball.posX - (ball.size / 2), ball.posY, ball.size, ball.size);
    ctx.fill();
  }

  function drawScore(pos, score, size, align) {
    drawText(ctx, score, pos, size, align);
  }

  function registerGoal(player) {
    player.score++;
    if (player.score > 9) {
      endGame(player);
    } else {
      resetBall();
    }
  }

  function updateAsAiPaddle(paddle) {
    var isHeadingTowardMe = isBallHeadingTowardMe(paddle, ball);
    var paddleMidpoint = paddle.posY + (paddle.height / 2);
    var distanceFromBallHeight = ball.posY + (ball.size / 2) - paddleMidpoint;
    var nextY = paddle.posY;

    if (isHeadingTowardMe && distanceFromBallHeight != 0) {
      if (distanceFromBallHeight > 0) {
        nextY = paddle.posY + Math.min(paddle.speed, distanceFromBallHeight);
      } else if (distanceFromBallHeight < 0) {
        nextY = paddle.posY + Math.max(paddle.speed * -1,
          distanceFromBallHeight);
      }

      if (nextY < 0) { nextY = 0; }
      if (nextY > canvas.height - paddle.height) {
        nextY = canvas.height - paddle.height;
      }
    } else if (!isHeadingTowardMe) {
      var distanceFromMidPoint = canvas.height / 2 - paddle.posY;
      if (distanceFromMidPoint > 0) {
        nextY = paddle.posY + Math.min(paddle.speed, distanceFromMidPoint);
      } else if (distanceFromMidPoint < 0) {
        nextY = paddle.posY + Math.max(paddle.speed * -1, distanceFromMidPoint);
      }
    }

    paddle.posY = nextY;
  }

  function isBallHeadingTowardMe(paddle, ball) {
    var currentDx = Math.abs(paddle.posX - ball.posX);
    var newDx = Math.abs(paddle.posX - (ball.posX + ball.velocityX));

    return currentDx > newDx;
  }

  function updateAsPlayerPaddle(paddle) {
    if (paddle.dir < 0) {
      paddle.posY = Math.max(0, paddle.posY - paddle.speed);
    } else if (paddle.dir > 0) {
      paddle.posY = Math.min(
          paddle.posY + paddle.speed, 
          canvas.height - paddle.height);
    }
  }

  function eventClick(e) {
    if (!isGameBegun) {
      isGameBegun = true;
      isGameEnded = false;
    }
  }

  function eventKeyDown(e) {
    var UP = 38;
    var DOWN = 40;

    if (e.keyCode == UP) {
      paddle2.dir = -1;
    } else if (e.keyCode == DOWN) {
      paddle2.dir = 1;
    }
  }

  function eventKeyUp(e) {
    paddle2.dir = 0;
  }

  function endGame(player) {
    isGameEnded = true;
  }

  function resetBall() {
    ball.posX = 320;
    ball.posY = canvas.height / 2 - ball.size / 2;
    ball.nextX = ball.posX;
    ball.nextY = ball.posY;

    var initialDirection = (Math.random() >= 0.5) ? 1 : -1;
    var initialAngle = Math.floor(Math.random() * (60 - 15 + 1)) + 15;
    initialAngle *= (Math.random() >= 0.5) ? 1 : -1;

    ball.velocityX = Math.cos(Math.PI / 180 * initialAngle) * ball.speed * initialDirection;
    ball.velocityY = Math.sin(Math.PI / 180 * initialAngle) * ball.speed;
  }

  renderLoop();
}
