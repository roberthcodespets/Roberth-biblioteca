document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loanForm");
    const tableBody = document.querySelector("#loanTable tbody");
    const searchInput = document.getElementById("searchInput");
    const exportBtn = document.getElementById("exportBtn");

    let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];

    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach((prestamo, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${prestamo.titulo}</td>
                <td>${prestamo.autor}</td>
                <td>${prestamo.usuario}</td>
                <td>${prestamo.fecha}</td>
                <td>${prestamo.estado}</td>
                <td>
                    <button onclick="marcarDevuelto(${index})">✅ Devolver</button>
                    <button onclick="eliminarPrestamo(${index})">🗑️ Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function guardarLocal() {
        localStorage.setItem("prestamos", JSON.stringify(prestamos));
    }

    window.marcarDevuelto = (index) => {
        prestamos[index].estado = "Devuelto";
        guardarLocal();
        renderTable(prestamos);
    };

    window.eliminarPrestamo = (index) => {
        prestamos.splice(index, 1);
        guardarLocal();
        renderTable(prestamos);
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const titulo = document.getElementById("titulo").value;
        const autor = document.getElementById("autor").value;
        const usuario = document.getElementById("usuario").value;
        const fecha = document.getElementById("fecha").value;

        const prestamo = { titulo, autor, usuario, fecha, estado: "Prestado" };
        prestamos.push(prestamo);
        guardarLocal();
        renderTable(prestamos);

        fetch(GOOGLE_SHEET_URL, {
            method: "POST",
            body: JSON.stringify(prestamo),
            headers: { "Content-Type": "application/json" }
        }).catch(err => console.error("Error enviando a Google Sheets", err));

        form.reset();
    });

    searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase();
        const filtered = prestamos.filter(p =>
            p.titulo.toLowerCase().includes(term) ||
            p.autor.toLowerCase().includes(term) ||
            p.usuario.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });

    exportBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(prestamos, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "respaldo.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    renderTable(prestamos);
});