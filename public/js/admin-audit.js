document.addEventListener("DOMContentLoaded", () => {
  const filterInput = document.getElementById("audit-filter");
  if (!filterInput) return;

  const table = document.querySelector(".apple-clean-table tbody");
  if (!table) return;

  filterInput.addEventListener("input", () => {
    const q = filterInput.value.trim().toLowerCase();
    const rows = Array.from(table.querySelectorAll("tr"));
    if (!q) {
      rows.forEach((r) => (r.style.display = ""));
      return;
    }

    rows.forEach((row) => {
      const cellsText = Array.from(row.cells)
        .map((c) => c.textContent.trim().toLowerCase())
        .join(" ");
      row.style.display = cellsText.includes(q) ? "" : "none";
    });
  });
});
