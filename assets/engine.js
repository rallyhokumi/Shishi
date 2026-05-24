/* =========================================================
   私診 — 共通診断エンジン (v2: addEventListener方式)
   各診断ページは QUESTIONS / RESULTS / META を定義して
   このスクリプトを読み込むだけで動く
   ========================================================= */

(function(){
  const $ = id => document.getElementById(id);

  let current = 0;
  let scores = {};

  function initScores(){
    scores = {};
    for(const k in RESULTS){ scores[k] = 0; }
  }

  function start(){
    current = 0;
    initScores();
    $("cover").classList.add("hidden");
    $("result").classList.add("hidden");
    $("quiz").classList.remove("hidden");
    render();
  }

  function render(){
    const q = QUESTIONS[current];
    $("qnum").textContent = current+1;
    $("qtext").textContent = q.q;
    $("bar").style.width = ((current)/QUESTIONS.length*100)+"%";

    const wrap = $("choices");
    wrap.innerHTML = "";
    q.choices.forEach((c)=>{
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = c.t;
      btn.addEventListener("click", function(){ pick(c.s); });
      wrap.appendChild(btn);
    });
    const screen = $("quiz");
    screen.style.animation = "none";
    void screen.offsetWidth;
    screen.style.animation = "";
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function pick(s){
    for(const k in s){ scores[k] = (scores[k]||0) + s[k]; }
    current++;
    if(current >= QUESTIONS.length){
      showResult();
    }else{
      render();
    }
  }

  function showResult(){
    $("bar").style.width = "100%";
    let max = -1, winner = Object.keys(RESULTS)[0];
    for(const k in scores){
      if(scores[k] > max){ max = scores[k]; winner = k; }
    }
    const r = RESULTS[winner];
    $("rtype").textContent = r.type;
    $("rtitle").textContent = r.title;
    $("ren").textContent = "— " + r.en + " —";
    $("rbody").innerHTML = r.body.map(p=>`<p>${p}</p>`).join("");
    $("rverdict").innerHTML = r.verdict;

    $("quiz").classList.add("hidden");
    $("result").classList.remove("hidden");
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function restart(){
    $("result").classList.add("hidden");
    $("cover").classList.remove("hidden");
    window.scrollTo({top:0, behavior:"smooth"});
  }

  async function share(){
    const title = $("rtitle").textContent;
    const siteTitle = (typeof META !== "undefined" && META.title) ? META.title : "私診";
    const text = "私の診断結果は「" + title + "」でした。\n— " + siteTitle + " / 私診 —";
    if(navigator.share){
      try{ await navigator.share({title:"診断結果", text, url:location.href}); }catch(e){}
    }else{
      try{
        await navigator.clipboard.writeText(text + "\n" + location.href);
        alert("結果をコピーしました。");
      }catch(e){
        alert(text);
      }
    }
  }

  // ===== ボタンに紐付け =====
  function attach(){
    const startBtn = document.querySelector("[data-action='start']");
    const restartBtn = document.querySelector("[data-action='restart']");
    const shareBtn = document.querySelector("[data-action='share']");
    if(startBtn) startBtn.addEventListener("click", start);
    if(restartBtn) restartBtn.addEventListener("click", restart);
    if(shareBtn) shareBtn.addEventListener("click", share);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", attach);
  }else{
    attach();
  }
})();
