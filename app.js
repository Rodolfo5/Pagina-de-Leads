const STORAGE_KEY = "upsaudeLead";

function getLead() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setLead(next) {
  const curr = getLead();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...curr, ...next }));
}

function formatCpf(value) {
  const n = value.replace(/\D/g, "").slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function validateCpf(cpf) {
  const digits = cpf.replace(/\D/g, "");
  return digits.length === 11;
}

function initOnboarding() {
  const form = document.querySelector("#onboardingForm");
  if (!form) return;

  const cpfInput = form.querySelector("#cpf");
  const msg = document.querySelector("#formMsg");
  const lead = getLead();

  ["nome", "email", "cpf", "crm"].forEach((id) => {
    const field = form.querySelector(`#${id}`);
    if (field && lead[id]) field.value = lead[id];
  });

  cpfInput?.addEventListener("input", () => {
    cpfInput.value = formatCpf(cpfInput.value);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "";

    const payload = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      cpf: form.cpf.value.trim(),
      crm: form.crm.value.trim().toUpperCase(),
    };

    if (!payload.nome || payload.nome.length < 3) {
      msg.textContent = "Informe um nome válido.";
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      msg.textContent = "Informe um e-mail válido.";
      return;
    }

    if (!validateCpf(payload.cpf)) {
      msg.textContent = "CPF inválido. Digite os 11 números.";
      return;
    }

    if (!payload.crm || payload.crm.length < 4) {
      msg.textContent = "Informe seu registro profissional (CRM/CRP/etc).";
      return;
    }

    setLead(payload);
    window.location.href = "./consultorio-digital.html";
  });
}

function fillLeadPreview() {
  const lead = getLead();
  document.querySelectorAll("[data-lead]").forEach((el) => {
    const key = el.getAttribute("data-lead");
    if (lead[key]) el.textContent = lead[key];
  });
}

function initCheckout() {
  const timerEl = document.querySelector("#timer");
  const form = document.querySelector("#checkoutForm");
  if (!timerEl || !form) return;

  let duration = 12 * 60;
  const tick = () => {
    const m = Math.floor(duration / 60)
      .toString()
      .padStart(2, "0");
    const s = (duration % 60).toString().padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;
    if (duration > 0) duration -= 1;
  };

  tick();
  setInterval(tick, 1000);

  const number = form.querySelector("#cardNumber");
  const exp = form.querySelector("#cardExp");
  const cvv = form.querySelector("#cardCvv");
  const msg = form.querySelector("#checkoutMsg");

  number?.addEventListener("input", () => {
    const clean = number.value.replace(/\D/g, "").slice(0, 16);
    number.value = clean.replace(/(\d{4})(?=\d)/g, "$1 ");
  });

  exp?.addEventListener("input", () => {
    const clean = exp.value.replace(/\D/g, "").slice(0, 4);
    exp.value = clean.replace(/(\d{2})(\d)/, "$1/$2");
  });

  cvv?.addEventListener("input", () => {
    cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "";

    const cardNumber = number.value.replace(/\s/g, "");
    if (cardNumber.length < 16) {
      msg.textContent = "Número do cartão incompleto.";
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(exp.value)) {
      msg.textContent = "Validade inválida.";
      return;
    }

    if (cvv.value.length < 3) {
      msg.textContent = "CVV inválido.";
      return;
    }

    setLead({
      cardLast4: cardNumber.slice(-4),
      pagamento: "cartao",
    });

    window.location.href = "https://consultorio.upsaudeapp.com/login";
  });
}

function initLogin() {
  const form = document.querySelector("#createLoginForm");
  if (!form) return;
  const lead = getLead();

  if (lead.email) form.email.value = lead.email;
  if (lead.nome) form.nome.value = lead.nome;

  const msg = document.querySelector("#loginMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "";

    const pwd = form.senha.value;
    const confirm = form.confirmarSenha.value;

    if (pwd.length < 8) {
      msg.textContent = "A senha deve ter ao menos 8 caracteres.";
      return;
    }

    if (pwd !== confirm) {
      msg.textContent = "As senhas não conferem.";
      return;
    }

    setLead({
      loginCriado: true,
      email: form.email.value.trim(),
      nome: form.nome.value.trim(),
    });

    form.reset();
    msg.className = "success-msg";
    msg.textContent = "Login criado com sucesso! Seu acesso ao consultório digital foi liberado.";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillLeadPreview();
  initOnboarding();
  initCheckout();
  initLogin();
});
