Module.register("MMM-Ctan", {
  defaults: {
parada: 1,
      consorcio: 7,
updateInterval: 300 // Every 5 minute
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
      tabla.className = "small"; // Clase para el tipo de letra
      var encabezado = tabla.createTHead();
      var filaEncabezado = encabezado.insertRow();
      var encabezados = ["Hora", "Nombre", "Destino"];
      encabezados.forEach(texto => {
          var th = document.createElement("th");
          th.textContent = texto;
          filaEncabezado.appendChild(th);
      });
      var cuerpoTabla = tabla.createTBody();
      this.resultados.forEach(resultado => {
          var fila = cuerpoTabla.insertRow();
          var celdaLinea = fila.insertCell();
          celdaLinea.textContent = resultado.nombre;
          var celdaDestino = fila.insertCell();
          celdaDestino.textContent = resultado.destino;
          var celdaTiempo = fila.insertCell();
          celdaTiempo.textContent = resultado.hora;
      });
      wrapper.appendChild(tabla);
      return wrapper;
  }
});