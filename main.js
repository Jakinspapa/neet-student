// NEET Mizoram - Full 454 Lines - Mizo Morphism Mobile Responsive - 2024
// Bung-wise Chapter Mock separate tab - Engmah delete lo - Mobile 100% fix
// Version: 454 lines kim
import './style.css';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://unhgkfzspyxtnnvngywi.supabase.co',
  'sb_publishable_XY2AJSLihwADL0Jt414x9A_7vugrPJa'
);
let allTests = [],
  currentTest = null,
  currentQs = [],
  userAnswers = {},
  currentUser = null,
currentProfile = null,
isPremiumActive = () => {
  if (!currentProfile) return false;
  if (!currentProfile.is_premium) return false;
  if (!currentProfile.premium_expires_at) return true;
  return new Date(currentProfile.premium_expires_at) > new Date();
},
isCoachingActive = () => {
  if (!currentProfile) return false;
  if (!currentProfile.is_coaching) return false;
  if (!currentProfile.coaching_expires_at) return true;
  return new Date(currentProfile.coaching_expires_at) > new Date();
},
authMode = 'login',
dashTab = 'dashboard',
myAttempts = [],
leaderboard = [],
  allUsers = [],
  myPayments = [],
  paySettings = {
    upi1: 'hriatnuiazyu@oksbi',
    upi_name: 'NEET Mizoram',
    whatsapp: '919362600601',
    qr1_url: '',
  },
  myPremium = null,
  myPremiumPending = null,
  myAllPremiumPayments = [],
  premiumPlans = [],
  selectedMockFilter = '',
  selectedChapterSubject = 'All',
  onlineInterval = null,
  forgotMode = false,
  resetMode = false,
  gpayFile = null,
  currentQIdx = 0,
  perQLeft = 0,
  totalLeft = 0,
  perQInterval = null,
  totalInterval = null,
  allVideos = [],
  selectedVideo = null,
  allNotis = [],
  showNotiPanel = false;

function clearTimers() {
  if (perQInterval) clearInterval(perQInterval);
  if (totalInterval) clearInterval(totalInterval);
  perQInterval = null;
  totalInterval = null;
}
function formatSec(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ':' + String(sec).padStart(2, '0');
}
function isTestLocked(t) {
  if (!t.is_scheduled) return false;
  if (!t.scheduled_at) return false;
  return new Date(t.scheduled_at) > new Date();
}
function getLockTime(t) {
  if (!t.scheduled_at) return '';
  return new Date(t.scheduled_at).toLocaleString();
}
window.previewGpay = function (input) {
  const f = input.files[0];
  if (!f) return;
  gpayFile = f;
  const pv = document.getElementById('gpayPreview');
  if (pv) {
    pv.src = URL.createObjectURL(f);
    pv.style.display = 'block';
  }
};
async function uploadGpayScreenshot() {
  if (!gpayFile) return null;
  const fileName = `gpay_${currentUser.id}_${Date.now()}_${gpayFile.name}`;
  const { error } = await supabase.storage.from('payments').upload(fileName, gpayFile);
  if (error) throw error;
  const { data } = supabase.storage.from('payments').getPublicUrl(fileName);
  return data.publicUrl;
}
window.viewAttempt = function (attemptId) {
  const attempt = myAttempts.find((a) => String(a.id) === String(attemptId));
  if (!attempt) return;
  const test = allTests.find((t) => String(t.id) === String(attempt.test_id));
  if (!test) return alert('Test hmuh loh');
  const status = getStatus(test);
  const canView = test.access_type === 'free' || status.ok || status.prem || isPremium();
  if (!canView) {
    alert('Paid test a ni - lei phawt la tichuan wrong i hmu thei ang!');
    return window.buyTest(test.id);
  }
  const qs = test.questions || [];
  const ans = attempt.answers || {};
  let wrongHtml = '';
  let wrongCount = 0;
  qs.forEach((q, i) => {
    const userAns = ans[i] || ans[String(i)] || 'Not Answered';
    const correctAns = q.ans;
    const isWrong = userAns!== correctAns;
    if (!isWrong) return;
    wrongCount++;
    wrongHtml += `<div style="background:white;border-radius:16px;padding:16px;margin-bottom:12px;border-left:4px solid #ef4444"><div style="display:flex;justify-content:space-between"><b>Q${i + 1}. ${esc(q.q)}</b><span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:800">WRONG</span></div><div style="margin-top:10px;display:grid;gap:6px">${['A','B','C','D'].map((o) => {
        const isCorrect = o === correctAns;
        const isUserWrong = o === userAns && o!== correctAns;
        return `<div style="padding:8px 10px;border-radius:10px;border:2px solid ${isCorrect? '#10b981' : isUserWrong? '#ef4444' : '#eee'};background:${isCorrect? '#ecfdf5' : isUserWrong? '#fef2f2' : 'white'};display:flex;justify-content:space-between"><span>${o}. ${esc(q[o.toLowerCase()] || '')}</span><span style="font-size:11px;font-weight:800">${isCorrect? '✅ Correct' : isUserWrong? '❌ Your Answer' : ''}</span></div>`;
      }).join('')}</div>${q.explanation || q.exp? `<div style="margin-top:10px;background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #f59e0b;border-radius:12px;padding:12px;"><div style="display:flex;align-items:center;gap:6px;font-weight:900;color:#92400e;font-size:13px;margin-bottom:6px;"><span style="background:#f59e0b;color:white;width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;">💡</span> Explanation</div><div style="font-size:13px;color:#78350f;line-height:1.6;white-space:pre-wrap;background:white;padding:10px;border-radius:8px;border:1px solid #fde68a;">${esc(q.explanation || q.exp)}</div></div>` : `<div style="margin-top:8px;background:#fee2e2;border:1px dashed #fca5a5;padding:8px;border-radius:10px;font-size:11px;color:#991b1b;text-align:center;">⚠ Admin ah Explanation la dah lo</div>`}</div>`;
  });
  if (wrongCount === 0) {
    wrongHtml = `<div style="background:#ecfdf5;border:1px solid #10b981;border-radius:16px;padding:20px;text-align:center"><h3 style="color:#10b981;margin:0">🎉 Perfect! Dik vek!</h3></div>`;
  }
  document.querySelector('#app').innerHTML = `<div style="min-height:100vh;background:#f6f7fb;font-family:system-ui"><div style="background:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10;border-bottom:1px solid #eee"><div><b>${esc(test.title)} - Wrong Review</b><br><small style="color:#ef4444">${wrongCount} Wrong / ${qs.length} Total • Score ${attempt.score}%</small></div><button onclick="window.setDashTab('results')" style="padding:8px 14px;border-radius:20px;border:none;background:#111;color:white;font-size:12px;font-weight:700">← Back</button></div><div style="max-width:700px;margin:0 auto;padding:16px"><div style="background:white;border-radius:16px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between"><div><b>Score: ${attempt.score}%</b> - ${attempt.correct}/${attempt.total} Correct</div><div style="font-size:11px;color:#666">${new Date(attempt.created_at).toLocaleString()}</div></div>${wrongHtml}</div></div>`;
};
async function init() {
  try {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      resetMode = true;
      renderResetPassword();
      return;
    }
    if (hash.includes('type=signup') || hash.includes('access_token')) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        alert('✅ Email Verified! Welcome!');
        window.location.hash = '';
        currentUser = data.session.user;
        await loadAll();
        renderDashboard();
        return;
      }
    }
    const d = await supabase.auth.getSession();
    if (d.data.session) {
      currentUser = d.data.session.user;
      await loadAll();
      renderDashboard();
      updateOnline();
      if (onlineInterval) clearInterval(onlineInterval);
      onlineInterval = setInterval(updateOnline, 60000);
    } else renderLogin();
  } catch (e) {
    console.log(e);
    renderLogin();
  }
}
async function updateOnline() {
  if (!currentUser) return;
  try {
    await supabase.from('profiles').update({ last_seen: new Date().toISOString(), is_online: true }).eq('id', currentUser.id);
  } catch (e) {}
}
async function loadAll() {
  const r = await Promise.all([
    supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
    supabase.from('mock_tests').select('*').order('created_at', { ascending: false }),
    supabase.from('test_attempts').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    supabase.from('payment_requests').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    supabase.from('premium_payments').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    supabase.from('premium_plans').select('*').order('price', { ascending: true }),
    supabase.from('payment_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('profiles').select('*').limit(100),
    supabase.from('test_attempts').select('*').order('score', { ascending: false }).limit(200),
    supabase.from('coaching_videos').select('*').order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
  ]);
  currentProfile = r[0].data || { full_name: currentUser.email };
  allTests = r[1].data || [];
  myAttempts = r[2].data || [];
  myPayments = r[3].data || [];
  myAllPremiumPayments = r[4].data || [];
  premiumPlans = r[5].data || [];
  allUsers = r[7].data || [];
  leaderboard = r[8].data || [];
  allVideos = r[9].data || [];
  allNotis = r[10].data || [];
  if (r[6].data) paySettings = {...paySettings,...r[6].data };
  const approved = (r[4].data || []).filter((p) => p.status === 'approved');
  let active = null;
  for (let i = 0; i < approved.length; i++) {
    const p = approved[i];
    if (!p.end_date) { active = p; break; }
    try { if (new Date(p.end_date) > new Date()) { active = p; break; } } catch (e) { active = p; break; }
  }
  myPremium = active;
  myPremiumPending = (r[4].data || []).find((p) => p.status === 'pending') || null;
  if (!selectedMockFilter && allTests.length) selectedMockFilter = allTests[0].id;
}
function isPremium() { return!!myPremium || isPremiumActive(); }
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function getStatus(t) {
  if (isPremium()) return { label: 'PREMIUM FREE', color: '#10b981', btn: 'Start ✓', ok: true, prem: true };
  if (t.access_type === 'free') return { label: 'FREE', color: '#10b981', btn: 'Start', ok: true };
  const p = myPayments.find((x) => String(x.test_id) === String(t.id));
  if (p && p.status === 'approved') return { label: 'UNLOCKED', color: '#10b981', btn: 'Start', ok: true };
  if (p && p.status === 'pending') return { label: 'PENDING', color: '#f59e0b', btn: '⏳ Pending', ok: false, pend: true };
  return { label: 'PAID Rs.' + (t.price || 100), color: 'gold', btn: 'Buy Rs.' + (t.price || 100), ok: false };
}
function getUserName(uid) { const u = allUsers.find((x) => x.id === uid); return u? u.full_name || u.email : uid.slice(0, 6); }
function getMockInfo(mid) { const m = allTests.find((x) => String(x.id) === String(mid)); if (!m) return { title: 'Mock', subject: 'General' }; return { title: m.title, subject: m.subject || 'General' }; }

// ===== WORLD CLASS MIZO GLASS MORPHISM LOGIN - BEAUTIFUL + MOBILE RESPONSIVE =====
function renderLogin() {
  document.querySelector('#app').innerHTML = `
  <div class="min-h-screen relative overflow-hidden bg-[#f6f8ff] flex items-center">
    <div class="absolute inset-0 bg-gradient-to-br from-[#eef2ff] via-[#f5f3ff] to-[#ecfeff]"></div>
    <div class="orb orb-1 hidden md:block"></div>
    <div class="orb orb-2 hidden md:block"></div>
    <div class="orb orb-3 hidden md:block"></div>
    
    <div class="relative z-10 w-full max-w-[1320px] mx-auto flex flex-col lg:flex-row min-h-screen lg:min-h-0 lg:items-center p-4 lg:p-10 gap-6 lg:gap-10">
      <!-- LEFT BRANDING -->
      <div class="flex-1 px-2 lg:px-8 py-2 lg:py-0 login-hero">
        <div class="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-[10px] font-[800] tracking-[1px]">🩺 NEET MIZORAM • MIZO EDITION • WORLD CLASS</div>
        <h1 class="jakarta font-[800] leading-[0.9] mt-6 text-[36px] sm:text-[44px] lg:text-[68px]">NEET<br><span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mizoram</span><br>ah lo lawm<br>a che!</h1>
        <p class="mt-5 text-slate-600 text-[14px] lg:text-[15px] leading-[1.7] max-w-[440px]">Mi hlawhtling nih i tum em? Mizoram zirlaite tana siam liau liau. <b class="text-slate-900">Bung-wise mock</b>, video zirna leh premium test zawng zawng <b class="text-slate-900">Mizo tawngin</b>. Glass morphism theme.</p>
        
        <div class="mt-8 grid grid-cols-2 gap-3 max-w-[420px]">
          <div class="glass rounded-[20px] p-4 hover:translate-y-[-2px] transition-all"><div class="w-10 h-10 rounded-[12px] bg-blue-600 text-white flex items-center justify-center">🧬</div><div class="jakarta text-[22px] font-[800] mt-3">500+</div><div class="text-[10px] font-[800] tracking-widest text-slate-500">BUNG-WISE MOCK</div></div>
          <div class="glass rounded-[20px] p-4 hover:translate-y-[-2px] transition-all"><div class="w-10 h-10 rounded-[12px] bg-indigo-600 text-white flex items-center justify-center">🎯</div><div class="jakarta text-[22px] font-[800] mt-3">98%</div><div class="text-[10px] font-[800] tracking-widest text-slate-500">THLAN CHHUAH</div></div>
        </div>
        
        <div class="mt-6 flex items-center gap-2 text-[11px] text-slate-500"><span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span> Tunah zirlai 1,200+ an online mek - Mizo tawng</div>
      </div>

      <!-- RIGHT CARD -->
      <div class="w-full lg:w-[440px] shrink-0">
        <div class="glass rounded-[26px] lg:rounded-[32px] p-6 lg:p-8">
          <div class="flex justify-between items-center"><h2 class="jakarta text-[24px] lg:text-[26px] font-[800] m-0">${authMode === 'login'? 'Lut rawh' : 'Account Siam rawh'}</h2><span class="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-[800]">MIZO MORPHISM</span></div>
          <p class="text-[12px] text-slate-500 mt-1.5">${authMode === 'login'? 'I account ah lut la, zir tan nghal ang le!' : 'A thar i nih chuan account siam rawh'}</p>
          
          <div class="flex gap-1 mt-5 bg-[#f1f5f9] p-1 rounded-[14px]">
            <button onclick="window.setMode('login')" class="flex-1 py-2.5 rounded-[10px] font-[700] text-[12px] transition-all ${authMode === 'login'? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-slate-900' : 'bg-transparent text-slate-500'}">Luhna</button>
            <button onclick="window.setMode('signup')" class="flex-1 py-2.5 rounded-[10px] font-[700] text-[12px] transition-all ${authMode === 'signup'? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-slate-900' : 'bg-transparent text-slate-500'}">Siamna</button>
          </div>
          
          <div id="formBox" class="mt-5"></div>
          
          <div class="text-center mt-4"><a href="#" onclick="window.showForgot();return false;" class="text-blue-600 text-[12px] font-[700] no-underline">🔑 Password i theihnghilh em?</a></div>
          
          <div class="mt-6 bg-[#eff6ff] rounded-[16px] p-3 flex gap-3 items-center">
            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[13px] shrink-0">💡</div>
            <div class="text-[11px] leading-[1.5] text-slate-700"><b class="text-slate-900">Thurawn Mizo:</b> Premium la la, bung-wise mock zawng zawng a thlawnin i hmang thei ang! World class design.</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  renderForm();
}
function renderForm() {
  const box = document.getElementById('formBox');
  if (!box) return;
  if (forgotMode) {
    box.innerHTML = `<div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:12px;padding:12px;margin-bottom:12px"><b style="font-size:13px">🔑 Password theihnghilh</b><p style="font-size:11px;color:#666;margin:4px 0 0">Email ah reset link kan thawn ang che - Mizo</p></div><input id="email" placeholder="Email chhu lut rawh" style="width:100%;padding:14px;border-radius:14px;border:1px solid #e2e8f0;background:rgba(255,255,255,0.85);margin-bottom:12px;box-sizing:border-box"><button onclick="window.doForgot()" style="width:100%;padding:14px;border-radius:14px;border:none;background:#f59e0b;color:white;font-weight:800;cursor:pointer">📧 Reset Link Thawn rawh</button><button onclick="window.hideForgot()" style="width:100%;padding:10px;border-radius:10px;border:none;background:#f1f5f9;margin-top:8px;cursor:pointer">← Kir leh</button><div id="forgotMsg" style="margin-top:10px;font-size:12px;text-align:center"></div>`;
    return;
  }
  if (authMode === 'login') box.innerHTML = `<input id="email" placeholder="Email chhu lut rawh - Mizo" style="width:100%;padding:14px;border-radius:14px;border:1px solid #e2e8f0;background:rgba(255,255,255,0.85);margin-bottom:10px;box-sizing:border-box"><input id="password" type="password" placeholder="Password chhu lut rawh" style="width:100%;padding:14px;border-radius:14px;border:1px solid #e2e8f0;background:rgba(255,255,255,0.85);margin-bottom:16px;box-sizing:border-box"><button onclick="window.doLogin()" style="width:100%;padding:14px;border-radius:14px;border:none;background:#0f172a;color:white;font-weight:800;cursor:pointer">🚀 Lut rawh - Mizo</button><div id="loginMsg" style="margin-top:8px;font-size:12px;text-align:center"></div>`;
  else box.innerHTML = `<input id="fname" placeholder="Hming pum - Mizo" style="width:100%;padding:12px;border-radius:12px;border:1px solid #e2e8f0;background:rgba(255,255,255,0.85);margin-bottom:8px;box-sizing:border-box"><input id="email" placeholder="Email" style="width:100%;padding:12px;border-radius:12px;border:1px solid #e2e8f0;background:rgba(255,255,255,0.85);margin-bottom:8px;box-sizing:border-box"><input id="phone" placeholder="Phone" style="width:100%;padding:12px;border-radius:12px;border:1px solid #e2e8f0;background:rgba(255,255,255,0.85);margin-bottom:8px;box-sizing:border-box"><input id="password" type="password" placeholder="Password (6+)" style="width:100%;padding:12px;border-radius:12px;border:1px solid #e2e8f0;background:rgba(255,255,255,0.85);margin-bottom:8px;box-sizing:border-box"><input id="cpassword" type="password" placeholder="Password tichiang leh" style="width:100%;padding:12px;border-radius:12px;border:2px solid #f59e0b;background:rgba(255,255,255,0.85);margin-bottom:12px;box-sizing:border-box"><button onclick="window.doSignup()" style="width:100%;padding:14px;border-radius:14px;border:none;background:#f59e0b;color:white;font-weight:800;cursor:pointer">✨ Account Siam rawh - Mizo</button><div id="loginMsg" style="margin-top:8px;font-size:12px;text-align:center"></div>`;
}
function renderResetPassword() {
  document.querySelector('#app').innerHTML = `<div style="min-height:100vh;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui"><div style="background:white;border-radius:24px;padding:32px;width:100%;max-width:400px;text-align:center"><h2>🔑 Password Thar Siam rawh</h2><p style="font-size:12px;color:#666">Password thar chhu lut rawh - Mizo</p><input id="newPass" type="password" placeholder="Password thar (6+)" style="width:100%;padding:14px;border-radius:12px;border:2px solid #10b981;margin:16px 0 8px;box-sizing:border-box"><input id="newPass2" type="password" placeholder="Tichiang leh rawh" style="width:100%;padding:14px;border-radius:12px;border:2px solid #f59e0b;margin-bottom:16px;box-sizing:border-box"><button onclick="window.doReset()" style="width:100%;padding:14px;border-radius:12px;border:none;background:#10b981;color:white;font-weight:800;cursor:pointer">✅ Thlak rawh</button><div id="resetMsg" style="margin-top:10px;font-size:12px"></div></div></div>`;
}
window.setMode = function (m) { authMode = m; forgotMode = false; renderLogin(); };
window.showForgot = function () { forgotMode = true; renderForm(); };
window.hideForgot = function () { forgotMode = false; authMode = 'login'; renderLogin(); };
window.doForgot = async function () {
  const email = (document.getElementById('email')?.value || '').trim();
  if (!email) return alert('Email dah rawh');
  const msg = document.getElementById('forgotMsg');
  if (msg) msg.innerHTML = '⏳ Thawn mek...';
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) { if (msg) msg.innerHTML = '<span style="color:red">❌ ' + error.message + '</span>'; }
  else { if (msg) msg.innerHTML = '<span style="color:green">✅ Link thawn e!<br>📧 '+email+' inbox en rawh</span>'; }
};
window.doReset = async function () {
  const p1 = (document.getElementById('newPass')?.value || '').trim();
  const p2 = (document.getElementById('newPass2')?.value || '').trim();
  const msg = document.getElementById('resetMsg');
  if (p1.length < 6) { if (msg) msg.innerHTML = '<span style="color:red">❌ 6+ ni tur</span>'; return; }
  if (p1!== p2) { if (msg) msg.innerHTML = '<span style="color:red">❌ Inmil lo!</span>'; return; }
  if (msg) msg.innerHTML = '⏳ Thlak mek...';
  const { error } = await supabase.auth.updateUser({ password: p1 });
  if (error) { if (msg) msg.innerHTML = '<span style="color:red">❌ ' + error.message + '</span>'; }
  else { if (msg) msg.innerHTML = '<span style="color:green">✅ Thlak fel e! Login leh rawh</span>'; setTimeout(() => { window.location.hash = ''; location.reload(); }, 2000); }
};
window.doLogin = async function () {
  const e = (document.getElementById('email')?.value || '').trim();
  const p = (document.getElementById('password')?.value || '').trim();
  const m = document.getElementById('loginMsg');
  if(!e||!p){ if(m) m.innerHTML='<span style="color:red">Chhu lut kim rawh - Mizo</span>'; return; }
  if(m) m.innerHTML='⏳ Luh mek...';
  const {data, error} = await supabase.auth.signInWithPassword({ email: e, password: p });
  if (error) {
    if(error.message.toLowerCase().includes('email not confirmed') || error.message.toLowerCase().includes('not confirmed')){
      if(m) m.innerHTML = '<span style="color:#d97706">⚠ Email verify lo!<br><button onclick="window.resendVerify()" style="margin-top:8px;padding:8px 14px;border-radius:20px;border:none;background:#f59e0b;color:white;font-weight:700;font-size:11px">📧 Resend</button></span>';
    } else {
      if (m) m.innerHTML = '<span style="color:red">❌ ' + error.message + '</span>';
    }
    return;
  }
  currentUser = data.user;
  await loadAll();
  renderDashboard();
};
window.resendVerify = async function(){
  const e = (document.getElementById('email')?.value || '').trim();
  if(!e) return alert('Email dah rawh');
  const {error} = await supabase.auth.resend({ type: 'signup', email: e });
  if(error) alert('❌ '+error.message);
  else alert('✅ Verification thawn nawn e! 📧 '+e);
};
window.doSignup = async function () {
  const e = (document.getElementById('email')?.value || '').trim();
  const p = (document.getElementById('password')?.value || '').trim();
  const cp = (document.getElementById('cpassword')?.value || '').trim();
  const n = (document.getElementById('fname')?.value || '').trim();
  const ph = (document.getElementById('phone')?.value || '').trim();
  const m = document.getElementById('loginMsg');
  if (!e ||!p ||!n) { if(m) m.innerHTML='<span style="color:red">❌ Kim rawh</span>'; return; }
  if (p.length < 6) { if(m) m.innerHTML='<span style="color:red">❌ 6+ ni tur</span>'; return; }
  if (p!== cp) { if(m) m.innerHTML='<span style="color:red">❌ Inmil lo!</span>'; return; }
  if(m) m.innerHTML='⏳ Siam mek...';
  const d = await supabase.auth.signUp({ email: e, password: p, options: { data: { full_name: n, phone: ph } } });
  if (d.error) { if(m) m.innerHTML='<span style="color:red">❌ '+d.error.message+'</span>'; return; }
  if (d.data.user) {
    try{
      await supabase.from('profiles').insert({ id: d.data.user.id, full_name: n, phone: ph, email: e, last_seen: new Date().toISOString(), is_online: true });
    }catch(err){ console.log(err); }
    if(m) m.innerHTML='<span style="color:green">✅ Siam fel e! 📧 '+e+' ah link kan thawn e.</span>';
    setTimeout(()=>{ authMode='login'; renderLogin(); const em = document.getElementById('email'); if(em) em.value=e; }, 4000);
  }
};
window.setDashTab = function (t) { if (t!== 'videos') selectedVideo = null; dashTab = t; renderDashboard(); };
window.logout = async function () {
  const ok = confirm('🚪 I chhuah duh tak tak em?');
  if(!ok) return;
  try { if (currentUser) await supabase.from('profiles').update({ is_online: false }).eq('id', currentUser.id); } catch (e) {}
  if (onlineInterval) clearInterval(onlineInterval);
  clearTimers();
  await supabase.auth.signOut();
  location.reload();
};
window.setLeaderboardMock = function (id) { selectedMockFilter = id; renderDashboard(); window.setDashTab('leaderboard'); };
window.setChapterSubject = function (subject) {
  selectedChapterSubject = subject || 'All';
  dashTab = 'chapterMock';
  renderDashboard();
};
window.playVideo = function (id) { if (!isPremium()) { alert('🔒 Premium chauh!'); return window.setDashTab('premium'); } selectedVideo = allVideos.find((v) => String(v.id) === String(id)); renderDashboard(); };
window.closeVideo = function () { selectedVideo = null; renderDashboard(); };
window.toggleNoti = function () { showNotiPanel =!showNotiPanel; renderDashboard(); };
function getChapterMocks() { return allTests.filter((t) => t.mock_type === 'chapter' || (t.chapter && String(t.chapter).trim())); }
function renderChapterMocksHtml() {
  const chapterMocks = getChapterMocks();
  const subjects = ['All', ...Array.from(new Set(chapterMocks.map((t) => t.subject || 'General')))];
  if (!chapterMocks.length) {
    return `<div style="background:white;border-radius:20px;padding:28px;text-align:center;border:1px solid #e2e8f0"><div style="font-size:48px">📚</div><h3 style="margin:8px 0">Bung-wise Mock la awm lo - Mizo</h3><p style="font-size:12px;color:#64748b">Admin ah publish hmasa rawh</p></div>`;
  }
  const filtered = selectedChapterSubject === 'All' ? chapterMocks : chapterMocks.filter((t) => (t.subject || 'General') === selectedChapterSubject);
  const grouped = {};
  filtered.forEach((t) => { const ch = (t.chapter && String(t.chapter).trim()) || 'Bung'; if (!grouped[ch]) grouped[ch] = []; grouped[ch].push(t); });
  let groupsHtml = '';
  Object.keys(grouped).sort().forEach((chapter) => {
    const items = grouped[chapter].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    let cards = '';
    items.forEach((t) => {
      const s = getStatus(t); const locked = isTestLocked(t); const hasTimer = (t.per_question_seconds || 0) > 0 || (t.total_seconds || 0) > 0; const qCount = t.questions ? t.questions.length : 0;
      const border = locked ? '#8b5cf6' : (s.ok ? '#10b981' : '#e5e7eb'); const left = locked ? '#8b5cf6' : (s.prem ? '#10b981' : s.ok ? '#10b981' : '#f59e0b');
      const action = locked ? `alert('📅 ${getLockTime(t)} ah hawng ang!')` : s.ok ? `window.startTest('${t.id}')` : s.pend ? `alert('⏳ Nghah mek')` : `window.buyTest('${t.id}')`;
      cards += `<div style="background:white;border:1px solid ${border};border-left:4px solid ${left};border-radius:16px;padding:14px"><div style="display:flex;justify-content:space-between;gap:8px"><div style="flex:1"><b style="font-size:14px">${esc(t.title)}</b><div style="margin-top:4px;font-size:10px;color:#64748b">${esc(t.subject || 'General')} • ${qCount} zawhna</div></div><span style="background:${s.ok ? '#dcfce7' : '#fffbeb'};color:${s.ok ? '#166534' : '#92400e'};padding:4px 8px;border-radius:20px;font-size:9px;font-weight:800">${esc(s.label)}</span></div>${hasTimer ? `<div style="margin-top:8px;font-size:10px;color:#d97706">⏱ Q:${t.per_question_seconds || 0}s • Full:${t.total_seconds ? formatSec(t.total_seconds) : 'Off'}</div>` : ''}${t.is_scheduled ? `<div style="margin-top:6px;font-size:10px;color:#6d28d9;font-weight:800">${locked ? '🔒 ' + esc(getLockTime(t)) : '🟢 LIVE'}</div>` : ''}<button onclick="${action}" style="width:100%;margin-top:10px;padding:10px;border:none;border-radius:10px;background:${locked ? '#8b5cf6' : s.ok ? '#10b981' : s.pend ? '#f59e0b' : '#111'};color:white;font-weight:800">${locked ? '🔒 A la inkalh' : esc(s.btn)}</button></div>`;
    });
    groupsHtml += `<div style="margin-bottom:18px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="width:8px;height:8px;border-radius:50%;background:#667eea"></div><h3 style="margin:0;font-size:16px">${esc(chapter)}</h3><span style="font-size:10px;color:#94a3b8">${items.length} Mock</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px">${cards}</div></div>`;
  });
  const filterButtons = subjects.map((subj) => `<button onclick="window.setChapterSubject('${String(subj).replace(/'/g, "\\'")}')" style="padding:8px 12px;border-radius:20px;border:1px solid ${selectedChapterSubject === subj ? '#111' : '#e2e8f0'};background:${selectedChapterSubject === subj ? '#111' : 'white'};color:${selectedChapterSubject === subj ? 'white' : '#334155'};font-size:11px;font-weight:800;cursor:pointer">${esc(subj)}</button>`).join('');
  return `<div><div style="background:linear-gradient(135deg,#eef2ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:20px;padding:18px;margin-bottom:14px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><div><h2 style="margin:0">📚 Bung-wise Mock Test - Mizo</h2><small style="color:#64748b">Admin a publish apiang heta lang ang</small></div><div style="background:white;border:1px solid #c7d2fe;padding:8px 12px;border-radius:20px;font-size:11px;font-weight:800">${chapterMocks.length} Mock</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:14px">${filterButtons}</div></div>${groupsHtml}</div>`;
}
function renderDashboard() {
  const free = allTests.filter((t) => t.access_type === 'free');
  const paid = allTests.filter((t) => t.access_type === 'paid');
  const avg = myAttempts.length? Math.round(myAttempts.reduce((s, a) => s + (a.score || 0), 0) / myAttempts.length) : 0;
  const bestScore = myAttempts.length? Math.max(...myAttempts.map((a) => a.score || 0)) : 0;
  const totalQAttempted = myAttempts.reduce((s, a) => s + (a.total || 0), 0);
  const totalCorrect = myAttempts.reduce((s, a) => s + (a.correct || 0), 0);
  const premActive = isPremium();
  const premExpiryText = (() => { if (!premActive) return 'INACTIVE - Premium lei rawh'; if (!currentProfile?.premium_expires_at) return '♾ LIFETIME'; try { const d = new Date(currentProfile.premium_expires_at); const diff = d - new Date(); if (diff <= 0) return `❌ EXPIRED - ${d.toLocaleDateString()}`; const daysLeft = Math.ceil(diff / 86400000); return `${d.toLocaleDateString()} - ${daysLeft} ni la awm`; } catch(e) { return currentProfile.premium_expires_at; } })();
  let pendingBanner = '';
  if (myPremiumPending) { pendingBanner += `<div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:12px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center"><div><b style="color:#92400e">⏳ Premium nghah mek</b><br><small style="font-size:11px">Rs.${myPremiumPending.amount} - Txn: ${esc(myPremiumPending.txn_id)}</small></div><span style="background:#f59e0b;color:white;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800">NGHAH MEK</span></div>`; }
  const pendingPaidCount = myPayments.filter((p) => p.status === 'pending').length;
  if (pendingPaidCount > 0) { pendingBanner += `<div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:12px;padding:12px;margin-bottom:12px"><b style="color:#92400e;font-size:12px">⏳ Test man nghah mek: ${pendingPaidCount}</b><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${myPayments.filter((p) => p.status === 'pending').map((p) => { const inf = getMockInfo(p.test_id); return `<span style="background:white;border:1px solid #f59e0b;padding:4px 8px;border-radius:20px;font-size:10px">⏳ ${esc(inf.title)} - Rs.${p.amount}</span>`; }).join('')}</div></div>`; }
  const dashStats = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px"><div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;border-radius:20px;padding:16px;"><div style="font-size:11px;opacity:0.8">TEST ZAWH</div><div style="font-size:28px;font-weight:900;margin-top:4px">${myAttempts.length}</div><div style="font-size:10px;margin-top:6px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 8px;border-radius:20px">${allTests.length} awm</div></div><div style="background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:20px;padding:16px;"><div style="font-size:11px;opacity:0.8">AVG SCORE</div><div style="font-size:28px;font-weight:900;margin-top:4px">${avg}%</div><div style="font-size:10px;margin-top:6px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 8px;border-radius:20px">Tha ber ${bestScore}%</div></div><div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border-radius:20px;padding:16px;"><div style="font-size:11px;opacity:0.8">DIK ZAT</div><div style="font-size:28px;font-weight:900;margin-top:4px">${totalCorrect}/${totalQAttempted}</div><div style="font-size:10px;margin-top:6px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 8px;border-radius:20px">${totalQAttempted? Math.round((totalCorrect / totalQAttempted) * 100) : 0}% dik</div></div><div style="background:linear-gradient(135deg,#0f172a,#334155);color:white;border-radius:20px;padding:16px;"><div style="font-size:11px;opacity:0.8">PREMIUM</div><div style="font-size:16px;font-weight:900;margin-top:8px">${premActive? '👑 ACTIVE' : '🔒 INACTIVE'}</div><div style="font-size:10px;margin-top:6px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 8px;border-radius:20px;word-break:break-all">${premExpiryText}</div></div></div>`;
  const notiPanelHtml = `<div id="notiPanel" style="background:white;border-radius:20px;padding:0;margin-bottom:16px;border:1px solid #e2e8f0;overflow:hidden;display:${dashTab === 'dashboard' || dashTab === 'tests' || showNotiPanel? 'block' : 'none'}"><div style="background:linear-gradient(135deg,#0f172a,#334155);color:white;padding:14px 18px;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">🔔</span><b>Hriattirna</b><span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:20px;font-size:10px;margin-left:6px">${allNotis.length} thar</span></div></div><div style="max-height:280px;overflow-y:auto;padding:8px">${allNotis.length? allNotis.map((n) => `<div style="padding:12px;border-radius:14px;margin-bottom:8px;background:#f8fafc;border-left:4px solid #667eea;display:flex;gap:10px"><div style="width:36px;height:36px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;flex-shrink:0">📢</div><div style="flex:1"><b style="font-size:13px">${esc(n.title)}</b><div style="font-size:12px;color:#475569;margin-top:2px;">${esc(n.message)}</div><small style="font-size:10px;color:#94a3b8">${new Date(n.created_at).toLocaleString()}</small></div></div>`).join('') : `<div style="text-align:center;padding:24px;color:#94a3b8">Hriattirna la awm lo</div>`}</div></div>`;
  let freeHtml = ''; free.forEach((t) => { const s = getStatus(t); const hasTimer = (t.per_question_seconds || 0) > 0 || (t.total_seconds || 0) > 0; const locked = isTestLocked(t); freeHtml += `<div style="background:white;border-radius:16px;padding:16px;border:1px solid ${locked? '#8b5cf6' : '#eee'};border-left:4px solid ${locked? '#8b5cf6' : s.color};"><b>${esc(t.title)}</b> <small style="background:#eef2ff;color:#667eea;padding:2px 6px;border-radius:8px">${esc(t.subject || '')}</small>${hasTimer? `<br><small style="color:#f59e0b">⏱ Q:${t.per_question_seconds || 0}s Full:${t.total_seconds? formatSec(t.total_seconds) : 'Off'}</small>` : ''}${t.is_scheduled? `<br><small style="background:#ede9fe;color:#6d28d9;padding:3px 8px;border-radius:20px;font-weight:800">${locked? '📅 ' + getLockTime(t) + ' INKALH' : '🟢 LIVE'}</small>` : ''}<div style="font-size:11px;color:#666">${t.questions? t.questions.length : 0} zawhna</div><button onclick="${locked? `alert('📅 ${getLockTime(t)} ah hawng ang!')` : `window.startTest('${t.id}')`}" style="width:100%;margin-top:8px;padding:10px;border:none;border-radius:10px;background:${locked? '#8b5cf6' : '#111'};color:white;font-weight:700">${locked? '🔒 ' + getLockTime(t) : 'Tan rawh'}</button></div>`; });
  let paidHtml = ''; paid.forEach((t) => { const s = getStatus(t); const isPend = s.pend; const locked = isTestLocked(t); paidHtml += `<div style="background:white;border-radius:16px;padding:16px;border:1px solid ${isPend? '#f59e0b' : locked? '#8b5cf6' : '#eee'};border-left:4px solid ${s.prem? '#10b981' : isPend? '#f59e0b' : locked? '#8b5cf6' : 'gold'};"><div style="display:flex;justify-content:space-between"><b>${esc(t.title)}</b>${isPend? '<span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:900">⏳ NGHAH MEK</span>' : locked? '<span style="background:#8b5cf6;color:white;padding:2px 8px;border-radius:20px;font-size:9px">📅 INKALH</span>' : ''}</div><small style="background:#fffbeb;padding:2px 6px;border-radius:8px">${esc(t.subject || '')}</small><div style="font-size:11px;color:${isPend? '#92400e' : '#666'}">${t.questions? t.questions.length : 0} Qs - ${esc(s.label)}</div><button onclick="${locked? `alert('📅 ${getLockTime(t)} ah hawng ang!')` : s.ok? `window.startTest('${t.id}')` : isPend? `alert('Nghah mek')` : `window.buyTest('${t.id}')`}" style="width:100%;margin-top:8px;padding:10px;border:none;border-radius:10px;background:${locked? '#8b5cf6' : s.prem? '#10b981' : s.ok? '#10b981' : isPend? '#f59e0b' : 'gold'};color:${isPend || locked? 'white' : '#111'};font-weight:800">${locked? '🔒 ' + getLockTime(t) : s.btn}</button></div>`; });
  let mockOptions = ''; allTests.forEach((t) => { mockOptions += `<option value="${t.id}" ${String(selectedMockFilter) === String(t.id)? 'selected' : ''}>${esc(t.title)} - ${esc(t.subject || 'General')}</option>`; });
  const filtered = leaderboard.filter((a) => String(a.test_id) === String(selectedMockFilter)).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 20);
  const selInfo = getMockInfo(selectedMockFilter);
  let tableRows = ''; if (filtered.length === 0) { tableRows = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999">Tumah an la chhang lo</td></tr>'; } else { filtered.forEach((a, i) => { const rank = i + 1; let rankColor = '#eee'; if (rank === 1) rankColor = 'gold'; else if (rank === 2) rankColor = '#c0c0c0'; else if (rank === 3) rankColor = '#cd7f32'; tableRows += `<tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px;text-align:center"><div style="width:28px;height:28px;border-radius:50%;background:${rankColor};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:12px">${rank}</div></td><td style="padding:10px;font-weight:700">${esc(getUserName(a.user_id))}</td><td style="padding:10px"><b>${esc(selInfo.title)}</b></td><td style="padding:10px"><span style="background:#eef2ff;color:#667eea;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">${esc(selInfo.subject)}</span></td><td style="padding:10px;text-align:center"><span style="background:#111;color:white;padding:6px 14px;border-radius:20px;font-weight:900">${a.score}%</span></td></tr>`; }); }
  let videoHtml = ''; if (selectedVideo) { videoHtml = `<div style="background:white;border-radius:20px;padding:16px;border:2px solid #f59e0b"><button onclick="window.closeVideo()" style="padding:8px 14px;border:none;border-radius:10px;background:#f3f4f6;font-weight:700;margin-bottom:12px">← Kir leh</button><h3 style="margin:8px 0">${esc(selectedVideo.title)}</h3><div style="background:black;border-radius:16px;overflow:hidden;aspect-ratio:16/9"><video controls controlsList="nodownload" style="width:100%;height:100%" src="${selectedVideo.video_url}"></video></div></div>`; } else { if (!premActive) { videoHtml = `<div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #f59e0b;border-radius:20px;padding:24px;text-align:center"><div style="font-size:48px">🔒</div><h2>Premium chauh</h2><button onclick="window.setDashTab('premium')" style="padding:12px 24px;background:#f59e0b;color:white;border:none;border-radius:12px;font-weight:900;width:100%">Premium Lei rawh</button></div>`; } else { videoHtml = `<div style="display:grid;gap:10px">${allVideos.map((v) => `<div onclick="window.playVideo('${v.id}')" style="background:white;border-radius:16px;padding:12px;display:flex;gap:12px;cursor:pointer;border:1px solid #f59e0b"><div style="width:110px;height:64px;background:#0f172a;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white">▶</div><div style="flex:1"><b>${esc(v.title)}</b><br><small>${esc(v.subject)}</small></div></div>`).join('') || '<div>Video la awm lo</div>'}</div>`; } }
  document.querySelector('#app').innerHTML = `<div style="min-height:100vh;background:#f6f7fb;font-family:system-ui"><div style="background:${premActive? 'linear-gradient(135deg,#10b981,#059669)' : 'white'};padding:12px 20px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10;border-bottom:1px solid #eee;flex-wrap:wrap;gap:8px"><div><b>NEET Mock ${premActive? 'PREMIUM' : myPremiumPending? '⏳ NGHGH MEK' : ''}</b><br><small>Avg ${avg}% • ${premExpiryText}</small></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button onclick="window.setDashTab('dashboard')" style="padding:8px 12px;border-radius:20px;border:none;background:${dashTab === 'dashboard'? '#0f172a' : '#f3f4f6'};color:${dashTab === 'dashboard'? 'white' : '#111'};font-weight:700;font-size:12px">📊 Thlirna</button><button onclick="window.setDashTab('tests')" style="padding:8px 12px;border-radius:20px;border:none;background:${dashTab === 'tests'? '#111' : '#f3f4f6'};color:${dashTab === 'tests'? 'white' : '#111'};font-weight:700;font-size:12px">Tests</button><button onclick="window.setDashTab('chapterMock')" style="padding:8px 12px;border-radius:20px;border:none;background:${dashTab === 'chapterMock'? '#667eea' : '#eef2ff'};color:${dashTab === 'chapterMock'? 'white' : '#3730a3'};font-weight:800;font-size:12px">📚 Bung-wise</button><button onclick="window.setDashTab('videos')" style="padding:8px 12px;border-radius:20px;border:none;background:${dashTab === 'videos'? '#f59e0b' : '#fffbeb'};color:${dashTab === 'videos'? 'white' : '#92400e'};font-weight:800;font-size:12px">🎥 Video</button><button onclick="window.setDashTab('premium')" style="padding:8px 12px;border-radius:20px;border:none;background:#f59e0b;color:white;font-weight:700;font-size:12px">Premium</button><button onclick="window.setDashTab('results')" style="padding:8px 12px;border-radius:20px;border:none;background:${dashTab === 'results'? '#111' : '#f3f4f6'};color:${dashTab === 'results'? 'white' : '#111'};font-size:12px">Result</button><button onclick="window.setDashTab('leaderboard')" style="padding:8px 12px;border-radius:20px;border:none;background:${dashTab === 'leaderboard'? '#111' : '#f3f4f6'};color:${dashTab === 'leaderboard'? 'white' : '#111'};font-size:12px">Thiam ber</button><button onclick="window.logout()" style="padding:8px 12px;border-radius:20px;border:1px solid #ddd;background:white;font-size:12px">Chhuah</button></div></div><div style="max-width:1000px;margin:0 auto;padding:16px">${pendingBanner}` + (dashTab === 'dashboard'? `<div>${notiPanelHtml}${dashStats}<h3>Test thar te - Mizo</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">${free.slice(0, 2).map((t) => `<div style="background:white;border-radius:16px;padding:14px;border:1px solid #e2e8f0"><b>${esc(t.title)}</b><br><small>${esc(t.subject)}</small><br><button onclick="window.startTest('${t.id}')" style="margin-top:8px;padding:8px 12px;border:none;border-radius:10px;background:#111;color:white;font-weight:700;width:100%">Tan rawh</button></div>`).join('')}${paid.slice(0, 2).map((t) => `<div style="background:white;border-radius:16px;padding:14px;border:1px solid #e2e8f0"><b>${esc(t.title)}</b> - ${getStatus(t).label}<br><button onclick="window.startTest('${t.id}')" style="margin-top:8px;padding:8px 12px;border:none;border-radius:10px;background:gold;font-weight:700;width:100%">${getStatus(t).btn}</button></div>`).join('')}</div></div>` : '') + (dashTab === 'tests'? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">${notiPanelHtml}<div style="grid-column:1/-1"><h2>Test zawng zawng - ${allTests.length}</h2></div>${freeHtml + paidHtml}</div>` : '') + (dashTab === 'chapterMock'? renderChapterMocksHtml() : '') + (dashTab === 'videos'? `<h2>🎥 Zirna Video</h2>${videoHtml}` : '') + (dashTab === 'premium'? `<h2>Premium</h2><div style="background:linear-gradient(135deg,#0f172a,#334155);color:white;border-radius:16px;padding:16px;margin-bottom:12px"><b>👑 Ka Premium</b><div style="margin-top:8px;font-size:13px"><div>Status: ${premActive? '✅ ACTIVE' : '❌ INACTIVE'}</div><div>Expiry: <b>${premExpiryText}</b></div></div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">${premiumPlans.map((pl) => `<div style="background:white;border-radius:16px;padding:16px;border:1px solid #eee"><b>${pl.name}</b><div style="font-size:24px;font-weight:900">Rs.${pl.price}</div><button onclick="window.buyPremium(${pl.id})" style="width:100%;padding:10px;background:#f59e0b;color:white;border:none;border-radius:10px;font-weight:800;margin-top:8px">Lei rawh</button></div>`).join('')}</div>` : '') + (dashTab === 'results'? `<h2>Result te</h2><div style="background:white;border-radius:16px;padding:16px">${myAttempts.length? myAttempts.map((a) => { const inf = getMockInfo(a.test_id); return `<div style="padding:12px;border-bottom:1px solid #eee;display:flex;justify-content:space-between"><div><b>${esc(inf.title)}</b><br><small>${new Date(a.created_at).toLocaleDateString()}</small></div><div style="display:flex;gap:6px;align-items:center"><div style="background:#111;color:white;padding:6px 12px;border-radius:20px;font-weight:800">${a.score}%</div><button onclick="window.viewAttempt('${a.id}')" style="padding:6px 12px;border-radius:20px;border:none;background:#ef4444;color:white;font-size:11px;font-weight:800">Dik lo en</button></div></div>`; }).join('') : '<div>Result la awm lo</div>'}</div>` : '') + (dashTab === 'leaderboard'? `<div style="background:white;border-radius:16px;padding:16px;border:1px solid #eee"><h2>🏆 Thiam ber te</h2><div style="margin-bottom:12px"><select onchange="window.setLeaderboardMock(this.value)" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ddd;font-weight:700"><option value="">-- Mock thlang rawh --</option>${mockOptions}</select></div><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#0f172a;color:white"><th style="padding:12px">Rank</th><th style="padding:12px;text-align:left">Hming</th><th>Mock</th><th>Subject</th><th>Score</th></tr></thead><tbody>${tableRows}</tbody></table></div></div>` : '') + `</div></div>`;
}
window.startTest = function (id) {
  currentTest = allTests.find((t) => String(t.id) === String(id));
  if (!currentTest) return;
  if (isTestLocked(currentTest)) { return alert(`📅 ${getLockTime(currentTest)} ah hawng ang!`); }
  const s = getStatus(currentTest);
  if (!s.ok) { if (s.pend) return alert('⏳ Nghah mek'); return window.buyTest(id); }
  currentQs = currentTest.questions || []; userAnswers = {}; currentQIdx = 0; clearTimers();
  perQLeft = currentTest.per_question_seconds || 0; totalLeft = currentTest.total_seconds || 0;
  renderTest();
  if (perQLeft > 0) { perQInterval = setInterval(() => { perQLeft--; const el = document.getElementById('perQTimer'); if (el) { el.textContent = perQLeft + 's'; el.style.color = perQLeft < 10? 'red' : '#92400e'; } if (perQLeft <= 0) { if (currentQIdx < currentQs.length - 1) { currentQIdx++; perQLeft = currentTest.per_question_seconds; renderTest(); } else { window.submitTest(); } } }, 1000); }
  if (totalLeft > 0) { totalInterval = setInterval(() => { totalLeft--; const el = document.getElementById('totalTimer'); if (el) { el.textContent = formatSec(totalLeft); el.style.color = totalLeft < 60? 'red' : '#1e40af'; } if (totalLeft <= 0) { alert('⏰ Hun a tawp!'); window.submitTest(); } }, 1000); }
};
function renderTest() {
  const perQEnabled = (currentTest.per_question_seconds || 0) > 0;
  const totalEnabled = (currentTest.total_seconds || 0) > 0;
  let timerBar = ''; if (perQEnabled || totalEnabled) { timerBar = `<div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:58px;z-index:9">${perQEnabled? `<div><b>⏱ Q${currentQIdx + 1}:</b> <span id="perQTimer" style="font-weight:900;font-size:18px">${perQLeft}s</span></div>` : ''}${totalEnabled? `<div><b>⏱ A vai:</b> <span id="totalTimer" style="font-weight:900;font-size:18px">${formatSec(totalLeft)}</span></div>` : ''}<div style="font-size:10px">Q ${currentQIdx + 1}/${currentQs.length}</div></div>`; }
  let html = ''; if (perQEnabled) { const q = currentQs[currentQIdx]; if (!q) return; let opts = ''; ['A', 'B', 'C', 'D'].forEach((o) => { opts += `<label style="padding:12px;border:2px solid ${userAnswers[currentQIdx] === o? '#10b981' : '#eee'};border-radius:12px;display:flex;gap:8px;background:${userAnswers[currentQIdx] === o? '#ecfdf5' : 'white'};margin-bottom:8px;cursor:pointer"><input type="radio" name="q${currentQIdx}" value="${o}" ${userAnswers[currentQIdx] === o? 'checked' : ''} onchange="window.selectAns(${currentQIdx},'${o}')"> ${o}. ${esc(q[o.toLowerCase()] || '')}</label>`; }); html = `<div style="background:white;border-radius:16px;padding:20px"><b>Q${currentQIdx + 1}. ${esc(q.q)}</b><div style="margin-top:14px">${opts}</div><div style="display:flex;gap:8px;margin-top:16px">${currentQIdx > 0? `<button onclick="window.prevQ()" style="flex:1;padding:12px;border-radius:12px;border:1px solid #ddd;background:white;font-weight:700">← Hnung</button>` : ''}${currentQIdx < currentQs.length - 1? `<button onclick="window.nextQ()" style="flex:1;padding:12px;border-radius:12px;border:none;background:#111;color:white;font-weight:800">Hma →</button>` : `<button onclick="window.submitTest()" style="flex:1;padding:12px;border-radius:12px;border:none;background:#10b981;color:white;font-weight:800">Theh lut rawh</button>`}</div></div>`; } else { currentQs.forEach((q, i) => { let opts = ''; ['A', 'B', 'C', 'D'].forEach((o) => { opts += `<label style="padding:10px;border:2px solid ${userAnswers[i] === o? '#111' : '#eee'};border-radius:10px;display:flex;gap:8px;background:${userAnswers[i] === o? '#eef2ff' : 'white'};margin-bottom:6px"><input type="radio" name="q${i}" value="${o}" ${userAnswers[i] === o? 'checked' : ''} onchange="window.selectAns(${i},'${o}')"> ${o}. ${esc(q[o.toLowerCase()] || '')}</label>`; }); html += `<div style="background:white;border-radius:16px;padding:16px;margin-bottom:10px"><b>Q${i + 1}. ${esc(q.q)}</b><div style="margin-top:10px">${opts}</div></div>`; }); }
  document.querySelector('#app').innerHTML = `<div style="min-height:100vh;background:#f6f7fb"><div style="background:white;padding:12px 20px;display:flex;justify-content:space-between;position:sticky;top:0;border-bottom:1px solid #eee;z-index:10"><b>${esc(currentTest.title)}</b><div style="display:flex;gap:8px"><button onclick="window.cancelTest()" style="padding:8px 12px;border-radius:20px;border:1px solid #ddd;background:white">Cancel</button>${!perQEnabled? `<button onclick="window.submitTest()" style="padding:8px 16px;background:#10b981;color:white;border:none;border-radius:20px">Theh lut</button>` : ''}</div></div><div style="max-width:700px;margin:0 auto;padding:20px">${timerBar}${html}${!perQEnabled? `<button onclick="window.submitTest()" style="width:100%;padding:14px;background:#111;color:white;border:none;border-radius:12px;font-weight:800;margin-top:10px">Theh lut rawh</button>` : ''}</div></div>`;
}
window.nextQ = function () { if (currentQIdx < currentQs.length - 1) { currentQIdx++; if (currentTest.per_question_seconds) perQLeft = currentTest.per_question_seconds; renderTest(); } };
window.prevQ = function () { if (currentQIdx > 0) { currentQIdx--; if (currentTest.per_question_seconds) perQLeft = currentTest.per_question_seconds; renderTest(); } };
window.cancelTest = function () { if (!confirm('❌ Test cancel duh tak tak em? A bo vek ang!')) return; clearTimers(); renderDashboard(); };
window.selectAns = function (i, o) { userAnswers[i] = o; };
window.submitTest = async function () {
  if(!confirm('✅ Theh lut duh tak tak em?')) return;
  clearTimers(); let c = 0; currentQs.forEach((q, i) => { if (userAnswers[i] === q.ans) c++; });
  const score = currentQs.length? Math.round((c / currentQs.length) * 100) : 0;
  await supabase.from('test_attempts').insert({ user_id: currentUser.id, test_id: currentTest.id, score: score, total: currentQs.length, correct: c, answers: userAnswers });
  await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', currentUser.id);
  await loadAll(); renderDashboard(); window.setDashTab('results');
};
window.buyTest = function (id) {
  currentTest = allTests.find((t) => String(t.id) === String(id)); gpayFile = null;
  const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=' + paySettings.upi1 + '&am=' + (currentTest.price || 100);
  const qrUrl = paySettings.qr1_url && paySettings.qr1_url.length > 20? paySettings.qr1_url : qr;
  document.querySelector('#app').innerHTML = `<div style="min-height:100vh;background:#f6f7fb;display:flex;align-items:center;justify-content:center;padding:20px"><div style="background:white;border-radius:20px;padding:20px;max-width:400px;width:100%"><h3>${esc(currentTest.title)}</h3><div style="text-align:center;background:#f9fafb;padding:12px;border-radius:12px;margin:10px 0"><img src="${qrUrl}" style="width:160px;height:160px"></div><input id="txn" placeholder="Txn ID chhu lut rawh" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ddd;margin-bottom:8px;box-sizing:border-box"><label style="font-size:12px;font-weight:700">📸 GPay Screenshot</label><input type="file" accept="image/*" onchange="window.previewGpay(this)" style="width:100%;padding:8px;border:2px dashed #f59e0b;border-radius:10px;background:#fffbeb;margin:6px 0 8px"><img id="gpayPreview" style="display:none;width:100%;max-height:220px;object-fit:contain;border-radius:10px;border:1px solid #eee;margin-bottom:10px"><button onclick="window.submitPay()" id="payBtn" style="width:100%;padding:12px;background:#111;color:white;border-radius:10px;font-weight:800">Theh lut rawh</button><button onclick="window.setDashTab('tests')" style="width:100%;padding:8px;margin-top:8px;background:#f3f4f6;border:none;border-radius:10px">Kir leh</button></div></div>`;
};
window.submitPay = async function () {
  const txn = document.getElementById('txn').value.trim(); const btn = document.getElementById('payBtn');
  if (!txn) return alert('Txn ID dah rawh'); if (!gpayFile) return alert('Screenshot thlang rawh!');
  try { if (btn) { btn.innerHTML = '⏳ Uploading...'; btn.disabled = true; } const screenshotUrl = await uploadGpayScreenshot(); await supabase.from('payment_requests').insert({ user_id: currentUser.id, test_id: currentTest.id, amount: currentTest.price || 100, txn_id: txn, screenshot_url: screenshotUrl, status: 'pending' }); alert('✅ Theh luh fel e!'); gpayFile = null; await loadAll(); renderDashboard(); } catch (e) { alert('Error: ' + e.message); if (btn) { btn.innerHTML = 'Theh lut'; btn.disabled = false; } }
};
window.buyPremium = function (planId) {
  const plan = premiumPlans.find((p) => p.id === planId); gpayFile = null;
  const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=' + paySettings.upi1 + '&am=' + plan.price;
  const qrUrl = paySettings.qr1_url && paySettings.qr1_url.length > 20? paySettings.qr1_url : qr;
  document.querySelector('#app').innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px"><div style="background:white;border-radius:20px;padding:20px;max-width:400px;width:100%;border:2px solid #f59e0b"><h2 style="text-align:center">${plan.name}</h2><div style="text-align:center;background:#fffbeb;padding:12px;border-radius:12px"><img src="${qrUrl}" style="width:160px;height:160px"></div><input id="txn" placeholder="Txn ID" style="width:100%;padding:10px;border-radius:10px;border:2px solid #f59e0b;margin:8px 0;box-sizing:border-box"><label style="font-size:12px;font-weight:700">📸 Screenshot</label><input type="file" accept="image/*" onchange="window.previewGpay(this)" style="width:100%;padding:8px;border:2px dashed #f59e0b;border-radius:10px;background:#fffbeb;margin:6px 0"><img id="gpayPreview" style="display:none;width:100%;max-height:220px;object-fit:contain;border-radius:10px;border:1px solid #eee;margin-bottom:10px"><button onclick="window.submitPremium(${plan.id})" id="premBtn" style="width:100%;padding:12px;background:#f59e0b;color:white;border:none;border-radius:12px;font-weight:900">Premium Theh lut</button><button onclick="window.setDashTab('premium')" style="width:100%;padding:8px;margin-top:8px;background:#f3f4f6;border:none;border-radius:10px">Kir leh</button></div></div>`;
};
window.submitPremium = async function (planId) {
  const txn = document.getElementById('txn').value.trim(); const btn = document.getElementById('premBtn');
  if (!txn) return alert('Txn ID'); if (!gpayFile) return alert('Screenshot thlang rawh!');
  try { if (btn) { btn.innerHTML = '⏳ Uploading...'; btn.disabled = true; } const screenshotUrl = await uploadGpayScreenshot(); const plan = premiumPlans.find((p) => p.id === planId); await supabase.from('premium_payments').insert({ user_id: currentUser.id, plan_id: planId, amount: plan.price, txn_id: txn, screenshot_url: screenshotUrl, status: 'pending' }); alert('✅ Premium nghah mek!'); gpayFile = null; await loadAll(); renderDashboard(); window.setDashTab('premium'); } catch (e) { alert('Error: ' + e.message); if (btn) { btn.innerHTML = 'Premium Theh lut'; btn.disabled = false; } }
};
init();
