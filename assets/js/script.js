// overlay loading start
const loadingDiv= document.getElementById('loading-overlay');
const loadingText= document.getElementById('loadingText');
        function showOverlay(setLoadingText) {
            if (!setLoadingText){
              var setLoadingText = "--Please Wait--";
            }
            loadingDiv.style.display = 'block';
            loadingText.textContent = setLoadingText;
        }
        // Function to hide the loading overlay
        function hideOverlay() {
          loadingDiv.style.display = 'none';
        }

// // Function to set a cookie
// function setCookie(name, value, days) {
//     const date = new Date();
//     date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//     const expires = "expires=" + date.toUTCString();
//     document.cookie = name + "=" + value + ";" + expires + ";path=/";
// }
// // Function to get a cookie by name
// function getCookie(name) {
//     const cname = name + "=";
//     const decodedCookie = decodeURIComponent(document.cookie);
//     const cookies = decodedCookie.split(';');
//     for (let i = 0; i < cookies.length; i++) {
//         let c = cookies[i];
//         while (c.charAt(0) == ' ') {
//             c = c.substring(1);
//         }
//         if (c.indexOf(cname) == 0) {
//             return c.substring(cname.length, c.length);
//         }
//     }
//     return "";
// }

// // Function to clear cookie by name
// function clearCookie(name) {
//     document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
// }

function setItem(name, value, days) {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (days * 24 * 60 * 60 * 1000));
    const itemData = {
        value: value,
        expiry: expiryDate.getTime()
    };
    localStorage.setItem(name, JSON.stringify(itemData));
}
function getItem(name) {
    const itemData = localStorage.getItem(name);
    if (itemData) {
        const parsedData = JSON.parse(itemData);
        const now = new Date().getTime();
        if (now < parsedData.expiry) {
            return parsedData.value;
        } else {
            localStorage.removeItem(name); // Remove expired item
        }
    }
    return "";
}
function clearItem(name) {
    localStorage.removeItem(name);
}


    showOverlay('--Please Wait--');
    const sessionToken = getItem('sessionToken');
    const userRole = getItem('userRole');
    function checkUserRole() {
        if (!sessionToken || !userRole) {
            window.location.href = 'index.html';
            return;       
        }
    fetch(`https://script.google.com/macros/s/AKfycbw5_DWeGtUZ8rjVukvAddNRLbrXnEPovlC6FSyyIjSg1ova1YzJ0uX07pgniR29OGBlBA/exec?action=validateRole&sessionToken=${encodeURIComponent(sessionToken)}&role=${encodeURIComponent(userRole)}`)
        .then(response => response.json())
        .then(data => {
            hideOverlay();
            if (!data.success) {
                alert(data.message);
                logout();
            } else {}
        })
    }
    checkUserRole();
// loggout code
let logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', function() {
    if (confirm("Are you sure you want to log out?")) {
        logout();
    }
});
function logout() {
        clearItem('sessionToken');
        clearItem('userRole');
        history.replaceState(null, null, 'index.html');
        window.location.href = 'index.html';
}
