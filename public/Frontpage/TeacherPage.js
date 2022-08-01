$(() => {
    $("#nav-placeholder").load("./../navbar/navbar.html");
});

// Get courses upon document load
(async function getCourses() {
    try {
        await $.ajax({
            method: "GET",
            url: "/courses/token",
            dataType: "json"
        }).done(function (data) {
            console.log(data)
            $.each(data, function (i, courses) {
                var body = "<div class=\"teacher-overview-column\">";

                body += "<h2>" + courses.courseName + "</h2>";
                body += "<a class='btn btn-success d-block w-50  mx-auto mb-3' href='/registerLecture\?courseName="+ courses.courseName +"'>  Register </a>";
                body += "<a class='btn btn-primary d-block w-50  mx-auto' href='/statisticsPage?id="+ courses._id+"'>Statistics</a>";
                body += "</div>"

                $(".overview-section .row").append(body);
            });
        })
    } catch (error) {
        console.log(error);
    };
})();

// ========================================================= 
// Get an employee by it's id
function getEmployeesById(id) {
    try {
           $.ajax({
                method: "GET",
                url: "/employees/" + id,
                dataType: "json"
            }).done(
                function(user) {
                //$("#title").text(user.firstname);
                $("#updateFirstname").val(user.firstname);
                $("#updateLastname").val(user.lastname);
                $("#updateEmail").val(user.email);
                $("#updateRole").val(user.role);

                $("#updateEmployeeForm").attr("action", "/employees/" + user._id);
            }
        );
    } catch (error) {
        alert("Error")
        console.log(error);
    }
}
// =========================================================
// Update a employee by it's id
function updateEmployeeById(id) {
    try {
        $.ajax({
            method: "POST",
            url: "/employees/" + id,
            dataType: "json"
        }).done()
            location.reload()
        } catch (error) {
            console.log(error);
    }
}
// =========================================================
// Delete a project by its ID 

function deleteEmployeeById(id) {
    try {
        $.ajax({
            method: "DELETE",
            url: "/employees/" + id,
            dataType: "json"
        }).done(
            location.reload()
        );

    } catch (error) {
        alert("Error")
        console.log(error);
    }
    
};