var A=Object.defineProperty;var $=(s,t,r)=>t in s?A(s,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):s[t]=r;var p=(s,t,r)=>($(s,typeof t!="symbol"?t+"":t,r),r);import{m as M,u as z,r as f,j as e,I as D,c as L,a as V,b as _,F as m,t as q,g as H,d as U,e as W,f as G,h as y,T as v,i as K,k as J,E as Q,D as X,M as C,l as Y,S as Z,n as k,C as ee,B as se,o as te,p as ae,q as re,s as ne,R as le,v as oe,w as ie,x as ce,y as de,L as w,H as ue,z as F,A as me,G as fe,J as I,K as he,N as ge,O}from"./vendor-AUb_t5Eg.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function r(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(a){if(a.ep)return;a.ep=!0;const n=r(a);fetch(a.href,n)}})();const xe="modulepreload",je=function(s){return"/"+s},b={},S=function(t,r,o){let a=Promise.resolve();if(r&&r.length>0){const n=document.getElementsByTagName("link");a=Promise.all(r.map(l=>{if(l=je(l),l in b)return;b[l]=!0;const d=l.endsWith(".css"),x=d?'[rel="stylesheet"]':"";if(!!o)for(let c=n.length-1;c>=0;c--){const i=n[c];if(i.href===l&&(!d||i.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${x}`))return;const u=document.createElement("link");if(u.rel=d?"stylesheet":xe,d||(u.as="script",u.crossOrigin=""),u.href=l,document.head.appendChild(u),d)return new Promise((c,i)=>{u.addEventListener("load",c),u.addEventListener("error",()=>i(new Error(`Unable to preload CSS for ${l}`)))})}))}return a.then(()=>t()).catch(n=>{const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=n,window.dispatchEvent(l),!l.defaultPrevented)throw n})},N="http://localhost:9981/api",P=async(s,t,r)=>{try{const o=await window.fetch(`${N}${s}`,{method:t,...r&&{body:typeof r=="string"?r:JSON.stringify(r)},headers:{"Content-Type":"application/json"}}),a=await o.json();if(o.status!==200)throw new Error(a==null?void 0:a.data);return a.data}catch(o){throw M.error(o==null?void 0:o.message),o}},Oe=s=>fetch(s,{method:"GET"}).then(t=>t.text()).then(t=>t.replace(/\[1m/g,"").replace(/\\x1B/g,"").replace(/\[22m/g,"").replace(/\[32m/g,"").replace(/\[33m/g,"").replace(/\[39m/g,"").replace(//g,"").replace(/(\x00)+/g,`
`)),pe=(s,t={})=>z(s?`${N}/${s.startsWith("/")?s.slice(1):s}`:void 0,{revalidateIfStale:!1,revalidateOnMount:!0,revalidateOnFocus:!1,revalidateOnReconnect:!1,...t});async function ye(s){switch(s){case"zh-cn":return(await S(()=>import("./zh-cn-1g_AHQ2i.js"),__vite__mapDeps([]))).default;case"en-us":return(await S(()=>import("./en-us-4z8Y_dfN.js"),__vite__mapDeps([]))).default;default:{const t=s;throw new Error(t)}}}const T=f.createContext(void 0);function Me(){const s=f.useContext(T);if(s===void 0)throw new Error("useLocale must be used within the LocaleProvider context");return s}class ve{constructor(){p(this,"currentLocale",null);p(this,"cache",V());p(this,"currentIntl",L({locale:"zh-cn",messages:{}},this.cache));p(this,"currentMessages",null)}get locale(){return this.currentLocale}get intl(){return this.currentIntl}get messages(){return this.currentMessages}update(t,r){this.currentIntl=L({locale:t,messages:r},this.cache),this.currentLocale=t,this.currentMessages=r}}const g=new ve;function ke({children:s,fallback:t,defaultLocale:r}){const[o,a]=f.useState(null),[n,l]=f.useState(r);f.useLayoutEffect(()=>{async function x(){const j=await ye(n);g.update(n,j),a(j),document.documentElement.lang=n}x()},[n]);const d=f.useMemo(()=>({locale:n,setLocale:l}),[n]);return e.jsx(T.Provider,{value:d,children:o?e.jsx(D,{locale:n,messages:o,children:s}):t})}const E="/processStatus",we=()=>[{dataIndex:"name",title:g.intl.formatMessage({id:"key0046",defaultMessage:"日志状态名称"})},{dataIndex:"label",title:g.intl.formatMessage({id:"key0047",defaultMessage:"日志状态标签"}),render:(s,t)=>e.jsx("span",{style:{color:t.color},children:s})},{dataIndex:"matchers",title:g.intl.formatMessage({id:"key0048",defaultMessage:"日志状态匹配规则"}),render:s=>e.jsx(e.Fragment,{children:s.map(t=>e.jsx("div",{children:t}))})},{dataIndex:"clear",title:g.intl.formatMessage({id:"key0049",defaultMessage:"当前状态是否清除之前日志"}),render:s=>s?g.intl.formatMessage({id:"key0018",defaultMessage:"清除日志"}):g.intl.formatMessage({id:"key0050",defaultMessage:"不清除日志"})}];function Ee(){const s=_(),{data:t,mutate:r,isLoading:o}=pe(E),[a]=m.useForm(),[n,l]=f.useState(!1),d=we(),x=(c=re)=>Object.entries(c).map(([i,h])=>({label:i,colors:h})),{token:j}=q.useToken(),u=x({primary:H(j.colorPrimary),red:U,green:W,blue:G});return e.jsxs("div",{children:[e.jsxs("div",{className:"flex justify-center items-center h-8 ",children:[e.jsx("h2",{className:"mr-auto",children:e.jsx(y,{id:"key0051",defaultMessage:"日志状态管理"})}),e.jsx(v,{title:s.formatMessage({id:"key0052",defaultMessage:"增加日志状态"}),placement:"leftBottom",children:e.jsx(K,{onClick:()=>{a.resetFields(),l(!0)}})})]}),t!==void 0&&e.jsx(J,{rowKey:"id",dataSource:t,loading:o,pagination:!1,columns:[...d,{title:s.formatMessage({id:"key0024",defaultMessage:"操作"}),render:(c,i)=>e.jsxs("div",{className:"space-x-5",children:[e.jsx(v,{title:s.formatMessage({id:"key0032",defaultMessage:"编辑项目"}),children:e.jsx(Q,{onClick:()=>{a.setFieldsValue(i),l(!0)}})}),e.jsx(v,{title:s.formatMessage({id:"key0053",defaultMessage:"删除日志状态配置"}),children:e.jsx(X,{onClick:()=>{C.confirm({title:s.formatMessage({id:"key0034",defaultMessage:"是否删除?"}),icon:e.jsx(Y,{}),onOk(){P(`${E}/${i.id}`,"DELETE").then(()=>{M.success(s.formatMessage({id:"key0027",defaultMessage:"删除成功"})),r()})}})}})})]})}]}),e.jsxs(C,{open:n,title:a.getFieldValue("id")===void 0?s.formatMessage({id:"key0036",defaultMessage:"新建项目"}):s.formatMessage({id:"key0032",defaultMessage:"编辑项目"}),okButtonProps:{autoFocus:!0,htmlType:"submit"},onCancel:()=>l(!1),destroyOnClose:!0,modalRender:c=>e.jsx(m,{layout:"vertical",form:a,name:"form_in_modal",onFinish:i=>{const h=a.getFieldValue("id");P(E,h?"PUT":"POST",{...i,id:h}).then(()=>{M.success(s.formatMessage({id:"key0037",defaultMessage:"操作成功"})),l(!1),r()})},children:c}),children:[e.jsx(m.Item,{name:"matchers",label:s.formatMessage({id:"key0054",defaultMessage:"匹配规则"}),rules:[{required:!0,message:s.formatMessage({id:"key0039",defaultMessage:"文件夹地址不能为空"}),validator:(c,i)=>{try{return new RegExp(i),Promise.resolve()}catch{return Promise.reject(new Error(s.formatMessage({id:"key0055",defaultMessage:"不是有效的正则表达式"})))}}}],children:e.jsx(m.List,{name:"matchers",children:(c,i)=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",rowGap:16},children:[c.map((h,B)=>e.jsxs(Z,{children:[e.jsx(m.Item,{noStyle:!0,name:B,children:e.jsx(k,{placeholder:"first"})}),e.jsx(ee,{onClick:()=>{i.remove(h.name)}})]},h.key)),e.jsx(se,{type:"dashed",onClick:()=>i.add(),block:!0,children:"+ Add Sub Item"})]})})}),e.jsx(m.Item,{name:"name",label:s.formatMessage({id:"key0056",defaultMessage:"名称"}),children:e.jsx(k,{})}),e.jsx(m.Item,{name:"label",label:s.formatMessage({id:"key0057",defaultMessage:"标签名"}),children:e.jsx(k,{})}),e.jsx(m.Item,{name:"color",label:s.formatMessage({id:"key0058",defaultMessage:"标签颜色"}),getValueFromEvent:c=>c.toHexString(),children:e.jsx(te,{presets:u})}),e.jsx(m.Item,{name:"clear",label:s.formatMessage({id:"key0059",defaultMessage:"是否清除之前日志"}),valuePropName:"checked",children:e.jsx(ae,{})})]})]})}const{Option:R}=F,Se=s=>fetch(s).then(t=>t.json().then(r=>r.data)),Pe=f.lazy(()=>S(()=>import("./index-lOJ-k85W.js"),__vite__mapDeps([0,1,2]))),Le=()=>{const s=_(),t=ie(),{locale:r,setLocale:o}=Me();return e.jsx(ce,{value:{fetcher:Se,revalidateOnFocus:!0,revalidateOnMount:!0,revalidateOnReconnect:!0,revalidateIfStale:!1},children:e.jsx(de,{locale:{locale:"en-us"},theme:{token:{colorPrimary:"#7939cb",borderRadius:2,fontSize:16}},children:e.jsxs(w,{style:{minHeight:"100vh"},children:[e.jsxs(ue,{className:"text-white flex items-center",children:[e.jsx("div",{children:e.jsx(y,{id:"key0002",defaultMessage:"前端管理系统"})}),e.jsx("div",{className:"ml-auto cursor-pointer",onClick:()=>{P("/system/shutdown","PUT").then(()=>{M.success(s.formatMessage({id:"key0003",defaultMessage:"后台服务关闭成功"}))})},children:e.jsx(y,{id:"key0004",defaultMessage:"关闭系统"})}),e.jsxs(F,{onChange:o,value:r,className:"ml-5 w-28",children:[e.jsx(R,{value:"en-us",children:"English"}),e.jsx(R,{value:"zh-cn",children:e.jsx(y,{id:"key0044",defaultMessage:"中文"})})]})]}),e.jsxs(w,{children:[e.jsx(me,{children:e.jsx(fe,{mode:"inline",onClick:a=>{t(a.key)},items:[{key:"processes",label:s.formatMessage({id:"key0006",defaultMessage:"服务"}),icon:e.jsx(I,{})},{key:"logStatus",label:s.formatMessage({id:"key0045",defaultMessage:"日志状态"}),icon:e.jsx(I,{})}]})}),e.jsx(w,{children:e.jsx(he,{children:e.jsx(f.Suspense,{fallback:e.jsx("div",{children:"loading"}),children:e.jsx("div",{className:"ml-4 mr-4",children:e.jsxs(ge,{children:[e.jsx(O,{path:"/processes",element:e.jsx(Pe,{})}),e.jsx(O,{path:"/logStatus",element:e.jsx(Ee,{})})]})})})})})]})]})})})};ne(document.getElementById("root")).render(e.jsx(le.StrictMode,{children:e.jsx(oe,{children:e.jsx(ke,{defaultLocale:"zh-cn",children:e.jsx(Le,{})})})}));export{Oe as a,N as b,we as c,g as i,P as j,E as s,pe as u};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/index-lOJ-k85W.js","assets/vendor-AUb_t5Eg.js","assets/index-ubpXYuuh.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
