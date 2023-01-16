import * as THREE from 'three';
let renderer,scene,cube;
const frustumSize   = 8;
const mGameaspect  = window.innerWidth/window.innerHeight;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector3(1, 1);
const initMouse = new THREE.Vector3(1, 1);
let cubePosition = new THREE.Vector3(1, 1);
let cubeRotation = new THREE.Vector3(1, 1);
let cubeScale = new THREE.Vector3(1, 1);
let cameraPosition = new THREE.Vector3(1, 1);
let setFull=0;
let cameraScreen = 0;
const objectDistance=15;
window["onClick"] = onClick;
let dragging = false;
let startX, startY;
let prevX, prevY;
const views = [
    {
      left: 0.0,
      bottom: 0.5,
      width: 0.5,
      height: 0.5,
      background: new THREE.Color(0xF0EEF0),
      eye: [ 0, 15,20],
      actions: -1,
    },
    {
      left: 0.0,
      bottom: 0.0,
      width: 0.5,
      height: 0.5,
      background: new THREE.Color(0xF0EEF0),
      eye: [ -10, 0,0],
      actions: -1,
    },
    {
      left: 0.5,
      bottom: 0.0,
      width: 0.5,
      height: 0.5,
      background: new THREE.Color(0xF0EEF0),
      eye: [ 0, 10,0],
      actions: -1,
    },
    {
      left: 0.5,
      bottom: 0.5,
      width: 0.5,
      height: 0.5,
      background: new THREE.Color(0xF0EEF0),
      eye: [ 0, 0,10],
      actions: -1,

    },
  ];
export const startScene = ()=>{
    scene = new THREE.Scene();
    const size = 15;
    const divisions = 30;
    const gridHelper = new THREE.GridHelper( size, divisions );
    scene.add( gridHelper );
    for ( let i = 0; i < views.length; ++ i ) {
        const view = views[ i ];
        let camera;
        if(i>0){
            camera =  new THREE.OrthographicCamera( -frustumSize * mGameaspect ,frustumSize*mGameaspect , frustumSize , -frustumSize,0,10000);
            
        }
        else{
            camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
            const helper = new THREE.CameraHelper(camera);
            scene.add(helper);
        }
        camera.position.fromArray( view.eye );
        camera.lookAt(0, 0, 0);
        view.camera = camera;
    }
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById("mycanvas"),antialias: true,alpha:true,preserveDrawingBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor( 0x000000,1);
    document.body.appendChild(renderer.domElement);
    const light = new THREE.HemisphereLight( 0xffffff,0xffffff,1);
    light.position.set(0,100,0);
    scene.add(light);
    const geometry = new THREE.BoxGeometry(2,2,2);
    const texture = new THREE.TextureLoader().load( './assets/wood.png' );
    const material = new THREE.MeshBasicMaterial({map:texture,color:"#ffffff"});
    cube = new THREE.Mesh(geometry,material);
    scene.add(cube);
    render();
    window.addEventListener('resize', onWindowResize,false  );
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
} 
function render (){
    requestAnimationFrame(render);
    if (!setFull) {
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.setScissorTest(false);
        views[0].camera.aspect = window.innerWidth / window.innerHeight;
        views[0].camera.updateProjectionMatrix();
        renderer.setClearColor(views[0].background);
        renderer.render(scene, views[0].camera);
     }
    else{  
        for ( let i = 0; i < views.length; ++ i ) {
            const view = views[ i ];
            const camera = view.camera;
            const left = Math.floor( window.innerWidth * view.left );
            const bottom = Math.floor( window.innerHeight * view.bottom );
            const width = Math.floor( window.innerWidth * view.width );
            const height = Math.floor( window.innerHeight * view.height );
            renderer.setViewport( left, bottom, width, height );
            renderer.setScissor( left, bottom, width, height );
            renderer.setScissorTest( true );
            renderer.setClearColor( view.background );
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.render( scene, camera );
        }
    }
}
const onWindowResize=()=> {
    const aspectRatio = window.innerWidth / window.innerHeight;
    for (let i = 0; i < views.length; ++i) {
      const camera = views[i].camera;
      if (i == 0) {
            camera.aspect = aspectRatio;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
      } else {
            camera.left = (-frustumSize * aspectRatio) / 2;
            camera.right = (frustumSize * aspectRatio) / 2;
            camera.top = frustumSize / 2;
            camera.bottom = -frustumSize / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
      }
    }
    
}
function onClick(evt,type,cameraType) {
    switch(cameraType){
        case 0:
            views[2].actions = type;
            break;
        case 1:
            views[1].actions = type;
            break;
        case 2:
            views[3].actions = type;
            break;
      }
    
    let buttons = document.getElementsByClassName("ui_buttons");
    
    for (let i = 0; i < buttons.length; i++) {
     
        if(Math.floor(evt.currentTarget.name) === Math.floor(buttons[i].name))
            buttons[i].className = buttons[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";
  }

function onMouseDown(event) {
    event.preventDefault();

    if (dragging) {
        return;
    }
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    initMouse.set(mouse.x, mouse.y);
    cubePosition.copy(cube.position);
    cubeRotation.copy(cube.rotation);
    cubeScale.copy(cube.scale);
    cameraPosition.copy(views[0].camera.position);
    if (mouse.x < 0 && mouse.y < 0)
        cameraScreen = 1;
    if (mouse.x > 0 && mouse.y > 0) 
        cameraScreen = 2;
    if (mouse.x > 0 && mouse.y < 0) 
        cameraScreen = 3;

    //   console.log(cameraScreen);  
  }
function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX  / window.innerWidth)*2-1;
    mouse.y = -(event.clientY / window.innerHeight)*2+1;
    
    
    if (cameraScreen<1) 
        return;
    if(setFull){
        if (views[cameraScreen].actions == "move") {
            
            switch(cameraScreen){
                    case 1:
                        cube.position.z = cubePosition.z + (mouse.x - initMouse.x)*objectDistance;
                        cube.position.y = cubePosition.y + (mouse.y - initMouse.y)*objectDistance;
                        break;    
                    case 2:
                        cube.position.x = cubePosition.x + (mouse.x - initMouse.x)*objectDistance;
                        cube.position.y = cubePosition.y + (mouse.y - initMouse.y)*objectDistance;
                        break;    
                    case 3:
                        cube.position.x = cubePosition.x + (mouse.x - initMouse.x)*objectDistance;
                        cube.position.z = cubePosition.z - (mouse.y - initMouse.y)*objectDistance;
                        
                        break;    
            }

            let camera = views[1].camera;
            camera.lookAt(cube.position);
            camera = views[2].camera;
            camera.lookAt(cube.position);
            camera = views[3].camera;
            camera.lookAt(cube.position);
        }
        if (views[cameraScreen].actions == "scale") {
            switch(cameraScreen){
                case 1:
                    cube.scale.z = cubeScale.z + (mouse.x - initMouse.x) *objectDistance;
                    cube.scale.y = cubeScale.y + (mouse.y - initMouse.y) *objectDistance;
                    break;
                case 2:
                    cube.scale.x = cubeScale.x + (mouse.x - initMouse.x) *objectDistance;
                    cube.scale.y = cubeScale.y + (mouse.y - initMouse.y) *objectDistance;
                    break;
                case 3:
                    cube.scale.x = cubeScale.x + (mouse.x - initMouse.x) *objectDistance;
                    cube.scale.z = cubeScale.z + (mouse.y - initMouse.y) *objectDistance;
                    break;
            }
        }
        if (views[cameraScreen].actions == "rotate") {
            switch(cameraScreen){
                case 1:
                    cube.rotation.y = cubeRotation.y - (mouse.x - initMouse.x) *objectDistance;
                    cube.rotation.z = cubeRotation.z + (mouse.y - initMouse.y) *objectDistance;
                    break;
                case 2:
                    cube.rotation.y = cubeRotation.y + (mouse.x - initMouse.x) *objectDistance;
                    cube.rotation.x = cubeRotation.x + (mouse.y - initMouse.y) *objectDistance;
                    break;
                case 3:
                    cube.rotation.x = cubeRotation.x + (mouse.x - initMouse.x) *objectDistance;
                    cube.rotation.z = cubeRotation.z - (mouse.y - initMouse.y) *objectDistance;
                    break;
            }
        }
        if (views[cameraScreen].actions == "camera" && cameraScreen > 0) {

            const camera = views[0].camera;
            switch(cameraScreen){
                case 1:
                    camera.position.z = cameraPosition.z - (mouse.x - initMouse.x) *objectDistance;
                    camera.position.y = cameraPosition.y + (mouse.y - initMouse.y) *objectDistance;
                    break;
                case 2:
                    camera.position.x = cameraPosition.x + (mouse.x - initMouse.x) *objectDistance;
                    camera.position.y = cameraPosition.y + (mouse.y - initMouse.y) *objectDistance;
                    break;
                case 3:
                    camera.position.x = cameraPosition.x + (mouse.x - initMouse.x) *objectDistance;
                    camera.position.z = cameraPosition.z - (mouse.y - initMouse.y) *objectDistance;
                    break;
            }
        }
    }
  }
function onMouseUp(event) {
    event.preventDefault();

    if (!setFull) {
        raycaster.setFromCamera(mouse, views[0].camera);
        if (raycaster.intersectObject(cube).length > 0) {
            showFullView(true);
        }
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    cameraScreen = -1;
    
}

const showFullView = (_setFull) => {
    setFull = _setFull;
    const gridcontainer = document.getElementById("container");
    gridcontainer.style.display = _setFull ? "grid" : "none";
};