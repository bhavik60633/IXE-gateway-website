/* ==============================================
   IXE GATEWAY - THREE.JS GLOBE
   Interactive 3D Globe with Trade Routes
   ============================================== */

(function () {
  'use strict';

  var globeCanvas = document.getElementById('globe-canvas');
  if (!globeCanvas) return;
  if (typeof THREE === 'undefined') return;

  // ---- Scene Setup ----
  var W = globeCanvas.parentElement.offsetWidth || 500;
  var H = globeCanvas.parentElement.offsetHeight || 500;
  var SIZE = Math.min(W, H);

  var renderer = new THREE.WebGLRenderer({
    canvas: globeCanvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  // ---- Lighting ----
  var ambientLight = new THREE.AmbientLight(0x1a3a8f, 0.8);
  scene.add(ambientLight);

  var sunLight = new THREE.DirectionalLight(0xffd700, 1.2);
  sunLight.position.set(5, 3, 5);
  scene.add(sunLight);

  var rimLight = new THREE.DirectionalLight(0xd4af37, 0.4);
  rimLight.position.set(-5, -2, -5);
  scene.add(rimLight);

  // ---- Globe Core ----
  var globeGeo = new THREE.SphereGeometry(2, 64, 64);
  var globeMat = new THREE.MeshPhongMaterial({
    color: 0x0c2461,
    emissive: 0x071440,
    emissiveIntensity: 0.4,
    shininess: 80,
    specular: 0xd4af37,
    transparent: true,
    opacity: 0.95
  });
  var globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // ---- Globe Wireframe ----
  var wireGeo = new THREE.SphereGeometry(2.02, 24, 24);
  var wireMat = new THREE.MeshBasicMaterial({
    color: 0xd4af37,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  var wireframe = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireframe);

  // ---- Atmosphere Glow ----
  var atmGeo = new THREE.SphereGeometry(2.3, 64, 64);
  var atmMat = new THREE.ShaderMaterial({
    vertexShader: [
      'varying vec3 vNormal;',
      'void main() {',
      '  vNormal = normalize(normalMatrix * normal);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vNormal;',
      'void main() {',
      '  float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1.0)), 3.0);',
      '  gl_FragColor = vec4(0.08, 0.22, 0.6, 1.0) * intensity;',
      '}'
    ].join('\n'),
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  var atmosphere = new THREE.Mesh(atmGeo, atmMat);
  scene.add(atmosphere);

  // ---- Gold Ring Bands ----
  function createRing(radius, tube, segments, color, opacity) {
    var geo = new THREE.TorusGeometry(radius, tube, 8, segments);
    var mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity
    });
    return new THREE.Mesh(geo, mat);
  }
  var ring1 = createRing(2.6, 0.008, 100, 0xd4af37, 0.25);
  ring1.rotation.x = Math.PI / 2;
  scene.add(ring1);

  var ring2 = createRing(2.9, 0.005, 100, 0xf0d060, 0.15);
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.y = Math.PI / 4;
  scene.add(ring2);

  // ---- Floating Particles ----
  var particleCount = 200;
  var positions = new Float32Array(particleCount * 3);
  var sizes = new Float32Array(particleCount);
  var particleData = [];

  for (var i = 0; i < particleCount; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    var r = 2.5 + Math.random() * 1.5;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = Math.random() * 3 + 1;
    particleData.push({
      r: r,
      theta: theta,
      phi: phi,
      speed: (Math.random() - 0.5) * 0.005
    });
  }

  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  var particleMat = new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.04,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  var particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- Trade Route Arcs ----
  function latLngToVec3(lat, lng, radius) {
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  function createArc(start, end, color, opacity) {
    var points = [];
    var numPoints = 50;
    for (var i = 0; i <= numPoints; i++) {
      var t = i / numPoints;
      var p = new THREE.Vector3().lerpVectors(start, end, t);
      var bulge = Math.sin(t * Math.PI) * 0.6;
      p.normalize().multiplyScalar(2.05 + bulge);
      points.push(p);
    }
    var curve = new THREE.CatmullRomCurve3(points);
    var geo = new THREE.TubeGeometry(curve, 50, 0.008, 8, false);
    var mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity
    });
    return new THREE.Mesh(geo, mat);
  }

  // Major trade routes (India to key markets)
  var routes = [
    { from: [22, 78], to: [51, -0.1] },   // India -> UK
    { from: [22, 78], to: [40, -74] },    // India -> USA
    { from: [22, 78], to: [1, 104] },     // India -> Singapore
    { from: [22, 78], to: [-33, 151] },   // India -> Australia
    { from: [22, 78], to: [25, 55] },     // India -> Dubai
    { from: [22, 78], to: [52, 13] },     // India -> Germany
    { from: [22, 78], to: [35, 139] },    // India -> Japan
    { from: [22, 78], to: [-1, 37] },     // India -> Kenya
  ];

  var arcColors = [0xd4af37, 0xf0d060, 0xffd700, 0xc89a00];
  var arcMeshes = [];

  routes.forEach(function (route, idx) {
    var start = latLngToVec3(route.from[0], route.from[1], 2.05);
    var end = latLngToVec3(route.to[0], route.to[1], 2.05);
    var color = arcColors[idx % arcColors.length];
    var arc = createArc(start, end, color, 0.3 + Math.random() * 0.2);
    arc.userData.baseOpacity = 0.3 + Math.random() * 0.2;
    scene.add(arc);
    arcMeshes.push(arc);
  });

  // ---- Highlight Dots on Globe ----
  var dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
  var dotPositions = [
    [22, 78],    // India (Bihar)
    [51, -0.1],  // London
    [40, -74],   // New York
    [1, 104],    // Singapore
    [25, 55],    // Dubai
    [52, 13],    // Berlin
    [35, 139],   // Tokyo
    [-1, 37],    // Nairobi
    [-33, 151],  // Sydney
  ];

  dotPositions.forEach(function (pos) {
    var dotMat = new THREE.MeshBasicMaterial({
      color: pos[0] === 22 && pos[1] === 78 ? 0xffd700 : 0xd4af37,
      transparent: true,
      opacity: 0.9
    });
    var dot = new THREE.Mesh(dotGeo, dotMat);
    var v = latLngToVec3(pos[0], pos[1], 2.1);
    dot.position.copy(v);
    scene.add(dot);

    // Glow ring around India
    if (pos[0] === 22 && pos[1] === 78) {
      var glowGeo = new THREE.RingGeometry(0.08, 0.12, 32);
      var glowMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      var glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(v);
      glow.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(glow);
    }
  });

  // ---- Mouse Interaction ----
  var mouseX = 0;
  var mouseY = 0;
  var targetRotY = 0;
  var targetRotX = 0;
  var isDragging = false;
  var prevMouseX = 0;
  var prevMouseY = 0;

  globeCanvas.addEventListener('mousedown', function (e) {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    globeCanvas.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', function (e) {
    if (!isDragging) {
      var rect = globeCanvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / SIZE - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / SIZE - 0.5) * 2;
    } else {
      var dx = (e.clientX - prevMouseX) * 0.01;
      var dy = (e.clientY - prevMouseY) * 0.01;
      targetRotY += dx;
      targetRotX += dy;
      targetRotX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotX));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  });
  window.addEventListener('mouseup', function () {
    isDragging = false;
    globeCanvas.style.cursor = 'grab';
  });

  // Touch support
  globeCanvas.addEventListener('touchstart', function (e) {
    isDragging = true;
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });
  globeCanvas.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    var dx = (e.touches[0].clientX - prevMouseX) * 0.012;
    var dy = (e.touches[0].clientY - prevMouseY) * 0.012;
    targetRotY += dx;
    targetRotX += dy;
    targetRotX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotX));
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });
  globeCanvas.addEventListener('touchend', function () {
    isDragging = false;
  });

  globeCanvas.style.cursor = 'grab';

  // ---- Scroll-driven Globe ----
  var scrollRotation = 0;
  window.addEventListener('scroll', function () {
    var wrapper = document.querySelector('.hero-wrapper');
    if (!wrapper) return;
    var scrollTop = window.scrollY;
    var wrapperH = wrapper.offsetHeight - window.innerHeight;
    var progress = Math.min(Math.max(scrollTop / wrapperH, 0), 1);
    scrollRotation = progress * Math.PI * 2;
  }, { passive: true });

  // ---- Animation Loop ----
  var clock = new THREE.Clock();
  var autoRotY = 0;

  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    var elapsed = clock.getElapsedTime();

    // Auto rotation + scroll rotation
    autoRotY += delta * 0.15;
    globe.rotation.y = autoRotY + scrollRotation + targetRotY;
    globe.rotation.x = targetRotX + Math.sin(elapsed * 0.3) * 0.03;
    wireframe.rotation.y = globe.rotation.y * 1.05;
    wireframe.rotation.x = globe.rotation.x;

    // Ring rotation
    ring1.rotation.z += delta * 0.2;
    ring2.rotation.z -= delta * 0.15;
    ring2.rotation.x += delta * 0.05;

    // Particle animation
    for (var i = 0; i < particleCount; i++) {
      particleData[i].theta += particleData[i].speed;
      var d = particleData[i];
      positions[i * 3] = d.r * Math.sin(d.phi) * Math.cos(d.theta);
      positions[i * 3 + 1] = d.r * Math.sin(d.phi) * Math.sin(d.theta);
      positions[i * 3 + 2] = d.r * Math.cos(d.phi);
    }
    particleGeo.attributes.position.needsUpdate = true;
    particles.rotation.y = elapsed * 0.04;

    // Arc pulse
    arcMeshes.forEach(function (arc, idx) {
      var pulse = (Math.sin(elapsed * 1.5 + idx * 0.8) + 1) * 0.5;
      arc.material.opacity = arc.userData.baseOpacity * (0.5 + pulse * 0.5);
    });

    // Smooth mouse parallax on camera
    if (!isDragging) {
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
    }

    renderer.render(scene, camera);
  }

  animate();

  // ---- Resize ----
  window.addEventListener('resize', function () {
    var parent = globeCanvas.parentElement;
    var newSize = Math.min(parent.offsetWidth || 500, parent.offsetHeight || 500, 600);
    renderer.setSize(newSize, newSize);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  });

})();
