/* Decorative water refraction over the still photograph. Text and land never move. */
(() => {
  'use strict';
  const photo = document.querySelector('.yoshi-hero');
  let canvas = document.querySelector('.smf-water-canvas');
  if (!photo || !canvas) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let gl;
  let program;
  let timeLocation;
  let context2d;
  let waterMask;
  let crop;
  let renderer;
  let ready = false;
  let disposed = false;
  let inView = true;
  let frameId = 0;
  let previous = 0;
  let lastPaint = -Infinity;
  let elapsed = 0;
  let frames = 0;
  let resizeObserver;
  let visibilityObserver;
  const wantsMotion = () => !preference.matches;

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_view;
    void main() {
      v_view = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const fragmentSource = `
    precision highp float;
    uniform sampler2D u_photo;
    uniform vec4 u_crop;
    uniform vec2 u_image_size;
    uniform float u_time;
    varying vec2 v_view;

    float ellipse(vec2 point, vec2 center, vec2 radius) {
      return 1.0 - smoothstep(0.96, 1.10, length((point - center) / radius));
    }
    void main() {
      vec2 view = vec2(v_view.x, 1.0 - v_view.y);
      vec2 uv = u_crop.xy + view * u_crop.zw;

      // The far bank and sloping near shoreline are both outside the moving layer.
      float far_bank = 0.453 + 0.012 * uv.x;
      float near_bank = 0.951 - 0.303 * uv.x;
      float mask = smoothstep(far_bank + 0.008, far_bank + 0.022, uv.y);
      mask *= 1.0 - smoothstep(near_bank - 0.020, near_bank - 0.008, uv.y);

      // Protect the hood, braid and upper body where they overlap the lake.
      float hood = ellipse(uv, vec2(0.846, 0.621), vec2(0.041, 0.060));
      float shoulders = ellipse(uv, vec2(0.840, 0.716), vec2(0.071, 0.093));
      mask *= 1.0 - max(hood, shoulders);
      if (mask < 0.001) {
        gl_FragColor = vec4(0.0);
        return;
      }

      float depth = clamp((uv.y - far_bank) / 0.43, 0.0, 1.0);
      float swell = sin(uv.y * 190.0 - u_time * 1.10 + sin(uv.x * 12.0 + u_time * 0.23));
      float ripple = sin(uv.y * 355.0 + uv.x * 25.0 - u_time * 1.62);
      float fine = sin(uv.y * 610.0 - uv.x * 17.0 + u_time * 1.28);
      float strength = 0.35 + depth * 1.15;
      vec2 drift = vec2(
        (swell * 3.8 + ripple * 1.7 + fine * 0.6) * strength,
        sin(uv.y * 210.0 + uv.x * 10.0 - u_time * 0.85) * 0.8 * strength
      ) / u_image_size;
      vec3 color = texture2D(u_photo, uv + drift * mask).rgb;
      float light = smoothstep(0.12, 0.65, max(color.r, max(color.g, color.b)));
      color *= 1.0 + (swell * 0.014 + ripple * 0.008) * depth * light;
      gl_FragColor = vec4(color, mask);
    }
  `;

  function shader(type, source) {
    const value = gl.createShader(type);
    gl.shaderSource(value, source);
    gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(value);
      gl.deleteShader(value);
      throw new Error(message || 'Water shader unavailable');
    }
    return value;
  }

  function resize() {
    if (!ready || disposed) return;
    const width = photo.clientWidth;
    const height = photo.clientHeight;
    if (!width || !height) return;
    const density = renderer === 'canvas2d'
      ? Math.min(devicePixelRatio || 1, 1, 960 / width, 650 / height)
      : Math.min(devicePixelRatio || 1, 1.5, 1600 / width, 1000 / height);
    canvas.width = Math.max(1, Math.round(width * density));
    canvas.height = Math.max(1, Math.round(height * density));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.style.left = photo.offsetLeft + 'px';
    canvas.style.top = photo.offsetTop + 'px';
    const position = getComputedStyle(photo).objectPosition.split(' ').map(parseFloat);
    const fit = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
    const imageWidth = photo.naturalWidth * fit;
    const imageHeight = photo.naturalHeight * fit;
    crop = [
      (imageWidth - width) * position[0] / 100 / imageWidth,
      (imageHeight - height) * position[1] / 100 / imageHeight,
      width / imageWidth, height / imageHeight];
    if (renderer === 'webgl') {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform4f(gl.getUniformLocation(program, 'u_crop'), ...crop);
      gl.uniform2f(gl.getUniformLocation(program, 'u_image_size'), photo.naturalWidth, photo.naturalHeight);
    } else {
      makeWaterMask();
    }
    paint();
  }

  function smoothstep(low, high, value) {
    const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
    return t * t * (3 - 2 * t);
  }

  function makeWaterMask() {
    waterMask = document.createElement('canvas');
    waterMask.width = canvas.width;
    waterMask.height = canvas.height;
    const maskContext = waterMask.getContext('2d');
    const pixels = maskContext.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 1) {
      const v = crop[1] + (y + 0.5) / canvas.height * crop[3];
      for (let x = 0; x < canvas.width; x += 1) {
        const u = crop[0] + (x + 0.5) / canvas.width * crop[2];
        const far = 0.453 + 0.012 * u;
        const near = 0.951 - 0.303 * u;
        const hood = 1 - smoothstep(0.96, 1.10, Math.hypot((u - 0.846) / 0.041, (v - 0.621) / 0.060));
        const body = 1 - smoothstep(0.96, 1.10, Math.hypot((u - 0.840) / 0.071, (v - 0.716) / 0.093));
        const alpha = smoothstep(far + 0.008, far + 0.022, v)
          * (1 - smoothstep(near - 0.020, near - 0.008, v)) * (1 - Math.max(hood, body));
        pixels.data[(y * canvas.width + x) * 4 + 3] = Math.round(alpha * 255);
      }
    }
    maskContext.putImageData(pixels, 0, 0);
  }

  function paint2d() {
    context2d.clearRect(0, 0, canvas.width, canvas.height);
    const band = 2;
    const center = crop[0] + crop[2] / 2;
    for (let y = 0; y < canvas.height; y += band) {
      const v = crop[1] + (y + band / 2) / canvas.height * crop[3];
      if (v < 0.46 || v > 0.95) continue;
      const depth = Math.max(0, Math.min(1, (v - (0.453 + 0.012 * center)) / 0.43));
      const strength = 0.35 + depth * 1.15;
      const swell = Math.sin(v * 190 - elapsed * 1.10 + Math.sin(center * 12 + elapsed * 0.23));
      const ripple = Math.sin(v * 355 + center * 25 - elapsed * 1.62);
      const fine = Math.sin(v * 610 - center * 17 + elapsed * 1.28);
      const dx = (swell * 3.8 + ripple * 1.7 + fine * 0.6) * strength;
      const dy = Math.sin(v * 210 + center * 10 - elapsed * 0.85) * 0.8 * strength;
      const height = Math.min(band, canvas.height - y);
      context2d.drawImage(photo,
        crop[0] * photo.naturalWidth + dx,
        (crop[1] + y / canvas.height * crop[3]) * photo.naturalHeight + dy,
        crop[2] * photo.naturalWidth, height / canvas.height * crop[3] * photo.naturalHeight,
        0, y, canvas.width, height);
    }
    context2d.globalCompositeOperation = 'destination-in';
    context2d.drawImage(waterMask, 0, 0);
    context2d.globalCompositeOperation = 'source-over';
  }

  function useCanvas2d() {
    // A canvas cannot change context type after WebGL has acquired it.
    const replacement = canvas.cloneNode(false);
    canvas.replaceWith(replacement);
    canvas = replacement;
    context2d = canvas.getContext('2d', {alpha: true});
    if (!context2d) throw new Error('Water canvas unavailable');
    renderer = 'canvas2d';
    canvas.dataset.waterRenderer = renderer;
  }

  function paint() {
    if (!ready || disposed) return;
    if (renderer === 'webgl') {
      if (gl.isContextLost()) return;
      gl.uniform1f(timeLocation, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
      paint2d();
    }
    frames += 1;
    if (frames === 1 || frames % 15 === 0) canvas.dataset.renderedFrames = String(frames);
  }

  function frame(now) {
    frameId = 0;
    if (!ready || disposed) return;
    if (!wantsMotion() || !inView || document.hidden) { sync(); return; }
    if (now - lastPaint >= 1000 / (renderer === 'canvas2d' ? 24 : 30)) {
      if (previous) elapsed += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      lastPaint = now;
      paint();
    }
    frameId = requestAnimationFrame(frame);
  }

  function sync() {
    if (!ready || disposed) return;
    const wanted = wantsMotion();
    const running = wanted && inView && !document.hidden;
    if (!running && frameId) { cancelAnimationFrame(frameId); frameId = 0; }
    if (!running) previous = 0;
    canvas.hidden = !wanted;
    canvas.dataset.waterState = running ? 'playing' : wanted ? 'hidden' : preference.matches ? 'reduced' : 'paused';
    if (running && !frameId) frameId = requestAnimationFrame(frame);
  }

  function useWebgl() {
    gl = canvas.getContext('webgl', {alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false});
    if (!gl) throw new Error('WebGL unavailable');
    program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Water program unavailable');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, photo);
    gl.uniform1i(gl.getUniformLocation(program, 'u_photo'), 0);
    timeLocation = gl.getUniformLocation(program, 'u_time');
    renderer = 'webgl';
    canvas.dataset.waterRenderer = renderer;
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      previous = 0;
      try { useCanvas2d(); resize(); sync(); }
      catch (_) { unavailable(); }
    });
  }

  function unavailable() {
    ready = false;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    canvas.hidden = true;
    canvas.dataset.waterState = 'unavailable';
  }

  async function start() {
    try {
      await photo.decode();
      if (disposed) return;
      try { useWebgl(); }
      catch (_) { useCanvas2d(); }
      ready = true;
      resize();
      preference.addEventListener('change', () => sync());
      document.addEventListener('visibilitychange', sync);
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(photo);
      visibilityObserver = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); });
      visibilityObserver.observe(photo);
      sync();
    } catch (_) {
      unavailable();
    }
  }
  addEventListener('pagehide', event => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    previous = 0;
    if (!event.persisted) {
      disposed = true;
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
    }
  });
  addEventListener('pageshow', event => {
    if (event.persisted && ready && !disposed) { resize(); sync(); }
  });
  start();
})();
