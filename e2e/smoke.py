import asyncio, json, sys, re
from playwright.async_api import async_playwright

"""
Smoke test end-to-end del frontend contra el mock API.

Requisitos: `npm run mock` y `npm run dev` corriendo, y `pip install playwright`.
Variables opcionales: CHROME (ruta a un binario de Chromium; si no, usa el de Playwright),
BASE (default http://127.0.0.1:5173), SHOTS (carpeta de capturas, default ./e2e/shots).

    python e2e/smoke.py
"""
import os
CH = os.environ.get("CHROME")
BASE = os.environ.get("BASE", "http://127.0.0.1:5173")
OUT = os.environ.get("SHOTS", os.path.join(os.path.dirname(__file__), "shots"))
os.makedirs(OUT, exist_ok=True)
SEED = os.path.join(os.path.dirname(__file__), "..", "mock", "uploads")
errors = []
requests_log = []

async def shot(page, name, full=False):
    await page.wait_for_timeout(350)
    await page.screenshot(path=f"{OUT}/{name}.png", full_page=full)
    print("  📸", name)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CH or None, args=["--no-sandbox", "--disable-gpu"])
        ctx = await browser.new_context(viewport={"width": 1366, "height": 860}, device_scale_factor=1, locale="es-AR")
        page = await ctx.new_page()
        page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type in ("error",) else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("requestfailed", lambda r: errors.append(f"requestfailed: {r.method} {r.url} {r.failure}"))
        page.on("response", lambda r: requests_log.append((r.request.method, r.url, r.status)) if "/api/" in r.url else None)

        # ---- público
        await page.goto(BASE + "/")
        await page.wait_for_selector("h1")
        await shot(page, "01-landing", full=True)

        # ---- registro con validación real del backend (tag corto → rechazado por la UI)
        await page.goto(BASE + "/register")
        await page.fill("#email", "nuevo@scrimbase.gg")
        await page.fill("#username", "nuevo")
        await page.fill("#riotId", "Nuevo#AB")   # tag de 2 → inválido
        await page.fill("#password", "secreto1")
        assert await page.is_disabled("button[type=submit]"), "El submit debería estar deshabilitado con tag de 2 chars"
        await page.fill("#riotId", "Nuevo#ARG")
        await shot(page, "02-register")
        await page.click("button[type=submit]")
        await page.wait_for_url("**/onboarding")
        await shot(page, "03-onboarding")

        # ---- crear equipo (límites 3–30 / 3–5 del backend)
        await page.fill("#team-name", "Sunchales Gaming")
        await page.fill("#team-tag", "#SUN")
        await page.click("text=Crear equipo")
        await page.wait_for_url("**/app")
        await page.wait_for_selector("text=Empezá con la primera scrim")
        await shot(page, "04-dashboard-empty")

        # ---- equipo con 1 miembro: aviso de TeamFullGuard
        await page.goto(BASE + "/app/scrims/new")
        await page.wait_for_selector("text=necesita 5 miembros")
        await shot(page, "05-upload-team-too-small")

        # ---- equipo: código de invitación visible para el admin
        await page.goto(BASE + "/app/team")
        await page.wait_for_selector("text=Código de invitación")
        await shot(page, "06-team-new")

        # ---- logout y login con el equipo seed completo
        await page.click("aside button[aria-label='Menú de usuario']")
        await page.click("[role=menuitem] >> text=Cerrar sesión")
        await page.wait_for_url("**/login")
        await page.fill("#email", "admin@scrimbase.gg")
        await page.fill("#password", "mal")
        await page.click("button[type=submit]")
        await page.wait_for_selector("text=Invalid credentials")
        await shot(page, "07-login-error")
        await page.fill("#password", "password")
        await page.click("button[type=submit]")
        await page.wait_for_url("**/app")
        await page.wait_for_selector("text=Últimas scrims")
        await page.wait_for_selector("text=Rendimiento por mapa")
        await shot(page, "08-dashboard", full=True)

        # ---- listado + filtros
        await page.click("nav a[aria-label=Scrims]")
        await page.wait_for_url("**/app/scrims")
        await page.wait_for_selector("main a[href*='/app/scrims/']")
        await shot(page, "09-scrims-list", full=True)
        await page.click("button[aria-label='Filtrar por mapa']")
        await page.click("[role=option] >> text=Ascent")
        await page.wait_for_timeout(400)
        rows = await page.locator("main a[href*='/app/scrims/']").count()
        assert rows == 3, f"esperaba 3 scrims en Ascent, hay {rows}"
        # filtro por rival (query param opponentName, con debounce)
        await page.fill("input[aria-label='Filtrar por rival']", "Nova")
        await page.wait_for_timeout(700)
        assert await page.locator("main a[href*='/app/scrims/']").count() >= 1
        await shot(page, "10-scrims-filtered")
        await page.click("text=Limpiar filtros")
        await page.wait_for_timeout(400)

        # ---- detalle
        await page.click("main a[href*='/app/scrims/'] >> nth=0")
        await page.wait_for_url(re.compile(r".*/app/scrims/[a-f0-9]{24}$"))
        await page.wait_for_selector("text=Nuestro equipo")
        await shot(page, "11-scrim-detail", full=True)
        # la captura se abre en la misma página, no en otra pestaña
        pages_before = len(page.context.pages)
        await page.click("button[aria-label='Ampliar la captura']")
        await page.wait_for_selector("[role=dialog]")
        assert len(page.context.pages) == pages_before, "la captura abrió una pestaña nueva"
        await shot(page, "11b-lightbox")
        await page.keyboard.press("Escape")
        await page.wait_for_selector("[role=dialog]", state="detached")

        # ---- subir scrim: paso 1 → IA → paso 2 → guardar
        await page.goto(BASE + "/app/scrims/new")
        await page.wait_for_selector("text=Analizar con IA")
        await page.wait_for_selector("text=0 de 1 scrim hoy")
        await page.click("[role=radio] >> text=Premier")
        await page.click("#map")
        await page.click("[role=option] >> text=Haven")
        await page.set_input_files("input[type=file]", os.path.join(SEED, "scrims", "seed-scoreboard.png"))
        await page.wait_for_selector("text=Quitar")
        await shot(page, "12-upload-step1", full=True)
        await page.click("text=Analizar con IA")
        await page.wait_for_selector("text=Leyendo el scoreboard")
        await shot(page, "12e-analyzing")
        await page.wait_for_selector("text=Paso 2 de 2", timeout=30000)
        await page.wait_for_selector("text=La IA no pudo reconocer todo")
        # los números vienen de la IA y NO son editables
        assert await page.locator("#teamRounds").count() == 0, "el marcador no debería ser editable"
        assert await page.locator("text=Cambiar captura").count() == 0, "no debería poder cambiar la captura"
        assert await page.locator("input[placeholder='Nombre en el juego']").count() == 0
        await shot(page, "13-upload-step2", full=True)
        # guardar está bloqueado hasta completar rival + agentes faltantes
        assert await page.is_disabled("button:has-text('Guardar scrim')")
        await page.fill("#opponentName", "Nova Esports")
        # agente del 5º jugador: dropdown con todos los agentes de Valorant
        await page.click("button[aria-label='Agente del jugador 5']")
        await page.wait_for_selector("[role=option] >> text=Waylay")
        await shot(page, "13b-agent-dropdown")
        await page.click("[role=option] >> text=KAY/O")
        # el jugador que la IA no reconoció se elige del roster
        await page.click("button[aria-label='Jugador 5']")
        await page.click("[role=option] >> text=tomi")
        await page.click("button[aria-label='Agente rival 5']")
        await page.click("[role=option] >> text=Sage")
        await page.wait_for_selector("text=Todo listo para guardar")
        await page.click("button:has-text('Guardar scrim')")
        await page.wait_for_url("**/app/scrims")
        await page.wait_for_selector("main a[href*='/app/scrims/'] >> text=Nova Esports")
        first = await page.locator("main a[href*='/app/scrims/']").nth(0).inner_text()
        assert "Haven" in first and "Nova Esports" in first, f"la scrim nueva no está primera: {first!r}"
        await shot(page, "14-scrims-after-create")

        # ---- cupo agotado: bloquea y ofrece pagar
        await page.goto(BASE + "/app/scrims/new")
        await page.wait_for_selector("text=scrim gratis")
        assert await page.is_disabled("button:has-text('Analizar con IA')"), "sin cupo no debería dejar analizar"
        await shot(page, "12b-quota-blocked", full=True)
        await page.click("button:has-text('Pasar a Pro') >> nth=0")
        await page.wait_for_selector("[role=alertdialog] >> text=Scrims ilimitadas")
        await shot(page, "12c-upgrade")
        await page.click("[role=alertdialog] button:has-text('Pasar a Pro')")
        await page.wait_for_url("**/app/settings**")
        await page.wait_for_selector("text=Scrims ilimitadas")
        await shot(page, "12d-plan-pro", full=True)
        # con Pro ya no hay tope
        await page.goto(BASE + "/app/scrims/new")
        await page.wait_for_selector("text=scrims ilimitadas")
        assert await page.locator("button:has-text('Analizar con IA')").count() == 1

        # ---- strats
        await page.click("nav a[aria-label=Strats]")
        await page.wait_for_url("**/app/strats")
        await page.wait_for_selector("text=Ataque")
        await shot(page, "15-strats-list", full=True)
        # agrupado por mapa y por lado + filtros
        await page.click("[role=tab] >> text=Ascent")
        await page.wait_for_timeout(250)
        await page.click("[role=tab] >> text=Defensa")
        await page.wait_for_timeout(250)
        cards = await page.locator("main a[href*='/app/strats/']").count()
        assert cards == 1, f"esperaba 1 strat de defensa en Ascent, hay {cards}"
        await shot(page, "15b-strats-filtered")
        await page.click("[role=tab] >> text=Ambos lados")
        await page.wait_for_timeout(250)
        await page.click("main a[href*='/app/strats/']")
        await page.wait_for_selector("text=Notas")
        await shot(page, "16-strat-detail", full=True)
        await page.goto(BASE + "/app/strats/new")
        await page.fill("#strat-name", "Ejecución A con Tejo")
        await page.click("#strat-map")
        await page.click("[role=option] >> text=Corrode")
        await page.click("[role=radio] >> text=Defensa")
        await page.fill("#strat-notes", "Tejo dispara al inicio de ronda.\nOmen smoke en heaven.")
        await page.set_input_files("input[type=file]", os.path.join(SEED, "strats", "seed-strat-1.png"))
        await page.wait_for_selector("text=Quitar")
        await shot(page, "17-strat-create", full=True)
        await page.click("text=Guardar strat")
        await page.wait_for_url("**/app/strats")
        await page.wait_for_selector("text=Ejecución A con Tejo")

        # ---- equipo (seed, 5 miembros) y ajustes
        await page.click("nav a[aria-label=Equipo]")
        await page.wait_for_selector("text=(vos)")
        await shot(page, "18-team", full=True)

        # ---- administración de miembros (PATCH role / PATCH admin / DELETE / transfer)
        await page.click("button[aria-label='Acciones para tomi']")
        await page.click("[role=menuitem] >> text=Cambiar rol")
        await page.click("[role=menuitemradio] >> text=Coach")
        await page.wait_for_selector("text=tomi ahora es coach.")
        await page.click("button[aria-label='Acciones para lucasf']")
        await shot(page, "18b-member-menu")
        await page.click("[role=menuitem] >> text=Hacer admin")
        await page.wait_for_selector("text=lucasf ahora es admin.")
        await page.click("button[aria-label='Acciones para mili']")
        await page.click("[role=menuitem] >> text=Quitar del equipo")
        await page.wait_for_selector("[role=alertdialog]")
        await shot(page, "18c-remove-confirm")
        await page.click("[role=alertdialog] button >> text=Quitar del equipo")
        await page.wait_for_selector("text=mili fue quitado del equipo.")
        rows = await page.locator("tbody tr").count()
        assert rows == 4, f"esperaba 4 miembros después de quitar uno, hay {rows}"
        await page.wait_for_selector("text=Faltan 1 miembro")
        await page.click("button[aria-label='Acciones para lucasf']")
        await page.click("[role=menuitem] >> text=Transferir administración")
        await page.click("[role=alertdialog] button >> text=Transferir")
        await page.wait_for_selector("text=Administración transferida a lucasf.")
        # ya no soy admin: el menú de acciones desaparece
        await page.wait_for_selector("text=Los roles y permisos los administra un admin")
        assert await page.locator("button[aria-label^='Acciones para']").count() == 0
        await shot(page, "18d-team-after-transfer", full=True)
        # stats de un integrante (endpoint /members/:id/stats)
        await page.click("main a[href^='/app/team/']")
        await page.wait_for_selector("text=ACS promedio")
        await shot(page, "18e-player-stats", full=True)
        await page.click("text=Equipo >> nth=0")
        await page.wait_for_url("**/app/team")

        await page.click("nav a[aria-label=Configuración]")
        await page.wait_for_selector("#username")
        assert await page.is_disabled("text=Guardar perfil"), "sin cambios, Guardar perfil debería estar deshabilitado"
        await page.fill("#alt", "DavidAlt#EU")     # tag de 2 → error de formato
        await page.click("text=Guardar cuenta alternativa")
        await page.wait_for_selector("text=Usá el formato")
        await page.fill("#alt", "DavidAlt#EUW")
        await page.click("text=Guardar cuenta alternativa")
        await page.wait_for_selector("text=Cuenta alternativa guardada")
        # cambio de contraseña (PUT /users/me { password })
        await page.fill("#new-password", "nueva123")
        await page.fill("#new-password-repeat", "nueva124")
        await page.click("text=Cambiar contraseña")
        await page.wait_for_selector("text=no coinciden")
        await page.fill("#new-password-repeat", "nueva123")
        await page.click("text=Cambiar contraseña")
        await page.wait_for_selector("text=Contraseña actualizada.")
        await shot(page, "19-settings", full=True)
        # la nueva contraseña sirve para entrar
        await page.click("aside button[aria-label='Menú de usuario']")
        await page.click("[role=menuitem] >> text=Cerrar sesión")
        await page.wait_for_url("**/login")
        await page.fill("#email", "admin@scrimbase.gg"); await page.fill("#password", "nueva123")
        await page.click("button[type=submit]")
        await page.wait_for_url("**/app")

        # ---- 404 y ruta protegida sin sesión
        await page.goto(BASE + "/lo-que-sea")
        await page.wait_for_selector("text=404")
        await shot(page, "20-not-found")

        # ---- mobile
        mctx = await browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, locale="es-AR")
        m = await mctx.new_page()
        m.on("pageerror", lambda e: errors.append(f"[mobile] pageerror: {e}"))
        await m.goto(BASE + "/login")
        await m.fill("#email", "admin@scrimbase.gg"); await m.fill("#password", "nueva123")  # ya cambiada en Configuración
        await m.click("button[type=submit]")
        await m.wait_for_url("**/app"); await m.wait_for_selector("text=Últimas scrims")
        await shot(m, "21-mobile-dashboard", full=True)
        await m.goto(BASE + "/app/scrims"); await m.wait_for_selector("main a[href*='/app/scrims/']")
        await shot(m, "22-mobile-scrims")
        await m.goto(BASE + "/app/scrims/new"); await m.wait_for_selector("text=Analizar con IA")
        await shot(m, "23-mobile-upload", full=True)
        await m.goto(BASE + "/"); await m.wait_for_selector("h1")
        await shot(m, "24-mobile-landing", full=True)

        await browser.close()

    print("\n== API calls ==")
    for meth, url, st in requests_log:
        print(f"  {st} {meth} {url.replace('http://localhost:3000','')}")
    print("\n== errores de consola / página ==")
    print("\n".join(errors) if errors else "  (ninguno)")
    # esperados: el 401 del login con contraseña incorrecta y los 403 del CDN de
    # valorant-api.com cuando se corre sin salida a internet (hay fallback visual).
    bad = [e for e in errors if "favicon" not in e and "401" not in e and "403" not in e]
    print("\nRESULTADO:", "FALLÓ" if bad else "OK — 37 pasos, sin errores de JS")
    sys.exit(1 if bad else 0)

try:
    asyncio.run(main())
except Exception:
    import traceback; traceback.print_exc()
    sys.exit(1)
