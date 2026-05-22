document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("deviceCreateForm");
  const message = document.getElementById("deviceFormMessage");

  if (!form || !message) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const rawSpecs = String(formData.get("specifications") || "").trim();

    let parsedSpecs = null;
    if (rawSpecs) {
      try {
        parsedSpecs = JSON.parse(rawSpecs);
      } catch (error) {
        message.className = "form-message form-message--error";
        message.textContent =
          "El campo de especificaciones debe ser JSON valido.";
        return;
      }
    }

    const payload = {
      model_name: String(formData.get("model_name") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      serial_number: String(formData.get("serial_number") || "").trim(),
      purchase_price: Number(formData.get("purchase_price")),
      purchase_date: String(formData.get("purchase_date") || "").trim(),
      specifications: parsedSpecs,
    };

    message.className = "form-message";
    message.textContent = "Guardando dispositivo...";

    try {
      const response = await fetch("/api/v1/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!response.ok) {
        const details = Array.isArray(body.errors)
          ? body.errors.join(" | ")
          : "";
        message.className = "form-message form-message--error";
        message.textContent = `No se pudo guardar: ${body.message || "Error"}${details ? ` (${details})` : ""}`;
        return;
      }

      message.className = "form-message form-message--success";
      message.textContent = `Dispositivo creado con ID ${body.device_id}. Recargando listado...`;
      form.reset();
      window.setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      message.className = "form-message form-message--error";
      message.textContent =
        "Error de red. Verifica que el servidor este arriba.";
    }
  });
});
