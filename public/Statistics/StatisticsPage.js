$(() => {
  $("#nav-placeholder").load("./../navbar/navbar.html");
});

(async function getLectures() {
  const [dateArray, attArray] = [[], []];
  const urlParams = new URL(document.location).searchParams;
  const id = urlParams.get("id");
  try {
    await $.ajax({
      method: "GET",
      url: "/courses/id/" + id,
      dataType: "json",
    }).done((data) => {
      const studentAmount = data.studentAmount;
      createTotalTable(data, studentAmount);
      createStudentTable(data, studentAmount);

      document.querySelector("#courseName").innerText = data.courseName;

      $.each(data.lectures, (i, lecture) => {
        const date = formatDateString(lecture.date);
        const att = lecture.attendance.length;
        dateArray.push(date);
        attArray.push(att);
      });
      createChart(data, dateArray, attArray, studentAmount);
    });
  } catch (error) {
    console.log(error);
  }
})();

function createChart(course, dateArray, attArray, studentAmount) {
  const ctx = document.getElementById("myChart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: "bar",
    maintainAspectRatio: false,
    inGraphDataShow: true,
    responsive: true,

    data: {
      labels: dateArray,
      datasets: [
        {
          label: "Click a bar to view lecture specific stats",
          data: attArray,
          backgroundColor: ["rgba(75, 192, 192, 0.2)"],
          borderColor: ["rgba(75, 192, 192, 1)"],
          borderWidth: 1,
        },
      ],
    },
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: Math.round,
        font: {
          weight: "bold",
        },
      },
    },
    options: {
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 15,
          bottom: 0,
        },
      },
      scales: {
        y: {
          callback: (value, index, ticks) => {
            return this.getValueforLabel(val);
          },
          beginAtZero: true,
          max: studentAmount,
          stepSize: 5,
        },
      },
      onClick(e) {
        const activePoints = myChart.getElementsAtEventForMode(
          e,
          "nearest",
          {
            intersect: true,
          },
          false
        );
        const [{ index }] = activePoints;
        createTable(course.lectures.at(index), studentAmount);
      },
    },
  });
}

//create table for individual lecture table
function createTable(lecture, studentAmount) {
  let count = 0;

  let tableCode = "<h1>Attendees</h1>";
  tableCode += "<p> Date: " + formatDateString(lecture.date) + "</p>";
  tableCode +=
    "<p> Percentage Participation: " +
    ((lecture.attendance.length / studentAmount) * 100).toFixed(2) +
    "%</p>";
  tableCode += "<table class='table'>";
  tableCode += "<thead>";
  tableCode += "<tr>";
  tableCode += "<th>First Name</th>";
  tableCode += "<th>Last Name</th>";
  tableCode += "</tr>";
  tableCode += "</thead>";

  lecture.attendance.forEach((name) => {
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1] || "Unknown last name";

    count % 2 == 0
      ? (tableCode += "<tr>")
      : (tableCode += '<tr style="background-color: #D3D3D3">');

    tableCode += "<td>" + firstName + "</td>";
    tableCode += "<td>" + lastName + "</td>";
    tableCode += "<tr>";
    count++;
  });

  tableCode += "</table>";

  document.getElementById("table-container").innerHTML = tableCode;
  document.getElementById("table-container").style = "margin-bottom:200px";
}

function formatDateString(date) {
  const d = new Date(date);
  return d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
}

// create table for lecuter overview
function createTotalTable(data, studentAmount) {
  let count = 0;
  let tableCode = "<h1>By Lecture</h1>";

  tableCode += "<table class='table'>";
  tableCode += "<thead>";
  tableCode += "<tr>";
  tableCode += "<th>Date</th>";
  tableCode += "<th>Participation(%)</th>";
  tableCode += "</tr>";
  tableCode += "</thead>";

  data.lectures.forEach((attendance) => {
    count % 2 == 0
      ? (tableCode += "<tr>")
      : (tableCode += '<tr style="background-color: #D3D3D3">');
    count++;
    tableCode += "<td>" + formatDateString(attendance.date) + "</td>";
    tableCode +=
      "<td>" +
      ((attendance.attendance.length / studentAmount) * 100).toFixed(2) +
      "%</td>";
    tableCode += "<tr>";
  });

  tableCode += "</table>";

  document.getElementById("table-container").innerHTML = tableCode;
  document.getElementById("table-container").style = "margin-bottom:200px";
}

// creates table for individual students
function createStudentTable(data) {
  const map = new Map();
  let studentCounter = 0;

  let tableCode = getTableHtml();

  data.lectures.forEach((lecture) => {
    lecture.attendance.forEach((student) => {
      if (!map.has(student)) {
        map.set(student, 1);
      } else {
        let currentCount = map.get(student);
        map.set(student, (currentCount += 1));
      }
    });
  });

  for (const [name, count] of map) {
    studentCounter % 2 == 0
      ? (tableCode += "<tr>")
      : (tableCode += '<tr style="background-color: #D3D3D3">');
    tableCode += "<td>" + name + "</td>";
    tableCode +=
      "<td>" + ((count / data.lectures.length) * 100).toFixed(2) + "%</td>";
    tableCode += "<tr>";
    studentCounter++;
  }

  tableCode += "</table>";

  document.getElementById("student-table-container").innerHTML = tableCode;
  document.getElementById("student-table-container").style =
    "margin-bottom:200px";
}

function getTableHtml() {
  let tableCode = "<table class='table' style='width: 350px;'>";
  tableCode += "<h1>Student Table</h1>";
  tableCode += "<thead>";
  tableCode += "<tr>";
  tableCode += "<th>Name</th>";
  tableCode += "<th>Participation(%)</th>";
  tableCode += "</tr>";
  tableCode += "</thead>";
  return tableCode;
}
