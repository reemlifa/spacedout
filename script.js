AFRAME.registerComponent("track-distance", {
  init: function () {
    this.sun = document.querySelector("#sun");
    this.distanceDisplay = document.getElementById("distance-display");

    this.rigWorldPos = new THREE.Vector3();
    this.sunWorldPos = new THREE.Vector3();

    // Map of planet entity IDs to their real-world AU distances
    this.planets = [
      { id: "mercury", au: 0.39 },
      { id: "venus", au: 0.72 },
      { id: "earth", au: 1.0 },
      { id: "mars", au: 1.52 },
      { id: "jupiter", au: 5.2 },
      { id: "saturn", au: 9.58 },
      { id: "uranus", au: 19.2 },
      { id: "neptune", au: 30.1 },
    ];

    // Preload planet world positions
    this.planetEls = this.planets.map((p) => {
      const el = document.querySelector(`#${p.id}`);
      return { el, au: p.au, pos: new THREE.Vector3() };
    });
  },

  tick: function () {
    if (!this.sun) return;

    const cameraEl = this.el.sceneEl.camera.el;
    if (!cameraEl) return;

    cameraEl.object3D.getWorldPosition(this.rigWorldPos);
    this.sun.object3D.getWorldPosition(this.sunWorldPos);

    // Distance from rig to sun in A-Frame units
    let distanceToSun = this.rigWorldPos.distanceTo(this.sunWorldPos);

    // Update planet positions
    this.planetEls.forEach((p) => {
      p.el.object3D.getWorldPosition(p.pos);
    });

    // Find two nearest planets (one closer, one farther)
    let sortedPlanets = this.planetEls.slice().sort((a, b) => {
      let distA = a.pos.distanceTo(this.sunWorldPos);
      let distB = b.pos.distanceTo(this.sunWorldPos);
      return distA - distB;
    });

    let lower = sortedPlanets.find(
      (p) => p.pos.distanceTo(this.sunWorldPos) <= distanceToSun
    );
    let higher = sortedPlanets.find(
      (p) => p.pos.distanceTo(this.sunWorldPos) >= distanceToSun
    );

    if (!lower) lower = sortedPlanets[0];
    if (!higher) higher = sortedPlanets[sortedPlanets.length - 1];

    // Linear interpolation between the two planets
    let lowerDist = lower.pos.distanceTo(this.sunWorldPos);
    let higherDist = higher.pos.distanceTo(this.sunWorldPos);
    let t = 0;
    if (higherDist !== lowerDist) {
      t = (distanceToSun - lowerDist) / (higherDist - lowerDist);
    }

    let estimatedAU = lower.au + t * (higher.au - lower.au);

    if (this.distanceDisplay) {
      this.distanceDisplay.textContent = `Distance: ${estimatedAU.toFixed(
        2
      )} AU`;
    }
  },
});
