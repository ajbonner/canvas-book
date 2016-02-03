window.addEventListener('load', eventWindowLoaded, false);

function eventWindowLoaded() {
  canvasApp();
}

function canvasSupport() {
  return !document.createElement('testcanvas').getContext;
}

function canvasApp() {
  if (! canvasSupport()) {
    return;
  }

  var canvas = document.getElementById('canvasOne');
  var ctx = canvas.getContext('2d');

  window.addEventListener('keydown', eventKeyDown, false);
  window.addEventListener('keyup', eventKeyUp, false);

  var isGameEnded = false;

  var ball = {
    posX: 320,
    posY: 0,
    speed: 4,
    size: 10,
    velocityX: 0,
    velocityY: 0,
    nextX: 320,
    nextY: 0
  };

  var paddle = {
    posX: 20,
    posY: 220,
    height: 40,
    width: 10,
    speed: 10 
  };

  var player = {
    name: '',
    score: 0
  }

  var player1 = Object.create(player);
  player1.name = 'Player 1';
  var player2 = Object.create(player);
  player2.name = 'Player 2';

  var paddle1 = Object.create(paddle);
  var paddle2 = Object.create(paddle);
  paddle2.posX = canvas.width - 20 - paddle.width;

  resetBall();
  
  function renderLoop() {
    if (! isGameEnded) {
      paintFrame();
      window.requestAnimationFrame(renderLoop);
    }
  }

  function paintFrame() {
    // outer box 
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.rect(0, 0, 640, 480);
    ctx.fill();

    // dashed halfway line
    var mid = canvas.width / 2;
    var dashSize = 9;

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.setLineDash([dashSize, dashSize]);

    ctx.beginPath();
    ctx.moveTo(mid, dashSize);
    ctx.lineTo(mid, canvas.height - dashSize);
    ctx.stroke();
    ctx.setLineDash([]);

    // draw scoreboard
    var p1sbPos = { x: 256, y: 10 };
    var p2sbPos = { x: 384, y: 10 };

    drawScore(p1sbPos, player1.score, 4);
    drawScore(p2sbPos, player2.score, 4, true);

    drawPaddle(paddle1);
    drawPaddle(paddle2);

    updateBall();
    checkForGoal();
    checkForPaddleBounce(paddle1);
    checkForPaddleBounce(paddle2);
    checkForBounce();
    drawBall();
  }

  function updateBall() {
    ball.nextX += ball.velocityX;
    ball.nextY += ball.velocityY;
    ball.posX = ball.nextX;
    ball.posY = ball.nextY;
  }

  function checkForPaddleBounce(paddle) {
    var dx = Math.abs(ball.nextX - paddle.posX);

    if (dx < ball.size 
        && ball.nextY >= paddle.posY && ball.nextY < (paddle.posY + paddle.height)) {
      ball.velocityX = ball.velocityX * -1;
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

  function drawPaddle(paddle) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paddle.posX, paddle.posY, paddle.width, paddle.height);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.rect(ball.posX - (ball.size / 2), ball.posY, ball.size, ball.size);
    ctx.fill();
  }

  function drawScore(pos, score, size, invert) {
    var i, j;
    drawChar(ctx, score, pos, size, invert);
  }

  function registerGoal(player) {
    player.score++;
    if (player.score > 9) {
      endGame(player);
    } else {
      resetBall();
    }
  }

  function eventKeyDown(e) {
    var UP = 38;
    var DOWN = 40;

    if (e.keyCode == UP) {
      paddle2.posY = Math.max(0, paddle2.posY - paddle.speed)
    } else if (e.keyCode == DOWN) {
      paddle2.posY = Math.min(paddle2.posY + paddle.speed, canvas.height - paddle2.height);
    }
  }
  
  function eventKeyUp(e) {
  }

  function endGame(player) {
    isGameEnded = true;
  }

  function resetBall() {
    ball.posX = 320;
    ball.posY = 0;
    ball.nextX = ball.posX;
    ball.nextY = ball.posY;

    var initialAngle = Math.floor(Math.random() * (60 - 15 + 1)) + 15;
    ball.velocityX = Math.cos(Math.PI / 180 * initialAngle) * ball.speed;
    ball.velocityY = Math.sin(Math.PI / 180 * initialAngle) * ball.speed;
  }

  renderLoop();
}
