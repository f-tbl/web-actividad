import express from "express";
import { login, requireAuth, requireRole } from "./auth";

export const app = express();
app.use(express.json());

const router = express.Router();

// Rutas públicas
router.get("/public", (_req, res) => res.json({ message: "Ruta pública: cualquiera puede verla" }));
router.post("/login", login);

// Ruta privada (cualquier usuario autenticado)
router.get("/private", requireAuth, (req, res) =>
  res.json({ message: `Hola ${req.user!.username}, estás autenticado`, user: req.user }),
);

// Ruta privada protegida por rol
router.get("/admin", requireAuth, requireRole("admin"), (req, res) =>
  res.json({ message: `Bienvenido al panel de admin, ${req.user!.username}` }),
);

app.use("/api", router);
