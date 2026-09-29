import os
import time
from playwright.sync_api import sync_playwright

def capture_all():
    output_dir = os.path.join(os.getcwd(), 'public', 'screenshots')
    os.makedirs(output_dir, exist_ok=True)

    print('Launching Playwright Chromium browser...')
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1440, 'height': 900},
            device_scale_factor=2,  # Retina high-DPI for crystal clear screenshots
            color_scheme='dark'     # Match sleek dark mode
        )
        page = context.new_page()

        # 1. Overview Page - Hero
        print('1. Capturing Overview Hero...')
        page.goto('http://localhost:3000/', wait_until='networkidle')
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(output_dir, '01_hero_overview.png'))

        # 2. Overview Page - Paradigm Shift (Why GitArmor)
        print('2. Capturing Paradigm Shift Comparison...')
        paradigm_el = page.locator('#why-gitarmor')
        if paradigm_el.count() > 0:
            paradigm_el.scroll_into_view_if_needed()
            page.wait_for_timeout(600)
            page.screenshot(path=os.path.join(output_dir, '02_paradigm_shift.png'))

        # 3. Overview Page - Pipeline Architecture
        print('3. Capturing 4-Phase Pipeline Architecture...')
        pipeline_el = page.locator('#how-it-works')
        if pipeline_el.count() > 0:
            pipeline_el.scroll_into_view_if_needed()
            page.wait_for_timeout(600)
            page.screenshot(path=os.path.join(output_dir, '03_pipeline_architecture.png'))

        # 4. Overview Page - Interactive Simulator
        print('4. Capturing Interactive Patch Simulator...')
        page.evaluate("window.scrollBy(0, 700)")
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(output_dir, '04_patch_simulator.png'))

        # 5. Overview Page - Security Telemetry & Compliance
        print('5. Capturing Security Telemetry & Compliance...')
        page.evaluate("window.scrollBy(0, 1000)")
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(output_dir, '05_security_telemetry.png'))

        # 6. Dedicated Audit Service Cockpit
        print('6. Capturing Dedicated Audit Service (/audit)...')
        page.goto('http://localhost:3000/audit', wait_until='networkidle')
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(output_dir, '06_audit_service.png'))

        # 7. Security Dashboard Overview (/dashboard)
        print('7. Capturing Security Dashboard (/dashboard)...')
        page.goto('http://localhost:3000/dashboard', wait_until='networkidle')
        page.wait_for_timeout(1200)
        page.screenshot(path=os.path.join(output_dir, '07_security_dashboard.png'))

        # 8. Interactive Code Remediation Modal / Diff
        print('8. Capturing Remediation & Code Diff Viewer...')
        # Click on the first remediate or diff button if available
        diff_btn = page.locator('button:has-text("Inspect Diff"), button:has-text("معاينة الترقيع"), button:has-text("Surgical Fix"), button:has-text("Remediate")').first
        if diff_btn.count() > 0:
            diff_btn.click()
            page.wait_for_timeout(800)
            page.screenshot(path=os.path.join(output_dir, '08_remediation_diff.png'))
            # Close modal with Escape or clicking close
            page.keyboard.press('Escape')
            page.wait_for_timeout(400)
        else:
            page.screenshot(path=os.path.join(output_dir, '08_remediation_diff.png'))

        # 9. Artifact Trinity Modal
        print('9. Capturing Artifact Trinity Modal...')
        trinity_btn = page.locator('button:has-text("Artifact Trinity"), button:has-text("الوثائق الثلاثية")').first
        if trinity_btn.count() > 0:
            trinity_btn.click()
            page.wait_for_timeout(800)
            page.screenshot(path=os.path.join(output_dir, '09_artifact_trinity.png'))
        else:
            page.screenshot(path=os.path.join(output_dir, '09_artifact_trinity.png'))

        browser.close()
        print('All screenshots captured successfully in public/screenshots/ !')

if __name__ == '__main__':
    capture_all()
