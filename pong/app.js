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

  var lastUpdate = new Date().getTime();
  var refresh = 1000;
  var score = 0;

  var ball = {
    posX: 320,
    posY: 0,
    speed: 10,
    size: 10,
    velocityX: 0,
    velocityY: 0,
    nextX: 320,
    nextY: 0
  };

  var paddle = {
    posX: 20,
    posY: 240,
    height: 40,
    width: 10,
    speed: 10 
  };

  var paddle1 = Object.create(paddle);
  var paddle2 = Object.create(paddle);
  paddle2.posX = canvas.width - 20 - paddle.width;

  var initialAngle = Math.floor(Math.random() * (60 - 15 + 1)) + 15;
  ball.velocityX = Math.cos(Math.PI / 180 * initialAngle) * ball.speed;
  ball.velocityY = Math.sin(Math.PI / 180 * initialAngle) * ball.speed;
  
  function renderLoop() {
    paintFrame();
    window.requestAnimationFrame(renderLoop);
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

    if ((new Date().getTime() - lastUpdate) > refresh) {
      if (score < 9) { 
        score++; 
      } else { 
        score = 0; 
      }
      lastUpdate = new Date().getTime();
    }

    drawScore(p1sbPos, score, 4);
    drawScore(p2sbPos, score, 4, true);

    drawPaddle(paddle1);
    drawPaddle(paddle2);

    updateBall();
    checkWalls();
    drawBall();
  }

  function updateBall() {
    ball.nextX += ball.velocityX;
    ball.nextY += ball.velocityY;
    ball.posX = ball.nextX;
    ball.posY = ball.nextY;
  }

  function checkWalls() {
    if (ball.nextX + ball.size > canvas.width) { 
      ball.velocityX = ball.velocityX * -1;
      ball.nextX = canvas.width - ball.size;
    } else if (ball.nextX < 0) {
      ball.velocityX = ball.velocityX * -1;
      ball.nextX = 0;
    } else if (ball.nextY + ball.size > canvas.height) { 
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

  renderLoop();
}
