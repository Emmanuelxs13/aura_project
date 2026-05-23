document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".shop-toolbar__search");
  const input = document.getElementById("catalogSearchInput");
  const suggestions = document.getElementById("catalogSuggestions");

  if (!form || !input || !suggestions) {
    return;
  }

  const endpoint = suggestions.dataset.endpoint;
  if (!endpoint) {
    return;
  }

  let pendingController = null;
  let debounceTimer = null;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("es-CO", {
      maximumFractionDigits: 0,
    });

  const hideSuggestions = () => {
    suggestions.hidden = true;
    suggestions.innerHTML = "";
  };

  const renderSuggestions = (query, items) => {
    if (!query) {
      hideSuggestions();
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      suggestions.innerHTML = `
        <div class="shop-toolbar__suggestion">
          <div>
            <strong>No encontramos coincidencias exactas</strong>
            <span>Prueba con otro termino o revisa el catalogo completo.</span>
          </div>
          <div class="shop-toolbar__suggestion-meta">
            <a class="btn-link btn-link--small" href="/shop?search=${encodeURIComponent(query)}">Buscar todo</a>
          </div>
        </div>
      `;
      suggestions.hidden = false;
      return;
    }

    suggestions.innerHTML = items
      .map((item) => {
        return `
          <a class="shop-toolbar__suggestion" href="/product/${encodeURIComponent(item.slug)}">
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.category)} · ${escapeHtml(item.colorway || "")}</span>
            </div>
            <div class="shop-toolbar__suggestion-meta">
              <span class="shop-toolbar__suggestion-price">$${formatPrice(item.price)} COP</span>
              <span>${escapeHtml(item.stock > 0 ? `${item.stock} disponibles` : "Agotado")}</span>
            </div>
          </a>
        `;
      })
      .join("")
      .concat(
        `<a class="shop-toolbar__suggestion" href="/shop?search=${encodeURIComponent(query)}"><div><strong>Ver todos los resultados</strong><span>Ir al listado completo con el termino actual.</span></div><div class="shop-toolbar__suggestion-meta">Buscar</div></a>`,
      );
    suggestions.hidden = false;
  };

  const loadSuggestions = async () => {
    const query = input.value.trim();

    if (!query) {
      hideSuggestions();
      return;
    }

    if (pendingController) {
      pendingController.abort();
    }

    pendingController = new AbortController();

    try {
      const response = await fetch(
        `${endpoint}?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: "application/json",
          },
          signal: pendingController.signal,
        },
      );

      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          body.message || "No se pudieron cargar las sugerencias.",
        );
      }

      renderSuggestions(query, body.items || []);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      hideSuggestions();
    }
  };

  input.addEventListener("input", () => {
    globalThis.clearTimeout(debounceTimer);
    debounceTimer = globalThis.setTimeout(loadSuggestions, 180);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) {
      loadSuggestions();
    }
  });

  document.addEventListener("click", (event) => {
    if (!suggestions.contains(event.target) && event.target !== input) {
      hideSuggestions();
    }
  });
});
