document.addEventListener("DOMContentLoaded", () => {
  const chartCanvas = document.getElementById("valuationChart");
  const categoryCanvas = document.getElementById("categoryChart");
  if ((!chartCanvas && !categoryCanvas) || typeof Chart === "undefined") {
    return;
  }

  let valuation = [];
  try {
    valuation = JSON.parse(chartCanvas.dataset.chart || "[]");
  } catch (error) {
    console.warn("No se pudo parsear data-chart de valuationChart", error);
    valuation = [];
  }

  const labels = valuation.map((item) => item.periodo);
  const values = valuation.map((item) => Number(item.valor_total || 0));

  new Chart(chartCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Valor total",
          data: values,
          borderColor: "#0066cc",
          backgroundColor: "rgba(0, 102, 204, 0.04)",
          tension: 0.42,
          fill: true,
          borderWidth: 1,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "#e5e5e7" } },
      },
    },
  });

  if (categoryCanvas) {
    let categoryMix = [];
    try {
      categoryMix = JSON.parse(categoryCanvas.dataset.chart || "[]");
    } catch (error) {
      console.warn("No se pudo parsear data-chart de categoryChart", error);
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
