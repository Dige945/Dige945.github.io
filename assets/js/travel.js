(() => {
  const page = document.querySelector("[data-travel-page]");
  const d3 = window.d3;
  const topojson = window.topojson;

  if (!page || !d3 || !topojson) return;

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

  const emptyImage = image.currentSrc || image.src;
  const dataUrl = (file) => new URL(`../data/${file}`, document.currentScript.src).href;
  const width = 720;
  const height = 640;
  const baseScale = 278;
  const chinaDetailZoom = 1.55;
  const defaultRotation = [-112, -23, 0];

  let countries = [];
  let provinces = [];
  let selected = null;
  let activePhotos = [];
  let activePhotoIndex = 0;
  let globeZoom = 1;
  let chinaMode = false;
  let dragging = false;
  let didDrag = false;
  let svg;
  let projection;
  let path;
  let countryPaths;
  let provincePaths;
  let boundaryPath;
  let globeCircle;

  const entryFor = (key) => places[key] || null;

  const updatePanel = (item) => {
    const entry = item ? entryFor(item.key) : null;
    activePhotos = entry?.photos || [];
    activePhotoIndex = 0;

    if (!item) {
      panelState.textContent = "Atlas";
      panelTitle.textContent = "Where next?";
      panelMeta.textContent = "One world, slowly unfolding.";
      panelNote.textContent = "Choose a country and let the map hold the rest of the thought.";
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
      panelNote.textContent = "This part of the map is still quiet. I hope a future route leaves behind a few photographs, a changed plan, and enough time to look around.";
      image.alt = "A mountain path disappearing into clouds";
    }

    renderPhoto();
  };

  const renderPhoto = () => {
    const hasPhotos = activePhotos.length > 0;
    image.src = hasPhotos ? activePhotos[activePhotoIndex] : emptyImage;
    imageNav.hidden = activePhotos.length < 2;
    if (hasPhotos) photoCount.textContent = `${activePhotoIndex + 1} / ${activePhotos.length}`;
  };

  const isChina = (feature) => feature?.id === "156" || feature?.properties?.name === "China";
  const countryKey = (feature) => `country:${feature.properties.name}`;
  const provinceKey = (feature) => `province:${feature.properties.adcode}`;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const reverseProvinceRings = (geometry) => {
    if (!geometry) return geometry;
    const reverseRing = (ring) => ring.map(([longitude, latitude]) => [longitude, latitude]).reverse();

    if (geometry.type === "Polygon") {
      return { ...geometry, coordinates: geometry.coordinates.map(reverseRing) };
    }

    if (geometry.type === "MultiPolygon") {
      return { ...geometry, coordinates: geometry.coordinates.map((polygon) => polygon.map(reverseRing)) };
    }

    return geometry;
  };

  const updateMapClasses = () => {
    globeHost.classList.toggle("is-china-mode", chinaMode);
    countryPaths
      .classed("is-china", isChina)
      .classed("is-visited", (feature) => Boolean(entryFor(countryKey(feature))))
      .classed("is-selected", (feature) => selected?.key === countryKey(feature));
    provincePaths
      .classed("is-visited", (feature) => Boolean(entryFor(provinceKey(feature))))
      .classed("is-selected", (feature) => selected?.key === provinceKey(feature));
  };

  const render = () => {
    projection.scale(baseScale * globeZoom);
    const isChinaDetailVisible = chinaMode && globeZoom >= chinaDetailZoom;
    globeCircle.attr("r", projection.scale());
    svg.select(".travel-globe__ocean").attr("d", path({ type: "Sphere" }));
    svg.select(".travel-globe__graticule").attr("d", path(d3.geoGraticule10()));
    countryPaths.attr("d", path);
    boundaryPath.attr("d", path);
    provincePaths.attr("d", path).attr("display", isChinaDetailVisible ? null : "none");
    updateMapClasses();
  };

  const focusCountry = (feature) => {
    const center = isChina(feature) ? [104.2, 35.6] : d3.geoCentroid(feature);
    projection.rotate([-center[0], -clamp(center[1], -58, 58), 0]);
    globeZoom = isChina(feature) ? 1.7 : Math.max(globeZoom, 1.35);
    render();
  };

  const selectCountry = (feature) => {
    if (!feature) return;
    selected = { key: countryKey(feature), name: feature.properties.name, level: "country" };
    chinaMode = isChina(feature);
    status.textContent = feature.properties.name;
    focusCountry(feature);
    updatePanel(selected);
  };

  const selectProvince = (feature) => {
    if (!feature) return;
    selected = { key: provinceKey(feature), name: feature.properties.name, level: "province" };
    status.textContent = feature.properties.name;
    render();
    updatePanel(selected);
  };

  const featureAt = (position) => {
    const lonLat = projection.invert(position);
    if (!lonLat) return null;

    if (chinaMode && globeZoom >= chinaDetailZoom) {
      const province = provinces.find((feature) => d3.geoContains(feature, lonLat));
      if (province) return { level: "province", feature: province };
    }

    const country = countries.find((feature) => d3.geoContains(feature, lonLat));
    return country ? { level: "country", feature: country } : null;
  };

  const isOnGlobe = (position) => {
    const dx = position[0] - width / 2;
    const dy = position[1] - height / 2;
    return Math.hypot(dx, dy) <= projection.scale() + 2;
  };

  const resetWorld = () => {
    selected = null;
    chinaMode = false;
    globeZoom = 1;
    projection.rotate(defaultRotation);
    status.textContent = "World";
    render();
    updatePanel(null);
  };

  const initialiseGlobe = (world, china) => {
    countries = topojson.feature(world, world.objects.countries).features;
    provinces = china.features.map((feature) => ({
      ...feature,
      properties: { ...feature.properties },
      geometry: reverseProvinceRings(feature.geometry)
    }));

    projection = d3.geoOrthographic()
      .translate([width / 2, height / 2])
      .scale(baseScale)
      .clipAngle(90)
      .precision(0.35)
      .rotate(defaultRotation);
    path = d3.geoPath(projection);

    svg = d3.select(globeHost)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Rotatable globe with country and China province selection");

    globeCircle = svg.append("circle")
      .attr("class", "travel-globe__halo")
      .attr("cx", width / 2)
      .attr("cy", height / 2);
    svg.append("path").attr("class", "travel-globe__ocean");
    svg.append("path").attr("class", "travel-globe__graticule");
    countryPaths = svg.append("g")
      .attr("class", "travel-globe__countries")
      .selectAll("path")
      .data(countries)
      .join("path")
      .attr("class", "travel-globe__country");
    boundaryPath = svg.append("path")
      .attr("class", "travel-globe__boundary")
      .datum(topojson.mesh(world, world.objects.countries, (left, right) => left !== right));
    provincePaths = svg.append("g")
      .attr("class", "travel-globe__provinces")
      .selectAll("path")
      .data(provinces)
      .join("path")
      .attr("class", "travel-globe__province");

    let startRotation = projection.rotate();
    let startPoint = [0, 0];
    const drag = d3.drag()
      .on("start", (event) => {
        dragging = true;
        didDrag = false;
        startRotation = projection.rotate();
        startPoint = [event.x, event.y];
      })
      .on("drag", (event) => {
        const dx = event.x - startPoint[0];
        const dy = event.y - startPoint[1];
        if (Math.hypot(dx, dy) > 4) didDrag = true;
        projection.rotate([
          startRotation[0] + dx * 0.34,
          clamp(startRotation[1] - dy * 0.34, -62, 62),
          0
        ]);
        render();
      })
      .on("end", () => {
        dragging = false;
        window.setTimeout(() => { didDrag = false; }, 0);
      });

    svg.call(drag)
      .on("click", (event) => {
        if (dragging || didDrag) return;
        const position = d3.pointer(event, svg.node());
        if (!isOnGlobe(position)) return;
        const target = featureAt(position);
        if (!target) return;
        if (target.level === "province") selectProvince(target.feature);
        else selectCountry(target.feature);
      })
      .on("wheel", (event) => {
        event.preventDefault();
        globeZoom = clamp(globeZoom * (event.deltaY > 0 ? 0.88 : 1.14), 0.9, 2.8);
        render();
      });

    status.textContent = "World";
    render();
  };

  controls.zoomIn.addEventListener("click", () => {
    globeZoom = clamp(globeZoom * 1.18, 0.9, 2.8);
    render();
  });
  controls.zoomOut.addEventListener("click", () => {
    globeZoom = clamp(globeZoom * 0.84, 0.9, 2.8);
    render();
  });
  controls.reset.addEventListener("click", resetWorld);
  controls.photoPrevious.addEventListener("click", () => {
    activePhotoIndex = (activePhotoIndex - 1 + activePhotos.length) % activePhotos.length;
    renderPhoto();
  });
  controls.photoNext.addEventListener("click", () => {
    activePhotoIndex = (activePhotoIndex + 1) % activePhotos.length;
    renderPhoto();
  });

  Promise.all([
    fetch(dataUrl("countries-110m.json")).then((response) => response.json()),
    fetch(dataUrl("china-provinces.json")).then((response) => response.json())
  ]).then(([world, china]) => {
    initialiseGlobe(world, china);
  }).catch(() => {
    status.textContent = "Atlas unavailable";
    panelTitle.textContent = "The atlas is resting";
    panelNote.textContent = "The map data could not be loaded just now.";
  });
})();
