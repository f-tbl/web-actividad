import { test, expect, beforeAll, afterAll } from "bun:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "./src/app";

let server: Server;
let base: string;
beforeAll(() => {
  server = app.listen(0);
  base = `http://localhost:${(server.address() as AddressInfo).port}/api`;
});
afterAll(() => server.close());

async function tokenFor(username: string, password: string): Promise<string | undefined> {
  const res = await fetch(`${base}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return ((await res.json()) as { token?: string }).token;
}

const get = (path: string, token?: string) =>
  fetch(base + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

test("ruta pública sin token", async () => expect((await get("/public")).status).toBe(200));

test("login con credenciales malas", async () => expect(await tokenFor("admin", "mal")).toBeUndefined());

test("ruta privada", async () => {
  expect((await get("/private")).status).toBe(401);
  expect((await get("/private", "basura")).status).toBe(401);
  expect((await get("/private", await tokenFor("user", "user123"))).status).toBe(200);
});

test("ruta por rol", async () => {
  expect((await get("/admin")).status).toBe(401);
  expect((await get("/admin", await tokenFor("user", "user123"))).status).toBe(403);
  expect((await get("/admin", await tokenFor("admin", "admin123"))).status).toBe(200);
});
