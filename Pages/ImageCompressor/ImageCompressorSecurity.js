/**
 * SATURN RAHUL LIGHTWEIGHT PROTECTION GUARD
 * Secure UX, Anti-Cloning, and Anti-Bot Web Shield
 */

(function () {
    'use strict';

    // 1. Prevent Right-Click Context Drops
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Disable Keyboard Source Theft and Shortcut Interceptions
    document.addEventListener('keydown', (e) => {
        // Block F12 Function Key
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        
        // Block Ctrl+Shift+I, J, C (Inspect Methods)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'i' || e.key === 'j' || e.key === 'c')) {
            e.preventDefault();
            return false;
        }

        // Block Ctrl+U (View Source Code File)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            return false;
        }

        // Block Ctrl+S (Page asset duplication downloads)
        if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Automated Malicious Bot Detection Guard
    document.addEventListener("DOMContentLoaded", () => {
        // Blocks headless automated test frameworks (like Selenium or Puppeteer scrapers)
        if (navigator.webdriver || window.__webdriver_evaluate || navigator.languages === "") {
            document.body.innerHTML = `
                <div style="background:#07080d; color:#ff5e3a; text-align:center; padding-top:35vh; font-family:sans-serif; min-height:100vh;">
                    <h1 style="font-size:32px; letter-spacing:1px;">🤖 AUTOMATED BOT DETECTED</h1>
                    <p style="color:#798296; margin-top:10px; font-size:16px;">Access blocked by Saturn Rahul Protection Engine.</p>
                </div>
            `;
        }
    });

})();