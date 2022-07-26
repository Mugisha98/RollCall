$(() => {
    $("#nav-placeholder").load("./../navbar/navbar.html");
});

let params = (new URL(document.location)).searchParams
const courseName = params.get("courseName")

const code = document.getElementById("code")
document.getElementById('course').innerText = courseName;

fetch("/generateRandomCode", {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
      },
    body: JSON.stringify({courseName})
    
})
.then(response => response.json())
.then(data => {
        code.innerText = "#"+data.autoGeneratedCode
        code.hidden = false;
        countdown( "ten-countdown", data.timeToLive, 0 )
    });


function countdown( elementName, minutes, seconds )
    {
    var element, endTime, hours, mins, msLeft, time;

    function twoDigits( n )
    {
        return (n <= 9 ? "0" + n : n);
    }

    function updateTimer()
    {
        msLeft = endTime - (+new Date);
        if ( msLeft < 1000 ) {
            element.innerHTML = "Time is up!";
            document.getElementById("code").style.display = "none";
        } else {
            time = new Date( msLeft );
            hours = time.getUTCHours();
            mins = time.getUTCMinutes();
            element.innerHTML = (hours ? hours + ':' + twoDigits( mins ) : mins) + ':' + twoDigits( time.getUTCSeconds() );
            setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
        }
    }

    element = document.getElementById( elementName );
    endTime = (+new Date) + 1000 * (60*minutes + seconds) + 500;
    updateTimer();
}

//countdown( "ten-countdown", 10, 0 );