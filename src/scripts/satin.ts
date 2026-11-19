/* Silver satin background: a custom WebGL fabric shader (folds, sheen, pointer swell, click ripples). */
export function initSatin() {
  const canvas = document.querySelector<HTMLCanvasElement>('.satin');
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!canvas || !hero) return;
  const glMaybe = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!glMaybe) return; // CSS silver glow stays as the fallback
  const gl: WebGLRenderingContext = glMaybe;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fs = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uSwell;uniform vec4 uRip[6];',
    'uniform vec3 uBody;uniform vec3 uSheen;uniform vec3 uBg;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}',
    'float H(vec2 p){',
    ' float a=0.42;vec2 q=mat2(cos(a),-sin(a),sin(a),cos(a))*p;float t=uTime;',
    ' q.x+=0.38*sin(q.y*1.25+t*0.22)+0.30*(noise(q*0.7+vec2(t*0.05,-t*0.04))-0.5);',
    ' float h=sin(q.x*9.5+t*0.45+1.6*sin(q.y*1.4-t*0.18))*0.5;',
    ' h+=sin(q.x*16.0-q.y*1.2+t*0.32+1.2*sin(q.y*2.1+t*0.12))*0.16;',
    ' h+=(noise(q*2.2+vec2(t*0.08,0.))-0.5)*0.22;',
    ' vec2 d=p-uMouse;h+=uSwell*0.75*exp(-dot(d,d)*7.0);',
    ' for(int i=0;i<6;i++){vec4 r=uRip[i];if(r.w>0.5){float age=uTime-r.z;float dist=length(p-r.xy);',
    '  h+=0.22*sin(dist*20.-age*7.)*exp(-age*1.3)*exp(-abs(dist-age*0.42)*7.);}}',
    ' return h;}',
    'void main(){',
    ' vec2 p=(gl_FragCoord.xy-0.5*uRes)/uRes.y;float e=1.6/uRes.y;',
    ' float h=H(p);float hx=H(p+vec2(e,0.));float hy=H(p+vec2(0.,e));',
    ' vec3 n=normalize(vec3(-(hx-h)/e*0.16,-(hy-h)/e*0.16,1.));',
    ' vec3 L=normalize(vec3(-0.55,0.65,0.75));',
    ' float diff=clamp(dot(n,L),0.,1.);',
    ' float spec=pow(clamp(dot(reflect(-L,n),vec3(0.,0.,1.)),0.,1.),14.);vec3 L2=normalize(vec3(0.7,-0.3,0.6));float spec2=pow(clamp(dot(reflect(-L2,n),vec3(0.,0.,1.)),0.,1.),30.);',
    ' float fres=pow(1.-n.z,1.6);',
    ' float fold=smoothstep(-0.75,0.7,h);',
    ' vec3 col=mix(uBg,uBody,(0.15+0.85*fold)*pow(diff,2.2)*1.1);',
    ' col+=uSheen*(spec*2.0+spec2*0.8)*(0.4+0.6*fold)+uSheen*fres*0.15;',
    ' float v=smoothstep(1.25,0.25,length(p*vec2(0.8,1.)));col=mix(uBg,col,0.35+0.65*v);',
    ' gl_FragColor=vec4(col,1.);}',
  ].join('\n');

  const sh = (type: number, src: string) => {
    const o = gl.createShader(type);
    if (!o) return null;
    gl.shaderSource(o, src);
    gl.compileShader(o);
    return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null;
  };
  const v = sh(gl.VERTEX_SHADER, vs);
  const f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const prog = gl.createProgram();
  if (!prog) return;
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U: Record<string, WebGLUniformLocation | null> = {};
  ['uRes', 'uTime', 'uMouse', 'uSwell', 'uRip', 'uBody', 'uSheen', 'uBg'].forEach((k) => {
    U[k] = gl.getUniformLocation(prog, k);
  });
  gl.uniform3f(U.uBody, 0.58, 0.6, 0.65); // satin body: graphite silver
  gl.uniform3f(U.uSheen, 0.95, 0.96, 1.0); // sheen: bright silver
  gl.uniform3f(U.uBg, 0.024, 0.026, 0.031); // deep creases

  const dprCap = coarse ? 1 : 1.5;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, dprCap);
    canvas.width = Math.max(1, Math.round(r.width * d));
    canvas.height = Math.max(1, Math.round(r.height * d));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0.35, y: 0, tx: 0.35, ty: 0 };
  let swell = 0;
  let swellT = 0;
  const rips = new Float32Array(24);
  let ripI = 0;
  let time = 0;
  let last = performance.now();
  const toP = (e: MouseEvent | PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left - r.width / 2) / r.height, y: -(e.clientY - r.top - r.height / 2) / r.height };
  };
  if (!reduce && !coarse) {
    hero.addEventListener('mousemove', (e) => {
      const q = toP(e);
      mouse.tx = q.x;
      mouse.ty = q.y;
      swellT = 1;
    });
    hero.addEventListener('mouseleave', () => {
      swellT = 0;
    });
  }
  if (!reduce) {
    hero.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('a,button')) return;
      const q = toP(e);
      rips.set([q.x, q.y, time, 1], ripI * 4);
      ripI = (ripI + 1) % 6;
    });
  }

  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (en) => {
        visible = en[0].isIntersecting;
      },
      { rootMargin: '100px' },
    ).observe(hero);
  }

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible && !document.hidden) {
      time += dt;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      swell += (swellT - swell) * 0.04;
      gl.uniform1f(U.uTime, time);
      gl.uniform2f(U.uMouse, mouse.x, mouse.y);
      gl.uniform1f(U.uSwell, swell);
      gl.uniform4fv(U.uRip, rips);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (!reduce) requestAnimationFrame(frame);
  };
  if (reduce) {
    time = 12;
    frame(performance.now());
  } else {
    requestAnimationFrame(frame);
  }
  canvas.parentElement?.classList.add('has-satin');
}
