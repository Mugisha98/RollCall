const { Builder, By, until } = require("selenium-webdriver");
require('chromedriver');

jest.setTimeout(30000); // Due to ajax calls and length of e2e test

test("Create and attend lecture", async function () {
  const driver = await new Builder().forBrowser("chrome").build();
  const inputVariables = {};

  await driver.get("http://localhost:8080/");

  // Sign in as a teacher
  await driver.manage().window().setRect({ width: 1920, height: 1113 });
  await driver.findElement(By.id("username")).click();
  await driver.findElement(By.id("username")).sendKeys("patrick@stud.kea.dk");
  await driver.findElement(By.id("password")).sendKeys("testtest");
  await driver.findElement(By.id("login-button")).click();

  // Generate a unique code for the current lecture
  await driver.wait(until.elementLocated(By.className("mx-auto mb-3")));
  await driver.findElement(By.linkText("Register")).click();
  await driver.wait(until.elementIsVisible(driver.findElement(By.id("code")))); // wait until code has been generated
  await driver.findElement(By.id("code")).click();
  inputVariables["code"] = await driver.findElement(By.id("code")).getText();

  //Sign out
  await driver.findElement(By.id("signOut")).click();

  // Sign in as a student
  await driver.wait(until.titleIs("Role Call System")); // wait till it has loaded login page (we should honestly fix spelling)
  await driver.findElement(By.id("username")).click();
  await driver.findElement(By.id("username")).sendKeys("amma0327@stud.kea.dk");
  await driver.findElement(By.id("password")).sendKeys("testtest");
  await driver.findElement(By.id("login-button")).click();

  // Insert the unique lecture code provided by the teacher
  await driver.wait(until.elementLocated(By.id("code")));
  await driver.findElement(By.id("code")).click();
  await driver.findElement(By.id("code")).sendKeys(inputVariables["code"]);
  await driver.findElement(By.id("submitInput")).click();

  // Wait for the server to respond and display success msg for user
  await driver.wait(
    until.elementTextContains(driver.findElement(By.id("error-msg")), "success")
  );
  await driver.quit();
});
