var Debugger = function () {}; Debugger.log = function (message) {
  try {
    console.log(message);
  } catch (exception) {
    return;
  }
};

var canvasSupport = function () {
  return !!document.createElement('canvas').getContext;
};

function canvasApp() {
  if (!canvasSupport) {
    return;
  }

  var theCanvas = document.getElementById("canvasOne");
  var context = theCanvas.getContext("2d");

  document.querySelector("#control_form #reset_button")
    .addEventListener('click', resetCanvas, false);

  var clicks = [];
  var paths = [];

  var capturingPath = false;
  var currentPath = [];

  var mouseX = 0;
  var mouseEps = 10;
 

  var mouseClick = function (e) {
    clicks.push({x: e.layerX, y: e.layerY});
  };

  var mouseDragStart = function (e) {
    capturingPath = true;
    mouseX = e.clientX;
    currentPath = [];
  };
 
  var mouseMove = function (e) {
    if (capturingPath) {
      currentPath.push({x: e.layerX, y: e.layerY});    
    }
  };

  var mouseDragEnd = function (e) {
    capturingPath = false;
    if (Math.abs(mouseX - e.clientX) < mouseEps && currentPath.length < 1) {
      mouseClick(e);
      return;
    }
    paths.push(currentPath);
  };

  var keyPressed = function (e) {
  };

  theCanvas.addEventListener('mousedown', mouseDragStart, true);
  theCanvas.addEventListener('mousemove', mouseMove, true);
  theCanvas.addEventListener('mouseup', mouseDragEnd, true);

  var resetCanvas = function () {
    initGame();
  };

  var initGame = function () {
    clicks = [];
    paths = [];
    capturingPath = false;
    currentPath = [];

    drawScreen();
  };

  var drawScreen = function () {
    context.fillStyle = "#ffffaa";
    context.fillRect(0, 0, 800, 600);

    clicks.forEach(function (click) {
      context.fillStyle = '#000000';
      context.fillRect(click.x - 2.5, click.y - 2.5, 5, 5);
    });

    paths.forEach(function (path) {
      drawPath(context, path);
    });

    if (currentPath.length > 0) {
      drawPath(context, currentPath);
    }

    window.requestAnimationFrame(drawScreen);
  };

  var drawPath = function(context, path) {
    context.strokeStyle = "black"; 
    context.lineWidth = 5; 
    context.lineCap = 'square'; 

    context.beginPath(); 
    var start = path[0];
    var points = path.slice(1, path.length);

    context.moveTo(start.x, start.y); 
    points.forEach(function (point) {
      context.lineTo(point.x, point.y); 
    });

    context.stroke(); 
    context.closePath();
  };

  initGame();
}
