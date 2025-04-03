Module.register("MMM-Ctan", {
    defaults: {
	    parada: 1,
        consorcio: 7,
	    updateInterval: 300 // Every 5 minute
    },
    getStyles() {
        return ["MMM-Ctan.css"]
    },
    start: function() {
        Log.info("Iniciando el módulo: " + this.name);
        this.resultados = [];
        this.getData();
        this.scheduleUpdate();
    },
    getData: function() {
        this.sendSocketNotification("GET_CTAN_DATA", {
            parada: this.config.parada,
            consorcio: this.config.consorcio
        });
    },
    scheduleUpdate: function() {
        setInterval(() => {
            this.getData();
        }, this.config.updateInterval*1000);
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification === "CTAN_DATA") {
            if (payload && payload.servicios) {
                this.resultados = payload.servicios.map(servicio => ({
                    hora: servicio.servicio,
                    nombre: servicio.nombre,
                    destino: servicio.destino
                }));
            } else {
                this.resultados = []; // Datos vacíos en caso de error o sin servicios
            }
            this.updateDom();
        }
    },
    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "MMM-ctan";
        var titulo = document.createElement("header");
        titulo.textContent = "Parada " + this.config.parada;
        titulo.className = "module-header";
        wrapper.appendChild(titulo);
        if (this.resultados.length === 0) {
            wrapper.innerHTML = "<p>Cargando...</p>";
            return wrapper;
        }
        var tabla = document.createElement("table");
        var encabezado = tabla.createTHead();
        var filaEncabezado = encabezado.insertRow();
        var encabezados = ["Nombre", "Destino", "Hora"];
        encabezados.forEach(texto => {
            var th = document.createElement("th");
            th.textContent = texto;
            filaEncabezado.appendChild(th);
        });
        var cuerpoTabla = tabla.createTBody();
        this.resultados.forEach(resultado => {
            var fila = cuerpoTabla.insertRow();
            var celdaNombre = fila.insertCell();
            var textoCompleto = resultado.nombre;
            if (textoCompleto.length > 25) {
                var indice = 0;
                setInterval(() => {
                    celdaNombre.textContent = textoCompleto.substring(indice, indice+25);
                    indice = (indice + 1) % (textoCompleto.length + 1);
                }, 200); // Ajusta la velocidad del carrusel según sea necesario
            } else {
                celdaNombre.textContent = textoCompleto;
            }
            var celdaDestino = fila.insertCell();
            celdaDestino.textContent = resultado.destino;
            var celdaTiempo = fila.insertCell();
            celdaTiempo.textContent = resultado.hora;
        });
        wrapper.appendChild(tabla);
        return wrapper;
    }
});