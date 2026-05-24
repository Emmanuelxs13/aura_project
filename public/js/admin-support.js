document.addEventListener("DOMContentLoaded", () => {
  // Intercept status update forms and submit via fetch for inline UX
  const statusForms = Array.from(
    document.querySelectorAll('form[action*="/status"]'),
  );

  statusForms.forEach((form) => {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const submitButton = form.querySelector("button") || null;
      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Actualizando...";
        }

        const res = await fetch(form.action, {
          method: (form.method || "POST").toUpperCase(),
          body: new FormData(form),
          credentials: "same-origin",
        });

        if (res.ok) {
          // simple UX: reload to reflect changes
          globalThis.location.reload();
        } else {
          console.warn("Update failed", res.status);
          globalThis.location.reload();
        }
      } catch (err) {
        console.error("Network error updating maintenance status", err);
        globalThis.location.reload();
      }
    });
  });

  // Attach confirm to delete forms if not already present
  const deleteForms = Array.from(
    document.querySelectorAll('form[action*="/delete"]'),
  );
  deleteForms.forEach((f) => {
    if (f.dataset.confirmAttached) return;
    f.dataset.confirmAttached = "1";
    f.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const message =
        f.dataset.confirm || "¿Seguro que desea eliminar este registro?";
      try {
        if (
          globalThis.AuraAdminUI &&
          typeof globalThis.AuraAdminUI.showConfirm === "function"
        ) {
          const ok = await globalThis.AuraAdminUI.showConfirm(message);
          if (ok) {
            f.submit();
          }
        } else if (confirm(message)) {
          f.submit();
        }
      } catch (err) {
        console.error("Error mostrando confirm modal", err);
        if (confirm(message)) f.submit();
      }
    });
  });
});
