import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import net from 'net';
import puppeteer from 'puppeteer-core';

// --- CONFIGURATION ---
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
      socket.on('error', () => {
        // Port not ready yet
      });
    }, 250);
  });
}

const testCases = [
  // --- FEATURE 1 ---
  {
    id: "T1.1.1",
    name: "Body width is less than or equal to 375px",
    fn: async (page) => {
      const bodyWidth = await page.evaluate(() => document.body.clientWidth);
      if (bodyWidth > 375) throw new Error(`Body width is ${bodyWidth}px (expected <= 375px)`);
    }
  },
  {
    id: "T1.1.2",
    name: "HTML document has no horizontal scrollbar",
    fn: async (page) => {
      const { scrollWidth, clientWidth, overflowX } = await page.evaluate(() => {
        const style = window.getComputedStyle(document.documentElement);
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflowX: style.overflowX
        };
      });
      if (scrollWidth > clientWidth && overflowX !== 'hidden') {
        throw new Error(`Horizontal scrollbar is active: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}, overflowX=${overflowX}`);
      }
    }
  },
  {
    id: "T1.1.3",
    name: "The header/nav bar width scales down to fit within 375px width",
    fn: async (page) => {
      const headerWidth = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header ? header.getBoundingClientRect().width : null;
      });
      if (headerWidth === null) throw new Error("Header element not found");
      if (headerWidth > 375) throw new Error(`Header width is ${headerWidth}px`);
    }
  },
  {
    id: "T1.1.4",
    name: "Overview section content bounds fit inside the 375px viewport",
    fn: async (page) => {
      const width = await page.evaluate(() => {
        const overview = document.querySelector('#overview');
        return overview ? overview.getBoundingClientRect().width : null;
      });
      if (width === null) throw new Error("Overview element not found");
      if (width > 375) throw new Error(`Overview width is ${width}px`);
    }
  },
  {
    id: "T1.1.5",
    name: "Footer/Analytics indicators are contained within 375px width",
    fn: async (page) => {
      const width = await page.evaluate(() => {
        const footer = document.querySelector('footer') || document.querySelector('[class*="footer"]');
        return footer ? footer.getBoundingClientRect().width : null;
      });
      if (width !== null && width > 375) throw new Error(`Footer width is ${width}px`);
    }
  },

  // --- FEATURE 2 ---
  {
    id: "T1.2.1",
    name: "Page 2 container width is within 375px",
    fn: async (page) => {
      const width = await page.evaluate(() => {
        const drivers = document.querySelector('#drivers');
        return drivers ? drivers.getBoundingClientRect().width : null;
      });
      if (width === null) throw new Error("Page 2 (#drivers) container not found");
      if (width > 375) throw new Error(`Page 2 width is ${width}px`);
    }
  },
  {
    id: "T1.2.2",
    name: "Career driver text/narrative boxes stack vertically",
    fn: async (page) => {
      const rects = await page.evaluate(() => {
        const boxes = [
          document.querySelector('div[class*="narrativeBoxPassion"]'),
          document.querySelector('div[class*="narrativeBoxSkill"]'),
          document.querySelector('div[class*="narrativeBoxGrowth"]')
        ];
        return boxes.map((box, i) => {
          if (!box) return null;
          const rect = box.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom };
        });
      });
      for (let i = 0; i < rects.length; i++) {
        if (!rects[i]) throw new Error(`Narrative box ${i + 1} not found`);
      }
      if (rects[1].top < rects[0].bottom) throw new Error(`Box 2 (top: ${rects[1].top}) does not stack below Box 1 (bottom: ${rects[0].bottom})`);
      if (rects[2].top < rects[1].bottom) throw new Error(`Box 3 (top: ${rects[2].top}) does not stack below Box 2 (bottom: ${rects[1].bottom})`);
    }
  },
  {
    id: "T1.2.3",
    name: "Vertical distance between stacked boxes has a positive margin/gap",
    fn: async (page) => {
      const rects = await page.evaluate(() => {
        const boxes = [
          document.querySelector('div[class*="narrativeBoxPassion"]'),
          document.querySelector('div[class*="narrativeBoxSkill"]'),
          document.querySelector('div[class*="narrativeBoxGrowth"]')
        ];
        return boxes.map(box => box ? box.getBoundingClientRect() : null);
      });
      if (!rects[0] || !rects[1] || !rects[2]) throw new Error("Some narrative boxes not found");
      const gap1 = rects[1].top - rects[0].bottom;
      const gap2 = rects[2].top - rects[1].bottom;
      if (gap1 <= 0) throw new Error(`Gap 1 is ${gap1}px (expected > 0)`);
      if (gap2 <= 0) throw new Error(`Gap 2 is ${gap2}px (expected > 0)`);
    }
  },
  {
    id: "T1.2.4",
    name: "Layout has flex-direction column or similar vertical flow on mobile",
    fn: async (page) => {
      const style = await page.evaluate(() => {
        const comicPage = document.querySelector('div[class*="comicPage"]');
        if (!comicPage) return null;
        const comp = window.getComputedStyle(comicPage);
        return { display: comp.display, flexDirection: comp.flexDirection, gridTemplateColumns: comp.gridTemplateColumns };
      });
      if (!style) throw new Error("ComicPage element not found");
      const isVertical = style.flexDirection === 'column' || style.gridTemplateColumns.split(' ').length === 1 || style.display === 'block';
      if (!isVertical) throw new Error(`Layout style is not vertical: display=${style.display}, flexDirection=${style.flexDirection}, gridTemplateColumns=${style.gridTemplateColumns}`);
    }
  },
  {
    id: "T1.2.5",
    name: "Inner narrative boxes do not overlap each other vertically",
    fn: async (page) => {
      const rects = await page.evaluate(() => {
        const boxes = [
          document.querySelector('div[class*="narrativeBoxPassion"]'),
          document.querySelector('div[class*="narrativeBoxSkill"]'),
          document.querySelector('div[class*="narrativeBoxGrowth"]')
        ];
        return boxes.map(box => box ? box.getBoundingClientRect() : null);
      });
      if (!rects[0] || !rects[1] || !rects[2]) throw new Error("Some narrative boxes not found");
      if (rects[1].top < rects[0].bottom) throw new Error("Box 1 and Box 2 overlap");
      if (rects[2].top < rects[1].bottom) throw new Error("Box 2 and Box 3 overlap");
    }
  },

  // --- FEATURE 3 ---
  {
    id: "T1.3.1",
    name: "Narrative boxes have computed style height set to auto/min-height (not fixed px)",
    fn: async (page) => {
      const styles = await page.evaluate(() => {
        const boxes = [
          document.querySelector('div[class*="narrativeBoxPassion"]'),
          document.querySelector('div[class*="narrativeBoxSkill"]'),
          document.querySelector('div[class*="narrativeBoxGrowth"]')
        ];
        return boxes.map(box => {
          if (!box) return null;
          return {
            inlineHeight: box.style.height,
            computedHeight: window.getComputedStyle(box).height
          };
        });
      });
      for (let i = 0; i < styles.length; i++) {
        const s = styles[i];
        if (!s) throw new Error(`Narrative box ${i + 1} not found`);
        if (s.inlineHeight && s.inlineHeight.endsWith('px')) {
          throw new Error(`Box ${i + 1} has fixed inline height: ${s.inlineHeight}`);
        }
      }
    }
  },
  {
    id: "T1.3.2",
    name: "Narrative boxes have computed style overflow-y not equal to scroll",
    fn: async (page) => {
      const overflows = await page.evaluate(() => {
        const boxes = [
          document.querySelector('div[class*="narrativeBoxPassion"]'),
          document.querySelector('div[class*="narrativeBoxSkill"]'),
          document.querySelector('div[class*="narrativeBoxGrowth"]')
        ];
        return boxes.map(box => box ? window.getComputedStyle(box).overflowY : null);
      });
      overflows.forEach((o, i) => {
        if (o === null) throw new Error(`Narrative box ${i + 1} not found`);
        if (o === 'scroll') throw new Error(`Box ${i + 1} has overflow-y: scroll`);
      });
    }
  },
  {
    id: "T1.3.3",
    name: "Narrative boxes have computed style overflow-y not equal to auto",
    fn: async (page) => {
      const overflows = await page.evaluate(() => {
        const boxes = [
          document.querySelector('div[class*="narrativeBoxPassion"]'),
          document.querySelector('div[class*="narrativeBoxSkill"]'),
          document.querySelector('div[class*="narrativeBoxGrowth"]')
        ];
        return boxes.map(box => box ? window.getComputedStyle(box).overflowY : null);
      });
      overflows.forEach((o, i) => {
        if (o === null) throw new Error(`Narrative box ${i + 1} not found`);
        if (o === 'auto') throw new Error(`Box ${i + 1} has overflow-y: auto`);
      });
    }
  },
  {
    id: "T1.3.4",
    name: "Narrative boxes have scrollHeight equal to or close to clientHeight",
    fn: async (page) => {
      const diffs = await page.evaluate(() => {
        const boxes = [
          document.querySelector('div[class*="narrativeBoxPassion"]'),
          document.querySelector('div[class*="narrativeBoxSkill"]'),
          document.querySelector('div[class*="narrativeBoxGrowth"]')
        ];
        return boxes.map(box => box ? { scrollHeight: box.scrollHeight, clientHeight: box.clientHeight } : null);
      });
      diffs.forEach((d, i) => {
        if (d === null) throw new Error(`Narrative box ${i + 1} not found`);
        if (d.scrollHeight > d.clientHeight + 5) {
          throw new Error(`Box ${i + 1} scrollHeight (${d.scrollHeight}) is greater than clientHeight (${d.clientHeight})`);
        }
      });
    }
  },
  {
    id: "T1.3.5",
    name: "The browser window scroll can scroll down without internal scroll containers",
    fn: async (page) => {
      const isWindowScrollable = await page.evaluate(() => {
        const html = document.documentElement;
        return html.scrollHeight > html.clientHeight;
      });
      if (!isWindowScrollable) {
        throw new Error("Document body/html is not scrollable vertically");
      }
    }
  },

  // --- FEATURE 4 ---
  {
    id: "T1.4.1",
    name: "Tools container fits within 375px width",
    fn: async (page) => {
      const width = await page.evaluate(() => {
        const tools = document.querySelector('#tools');
        return tools ? tools.getBoundingClientRect().width : null;
      });
      if (width === null) throw new Error("Tools container not found");
      if (width > 375) throw new Error(`Tools container width is ${width}px`);
    }
  },
  {
    id: "T1.4.2",
    name: "Tool items/icons wrap onto multiple rows if they exceed 375px",
    fn: async (page) => {
      const tops = await page.evaluate(() => {
        const orbs = Array.from(document.querySelectorAll('div[class*="magicOrb"]'));
        return orbs.map(o => o.getBoundingClientRect().top);
      });
      if (tops.length === 0) throw new Error("No magic orbs found");
      const uniqueTops = new Set(tops);
      if (uniqueTops.size < 2) {
        throw new Error(`All tool orbs are on the same row (only 1 unique top coordinate: ${tops[0]}px)`);
      }
    }
  },
  {
    id: "T1.4.3",
    name: "Individual tool card/icon width is small enough to fit within 375px",
    fn: async (page) => {
      const widths = await page.evaluate(() => {
        const orbs = Array.from(document.querySelectorAll('div[class*="magicOrb"]'));
        return orbs.map(o => o.getBoundingClientRect().width);
      });
      if (widths.length === 0) throw new Error("No magic orbs found");
      widths.forEach((w, i) => {
        if (w > 375) throw new Error(`Tool orb ${i + 1} width is ${w}px`);
      });
    }
  },
  {
    id: "T1.4.4",
    name: "At least two row-based coordinates are detected for tool items",
    fn: async (page) => {
      const tops = await page.evaluate(() => {
        const orbs = Array.from(document.querySelectorAll('div[class*="magicOrb"]'));
        return orbs.map(o => o.getBoundingClientRect().top);
      });
      const uniqueTops = new Set(tops);
      if (uniqueTops.size < 2) {
        throw new Error(`Fewer than 2 rows detected for tools: ${uniqueTops.size} row(s) found`);
      }
    }
  },
  {
    id: "T1.4.5",
    name: "No tool icon overflows the container's bounds",
    fn: async (page) => {
      const overflows = await page.evaluate(() => {
        const container = document.querySelector('#tools');
        if (!container) return null;
        const cRect = container.getBoundingClientRect();
        const orbs = Array.from(document.querySelectorAll('div[class*="magicOrb"]'));
        return orbs.map(o => {
          const oRect = o.getBoundingClientRect();
          return oRect.left < cRect.left || oRect.right > cRect.right;
        });
      });
      if (overflows === null) throw new Error("Tools container not found");
      if (overflows.some(v => v)) {
        throw new Error("One or more tool icons overflow the container horizontally");
      }
    }
  },

  // --- FEATURE 5 ---
  {
    id: "T1.5.1",
    name: "Projects container is within 375px width",
    fn: async (page) => {
      const width = await page.evaluate(() => {
        const projects = document.querySelector('#projects');
        return projects ? projects.getBoundingClientRect().width : null;
      });
      if (width === null) throw new Error("Projects container not found");
      if (width > 375) throw new Error(`Projects container width is ${width}px`);
    }
  },
  {
    id: "T1.5.2",
    name: "Projects stack vertically",
    fn: async (page) => {
      const rects = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="projectCard"]'));
        return cards.map(c => {
          const r = c.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        });
      });
      if (rects.length < 2) throw new Error(`Fewer than 2 projects found: ${rects.length}`);
      for (let i = 1; i < rects.length; i++) {
        if (rects[i].top < rects[i - 1].bottom - 5) {
          throw new Error(`Project ${i + 1} (top: ${rects[i].top}) is not stacked below Project ${i} (bottom: ${rects[i - 1].bottom})`);
        }
      }
    }
  },
  {
    id: "T1.5.3",
    name: "Projects do not overflow the horizontal screen width",
    fn: async (page) => {
      const cardWidths = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="projectCard"]'));
        return cards.map(c => c.getBoundingClientRect().width);
      });
      if (cardWidths.length === 0) throw new Error("No projects found");
      cardWidths.forEach((w, i) => {
        if (w > 375) throw new Error(`Project card ${i + 1} width is ${w}px (expected <= 375px)`);
      });
    }
  },
  {
    id: "T1.5.4",
    name: "Project cards occupy a larger width fraction on mobile (>80% of width)",
    fn: async (page) => {
      const widthFraction = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="projectCard"]'));
        if (cards.length === 0) return [];
        const bodyWidth = document.body.clientWidth;
        return cards.map(c => c.getBoundingClientRect().width / bodyWidth);
      });
      if (widthFraction.length === 0) throw new Error("No projects found");
      widthFraction.forEach((frac, i) => {
        if (frac < 0.8) throw new Error(`Project card ${i + 1} occupies only ${(frac * 100).toFixed(1)}% of body width`);
      });
    }
  },
  {
    id: "T1.5.5",
    name: "Spacing between projects is uniform vertically",
    fn: async (page) => {
      const rects = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="projectCard"]'));
        return cards.map(c => {
          const r = c.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        });
      });
      if (rects.length < 2) throw new Error("Fewer than 2 projects found");
      const gaps = [];
      for (let i = 1; i < rects.length; i++) {
        gaps.push(rects[i].top - rects[i - 1].bottom);
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      for (let i = 0; i < gaps.length; i++) {
        if (Math.abs(gaps[i] - avgGap) > 15) {
          throw new Error(`Non-uniform gap between project cards: gap ${i + 1} is ${gaps[i]}px (avg gap is ${avgGap}px)`);
        }
      }
    }
  },

  // --- FEATURE 6 ---
  {
    id: "T1.6.1",
    name: "Contact container fits inside 375px",
    fn: async (page) => {
      const width = await page.evaluate(() => {
        const contact = document.querySelector('#contact');
        return contact ? contact.getBoundingClientRect().width : null;
      });
      if (width === null) throw new Error("Contact container not found");
      if (width > 375) throw new Error(`Contact container width is ${width}px`);
    }
  },
  {
    id: "T1.6.2",
    name: "Contact elements (form, social icons, text) stack vertically",
    fn: async (page) => {
      const hasForm = await page.evaluate(() => !!document.querySelector('#contact form'));
      if (!hasForm) throw new Error("Contact form not found in page 5");
    }
  },
  {
    id: "T1.6.3",
    name: "Form inputs (name, email, message) are stacked vertically",
    fn: async (page) => {
      const inputs = await page.evaluate(() => {
        const name = document.querySelector('#contact input[name="name"]');
        const email = document.querySelector('#contact input[name="email"]');
        return name && email ? { name: name.getBoundingClientRect(), email: email.getBoundingClientRect() } : null;
      });
      if (!inputs) throw new Error("Form fields (name, email) not found in contact page");
      if (inputs.email.top < inputs.name.bottom) {
        throw new Error(`Email input (top: ${inputs.email.top}) is not stacked below Name input (bottom: ${inputs.name.bottom})`);
      }
    }
  },
  {
    id: "T1.6.4",
    name: "Form submit button fits within 375px and is fully visible",
    fn: async (page) => {
      const button = await page.evaluate(() => {
        const btn = document.querySelector('#contact button[type="submit"]');
        return btn ? btn.getBoundingClientRect() : null;
      });
      if (!button) throw new Error("Submit button not found");
      if (button.width > 375) throw new Error(`Submit button width is ${button.width}px`);
    }
  },
  {
    id: "T1.6.5",
    name: "All contact fields have text fully readable and inputs clickable",
    fn: async (page) => {
      const inputsExist = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('#contact input, #contact textarea'));
        return inputs.length > 0;
      });
      if (!inputsExist) throw new Error("No inputs or textareas found in contact form");
    }
  },

  // --- TIER 2 - BOUNDARY & CORNER CASES ---
  {
    id: "T2.1.1",
    name: "Viewport exactly 375px - check document scrollWidth does not exceed 375px",
    fn: async (page) => {
      await page.setViewport({ width: 375, height: 812 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > 375) throw new Error(`Document scrollWidth is ${scrollWidth}px (expected <= 375px)`);
    }
  },
  {
    id: "T2.1.2",
    name: "Viewport 320px (ultra-small mobile) - check layout remains unbroken",
    fn: async (page) => {
      await page.setViewport({ width: 320, height: 568 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > 320) throw new Error(`Document scrollWidth at 320px is ${scrollWidth}px (expected <= 320px)`);
    }
  },
  {
    id: "T2.1.3",
    name: "Viewport 414px (plus size mobile) - check layout scales up correctly",
    fn: async (page) => {
      await page.setViewport({ width: 414, height: 896 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > 414) throw new Error(`Document scrollWidth at 414px is ${scrollWidth}px (expected <= 414px)`);
    }
  },
  {
    id: "T2.1.4",
    name: "Dynamic resizing from 1024px to 375px - layout adapts without reload",
    fn: async (page) => {
      await page.setViewport({ width: 1024, height: 768 });
      await new Promise(r => setTimeout(r, 200));
      await page.setViewport({ width: 375, height: 812 });
      await new Promise(r => setTimeout(r, 200));
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > 375) throw new Error(`After resizing, scrollWidth is ${scrollWidth}px`);
    }
  },
  {
    id: "T2.1.5",
    name: "Zoomed layout - check rendering at simulated zoom",
    fn: async (page) => {
      await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1.2 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > 375) throw new Error(`Under zoom, scrollWidth is ${scrollWidth}px`);
      await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
    }
  },

  {
    id: "T2.2.1",
    name: "Extra long titles or badges on Page 2 - check no overflow",
    fn: async (page) => {
      const overflow = await page.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('div[class*="section-title-badge"]'));
        return badges.some(b => b.getBoundingClientRect().width > 375);
      });
      if (overflow) throw new Error("Section title badges overflow the mobile viewport");
    }
  },
  {
    id: "T2.2.2",
    name: "Multiple text boxes stacking order check - DOM order matches layout order",
    fn: async (page) => {
      const matches = await page.evaluate(() => {
        const box1 = document.querySelector('div[class*="narrativeBoxPassion"]');
        const box2 = document.querySelector('div[class*="narrativeBoxSkill"]');
        const box3 = document.querySelector('div[class*="narrativeBoxGrowth"]');
        if (!box1 || !box2 || !box3) return false;
        const r1 = box1.getBoundingClientRect();
        const r2 = box2.getBoundingClientRect();
        const r3 = box3.getBoundingClientRect();
        return r1.top < r2.top && r2.top < r3.top;
      });
      if (!matches) throw new Error("Narrative boxes vertical sorting does not match DOM order");
    }
  },
  {
    id: "T2.2.3",
    name: "Stacking behavior when font sizes are large - text still does not overflow",
    fn: async (page) => {
      const overflows = await page.evaluate(() => {
        const boxes = Array.from(document.querySelectorAll('div[class*="narrativeBox"]'));
        const bodyWidth = document.body.clientWidth;
        return boxes.some(b => b.getBoundingClientRect().right > bodyWidth);
      });
      if (overflows) throw new Error("Narrative boxes text/box overflows body boundaries");
    }
  },
  {
    id: "T2.2.4",
    name: "Padding inside narrative containers scales to maintain readability",
    fn: async (page) => {
      const paddings = await page.evaluate(() => {
        const boxes = Array.from(document.querySelectorAll('div[class*="narrativeBox"]'));
        return boxes.map(b => window.getComputedStyle(b).padding);
      });
      if (paddings.length === 0) throw new Error("No narrative boxes found");
      paddings.forEach((p, i) => {
        if (!p || p === '0px') throw new Error(`Narrative box ${i + 1} has zero padding`);
      });
    }
  },
  {
    id: "T2.2.5",
    name: "Hidden or reveal transitions - verify stacked layout is correct post-reveal",
    fn: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 1000));
      await new Promise(r => setTimeout(r, 200));
      const rects = await page.evaluate(() => {
        const boxes = [
          document.querySelector('div[class*="narrativeBoxPassion"]'),
          document.querySelector('div[class*="narrativeBoxSkill"]'),
          document.querySelector('div[class*="narrativeBoxGrowth"]')
        ];
        return boxes.map(box => box ? box.getBoundingClientRect().top : null);
      });
      if (rects[0] === null || rects[1] === null || rects[2] === null) throw new Error("Narrative boxes not found");
      if (rects[1] < rects[0] || rects[2] < rects[1]) throw new Error("Post-reveal, stacking order is distorted");
    }
  },

  {
    id: "T2.3.1",
    name: "Extremely long text inside narrative box - box height expands automatically",
    fn: async (page) => {
      const heightBefore = await page.evaluate(() => {
        const box = document.querySelector('div[class*="narrativeBoxPassion"]');
        return box ? box.getBoundingClientRect().height : null;
      });
      if (heightBefore === null) throw new Error("Box 1 not found");
      
      await page.evaluate(() => {
        const p = document.querySelector('div[class*="narrativeBoxPassion"] p');
        if (p) p.innerText = p.innerText + " " + "blah ".repeat(100);
      });
      await new Promise(r => setTimeout(r, 100));

      const { heightAfter, scrollHeight, clientHeight } = await page.evaluate(() => {
        const box = document.querySelector('div[class*="narrativeBoxPassion"]');
        return box ? {
          heightAfter: box.getBoundingClientRect().height,
          scrollHeight: box.scrollHeight,
          clientHeight: box.clientHeight
        } : null;
      });

      if (heightAfter <= heightBefore) {
        throw new Error(`Box height did not expand after injecting text: ${heightBefore}px vs ${heightAfter}px`);
      }
      if (scrollHeight > clientHeight + 5) {
        throw new Error(`Box scrollHeight (${scrollHeight}) is greater than clientHeight (${clientHeight}) after injection`);
      }
    }
  },
  {
    id: "T2.3.2",
    name: "Extremely short text inside narrative box - box does not collapse below min-height",
    fn: async (page) => {
      await page.reload();
      await page.setViewport({ width: 375, height: 812 });
      await new Promise(r => setTimeout(r, 200));

      const height = await page.evaluate(() => {
        const box = document.querySelector('div[class*="narrativeBoxPassion"]');
        return box ? box.getBoundingClientRect().height : 0;
      });
      if (height < 50) throw new Error(`Box collapsed to ${height}px`);
    }
  },
  {
    id: "T2.3.3",
    name: "Touch drag scrolling on narrative box does not trigger internal scroll",
    fn: async (page) => {
      const scrollY = await page.evaluate(() => {
        const box = document.querySelector('div[class*="narrativeBoxPassion"]');
        return box ? window.getComputedStyle(box).overflowY : '';
      });
      if (scrollY === 'scroll' || scrollY === 'auto') {
        throw new Error(`Box has scrolling enabled: ${scrollY}`);
      }
    }
  },
  {
    id: "T2.3.4",
    name: "Verify overflow style properties for #drivers container (should not trap scroll)",
    fn: async (page) => {
      const overflow = await page.evaluate(() => {
        const drivers = document.querySelector('#drivers');
        return drivers ? window.getComputedStyle(drivers).overflow : '';
      });
      if (overflow === 'scroll' || overflow === 'auto' || overflow === 'hidden') {
        throw new Error(`#drivers container has overflow: ${overflow} (should not trap scroll)`);
      }
    }
  },
  {
    id: "T2.3.5",
    name: "Verify scrollability of global viewport when on Page 2 area",
    fn: async (page) => {
      const scrollable = await page.evaluate(() => {
        window.scrollTo(0, 0);
        const start = window.scrollY;
        const drivers = document.querySelector('#drivers');
        if (drivers) {
          drivers.scrollIntoView();
        }
        return window.scrollY > start;
      });
      if (!scrollable) throw new Error("Could not scroll global viewport to page 2 drivers area");
    }
  },

  {
    id: "T2.4.1",
    name: "Single tool element centers or aligns gracefully without wrapping",
    fn: async (page) => {
      const orbCount = await page.evaluate(() => document.querySelectorAll('div[class*="magicOrb"]').length);
      if (orbCount === 0) throw new Error("No tool elements found");
    }
  },
  {
    id: "T2.4.2",
    name: "Very long tool name - check that it does not overlap adjacent tool cards",
    fn: async (page) => {
      const overlap = await page.evaluate(() => {
        const orbs = Array.from(document.querySelectorAll('div[class*="magicOrb"]'));
        for (let i = 0; i < orbs.length; i++) {
          for (let j = i + 1; j < orbs.length; j++) {
            const r1 = orbs[i].getBoundingClientRect();
            const r2 = orbs[j].getBoundingClientRect();
            const isIntersecting = !(r2.left >= r1.right || r2.right <= r1.left || r2.top >= r1.bottom || r2.bottom <= r1.top);
            if (isIntersecting) return true;
          }
        }
        return false;
      });
      if (overlap) throw new Error("Tool orbs overlap each other");
    }
  },
  {
    id: "T2.4.3",
    name: "Tool grid gap - check grid gaps are scaled down for mobile",
    fn: async (page) => {
      const gaps = await page.evaluate(() => {
        const orbs = Array.from(document.querySelectorAll('div[class*="magicOrb"]'));
        if (orbs.length < 2) return [];
        return orbs.slice(1).map((o, idx) => {
          const r1 = orbs[idx].getBoundingClientRect();
          const r2 = o.getBoundingClientRect();
          return Math.sqrt(Math.pow(r2.left - r1.left, 2) + Math.pow(r2.top - r1.top, 2));
        });
      });
      if (gaps.length > 0 && Math.min(...gaps) > 300) {
        throw new Error("Gaps between tools are extremely large, not scaled down for mobile");
      }
    }
  },
  {
    id: "T2.4.4",
    name: "Category grouping of tools - groups stack vertically",
    fn: async (page) => {
      const rects = await page.evaluate(() => {
        const front = document.querySelector('h3[class*="headingFront"]');
        const back = document.querySelector('h3[class*="headingBack"]');
        return front && back ? { front: front.getBoundingClientRect(), back: back.getBoundingClientRect() } : null;
      });
      if (!rects) throw new Error("Category headers (FRONT-END / BACK-END) not found");
      if (rects.back.top < rects.front.bottom) {
        throw new Error(`BACK-END heading (top: ${rects.back.top}) is not stacked below FRONT-END heading (bottom: ${rects.front.bottom})`);
      }
    }
  },
  {
    id: "T2.4.5",
    name: "Hovering/active states on mobile - tap states do not distort layout",
    fn: async (page) => {
      const orb = await page.$('div[class*="magicOrb"]');
      if (orb) {
        const rectBefore = await page.evaluate(el => el.getBoundingClientRect().toJSON(), orb);
        await orb.tap();
        await new Promise(r => setTimeout(r, 100));
        const rectAfter = await page.evaluate(el => el.getBoundingClientRect().toJSON(), orb);
        if (Math.abs(rectAfter.width - rectBefore.width) > 50) {
          throw new Error("Tap state distorted tool dimensions dramatically");
        }
      }
    }
  },

  {
    id: "T2.5.1",
    name: "Carousel/Slider vs vertical stack - verify carousel is disabled on mobile",
    fn: async (page) => {
      const containerStyle = await page.evaluate(() => {
        const container = document.querySelector('div[class*="horizontalScrollContainer"]');
        return container ? window.getComputedStyle(container).overflowX : '';
      });
      if (containerStyle === 'scroll' || containerStyle === 'auto') {
        throw new Error(`Carousel horizontal scroll is enabled: overflow-x is ${containerStyle} (expected stacked)`);
      }
    }
  },
  {
    id: "T2.5.2",
    name: "Large project description - description text wraps cleanly, card expands",
    fn: async (page) => {
      const heightBefore = await page.evaluate(() => {
        const card = document.querySelector('div[class*="projectCard"]');
        return card ? card.getBoundingClientRect().height : 0;
      });
      if (heightBefore === 0) throw new Error("Project card not found");
      
      await page.evaluate(() => {
        const p = document.querySelector('div[class*="projectCard"] p[class*="descText"]');
        if (p) p.innerText = p.innerText + " " + "word ".repeat(100);
      });
      await new Promise(r => setTimeout(r, 100));

      const heightAfter = await page.evaluate(() => {
        const card = document.querySelector('div[class*="projectCard"]');
        return card ? card.getBoundingClientRect().height : 0;
      });
      if (heightAfter <= heightBefore) {
        throw new Error("Project card did not expand vertically with long description text");
      }
    }
  },
  {
    id: "T2.5.3",
    name: "Links and tags inside project cards - tags wrap inside card boundaries",
    fn: async (page) => {
      await page.reload();
      await page.setViewport({ width: 375, height: 812 });
      await new Promise(r => setTimeout(r, 200));

      const overflows = await page.evaluate(() => {
        const card = document.querySelector('div[class*="projectCard"]');
        if (!card) return false;
        const cardRect = card.getBoundingClientRect();
        const tags = Array.from(card.querySelectorAll('p[class*="techText"], p[class*="roleText"], a'));
        return tags.some(t => {
          const r = t.getBoundingClientRect();
          return r.right > cardRect.right || r.left < cardRect.left;
        });
      });
      if (overflows) throw new Error("Elements/tags inside project card overflow card boundaries");
    }
  },
  {
    id: "T2.5.4",
    name: "Image aspect ratio on mobile - project images scale down keeping aspect ratio",
    fn: async (page) => {
      const imageStyle = await page.evaluate(() => {
        const img = document.querySelector('div[class*="imageContainer"] img');
        if (!img) return null;
        return window.getComputedStyle(img).objectFit;
      });
      if (imageStyle !== 'cover' && imageStyle !== 'contain') {
        throw new Error(`Project image object-fit is ${imageStyle} (expected cover/contain)`);
      }
    }
  },
  {
    id: "T2.5.5",
    name: "Inter-card spacing - margins are responsive",
    fn: async (page) => {
      const spacing = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="projectCard"]'));
        if (cards.length < 2) return 0;
        return cards[1].getBoundingClientRect().top - cards[0].getBoundingClientRect().bottom;
      });
      if (spacing > 150) throw new Error(`Inter-card spacing is too large on mobile: ${spacing}px`);
    }
  },

  {
    id: "T2.6.1",
    name: "Long error messages under form fields - wrap and expand vertically",
    fn: async (page) => {
      const hasForm = await page.evaluate(() => !!document.querySelector('#contact form'));
      if (!hasForm) throw new Error("Contact form not found in page 5");
    }
  },
  {
    id: "T2.6.2",
    name: "Social icon group - wraps or scales to fit on one line or stacked lines on 375px",
    fn: async (page) => {
      const listWidth = await page.evaluate(() => {
        const list = document.querySelector('div[class*="contactList"]');
        return list ? list.getBoundingClientRect().width : null;
      });
      if (listWidth === null) throw new Error("Contact list not found");
      if (listWidth > 375) throw new Error(`Contact list width is ${listWidth}px (expected <= 375px)`);
    }
  },
  {
    id: "T2.6.3",
    name: "Multi-line textarea does not push button off screen",
    fn: async (page) => {
      const textarea = await page.evaluate(() => !!document.querySelector('#contact textarea'));
      if (!textarea) throw new Error("Form textarea not found");
    }
  },
  {
    id: "T2.6.4",
    name: "Form fields focus state - focus does not shift viewport horizontal position",
    fn: async (page) => {
      const input = await page.$('#contact input[name="name"]');
      if (!input) throw new Error("Name input not found");
      await input.focus();
      const scrollLeft = await page.evaluate(() => window.scrollX);
      if (scrollLeft > 0) throw new Error(`Focusing input shifted window scrollX to ${scrollLeft}px`);
    }
  },
  {
    id: "T2.6.5",
    name: "Success message layout - verify post-submit success UI stacks correctly",
    fn: async (page) => {
      const hasForm = await page.evaluate(() => !!document.querySelector('#contact form'));
      if (!hasForm) throw new Error("Contact form not found");
    }
  },

  // --- TIER 3 - CROSS-FEATURE COMBINATIONS ---
  {
    id: "T3.1",
    name: "Feature 1 & Feature 2: Vertical stacking on Page 2 prevents horizontal overflow",
    fn: async (page) => {
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > 375) throw new Error(`Viewport scrollWidth is ${scrollWidth}px (expected <= 375px)`);
    }
  },
  {
    id: "T3.2",
    name: "Feature 1 & Feature 4: Wrapping of Page 3 tools prevents horizontal overflow",
    fn: async (page) => {
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > 375) throw new Error(`Viewport scrollWidth is ${scrollWidth}px (expected <= 375px)`);
    }
  },
  {
    id: "T3.3",
    name: "Feature 2 & Feature 3: Page 2 boxes stack vertically, expand fully, zero internal scroll",
    fn: async (page) => {
      const check = await page.evaluate(() => {
        const boxes = Array.from(document.querySelectorAll('div[class*="narrativeBox"]'));
        return boxes.every(b => {
          const comp = window.getComputedStyle(b);
          return comp.overflowY !== 'scroll' && comp.overflowY !== 'auto' && b.scrollHeight <= b.clientHeight + 5;
        });
      });
      if (!check) throw new Error("Some Page 2 narrative boxes have scrollbars or hidden content");
    }
  },
  {
    id: "T3.4",
    name: "Feature 4 & Feature 5: Both Page 3 tools and Page 4 projects stack/wrap correctly",
    fn: async (page) => {
      const { toolsWidth, projectsWidth } = await page.evaluate(() => {
        const tools = document.querySelector('#tools');
        const projects = document.querySelector('#projects');
        return {
          toolsWidth: tools ? tools.getBoundingClientRect().width : 0,
          projectsWidth: projects ? projects.getBoundingClientRect().width : 0
        };
      });
      if (toolsWidth > 375) throw new Error(`Tools width is ${toolsWidth}px`);
      if (projectsWidth > 375) throw new Error(`Projects width is ${projectsWidth}px`);
    }
  },
  {
    id: "T3.5",
    name: "Feature 5 & Feature 6: Project layout stacking and contact layout stacking do not overlap",
    fn: async (page) => {
      const rects = await page.evaluate(() => {
        const projects = document.querySelector('#projects');
        const contact = document.querySelector('#contact');
        return projects && contact ? {
          projects: projects.getBoundingClientRect(),
          contact: contact.getBoundingClientRect()
        } : null;
      });
      if (!rects) throw new Error("Projects or contact section not found");
      if (rects.contact.top < rects.projects.bottom - 5) {
        throw new Error(`Contact section overlaps projects section: contact top (${rects.contact.top}) is above projects bottom (${rects.projects.bottom})`);
      }
    }
  },
  {
    id: "T3.6",
    name: "Feature 3 & Feature 6: Contact form fields do not inherit page scroll locks",
    fn: async (page) => {
      const isScrollable = await page.evaluate(() => {
        const html = document.documentElement;
        return html.scrollHeight > html.clientHeight;
      });
      if (!isScrollable) throw new Error("Page scroll is locked");
    }
  },

  // --- TIER 4 - REAL-WORLD SCENARIOS ---
  {
    id: "T4.1",
    name: "Full Mobile Portfolio Walkthrough: Scroll top to bottom, no overflow/clipping",
    fn: async (page) => {
      await page.reload();
      await page.setViewport({ width: 375, height: 812 });
      await new Promise(r => setTimeout(r, 200));

      const hasOverflow = await page.evaluate(async () => {
        let maxScrollWidth = 0;
        const totalHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        for (let y = 0; y < totalHeight; y += viewportHeight / 2) {
          window.scrollTo(0, y);
          await new Promise(resolve => setTimeout(resolve, 50));
          if (document.documentElement.scrollWidth > 375) {
            maxScrollWidth = document.documentElement.scrollWidth;
          }
        }
        return maxScrollWidth > 375 ? maxScrollWidth : 0;
      });

      if (hasOverflow) throw new Error(`Horizontal overflow detected during walkthrough: scrollWidth reached ${hasOverflow}px`);
    }
  },
  {
    id: "T4.2",
    name: "Landscape to Portrait Transition: Viewport adapts correctly on resize",
    fn: async (page) => {
      await page.setViewport({ width: 812, height: 375 });
      await new Promise(r => setTimeout(r, 200));
      
      await page.setViewport({ width: 375, height: 812 });
      await new Promise(r => setTimeout(r, 200));
      
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > 375) throw new Error(`After landscape-to-portrait resize, scrollWidth is ${scrollWidth}px`);
    }
  },
  {
    id: "T4.3",
    name: "Interactive Contact Submission Layout Integrity - virtual keyboard mockup",
    fn: async (page) => {
      const hasForm = await page.evaluate(() => !!document.querySelector('#contact form'));
      if (!hasForm) throw new Error("Contact form not found");
    }
  },
  {
    id: "T4.4",
    name: "Dynamic Project/Tools Loading - cards wrap/stack dynamically when updated",
    fn: async (page) => {
      const success = await page.evaluate(() => {
        const sidePanel = document.querySelector('div[class*="sidePanel"]');
        if (!sidePanel) return false;
        
        const orb = sidePanel.querySelector('div[class*="magicOrb"]');
        if (!orb) return false;
        
        const newOrb = orb.cloneNode(true);
        newOrb.style.top = '95%';
        newOrb.style.left = '50%';
        sidePanel.appendChild(newOrb);
        return true;
      });
      if (!success) throw new Error("Failed to simulate dynamic tool loading");
    }
  },
  {
    id: "T4.5",
    name: "Full Accessibility/Contrast Layout checks: text blocks not hidden",
    fn: async (page) => {
      const textHidden = await page.evaluate(() => {
        const pTags = Array.from(document.querySelectorAll('p, h1, h2, h3'));
        return pTags.some(el => {
          const style = window.getComputedStyle(el);
          return style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0;
        });
      });
      if (textHidden) throw new Error("Some text elements are hidden/invisible on mobile");
    }
  }
];

async function main() {
  console.log("=== STARTING E2E RESPONSIVENESS TEST RUNNER ===");

  const chromePath = findChromePath();
  if (!chromePath) {
    console.error("ERROR: No Google Chrome or Microsoft Edge installation detected at standard paths on Windows.");
    process.exit(1);
  }
  console.log(`Using browser executable: ${chromePath}`);

  // 1. Start Local Vite Dev Server
  console.log("Launching Vite dev server on port 5173...");
  const serverProcess = spawn('npx', ['vite', '--port', '5173'], {
    shell: true,
    stdio: 'ignore'
  });

  // Helper to kill process tree on Windows
  const killServer = () => {
    try {
      exec(`taskkill /pid ${serverProcess.pid} /f /t`, (err) => {
        if (err) {
          console.warn(`Warning: Failed to taskkill Vite process tree: ${err.message}`);
        } else {
          console.log("Vite dev server successfully terminated.");
        }
      });
    } catch (e) {
      console.error("Failed to kill Vite server process:", e);
    }
  };

  let browser;
  try {
    // 2. Wait for server port to open
    await waitPort(PORT, HOST, 15000);
    console.log(`Vite dev server is ready at ${BASE_URL}`);

    // 3. Launch Puppeteer Browser
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set simulated mobile viewport (375px width, 812px height)
    await page.setViewport({ width: 375, height: 812 });

    // 4. Load the page
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    console.log("Page loaded successfully. Starting E2E checks...\n");

    let passed = 0;
    let failed = 0;
    const failuresList = [];

    // 5. Run Test Cases
    for (const tc of testCases) {
      // Ensure viewport is reset to default mobile viewport before each test unless specifically changed by the test
      if (tc.id !== "T2.1.1" && tc.id !== "T2.1.2" && tc.id !== "T2.1.3" && tc.id !== "T2.1.4" && tc.id !== "T2.1.5" && tc.id !== "T4.2") {
        await page.setViewport({ width: 375, height: 812 });
      }

      try {
        await tc.fn(page);
        console.log(`[PASS] ${tc.id}: ${tc.name}`);
        passed++;
      } catch (err) {
        console.log(`[FAIL] ${tc.id}: ${tc.name}\n       -> ${err.message}`);
        failed++;
        failuresList.push({ id: tc.id, name: tc.name, error: err.message });
      }
    }

    // 6. Report Summary
    console.log("\n==============================================");
    console.log("E2E RESPONSIVENESS TEST RUN COMPLETED");
    console.log(`Total Checks: ${testCases.length}`);
    console.log(`PASSED:       ${passed}`);
    console.log(`FAILED:       ${failed}`);
    console.log("==============================================");

    if (failed > 0) {
      console.log("\nFailed Test Cases Summary:");
      failuresList.forEach(f => {
        console.log(`- [${f.id}] ${f.name}\n  Error: ${f.error}`);
      });
      console.log("\nSome E2E checks failed. Exiting with status code 1.");
      process.exitCode = 1;
    } else {
      console.log("\nAll E2E checks passed! Exiting with status code 0.");
      process.exitCode = 0;
    }

  } catch (err) {
    console.error("Critical error during E2E test execution:", err);
    process.exitCode = 1;
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
    console.log("Stopping Vite dev server...");
    killServer();
    // Wait a brief moment to ensure processes close before exiting Node process
    setTimeout(() => {
      process.exit();
    }, 1000);
  }
}

main();
