// PointLightedCube_perFragment.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
   //  'attribute vec4 a_Color;\n' + // Defined constant in main()
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  //'attribute vec3 a_Ke;\n' +              // Phong Reflectance: emittance
  //'attribute vec3 a_Ka;\n' +              // Phong Reflectance: ambient
//  'uniform vec3 u_Kd;\n' +              // Phong Reflectance: diffuse
  //'attribute vec3 a_Ks;\n' +              // Phong Reflectance: specular


  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  
  'void main() {\n' +
  '  vec4 color = vec4(1.0, 0.3, 1.0, 1.0);\n' + // Sphere color
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate the vertex position in the world coordinate
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = color;\n' + 
  //'  v_Kd = u_Kd;\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'uniform vec3 u_SpecLight;\n' +   // Specular light color

  'uniform vec3 u_LightColor2;\n' +     // Light color 2
  'uniform vec3 u_LightPosition2;\n' +  // Position of the light source 2
  'uniform vec3 u_AmbientLight2;\n' +   // Ambient light color 2
  'uniform vec3 u_SpecLight2;\n' +   // Specular light color 2 



  'uniform vec3 u_eyeDirection;\n' +   // eye vector for specular lighting
  
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'uniform vec3 u_Ke;\n' +
  'uniform vec3 u_Ka;\n' +
  'uniform vec3 u_Kd;\n' +
  'uniform vec3 u_Ks;\n' + 
  'uniform vec3 clear_Ke;\n' +    //clears emmisive from Light Source 1
  'uniform vec3 clear_Ka;\n' +    //clears ambient from Light Source 1
  'uniform vec3 clear_Kd;\n' +    //clears diffuse from Light Source 1
  'uniform vec3 clear_Ks;\n' +    //clears specular from Light Source 1 

  'uniform vec3 clear_Ke2;\n' +    //clears emmisive from Light Source 2
  'uniform vec3 clear_Ka2;\n' +    //clears ambient from Light Source 2
  'uniform vec3 clear_Kd2;\n' +    //clears diffuse from Light Source 2
  'uniform vec3 clear_Ks2;\n' +    //clears specular from Light Source 2  

  'uniform float u_Kshiny;\n' +


  'void main() {\n' +
     // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' + //normalize(v_Normal)
     // Calculate the light direction and make it 1.0 in length
  
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
  '  vec3 lightDirection2 = normalize(u_LightPosition2 - v_Position);\n' +
  
  '  vec3 eyeDirection = normalize(u_eyeDirection - v_Position);\n' + // normalize(u_eyeDirection - v_Position)
     // The dot product of the light direction and the normal

  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  '  float nDotL2 = max(dot(lightDirection2, normal), 0.0);\n' +

     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 diffuse2 = clear_Kd2 * u_LightColor2 * v_Color.rgb * nDotL2 * u_Kd;\n' +
  '  vec3 ambient2 = clear_Ka2 * u_AmbientLight2 * v_Color.rgb * u_Ka;\n' +
  '  vec3 foruseinSpecular2 = vec3(2.0, 2.0, 2.0) * normal * dot(normal, lightDirection2) - lightDirection2 ;\n' +         // C = N * dot(N,L)  // this line computes R // R = 2c - L
  '  vec3 specular2 = clear_Ks2 * u_SpecLight2 * u_Ks *  pow(max(dot(eyeDirection, foruseinSpecular2), 0.0), u_Kshiny) ;\n' + // R = 2c - L
  
  '  vec3 emissive = clear_Ke * u_Ke;' +
  '  vec3 diffuse = clear_Kd * u_LightColor * v_Color.rgb * nDotL * u_Kd;\n' +
  '  vec3 ambient = clear_Ka * u_AmbientLight * v_Color.rgb * u_Ka;\n' +
  '  vec3 foruseinSpecular = vec3(2.0, 2.0, 2.0) * normal * dot(normal, lightDirection) - lightDirection ;\n' +         // C = N * dot(N,L)  // this line computes R // R = 2c - L
 // '  vec3 foruseinSpecular2 = vec3(2.0, 2.0, 2.0) * normal * dot(normal, lightDirection) - lightDirection ;\n' + 
  '  vec3 specular = clear_Ks * u_SpecLight * u_Ks *  pow(max(dot(eyeDirection, foruseinSpecular), 0.0), u_Kshiny) ;\n' + // R = 2c - L
  '  gl_FragColor = vec4(diffuse + ambient + emissive + specular + diffuse2 + ambient2 + specular2, 1.0);\n' +
  '}\n';

var canvas = document.getElementById('webgl');
var gl;
var AmountofCubeIndices;
var AmountofSphereIndices;
var AmountofSphereandCubeIndices;
var AmountofSphereandCubeandPyramidIndices;
var AmountofGridIndices;
var amountofgridvertices;


//Angle for Animation
var ANGLESTEP1 = 1.0;
var ANGLESTEP2 = 1.0;
var ANGLESTEP3 = 1.0;
var currentAngle1 = 0.0;
var currentAngle2 = 0.0;
var currentAngle3 = 0.0;
var g_last1 = Date.now();
var g_last2 = Date.now();
var g_last3 = Date.now();


var modelMatrix = new Matrix4();  // Model matrix
var mvpMatrix = new Matrix4();    // Model view projection matrix
var viewProjectionMatrix = new Matrix4();    // Model view projection matrix
var normalMatrix = new Matrix4(); // Transformation matrix for normals

var positions = [];
var normalsArray = [];
var indices = [];

 //2nd Light Position
 var Light2Xposition = -5.0;
 var Light2Yposition = -5.0;
 var Light2Zposition = 5.0;

// keys is array that holds event handlers
var keys = new Array();
// Variable For Camera
var cameraXposition = 0.0;
var cameraYposition = -10.0;
var cameraZposition = 0.0;
var LookAtXposition = 0;
var LookAtYposition = 0;
var LookAtZposition = 0;
var upVecX = 0;
var upVecY = 0;
var upVecZ = 1;

//State Variables
var axes = 0; // toggles the drawing of the x, y, and z axes
var tick;
var help = 0;
var fired = 0;
var isOrtho = 0;
var toggled = 0;

//Toggle Lights values
var clear_Ke ;
var clear_Ka ;
var clear_Kd ;
var clear_Ks ;
var clear_Ke2 ;
var clear_Ka2 ;
var clear_Kd2 ;
var clear_Ks2 ;
var q = 0.0;
var w = 0.0;
var e = 0.0;
var r = 0.0;
var t = 0.0;
var y = 0.0;
var u = 0.0;
var i = 0.0;

//Angles for Pink Creature
var ANGLESTEP1 = 45.0;
var ANGLESTEP2 = 45.0;
var ANGLESTEP3 = 45.0;
var currentAngle1 = 0.0;
var currentAngle2 = 0.0;
var currentAngle3 = 0.0;

//hud = document.getElementById('hud'); 
//ctx = hud.getContext('2d');


function main() {
  // Retrieve <canvas> element
  
  startupCanvas();


 //-------------------------------------------------------------------------------------------------------Code below this line animates the angles
function animate1(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last1;
  g_last1 = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  if(angle >   10.0 && ANGLESTEP1 > 10) ANGLESTEP1 = -ANGLESTEP1;
  if(angle <  -10.0 && ANGLESTEP1 < 10) ANGLESTEP1 = -ANGLESTEP1;
  
  var newAngle = angle + (ANGLESTEP1 * elapsed) / 10000.0;
  return newAngle%360;
}

function animate2(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last2;
  g_last2 = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  // if(angle >   50.0 && ANGLESTEP2 > 0) ANGLESTEP2 = -ANGLESTEP2;
  // if(angle <  -50.0 && ANGLESTEP2 < 0) ANGLESTEP2 = -ANGLESTEP2;
  
  var newAngle = angle + (ANGLESTEP2 * elapsed) / 1000.0;
  return newAngle %= 360;
}

function animate3(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last3;
  g_last3 = now;
  
  var newAngle = angle + (ANGLESTEP3 * elapsed) / 1000.0;
  return newAngle %= 360;
}
 //-------------------------------------------------------------------------------------------------------Code Above this line animates the angles



  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  document.onkeydown = function(ev){ keydown(ev, gl)};
  document.onkeyup = function(ev){ keyup(ev, gl)};

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_SpecLight = gl.getUniformLocation(gl.program, 'u_SpecLight');
  var u_eyeDirection = gl.getUniformLocation(gl.program, 'u_eyeDirection');

  // Light Info for 2nd Light
  var u_LightColor2 = gl.getUniformLocation(gl.program, 'u_LightColor2');
  var u_LightPosition2 = gl.getUniformLocation(gl.program, 'u_LightPosition2');
  var u_AmbientLight2 = gl.getUniformLocation(gl.program, 'u_AmbientLight2');
  var u_SpecLight2 = gl.getUniformLocation(gl.program, 'u_SpecLight2');

  // Clear Light 1 values
  clear_Ke = gl.getUniformLocation(gl.program, 'clear_Ke');
  clear_Ka = gl.getUniformLocation(gl.program, 'clear_Ka');
  clear_Kd = gl.getUniformLocation(gl.program, 'clear_Kd');
  clear_Ks = gl.getUniformLocation(gl.program, 'clear_Ks');
  // Clear Light 2 values
  clear_Ke2 = gl.getUniformLocation(gl.program, 'clear_Ke2');
  clear_Ka2 = gl.getUniformLocation(gl.program, 'clear_Ka2');
  clear_Kd2 = gl.getUniformLocation(gl.program, 'clear_Kd2');
  clear_Ks2 = gl.getUniformLocation(gl.program, 'clear_Ks2');

  gl.uniform3f(clear_Ke, 1.0, 1.0, 1.0);
  gl.uniform3f(clear_Ka, 1.0, 1.0, 1.0);
  gl.uniform3f(clear_Kd, 1.0, 1.0, 1.0);
  gl.uniform3f(clear_Ks, 1.0, 1.0, 1.0);
  gl.uniform3f(clear_Ke2, 1.0, 1.0, 1.0);
  gl.uniform3f(clear_Ka2, 1.0, 1.0, 1.0);
  gl.uniform3f(clear_Kd2, 1.0, 1.0, 1.0);
  gl.uniform3f(clear_Ks2, 1.0, 1.0, 1.0);

  if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight || !u_SpecLight || !u_eyeDirection) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
  gl.uniform3f(u_SpecLight, 0.25, 0.25, 0.25);
  gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
 
  //Set the 2nd Light Info
  gl.uniform3f(u_LightColor2, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition2, Light2Xposition, Light2Yposition, Light2Zposition);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight2, 0.2, 0.2, 0.2);
  gl.uniform3f(u_SpecLight2, 0.25, 0.25, 0.25);




    // ... for Phong material/reflectance:
  var u_Ke = gl.getUniformLocation(gl.program, 'u_Ke');
  var u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
 var u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
  var u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
  var u_Kshiny = gl.getUniformLocation(gl.program, 'u_Kshiny');
  
  if( !u_Ka || !u_Kd || !u_Ke || !u_Ks || !u_Kshiny) {
    console.log('Failed to get the Phong Reflectance storage locations');
  }

  // Clear color and depth buffer
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clearColor(0.05, 0.0, 0.0, 1.0);
 


 //  // DRAW THE SPHERE
 //  gl.drawElements(gl.TRIANGLES, AmountofSphereIndices, gl.UNSIGNED_SHORT, 0);

 //  // case MATL_TURQUOISE:
 //  //       K_emit.put(0.0,      0.0,      0.0,      1.0);
 //  //       K_ambi.put(0.1,      0.18725,  0.1745,   0.8);
 //  //       K_diff.put(0.396,    0.74151,  0.69102,  0.8);
 //  //       K_spec.put(0.297254, 0.30829,  0.306678, 0.8);   K_shiny = 12.8f;
 //  gl.uniform3f(u_Ka, 0.1, 0.18725, 0.1745);   // Ka diffuse
 //  gl.uniform3f(u_Kd, 0.396, 0.74151, 0.69102);   // Kd diffuse
 //  gl.uniform3f(u_Ke, 0.0, 0.0, 0.0);   // Ke diffuse
 //  gl.uniform3f(u_Ks, 0.297254, 0.30829, 0.306678);   // Ks diffuse
 //  gl.uniform1f(u_Kshiny, 12.8); // Kshiny
 //  mvpMatrix.setIdentity();
 //  modelMatrix.setRotate(0, 0, 1, 0); // Rotate around the y-axis
 //  modelMatrix.translate(0, 0, -2.0);
 //  // Calculate the view projection matrix
 //  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
 //  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
 //  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
 //  // Calculate the matrix to transform the normal based on the model matrix
 //  normalMatrix.setInverseOf(modelMatrix);
 //  normalMatrix.transpose();
 //  // Pass the model matrix to u_ModelMatrix
 //  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
 //  // Pass the model view projection matrix to u_mvpMatrix
 //  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
 //  // Pass the transformation matrix for normals to u_NormalMatrix
 //  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
 //  // Clear color and depth buffer
 //  // DRAW THE SPHERE
 //  gl.drawElements(gl.TRIANGLES, AmountofSphereIndices, gl.UNSIGNED_SHORT, 0);
  
 //  // case MATL_EMERALD:
 //  //       K_emit.put(0.0,     0.0,      0.0,     1.0);
 //  //       K_ambi.put(0.0215,  0.1745,   0.0215,  0.55);
 //  //       K_diff.put(0.07568, 0.61424,  0.07568, 0.55);
 //  //       K_spec.put(0.633,   0.727811, 0.633,   0.55);   K_shiny = 76.8f;
 //  gl.uniform3f(u_Ka, 0.0215, 0.01745, 0.0215);   // Ka diffuse
 //  gl.uniform3f(u_Kd, 0.07568, 0.61424, 0.07568);   // Kd diffuse
 //  gl.uniform3f(u_Ke, 0.0, 0.0, 0.0);   // Ke diffuse
 //  gl.uniform3f(u_Ks, 0.633, 0.727811, 0.33);   // Ks diffuse
 //  gl.uniform1f(u_Kshiny, 1.8); // Kshiny
 //  mvpMatrix.setIdentity();
 //  modelMatrix.setRotate(90, 0, 1, 0); // Rotate around the y-axis
 //  modelMatrix.scale(0.5,0.5,0.5);
 //  modelMatrix.translate(0.0, 0.0, 3.0);
 //  // Calculate the view projection matrix
 //  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
 //  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
 //  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
 //  // Calculate the matrix to transform the normal based on the model matrix
 // normalMatrix.setInverseOf(modelMatrix);
 // normalMatrix.transpose();
 //  // Pass the model matrix to u_ModelMatrix
 // gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
 //  // Pass the model view projection matrix to u_mvpMatrix
 // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
 //  // Pass the transformation matrix for normals to u_NormalMatrix
 // gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
 //  // Clear color and depth buffer
 // //DRAW THE CUBE
 // gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, AmountofSphereIndices*2);

  //--------------------------------------------------------Important
viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);


console.log('yeah');

 tick = function() {
    currentAngle1 = animate1(currentAngle1);
    currentAngle2 = animate2(currentAngle2);
    currentAngle3 = animate3(currentAngle3);
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  updateCamerapos();

//Draw the grid
  mvpMatrix.setIdentity();
  modelMatrix.setRotate(0, 0, 0, 1); // Rotate around the y-axis
  modelMatrix.translate(0, 0, -1.0);
  // Calculate the view projection matrix
  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Clear color and depth buffer
  // DRAW THE GRID
  gl.drawArrays(gl.LINES, AmountofSphereandCubeandPyramidIndices, amountofgridvertices);


// case RED_PLASTIC:
  //       K_emit.put(0.0,      0.0,      0.0,      1.0);
  //       K_ambi.put(0.1,      0.18725,  0.1745,   0.8);
  //       K_diff.put(0.396,    0.74151,  0.69102,  0.8);
  //       K_spec.put(0.297254, 0.30829,  0.306678, 0.8);   K_shiny = 12.8f;
    gl.uniform3f(u_Ka, 0.1, 0.1, 0.1);   // Ka diffuse
  gl.uniform3f(u_Kd, 0.6, 0.0, 0.0);   // Kd diffuse
  gl.uniform3f(u_Ke, 0.0, 0.0, 0.0);   // Ke diffuse
  gl.uniform3f(u_Ks, 0.6, 0.6, 0.6);   // Ks diffuse
  gl.uniform1f(u_Kshiny, 10.8); // Kshiny
  mvpMatrix.setIdentity();
  modelMatrix.setRotate(currentAngle1, 0, 1, 0); // Rotate around the y-axis
// console.log(currentAngle1);
  modelMatrix.translate(4, 0, 2.0);
  // Calculate the view projection matrix
  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Clear color and depth buffer
  // DRAW THE SPHERE
  gl.drawElements(gl.TRIANGLES, AmountofSphereIndices, gl.UNSIGNED_SHORT, 0);
  

  mvpMatrix.setIdentity();
  modelMatrix.scale(0.8,0.8,0.8); 
  modelMatrix.translate(0.6, 1.0, 1.5);
  modelMatrix.rotate(currentAngle1, 0, 1, 0); // Rotate around the y-axis
   mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
//draw second sphere
gl.drawElements(gl.TRIANGLES, AmountofSphereIndices, gl.UNSIGNED_SHORT, 0);

mvpMatrix.setIdentity();
  modelMatrix.scale(0.8,0.8,0.8); 
  modelMatrix.translate(0.6, 1.0, 1.5);
  modelMatrix.rotate(currentAngle1, 0, 1, 0); // Rotate around the y-axis
   mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
//draw second sphere
gl.drawElements(gl.TRIANGLES, AmountofSphereIndices, gl.UNSIGNED_SHORT, 0);

  // case MAUVE:
  //       K_emit.put(0.0,      0.0,      0.0,      1.0);
  //       K_ambi.put(0.1,      0.18725,  0.1745,   0.8);
  //       K_diff.put(0.396,    0.74151,  0.69102,  0.8);
  //       K_spec.put(0.297254, 0.30829,  0.306678, 0.8);   K_shiny = 12.8f;
  gl.uniform3f(u_Ka, 0.1, 0.18725, 0.1745);   // Ka diffuse
  gl.uniform3f(u_Kd, 0.396, 0.74151, 0.69102);   // Kd diffuse
  gl.uniform3f(u_Ke, 0.0, 0.0, 0.0);   // Ke diffuse
  gl.uniform3f(u_Ks, 0.297254, 0.30829, 0.306678);   // Ks diffuse
  gl.uniform1f(u_Kshiny, 12.8); // Kshiny

  mvpMatrix.setIdentity();
  modelMatrix.setTranslate(-2, 0, 1.0);
  modelMatrix.rotate(currentAngle2, 0, 0, 1); // Rotate around the y-axis
  // Calculate the view projection matrix
  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Clear color and depth buffer
  // DRAW THE PYRAMID
  gl.drawArrays(gl.TRIANGLES, AmountofSphereandCubeIndices, 18);
   mvpMatrix.setIdentity();
  modelMatrix.translate(0.0, 0, 0.4);
  modelMatrix.rotate(currentAngle2, 0, 0, 1); // Rotate around the y-axis
  // Calculate the view projection matrix
  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // DRAW THE PYRAMID
  gl.drawArrays(gl.TRIANGLES, AmountofSphereandCubeIndices, 18);

  mvpMatrix.setIdentity();
  modelMatrix.translate(0.0, 0, 0.4);
  modelMatrix.rotate(currentAngle2, 0, 0, 1); // Rotate around the y-axis
  // Calculate the view projection matrix
  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, AmountofSphereandCubeIndices, 18);
  // Clear color and depth buffer
  // DRAW THE PYRAMID
  //-------------------------------------------------------------
  // case MATL_EMERALD:
  //       K_emit.put(0.0,     0.0,      0.0,     1.0);
  //       K_ambi.put(0.0215,  0.1745,   0.0215,  0.55);
  //       K_diff.put(0.07568, 0.61424,  0.07568, 0.55);
  //       K_spec.put(0.633,   0.727811, 0.633,   0.55);   K_shiny = 76.8f;
  gl.uniform3f(u_Ka, 0.0215, 0.01745, 0.0215);   // Ka diffuse
  gl.uniform3f(u_Kd, 0.07568, 0.61424, 0.07568);   // Kd diffuse
  gl.uniform3f(u_Ke, 0.0, 0.0, 0.0);   // Ke diffuse
  gl.uniform3f(u_Ks, 0.633, 0.727811, 0.33);   // Ks diffuse
  gl.uniform1f(u_Kshiny, 1.8); // Kshiny
  mvpMatrix.setIdentity();
  modelMatrix.setRotate(currentAngle1, 0, 1, 0); // Rotate around the y-axis
  modelMatrix.rotate(currentAngle3, 1, 0, 0);
  modelMatrix.scale(0.3,0.3,0.3);
  modelMatrix.translate(0.0, 7.0, 3.0);
  // Calculate the view projection matrix
  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
 normalMatrix.setInverseOf(modelMatrix);
 normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
 gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
 gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
 gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Clear color and depth buffer
 //DRAW THE CUBE
 gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, AmountofSphereIndices*2);
 //-----****
 mvpMatrix.setIdentity();
  modelMatrix.setRotate(currentAngle1, 0, 1, 0); // Rotate around the y-axis
  modelMatrix.rotate(currentAngle3, 1, 0, 0);
  modelMatrix.scale(0.1,0.5,0.5);
  modelMatrix.translate(0.0, 1.0, 1.0);
  // Calculate the view projection matrix
  // viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // viewProjectionMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
 normalMatrix.setInverseOf(modelMatrix);
 normalMatrix.transpose();
  // Pass the model matrix to u_ModelMatrix
 gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_mvpMatrix
 gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Pass the transformation matrix for normals to u_NormalMatrix
 gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Clear color and depth buffer
 //DRAW THE CUBE
 gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, AmountofSphereIndices*2);

 requestAnimationFrame(tick);   
                      // Request that the browser re-draw the webpage
  };
  
console.log('y');
  tick();       




function keydown(ev, gl) {
  keys[ev.keyCode] = true;
  
  fired = 1;
  switch (ev.keyCode) {
    case 38:
      if (ev.shiftKey == true && (keys[38] == true)) {
        LookAtYposition += 0.3;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
      break;
      }

      if (keys[38] == true) {
        cameraYposition += 0.1;
        LookAtYposition += 0.1;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
      } 
     break;
    case 40:
    if (ev.shiftKey == true && (keys[40] == true)) {
        LookAtYposition -= 0.3;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
        
        break;
      }
      if (keys[40]) {
        cameraYposition -= 0.1;
        LookAtYposition -= 0.1;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
       
      }
      break;
    case 39:
      if (ev.shiftKey == true && (keys[39] == true)) {
        LookAtXposition += 0.3;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
       break;
      }
      if (keys[39]) {
          cameraXposition += 0.1;
          LookAtXposition += 0.1;
          viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
         
      }
      break;
    case 37:
      if (ev.shiftKey == true && (keys[37] == true)) {
        LookAtXposition -= 0.3;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
       break;
      }

      if (keys[37]) {
          cameraXposition -= 0.1;
          LookAtXposition -= 0.1;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
          
    }
    break;
    case 65:
      if (ev.shiftKey == true && (keys[65] == true)) {
        LookAtZposition += 0.3;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
        
      break;
      }

      if (keys[65]) {
          cameraZposition += 0.1;
          LookAtZposition += 0.1;
          viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
          
    }
      break;
    case 90:
      if (ev.shiftKey == true && (keys[90] == true)) {
        LookAtZposition -= 0.3;
        viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
        
      break;
      }
      if (keys[90]) {
          cameraZposition -= 0.1;
          LookAtZposition -= 0.1;
          viewProjectionMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
        viewProjectionMatrix.lookAt(cameraXposition, cameraYposition, cameraZposition, LookAtXposition, LookAtYposition, LookAtZposition, upVecX, upVecY, upVecZ);
        gl.uniform3f(u_LightPosition, cameraXposition, cameraYposition, cameraZposition);   //--------------------------------------------------------Important
        gl.uniform3f(u_eyeDirection, cameraXposition, cameraYposition, cameraZposition);
        mvpMatrix.multiply(viewProjectionMatrix).multiply(modelMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();
        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Pass the model view projection matrix to u_mvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Pass the transformation matrix for normals to u_NormalMatrix
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
        
    }
      break;    
    //toggle headlight values
    case 81:
          if( q == 0 ){
            gl.uniform3f(clear_Ke, 0.0, 0.0, 0.0);
            q = 1;         
          } else if (q == 1){
            gl.uniform3f(clear_Ke, 1.0, 1.0, 1.0);
            q = 0;
          }
          break;

    case 87:
          if( w == 0 ){
            gl.uniform3f(clear_Ka, 0.0, 0.0, 0.0);
            w = 1;         
          } else if (w == 1){
            gl.uniform3f(clear_Ka, 1.0, 1.0, 1.0);
            w = 0;
          }
          break;
    case 69:
          if( e == 0 ){
            gl.uniform3f(clear_Kd, 0.0, 0.0, 0.0);
            e = 1;         
          } else if (e == 1){
            gl.uniform3f(clear_Kd, 1.0, 1.0, 1.0);
            e = 0;
          }
          break;

    case 82:
          if( r == 0 ){
            gl.uniform3f(clear_Ks, 0.0, 0.0, 0.0);
            r = 1;         
          } else if (r == 1){
            gl.uniform3f(clear_Ks, 1.0, 1.0, 1.0);
            r = 0;
          }
          break;
      // 2nd Light Controls
      case 84:
          if( t == 0 ){
            gl.uniform3f(clear_Ke2, 0.0, 0.0, 0.0);
            t = 1;         
          } else if (t == 1){
            gl.uniform3f(clear_Ke2, 1.0, 1.0, 1.0);
            t = 0;
          }
          break;

    case 89:
          if( y == 0 ){
            gl.uniform3f(clear_Ka2, 0.0, 0.0, 0.0);
            y = 1;         
          } else if (y == 1){
            gl.uniform3f(clear_Ka2, 1.0, 1.0, 1.0);
            y = 0;
          }
          break;
    case 85:
          if( u == 0 ){
            gl.uniform3f(clear_Kd2, 0.0, 0.0, 0.0);
            u = 1;         
          } else if (u == 1){
            gl.uniform3f(clear_Kd2, 1.0, 1.0, 1.0);
            u = 0;
          }
          break;

    case 73:
          if( i == 0 ){
            gl.uniform3f(clear_Ks2, 0.0, 0.0, 0.0);
            i = 1;         
          } else if (i == 1){
            gl.uniform3f(clear_Ks2, 1.0, 1.0, 1.0);
            i = 0;
          }
          break;
      //Controls 2nd Light Position
    case 72:
      Light2Xposition += 0.4;
      gl.uniform3f(u_LightPosition2, Light2Xposition, Light2Yposition, Light2Zposition);
      break;
      break;
    case 66:
      Light2Xposition -= 0.4;
      gl.uniform3f(u_LightPosition2, Light2Xposition, Light2Yposition, Light2Zposition);
      break;
      break;
    case 74:
      Light2Yposition += 0.4;
      gl.uniform3f(u_LightPosition2, Light2Xposition, Light2Yposition, Light2Zposition);
      break;
      break;
    case 78:
       Light2Yposition -= 0.4;
       gl.uniform3f(u_LightPosition2, Light2Xposition, Light2Yposition, Light2Zposition);
       break;
       break;
    case 75:
      Light2Zposition += 0.4;
      gl.uniform3f(u_LightPosition2, Light2Xposition, Light2Yposition, Light2Zposition);
      break;
      break;
    case 77:
      Light2Zposition -= 0.4; 
      gl.uniform3f(u_LightPosition2, Light2Xposition, Light2Yposition, Light2Zposition); 
      break;
      break;  


   console.log('qwer');

  // Draw
  tick();
}

}

function keyup(ev, gl) {
  keys[ev.keyCode] = false;
  ev.shiftKey == false;

  fired = 0;
  tick();
}

}

function initVertexBuffers(gl) { // Create a sphere
  var SPHERE_DIV = 133;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  // var positions = [];
  // var normalsArray = [];
  // var indices = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z

      normalsArray.push(si * sj);  // X
      normalsArray.push(cj);       // Y
      normalsArray.push(ci * sj);  // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

AmountofSphereIndices = indices.length;
console.log( 'Sphere indices count before adding cube ' + AmountofSphereIndices + ' indices length is:' + indices.length);

// Cube Time  
var cubeVertices = new Float32Array([
     2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
     2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
     2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
    -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
     2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
  ]);

var cubeNormals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);

 console.log( 'What is Positionslength/3 ? ' + positions.length/3 + ' ' + indices.length/3);
 var AmountofSphereIndicesoff = positions.length/3;
 var indicesofCube = new Uint16Array([
     0 + AmountofSphereIndicesoff, 1 + AmountofSphereIndicesoff, 2 + AmountofSphereIndicesoff,   0 + AmountofSphereIndicesoff, 2 + AmountofSphereIndicesoff, 3 + AmountofSphereIndicesoff,    // front
     4 + AmountofSphereIndicesoff, 5 + AmountofSphereIndicesoff, 6 + AmountofSphereIndicesoff,   4 + AmountofSphereIndicesoff, 6 + AmountofSphereIndicesoff, 7 + AmountofSphereIndicesoff,    // right
     8 + AmountofSphereIndicesoff, 9 + AmountofSphereIndicesoff,10 + AmountofSphereIndicesoff,   8 + AmountofSphereIndicesoff,10 + AmountofSphereIndicesoff,11 + AmountofSphereIndicesoff,    // up
    12 + AmountofSphereIndicesoff,13 + AmountofSphereIndicesoff,14 + AmountofSphereIndicesoff,  12 + AmountofSphereIndicesoff,14 + AmountofSphereIndicesoff,15 + AmountofSphereIndicesoff,    // left
    16 + AmountofSphereIndicesoff,17 + AmountofSphereIndicesoff,18 + AmountofSphereIndicesoff,  16 + AmountofSphereIndicesoff,18 + AmountofSphereIndicesoff,19 + AmountofSphereIndicesoff,    // down
    20 + AmountofSphereIndicesoff,21 + AmountofSphereIndicesoff,22 + AmountofSphereIndicesoff,  20 + AmountofSphereIndicesoff,22 + AmountofSphereIndicesoff,23 + AmountofSphereIndicesoff     // back

    //  0, 1, 2,   0, 2, 3,    // front
    //  4, 5, 6,   4, 6, 7,    // right
    //  8, 9,10,   8,10,11,    // up
    // 12,13,14,  12,14,15,    // left
    // 16,17,18,  16,18,19,    // down
    // 20,21,22,  20,22,23     // back
 ]);

console.log(' AmountofSphereIndices is: ' + AmountofSphereIndices + ' length of indices array after adding Sphere Info is: ' + indices.length);
console.log(' length of indices array just before adding Cube Info is: ' + indices.length + ' positions array length is: ' + positions.length + ' normalsArray length is: ' + normalsArray.length);

for (var i = 0; i < cubeVertices.length; i++)
   positions.push(cubeVertices[i]);

for (var i = 0; i < cubeNormals.length; i++)
   normalsArray.push(cubeNormals[i]);

for (var i = 0; i < indicesofCube.length; i++)
   indices.push(indicesofCube[i]);

AmountofCubeIndices = indices.length - AmountofSphereIndices;

console.log(' Amount of CubeIndices before add Grid is: ' + AmountofCubeIndices + ' length of indices array after adding Cube Info is: ' + indices.length);
console.log( 'Sphere and Cube info before add Grid -- Positionslength/3 ' + positions.length/3);


AmountofSphereandCubeIndices = positions.length/3;
console.log('Sphere and Cube info before add Grid -- Positionslength/3 ' + positions.length/3);

// Now Adding on Pyramid Info------------Pyramid Info---------***** Pyramid
var PyramidVertices = new Float32Array([
     0.0, 0.0, 1.0,  -1.0, 0.0, 0.0,  0.0,-1.0, 0.0,   //side 1 of Pyramid  // v 
     0.0, 0.0, 1.0,   0.0,-1.0, 0.0,  1.0, 0.0, 0.0,  //side 2 of Pyramid
     0.0, 0.0, 1.0,   1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  //side 3 of Pyramid
     0.0, 0.0, 1.0,   0.0, 1.0, 0.0,  -1.0, 0.0, 0.0,  //side 4 of Pyramid
     0.0, 1.0, 0.0,   0.0,-1.0, 0.0,   -1.0,0.0, 0.0,  //side 5 of Pyramid  //Bottom
     1.0, 0.0, 0.0,   0.0,-1.0, 0.0,  0.0, 1.0, 0.0  //side 6 of Pyramid  //Bottom
  ]);

var PyramidNormals = new Float32Array([
     -0.5, -0.5, 0.5,  -0.5, -0.5, 0.5,  -0.5, -0.5, 0.5,   //side 1 of Pyramid
     0.5, -0.5, 0.5,  0.5, -0.5, 0.5,  0.5, -0.5, 0.5,  //side 2 of Pyramid
     0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  //side 3 of Pyramid
     -0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  //side 4 of Pyramid
     0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0,0.0, -1.0,  //side 5 of Pyramid  //Bottom
     0.0, 0.0, -1.0,   0.0, 0.0, -1.0,  0.0, 0.0, -1.0  //side 6 of Pyramid  //Bottom
  ]);

for (var i = 0; i < PyramidVertices.length; i++)
   positions.push(PyramidVertices[i]);

for (var i = 0; i < PyramidNormals.length; i++)
   normalsArray.push(PyramidNormals[i]);


AmountofSphereandCubeandPyramidIndices = positions.length/3;




// Now Adding on Gridlines------------GRIDLINES ---------***** GRIDLINES
var gridVertices = [];

for ( var i = -20 ; i <= 20 ; i++ ) {
   for ( var j = -20; j <= 20; j++) {
      gridVertices.push(i);
      gridVertices.push(j);
      gridVertices.push(0);
      gridVertices.push(i+1);
      gridVertices.push(j);
      gridVertices.push(0);
      gridVertices.push(i);
      gridVertices.push(j);
      gridVertices.push(0);
      gridVertices.push(i);
      gridVertices.push(j+1);
      gridVertices.push(0);

   }

}

console.log(gridVertices.length/3);

var gridNormals = [];
for ( var i = 0 ; i < gridVertices.length/3 ; i++ ) { 
  gridNormals.push(0);
  gridNormals.push(0);
  gridNormals.push(1);
}

amountofgridvertices = gridVertices.length/3;
 
 var indicesofGridLines = new Uint16Array([
     
 ]);

for (var i = 0; i < gridVertices.length; i++)
   positions.push(gridVertices[i]);

for (var i = 0; i < gridNormals.length; i++)
   normalsArray.push(gridNormals[i]);

for (var i = 0; i < indicesofCube.length; i++)
   indices.push(indicesofGridLines[i]);

//AmountofSphereandCubeIndices = positions.length;
console.log(' length of indices array after adding Grid Info is: ' + indices.length);
console.log( 'Indices offset for grid should be-- Positionslength/3 ' + positions.length/3);

  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(normalsArray), gl.FLOAT, 3))  return -1;
  
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }


  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

 console.log(' length of indices array just before return is: ' + indices.length + ' positions array length is: ' + positions.length + ' normalsArray length is: ' + normalsArray.length);
 console.log(' to make sure cube info is added on properly-- ' + positions[659] + ' ' +  normalsArray[659] + ' ' + indices[1049]);
 console.log(' to make sure sphere info is added on properly-- ' + positions[587] + ' ' +  normalsArray[587] + ' ' + indices[1013]);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function startupCanvas() { 
            canvas.width  = window.innerWidth/1.01;
            canvas.height = window.innerHeight/1.15;           
  }

  function resizecanvas() {
            canvas.width  = window.innerWidth/1.01;
            canvas.height = window.innerHeight/1.15;

            window.location.reload()
            
 }

function updateCamerapos() {
 // console.log('updateCamerapos was called');
  var camerapos = document.getElementById('cameraposition');


  camerapos.innerHTML = 'Camera X Position: ' + cameraXposition.toFixed(3) + ' RArrow/LArrow to add/sub 0.1 to Cam X Pos ' + '--------LookAtXposition: ' + LookAtXposition.toFixed(3) + '<br>' +
                        'Camera Y Position: ' + cameraYposition.toFixed(3) + ' UpArrow/DownArrow to add/sub 0.1 to Cam Y Pos ' + '--------LookAtYposition: ' + LookAtYposition.toFixed(3) + '<br>' +
                        'Camera Z Position: ' + cameraZposition.toFixed(3) + " 'A' / 'Z' to add/sub 0.1 to Cam Z Pos " + '--------LookAtZposition: ' + LookAtZposition.toFixed(3) + '<br>' +

                        'Light2 X Position: ' + Light2Xposition.toFixed(3) + " 'H'/'B' to add/sub 0.2 to Light2 X Pos " + '<br>' +
                        'Light2 Y Position: ' + Light2Yposition.toFixed(3) + " 'J'/'N' to add/sub 0.2 to Light2 Y Pos " + '<br>' +
                        'Light2 Z Position: ' + Light2Zposition.toFixed(3) + " 'K'/'M' to add/sub 0.2 to Light2 Z Pos " + '<br>';
}
