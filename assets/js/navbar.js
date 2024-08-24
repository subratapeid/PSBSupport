// document.addEventListener("DOMContentLoaded", () => {
// document.addEventListener('DOMContentLoaded', showOverlay);
const body = document.querySelector("body");
const darkLight = document.querySelector("#darkLight");
const sidebar = document.querySelector(".sidebar");
const mainContainer = document.querySelector(".main");
const menuItems = document.querySelectorAll(".nav_link");
const submenuItems = document.querySelectorAll(".submenu_item");
const sidebarOpen = document.querySelector("#sidebarOpen");
const sidebarClose = document.querySelector(".collapse_sidebar");
const sidebarExpand = document.querySelector(".expand_sidebar");
const footerArea = document.querySelector(".footer");

// overlay loading start
// const loadingDiv= document.getElementById('loading-overlay');
// const loadingText= document.getElementById('loadingText');
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
// Hide loading overlay once the page is fully loaded
// window.addEventListener('load', hideOverlay);

// overlay loading end


// Function to initialize preferences from localStorage
const initializePreferences = () => {
  // Check for dark mode preference
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    body.classList.add("dark");
    darkLight.classList.replace("bx-sun", "bx-moon");
  } else {
    body.classList.remove("dark");
    darkLight.classList.replace("bx-moon", "bx-sun");
  }
  // Check for sidebar state preference
  const sidebarState = localStorage.getItem("sidebarState");
    if (sidebarState === "expanded") {
      sidebar.classList.remove("closed", "hoverable");
      sidebarOpen.classList.add("closed");
      mainContainer.classList.add("expand");
      footerArea.classList.remove("closed");
    }
};

sidebarOpen.addEventListener("click", () => {
  sidebar.classList.toggle("closed");
  sidebar.classList.add("hoverable");
  mainContainer.classList.toggle("expand");
  sidebarOpen.classList.toggle("closed");
});

sidebarClose.addEventListener("click", () => {
  sidebar.classList.add("closed", "hoverable");
  sidebarOpen.classList.remove("closed");
  footerArea.classList.add("closed");
  mainContainer.classList.remove("expand");
  // Save sidebar state
  localStorage.setItem("sidebarState", "collapsed");
});

sidebarExpand.addEventListener("click", () => {
  if (window.innerWidth > 768) {
  sidebar.classList.remove("closed", "hoverable");
  mainContainer.classList.add("expand");
  sidebarOpen.classList.add("closed");
  footerArea.classList.remove("closed");
  // Save sidebar state
  localStorage.setItem("sidebarState", "expanded");
  }
});

sidebar.addEventListener("mouseenter", () => {
  if (window.innerWidth > 768){
  if (sidebar.classList.contains("hoverable")) {
    sidebar.classList.remove("closed");
  }
}
});

sidebar.addEventListener("mouseleave", () => {
  if (window.innerWidth > 768){
  if (sidebar.classList.contains("hoverable")) {
    sidebar.classList.add("closed");
  }
}
});

// sidebar close by touch screen and cross button
function hideSidebarOnTouch(event) {
  if (!sidebar.contains(event.target) && !sidebarOpen.contains(event.target)) {
    sidebarOpen.classList.remove('closed');
      sidebar.classList.add('closed');
  }
}
// Add event listener for touchstart events on the document
document.addEventListener('touchstart', hideSidebarOnTouch);

darkLight.addEventListener("click", () => {
  body.classList.toggle("dark");
  if (body.classList.contains("dark")) {
    darkLight.classList.replace("bx-sun", "bx-moon");
    localStorage.setItem("darkMode", "enabled");
  } else {
    darkLight.classList.replace("bx-moon", "bx-sun");
    localStorage.setItem("darkMode", "disabled");
  }
});
// sub menu toggle function
submenuItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    item.classList.toggle("show_submenu");
    submenuItems.forEach((item2, index2) => {
      if (index !== index2) {
        item2.classList.remove("show_submenu");
      }
    });
  });
});

// Function to mark the active menu item based on URL
const markActiveMenuItem = () => {
  const currentPath = window.location.pathname; // Get the current URL path
  let activeLinkFound = false;
  console.log(`Active link: ${currentPath}`);

  menuItems.forEach((link) => {
    if (!activeLinkFound && link.pathname === currentPath) {
      link.classList.add("active");
      // console.log(`Active link: ${link.text}`);
      activeLinkFound = true; // Prevent other links from being activated  

      // If the link is within a submenu, add the show_submenu class to its parent
      const parentLi = link.closest("li");
      if (parentLi) {
        const parentSubmenuItem = parentLi.querySelector(".submenu_item");
        if (parentSubmenuItem) {
          parentSubmenuItem.classList.add("show_submenu");
        } else {
          // console.log("submenu_item not found");
        }
      }
      // Scroll to the active menu item if it's not in the sidebar's viewport or window's viewport
          link.scrollIntoView({ behavior: "smooth", block: "center" });
        
    } else {
      link.classList.remove("active");

      // Remove show_submenu class if link is not active
      const parentSubmenuItem = link.closest(".submenu_item");
      if (parentSubmenuItem) {
        parentSubmenuItem.classList.remove("show_submenu");
      }
    }
  });
};
  // Call the function on page load
markActiveMenuItem();
initializePreferences();     

// go back functionality
var urlMapping = {
  '/bcaudit/progress.php': '/bcaudit/audit-list.php',
  '/bcaudit/audit-list.php': '/bcaudit/dashboard.php',
  '/bcaudit/bca-bcpoint-details.php': '/bcaudit/progress.php',
  '/bcaudit/operational-details.php': '/bcaudit/bca-bcpoint-details.php',
  '/bcaudit/hardware-infrastructure.php': '/bcaudit/operational-details.php',
  '/bcaudit/register-maintenance.php': '/bcaudit/hardware-infrastructure.php',
  '/bcaudit/compliance-verification.php': '/bcaudit/register-maintenance.php',
  '/bcaudit/transaction-verification.php': '/bcaudit/compliance-verification.php',
  '/bcaudit/bc-performance.php': '/bcaudit/transaction-verification.php',
  '/bcaudit/auditor-observation.php': '/bcaudit/bc-performance.php',
  '/bcaudit/download-audit-report.php': '/bcaudit/auditor-observation.php'
};
var backBtn = document.getElementById('backButton');
  if (backBtn){
    backBtn.addEventListener('click', backToPrevious);
  }

    // Define the goBack function
function backToPrevious() {
    var currentUrl= window.location.pathname;
    var redirectUrl = urlMapping[currentUrl] || '/dashboard.php';
    // Replace the current state with the appropriate URL
      window.history.replaceState(null, '', redirectUrl);
   // Navigate to the appropriate URL
      window.location.href = redirectUrl;
}

// get and set current year in footer
document.getElementById('footerText').textContent = `© ${new Date().getFullYear()} Copyright by: Integra Micro System`;

// /////////////////////////////
// });
// page ready function end ///////////////////


// go to page on click button
function goToPage(button) {
  // Get the target page from the button's data attribute
  var page = button.getAttribute('page');
  // Define URL mappings
  var urlMapping = {
      'createUser': '/bcaudit/create-user.php',
      'createBCA': '/bcaudit/create-bca.php',
      'dashboard': '/bcaudit/dashboard.php'
      // Add more mappings as needed
  };
  // Get the URL for the target page
  var url = urlMapping[page] || '/dashboard.php'; // Default to dashboard if not found
  // Set a flag in session storage to indicate history clearing
  // sessionStorage.setItem('clearHistory', 'true');
  // Navigate to the specified URL
  window.location.href = url;
}

// change input into uppercase
document.querySelectorAll('.uppercase-input').forEach(function(input) {
  let timer;
  let cursorPosition = 0; // Initialize cursor position

  input.addEventListener('input', function (e) {
    //   clearTimeout(timer); // Clear previous timeout
      cursorPosition = this.selectionStart; // Save cursor position
    //   timer = setTimeout(() => {
          const value = this.value.toUpperCase();
          this.value = value;
          this.setSelectionRange(cursorPosition, cursorPosition); // Restore cursor position
    //   }, 5); 
  });
});

// change input into lowercase
document.querySelectorAll('.lowercase-input').forEach(function(input) {
  let timer;
  let cursorPosition = 0; // Initialize cursor position

  input.addEventListener('input', function (e) {
      // clearTimeout(timer); // Clear previous timeout
      cursorPosition = this.selectionStart; // Save cursor position
      // timer = setTimeout(() => {
          const value = this.value.toLowerCase();
          this.value = value;
          this.setSelectionRange(cursorPosition, cursorPosition); // Restore cursor position
      // }, 50); 
  });
});

// remove spaces from input
const inputFields = document.querySelectorAll('.no-space');
// Add event listener to each input field
inputFields.forEach(function(inputField) {
    inputField.addEventListener('input', function() {
        // Get the current value of the input field
        let value = this.value;
        // Remove spaces from the value
        value = value.replace(/\s/g, '');
        // Update the input field with the modified value
        this.value = value;
    });
});

