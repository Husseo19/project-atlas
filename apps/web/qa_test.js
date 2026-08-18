const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('pageerror', error => console.log('PAGE ERROR:', error.stack || error));
  page.on('console', msg => {
    if(msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('response', async response => {
    if (response.status() >= 400) {
      try {
        const text = await response.text();
        console.log(`API ERROR [${response.status()}] ${response.url()}:\n${text.substring(0, 1000)}`);
      } catch (e) {
        console.log(`API ERROR [${response.status()}] ${response.url()}: <could not read body>`);
      }
    }
  });

  try {
    console.log("Navigating to login page...");
    await page.goto('http://localhost:3000/login');
    
    console.log("Filling login form...");
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('husseo19@gmail.com');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill('forever');
    
    console.log("Clicking login...");
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    await loginButton.click({ force: true });
    
    console.log("Waiting for dashboard to load...");
    // Give it a few seconds to load the next page
    await page.waitForTimeout(3000);
    
    console.log("Clicking around: dashboard, certifications, training...");
    
    const clickLinkOrNavigate = async (textPattern, urlPath) => {
      console.log(`Checking ${textPattern}...`);
      const link = page.locator(`a:has-text("${textPattern}")`).first();
      if (await link.count() > 0) {
        console.log(`Clicking ${textPattern}...`);
        await link.click();
      } else {
        const hrefLink = page.locator(`a[href*="${urlPath}"]`).first();
        if (await hrefLink.count() > 0) {
          console.log(`Clicking ${textPattern} (href fallback)...`);
          await hrefLink.click();
        } else {
          console.log(`Could not find ${textPattern} link, navigating directly to /${urlPath}`);
          await page.goto(`http://localhost:3000/${urlPath}`);
        }
      }
      await page.waitForTimeout(2000);
    };

    await clickLinkOrNavigate("Dashboard", "dashboard");
    await clickLinkOrNavigate("Certifications", "certifications");
    await clickLinkOrNavigate("Training", "training");
    
    await page.waitForTimeout(2000); // Allow time for final errors
  } catch(e) {
    console.error("SCRIPT EXCEPTION:", e);
  } finally {
    console.log("Closing browser.");
    await browser.close();
  }
})();
