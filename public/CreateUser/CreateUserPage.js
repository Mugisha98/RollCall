$(() => {
  $("#nav-placeholder").load("./../navbar/navbar.html");
});

const roleInput = document.getElementById("role");
// Get courses based on default role selected
getCoursesBasedOnRole(roleInput.value);
// Eventlistener to listen to changes to roll and get according courses
roleInput.addEventListener("change", () => {
  getCoursesBasedOnRole(roleInput.value);
});

// checks the role and calls the according get courses method
function getCoursesBasedOnRole(role) {
  if (role === "student") {
    getCourses();
  } else if (role === "teacher") {
    getCoursesWithNoTeacher();
  }
}

// Gets all courses
async function getCourses() {
  try {
    await $.ajax({
      method: "GET",
      url: "/courses",
      dataType: "json",
    }).done(function (courses) {
      buildTable(courses);
    });
  } catch (error) {
    console.log(error);
  }
}

// Gets courses with no teachers
async function getCoursesWithNoTeacher() {
  try {
    await $.ajax({
      method: "GET",
      url: "/courses/noTeacher/", // Find better path
      dataType: "json",
    }).done(function (courses) {
      buildTable(courses);
    });
  } catch (error) {
    console.log(error);
  }
}

// Builds html table based on courses retrieved
function buildTable(courses) {
  let body = "<tr id=courseBody>";
  body += "<th>Course Name</th>";
  body += "<th></th>"; // not sure if empty table header is necessary
  body += "</tr>";

  $.each(courses, function (i, course) {
    body += "<tr>";
    body += "<td>" + course.courseName + "</td>";
    body +=
      '<td><input class="form-check-input" type="checkbox" id="courses" name="courses" value="' +
      course.courseName +
      '"></td>';
    body += "</tr>";
  });
  body += "</table>";
  document.getElementById("course-table").innerHTML = body;
}

async function createUser() {
  const responseText = document.getElementById("response-status");

  // get checked courses
  const courses = [];
  $("input:checkbox[name=courses]:checked").each(function () {
    courses.push($(this).val());
  });

  const formData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    password: document.getElementById("password").value,
    email: document.getElementById("email").value,
    role: document.getElementById("role").value,
    courses: courses,
  };

  try {
    await $.ajax({
      method: "POST",
      url: "/user",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({ user: formData }),
    }).done(function (data) {
      console.log(data);
      responseText.innerText = "Success";
    });
  } catch (error) {
    console.log(error);
    responseText.innerText = error.responseJSON.message;
  }
}
