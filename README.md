# web-act — Router con rutas públicas, privadas y por rol

Express + TypeScript + Bun, autenticación con JWT.

```bash
bun install
bun dev        # http://localhost:3000
bun test
```

| Ruta              | Tipo                | Acceso                          |
|-------------------|---------------------|---------------------------------|
| `GET  /api/public`  | Pública             | Cualquiera                      |
| `POST /api/login`   | Pública             | Devuelve un JWT                 |
| `GET  /api/private` | Privada             | Usuario autenticado             |
| `GET  /api/admin`   | Privada por rol     | Usuario autenticado con rol `admin` |

Usuarios de prueba: `admin / admin123` (rol admin), `user / user123` (rol user).

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/login -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r .token)
curl localhost:3000/api/admin -H "Authorization: Bearer $TOKEN"
```

Respuestas: sin token o token inválido → `401`; autenticado sin el rol → `403`.
# web-actividad
# web-actividad
