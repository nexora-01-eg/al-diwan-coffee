/* ================================================================
scene.js — مشهد WebGL واحد مشترك وثابت في الخلفية.
ScrollTrigger timelines تتحكم في الكاميرا والإضاءة ولون الحبوب.
Fallback: صورة ثابتة لو WebGL غير متاح أو الجهاز ضعيف.
Motion: transform/opacity فقط + reduced-motion + موبايل مخفف.
================================================================ */
(function () {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('gl');
  const fallback = document.getElementById('gl-fallback');
  const isMobile = matchMedia('(max-width: 640px)').matches;
  // الحالة العامة التي تكتبها story.js بالتمرير (0 هيرو … 1 فوتر)
  window.DIWAN_GL = { progress: 0, roastMix: 0.5, steam: 0.4, energy: 0.4 };
  if (reduced || !canvas || !window.THREE) { if (canvas) canvas.style.display = 'none'; return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  } catch (e) { canvas.style.display = 'none'; if (fallback) fallback.hidden = false; return; }

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  cam.position.set(0, 0, 9);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const Mouse = { x: 0, y: 0 };
  addEventListener('mousemove', e => {
    Mouse.x = e.clientX / innerWidth - 0.5; Mouse.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 1.8));
    cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  /* غبار دهبي */
  const N = isMobile ? 250 : 750;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 24; pos[i * 3 + 1] = (Math.random() - 0.5) * 15; pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0xe4c87f, size: 0.045, transparent: true, opacity: 0.8, depthWrite: false });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* حبوب البن — لونها يتدحرج من فاتح لغامق مع roastMix */
  const beanGeo = new THREE.SphereGeometry(0.16, 10, 8); beanGeo.scale(1, 0.68, 0.55);
  const beanMat = new THREE.MeshStandardMaterial({ color: 0x8a5a28, roughness: 0.55, metalness: 0.25 });
  const COUNT = isMobile ? 12 : 24;
  const beans = new THREE.InstancedMesh(beanGeo, beanMat, COUNT);
  const dummy = new THREE.Object3D(), seeds = [];
  for (let i = 0; i < COUNT; i++) seeds.push({
    x: (Math.random() - 0.5) * 15, y: (Math.random() - 0.5) * 9, z: (Math.random() - 0.5) * 5 - 1,
    rx: Math.random() * 6, ry: Math.random() * 6, s: 0.7 + Math.random() * 0.9, ph: Math.random() * 6
  });
  scene.add(beans);
  const cLight = new THREE.Color(0xc99a55), cDark = new THREE.Color(0x2e1a0c), cTmp = new THREE.Color();

  /* بخار — نقاط صاعدة شفافة */
  const SN = isMobile ? 20 : 50;
  const spos = new Float32Array(SN * 3), spd = [];
  for (let i = 0; i < SN; i++) { spos[i * 3] = (Math.random() - 0.5) * 6; spos[i * 3 + 1] = Math.random() * 8 - 4; spos[i * 3 + 2] = -2; spd.push(0.3 + Math.random() * 0.5); }
  const steamGeo = new THREE.BufferGeometry();
  steamGeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
  const steamMat = new THREE.PointsMaterial({ color: 0xf6efdd, size: 0.22, transparent: true, opacity: 0.25, depthWrite: false });
  scene.add(new THREE.Points(steamGeo, steamMat));

  /* إضاءة: key دهبي دافي + rim أخضر + لمسة كريمية */
  scene.add(new THREE.AmbientLight(0xffe9c4, 0.65));
  const key = new THREE.DirectionalLight(0xffd98a, 1.7); key.position.set(4, 6, 6); scene.add(key);
  const rim = new THREE.PointLight(0x2e7d5b, 7, 30); rim.position.set(-6, -2, 3); scene.add(rim);
  const warm = new THREE.PointLight(0xf6e3b8, 5, 26); warm.position.set(5, -3, 4); scene.add(warm);

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime(), S = window.DIWAN_GL;
    // لون الحبوب حسب التحميص
    cTmp.copy(cLight).lerp(cDark, S.roastMix);
    beanMat.color.copy(cTmp);
    steamMat.opacity = 0.08 + S.steam * 0.3;
    dustMat.opacity = 0.4 + S.energy * 0.5;
    // حركة الحبوب
    seeds.forEach((b, i) => {
      dummy.position.set(b.x + Math.sin(t * 0.4 + b.ph) * 0.4, b.y + Math.cos(t * 0.3 + b.ph * 1.7) * 0.5, b.z);
      dummy.rotation.set(b.rx + t * 0.3, b.ry + t * 0.4, 0);
      dummy.scale.setScalar(b.s); dummy.updateMatrix(); beans.setMatrixAt(i, dummy.matrix);
    });
    beans.instanceMatrix.needsUpdate = true;
    // بخار صاعد
    const p = steamGeo.attributes.position.array;
    for (let i = 0; i < SN; i++) { p[i * 3 + 1] += spd[i] * 0.016; if (p[i * 3 + 1] > 5) p[i * 3 + 1] = -4; }
    steamGeo.attributes.position.needsUpdate = true;
    // كاميرا: parallax ماوس + انجراف مع التمرير
    cam.position.x += ((Mouse.x * 1.6) - cam.position.x) * 0.04;
    cam.position.y += ((-Mouse.y * 1.1 + S.progress * 1.2) - cam.position.y) * 0.04;
    cam.lookAt(0, 0, 0);
    scene.rotation.y = S.progress * 1.1;
    key.intensity = 1.4 + S.energy * 0.8;
    renderer.render(scene, cam);
  })();
})();
