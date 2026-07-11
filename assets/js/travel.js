import * as THREE from "../vendor/three.module.js";

(() => {
  const page = document.querySelector("[data-travel-page]");
  const d3 = window.d3;
  const topojson = window.topojson;

  if (!page || !topojson || !d3) return;

  const root = document.documentElement;
  const baseUrl = root.dataset.baseurl || "";
  const emptyImage = `${baseUrl}/images/travel-empty.jpg`;

  // Add visited places here. A key may be `country:Japan` or `province:420000`.
  // Each entry accepts title, meta, note, and any number of local photo paths.
  const places = {
    // "country:Japan": {
    //   title: "Japan",
    //   meta: "Spring 2026",
    //   note: "A few lines about the trip.",
    //   photos: ["/images/travel/japan-01.jpg", "/images/travel/japan-02.jpg"]
    // }
  };

  const globeHost = page.querySelector("[data-travel-globe]");
  const provinceCanvas = page.querySelector("[data-travel-province-map]");
  const status = page.querySelector("[data-travel-status]");
  const image = page.querySelector("[data-travel-image]");
  const imageNav = page.querySelector("[data-travel-image-nav]");
  const photoCount = page.querySelector("[data-travel-photo-count]");
  const panelState = page.querySelector("[data-travel-panel-state]");
  const panelTitle = page.querySelector("[data-travel-title]");
  const panelMeta = page.querySelector("[data-travel-meta]");
  const panelNote = page.querySelector("[data-travel-note]");
  const controls = {
    zoomIn: page.querySelector("[data-travel-zoom-in]"),
    zoomOut: page.querySelector("[data-travel-zoom-out]"),
    reset: page.querySelector("[data-travel-reset]"),
    photoPrevious: page.querySelector("[data-travel-photo-prev]"),
    photoNext: page.querySelector("[data-travel-photo-next]")
  };

  let countries = [];
  let provinces = [];
  let selected = null;
  let displayMode = "world";
  let activePhotos = [];
  let activePhotoIndex = 0;
  let scene;
  let camera;
  let renderer;
  let globe;
  let mapTexture;
  let globeGroup;
  let globeCanvas;
  let provinceProjection;
  let dragStart;
  let isDragging = false;
  let lastPointer = { x: 0, y: 0 };
  let idleFrames = 0;

  const coordinatesFromUv = (uv) => [
    uv.x * 360 - 180,
    (uv.y - 0.5) * 180
  ];

  const entryFor = (key) => places[key] || null;

  const updatePanel = (item) => {
    const entry = item ? entryFor(item.key) : null;
    activePhotos = entry?.photos || [];
    activePhotoIndex = 0;

    if (!item) {
      panelState.textContent = "Atlas";
      panelTitle.textContent = "Where next?";
      panelMeta.textContent = "One world, slowly unfolding.";
      panelNote.textContent = "Select a country to open a new page in the atlas.";
      image.src = emptyImage;
      image.alt = "A mountain path disappearing into clouds";
      imageNav.hidden = true;
      return;
    }

    panelTitle.textContent = entry?.title || item.name;
    panelMeta.textContent = entry?.meta || (item.level === "province" ? "China" : item.name);

    if (entry) {
      panelState.textContent = "Travel notes";
      panelNote.textContent = entry.note || "A place worth returning to in memory.";
      image.alt = `${entry.title || item.name} travel photo`;
    } else {
      panelState.textContent = "Not yet";
      panelNote.textContent = "This corner of the map is still unmarked. I hope a future journey returns with a few imperfect frames and plenty of time to linger.";
      image.alt = "A mountain path disappearing into clouds";
    }

    renderPhoto();
  };

  const renderPhoto = () => {
    const hasPhotos = activePhotos.length > 0;
    image.src = hasPhotos ? activePhotos[activePhotoIndex] : emptyImage;
    imageNav.hidden = activePhotos.length < 2;

    if (hasPhotos) {
      photoCount.textContent = `${activePhotoIndex + 1} / ${activePhotos.length}`;
    }
  };

  const drawMapTexture = () => {
    if (!globeCanvas || !mapTexture) return;

    const context = globeCanvas.getContext("2d");
    const width = globeCanvas.width;
    const height = globeCanvas.height;
    const projection = d3.geoEquirectangular().fitSize([width, height], { type: "Sphere" });
    const path = d3.geoPath(projection, context);

    context.fillStyle = "#0d1721";
    context.fillRect(0, 0, width, height);

    countries.forEach((feature) => {
      const isSelected = selected?.key === `country:${feature.properties.name}`;
      context.beginPath();
      path(feature);
      context.fillStyle = isSelected ? "#b9983e" : "#1b2a36";
      context.fill();
      context.strokeStyle = isSelected ? "#dfc35a" : "#64717a";
      context.lineWidth = isSelected ? 1.6 : 0.72;
      context.stroke();
    });

    for (let latitude = -60; latitude <= 60; latitude += 30) {
      context.beginPath();
      path({ type: "LineString", coordinates: Array.from({ length: 73 }, (_, index) => [-180 + index * 5, latitude]) });
      context.strokeStyle = "rgba(130, 151, 165, 0.24)";
      context.lineWidth = 0.7;
      context.stroke();
    }

    mapTexture.needsUpdate = true;
  };

  const drawProvinceMap = () => {
    if (displayMode !== "china" || !provinces.length) return;

    const rect = provinceCanvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    provinceCanvas.width = Math.max(1, Math.round(rect.width * scale));
    provinceCanvas.height = Math.max(1, Math.round(rect.height * scale));
    const context = provinceCanvas.getContext("2d");
    context.scale(scale, scale);
    context.fillStyle = "#0d1721";
    context.fillRect(0, 0, rect.width, rect.height);

    provinceProjection = d3.geoMercator().fitExtent([[26, 26], [rect.width - 26, rect.height - 26]], { type: "FeatureCollection", features: provinces });
    const path = d3.geoPath(provinceProjection, context);

    provinces.forEach((feature) => {
      const key = `province:${feature.properties.adcode}`;
      const isSelected = selected?.key === key;
      const isVisited = Boolean(entryFor(key));
      context.beginPath();
      path(feature);
      context.fillStyle = isSelected ? "#d6af35" : isVisited ? "#476b65" : "#1b2a36";
      context.fill();
      context.strokeStyle = isSelected ? "#f3d66a" : "#71808a";
      context.lineWidth = isSelected ? 1.8 : 0.9;
      context.stroke();
    });
  };

  const selectCountry = (feature) => {
    if (!feature) return;

    const name = feature.properties.name;
    selected = { key: `country:${name}`, name, level: "country" };

    if (name === "China") {
      displayMode = "china";
      globeHost.hidden = true;
      provinceCanvas.hidden = false;
      status.textContent = "China";
      drawProvinceMap();
    } else {
      status.textContent = name;
      drawMapTexture();
    }

    updatePanel(selected);
  };

  const selectProvince = (feature) => {
    if (!feature) return;

    selected = {
      key: `province:${feature.properties.adcode}`,
      name: feature.properties.name,
      level: "province"
    };
    status.textContent = feature.properties.name;
    drawProvinceMap();
    updatePanel(selected);
  };

  const createGlobe = () => {
    const width = globeHost.clientWidth;
    const height = globeHost.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    globeHost.appendChild(renderer.domElement);

    globeCanvas = document.createElement("canvas");
    globeCanvas.width = 1800;
    globeCanvas.height = 900;
    mapTexture = new THREE.CanvasTexture(globeCanvas);
    mapTexture.colorSpace = THREE.SRGBColorSpace;

    globeGroup = new THREE.Group();
    scene.add(globeGroup);

    globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 64),
      new THREE.MeshBasicMaterial({ map: mapTexture })
    );
    globeGroup.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.015, 96, 64),
      new THREE.MeshBasicMaterial({ color: "#879da9", transparent: true, opacity: 0.1, side: THREE.BackSide })
    );
    globeGroup.add(atmosphere);
    globeGroup.rotation.set(-0.16, 2.4, 0);

    drawMapTexture();

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isDragging && idleFrames > 45 && displayMode === "world") globeGroup.rotation.y += 0.0014;
      idleFrames += 1;
      renderer.render(scene, camera);
    };

    animate();
  };

  const countryAt = (event) => {
    if (!renderer || !globe) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(globe)[0];
    if (!hit?.uv) return null;
    const point = coordinatesFromUv(hit.uv);
    return countries.find((feature) => d3.geoContains(feature, point));
  };

  const provinceAt = (event) => {
    if (!provinceProjection) return null;
    const rect = provinceCanvas.getBoundingClientRect();
    const point = provinceProjection.invert([event.clientX - rect.left, event.clientY - rect.top]);
    return provinces.find((feature) => d3.geoContains(feature, point));
  };

  const resetWorld = () => {
    displayMode = "world";
    selected = null;
    globeHost.hidden = false;
    provinceCanvas.hidden = true;
    status.textContent = "World";
    globeGroup.rotation.set(-0.16, 2.4, 0);
    camera.position.z = 3.2;
    drawMapTexture();
    updatePanel(null);
  };

  const resize = () => {
    if (!renderer || !camera) return;
    const width = globeHost.clientWidth;
    const height = globeHost.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    drawProvinceMap();
  };

  globeHost.addEventListener("pointerdown", (event) => {
    dragStart = { x: event.clientX, y: event.clientY };
    lastPointer = dragStart;
    isDragging = true;
    idleFrames = 0;
    globeHost.setPointerCapture?.(event.pointerId);
  });

  globeHost.addEventListener("pointermove", (event) => {
    if (!isDragging || !globeGroup) return;
    const movementX = event.clientX - lastPointer.x;
    const movementY = event.clientY - lastPointer.y;
    globeGroup.rotation.y += movementX * 0.006;
    globeGroup.rotation.x = Math.max(-0.75, Math.min(0.75, globeGroup.rotation.x + movementY * 0.006));
    lastPointer = { x: event.clientX, y: event.clientY };
  });

  globeHost.addEventListener("pointerup", (event) => {
    const moved = dragStart && Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > 6;
    isDragging = false;
    if (!moved) selectCountry(countryAt(event));
  });

  provinceCanvas.addEventListener("click", (event) => selectProvince(provinceAt(event)));

  controls.zoomIn.addEventListener("click", () => { camera.position.z = Math.max(2.25, camera.position.z - 0.28); });
  controls.zoomOut.addEventListener("click", () => { camera.position.z = Math.min(4.4, camera.position.z + 0.28); });
  controls.reset.addEventListener("click", resetWorld);
  controls.photoPrevious.addEventListener("click", () => {
    activePhotoIndex = (activePhotoIndex - 1 + activePhotos.length) % activePhotos.length;
    renderPhoto();
  });
  controls.photoNext.addEventListener("click", () => {
    activePhotoIndex = (activePhotoIndex + 1) % activePhotos.length;
    renderPhoto();
  });
  window.addEventListener("resize", resize);

  Promise.all([
    fetch(`${baseUrl}/assets/data/countries-110m.json`).then((response) => response.json()),
    fetch(`${baseUrl}/assets/data/china-provinces.json`).then((response) => response.json())
  ]).then(([world, china]) => {
    countries = topojson.feature(world, world.objects.countries).features;
    provinces = china.features;
    createGlobe();
    status.textContent = "World";
  }).catch(() => {
    status.textContent = "Atlas unavailable";
    panelTitle.textContent = "The atlas is resting";
    panelNote.textContent = "The map data could not be loaded just now.";
  });
})();
