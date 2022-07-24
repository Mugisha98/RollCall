const UserController = require("../controllers/UserController");
const HomeController = require("../controllers/HomeController");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("./../models/User.js");
const mockingoose = require("mockingoose");


  test('Getting full name from cookie token', async () => {
    //arrange
    const token = UserController.signToken(new ObjectId("507f191e810c19729de860ea"), "teacher", "Lars Hansen");
    const req = { cookies: { token: token } };

    //act
    const nameFromToken = await HomeController.getNameFromToken(req);

    //assert
    expect(nameFromToken).toBe("Lars Hansen");
  });

  // parameterized test
  it.each(["teacher", "student", "admin"])("when the role is %s", async(text) =>{
    //arrange
    const token = UserController.signToken(new ObjectId("507f191e810c19729de860ea"), text, "Lars Hansen");
    const req = { cookies: { token: token } };

    //act
    const roleFromToken = await HomeController.getAttributeFromToken(req, "role");

    //assert
    expect(roleFromToken).toBe(text);

  })


  test('Getting id attribute from cookie token', async () => {
    //act
    const token = UserController.signToken(new ObjectId("507f191e810c19729de860ea"), "teacher", "Lars Hansen");
    const req = { cookies: { token: token } };
    const idFromToken = await HomeController.getAttributeFromToken(req, "id");

    //assert
    expect(idFromToken).toBe("507f191e810c19729de860ea");
  });


  test('Token should not be created if id is not a number', async () => {
    //act
    const token = UserController.signToken("123ava456", "teacher", "Lars Hansen");

    //assert
    expect(token).toBe(null);
  });


  test('Token should not be created if role is not teacher or student or admin', async () => {
    //act
    const token = UserController.signToken(new ObjectId("507f191e810c19729de860ea"), "teacher1", "Lars Hansen");

    //assert
    expect(token).toBe(null);
  });

  it.each(["Lars2 Hansen", "Lars 23", "Lars /", "", " "])("when the name is %s", async(text) => {
    // act
    const token = UserController.signToken(new ObjectId("507f191e810c19729de860ea"), "teacher", text);

    //asert
    expect(token).toBe(null);
  })

  test('Token should not be created if role is not teacher or student or admin', async () => {
    //act
    const token = UserController.signToken(new ObjectId("507f191e810c19729de860ea"), "teacher", "Lars 564Hansen");

    //assert
    expect(token).toBe(null);
  });


// User creation tests
describe("createUser", () => {
  const first_names = [
    // invalid
    ["", 400],   // length 0
    ["B", 400],  // length 1
    ["ThisNameIsVeryLongICanAlmostWriteANovelButYetIWontL", 400],     // length 51
    ["ThisNameIsVeryLongICanAlmostWriteANovelButYetIWontLents", 400], // length 55
    // valid
    ["Bo", 201],    // length 2
    ["Bob", 201],   // length 3
    ["Maelinkaminobiwankatrinkab", 201], // length 26
    ["ThisNameIsVeryLongICanAlmostWriteANovelButYetIWon", 201], // length 49
    ["ThisNameIsVeryLongICanAlmostWriteANovelButYetIWont", 201] // length 50
  ];
  
  // First name test
  it.each(first_names)('when first name is "%s" should return %s based on name length', async (name, code) => {
    // Arrange
    const fakeUser = getFakeStudent();
    fakeUser.firstName = name;
    const req = { body: { user: fakeUser } };
    let res = getRes();
    // Mock
    mockingoose(User).toReturn({}, 'save');
    mockingoose(User).toReturn(false, 'findOne');
  
    // Act
    res = await UserController.createUser(req, res);
  
    // Assert
    expect(res.statusCode).toBe(code);
  });
  

  const last_names = [
    // invalid
    ["", 400],   // length 0
    ["A", 400],  // length 1
    ["ThisNameIsVeryLongICanAlmostWriteANovelButYetIWontL", 400],     // length 51
    ["ThisNameIsVeryLongICanAlmostWriteANovelButYetIWontLents", 400], // length 55
    // valid
    ["So", 201],  // length 2
    ["Sol", 201], // length 3
    ["Maelinkaminobiwankatrinkab", 201], // length 26
    ["ThisNameIsVeryLongICanAlmostWriteANovelButYetIWon", 201], // length 49
    ["ThisNameIsVeryLongICanAlmostWriteANovelButYetIWont", 201] // length 50
  ];
  // Last name test
  it.each(last_names)('when last name is "%s" should return %s based on name length', async (name, code) => {
    // Arrange
    const fakeUser = getFakeStudent();
    fakeUser.lastName = name;
    const req = { body: { user: fakeUser } };
    let res = getRes();
    mockingoose(User).toReturn({}, 'save');
    mockingoose(User).toReturn(false, 'findOne');
  
  
    // Act
    res = await UserController.createUser(req, res);
  
    // Assert
    expect(res.statusCode).toBe(code);
  });
  
  // Teacher email tests
  const teacherMails = [
    // invalid
    ["", 400],                  // length 0
    ["@kead", 400],             // length 5
    ["tes@kea.dk", 400],        // length 10
    ["tests@kea.dk", 400],      // length 12
    ["teststons@kea.dk", 400],  // length 16
    // valid
    ["test@kea.dk", 201]  // length 11
  ];
  it.each(teacherMails)('when given teacher email "%s" should return %s based on email length', async (mail, code)=> {
   // Arrange
   const fakeUser = getFakeTeacher();
   fakeUser.email = mail;
   const req = { body: { user: fakeUser } };
   let res = getRes();
   mockingoose(User).toReturn({}, 'save');
   mockingoose(User).toReturn(false, 'findOne');
  
   // Act
   res = await UserController.createUser(req, res);
  
   // Assert
   expect(res.statusCode).toBe(code);
  });
  
  // Student email tests
  const studentMails = [
    // invalid
    ["", 400],                          // length 0
    ["benj@kea.d", 400],                // length 10
    ["benj123@stud.kea.dk", 400],       // length 19
    ["benj12345@stud.kea.dk", 400],     // length 21
    ["benj123456789@stud.kea.dk", 400], // length 25
    // valid
    ["benj1598@stud.kea.dk", 201]  // length 20
  ];
  it.each(studentMails)('when given student email "%s" should return %s based on email length', async(mail, code) => {
   // Arrange
   const fakeUser = getFakeStudent();
   fakeUser.email = mail;
   const req = { body: { user: fakeUser } };
   let res = getRes();
   mockingoose(User).toReturn({}, 'save');
   mockingoose(User).toReturn(false, 'findOne');
  
   // Act
   res = await UserController.createUser(req, res);
  
   // Assert
   expect(res.statusCode).toBe(code);
  });
  
  // User creation password tests
    // minimum length 8 and maximum length 30
  const passwords = [
    // invalid
    ["", 400],          // length 0
    ["Tes1", 400],      // length 4
    ["Test123", 400],   // length 7
    ["TestsTests123456789012345678901", 400],     // length 31
    ["TestsTests123456789012345678901Test", 400], // length 35
    // valid
    ["Test1234", 201],                      // length 8
    ["Test12345", 201],                     // length 9
    ["Test12345Test123432", 201],           // length 19
    ["TestsTests1234567890123456789", 201], // length 29
    ["TestsTests12345678901234567890", 201] // length 30
  ];
  it.each(passwords)('when given password "%s" should return %s based on length', async(password, code) => {
    // Arrange
    const fakeUser = getFakeStudent();
    fakeUser.password = password;
    const req = { body: { user: fakeUser } };
    let res = getRes();
     mockingoose(User).toReturn({}, 'save');
     mockingoose(User).toReturn(false, 'findOne');
    
    // Act
    res = await UserController.createUser(req, res);
    
    // Assert
    expect(res.statusCode).toBe(code);
  });
  
  
    // at least one uppercase
  const uppercasePasswords = [
    ["thisisan7", 400], // 0 uppercase - invalid
    ["Heresan8", 201],  // 1 uppercase - valid
    ["ThisBeen9", 201], // 2 uppercase - valid
  ];
  it.each(uppercasePasswords)('when given password "%s" should return %s based on amount of lowercase', async(password, code) => {
  // Arrange
  const fakeUser = getFakeStudent();
  fakeUser.password = password;
  const req = { body: { user: fakeUser } };
  let res = getRes();
   mockingoose(User).toReturn({}, 'save');
   mockingoose(User).toReturn(false, 'findOne');
  
  // Act
  res = await UserController.createUser(req, res);
  
  // Assert
  expect(res.statusCode).toBe(code);
  });
  
  
  // at least one lowercase
  const lowercasePasswords = [
    ["THISISAT7", 400], // 0 lowercase - invalid
    ["HERESaN8", 201],  // 1 lowercase - valid
    ["THISBeeN9", 201], // 2 lowercase - valid
  ];
  it.each(lowercasePasswords)('when given "%s" should return %s based on amount of lowercase', async (password, code) => {
    // Arrange
    const fakeUser = getFakeStudent();
    fakeUser.password = password;
    const req = { body: { user: fakeUser } };
    let res = getRes();
    mockingoose(User).toReturn({}, 'save');
    mockingoose(User).toReturn(false, 'findOne');
  
    // Act
    res = await UserController.createUser(req, res);
  
    // Assert
    expect(res.statusCode).toBe(code);
  });
  
  
  // at least one number
  const numberPasswords = [
    ["THISISAT", 400],    // 0 numbers - invalid
    ["HERESaN8", 201],    // 1 number  - valid
    ["THISBeeN99", 201],  // 2 numbers - valid
  ];
  it.each(numberPasswords)('when given "%s" should return %s based on amount of numbers', async (password, code) => {
    // Arrange
    const fakeUser = getFakeStudent();
    fakeUser.password = password;
    const req = { body: { user: fakeUser } };
    let res = getRes();
    mockingoose(User).toReturn({}, 'save');
    mockingoose(User).toReturn(false, 'findOne');
  
    // Act
    res = await UserController.createUser(req, res);
  
    // Assert
    expect(res.statusCode).toBe(code);
  }); 
  
  
    // this is a whitebox example since I can see it doesn't hit this statement (which is hidden in a decision)
      // exists is an object since our method expects that, it is there undefined if nothing is found
  it.each([{exists: {}, code: 409}, {exists: undefined, code: 201}])("Should return 409 if already exists", async (testData) => {
    // Arrange
    const fakeUser = getFakeStudent();
    const req = { body: { user: fakeUser } };
    let res = getRes();
    mockingoose(User).toReturn({}, 'save');
    mockingoose(User).toReturn(testData.exists, 'findOne');
  
    // Act
    res = await UserController.createUser(req, res);
  
    // Assert
    expect(res.statusCode).toBe(testData.code);
  }); //
    
  
  function getRes() { // TODO There has to be a better way than this...
    return {
      statusCode: null,
      body: null,
      status: function (code) {
        this.statusCode = code
        return this
      },
      json: function (json) {
        this.body = json
        return this
      }
    };
  }
  
  function getFakeStudent() {
    return {
      firstName: "Test",
      lastName: "Test",
      email: "test1234@stud.kea.dk",
      password: "Test1234",
      role: "student",
      courses: []
    };
  }
  
  function getFakeTeacher() {
    return {
      firstName: "Test",
      lastName: "Test",
      email: "test@kea.dk",
      password: "Test1234",
      role: "teacher",
      courses: []
    };
  }
});