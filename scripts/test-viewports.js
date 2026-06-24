import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import net from 'net';
import puppeteer from 'puppeteer-core';

const HOST = 'localhost';
const PORT = 5173;
const BASE_URL = `http://${HOST}:${PORT}`;

function findChromePath() {
  const paths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  if (process.env.PROGRAMFILES) {
    paths.push(path.join(process.env.PROGRAMFILES, "Google\\Chrome\\Application\\chrome.exe"));
    paths.push(path.join(process.env.PROGRAMFILES, "Microsoft\\Edge\\Application\\msedge.exe"));
  }
  if (process.env["PROGRAMFILES(X86)"]) {
    paths.push(path.join(process.env["PROGRAMFILES(X86)"], "Google\\Chrome\\Application\\chrome.exe"));
    paths.push(path.join(process.env["PROGRAMFILES(X86)"], "Microsoft\\Edge\\Application\\msedge.exe"));
  }
  if (process.env.LOCALAPPDATA) {
    paths.push(path.join(process.env.LOCALAPPDATA, "Google\\Chrome\\Application\\chrome.exe"));
  }

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function waitPort(port, host = HOST, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for port ${port}`));
        return;
      }
      const socket = new net.Socket();
      socket.connect(port, host, () => {
        socket.end();
        clearInterval(interval);
        resolve();
      });
      socket.on('error', () => {});
    }, 250);
  });
}

const viewports = [
  { width: 320, height: 568, name: "iPhone SE (320px)" },
  { width: 375, height: 812, name: "iPhone X (375px)" },
  { width: 414, height: 896, name: "iPhone XR/XS Max (414px)" },
  { width: 1024, height: 550, name: "Low-height Landscape Desktop (1024x550px)" }
];

async function runViewportChecks(page, viewport) {
  console.log(`\nTesting viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
  await page.setViewport({ width: viewport.width, height: viewport.height });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500)); // wait for layout/animations

  const results = [];

  // Check 1: Horizontal scrollbar / body overflow
  const overflow = await page.evaluate((vpWidth) => {
    const scrollWidth = document.documentElement.scrollWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    return {
      htmlScrollWidth: scrollWidth,
      bodyScrollWidth: bodyScrollWidth,
      hasOverflow: scrollWidth > vpWidth || bodyScrollWidth > vpWidth
    };
  }, viewport.width);

  if (overflow.hasOverflow) {
    results.push(`[FAIL] Horizontal overflow detected: htmlScrollWidth=${overflow.htmlScrollWidth}px, bodyScrollWidth=${overflow.bodyScrollWidth}px, viewportWidth=${viewport.width}px`);
  } else {
    results.push(`[PASS] No horizontal overflow.`);
  }

  // Check 2: Page 2 (Career Drivers) - Narrative box overlap or clipping
  const page2Checks = await page.evaluate((vpWidth) => {
    const passion = document.querySelector('div[class*="narrativeBoxPassion"]');
    const skill = document.querySelector('div[class*="narrativeBoxSkill"]');
    const growth = document.querySelector('div[class*="narrativeBoxGrowth"]');
    if (!passion || !skill || !growth) {
      return { success: false, error: "One or more narrative boxes not found on page 2" };
    }

    const rP = passion.getBoundingClientRect();
    const rS = skill.getBoundingClientRect();
    const rG = growth.getBoundingClientRect();

    // Stacking check on mobile vs desktop
    let overlap = false;
    let details = {};

    if (vpWidth <= 768) {
      // Stacked layout check
      const overlapPS = !(rP.bottom <= rS.top || rP.top >= rS.bottom);
      const overlapSG = !(rS.bottom <= rG.top || rS.top >= rG.bottom);
      const overlapPG = !(rP.bottom <= rG.top || rP.top >= rG.bottom);
      overlap = overlapPS || overlapSG || overlapPG;
      details = { overlapPS, overlapSG, overlapPG };
    } else {
      // Grid layout check (passion is left, skill/growth are right)
      // They shouldn't overlap in any layout
      const overlapPS = !(rP.right <= rS.left || rP.left >= rS.right || rP.bottom <= rS.top || rP.top >= rS.bottom);
      const overlapSG = !(rS.right <= rG.left || rS.left >= rG.right || rS.bottom <= rG.top || rS.top >= rG.bottom);
      const overlapPG = !(rP.right <= rG.left || rP.left >= rG.right || rP.bottom <= rG.top || rP.top >= rG.bottom);
      overlap = overlapPS || overlapSG || overlapPG;
      details = { overlapPS, overlapSG, overlapPG };
    }

    return {
      success: true,
      overlap,
      details,
      rP, rS, rG
    };
  }, viewport.width);

  if (!page2Checks.success) {
    results.push(`[FAIL] Page 2 Career Drivers: ${page2Checks.error}`);
  } else if (page2Checks.overlap) {
    results.push(`[FAIL] Page 2 Career Drivers: Narrative box overlap detected! (${JSON.stringify(page2Checks.details)})`);
  } else {
    results.push(`[PASS] Page 2 Career Drivers: Narrative boxes do not overlap.`);
  }

  // Check 3: Page 3 (Tools) - Wrapping and positioning
  const page3Checks = await page.evaluate((vpWidth) => {
    const tools = document.querySelector('#tools');
    if (!tools) return { success: false, error: "Tools container not found" };

    const tRect = tools.getBoundingClientRect();
    const orbs = Array.from(document.querySelectorAll('div[class*="magicOrb"]'));
    if (orbs.length === 0) return { success: false, error: "No magic orbs found" };

    let orbOverflow = false;
    orbs.forEach(orb => {
      const oRect = orb.getBoundingClientRect();
      // On mobile they should wrap and fit horizontally
      if (vpWidth <= 768) {
        if (oRect.left < 0 || oRect.right > vpWidth) {
          orbOverflow = true;
        }
      } else {
        // On desktop they shouldn't overflow the container
        if (oRect.left < tRect.left || oRect.right > tRect.right) {
          orbOverflow = true;
        }
      }
    });

    return {
      success: true,
      toolsWidth: tRect.width,
      orbOverflow
    };
  }, viewport.width);

  if (!page3Checks.success) {
    results.push(`[FAIL] Page 3 Tools: ${page3Checks.error}`);
  } else if (page3Checks.orbOverflow) {
    results.push(`[FAIL] Page 3 Tools: Some tool orbs overflow the viewport horizontally!`);
  } else {
    results.push(`[PASS] Page 3 Tools: Tools stay inside viewport.`);
  }

  // Check 4: Page 4 (Projects) - Stacking & layout
  const page4Checks = await page.evaluate((vpWidth) => {
    const projects = document.querySelector('#projects');
    if (!projects) return { success: false, error: "Projects container not found" };

    const cards = Array.from(document.querySelectorAll('div[class*="projectCard"]'));
    if (cards.length === 0) return { success: false, error: "No project cards found" };

    let cardOverflow = false;
    cards.forEach(card => {
      const cRect = card.getBoundingClientRect();
      if (vpWidth <= 768) {
        // On mobile, card width should be within the viewport
        if (cRect.left < 0 || cRect.right > vpWidth) {
          cardOverflow = true;
        }
      } else {
        // On desktop, they can extend beyond viewport width but must be scrollable within container,
        // and shouldn't cause the overall body/html scrollWidth to exceed vpWidth.
        // So we don't count right > vpWidth as overflow here because it's a horizontal scroll container.
      }
    });

    return {
      success: true,
      cardOverflow
    };
  }, viewport.width);

  if (!page4Checks.success) {
    results.push(`[FAIL] Page 4 Projects: ${page4Checks.error}`);
  } else if (page4Checks.cardOverflow) {
    results.push(`[FAIL] Page 4 Projects: Some project cards overflow the viewport horizontally!`);
  } else {
    results.push(`[PASS] Page 4 Projects: Projects stay inside viewport.`);
  }

  // Check 5: Page 5 (Contact) - Layout & overlap
  const page5Checks = await page.evaluate((vpWidth) => {
    const contact = document.querySelector('#contact');
    if (!contact) return { success: false, error: "Contact container not found" };

    const cRect = contact.getBoundingClientRect();
    const hasForm = !!document.querySelector('#contact form');
    const lists = document.querySelector('div[class*="contactList"]');
    const listRect = lists ? lists.getBoundingClientRect() : null;

    let contactOverflow = false;
    if (vpWidth <= 768) {
      if (cRect.left < 0 || cRect.right > vpWidth) {
        contactOverflow = true;
      }
    } else {
      if (listRect && (listRect.left < cRect.left || listRect.right > cRect.right)) {
        contactOverflow = true;
      }
    }

    return {
      success: true,
      contactOverflow,
      hasForm
    };
  }, viewport.width);

  if (!page5Checks.success) {
    results.push(`[FAIL] Page 5 Contact: ${page5Checks.error}`);
  } else if (page5Checks.contactOverflow) {
    results.push(`[FAIL] Page 5 Contact: Contact elements overflow the viewport horizontally!`);
  } else {
    results.push(`[PASS] Page 5 Contact: Contact elements stay inside viewport.`);
  }

  results.forEach(r => console.log(r));
  return results;
}

async function main() {
  console.log("=== STARTING VIEWPORT RESPONSIVENESS AND OVERLAP ORACLES ===");

  const chromePath = findChromePath();
  if (!chromePath) {
    console.error("ERROR: No Google Chrome or Microsoft Edge installation detected.");
    process.exit(1);
  }

  console.log("Launching Vite dev server...");
  const serverProcess = spawn('npx', ['vite', '--port', '5173'], {
    shell: true,
    stdio: 'ignore'
  });

  const killServer = () => {
    try {
      exec(`taskkill /pid ${serverProcess.pid} /f /t`, () => {
        console.log("Vite dev server terminated.");
      });
    } catch (e) {
      console.error("Failed to kill Vite server:", e);
    }
  };

  let browser;
  try {
    await waitPort(PORT, HOST, 15000);
    console.log("Vite server ready.");

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    let allPassed = true;
    const finalReport = [];

    for (const vp of viewports) {
      const results = await runViewportChecks(page, vp);
      finalReport.push({ viewport: vp.name, results });
      if (results.some(r => r.includes("[FAIL]"))) {
        allPassed = false;
      }
    }

    console.log("\n==============================================");
    console.log("VIEWPORT VERIFICATION SUMMARY");
    console.log("==============================================");
    if (allPassed) {
      console.log("VERDICT: PASS - All layouts are responsive and free of overlap/overflow.");
      process.exitCode = 0;
    } else {
      console.log("VERDICT: FAIL - Layout issues detected in some viewports.");
      process.exitCode = 1;
    }

  } catch (err) {
    console.error("Error running viewport checks:", err);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
    killServer();
    setTimeout(() => {
      process.exit();
    }, 1000);
  }
}

main();
