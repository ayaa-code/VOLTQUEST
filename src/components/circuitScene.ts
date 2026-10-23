import * as THREE from 'three'

export type CircuitState = {
  on: boolean
  paused: boolean
  reduced: boolean
  phase: 'idle' | 'loading' | 'success'
}

// Procedural geometry only: no models, textures, controls or post-processing downloads.
export function createCircuitScene(
  host: HTMLDivElement,
  state: () => CircuitState,
  toggle: () => void,
  fail: () => void,
  variant: 'login' | 'dashboard' = 'login',
) {
  const pastel = variant === 'dashboard'
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-3.5, 3.5, 2.1, -2.1, 0.1, 30)
  camera.position.set(3.3, 6, 7.5)
  camera.lookAt(0, 0.1, 0)
  scene.add(
    new THREE.HemisphereLight(0xd9f6ff, pastel ? 0x82709c : 0x102436, 3),
  )
  const keyLight = new THREE.DirectionalLight(0xffffff, 4)
  keyLight.position.set(-3, 6, 3)
  scene.add(keyLight)
  const rim = new THREE.DirectionalLight(0x53e8db, 2)
  rim.position.set(3, 2, -4)
  scene.add(rim)
  const mat = (color: number, metalness = 0.1, roughness = 0.45) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness })
  const navy = mat(pastel ? 0x544275 : 0x183c52),
    wire = mat(pastel ? 0x7050aa : 0x438b9b, 0.5),
    metal = mat(0xbdd4d9, 0.8, 0.28),
    copper = mat(0xe6b873, 0.65)
  const teal = mat(0x12b99a, 0.3),
    cream = mat(0xdfbd87),
    stripe = mat(0x634443)
  function mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) {
    const item = new THREE.Mesh(geometry, material)
    item.position.set(x, y, z)
    scene.add(item)
    return item
  }
  function box(
    w: number,
    h: number,
    d: number,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) {
    return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z)
  }
  const v = (x: number, z: number, y = 0.22) => new THREE.Vector3(x, y, z)
  function tube(points: THREE.Vector3[], material = wire, radius = 0.035) {
    const path = new THREE.CurvePath<THREE.Vector3>()
    points
      .slice(1)
      .forEach((p, i) => path.add(new THREE.LineCurve3(points[i], p)))
    return mesh(
      new THREE.TubeGeometry(path, points.length * 10, radius, 8, false),
      material,
      0,
      0,
      0,
    )
  }
  box(5.7, 0.12, 3.5, mat(pastel ? 0xb9a5d6 : 0x102b3f), 0, -0.04, 0)
  // Four disjoint wire runs: the components themselves close the circuit.
  tube([v(-2.05, -0.5), v(-2.05, -1.2), v(-1.25, -1.2)])
  tube([v(-0.5, -1.2), v(0.35, -1.2)])
  tube([v(1.05, -1.2), v(2.05, -1.2), v(2.05, -0.27)])
  tube([v(2.05, 0.27), v(2.05, 1.2), v(-2.05, 1.2), v(-2.05, 0.5)])
  // Battery lies along Z. Positive terminal feeds the switch; negative is the return.
  const battery = mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.9, 24),
    teal,
    -2.05,
    0.39,
    0,
  )
  battery.rotation.x = Math.PI / 2
  for (const z of [-0.47, 0.47]) {
    const cap = mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.055, 24),
      metal,
      -2.05,
      0.39,
      z,
    )
    cap.rotation.x = Math.PI / 2
  }
  const terminal = mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16),
    copper,
    -2.05,
    0.39,
    -0.54,
  )
  terminal.rotation.x = Math.PI / 2
  box(0.18, 0.014, 0.03, navy, -2.05, 0.644, -0.15)
  box(0.03, 0.014, 0.18, navy, -2.05, 0.645, -0.15)
  box(0.18, 0.014, 0.03, navy, -2.05, 0.644, 0.24)
  // Short leads meet the actual terminals, not the battery housing.
  tube([v(-2.05, -0.5), v(-2.05, -0.59, 0.39)], metal)
  tube([v(-2.05, 0.5), v(-2.05, 0.5, 0.39)], metal)
  box(1.04, 0.1, 0.55, mat(pastel ? 0xb8a1d7 : 0x718993), -0.88, 0.14, -1.2)
  for (const x of [-1.25, -0.5])
    mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.12, 16),
      copper,
      x,
      0.25,
      -1.2,
    )
  const lever = new THREE.Group()
  lever.position.set(-1.25, 0.32, -1.2)
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.065, 0.09), copper)
  bar.position.x = 0.38
  lever.add(bar)
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.11, 0.18), teal)
  handle.position.set(0.48, 0.07, 0)
  lever.add(handle)
  scene.add(lever)
  const hit = box(
    1.25,
    0.8,
    0.85,
    new THREE.MeshBasicMaterial({ visible: false }),
    -0.85,
    0.4,
    -1.2,
  )
  const resistor = mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.7, 18),
    cream,
    0.7,
    0.24,
    -1.2,
  )
  resistor.rotation.z = Math.PI / 2
  for (const x of [0.49, 0.62, 0.88]) {
    const band = mesh(
      new THREE.CylinderGeometry(0.153, 0.153, 0.045, 18),
      stripe,
      x,
      0.24,
      -1.2,
    )
    band.rotation.z = Math.PI / 2
  }
  mesh(new THREE.CylinderGeometry(0.37, 0.4, 0.14, 24), metal, 2.05, 0.18, 0)
  mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.32, 24), navy, 2.05, 0.38, 0)
  for (const y of [0.3, 0.37, 0.44])
    mesh(
      new THREE.TorusGeometry(0.2, 0.025, 6, 24),
      metal,
      2.05,
      y,
      0,
    ).rotation.x = Math.PI / 2
  const glass = new THREE.MeshStandardMaterial({
    color: 0xffdf91,
    emissive: 0xffb634,
    emissiveIntensity: 0.7,
    roughness: 0.18,
    metalness: 0.05,
  })
  const bulb = mesh(
    new THREE.SphereGeometry(0.37, 24, 16),
    glass,
    2.05,
    0.82,
    0,
  )
  bulb.scale.y = 1.12
  mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 18), glass, 2.05, 0.54, 0)
  const glow = new THREE.PointLight(0xffc766, 4, 3)
  glow.position.set(2.05, 1.05, 0)
  scene.add(glow)
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd077,
    transparent: true,
    opacity: 0.045,
    depthWrite: false,
  })
  const halo = mesh(
    new THREE.SphereGeometry(0.59, 20, 12),
    haloMaterial,
    2.05,
    0.82,
    0,
  )
  // Conventional current direction from + to − through the external series circuit.
  const path = new THREE.CurvePath<THREE.Vector3>()
  const points = [
    v(-2.05, -0.5),
    v(-2.05, -1.2),
    v(2.05, -1.2),
    v(2.05, 1.2),
    v(-2.05, 1.2),
    v(-2.05, -0.5),
  ]
  points
    .slice(1)
    .forEach((p, i) => path.add(new THREE.LineCurve3(points[i], p)))
  const particleGeo = new THREE.SphereGeometry(0.037, 6, 6)
  const particleMaterial = new THREE.MeshBasicMaterial({
    color: pastel ? 0x007b81 : 0x8cf5ff,
  })
  const tailMaterial = new THREE.MeshBasicMaterial({
    color: pastel ? 0x007b81 : 0x50c6df,
    transparent: true,
    opacity: 0.3,
  })
  const particles = Array.from({ length: 20 }, () => [
    mesh(particleGeo, particleMaterial, 0, 0, 0),
    mesh(particleGeo, tailMaterial, 0, 0, 0),
  ])
  let disposed = false,
    inView = false,
    frame = 0,
    previous = 0,
    elapsed = 0,
    brightness = state().on ? 1 : 0
  let slowFrames = 0
  function draw(dt: number) {
    const s = state()
    lever.rotation.z =
      s.reduced || s.paused
        ? s.on
          ? 0
          : 0.65
        : THREE.MathUtils.damp(
            lever.rotation.z,
            s.on ? 0 : 0.65,
            14,
            dt || 1 / 60,
          )
    const conducting = s.on && lever.rotation.z < 0.025
    const target = conducting ? 1 : 0
    brightness =
      s.reduced || s.paused
        ? target
        : THREE.MathUtils.damp(brightness, target, 8, dt || 1 / 60)
    glass.color.setHex(conducting ? 0xffe7a4 : 0x597783)
    glass.emissiveIntensity = brightness * (s.phase === 'success' ? 2.5 : 0.8)
    glow.intensity = brightness * (s.phase === 'success' ? 7 : 3)
    halo.visible = conducting
    haloMaterial.opacity = 0.06 * brightness
    particles.forEach(([head, tail], i) => {
      head.visible = tail.visible = conducting
      const fraction = (i / particles.length + elapsed * 0.07) % 1
      head.position.copy(path.getPointAt(fraction))
      tail.position.copy(path.getPointAt((fraction + 0.994) % 1))
    })
    renderer.render(scene, camera)
  }
  function stop() {
    cancelAnimationFrame(frame)
    frame = 0
    previous = 0
  }
  function tick(now: number) {
    frame = 0
    if (disposed) return
    const dt = previous ? Math.min((now - previous) / 1000, 0.1) : 0
    if (previous && now - previous > 70) slowFrames++
    else slowFrames = Math.max(0, slowFrames - 1)
    previous = now
    if (slowFrames > 55) {
      fail()
      return
    }
    const s = state()
    if (s.on)
      elapsed +=
        dt * (s.phase === 'idle' ? 1 : s.phase === 'loading' ? 1.8 : 2.5)
    draw(dt)
    frame = requestAnimationFrame(tick)
  }
  function refresh() {
    stop()
    if (disposed) return
    draw(0)
    const s = state()
    if (inView && !document.hidden && !s.paused && !s.reduced)
      frame = requestAnimationFrame(tick)
  }
  const resize = new ResizeObserver(() => {
    if (disposed) return
    const w = host.clientWidth,
      h = host.clientHeight
    if (!w || !h) return
    const aspect = w / h
    const halfWidth = Math.max(3.5, 2.05 * aspect)
    camera.left = -halfWidth
    camera.right = halfWidth
    camera.top = halfWidth / aspect
    camera.bottom = -halfWidth / aspect
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    refresh()
  })
  resize.observe(host)
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    refresh()
  })
  observer.observe(host)
  document.addEventListener('visibilitychange', refresh)
  const ray = new THREE.Raycaster()
  function click(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    ray.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      camera,
    )
    if (ray.intersectObject(hit).length) toggle()
  }
  function lost(event: Event) {
    event.preventDefault()
    fail()
  }
  renderer.domElement.addEventListener('pointerup', click)
  renderer.domElement.addEventListener('webglcontextlost', lost)
  refresh()
  return {
    refresh,
    dispose() {
      disposed = true
      stop()
      resize.disconnect()
      observer.disconnect()
      document.removeEventListener('visibilitychange', refresh)
      renderer.domElement.removeEventListener('pointerup', click)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry)
          ;(Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((m) => materials.add(m))
        }
      })
      geometries.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
