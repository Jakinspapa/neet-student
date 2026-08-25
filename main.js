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
  // MODERN DASHBOARD + NOTIFICATION - NEW ADD CHAUH - ENGMAH PAIH LO
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
  const { error } = await supabase.storage
    .from('payments')
    .upload(fileName, gpayFile);
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
  const canView =
    test.access_type === 'free' || status.ok || status.prem || isPremium();
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
    const isWrong = userAns !== correctAns;
    if (!isWrong) return;
    wrongCount++;
    wrongHtml += `<div style="background:white;border-radius:16px;padding:16px;margin-bottom:12px;border-left:4px solid #ef4444"><div style="display:flex;justify-content:space-between"><b>Q${
      i + 1
    }. ${esc(
      q.q
    )}</b><span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:800">WRONG</span></div><div style="margin-top:10px;display:grid;gap:6px">${[
      'A',
      'B',
      'C',
      'D',
    ]
      .map((o) => {
        const isCorrect = o === correctAns;
        const isUserWrong = o === userAns && o !== correctAns;
        return `<div style="padding:8px 10px;border-radius:10px;border:2px solid ${
          isCorrect ? '#10b981' : isUserWrong ? '#ef4444' : '#eee'
        };background:${
          isCorrect ? '#ecfdf5' : isUserWrong ? '#fef2f2' : 'white'
        };display:flex;justify-content:space-between"><span>${o}. ${esc(
          q[o.toLowerCase()] || ''
        )}</span><span style="font-size:11px;font-weight:800">${
          isCorrect ? '✅ Correct' : isUserWrong ? '❌ Your Answer' : ''
        }</span></div>`;
      })
      .join('')}</div>${
      q.explanation || q.exp
        ? `<div style="margin-top:10px;background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #f59e0b;border-radius:12px;padding:12px;"><div style="display:flex;align-items:center;gap:6px;font-weight:900;color:#92400e;font-size:13px;margin-bottom:6px;"><span style="background:#f59e0b;color:white;width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;">💡</span> Explanation - Hrilhfiahna</div><div style="font-size:13px;color:#78350f;line-height:1.6;white-space:pre-wrap;background:white;padding:10px;border-radius:8px;border:1px solid #fde68a;">${esc(
            q.explanation || q.exp
          )}</div></div>`
        : `<div style="margin-top:8px;background:#fee2e2;border:1px dashed #fca5a5;padding:8px;border-radius:10px;font-size:11px;color:#991b1b;text-align:center;">⚠️ Admin ah Explanation la dah lo - Q${
            i + 1
          } ah ziak rawh!</div>`
    }</div>`;
  });
  if (wrongCount === 0) {
    wrongHtml = `<div style="background:#ecfdf5;border:1px solid #10b981;border-radius:16px;padding:20px;text-align:center"><h3 style="color:#10b981;margin:0">🎉 Perfect! Dik vek!</h3></div>`;
  }
  document.querySelector(
    '#app'
  ).innerHTML = `<div style="min-height:100vh;background:#f6f7fb;font-family:system-ui"><div style="background:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10;border-bottom:1px solid #eee"><div><b>${esc(
    test.title
  )} - Wrong Review</b><br><small style="color:#ef4444">${wrongCount} Wrong / ${
    qs.length
  } Total • Score ${
    attempt.score
  }%</small></div><button onclick="window.setDashTab('results')" style="padding:8px 14px;border-radius:20px;border:none;background:#111;color:white;font-size:12px;font-weight:700">← Back</button></div><div style="max-width:700px;margin:0 auto;padding:16px"><div style="background:white;border-radius:16px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between"><div><b>Score: ${
    attempt.score
  }%</b> - ${attempt.correct}/${
    attempt.total
  } Correct</div><div style="font-size:11px;color:#666">${new Date(
    attempt.created_at
  ).toLocaleString()}</div></div>${wrongHtml}</div></div>`;
};

async function init() {
  try {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      resetMode = true;
      renderResetPassword();
      return;
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
    renderLogin();
  }
}
async function updateOnline() {
  if (!currentUser) return;
  try {
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString(), is_online: true })
      .eq('id', currentUser.id);
  } catch (e) {}
}
async function loadAll() {
  const r = await Promise.all([
    supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
    supabase
      .from('mock_tests')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('premium_payments')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('premium_plans')
      .select('*')
      .order('price', { ascending: true }),
    supabase.from('payment_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('profiles').select('*').limit(100),
    supabase
      .from('test_attempts')
      .select('*')
      .order('score', { ascending: false })
      .limit(200),
    supabase
      .from('coaching_videos')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
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
  allNotis = r[10].data || [];
  console.log('NOTI DATA:', r[10].data, 'ERROR:', r[10].error); // DEBUG LINE - ADD HI

  // REALTIME ADD - HEI HI ADD RAWH
  try {
    supabase
      .channel('noti-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          console.log('New Noti - reloading');
          loadAll();
        }
      )
      .subscribe();
  } catch (e) {}

  if (r[6].data) paySettings = { ...paySettings, ...r[6].data };
  if (r[6].data) paySettings = { ...paySettings, ...r[6].data };
  const approved = (r[4].data || []).filter((p) => p.status === 'approved');
  let active = null;
  for (let i = 0; i < approved.length; i++) {
    const p = approved[i];
    if (!p.end_date) {
      active = p;
      break;
    }
    try {
      if (new Date(p.end_date) > new Date()) {
        active = p;
        break;
      }
    } catch (e) {
      active = p;
      break;
    }
  }
  myPremium = active;
  myPremiumPending =
    (r[4].data || []).find((p) => p.status === 'pending') || null;
  if (!selectedMockFilter && allTests.length)
    selectedMockFilter = allTests[0].id;
}
function isPremium() {
  return !!myPremium || isPremiumActive();
}
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
function getStatus(t) {
  if (isPremium())
    return {
      label: 'PREMIUM FREE',
      color: '#10b981',
      btn: 'Start ✓',
      ok: true,
      prem: true,
    };
  if (t.access_type === 'free')
    return { label: 'FREE', color: '#10b981', btn: 'Start', ok: true };
  const p = myPayments.find((x) => String(x.test_id) === String(t.id));
  if (p && p.status === 'approved')
    return { label: 'UNLOCKED', color: '#10b981', btn: 'Start', ok: true };
  if (p && p.status === 'pending')
    return {
      label: 'PENDING - Admin Approval nghah mek',
      color: '#f59e0b',
      btn: '⏳ Pending Approval',
      ok: false,
      pend: true,
    };
  return {
    label: 'PAID Rs.' + (t.price || 100),
    color: 'gold',
    btn: 'Buy Rs.' + (t.price || 100),
    ok: false,
  };
}
function getUserName(uid) {
  const u = allUsers.find((x) => x.id === uid);
  return u ? u.full_name || u.email : uid.slice(0, 6);
}
function getMockInfo(mid) {
  const m = allTests.find((x) => String(x.id) === String(mid));
  if (!m) return { title: 'Mock', subject: 'General' };
  return { title: m.title, subject: m.subject || 'General' };
}

function renderLogin() {
  document.querySelector(
    '#app'
  ).innerHTML = `<div style="min-height:100vh;background:linear-gradient(135deg,#0f172a,#334155);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui"><div style="background:white;border-radius:24px;padding:32px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.3)"><h1 style="text-align:center;margin:0">NEET Mock ${
    isPremium() ? '👑' : ''
  }</h1><p style="text-align:center;color:#666;font-size:12px">Mizoram • Forgot Password Ready</p><div style="display:flex;gap:8px;margin:16px 0;background:#f3f4f6;padding:4px;border-radius:12px"><button onclick="window.setMode('login')" style="flex:1;padding:10px;border:none;border-radius:8px;background:${
    authMode === 'login' ? 'white' : 'transparent'
  };font-weight:700;cursor:pointer">Login</button><button onclick="window.setMode('signup')" style="flex:1;padding:10px;border:none;border-radius:8px;background:${
    authMode === 'signup' ? 'white' : 'transparent'
  };font-weight:700;cursor:pointer">Signup</button></div><div id="formBox"></div><div style="text-align:center;margin-top:12px"><a href="#" onclick="window.showForgot()" style="color:#667eea;font-size:12px;font-weight:600;text-decoration:none">🔑 Forgot Password?</a></div></div></div>`;
  renderForm();
}
function renderForm() {
  const box = document.getElementById('formBox');
  if (!box) return;
  if (forgotMode) {
    box.innerHTML = `<div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:12px;padding:12px;margin-bottom:12px"><b style="font-size:13px">🔑 Forgot Password Recover</b><br><small style="font-size:11px;color:#92400e">Email ah reset link kan thawn ang</small></div><input id="email" placeholder="Email i register na" style="width:100%;padding:14px;border-radius:12px;border:2px solid #f59e0b;margin-bottom:12px;box-sizing:border-box"><button onclick="window.doForgot()" style="width:100%;padding:14px;border-radius:12px;border:none;background:#f59e0b;color:white;font-weight:800;cursor:pointer">📧 Send Reset Link</button><button onclick="window.hideForgot()" style="width:100%;padding:10px;border-radius:10px;border:none;background:#f3f4f6;margin-top:8px;cursor:pointer">← Back to Login</button><div id="forgotMsg" style="margin-top:10px;font-size:12px;text-align:center"></div>`;
    return;
  }
  if (authMode === 'login')
    box.innerHTML = `<input id="email" placeholder="Email" style="width:100%;padding:14px;border-radius:12px;border:1px solid #ddd;margin-bottom:10px;box-sizing:border-box"><input id="password" type="password" placeholder="Password" style="width:100%;padding:14px;border-radius:12px;border:1px solid #ddd;margin-bottom:16px;box-sizing:border-box"><button onclick="window.doLogin()" style="width:100%;padding:14px;border-radius:12px;border:none;background:#0f172a;color:white;font-weight:800;cursor:pointer">Login</button><div id="loginMsg" style="margin-top:8px;font-size:12px;text-align:center"></div>`;
  else
    box.innerHTML = `<input id="fname" placeholder="Full Name" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-bottom:8px;box-sizing:border-box"><input id="email" placeholder="Email" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-bottom:8px;box-sizing:border-box"><input id="phone" placeholder="Phone" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-bottom:8px;box-sizing:border-box"><input id="password" type="password" placeholder="Password (6+ chars)" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-bottom:12px;box-sizing:border-box"><button onclick="window.doSignup()" style="width:100%;padding:14px;border-radius:12px;border:none;background:#f59e0b;color:white;font-weight:800;cursor:pointer">Create Account</button>`;
}
function renderResetPassword() {
  document.querySelector(
    '#app'
  ).innerHTML = `<div style="min-height:100vh;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui"><div style="background:white;border-radius:24px;padding:32px;width:100%;max-width:400px;text-align:center"><h2>🔑 Set New Password</h2><p style="font-size:12px;color:#666">Password thar dah rawh</p><input id="newPass" type="password" placeholder="New Password" style="width:100%;padding:14px;border-radius:12px;border:2px solid #10b981;margin:16px 0;box-sizing:border-box"><input id="newPass2" type="password" placeholder="Confirm" style="width:100%;padding:14px;border-radius:12px;border:1px solid #ddd;margin-bottom:16px;box-sizing:border-box"><button onclick="window.doReset()" style="width:100%;padding:14px;border-radius:12px;border:none;background:#10b981;color:white;font-weight:800;cursor:pointer">✅ Update Password</button><div id="resetMsg" style="margin-top:10px;font-size:12px"></div></div></div>`;
}
window.setMode = function (m) {
  authMode = m;
  forgotMode = false;
  renderLogin();
};
window.showForgot = function () {
  forgotMode = true;
  renderForm();
};
window.hideForgot = function () {
  forgotMode = false;
  authMode = 'login';
  renderLogin();
};
window.doForgot = async function () {
  const email = (document.getElementById('email')?.value || '').trim();
  if (!email) return alert('Email dah rawh');
  const msg = document.getElementById('forgotMsg');
  if (msg) msg.innerHTML = '⏳ Sending...';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) {
    if (msg)
      msg.innerHTML = '<span style="color:red">❌ ' + error.message + '</span>';
  } else {
    if (msg)
      msg.innerHTML = '<span style="color:green">✅ Reset link thawn e!</span>';
  }
};
window.doReset = async function () {
  const p1 = (document.getElementById('newPass')?.value || '').trim();
  const p2 = (document.getElementById('newPass2')?.value || '').trim();
  const msg = document.getElementById('resetMsg');
  if (p1.length < 6) {
    if (msg) msg.innerHTML = '<span style="color:red">6+ chars</span>';
    return;
  }
  if (p1 !== p2) {
    if (msg) msg.innerHTML = '<span style="color:red">Inmil lo</span>';
    return;
  }
  if (msg) msg.innerHTML = '⏳ Updating...';
  const { error } = await supabase.auth.updateUser({ password: p1 });
  if (error) {
    if (msg)
      msg.innerHTML = '<span style="color:red">❌ ' + error.message + '</span>';
  } else {
    if (msg) msg.innerHTML = '<span style="color:green">✅ Done!</span>';
    setTimeout(() => {
      window.location.hash = '';
      location.reload();
    }, 2000);
  }
};
window.doLogin = async function () {
  const e = document.getElementById('email').value;
  const p = document.getElementById('password').value;
  const d = await supabase.auth.signInWithPassword({ email: e, password: p });
  if (d.error) {
    const m = document.getElementById('loginMsg');
    if (m)
      m.innerHTML = '<span style="color:red">' + d.error.message + '</span>';
    return;
  }
  currentUser = d.data.user;
  await loadAll();
  renderDashboard();
};
window.doSignup = async function () {
  const e = document.getElementById('email').value;
  const p = document.getElementById('password').value;
  const n = document.getElementById('fname').value;
  const ph = document.getElementById('phone').value;
  if (!e || !p || !n) return alert('Fill kim rawh');
  const d = await supabase.auth.signUp({
    email: e,
    password: p,
    options: { data: { full_name: n, phone: ph } },
  });
  if (d.error) return alert(d.error.message);
  if (d.data.user) {
    await supabase.from('profiles').insert({
      id: d.data.user.id,
      full_name: n,
      phone: ph,
      email: e,
      last_seen: new Date().toISOString(),
      is_online: true,
    });
    alert('Account siam e!');
    authMode = 'login';
    renderLogin();
  }
};
window.setDashTab = function (t) {
  if (t !== 'videos') selectedVideo = null;
  dashTab = t;
  renderDashboard();
};
window.logout = async function () {
  try {
    if (currentUser)
      await supabase
        .from('profiles')
        .update({ is_online: false })
        .eq('id', currentUser.id);
  } catch (e) {}
  if (onlineInterval) clearInterval(onlineInterval);
  clearTimers();
  await supabase.auth.signOut();
  location.reload();
};
window.setLeaderboardMock = function (id) {
  selectedMockFilter = id;
  renderDashboard();
  window.setDashTab('leaderboard');
};
window.playVideo = function (id) {
  if (!isPremium()) {
    alert('🔒 Premium Only! Premium lei phawt rawh!');
    return window.setDashTab('premium');
  }
  selectedVideo = allVideos.find((v) => String(v.id) === String(id));
  renderDashboard();
};
window.closeVideo = function () {
  selectedVideo = null;
  renderDashboard();
};
window.toggleNoti = function () {
  showNotiPanel = !showNotiPanel;
  renderDashboard();
};

function renderDashboard() {
  const free = allTests.filter((t) => t.access_type === 'free');
  const paid = allTests.filter((t) => t.access_type === 'paid');
  const avg = myAttempts.length
    ? Math.round(
        myAttempts.reduce((s, a) => s + (a.score || 0), 0) / myAttempts.length
      )
    : 0;
  const bestScore = myAttempts.length
    ? Math.max(...myAttempts.map((a) => a.score || 0))
    : 0;
  const totalQAttempted = myAttempts.reduce((s, a) => s + (a.total || 0), 0);
  const totalCorrect = myAttempts.reduce((s, a) => s + (a.correct || 0), 0);
  const premActive = isPremium();
  let pendingBanner = '';
  if (myPremiumPending) {
    pendingBanner += `<div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:12px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center"><div><b style="color:#92400e">⏳ Premium Pending</b><br><small style="font-size:11px">Rs.${
      myPremiumPending.amount
    } - Txn: ${esc(
      myPremiumPending.txn_id
    )} - Admin approval nghah mek a ni</small></div><span style="background:#f59e0b;color:white;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800">PENDING</span></div>`;
  }
  const pendingPaidCount = myPayments.filter(
    (p) => p.status === 'pending'
  ).length;
  if (pendingPaidCount > 0) {
    pendingBanner += `<div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:12px;padding:12px;margin-bottom:12px"><b style="color:#92400e;font-size:12px">⏳ Paid Tests Pending: ${pendingPaidCount}</b><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${myPayments
      .filter((p) => p.status === 'pending')
      .map((p) => {
        const inf = getMockInfo(p.test_id);
        return `<span style="background:white;border:1px solid #f59e0b;padding:4px 8px;border-radius:20px;font-size:10px">⏳ ${esc(
          inf.title
        )} - Rs.${p.amount}</span>`;
      })
      .join('')}</div></div>`;
  }

  const dashStats = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;border-radius:20px;padding:16px;position:relative;overflow:hidden"><div style="position:absolute;right:-10px;top:-10px;font-size:60px;opacity:0.2">📝</div><div style="font-size:11px;opacity:0.8">TOTAL TESTS</div><div style="font-size:28px;font-weight:900;margin-top:4px">${
        myAttempts.length
      }</div><div style="font-size:10px;margin-top:6px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 8px;border-radius:20px">${
    allTests.length
  } Available</div></div>
      <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:20px;padding:16px;position:relative;overflow:hidden"><div style="position:absolute;right:-10px;top:-10px;font-size:60px;opacity:0.2">⭐</div><div style="font-size:11px;opacity:0.8">AVG SCORE</div><div style="font-size:28px;font-weight:900;margin-top:4px">${avg}%</div><div style="font-size:10px;margin-top:6px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 8px;border-radius:20px">Best ${bestScore}%</div></div>
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border-radius:20px;padding:16px;position:relative;overflow:hidden"><div style="position:absolute;right:-10px;top:-10px;font-size:60px;opacity:0.2">✅</div><div style="font-size:11px;opacity:0.8">CORRECT</div><div style="font-size:28px;font-weight:900;margin-top:4px">${totalCorrect}/${totalQAttempted}</div><div style="font-size:10px;margin-top:6px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 8px;border-radius:20px">${
    totalQAttempted ? Math.round((totalCorrect / totalQAttempted) * 100) : 0
  }% Accuracy</div></div>
      <div style="background:linear-gradient(135deg,#0f172a,#334155);color:white;border-radius:20px;padding:16px;position:relative;overflow:hidden"><div style="position:absolute;right:-10px;top:-10px;font-size:60px;opacity:0.2">🏆</div><div style="font-size:11px;opacity:0.8">PREMIUM</div><div style="font-size:16px;font-weight:900;margin-top:8px">${
        premActive ? '👑 ACTIVE' : '🔒 INACTIVE'
      }</div><div style="font-size:10px;margin-top:6px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 8px;border-radius:20px">${
    allVideos.length
  } Videos • ${allNotis.length} Noti</div></div>
    </div>`;

  const notiPanelHtml = `
    <div id="notiPanel" style="background:white;border-radius:20px;padding:0;margin-bottom:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);display:${
      dashTab === 'dashboard' || dashTab === 'tests' || showNotiPanel
        ? 'block'
        : 'none'
    }">
      <div style="background:linear-gradient(135deg,#0f172a,#334155);color:white;padding:14px 18px;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">🔔</span><b>Notifications</b><span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:20px;font-size:10px;margin-left:6px">${
        allNotis.length
      } NEW</span></div><span style="font-size:11px;opacity:0.7">Admin atanga thawn</span></div>
      <div style="max-height:280px;overflow-y:auto;padding:8px">
        ${
          allNotis.length
            ? allNotis
                .map(
                  (n) =>
                    `<div style="padding:12px;border-radius:14px;margin-bottom:8px;background:#f8fafc;border-left:4px solid #667eea;display:flex;gap:10px"><div style="width:36px;height:36px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;flex-shrink:0">📢</div><div style="flex:1"><b style="font-size:13px">${esc(
                      n.title
                    )}</b><div style="font-size:12px;color:#475569;margin-top:2px;line-height:1.4">${esc(
                      n.message
                    )}</div><small style="font-size:10px;color:#94a3b8">${new Date(
                      n.created_at
                    ).toLocaleString()}</small></div></div>`
                )
                .join('')
            : `<div style="text-align:center;padding:24px;color:#94a3b8"><div style="font-size:32px">🔕</div><div style="font-size:13px;margin-top:6px">Notification la awm lo - Admin in a rawn thawn ang!</div></div>`
        }
      </div>
    </div>`;

  let freeHtml = '';
  free.forEach((t) => {
    const s = getStatus(t);
    const hasTimer =
      (t.per_question_seconds || 0) > 0 || (t.total_seconds || 0) > 0;
    const locked = isTestLocked(t);
    freeHtml += `<div style="background:white;border-radius:16px;padding:16px;border:1px solid ${
      locked ? '#8b5cf6' : '#eee'
    };border-left:4px solid ${locked ? '#8b5cf6' : s.color};${
      locked ? 'background:#f5f3ff' : ''
    }"><b>${esc(
      t.title
    )}</b> <small style="background:#eef2ff;color:#667eea;padding:2px 6px;border-radius:8px">${esc(
      t.subject || ''
    )}</small>${
      hasTimer
        ? `<br><small style="color:#f59e0b">⏱️ Q:${
            t.per_question_seconds || 0
          }s Full:${
            t.total_seconds ? formatSec(t.total_seconds) : 'Off'
          }</small>`
        : ''
    }${
      t.is_scheduled
        ? `<br><small style="background:#ede9fe;color:#6d28d9;padding:3px 8px;border-radius:20px;font-weight:800">${
            locked ? '📅 ' + getLockTime(t) + ' LOCKED' : '🟢 LIVE'
          }</small>`
        : ''
    }<div style="font-size:11px;color:#666">${
      t.questions ? t.questions.length : 0
    } Qs</div><button onclick="${
      locked
        ? `alert('📅 ${getLockTime(t)} ah hawng ang!')`
        : `window.startTest('${t.id}')`
    }" style="width:100%;margin-top:8px;padding:10px;border:none;border-radius:10px;background:${
      locked ? '#8b5cf6' : '#111'
    };color:white;font-weight:700">${
      locked ? '🔒 ' + getLockTime(t) : 'Start'
    }</button></div>`;
  });
  let paidHtml = '';
  paid.forEach((t) => {
    const s = getStatus(t);
    const isPend = s.pend;
    const hasTimer =
      (t.per_question_seconds || 0) > 0 || (t.total_seconds || 0) > 0;
    const locked = isTestLocked(t);
    paidHtml += `<div style="background:white;border-radius:16px;padding:16px;border:1px solid ${
      isPend ? '#f59e0b' : locked ? '#8b5cf6' : '#eee'
    };border-left:4px solid ${
      s.prem ? '#10b981' : isPend ? '#f59e0b' : locked ? '#8b5cf6' : 'gold'
    };${
      isPend ? 'background:#fffbeb' : locked ? 'background:#f5f3ff' : ''
    }"><div style="display:flex;justify-content:space-between"><b>${esc(
      t.title
    )}</b>${
      isPend
        ? '<span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:900">⏳ PENDING</span>'
        : locked
        ? '<span style="background:#8b5cf6;color:white;padding:2px 8px;border-radius:20px;font-size:9px">📅 LOCKED</span>'
        : ''
    }</div><small style="background:#fffbeb;padding:2px 6px;border-radius:8px">${esc(
      t.subject || ''
    )}</small>${
      hasTimer
        ? `<small style="margin-left:6px;color:#3b82f6">⏱️ ${
            t.per_question_seconds ? t.per_question_seconds + 's/Q' : ''
          } ${
            t.total_seconds ? formatSec(t.total_seconds) + ' total' : ''
          }</small>`
        : ''
    }${
      t.is_scheduled
        ? `<br><small style="background:#ede9fe;color:#6d28d9;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:800">${
            locked ? '🔒 ' + getLockTime(t) : '✅ LIVE NOW'
          }</small>`
        : ''
    }<div style="font-size:11px;color:${isPend ? '#92400e' : '#666'}">${
      t.questions ? t.questions.length : 0
    } Qs - ${esc(s.label)}</div>${
      isPend
        ? `<div style="font-size:10px;color:#92400e;margin-top:4px">Admin in screenshot a check mek</div>`
        : locked
        ? `<div style="font-size:10px;color:#6d28d9;margin-top:4px">📅 ${getLockTime(
            t
          )} ah hawng ang!</div>`
        : ''
    }<button onclick="${
      locked
        ? `alert('📅 ${getLockTime(t)} ah hawng ang!')`
        : s.ok
        ? `window.startTest('${t.id}')`
        : isPend
        ? `alert('Admin approval nghah mek')`
        : `window.buyTest('${t.id}')`
    }" style="width:100%;margin-top:8px;padding:10px;border:none;border-radius:10px;background:${
      locked
        ? '#8b5cf6'
        : s.prem
        ? '#10b981'
        : s.ok
        ? '#10b981'
        : isPend
        ? '#f59e0b'
        : 'gold'
    };color:${isPend || locked ? 'white' : '#111'};font-weight:800">${
      locked ? '🔒 ' + getLockTime(t) : s.btn
    }</button></div>`;
  });
  let mockOptions = '';
  allTests.forEach((t) => {
    mockOptions += `<option value="${t.id}" ${
      String(selectedMockFilter) === String(t.id) ? 'selected' : ''
    }>${esc(t.title)} - ${esc(t.subject || 'General')}</option>`;
  });
  const filtered = leaderboard
    .filter((a) => String(a.test_id) === String(selectedMockFilter))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 20);
  const selInfo = getMockInfo(selectedMockFilter);
  let tableRows = '';
  if (filtered.length === 0) {
    tableRows =
      '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999">No attempts for this mock yet</td></tr>';
  } else {
    filtered.forEach((a, i) => {
      const rank = i + 1;
      let rankColor = '#eee';
      if (rank === 1) rankColor = 'gold';
      else if (rank === 2) rankColor = '#c0c0c0';
      else if (rank === 3) rankColor = '#cd7f32';
      tableRows += `<tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px;text-align:center"><div style="width:28px;height:28px;border-radius:50%;background:${rankColor};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:12px">${rank}</div></td><td style="padding:10px;font-weight:700">${esc(
        getUserName(a.user_id)
      )}</td><td style="padding:10px"><b>${esc(
        selInfo.title
      )}</b></td><td style="padding:10px"><span style="background:#eef2ff;color:#667eea;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">${esc(
        selInfo.subject
      )}</span></td><td style="padding:10px;text-align:center"><span style="background:#111;color:white;padding:6px 14px;border-radius:20px;font-weight:900">${
        a.score
      }%</span></td></tr>`;
    });
  }

  let videoHtml = '';
  if (selectedVideo) {
    videoHtml = `<div style="background:white;border-radius:20px;padding:16px;border:2px solid #f59e0b"><button onclick="window.closeVideo()" style="padding:8px 14px;border:none;border-radius:10px;background:#f3f4f6;font-weight:700;margin-bottom:12px">← Back to Videos</button><h3 style="margin:8px 0">${esc(
      selectedVideo.title
    )} <span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:20px;font-size:10px">PREMIUM</span></h3><div style="background:black;border-radius:16px;overflow:hidden;aspect-ratio:16/9"><video controls controlsList="nodownload" style="width:100%;height:100%" src="${
      selectedVideo.video_url
    }"></video></div><p style="font-size:13px;color:#64748b;margin-top:10px">${esc(
      selectedVideo.description || ''
    )}</p><div style="display:flex;gap:6px;margin-top:8px"><span style="background:#fffbeb;border:1px solid #f59e0b;padding:4px 10px;border-radius:20px;font-size:11px">📚 ${esc(
      selectedVideo.subject
    )}</span><span style="background:#f0fdf4;border:1px solid #10b981;padding:4px 10px;border-radius:20px;font-size:11px">🔒 Premium Only - 1GB MP4 Direct</span></div></div>`;
  } else {
    if (!premActive) {
      videoHtml = `<div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #f59e0b;border-radius:20px;padding:24px;text-align:center"><div style="font-size:48px">🔒</div><h2 style="margin:8px 0">Video Coaching - Premium Only</h2><p style="font-size:13px;color:#92400e">He video zawng zawng hi Premium tan chauh a ni. Admin atanga MP4 direct upload - YouTube ngai lo! 1GB thleng quality tha!</p><div style="background:white;border-radius:12px;padding:12px;margin:12px 0;text-align:left"><b>📹 ${
        allVideos.length
      } Videos Available:</b><br>${
        allVideos
          .slice(0, 3)
          .map((v) => `• ${esc(v.title)} - ${esc(v.subject)}`)
          .join('<br>') || '• Video la awm lo'
      }${
        allVideos.length > 3
          ? `<br><small>+ ${allVideos.length - 3} more...</small>`
          : ''
      }</div><button onclick="window.setDashTab('premium')" style="padding:12px 24px;background:#f59e0b;color:white;border:none;border-radius:12px;font-weight:900;width:100%">👑 Buy Premium to Watch - Rs.${
        premiumPlans[0]?.price || 199
      }</button></div>`;
    } else {
      videoHtml = `<div style="display:grid;gap:10px">${
        allVideos
          .map(
            (v) =>
              `<div onclick="window.playVideo('${
                v.id
              }')" style="background:white;border-radius:16px;padding:12px;display:flex;gap:12px;cursor:pointer;border:1px solid #f59e0b;border-left:4px solid #f59e0b"><div style="width:110px;height:64px;background:#0f172a;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-size:24px">▶️</div><div style="flex:1"><b style="font-size:14px">${esc(
                v.title
              )}</b><br><small style="color:#64748b">${esc(v.subject)} • ${esc(
                (v.description || '').slice(0, 40)
              )}...</small><br><span style="font-size:10px;background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:10px">🔒 PREMIUM • MP4 • 1GB</span></div><div style="display:flex;align-items:center;font-size:18px">▶️</div></div>`
          )
          .join('') ||
        '<div style="text-align:center;padding:30px;color:#999">Video la awm lo - Admin in a rawn upload ang</div>'
      }</div>`;
    }
  }

  document.querySelector('#app').innerHTML =
    `<div style="min-height:100vh;background:#f6f7fb;font-family:system-ui"><div style="background:${
      premActive ? 'linear-gradient(135deg,#10b981,#059669)' : 'white'
    };padding:12px 20px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:10;border-bottom:1px solid #eee;flex-wrap:wrap;gap:8px"><div><b>NEET Mock ${
      premActive ? 'PREMIUM' : myPremiumPending ? '⏳ PENDING' : ''
    }</b><br><small>Avg ${avg}% • 🟢 Online ${
      myPremiumPending ? '• 1 Pending' : ''
    } ${pendingPaidCount ? `• ${pendingPaidCount} Tests Pending` : ''} • 🔔 ${
      allNotis.length
    }</small></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button onclick="window.toggleNoti()" style="position:relative;padding:8px 12px;border-radius:20px;border:1px solid #f59e0b;background:#fffbeb;color:#92400e;font-weight:800;font-size:12px">🔔 ${
      allNotis.length
        ? `<span style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:white;width:18px;height:18px;border-radius:50%;font-size:10px;display:flex;align-items:center;justify-content:center">${allNotis.length}</span>`
        : ''
    } Noti</button><button onclick="window.setDashTab('dashboard')" style="padding:8px 12px;border-radius:20px;border:none;background:${
      dashTab === 'dashboard' ? '#0f172a' : '#f3f4f6'
    };color:${
      dashTab === 'dashboard' ? 'white' : '#111'
    };font-weight:700;font-size:12px">📊 Dash</button><button onclick="window.setDashTab('tests')" style="padding:8px 12px;border-radius:20px;border:none;background:${
      dashTab === 'tests' ? '#111' : '#f3f4f6'
    };color:${
      dashTab === 'tests' ? 'white' : '#111'
    };font-weight:700;font-size:12px">Tests ${
      pendingPaidCount ? `(${pendingPaidCount} ⏳)` : ''
    }</button><button onclick="window.setDashTab('videos')" style="padding:8px 12px;border-radius:20px;border:none;background:${
      dashTab === 'videos' ? '#f59e0b' : '#fffbeb'
    };color:${
      dashTab === 'videos' ? 'white' : '#92400e'
    };font-weight:800;font-size:12px;border:1px solid #f59e0b">🎥 Videos ${
      !premActive ? '🔒' : ''
    } (${
      allVideos.length
    })</button><button onclick="window.setDashTab('premium')" style="padding:8px 12px;border-radius:20px;border:none;background:${
      myPremiumPending ? '#f59e0b' : '#f59e0b'
    };color:white;font-weight:700;font-size:12px">Premium ${
      myPremiumPending ? '⏳' : ''
    }</button><button onclick="window.setDashTab('results')" style="padding:8px 12px;border-radius:20px;border:none;background:${
      dashTab === 'results' ? '#111' : '#f3f4f6'
    };color:${
      dashTab === 'results' ? 'white' : '#111'
    };font-size:12px">Results</button><button onclick="window.setDashTab('leaderboard')" style="padding:8px 12px;border-radius:20px;border:none;background:${
      dashTab === 'leaderboard' ? '#111' : '#f3f4f6'
    };color:${
      dashTab === 'leaderboard' ? 'white' : '#111'
    };font-size:12px">Board</button><button onclick="window.logout()" style="padding:8px 12px;border-radius:20px;border:1px solid #ddd;background:white;font-size:12px">Logout</button></div></div><div style="max-width:1000px;margin:0 auto;padding:16px">${pendingBanner}` +
    (dashTab === 'dashboard'
      ? `<div>${notiPanelHtml}${dashStats}<h3 style="margin:16px 0 12px;display:flex;justify-content:space-between">📚 Recent Tests <button onclick="window.setDashTab('tests')" style="font-size:11px;padding:6px 12px;border-radius:20px;border:1px solid #e2e8f0;background:white">View All →</button></h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">${free
          .slice(0, 2)
          .map(
            (t) =>
              `<div style="background:white;border-radius:16px;padding:14px;border:1px solid #e2e8f0"><b>${esc(
                t.title
              )}</b><br><small>${esc(
                t.subject
              )}</small><br><button onclick="window.startTest('${
                t.id
              }')" style="margin-top:8px;padding:8px 12px;border:none;border-radius:10px;background:#111;color:white;font-weight:700;width:100%">Start</button></div>`
          )
          .join('')}${paid
          .slice(0, 2)
          .map(
            (t) =>
              `<div style="background:white;border-radius:16px;padding:14px;border:1px solid #e2e8f0"><b>${esc(
                t.title
              )}</b> - ${
                getStatus(t).label
              }<br><button onclick="window.startTest('${
                t.id
              }')" style="margin-top:8px;padding:8px 12px;border:none;border-radius:10px;background:gold;font-weight:700;width:100%">${
                getStatus(t).btn
              }</button></div>`
          )
          .join(
            ''
          )}</div><div style="margin-top:20px;background:white;border-radius:20px;padding:16px;border:1px solid #e2e8f0"><h3 style="margin:0 0 12px">📈 Recent Results</h3>${
          myAttempts
            .slice(0, 5)
            .map(
              (a) =>
                `<div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #f1f5f9"><div><b>${esc(
                  getMockInfo(a.test_id).title
                )}</b> <small>${new Date(
                  a.created_at
                ).toLocaleDateString()}</small></div><span style="background:#111;color:white;padding:4px 10px;border-radius:20px;font-weight:800;font-size:12px">${
                  a.score
                }%</span></div>`
            )
            .join('') || '<div style="color:#999">No results yet</div>'
        }</div></div>`
      : '') +
    (dashTab === 'tests'
      ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">${notiPanelHtml}<div style="grid-column:1/-1"><h2 style="margin:0 0 12px">📚 All Tests - ${
          allTests.length
        }</h2></div>${freeHtml + paidHtml}</div>`
      : '') +
    (dashTab === 'videos'
      ? `<h2 style="display:flex;justify-content:space-between;align-items:center">🎥 Video Coaching <span style="font-size:12px;background:${
          premActive ? '#10b981' : '#f59e0b'
        };color:white;padding:4px 10px;border-radius:20px">${
          premActive ? 'PREMIUM ACTIVE ✓' : '🔒 PREMIUM ONLY'
        }</span></h2>${videoHtml}`
      : '') +
    (dashTab === 'premium'
      ? `<h2>Premium ${
          myPremiumPending
            ? '<span style="background:#f59e0b;color:white;padding:4px 10px;border-radius:20px;font-size:11px">⏳ 1 Pending - Admin Approval nghah mek</span>'
            : ''
        }</h2>${
          myPremiumPending
            ? `<div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:16px;padding:16px;margin-bottom:12px"><b style="color:#92400e">⏳ Premium Payment Pending</b><div style="font-size:12px;margin-top:6px">Plan: ${
                premiumPlans.find((p) => p.id === myPremiumPending.plan_id)
                  ?.name || ''
              } - Rs.${myPremiumPending.amount}<br>Txn: ${esc(
                myPremiumPending.txn_id
              )}<br>Status: <span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:20px;font-size:10px">PENDING APPROVAL</span><br><small>Screenshot admin in a check mek - approve hunah premium active ang</small></div></div>`
            : ''
        }<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">${premiumPlans
          .map(
            (pl) =>
              `<div style="background:white;border-radius:16px;padding:16px;border:1px solid #eee"><b>${pl.name}</b><div style="font-size:24px;font-weight:900">Rs.${pl.price}</div><button onclick="window.buyPremium(${pl.id})" style="width:100%;padding:10px;background:#f59e0b;color:white;border:none;border-radius:10px;font-weight:800;margin-top:8px">Buy</button></div>`
          )
          .join(
            ''
          )}</div><h3 style="margin-top:20px">My Premium Payments History</h3><div style="background:white;border-radius:16px;padding:12px">${
          myAllPremiumPayments
            .map((p) => {
              const pl = premiumPlans.find((x) => x.id === p.plan_id);
              return `<div style="padding:10px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center"><div><b>${
                pl?.name || 'Premium'
              }</b> - Rs.${p.amount}<br><small>Txn: ${esc(
                p.txn_id
              )} • ${new Date(
                p.created_at
              ).toLocaleDateString()}</small></div><span style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800;background:${
                p.status === 'approved'
                  ? '#10b981'
                  : p.status === 'pending'
                  ? '#f59e0b'
                  : '#ef4444'
              };color:white">${p.status.toUpperCase()}</span></div>`;
            })
            .join('') || '<div style="color:#999">No premium payments yet</div>'
        }</div>`
      : '') +
    (dashTab === 'results'
      ? `<h2>Results - Paid ah Wrong Questions i hmu thei</h2><div style="background:white;border-radius:16px;padding:16px">${
          myAttempts.length
            ? myAttempts
                .map((a) => {
                  const inf = getMockInfo(a.test_id);
                  const t = allTests.find(
                    (x) => String(x.id) === String(a.test_id)
                  );
                  const canView = t
                    ? t.access_type === 'free' ||
                      getStatus(t).ok ||
                      getStatus(t).prem ||
                      isPremium()
                    : true;
                  return `<div style="padding:12px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;gap:10px"><div><b>${esc(
                    inf.title
                  )}</b> <small style="background:#eef2ff;padding:2px 6px;border-radius:8px">${esc(
                    inf.subject
                  )}</small> ${
                    t && t.access_type === 'paid'
                      ? '<small style="background:#fffbeb;padding:2px 6px;border-radius:8px;border:1px solid gold">PAID</small>'
                      : ''
                  }<br><small>${new Date(
                    a.created_at
                  ).toLocaleDateString()} • ${a.correct}/${
                    a.total
                  } correct</small></div><div style="display:flex;gap:6px;align-items:center"><div style="background:#111;color:white;padding:6px 12px;border-radius:20px;font-weight:800">${
                    a.score
                  }%</div>${
                    canView
                      ? `<button onclick="window.viewAttempt('${a.id}')" style="padding:6px 12px;border-radius:20px;border:none;background:#ef4444;color:white;font-size:11px;font-weight:800;cursor:pointer">View Wrong</button>`
                      : `<button onclick="window.buyTest('${a.test_id}')" style="padding:6px 10px;border-radius:20px;border:none;background:gold;font-size:11px;font-weight:800">Buy to View</button>`
                  }</div></div>`;
                })
                .join('')
            : '<div style="text-align:center;padding:20px;color:#999">No results yet</div>'
        }</div>`
      : '') +
    (dashTab === 'leaderboard'
      ? `<div style="background:white;border-radius:16px;padding:16px;border:1px solid #eee"><h2 style="margin:0 0 12px">🏆 Leaderboard</h2><div style="margin-bottom:12px"><label style="font-size:12px;font-weight:700">Select Mock Test:</label><br><select onchange="window.setLeaderboardMock(this.value)" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-weight:700"><option value="">-- Select Mock --</option>${mockOptions}</select></div><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;font-size:13px"><thead><tr style="background:#0f172a;color:white"><th style="padding:12px;text-align:center">Rank</th><th style="padding:12px;text-align:left">Name</th><th style="padding:12px;text-align:left">Mock Test Name</th><th style="padding:12px;text-align:left">Subject Name</th><th style="padding:12px;text-align:center">Score</th></tr></thead><tbody>${tableRows}</tbody></table></div></div>`
      : '') +
    `</div></div>`;
}
window.startTest = function (id) {
  currentTest = allTests.find((t) => String(t.id) === String(id));
  if (!currentTest) return;
  if (isTestLocked(currentTest)) {
    return alert(
      `📅 He test hi ${getLockTime(
        currentTest
      )} ah chiah a hawng ang! Calendar Schedule Set a ni!`
    );
  }
  const s = getStatus(currentTest);
  if (!s.ok) {
    if (s.pend)
      return alert(
        '⏳ Pending - Admin approval nghah mek a ni! Txn ID: ' +
          (myPayments.find((x) => String(x.test_id) === String(id))?.txn_id ||
            '')
      );
    return window.buyTest(id);
  }
  currentQs = currentTest.questions || [];
  userAnswers = {};
  currentQIdx = 0;
  clearTimers();
  perQLeft = currentTest.per_question_seconds || 0;
  totalLeft = currentTest.total_seconds || 0;
  renderTest();
  if (perQLeft > 0) {
    perQInterval = setInterval(() => {
      perQLeft--;
      const el = document.getElementById('perQTimer');
      if (el) {
        el.textContent = perQLeft + 's';
        el.style.color = perQLeft < 10 ? 'red' : '#92400e';
      }
      if (perQLeft <= 0) {
        if (currentQIdx < currentQs.length - 1) {
          currentQIdx++;
          perQLeft = currentTest.per_question_seconds;
          renderTest();
        } else {
          window.submitTest();
        }
      }
    }, 1000);
  }
  if (totalLeft > 0) {
    totalInterval = setInterval(() => {
      totalLeft--;
      const el = document.getElementById('totalTimer');
      if (el) {
        el.textContent = formatSec(totalLeft);
        el.style.color = totalLeft < 60 ? 'red' : '#1e40af';
      }
      if (totalLeft <= 0) {
        alert('⏰ Time Up! Auto Submit');
        window.submitTest();
      }
    }, 1000);
  }
  updateOnline();
};
function renderTest() {
  const perQEnabled = (currentTest.per_question_seconds || 0) > 0;
  const totalEnabled = (currentTest.total_seconds || 0) > 0;
  let timerBar = '';
  if (perQEnabled || totalEnabled) {
    timerBar = `<div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:58px;z-index:9">
      ${
        perQEnabled
          ? `<div><b style="font-size:12px">⏱️ Q${
              currentQIdx + 1
            } Timer:</b> <span id="perQTimer" style="font-weight:900;font-size:18px;color:${
              perQLeft < 10 ? 'red' : '#92400e'
            }">${perQLeft}s</span></div>`
          : ''
      }
      ${
        totalEnabled
          ? `<div><b style="font-size:12px">⏱️ Total:</b> <span id="totalTimer" style="font-weight:900;font-size:18px;color:${
              totalLeft < 60 ? 'red' : '#1e40af'
            }">${formatSec(totalLeft)}</span></div>`
          : ''
      }
      <div style="font-size:10px;color:#666">Q ${currentQIdx + 1}/${
      currentQs.length
    }</div>
    </div>`;
  }

  let html = '';
  if (perQEnabled) {
    const q = currentQs[currentQIdx];
    if (!q) return;
    let opts = '';
    ['A', 'B', 'C', 'D'].forEach((o) => {
      opts += `<label style="padding:12px;border:2px solid ${
        userAnswers[currentQIdx] === o ? '#10b981' : '#eee'
      };border-radius:12px;display:flex;gap:8px;background:${
        userAnswers[currentQIdx] === o ? '#ecfdf5' : 'white'
      };margin-bottom:8px;cursor:pointer"><input type="radio" name="q${currentQIdx}" value="${o}" ${
        userAnswers[currentQIdx] === o ? 'checked' : ''
      } onchange="window.selectAns(${currentQIdx},'${o}')"> ${o}. ${esc(
        q[o.toLowerCase()] || ''
      )}</label>`;
    });
    html = `<div style="background:white;border-radius:16px;padding:20px"><b style="font-size:16px">Q${
      currentQIdx + 1
    }. ${esc(q.q)}</b><div style="margin-top:14px">${opts}</div>
    <div style="display:flex;gap:8px;margin-top:16px">
      ${
        currentQIdx > 0
          ? `<button onclick="window.prevQ()" style="flex:1;padding:12px;border-radius:12px;border:1px solid #ddd;background:white;font-weight:700">← Prev</button>`
          : ''
      }
      ${
        currentQIdx < currentQs.length - 1
          ? `<button onclick="window.nextQ()" style="flex:1;padding:12px;border-radius:12px;border:none;background:#111;color:white;font-weight:800">Next →</button>`
          : `<button onclick="window.submitTest()" style="flex:1;padding:12px;border-radius:12px;border:none;background:#10b981;color:white;font-weight:800">Submit</button>`
      }
    </div></div>`;
  } else {
    currentQs.forEach((q, i) => {
      let opts = '';
      ['A', 'B', 'C', 'D'].forEach((o) => {
        opts += `<label style="padding:10px;border:2px solid ${
          userAnswers[i] === o ? '#111' : '#eee'
        };border-radius:10px;display:flex;gap:8px;background:${
          userAnswers[i] === o ? '#eef2ff' : 'white'
        };margin-bottom:6px"><input type="radio" name="q${i}" value="${o}" ${
          userAnswers[i] === o ? 'checked' : ''
        } onchange="window.selectAns(${i},'${o}')"> ${o}. ${esc(
          q[o.toLowerCase()] || ''
        )}</label>`;
      });
      html += `<div style="background:white;border-radius:16px;padding:16px;margin-bottom:10px"><b>Q${
        i + 1
      }. ${esc(q.q)}</b><div style="margin-top:10px">${opts}</div></div>`;
    });
  }

  document.querySelector(
    '#app'
  ).innerHTML = `<div style="min-height:100vh;background:#f6f7fb"><div style="background:white;padding:12px 20px;display:flex;justify-content:space-between;position:sticky;top:0;border-bottom:1px solid #eee;z-index:10"><b>${esc(
    currentTest.title
  )} • ${esc(currentTest.subject || '')} ${
    perQEnabled ? `(⏱️ ${currentTest.per_question_seconds}s/Q)` : ''
  } ${
    totalEnabled ? `(Total ${formatSec(currentTest.total_seconds)})` : ''
  }</b><div style="display:flex;gap:8px"><button onclick="window.cancelTest()" style="padding:8px 12px;border-radius:20px;border:1px solid #ddd;background:white">Cancel</button>${
    !perQEnabled
      ? `<button onclick="window.submitTest()" style="padding:8px 16px;background:#10b981;color:white;border:none;border-radius:20px">Submit</button>`
      : ''
  }</div></div><div style="max-width:700px;margin:0 auto;padding:20px">${timerBar}${html}${
    !perQEnabled
      ? `<button onclick="window.submitTest()" style="width:100%;padding:14px;background:#111;color:white;border:none;border-radius:12px;font-weight:800;margin-top:10px">Submit</button>`
      : ''
  }</div></div>`;
}
window.nextQ = function () {
  if (currentQIdx < currentQs.length - 1) {
    currentQIdx++;
    if (currentTest.per_question_seconds)
      perQLeft = currentTest.per_question_seconds;
    renderTest();
  }
};
window.prevQ = function () {
  if (currentQIdx > 0) {
    currentQIdx--;
    if (currentTest.per_question_seconds)
      perQLeft = currentTest.per_question_seconds;
    renderTest();
  }
};
window.cancelTest = function () {
  if (!confirm('Cancel test? Progress a bo ang')) return;
  clearTimers();
  renderDashboard();
};
window.selectAns = function (i, o) {
  userAnswers[i] = o;
};
window.submitTest = async function () {
  clearTimers();
  let c = 0;
  currentQs.forEach((q, i) => {
    if (userAnswers[i] === q.ans) c++;
  });
  const score = currentQs.length ? Math.round((c / currentQs.length) * 100) : 0;
  await supabase.from('test_attempts').insert({
    user_id: currentUser.id,
    test_id: currentTest.id,
    score: score,
    total: currentQs.length,
    correct: c,
    answers: userAnswers,
  });
  await supabase
    .from('profiles')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', currentUser.id);
  await loadAll();
  renderDashboard();
  window.setDashTab('results');
};
window.buyTest = function (id) {
  currentTest = allTests.find((t) => String(t.id) === String(id));
  gpayFile = null;
  const qr =
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=' +
    paySettings.upi1 +
    '&am=' +
    (currentTest.price || 100);
  const qrUrl =
    paySettings.qr1_url && paySettings.qr1_url.length > 20
      ? paySettings.qr1_url
      : qr;
  document.querySelector(
    '#app'
  ).innerHTML = `<div style="min-height:100vh;background:#f6f7fb;display:flex;align-items:center;justify-content:center;padding:20px"><div style="background:white;border-radius:20px;padding:20px;max-width:400px;width:100%"><h3>${esc(
    currentTest.title
  )}</h3><small>${esc(
    currentTest.subject || ''
  )}</small><div style="text-align:center;background:#f9fafb;padding:12px;border-radius:12px;margin:10px 0"><img src="${qrUrl}" style="width:160px;height:160px"></div><input id="txn" placeholder="Txn ID" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ddd;margin-bottom:8px;box-sizing:border-box"><label style="font-size:12px;font-weight:700">📸 GPay Screenshot (Compulsory)</label><input type="file" accept="image/*" onchange="window.previewGpay(this)" style="width:100%;padding:8px;border:2px dashed #f59e0b;border-radius:10px;background:#fffbeb;margin:6px 0 8px"><img id="gpayPreview" style="display:none;width:100%;max-height:220px;object-fit:contain;border-radius:10px;border:1px solid #eee;margin-bottom:10px"><button onclick="window.submitPay()" id="payBtn" style="width:100%;padding:12px;background:#111;color:white;border-radius:10px;font-weight:800">Submit with Screenshot</button><button onclick="window.setDashTab('tests')" style="width:100%;padding:8px;margin-top:8px;background:#f3f4f6;border:none;border-radius:10px">Cancel</button></div></div>`;
};
window.submitPay = async function () {
  const txn = document.getElementById('txn').value.trim();
  const btn = document.getElementById('payBtn');
  if (!txn) return alert('Txn ID dah rawh');
  if (!gpayFile) return alert('GPay Screenshot thlang rawh!');
  try {
    if (btn) {
      btn.innerHTML = '⏳ Uploading...';
      btn.disabled = true;
    }
    const screenshotUrl = await uploadGpayScreenshot();
    await supabase.from('payment_requests').insert({
      user_id: currentUser.id,
      test_id: currentTest.id,
      amount: currentTest.price || 100,
      txn_id: txn,
      screenshot_url: screenshotUrl,
      status: 'pending',
    });
    alert('✅ Screenshot nen Submit fel e! Pending ah a awm ta!');
    gpayFile = null;
    await loadAll();
    renderDashboard();
  } catch (e) {
    alert('Error: ' + e.message);
    if (btn) {
      btn.innerHTML = 'Submit with Screenshot';
      btn.disabled = false;
    }
  }
};
window.buyPremium = function (planId) {
  const plan = premiumPlans.find((p) => p.id === planId);
  gpayFile = null;
  const qr =
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=' +
    paySettings.upi1 +
    '&am=' +
    plan.price;
  const qrUrl =
    paySettings.qr1_url && paySettings.qr1_url.length > 20
      ? paySettings.qr1_url
      : qr;
  document.querySelector(
    '#app'
  ).innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px"><div style="background:white;border-radius:20px;padding:20px;max-width:400px;width:100%;border:2px solid #f59e0b"><h2 style="text-align:center">${plan.name}</h2><div style="text-align:center;background:#fffbeb;padding:12px;border-radius:12px"><img src="${qrUrl}" style="width:160px;height:160px"></div><input id="txn" placeholder="Txn ID" style="width:100%;padding:10px;border-radius:10px;border:2px solid #f59e0b;margin:8px 0;box-sizing:border-box"><label style="font-size:12px;font-weight:700">📸 GPay Screenshot</label><input type="file" accept="image/*" onchange="window.previewGpay(this)" style="width:100%;padding:8px;border:2px dashed #f59e0b;border-radius:10px;background:#fffbeb;margin:6px 0"><img id="gpayPreview" style="display:none;width:100%;max-height:220px;object-fit:contain;border-radius:10px;border:1px solid #eee;margin-bottom:10px"><button onclick="window.submitPremium(${plan.id})" id="premBtn" style="width:100%;padding:12px;background:#f59e0b;color:white;border:none;border-radius:12px;font-weight:900">Submit Premium + Screenshot</button><button onclick="window.setDashTab('premium')" style="width:100%;padding:8px;margin-top:8px;background:#f3f4f6;border:none;border-radius:10px">Cancel</button></div></div>`;
};
window.submitPremium = async function (planId) {
  const txn = document.getElementById('txn').value.trim();
  const btn = document.getElementById('premBtn');
  if (!txn) return alert('Txn ID');
  if (!gpayFile) return alert('GPay Screenshot thlang rawh!');
  try {
    if (btn) {
      btn.innerHTML = '⏳ Uploading...';
      btn.disabled = true;
    }
    const screenshotUrl = await uploadGpayScreenshot();
    const plan = premiumPlans.find((p) => p.id === planId);
    await supabase.from('premium_payments').insert({
      user_id: currentUser.id,
      plan_id: planId,
      amount: plan.price,
      txn_id: txn,
      screenshot_url: screenshotUrl,
      status: 'pending',
    });
    alert('✅ Premium Pending! Admin approval nghah mek!');
    gpayFile = null;
    await loadAll();
    renderDashboard();
    window.setDashTab('premium');
  } catch (e) {
    alert('Error: ' + e.message);
    if (btn) {
      btn.innerHTML = 'Submit Premium + Screenshot';
      btn.disabled = false;
    }
  }
};
window.renderDashboard = renderDashboard;
init();
