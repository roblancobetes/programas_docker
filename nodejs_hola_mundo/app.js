const express = require("express");
const client = require("prom-client");

const app = express();
const port = process.env.PORT || 3000;

// Métricas default (CPU, memoria, event loop, etc.)
client.collectDefaultMetrics({ prefix: "nodejs_" });

// Métrica de ejemplo: contador de requests
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total de requests HTTP",
  labelNames: ["method", "route", "status"],
});

// Middleware simple para contar requests
app.use((req, res, next) => {
  res.on("finish", () => {
    // route puede ser undefined si no hay match; lo simplificamos:
    const route = req.route?.path || req.path || "unknown";
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: String(res.statusCode),
    });
  });
  next();
});

app.get("/", (req, res) => {
  res.send("Hola mundo");
});

// Endpoint que scrapea Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(port, () => console.log(`App escuchando en ${port}`));
