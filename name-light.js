// A small advected paint field drives an iridescent material. Letter masks are
// rasterised from the supplied vectors at display pixel density, independently
// of the simulation resolution. Nothing is stretched from a low-res colour map.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const stops=[[56,7,45],[91,11,47],[149,1,44],[205,0,32],[246,27,12],[255,82,33],[255,119,53],[255,147,68],[253,161,101],[249,169,136],[243,175,173],[232,180,199],[209,190,218],[166,204,229],[113,215,238],[28,221,255],[0,197,255],[0,160,255],[0,114,255],[6,78,246],[0,42,213],[0,22,171],[12,15,133],[37,18,85],[53,9,49]];
const palette=new Uint8Array(1024*4);
for(let i=0;i<1024;i++){const f=i/1023*(stops.length-1),j=Math.min(stops.length-2,Math.floor(f)),t=f-j;for(let c=0;c<3;c++)palette[i*4+c]=Math.round(stops[j][c]*(1-t)+stops[j+1][c]*t);palette[i*4+3]=255;}

class PaintField{
 constructor(w,h){this.w=w;this.h=h;this.a=new Float32Array(w*h*4);this.b=new Float32Array(w*h*4);this.smooth=new Float32Array(w*h*2);this.bytes=new Uint8Array(w*h*4);this.vx=0;this.vy=0;this.version=0;}
 step(dt,from,to,moving,radius){
  const {w,h,a,b,smooth}=this,decay=Math.pow(.985,dt*60),fast=Math.pow(.5,dt*60),fade=.004*dt*60;
  // The low frequency velocity advects paint smoothly; two-axis diffusion
  // removes grid corners without blurring the final letter edges.
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=(y*w+x)*4,l=(y*w+Math.max(0,x-2))*4,r=(y*w+Math.min(w-1,x+2))*4,u=(Math.max(0,y-2)*w+x)*4,d=(Math.min(h-1,y+2)*w+x)*4,q=(y*w+x)*2;
   smooth[q]=(a[p]*4+a[l]+a[r]+a[u]+a[d])/8;smooth[q+1]=(a[p+1]*4+a[l+1]+a[r+1]+a[u+1]+a[d+1])/8;
  }
  const dx=to.x-from.x,dy=to.y-from.y,len=dx*dx+dy*dy;
  this.vx=this.vx*Math.pow(.8,dt*60)+dx*dt*.8;this.vy=this.vy*Math.pow(.8,dt*60)+dy*dt*.8;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=(y*w+x)*4,q=(y*w+x)*2,sx=clamp(x-smooth[q]*25*dt*60,0,w-1.001),sy=clamp(y-smooth[q+1]*25*dt*60,0,h-1.001),ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
   const i=(iy*w+ix)*4,j=i+w*4;
   for(let c=0;c<4;c++)b[p+c]=((a[i+c]*(1-fx)+a[i+4+c]*fx)*(1-fy)+(a[j+c]*(1-fx)+a[j+4+c]*fx)*fy)*(c===3?fast:decay);
   b[p+2]=Math.max(0,b[p+2]-fade);b[p+3]=Math.max(0,b[p+3]-fade);
   if(moving&&radius>0){const t=len?clamp(((x-from.x)*dx+(y-from.y)*dy)/len):0,dist=Math.hypot(x-from.x-dx*t,y-from.y-dy*t)/radius;
    if(dist<1){const d=1-dist*dist*(3-2*dist);b[p]+=this.vx*d;b[p+1]+=this.vy*d;b[p+2]+=d;b[p+3]+=d;}
   }
   b[p]=clamp(b[p],-.5,.5);b[p+1]=clamp(b[p+1],-.5,.5);b[p+2]=clamp(b[p+2]);b[p+3]=clamp(b[p+3]);
  }
  this.a=b;this.b=a;this.version++;
 }
 pack(){const a=this.a,b=this.bytes;for(let i=0;i<a.length;i+=4){b[i]=Math.round((a[i]+.5)*255);b[i+1]=Math.round((a[i+1]+.5)*255);b[i+2]=Math.round(a[i+2]*255);b[i+3]=Math.round(a[i+3]*255);}return b;}
}

function gpuRenderer(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,depth:false});if(!gl)return null;
 const vert='attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
 const frag=`precision highp float;
 uniform sampler2D maskMap,paintMap,paletteMap;uniform vec2 fieldSize,screenScale,screenOffset;uniform float time;varying vec2 uv;
 vec4 field(vec2 p){
  vec2 xy=p*fieldSize-.5,f=fract(xy);xy=floor(xy);
  vec2 f2=f*f,f3=f2*f,w0=(1.-3.*f+3.*f2-f3)/6.,w1=(4.-6.*f2+3.*f3)/6.,w2=(1.+3.*f+3.*f2-3.*f3)/6.,w3=f3/6.;
  vec2 g0=w0+w1,g1=w2+w3,a=(xy-1.+w1/g0+.5)/fieldSize,b=(xy+1.+w3/g1+.5)/fieldSize;
  return texture2D(paintMap,a)*g0.x*g0.y+texture2D(paintMap,vec2(b.x,a.y))*g1.x*g0.y+texture2D(paintMap,vec2(a.x,b.y))*g0.x*g1.y+texture2D(paintMap,b)*g1.x*g1.y;
 }
 void main(){vec2 p=vec2(uv.x,1.-uv.y);vec4 mask=texture2D(maskMap,p);if(mask.r<.001)discard;
  vec4 paint=field(p);vec2 screen=screenOffset+p*screenScale;
  float wave=(screen.x-screen.y)*4.+time,d=.5+.5*cos(wave),de=1.-d,strength=max(paint.b,paint.a);
  float hue=(paint.r+paint.g)*1.5;
  vec3 color=mix(vec3(.004+d*d*.015),texture2D(paletteMap,vec2(fract(hue+d*2.),.5)).rgb,clamp(strength,0.,1.));
  vec3 edge=mix(vec3(.004+de*de*.15),texture2D(paletteMap,vec2(fract(hue+de*2.),.5)).rgb,clamp(strength*4.+max(0.,de*2.-1.)*.15,0.,1.));
  gl_FragColor=vec4(mix(color,edge,mask.g/max(.001,mask.r)),mask.r);
 }`;
 function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Name material link failed');}catch(e){return null;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const textures=[0,1,2].map(i=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;});
 ['maskMap','paintMap','paletteMap'].forEach((n,i)=>gl.uniform1i(gl.getUniformLocation(program,n),i));
 gl.activeTexture(gl.TEXTURE2);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1024,1,0,gl.RGBA,gl.UNSIGNED_BYTE,palette);
 return {kind:'webgl',resize(mask){gl.viewport(0,0,canvas.width,canvas.height);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[0]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width,canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,mask);},draw(field,time,rect){gl.useProgram(program);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textures[1]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,field.w,field.h,0,gl.RGBA,gl.UNSIGNED_BYTE,field.pack());gl.uniform2f(gl.getUniformLocation(program,'fieldSize'),field.w,field.h);gl.uniform2f(gl.getUniformLocation(program,'screenScale'),rect.width/innerWidth,rect.height/innerHeight);gl.uniform2f(gl.getUniformLocation(program,'screenOffset'),rect.left/innerWidth,rect.top/innerHeight);gl.uniform1f(gl.getUniformLocation(program,'time'),time);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);},destroy(){textures.forEach(t=>gl.deleteTexture(t));gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}

function cpuRenderer(canvas){
 const ctx=canvas.getContext('2d',{alpha:true});let image,mask,indices,horizontal,xIndex,xWeight,yIndex,yWeight,cachedW=0,cachedH=0,cachedVersion=-1;
 function spline(t){return [(1-3*t+3*t*t-t*t*t)/6,(4-6*t*t+3*t*t*t)/6,(1+3*t+3*t*t-3*t*t*t)/6,t*t*t/6];}
 function prepare(field){const w=canvas.width,h=canvas.height,fw=field.w,fh=field.h;cachedW=fw;cachedH=fh;cachedVersion=-1;horizontal=new Float32Array(w*fh*4);xIndex=new Uint32Array(w*4);xWeight=new Float32Array(w*4);yIndex=new Uint32Array(h*4);yWeight=new Float32Array(h*4);
  for(let x=0;x<w;x++){const f=x/w*fw-.5,i=Math.floor(f),weights=spline(f-i);for(let k=0;k<4;k++){xIndex[x*4+k]=clamp(i+k-1,0,fw-1)*4;xWeight[x*4+k]=weights[k];}}
  for(let y=0;y<h;y++){const f=y/h*fh-.5,i=Math.floor(f),weights=spline(f-i);for(let k=0;k<4;k++){yIndex[y*4+k]=clamp(i+k-1,0,fh-1)*w*4;yWeight[y*4+k]=weights[k];}}
 }
 return {kind:'canvas2d',resize(m){cachedW=0;mask=m;image=ctx.createImageData(canvas.width,canvas.height);const list=[];for(let p=0;p<m.length;p+=4)if(m[p])list.push(p);indices=new Uint32Array(list);},draw(field,time,rect){
  const {width:w,height:h}=canvas,{a,w:fw,h:fh}=field,out=image.data,scaleX=rect.width/innerWidth,scaleY=rect.height/innerHeight,origin=rect.left/innerWidth-rect.top/innerHeight;
  if(cachedW!==fw||cachedH!==fh)prepare(field);
  // Separable cubic reconstruction, evaluated at every display pixel. The
  // simulation grid never becomes visible as squares in the coloured light.
  if(cachedVersion!==field.version)for(let y=0;y<fh;y++){const row=y*fw*4;for(let x=0;x<w;x++){const q=x*4,p=(y*w+x)*4;for(let c=0;c<4;c++)horizontal[p+c]=a[row+xIndex[q]+c]*xWeight[q]+a[row+xIndex[q+1]+c]*xWeight[q+1]+a[row+xIndex[q+2]+c]*xWeight[q+2]+a[row+xIndex[q+3]+c]*xWeight[q+3];}}
  cachedVersion=field.version;
  for(let n=0;n<indices.length;n++){const p=indices[n],pixel=p/4,y=Math.floor(pixel/w),x=pixel-y*w,q=y*4,i=yIndex[q]+x*4,j=yIndex[q+1]+x*4,k0=yIndex[q+2]+x*4,l=yIndex[q+3]+x*4;
   const v0=horizontal[i]*yWeight[q]+horizontal[j]*yWeight[q+1]+horizontal[k0]*yWeight[q+2]+horizontal[l]*yWeight[q+3],v1=horizontal[i+1]*yWeight[q]+horizontal[j+1]*yWeight[q+1]+horizontal[k0+1]*yWeight[q+2]+horizontal[l+1]*yWeight[q+3];
   const z=horizontal[i+2]*yWeight[q]+horizontal[j+2]*yWeight[q+1]+horizontal[k0+2]*yWeight[q+2]+horizontal[l+2]*yWeight[q+3],z2=horizontal[i+3]*yWeight[q]+horizontal[j+3]*yWeight[q+1]+horizontal[k0+3]*yWeight[q+2]+horizontal[l+3]*yWeight[q+3];
   const d=.5+.5*Math.cos((origin+x/w*scaleX-y/h*scaleY)*4+time),de=1-d,strength=Math.max(z,z2),hue=(1+v0+v1)*1.5,base=(.004+d*d*.015)*255,edgeBase=(.004+de*de*.15)*255,edgeStrength=clamp(strength*4+Math.max(0,de*2-1)*.15),edgeMix=mask[p+1]/mask[p];
   const t=(hue+d*2)%1*1023,k=Math.floor(t)*4,f=t-Math.floor(t),te=(hue+de*2)%1*1023,ke=Math.floor(te)*4,fe=te-Math.floor(te);
   for(let c=0;c<3;c++){const col=base*(1-strength)+(palette[k+c]*(1-f)+palette[k+4+c]*f)*strength,edge=edgeBase*(1-edgeStrength)+(palette[ke+c]*(1-fe)+palette[ke+4+c]*fe)*edgeStrength;out[p+c]=Math.round(col*(1-edgeMix)+edge*edgeMix);}
   out[p+3]=mask[p];
  }
  ctx.putImageData(image,0,0);
 },destroy(){}};
}

export function startNameMaterial(root,{fine,reduced}){
 let canvas=document.createElement('canvas');canvas.className='cv-name-material';canvas.setAttribute('aria-hidden','true');root.append(canvas);
 let renderer=gpuRenderer(canvas);
 if(!renderer){const replacement=canvas.cloneNode();canvas.replaceWith(replacement);canvas=replacement;renderer=cpuRenderer(canvas);}
 root.dataset.renderer=renderer.kind;
 const imgs=['alexander','kostikov'].map(name=>{const im=new Image();im.src=`/assets/${name}-name.svg`;return im;});
 let field,raf=0,last=0,dead=false,ready=false,px=.5,py=.5,oldX=.5,oldY=.5,moved=false,inside=false,simTime=0,autoX=.5,autoY=.5,onScreen=false,lastInput=0;
 function size(){if(dead||!imgs.every(im=>im.complete&&im.naturalWidth))return;const rect=root.getBoundingClientRect(),dpr=Math.max(1,devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(ready&&canvas.width===w&&canvas.height===h)return;canvas.width=w;canvas.height=h;
  const maskCanvas=document.createElement('canvas');maskCanvas.width=w;maskCanvas.height=h;const cx=maskCanvas.getContext('2d',{willReadFrequently:true});
  [...root.querySelectorAll('.cv-name-word')].forEach((el,i)=>{const r=el.getBoundingClientRect();cx.drawImage(imgs[i],0,Math.round((r.top-rect.top)*dpr),w,Math.round(r.height*dpr));});
  const rgba=cx.getImageData(0,0,w,h).data,mask=new Uint8Array(w*h*4),radius=Math.max(1,Math.round(dpr*.65));
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(y*w+x)*4,a=rgba[p+3];if(!a)continue;const l=(y*w+Math.max(0,x-radius))*4+3,r=(y*w+Math.min(w-1,x+radius))*4+3,u=(Math.max(0,y-radius)*w+x)*4+3,d=(Math.min(h-1,y+radius)*w+x)*4+3;const inner=Math.min(x<radius||x>=w-radius||y<radius||y>=h-radius?0:255,rgba[l],rgba[r],rgba[u],rgba[d]);mask[p]=a;mask[p+1]=Math.max(0,a-inner);mask[p+3]=255;}
  field=new PaintField(Math.max(32,Math.ceil(rect.width/2.5)),Math.max(16,Math.ceil(rect.height/2.5)));renderer.resize(mask);root.dataset.pixelDensity=dpr;ready=true;last=0;wake();
 }
 function move(e){if(reduced)return;const r=root.getBoundingClientRect();px=clamp((e.clientX-r.left)/r.width);py=clamp((e.clientY-r.top)/r.height);if(!inside){oldX=px;oldY=py;}inside=true;moved=true;lastInput=simTime;}
 function leave(){inside=false;}
 function wake(){if(!dead&&onScreen&&!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
 function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()}
 function frame(t){raf=0;if(dead||!onScreen||document.hidden)return;if(!reduced)raf=requestAnimationFrame(frame);const minFrame=renderer.kind==='webgl'?16:33;if(!ready||document.hidden||t-last<minFrame)return;const rect=root.getBoundingClientRect();if(rect.right<=0||rect.left>=innerWidth){last=t;return;}
  const dt=clamp((t-last)/1000||.016,.008,.04);last=t;simTime+=dt;
  const auto=!fine||matchMedia('(max-width:700px)').matches;
  if(auto&&!reduced){const phase=simTime*.32;autoX=.5+Math.sin(phase)*.42;autoY=.5+Math.sin(phase*.73+.8)*.29;px=autoX;py=autoY;moved=true;}
  const from={x:oldX*(field.w-1),y:oldY*(field.h-1)},to={x:px*(field.w-1),y:py*(field.h-1)},dist=Math.hypot((px-oldX)*rect.width,(py-oldY)*rect.height),radius=Math.min(auto?55:100,(auto?30:0)+dist*(auto?5:5))/2.5;
  if(!reduced&&(auto||moved||simTime-lastInput<6))field.step(dt,from,to,moved&&dist>.02,radius);oldX=px;oldY=py;moved=false;
  renderer.draw(field,reduced?2:simTime,rect);
 }
 const observer=new ResizeObserver(size);observer.observe(root);imgs.forEach(im=>im.addEventListener('load',size,{once:true}));size();const intersection=new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;if(onScreen)wake();else{cancelAnimationFrame(raf);raf=0;}},{root:root.closest('.cv-scroll')});intersection.observe(root);document.addEventListener('visibilitychange',visibility);
 root.addEventListener('pointermove',move,{passive:true});root.addEventListener('pointerleave',leave);
 return()=>{dead=true;cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.destroy();root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);};
}
