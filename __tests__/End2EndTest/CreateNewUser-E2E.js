const { Builder, By, until } = require("selenium-webdriver");
const User = require("./../../models/User");
const mongoose = require("mongoose");
require("dotenv").config();

jest.setTimeout(30000); // Due to ajax calls and length of e2e test

// test data
const [testUserFirstName, testUserLastName, testUserPassword, testUserEmail] =
    ["Testuser", "Testuser", "testtesT1", "test1234@stud.kea.dk"];

test("Create new user", async function () {
  const driver = await new Builder().forBrowser("chrome").build();

  await driver.get("http://localhost:8080/");

  // Sign in as an admin
  await driver.manage().window().setRect({ width: 1920, height: 1113 });
  await driver.findElement(By.id("username")).click();
  await driver.findElement(By.id("username")).sendKeys("admin@kea.dk");
  await driver.findElement(By.id("password")).sendKeys("testtest");
  await driver.findElement(By.id("login-button")).click();

  // Click on create user
  await driver.wait(until.elementLocated(By.id("create-user")));
  await driver.findElement(By.id("create-user")).click();

  // Fill out user information and submit
  await driver.findElement(By.id("firstName")).sendKeys(testUserFirstName);
  await driver.findElement(By.id("lastName")).sendKeys(testUserLastName);
  await driver.findElement(By.id("password")).sendKeys(testUserPassword);
  await driver.findElement(By.id("email")).sendKeys(testUserEmail);
  await driver.wait(until.elementLocated(By.id("courseBody"))); // courseBody test for e2e test
  await driver.findElement(By.id("courses")).click();
  await driver.findElement(By.id("courses")).submit();

  // Wait for server to respond with success and display msg for user -
  await driver.wait(
    until.elementTextContains(
      driver.findElement(By.id("response-status")),
      "Success"
    )
  );

  // Sign out
  await driver.findElement(By.id("signOut")).click();
  
  // Sign in with new user
  await driver.wait(until.titleIs("Role Call System"));
  await driver.findElement(By.id("username")).click();
  await driver.findElement(By.id("username")).sendKeys(testUserEmail);
  await driver.findElement(By.id("password")).sendKeys(testUserPassword);
  await driver.findElement(By.id("login-button")).click();

  // Ensure login and correct frontpage for student
  await driver.wait(until.titleIs("Student Page"));

  await driver.quit();
});

// cleanup after tests
afterAll(async () => {
  mongoose.connect(process.env.DB)
    .then(
      await User.findOneAndDelete({email: testUserEmail})
    ).then (mongoose.connection.close());
});