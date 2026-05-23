document.addEventListener("DOMContentLoaded", () => {
  function createToastContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.position = "fixed";
      container.style.right = "18px";
      container.style.bottom = "18px";
      container.style.zIndex = 9999;
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = "info", timeout = 3000) {
    const container = createToastContainer();
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.marginTop = "8px";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 6px 18px rgba(20,20,20,0.08)";
    toast.style.color = "#111";
    toast.style.background = type === "error" ? "#ffe6e6" : "#f3f7ff";
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, timeout);
  }

  // Device form validation (create)
  const deviceCreateForm = document.querySelector(
    'form[action="/admin/devices"]',
  );
  if (deviceCreateForm) {
    deviceCreateForm.addEventListener("submit", (ev) => {
      const model = deviceCreateForm.querySelector('input[name="model_name"]');
      const specs = deviceCreateForm.querySelector(
        'textarea[name="specifications"]',
      );
      if (!model || !model.value.trim()) {
        ev.preventDefault();
        showToast("El campo Modelo es obligatorio", "error");
        model.focus();
        return;
      }
      if (specs && specs.value.trim()) {
        try {
          JSON.parse(specs.value);
        } catch (e) {
          ev.preventDefault();
          showToast("Especificaciones debe ser JSON válido", "error");
          specs.focus();
          return;
        }
      }
    });
  }

  // Device edit form validation
  const deviceEditForm = document.querySelector(
    'form[action^="/admin/devices/"]',
  );
  if (deviceEditForm) {
    deviceEditForm.addEventListener("submit", (ev) => {
      const model = deviceEditForm.querySelector('input[name="model_name"]');
      const specs = deviceEditForm.querySelector(
        'textarea[name="specifications"]',
      );
      if (model && !model.value.trim()) {
        ev.preventDefault();
        showToast("El campo Modelo es obligatorio", "error");
        model.focus();
        return;
      }
      if (specs && specs.value.trim()) {
        try {
          JSON.parse(specs.value);
        } catch (e) {
          ev.preventDefault();
          showToast("Especificaciones debe ser JSON válido", "error");
          specs.focus();
          return;
        }
      }
    });
  }

  // Incident form validation
  const incidentForms = Array.from(
    document.querySelectorAll('form[action*="/logs"]'),
  );
  incidentForms.forEach((form) => {
    form.addEventListener("submit", (ev) => {
      const title = form.querySelector('input[name="title"]');
      if (title && !title.value.trim()) {
        ev.preventDefault();
        showToast("El título de la incidencia es obligatorio", "error");
        title.focus();
        return;
      }
    });
  });

  // expose toast for other scripts
  function buildConfirmModal() {
    let modal = document.getElementById("confirm-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "confirm-modal";
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.display = "grid";
    modal.style.placeItems = "center";
    modal.style.background = "rgba(0,0,0,0.35)";
    modal.style.zIndex = 10000;
    modal.style.visibility = "hidden";

    const panel = document.createElement("div");
    panel.style.background = "#fff";
    panel.style.padding = "18px";
    panel.style.borderRadius = "10px";
    panel.style.minWidth = "320px";
    panel.style.boxShadow = "0 12px 40px rgba(10,10,10,0.12)";

    const msg = document.createElement("div");
    msg.id = "confirm-modal-msg";
    msg.style.marginBottom = "12px";
    panel.appendChild(msg);

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.justifyContent = "flex-end";
    actions.style.gap = "8px";

    const cancel = document.createElement("button");
    cancel.textContent = "Cancelar";
    cancel.className = "btn-ghost";
    const ok = document.createElement("button");
    ok.textContent = "Confirmar";
    ok.className = "btn-primary";

    actions.appendChild(cancel);
    actions.appendChild(ok);
    panel.appendChild(actions);
    modal.appendChild(panel);
    document.body.appendChild(modal);

    return modal;
  }

  function showConfirm(message) {
    return new Promise((resolve) => {
      const modal = buildConfirmModal();
      const msg = document.getElementById("confirm-modal-msg");
      msg.textContent = message || "¿Confirma esta acción?";
      modal.style.visibility = "visible";

      const [cancel, ok] = modal.querySelectorAll("button");

      function cleanup(result) {
        cancel.removeEventListener("click", onCancel);
        ok.removeEventListener("click", onOk);
        modal.style.visibility = "hidden";
        resolve(result);
      }

      function onCancel() {
        cleanup(false);
      }

      function onOk() {
        cleanup(true);
      }

      cancel.addEventListener("click", onCancel);
      ok.addEventListener("click", onOk);
    });
  }

  window.AuraAdminUI = { showToast, showConfirm };
});
