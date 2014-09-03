// PerspectiveView_mvpMatrix.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var modelMatrix = new Matrix4(); // Model matrix

var projMatrix1 = new Matrix4();  // Projection matrix
var projMatrix2 = new Matrix4();  // Projection matrix
var projMatrix3 = new Matrix4();  // Projection matrix
var projMatrix4 = new Matrix4();  // Projection matrix
var mvpMatrix = new Matrix4();   // Model view projection matrix

// Variable For Camera
var cameraXposition = 0.2;
var cameraYposition = -6;
var cameraZposition = 3;
var LookAtXposition = 0;
var LookAtYposition = 0;
var LookAtZposition = 0;


var viewMatrix1 = new Matrix4();  // View matrix
var viewMatrix2 = new Matrix4();  // View matrix
var viewMatrix3 = new Matrix4();  // View matrix
var viewMatrix4 = new Matrix4();  // View matrix
viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
viewMatrix2.setLookAt(0, -6, 1.0, 0, 0, 0, 0, 0, 1);
viewMatrix3.setLookAt(0, 0, 3, 0, 0, 0, 0, 1, 0);
viewMatrix4.setLookAt(2.2, 0, 0, 0, 0, 0, 0, 0, 1);

var gl1;
var gl2;
var gl3;
var gl4;
var canvas1;
var hud;
var ctx;


var u_MvpMatrix1;
var u_MvpMatrix2;
var u_MvpMatrix3;
var u_MvpMatrix4;

//State Variables
var axes = 0; // toggles the drawing of the x, y, and z axes
var n;
var tick;
var help = 0;
var fired = 0;
var isOrtho = 0;
var toggled = 0;

//Angles for Pink Creature
var ANGLESTEP1 = 45.0;
var ANGLESTEP2 = 45.0;
var ANGLESTEP3 = 45.0;
var currentAngle1 = 0.0;
var currentAngle2 = 0.0;
var currentAngle3 = 0.0;

canvas1 = document.getElementById('webgl1');
hud = document.getElementById('hud'); 

ctx = hud.getContext('2d');

var keys = new Array();
  
startupCanvases();
projMatrix1.setPerspective(100, canvas1.width/(canvas1.height), 1, 1000);
projMatrix2.setOrtho(-4, 4, -4, 4, -2, 10);
projMatrix3.setOrtho(-7, 7, -7, 7, -7, 7);
projMatrix4.setOrtho(-7, 7, -7, 7, -7, 7);


function main() {
  
  document.onkeydown = function(ev){ keydown(ev, gl1)};
  document.onkeyup = function(ev){ keyup(ev, gl1)};
  
  // Get the rendering context for WebGL
  gl1 = getWebGLContext(canvas1);
  if (!gl1) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  // Get the rendering context for 2DCG
  ctx = hud.getContext('2d');
  
  if (!gl1 || !ctx) {
    console.log('Failed to get rendering context');
    return;
  }


  // Initialize shaders
  if (!initShaders(gl1, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  

  // Set the vertex coordinates and color (the blue triangle is in the front)
  n = initVertexBuffers(gl1);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  

  // Specify the color for clearing <canvas>
  gl1.clearColor(0, 0, 0, 1);
  gl1.enable(gl1.DEPTH_TEST); 
  gl1.depthFunc(gl1.LESS);

  gl1.enable(gl1.POLYGON_OFFSET_FILL);
  gl1.polygonOffset(0.5,0.9);

  // Get the storage location of u_MvpMatrix
  u_ProjMatrix = gl1.getUniformLocation(gl1.program, 'u_ProjMatrix');
  if (!u_ProjMatrix) { 
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }
  
  u_ViewMatrix = gl1.getUniformLocation(gl1.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) { 
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ModelMatrix = gl1.getUniformLocation(gl1.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  tick = function() {
    if (fired) {};
    currentAngle1 = animate1(currentAngle1);
    currentAngle2 = animate2(currentAngle2);
    currentAngle3 = animate3(currentAngle3);
    
    if (help == 1)
      draw2D(ctx, currentAngle1); // Draw 2D

    updateCamerapos();

    gl1.clear(gl1.COLOR_BUFFER_BIT | gl1.DEPTH_BUFFER_BIT) ;

    gl1.viewport(0, window.innerHeight/2, gl1.drawingBufferWidth/2, gl1.drawingBufferHeight/2);
    drawScene(gl1, modelMatrix, viewMatrix1, projMatrix1, u_ModelMatrix, u_ViewMatrix, u_ProjMatrix, canvas1);

    gl1.viewport(window.innerWidth/2, window.innerHeight/2, gl1.drawingBufferWidth/2, gl1.drawingBufferHeight/2);
    drawScene(gl1, modelMatrix, viewMatrix2, projMatrix2, u_ModelMatrix, u_ViewMatrix, u_ProjMatrix, canvas1);

    gl1.viewport(0 , 0, gl1.drawingBufferWidth/2, gl1.drawingBufferHeight/2); 
    drawScene(gl1, modelMatrix, viewMatrix3, projMatrix3, u_ModelMatrix, u_ViewMatrix, u_ProjMatrix, canvas1);

    gl1.viewport(window.innerWidth/2 , 0, gl1.drawingBufferWidth/2, gl1.drawingBufferHeight/2);
    drawScene(gl1, modelMatrix, viewMatrix4, projMatrix4, u_ModelMatrix, u_ViewMatrix, u_ProjMatrix, canvas1);

    requestAnimationFrame(tick);   
                      // Request that the browser re-draw the webpage
  };
  tick();       

}




function drawScene(gl, modelMatrix, viewMatrix, projMatrix, u_ModelMatrix, u_ViewMatrix, u_ProjMatrix, canvas) {
 
    modelMatrix.setIdentity();


    if (axes == 0) {                      // axes

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    gl.drawArrays(gl.LINES, 124 + 24, 6);
  }


 //---------grid----------//
   modelMatrix.setIdentity();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);


   gl.drawArrays(gl.LINES, 24, 124);

//--------------grid----------------//
 
//--------------buildings----------------//
   
   modelMatrix.setIdentity();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
   gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
 //  gl.drawArrays(gl.TRIANGLES, 198, 24);

   pushMatrix();
   modelMatrix.translate(-5.0, 5.0, 0.0); 
   modelMatrix.scale(2,2,2);
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
   gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 0, 12);

   modelMatrix = popMatrix();
   pushMatrix();
   modelMatrix.translate(5.0, 5.0, 0.0); 
   modelMatrix.scale(2,2,2);
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
   gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 198, 6);

   modelMatrix = popMatrix();
   pushMatrix();
   modelMatrix.translate(5.0, -5.0, 0.0); 
   modelMatrix.scale(2,2,2);
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
   gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
   gl.drawArrays(gl.LINES, 222, 24);
   
   modelMatrix = popMatrix();
   pushMatrix();
   modelMatrix.translate(-5.0, -5.0, 0.0);
   modelMatrix.rotate(currentAngle3, 0, 1, 0); 
   modelMatrix.scale(3,.2,2);
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
   gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_FAN, 226, 12);

 //==============================================================================
            // Pink Creature
   modelMatrix.setIdentity();
   modelMatrix.translate(1.0,1.0,4.0);
   modelMatrix.scale(1.0, 1.0, -1.0);
   pushMatrix(modelMatrix);
   
   modelMatrix.rotate(currentAngle1, 0, 1, 0);
   modelMatrix.translate(1.0, 0.0, 1.0); 
   modelMatrix.scale(0.5, 1.0, 1.0);
   pushMatrix(modelMatrix);

   modelMatrix.rotate(currentAngle2, 0, 0, 1);
   modelMatrix.translate(1.0, 0.0, 1.0); 
   modelMatrix.scale(0.5, 1.0, 1.0);
   pushMatrix(modelMatrix);

   modelMatrix.rotate(currentAngle3, 1, 0, 0);
   modelMatrix.translate(1.0, 0.0, 1.0); 
   modelMatrix.scale(1.5, 1.0, 1.0);
   pushMatrix(modelMatrix);

   modelMatrix = popMatrix();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 162, 36);
   modelMatrix = popMatrix();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 162, 36);
   modelMatrix = popMatrix();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 162, 36);
   modelMatrix = popMatrix();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 162, 36);
   
   modelMatrix.rotate(currentAngle1, 0, 1, 0);
   modelMatrix.translate(-1.0, 0.0, 1.0); 
   modelMatrix.scale(0.5, -1.0, 1.0);
   pushMatrix(modelMatrix);

   modelMatrix.rotate(currentAngle2, 0, 0, 1);
   modelMatrix.translate(-1.0, 0.0, 1.0); 
   modelMatrix.scale(0.5, 1.0, 1.0);
   pushMatrix(modelMatrix);

   modelMatrix.rotate(currentAngle3, 1, 0, 0);
   modelMatrix.translate(-1.0, 0.0, 1.0); 
   modelMatrix.scale(1.5, 1.0, 1.0);
   pushMatrix(modelMatrix);

   modelMatrix = popMatrix();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 162, 36);
   modelMatrix = popMatrix();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 162, 36);
   modelMatrix = popMatrix();
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.drawArrays(gl.TRIANGLES, 162, 36);
  
  // Pink Creature
   

} 

var g_last1 = Date.now();
function animate1(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last1;
  g_last1 = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  if(angle >   10.0 && ANGLESTEP1 > 0) ANGLESTEP1 = -ANGLESTEP1;
  if(angle <  -10.0 && ANGLESTEP1 < 0) ANGLESTEP1 = -ANGLESTEP1;
  
  var newAngle = angle + (ANGLESTEP1 * elapsed) / 1000.0;
  return newAngle %= 360;
}

var g_last2 = Date.now();
function animate2(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last2;
  g_last2 = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  if(angle >   50.0 && ANGLESTEP2 > 0) ANGLESTEP2 = -ANGLESTEP2;
  if(angle <  -50.0 && ANGLESTEP2 < 0) ANGLESTEP2 = -ANGLESTEP2;
  
  var newAngle = angle + (ANGLESTEP2 * elapsed) / 1000.0;
  return newAngle %= 360;
}

var g_last3 = Date.now();
function animate3(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last3;
  g_last3 = now;
  
  var newAngle = angle + (ANGLESTEP3 * elapsed) / 1000.0;
  return newAngle %= 360;
}

function keydown(ev, gl) {
  keys[ev.keyCode] = true;
  
  fired = 1;
  switch (ev.keyCode) {
    default :
      if (ev.shiftKey == true && (keys[38] == true)) {
        LookAtYposition += 0.3;
        viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
       
      }
      if (keys[38] == true) {
          cameraYposition += 0.1;
          LookAtYposition += 0.1;
          viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
      } 
     
    case 40:
    if (ev.shiftKey == true && (keys[40] == true)) {
        LookAtYposition -= 0.3;
        viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
        break;
      }
      if (keys[40]) {
        cameraYposition -= 0.1;
        LookAtYposition -= 0.1;
        viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);  
      }
      break;
    case 39:
      if (ev.shiftKey == true && (keys[39] == true)) {
        LookAtXposition += 0.3;
        viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
      }
      if (keys[39]) {
          cameraXposition += 0.1;
          LookAtXposition += 0.1;
          viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
      }
    case 37:
      if (ev.shiftKey == true && (keys[37] == true)) {
        LookAtXposition -= 0.3;
        viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
      }

      if (keys[37]) {
          cameraXposition -= 0.1;
          LookAtXposition -= 0.1;
          viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
    }
    case 65:
      if (ev.shiftKey == true && (keys[65] == true)) {
        LookAtZposition += 0.3;
        viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
      
      }

      if (keys[65]) {
          cameraZposition += 0.1;
          LookAtZposition += 0.1;
          viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
    }
      
    case 90:
      if (ev.shiftKey == true && (keys[90] == true)) {
        LookAtZposition -= 0.3;
        viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
      
      }
      if (keys[90]) {
          cameraZposition -= 0.1;
          LookAtZposition -= 0.1;
          viewMatrix1.setLookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, 0, 0, 1);
    }
      break;    
    case 72:
          if (help == 0)
              help = 1;
          else if (help == 1) {
              help = 0;
              ctx.clearRect(0, 0, 800, 800); 
          }
          break;
    case 84:
    {
          if (toggled == 0)
          {
              toggled = 1;
              projMatrix1.setOrtho(-10, 10, -10, 10, -10, 10);
             
            }
          else if (toggled == 1) {
              toggled = 0;
              projMatrix1.setPerspective(70, canvas1.width/(canvas1.height), 1, 1000);
          }
   
   }

  // Draw
  tick();
}

}

function keyup(ev, gl) {
  keys[ev.keyCode] = false;

  fired = 0;
  tick();
}


function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
    
     0.0,  0.5, 0.0,  0.0,  0.0,  0.8, //1 Pyramid
    -0.5, 0.0, 0.0,  0.0,  0.0,  0.8, 
     0.0, 0.0, 0.5,  0.0,  0.0,  0.8, //

    -0.5,  0.0, 0.0,  0.0,  0.3,  0.0, //2
     0.0, -0.5, 0.0,  0.0,  0.3,  0.0, 
     0.0,  0.0, 0.5,  0.0,  0.3,  0.0,

     0.0, -0.5, 0.0,  0.0,  1.0,  0.3, //3
     0.5,  0.0, 0.0,  0.0,  1.0,  0.3, 
     0.0,  0.0, 0.5,  0.0,  1.0,  0.3,

     0.5,  0.0, 0.0,  0.0,  0.8,  0.0, //4
     0.0, 0.5, 0.0,  0.0,  0.8,  0.0, 
     0.0, 0.0, 0.5,  0.0,  0.8,  0.0,

     0.0,  0.5, 0.0,  0.8,  0.8,  0.0, //5 
    -0.5, 0.0, 0.0,  0.8,  0.8,  0.0, 
     0.0, 0.0, -0.5,  0.8, 0.8,  0.0,

    -0.5,  0.0, 0.0,  0.0,  0.0,  0.3, //6
     0.0, -0.5, 0.0,  0.0,  0.0,  0.3, 
     0.0,  0.0, -0.5,  0.0,  0.0,  0.3,  

     0.0, -0.5, 0.0,  0.3,  0.3,  0.0, //7
     0.5,  0.0, 0.0,  0.3,  0.3,  0.0, 
     0.0,  0.0, -0.5,  0.3,  0.3,  0.0,

     0.5,  0.0, 0.0,  0.0,  0.0,  0.8, //8
     0.0, 0.5, 0.0,  0.0,  0.0,  0.8, 
     0.0, 0.0, -0.5,  0.0,  0.0,  0.8, 

     -15,  -15, -0.00,  0.0,  0.9,  0.9, // White Floor 1
     15, -15, -0.00,  0.0,  0.9,  0.9, 

    -15,  -14, -0.00,  0.9,  0.9,  0.9, // White Floor 1
     15, -14, -0.00,  0.9,  0.9,  0.9, 

    -15,  -13, -0.00,  0.9,  0.9,  0.9, // White Floor 1
     15, -13, -0.00,  0.9,  0.9,  0.9, 


     -15,  -12, -0.00,  0.0,  0.9,  0.9, // White Floor 1
     15, -12, -0.00,  0.0,  0.9,  0.9, 

      -15,  -11, -0.00,  0.0,  0.9,  0.9, // White Floor 1
     15, -11, -0.00,  0.0,  0.9,  0.9, 

      -15,  -10, -0.00,  0.0,  0.9,  0.9, // White Floor 1
     15, -10, -0.00,  0.0,  0.9,  0.9, 
     -15, -9, -0.00,  0.9,  0.9,  0.9,
     15, -9, -0.00,  0.9,  0.9,  0.9,

     -15,  -8, -0.00,  0.9,  0.9,  0.9, // White Floor 3
     15, -8, -0.00,  0.9,  0.9,  0.9, 
     -15, -7, -0.00,  0.9,  0.9,  0.9,
     15, -7, -0.00,  0.9,  0.9,  0.9,

      -15,  -6, -0.00,  0.9,  0.9,  0.9, // White Floor 5
     15, -6, -0.00,  0.9,  0.9,  0.9, 
     -15, -5, -0.00,  0.9,  0.9,  0.9,
     15, -5, -0.00,  0.9,  0.9,  0.9,

     -15,  -4, -0.00,  0.9,  0.9,  0.9, // White Floor 7
     15, -4, -0.00,  0.9,  0.9,  0.9, 
     -15, -3, -0.00,  0.9,  0.9,  0.9,
     15, -3, -0.00,  0.9,  0.9,  0.9,

     -15,  -2, -0.00,  0.9,  0.9,  0.9, // White Floor 9
     15, -2, -0.00,  0.9,  0.9,  0.9, 
     -15, -1, -0.00,  0.9,  0.9,  0.9,
     15, -1, -0.00,  0.9,  0.9,  0.9,

     -15,  0, -0.00,  0.9,  0.9,  0.9, // White Floor 1
     15, 0, -0.00,  0.9,  0.9,  0.9, 
     -15, 1, -0.00,  0.9,  0.9,  0.9,
     15, 1, -0.00,  0.9,  0.9,  0.9,

      -15,  2, -0.00,  0.9,  0.9,  0.9, // White Floor 3
     15, 2, -0.00,  0.9,  0.9,  0.9, 
     -15, 3, -0.00,  0.9,  0.9,  0.9,
     15, 3, -0.00,  0.9,  0.9,  0.9,

     -15,  4, -0.00,  0.9,  0.9,  0.9, // White Floor 5
     15, 4, -0.00,  0.9,  0.9,  0.9, 
     -15, 5, -0.00,  0.9,  0.9,  0.9,
     15, 5, -0.00,  0.9,  0.9,  0.9,

    -15,  6, -0.00,  0.9,  0.9,  0.9, // White Floor 7
     15, 6, -0.00,  0.9,  0.9,  0.9, 
     -15, 7, -0.00,  0.9,  0.9,  0.9,
     15, 7, -0.00,  0.9,  0.9,  0.9,

     -15,  8, -0.00,  0.9,  0.9,  0.9, // White Floor 9
     15, 8, -0.00,  0.9,  0.9,  0.9, 
     -15, 9, -0.00,  0.9,  0.9,  0.9,
     15, 9, -0.00,  0.9,  0.9,  0.9,

      -15,  10, 0.00,  0.0,  0.9,  0.9, // White Floor 10
     15, 10, 0.00,  0.0,  0.9,  0.9, 
     -15, 11, 0.00,  0.0,  0.9,  0.9,
     15, 11, 0.00,  0.0,  0.9,  0.9,

     -15,  12, 0.00,  0.0,  0.9,  0.9, // White Floor 12
     15, 12, 0.00,  0.0,  0.9,  0.9, 
     -15, 13, 0.00,  0.0,  0.9,  0.9,
     15, 13, 0.00,  0.0,  0.9,  0.9,

     -15,  14, -0.00,  0.9,  0.9,  0.9, // White Floor Horizontal Done 13
     15, 14, -0.00,  0.9,  0.9,  0.9, 
     -15, 15, -0.00,  0.0,  0.9,  0.9,
     15, 15, -0.00,  0.0,  0.9,  0.9,   //31
     
   

    -15, -15, -0.00,  0.0,  0.9,  0.9, // White Floor VERTICAL Grid Starts
     -15, 15, -0.00,  0.0,  0.9,  0.9, 

     -14, -15, -0.00,  0.0,  0.9,  0.9, // White Floor VERTICAL Grid Starts
     -14, 15, -0.00,  0.0,  0.9,  0.9, 
     -13, -15, -0.00,  0.9,  0.9,  0.9, // White Floor VERTICAL Grid Starts
     -13, 15, -0.00,  0.9,  0.9,  0.9, 


     -12, -15, -0.00,  0.9,  0.9,  0.9, // White Floor VERTICAL Grid Starts
     -12, 15, -0.00,  0.9,  0.9,  0.9, 
     -11, -15, -0.00,  0.9,  0.9,  0.9,
     -11, 15, -0.00,  0.9,  0.9,  0.9,


     -10, -15, -0.00,  0.0,  0.9,  0.9, // White Floor VERTICAL Grid Starts
     -10, 15, -0.00,  0.0,  0.9,  0.9, 
     -9, -15, -0.00,  0.9,  0.9,  0.9,
     -9, 15, -0.00,  0.9,  0.9,  0.9,

     -8, -15, -0.00,  0.9,  0.9,  0.9,
     -8, 15, -0.00,  0.9,  0.9,  0.9,

     -7,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     -7, 15, -0.00,  0.9,  0.9,  0.9, 
     -6, -15, -0.00,  0.9,  0.9,  0.9,
     -6, 15, -0.00,  0.9,  0.9,  0.9,

      -5,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     -5, 15, -0.00,  0.9,  0.9,  0.9, 
     -4, -15, -0.00,  0.9,  0.9,  0.9,
     -4, 15, -0.00,  0.9,  0.9,  0.9,

     -3,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     -3, 15, -0.00,  0.9,  0.9,  0.9, 
     -2, -15, -0.00,  0.9,  0.9,  0.9,
     -2, 15, -0.00,  0.9,  0.9,  0.9,

      -1,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     -1, 15, -0.00,  0.9,  0.9,  0.9, 
     0, -15, -0.00,  0.9,  0.9,  0.9,
     0, 15, -0.00,  0.9,  0.9,  0.9,

     1,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     1, 15, -0.00,  0.9,  0.9,  0.9, 
     2, -15, -0.00,  0.9,  0.9,  0.9,
     2, 15, -0.00,  0.9,  0.9,  0.9,

     3,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     3, 15, -0.00,  0.9,  0.9,  0.9, 
     4, -15, -0.00,  0.9,  0.9,  0.9,
     4, 15, -0.00,  0.9,  0.9,  0.9,

     5,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     5, 15, -0.00,  0.9,  0.9,  0.9, 
     6, -15, -0.00,  0.9,  0.9,  0.9,
     6, 15, -0.00,  0.9,  0.9,  0.9,

     7,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     7, 15, -0.00,  0.9,  0.9,  0.9, 
     8, -15, -0.00,  0.9,  0.9,  0.9,
     8, 15, -0.00,  0.9,  0.9,  0.9,

      9,  -15, -0.00,  0.9,  0.9,  0.9, // White Floor
     9, 15, -0.00,  0.9,  0.9,  0.9, 
     10, -15, -0.00,  0.9,  0.9,  0.9,
     10, 15, -0.00,  0.9,  0.9,  0.9,

     11,  -15, 0,  0.9,  0.9,  0.9, // White Floor
     11, 15, 0,  0.9,  0.9,  0.9, 
     12, -15, 0,  0.9,  0.9,  0.9,
     12, 15, 0,  0.9,  0.9,  0.9,

     13,  -15, 0,  0.9,  0.9,  0.9, // White Floor
     13, 15, 0,  0.9,  0.9,  0.9, 
     14, -15, 0,  0.0,  0.9,  0.9,
     14, 15, 0,  0.0,  0.9,  0.9,

     15,  -15, 0,  0.0,  0.9,  0.9, // White Floor 13
     15, 15, 0,  0.0,  0.9,  0.9,                      // 31 * 2 

     -16, 0, 0.0,  0.9,  0.1,  0,  // Axes
     16, 0, 0.0,  0.9,  0.1,  0,
     0,  -16, -0.0,  0.1,  0.9,  0, 
     0, 16, -0.0,  0.1,  0.9,  0, 
     0, 0, -16,  0,  0.1,  0.9,
     0, 0, 16,  0,  0.1,  0.9,

     0.0, 0, 0.0, 0.9, 0.1, 0.5,  // Leg 1 & 3
     0.2, 0, -0.3, 0.9, 0.1, 0.5,
     0.2, 0, -0.3, 0.9, 0.1, 0.5,
     0.5, 0, -1.0, 0.1, 0.9, 0.5,

      0, 0, 0.0,  0.9,  0.1, 0.5,  // Leg 2 & 4
     0, 0.2, -0.3,  0.9,  0.1, 0.5,
     0, 0.2, -0.3,  0.9,  0.1, 0.5,
     0, 0.5, -1.0,  0.1,  0.9,  0.5,

    -1.0, -1.0, -1.0,  0.9,  0.1, 0.5,   // building 1
    1.0, -1.0, -1.0,  0.9,  0.1, 0.5,
     1.0, -1.0, 1.0,  0.9,  0.1, 0.5,     
    -1.0, -1.0, -1.0,  0.9,  0.1, 0.5,
     1.0, -1.0, 1.0,  0.9,  0.1, 0.0,
    -1.0, -1.0, 1.0,  0.9,  0.1, 0.5,

      1.0, -1.0, -1.0,  0.3,  0.1, 0.6,
      1.0, 1.0, -1.0,  0.3,  0.1, 0.5,
      1.0, 1.0, 1.0,  0.3,  0.1, 0.0,
      1.0, -1.0, -1.0,  0.3,  0.1, 0.5,   
      1.0, 1.0, 1.0,  0.3,  0.1, 0.5,
      1.0, -1.0, 1.0,  0.3,  0.1, 0.0,

      1.0, 1.0, 1.0,  0.6,  0.1, 0.5,
    -1.0, 1.0, 1.0,  0.6,  0.1, 0.5,
     -1.0, -1.0, 1.0,  0.6,  0.1, 0.0,
      1.0, 1.0, 1.0,  0.6,  0.1, 0.5,
    -1.0, -1.0, 1.0,  0.6,  0.1, 0.5,
     1.0, -1.0, 1.0,  0.6,  0.1, 0.0,

    -1.0, 1.0, -1.0,  0.9,  0.1, 0.5,   // building 1
    1.0, 1.0, -1.0,  0.9,  0.1, 0.5,
     1.0, 1.0, 1.0,  0.9,  0.1, 0.5,     
    -1.0, 1.0, -1.0,  0.9,  0.1, 0.5,
     1.0, 1.0, 1.0,  0.9,  0.1, 0.0,
    -1.0, 1.0, 1.0,  0.9,  0.1, 0.5,

      -1.0, -1.0, -1.0,  0.9,  0.1, 0.6,
      -1.0, 1.0, -1.0,  0.9,  0.1, 0.5,
      -1.0, 1.0, 1.0,  0.9,  0.1, 0.0,
      -1.0, -1.0, -1.0,  0.9,  0.1, 0.5,   
      -1.0, 1.0, 1.0,  0.9,  0.1, 0.5,
      -1.0, -1.0, 1.0,  0.9,  0.1, 0.0,

      1.0, 1.0, -1.0,  0.7,  0.1, 0.5,
    -1.0, 1.0, -1.0,  0.7,  0.1, 0.5,
     -1.0, -1.0, -1.0,  0.7,  0.1, 0.0,
      1.0, 1.0, -1.0,  0.7,  0.1, 0.5,
    -1.0, -1.0, -1.0,  0.7,  0.1, 0.5,
     1.0, -1.0, -1.0,  0.7,  0.1, 0.0,

     -0.5,  0.0, 0.0,  0.0,  1.0,  0.8, //2 Pyramid
     0.5, 0.0, 0.0,  0.0,  1.0,  0.8, 
     0.0, 0.5, 0.0,  0.0,  1.0,  0.8, //

     0.5,  0.0, 0.0,  1.0,  0.3,  0.0, //2
     -0.5, 0.0, 0.0,  1.0,  0.3,  0.0, 
     0.0,  -0.5, 0.0,  1.0,  0.3,  0.0,

     0.0, -0.5, 0.0,  0.0,  1.0,  0.3, //3
     -0.5,  0.0, 0.0,  0.0,  1.0,  0.3, 
     0.5,  0.0, 0.0,  0.0,  1.0,  0.3,

     0.5,  0.0, 0.0,  0.0,  0.8,  0.0, //4
     -0.5, 0.5, 0.0,  0.0,  0.8,  0.0, 
     0.0, 0.0, 0.5,  0.0,  0.8,  0.0,

     0.0,  0.5, 0.0,  0.8,  0.8,  0.0, //5 
    -0.5, 0.0, 0.0,  0.8,  0.8,  0.0, 
     0.0, 0.0, -0.5,  0.8, 0.8,  0.0,

    -0.5,  0.0, 0.0,  1.0,  0.0,  0.3, //6
     0.0, -0.5, 0.0,  1.0,  0.0,  0.3, 
     0.0,  0.0, -0.5,  1.0,  0.0,  0.3,  

     0.0, -0.5, 0.0,  0.3,  0.3,  0.0, //7
     0.5,  0.0, 0.0,  0.3,  0.3,  0.0, 
     0.0,  0.0, -0.5,  0.3,  0.3,  0.0,

     0.5,  0.0, 0.0,  0.0,  0.0,  0.8, //8
     0.0, 0.5, 0.0,  0.0,  0.0,  0.8, 
     0.0, 0.0, -0.5,  0.0,  0.0,  0.8,

     0.0,  0.5, 0.0,  0.0,  0.0,  0.8, //3 Pyramid
    -0.5, 0.0, 0.0,  0.0,  0.0,  0.8, 
     0.0, 0.0, 0.5,  0.0,  0.0,  0.8, //

    -0.5,  0.0, 0.0,  0.0,  0.3,  0.0, //2
     0.0, -0.5, 0.0,  0.0,  0.3,  0.0, 
     0.0,  0.0, 0.5,  0.0,  0.3,  0.0,

     0.0, -0.5, 0.0,  0.0,  1.0,  0.3, //3
     0.5,  0.0, 0.0,  0.0,  1.0,  0.3, 
     0.0,  0.0, 0.5,  0.0,  1.0,  0.3,

     0.5,  0.0, 0.0,  0.0,  0.8,  0.0, //4
     0.0, 0.5, 0.0,  0.0,  0.8,  0.0, 
     0.0, 0.0, 0.5,  0.0,  0.8,  0.0,

     0.0,  0.5, 0.0,  0.8,  0.8,  0.0, //5 
    -0.5, 0.0, 0.0,  0.8,  0.8,  0.0, 
     0.0, 0.0, -0.5,  0.8, 0.8,  0.0,

    -0.5,  0.0, 0.0,  0.0,  0.0,  0.3, //6
     0.0, -0.5, 0.0,  0.0,  0.0,  0.3, 
     0.0,  0.0, -0.5,  0.0,  0.0,  0.3,  

     0.0, -0.5, 0.0,  0.3,  0.3,  0.0, //7
     0.5,  0.0, 0.0,  0.3,  0.3,  0.0, 
     0.0,  0.0, -0.5,  0.3,  0.3,  0.0,

     0.5,  0.0, 0.0,  0.0,  0.0,  0.8, //8
     0.0, 0.5, 0.0,  0.0,  0.0,  0.8, 
     0.0, 0.0, -0.5,  0.0,  0.0,  0.8, 

     0.0,  0.5, 0.0,  0.0,  0.0,  0.8, //4 Pyramid
    -0.5, 0.0, 0.0,  0.0,  0.0,  0.8, 
     0.0, 0.0, 0.5,  0.0,  0.0,  0.8, //

    -0.5,  0.0, 0.0,  0.0,  0.3,  0.0, //2
     0.0, -0.5, 0.0,  0.0,  0.3,  0.0, 
     0.0,  0.0, 0.5,  0.0,  0.3,  0.0,

     0.0, -0.5, 0.0,  0.0,  1.0,  0.3, //3
     0.5,  0.0, 0.0,  0.0,  1.0,  0.3, 
     0.0,  0.0, 0.5,  0.0,  1.0,  0.3,

     0.5,  0.0, 0.0,  0.0,  0.8,  0.0, //4
     0.0, 0.5, 0.0,  0.0,  0.8,  0.0, 
     0.0, 0.0, 0.5,  0.0,  0.8,  0.0,

     0.0,  0.5, 0.0,  0.8,  0.8,  0.0, //5 
    -0.5, 0.0, 0.0,  0.8,  0.8,  0.0, 
     0.0, 0.0, -0.5,  0.8, 0.8,  0.0,

    -0.5,  0.0, 0.0,  0.0,  0.0,  0.3, //6
     0.0, -0.5, 0.0,  0.0,  0.0,  0.3, 
     0.0,  0.0, -0.5,  0.0,  0.0,  0.3,  

     0.0, -0.5, 0.0,  0.3,  0.3,  0.0, //7
     0.5,  0.0, 0.0,  0.3,  0.3,  0.0, 
     0.0,  0.0, -0.5,  0.3,  0.3,  0.0,

     0.5,  0.0, 0.0,  0.0,  0.0,  0.8, //8
     0.0, 0.5, 0.0,  0.0,  0.0,  0.8, 
     0.0, 0.0, -0.5,  0.0,  0.0,  0.8,  

  ]);
  

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the vertex information and enable it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  return;
}

function startupCanvases() { 
            canvas1.width  = window.innerWidth/1.01;
            canvas1.height = window.innerHeight/1.15;
            ctx.width  = window.innerWidth/1.01;
            ctx.height = window.innerHeight/1.01;
            
}

function resize_canvas() {
            canvas1.width  = window.innerWidth/1.01;
            canvas1.height = window.innerHeight/1.15;
            ctx.width  = window.innerWidth/1.01;
            ctx.height = window.innerHeight/1.01;

            window.location.reload()
}

function draw2D(ctx, currentAngle) {


  ctx.clearRect(0, 0, 800, 800); // Clear <hud>
  // Draw triangle with white lines

  // Draw white letters
  ctx.font = '30px "Lucida Console"';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
  ctx.fillText('-UL ViewPort is Front Persp.', 40, 50); 
  ctx.fillText('-UR ViewPort is Front Ortho.', 40, 90); 
  ctx.fillText('-LL ViewPort is Top Ortho', 40, 130); 
  ctx.fillText('-LR ViewPort is Side Ortho.', 40, 170); 
  ctx.fillText('-Toggle Uppr Lft ViewPort with an', 40, 210); 
  ctx.fillText(' Orthogonal Projection by pressing \'t\' ', 40, 250);
  ctx.fillText('-Shift the Controls to the Camera ', 40, 290); 
  ctx.fillText(' to change the LookAt Point', 40, 330);  

}

function updateCamerapos() {
  camerapos = document.getElementById('cameraposition');
  camerapos.innerHTML = 'Camera X Position: ' + cameraXposition.toFixed(3) + ' RArrow/LArrow to add/sub 0.1 to Cam X Pos ' + '--------LookAtXposition: ' + LookAtXposition.toFixed(3) + '<br>' +
                        'Camera Y Position: ' + cameraYposition.toFixed(3) + ' UpArrow/DownArrow to add/sub 0.1 to Cam Y Pos ' + '--------LookAtYposition: ' + LookAtYposition.toFixed(3) + '<br>' +
                        'Camera Z Position: ' + cameraZposition.toFixed(3) + " 'A' / 'Z' to add/sub 0.1 to Cam Z Pos " + '--------LookAtZposition: ' + LookAtZposition.toFixed(3) + '<br>';
}

