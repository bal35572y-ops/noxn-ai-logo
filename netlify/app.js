const toolInfo={
 logo:{name:"مصمم الشعارات",desc:"أنشئ شعاراً يعبر عن هويتك",icon:"✦",hint:"مثال: شعار احترافي لعلامة تجارية باسم NOXN..."},
 icon:{name:"أيقونات التطبيقات",desc:"أيقونات مميزة لتطبيقك",icon:"▣",hint:"مثال: أيقونة تطبيق طقس ثلاثية الأبعاد..."},
 image:{name:"مولّد الصور",desc:"حوّل وصفك إلى صورة",icon:"◈",hint:"صف الصورة التي تريد إنشاءها بالتفصيل..."},
 poster:{name:"مصمم الملصقات",desc:"ملصقات إعلانية وإبداعية",icon:"▤",hint:"مثال: ملصق ترويجي لافتتاح متجر..."},
 banner:{name:"مصمم البنرات",desc:"بنرات للمواقع والمنصات",icon:"▱",hint:"مثال: بانر عريض لقناة ألعاب..."},
 product:{name:"صور المنتجات",desc:"صور عرض تجارية احترافية",icon:"◇",hint:"مثال: صورة إعلانية لمنتج على خلفية فاخرة..."},
 background:{name:"مصمم الخلفيات",desc:"خلفيات رقمية مميزة",icon:"▧",hint:"مثال: خلفية هاتف مستقبلية بالنيون..."},
 edit:{name:"مساعد التصميم",desc:"أنشئ نسخة محسنة من فكرتك",icon:"✎",hint:"اكتب وصف الصورة الجديدة التي تريدها..."}
};
let currentTool="logo", currentImage="";
const $=id=>document.getElementById(id);
document.querySelectorAll(".tool-card").forEach(card=>card.addEventListener("click",()=>{
 document.querySelectorAll(".tool-card").forEach(x=>x.classList.remove("active"));
 card.classList.add("active"); currentTool=card.dataset.tool;
 const t=toolInfo[currentTool]; $("selectedIcon").textContent=t.icon;$("selectedName").textContent=t.name;$("selectedDesc").textContent=t.desc;$("prompt").placeholder=t.hint;
 $("studio").scrollIntoView({behavior:"smooth"});
}));
$("goStudio").onclick=$("heroStart").onclick=()=>$("studio").scrollIntoView({behavior:"smooth"});
$("prompt").addEventListener("input",()=>{$("count").textContent=$("prompt").value.length+" / 900"});
function makePrompt(userPrompt){
 const t=toolInfo[currentTool].name,style=$("style").value;
 return `Create a professional ${t} design. User brief: ${userPrompt}. Visual style: ${style}. Art direction: futuristic premium neon aesthetic, polished composition, excellent lighting, crisp details, professional commercial design, visually coherent colors, clean high-end finish. Avoid watermarks, mockup frames, random letters, spelling errors and unnecessary text.`;
}
$("generate").onclick=async()=>{
 const prompt=$("prompt").value.trim();
 if(prompt.length<5){$("notice").textContent="اكتب وصفاً واضحاً للتصميم أولاً.";return}
 const btn=$("generate");btn.disabled=true;btn.textContent="⏳ جارٍ إنشاء التصميم...";
 $("previewStatus").textContent="يتم التوليد الآن";$("preview").innerHTML='<div class="preview-placeholder"><div class="sparkle">✧</div><b>الذكاء الاصطناعي يعمل على فكرتك...</b><p>قد يستغرق إنشاء الصورة بعض الوقت.</p></div>';$("resultActions").hidden=true;
 try{
  const res=await fetch("/.netlify/functions/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:makePrompt(prompt),size:$("ratio").value,quality:$("quality").value})});
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||"تعذر إنشاء الصورة");
  currentImage="data:image/png;base64,"+data.image;
  $("preview").innerHTML="";const img=document.createElement("img");img.src=currentImage;img.alt="تصميم مولّد بالذكاء الاصطناعي";$("preview").appendChild(img);
  $("previewStatus").textContent="اكتمل التصميم";$("resultActions").hidden=false;$("notice").textContent="تم إنشاء التصميم بنجاح. يمكنك تنزيله أو حفظه في معرضك.";
 }catch(e){$("preview").innerHTML='<div class="preview-placeholder"><div class="sparkle">!</div><b>لم يكتمل التوليد</b><p></p></div>';$("preview").querySelector("p").textContent=e.message;$("previewStatus").textContent="حدث خطأ";$("notice").textContent=e.message+" — تأكد من إضافة مفتاح API في إعدادات Netlify."}
 finally{btn.disabled=false;btn.innerHTML="<span>✦</span> توليد التصميم بالذكاء الاصطناعي"}
};
$("download").onclick=()=>{if(!currentImage)return;const a=document.createElement("a");a.href=currentImage;a.download="noxn-ai-design.png";a.click()};
function getGallery(){try{return JSON.parse(localStorage.getItem("noxnGallery")||"[]")}catch{return []}}
function renderGallery(){
 const grid=$("galleryGrid"),items=getGallery();grid.innerHTML="";
 if(!items.length){grid.innerHTML='<div class="empty-gallery">لم تحفظ أي تصميم بعد. ابدأ الإبداع الآن ✦</div>';return}
 items.forEach((item,i)=>{const card=document.createElement("div");card.className="gallery-item";const img=document.createElement("img");img.src=item;const btn=document.createElement("button");btn.textContent="تنزيل التصميم";btn.onclick=()=>{const a=document.createElement("a");a.href=item;a.download="noxn-design-"+(i+1)+".png";a.click()};card.append(img,btn);grid.appendChild(card)});
}
$("save").onclick=()=>{if(!currentImage)return;const items=getGallery();items.unshift(currentImage);if(items.length>12)items.pop();try{localStorage.setItem("noxnGallery",JSON.stringify(items));renderGallery();$("notice").textContent="تم حفظ التصميم على هذا الجهاز في معرضك."}catch{$("notice").textContent="مساحة التخزين المحلية ممتلئة؛ نزّل التصميم واحتفظ به على جهازك."}};
$("clearGallery").onclick=()=>{if(confirm("هل تريد مسح التصاميم المحفوظة في هذا المتصفح؟")){localStorage.removeItem("noxnGallery");renderGallery()}};
renderGallery();
