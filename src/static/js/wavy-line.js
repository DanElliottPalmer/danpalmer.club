var L=Object.defineProperty;var O=(l,u,a)=>u in l?L(l,u,{enumerable:!0,configurable:!0,writable:!0,value:a}):l[u]=a;var b=(l,u,a)=>(O(l,typeof u!="symbol"?u+"":u,a),a);const x=function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))g(r);new MutationObserver(r=>{for(const c of r)if(c.type==="childList")for(const d of c.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&g(d)}).observe(document,{childList:!0,subtree:!0});function a(r){const c={};return r.integrity&&(c.integrity=r.integrity),r.referrerpolicy&&(c.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?c.credentials="include":r.crossorigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function g(r){if(r.ep)return;r.ep=!0;const c=a(r);fetch(r.href,c)}};x();(function(){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var u;(function(e){e[e.Point=0]="Point",e[e.QuadraticCurve=1]="QuadraticCurve"})(u||(u={}));const a=150,g=150,r=5,c=3,d=["#FF9F0F","#FF0FCA","#0FFF44","#0F9AFF"],v=5,y=5e3;class A{constructor(){b(this,"points",[])}addQuadraticCurve(n,t,i,o){this.points.push({type:1,values:[n,t,i,o]})}addPoint(n,t){this.points.push({type:0,values:[n,t]})}toString(){return this.points.reduce((n,t,i)=>{let o="";return t.type===0?i===0?o=`M ${t.values[0]} ${t.values[1]}`:o=`L ${t.values[0]} ${t.values[1]}`:t.type===1&&(o=`Q ${t.values[0]} ${t.values[1]}, ${t.values[2]} ${t.values[3]}`),`${n} ${o}`},"")}}function S(e,n){const t=document.createElementNS("http://www.w3.org/2000/svg","svg");return t.setAttribute("width",String(e)),t.setAttribute("height",String(n)),t.setAttribute("xmlns","http://www.w3.org/2000/svg"),t.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),t}function $(e,n){const t=document.createElementNS("http://www.w3.org/2000/svg","path");return t.setAttribute("d",e),t.setAttribute("fill","none"),t.setAttribute("stroke",n),t.setAttribute("stroke-width",String(c)),t.setAttribute("stroke-linecap","round"),t.setAttribute("stroke-linejoin","round"),t.setAttribute("stroke-opacity","0.2"),t.setAttribute("transform",`rotate(${f(0,360)})`),t}function f(e=0,n=1,t=!0){let i=Math.random()*(n-e);return t&&(i=Math.round(i)),e+i}function F(){const e=f(10,30),n=f(5,10),t=e/n,i=[];let o=[];for(let s=0;s<n;s++){const m=f(-v,v);if(s===0){i.push([s*t,m]);continue}s%2?o=[s*t,m]:i.push([...o,s*t,m])}const h=new A;return i.forEach(s=>{s.length===2?h.addPoint(s[0],s[1]):s.length===4&&h.addQuadraticCurve(s[0],s[1],s[2],s[3])}),h}function E(){const e=S(a,g),n=[];for(let t=0;t<10;t++){const i=F(),o=$(i.toString(),d[t%d.length]);n.push(o),e.appendChild(o)}return n.forEach(t=>{const i=t.getAttribute("transform"),o=t.getBBox();let h=-o.x,s=-o.y;const m=f(r,a-r-o.width),p=f(r,g-r-o.height);h+=m,s+=p,t.setAttribute("transform",`translate(${h}, ${s}) ${i}`)}),e}function G(e){const n=e.outerHTML;return`data:image/svg+xml;base64,${btoa(n)}`}function w(){const e=E();document.body.style.backgroundImage=`url(${G(e)})`}w(),setInterval(w,y)})();
