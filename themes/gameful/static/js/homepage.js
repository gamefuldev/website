import * as THREE from 'three';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

THREE.Cache.enabled = true;

let container;

let camera, cameraTarget, scene, renderer;

let group, textMesh1, textMesh2, textGeo, materials, mirrorMaterials;

let firstLetter = true;

let text = 'gameful',
    bevelEnabled = true,
    font = undefined,
    fontName = 'montserrat',
    fontWeight = 'bold',
    size = window.innerWidth / 20;

const height = 10,
    hover = 30,
    curveSegments = 10,
    bevelThickness = 4,
    bevelSize = 2.5;

const mirror = true;

const fontMap = {
    'montserrat': 0,
};

const weightMap = {
    'regular': 0
};

const reverseFontMap = [];
const reverseWeightMap = [];

for ( const i in fontMap ) reverseFontMap[ fontMap[ i ] ] = i;
for ( const i in weightMap ) reverseWeightMap[ weightMap[ i ] ] = i;

let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

let fontIndex = 1;

init();
animate();

function init() {

    container = document.createElement( 'div' );
    container.classList.add("homepage");
    document.body.appendChild( container );

    // CAMERA

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
    camera.position.set( 0, 400, 800 );
    cameraTarget = new THREE.Vector3( 0, 120, 0 );

    // SCENE

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffc93c );
    scene.fog = new THREE.Fog( 0xffc93c, 600, 1600 );

    // LIGHTS

    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    scene.add( dirLight );

    const pointLight = new THREE.PointLight( 0xffffff, 1.5, 0, 0 );
    pointLight.color.setHSL( 1, 1, 1 );
    pointLight.position.set( 0, 100, 90 );
    scene.add( pointLight );

    materials = [
        new THREE.MeshPhongMaterial( { color: 0x111111, flatShading: true } ), // front
        new THREE.MeshPhongMaterial( { color: 0x111111 } ) // side
    ];

    mirrorMaterials = [
        new THREE.MeshPhongMaterial( { color: 0xffc93c, flatShading: true } ), // front
        new THREE.MeshPhongMaterial( { color: 0xffc93c } ) // side
    ];

    group = new THREE.Group();
    group.position.y = 100;

    scene.add( group );

    loadFont();

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry( 10000, 10000 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.8, transparent: true } )
    );

    plane.position.y = 100;
    plane.rotation.x = - Math.PI / 2;
    scene.add( plane );

    // RENDERER

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // EVENTS

    container.style.touchAction = 'none';
    container.addEventListener( 'pointerdown', onPointerDown );

    const params = {
        changeColor: function () {
            pointLight.color.setHSL( Math.random(), 1, 0.9 );
        },
        changeFont: function () {
            fontIndex ++;
            fontName = reverseFontMap[ fontIndex % reverseFontMap.length ];
            loadFont();

        },
        changeWeight: function () {

            if ( fontWeight === 'bold' ) {
                fontWeight = 'regular';
            } else {
                fontWeight = 'bold';
            }
            loadFont();

        },
        changeBevel: function () {
            bevelEnabled = ! bevelEnabled;
            refreshText();
        }
    };

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
    size = window.innerWidth / 20;
    windowHalfX = window.innerWidth / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    refreshText();
}

function loadFont() {
    const loader = new FontLoader();
    loader.load( '../fonts/cooper-black-five/CooperFiveOptiBlack_Regular.json', function ( response ) {
        font = response;
        refreshText();
    } );

}

function createText() {

    textGeo = new TextGeometry( text, {
        font: font,
        size: size,
        height: height,
        curveSegments: curveSegments,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled
    } );

    textGeo.computeBoundingBox();

    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
    textMesh1 = new THREE.Mesh( textGeo, materials );
    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;
    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    group.add( textMesh1 );

    if ( mirror ) {
        textMesh2 = new THREE.Mesh( textGeo, mirrorMaterials );
        textMesh2.position.x = centerOffset;
        textMesh2.position.y = - hover;
        textMesh2.position.z = height;
        textMesh2.rotation.x = Math.PI;
        textMesh2.rotation.y = Math.PI * 2;
        group.add( textMesh2 );

    }

}

function refreshText() {

    group.remove( textMesh1 );
    if ( mirror ) group.remove( textMesh2 );
    if ( ! text ) return;
    createText();

}

function onPointerDown( event ) {

    if ( event.isPrimary === false ) return;
    pointerXOnPointerDown = event.clientX - windowHalfX;
    targetRotationOnPointerDown = targetRotation;
    document.addEventListener( 'pointermove', onPointerMove );
    document.addEventListener( 'pointerup', onPointerUp );

}

function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;
    pointerX = event.clientX - windowHalfX;
    targetRotation = targetRotationOnPointerDown + ( pointerX - pointerXOnPointerDown ) * 0.02;

}

function onPointerUp() {

    if ( event.isPrimary === false ) return;
    document.removeEventListener( 'pointermove', onPointerMove );
    document.removeEventListener( 'pointerup', onPointerUp );

}

//

function animate() {

    requestAnimationFrame( animate );
    render();

}

function render() {

    group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;
    camera.lookAt( cameraTarget );
    renderer.clear();
    renderer.render( scene, camera );

}