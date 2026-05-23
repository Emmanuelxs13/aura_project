document.addEventListener("DOMContentLoaded", () => {
  const growthCanvas = document.getElementById("admin-growth-chart");
  const categoryCanvas = document.getElementById("admin-category-chart");

  if ((!growthCanvas && !categoryCanvas) || typeof Chart === "undefined") {
    return;
  }

  if (growthCanvas) {
    let growthData = [];
    try {
      growthData = JSON.parse(growthCanvas.dataset.chart || "[]");
    } catch (error) {
      console.warn(
        "No se pudo parsear data-chart de admin-growth-chart",
        error,
      );
      growthData = [];
    }

    new Chart(growthCanvas, {
      type: "line",
      data: {
        labels: growthData.map((item) => item.periodo),
        datasets: [
          {
            label: "Ingresos",
            data: growthData.map((item) => Number(item.valor_total || 0)),
            borderColor: "#111111",
            backgroundColor: "rgba(17, 17, 17, 0.08)",
            tension: 0.4,
            fill: true,
            borderWidth: 1,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "#e5e5e7" } },
        },
      },
    });
  }

  if (categoryCanvas) {
    let categoryMix = [];
    try {
      categoryMix = JSON.parse(categoryCanvas.dataset.chart || "[]");
    } catch (error) {
      console.warn(
        "No se pudo parsear data-chart de admin-category-chart",
        error,
      );
      categoryMix = [];
    }

    new Chart(categoryCanvas, {
      type: "doughnut",
      data: {
        labels: categoryMix.map((item) => item.category),
        datasets: [
          {
            data: categoryMix.map((item) => Number(item.total || 0)),
            backgroundColor: [
              "#111111",
              "#6e6e73",
              "#a1a1a6",
              "#d2d2d7",
              "#0066cc",
              "#86868b",
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }
});
