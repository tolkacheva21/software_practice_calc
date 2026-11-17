
import { MODEL } from "./modelData";
export const DEFAULT_STATE = {
  x:Array(27).fill(0.6), max:Array(27).fill(1),
  z:Array.from({length:5},()=>({m:1,b:0,g:0.01})),
  functions:Array.from({length:81},()=>({a:0,b:0,c:1,d:0})),
  duration:1, step:0.02
};
const clamp=(v)=>Math.min(1,Math.max(0,Number.isFinite(v)?v:0));
const poly=(p,u)=>p.a*u**3+p.b*u**2+p.c*u+p.d;
const aggregate=(x)=>MODEL.groups.map(g=>{const a=x.slice(g.start-1,g.end);return a.reduce((s,v)=>s+v,0)/a.length});
const zAt=(t,ps)=>ps.map(p=>clamp((p.b+p.g*t*100)/Math.max(p.m,1e-9)));
function deriv(t,x,s){
 const X=aggregate(x),z=zAt(t,s.z);
 return MODEL.equations.map((e,i)=>{
  const [a,b,c]=e.functions.map(n=>s.functions[n-1]);
  const component=X[Number(e.component.slice(1))-1], [j,k]=e.neighbors;
  const product=poly(a,x[i])*poly(b,component)*poly(c,(x[j-1]+x[k-1])/2);
  const disturbance=e.disturbances.reduce((sum,q)=>sum+q.sign*z[q.z-1],0);
  return 0.1/Math.max(s.max[i],1e-9)*product*disturbance;
 });
}
const add=(x,k,scale)=>x.map((v,i)=>v+scale*k[i]);
export function calculate(s){
 const T=Math.max(.02,Number(s.duration)),steps=Math.ceil(T/Math.max(.001,Math.min(.1,Number(s.step)))),h=T/steps;
 let x=s.x.map((v,i)=>clamp(Number(v)/Math.max(s.max[i],1e-9)));
 const rows=[{t:0,x:[...x],X:aggregate(x),P:aggregate(x).reduce((a,b)=>a+b,0)/4}];
 for(let n=0;n<steps;n++){
  const t=n*h,k1=deriv(t,x,s),k2=deriv(t+h/2,add(x,k1,h/2),s),k3=deriv(t+h/2,add(x,k2,h/2),s),k4=deriv(t+h,add(x,k3,h),s);
  x=x.map((v,i)=>clamp(v+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6));
  if((n+1)%Math.max(1,Math.floor(steps/100))===0||n===steps-1){const X=aggregate(x);rows.push({t:(n+1)*h,x:[...x],X,P:X.reduce((a,b)=>a+b,0)/4});}
 }
 return rows;
}
