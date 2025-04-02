const NodeHelper = require("node_helper");
const request = require("request");
module.exports = NodeHelper.create({
    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_CTAN_DATA") {
            this.getCtanData(payload.parada, payload.consorcio);
        }
    },
    getCtanData: function(parada, consorcio) {
        const url = `http://api.ctan.es/v1/Consorcios/${consorcio}/paradas/${parada}/servicios`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const data = JSON.parse(body);
                this.sendSocketNotification("CTAN_DATA", data);
            } else {
                console.error("Error al obtener datos de CTAN:", error);
                this.sendSocketNotification("CTAN_DATA", []); // Enviar un array vacío en caso de error
            }
        });
    }
});