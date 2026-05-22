document.addEventListener("DOMContentLoaded", () => {
  const chartCanvas = document.getElementById("valuationChart");
  if (!chartCanvas || typeof Chart === "undefined") {
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
});
