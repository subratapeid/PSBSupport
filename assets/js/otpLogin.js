document.addEventListener('DOMContentLoaded', function () {
    const timer = 60;
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');

    const sendSpinner = document.getElementById('sendSpinner');
    const sendButtonText = document.getElementById('sendButtonText');

    const otpField = document.getElementById('otp');
    const validateSpinner = document.getElementById('validateSpinner');
    const verifyButtonText = document.getElementById('validateButtonText');

    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const validateOtpBtn = document.getElementById('validateOtpBtn');

    const otpArea = document.getElementById('otpArea');
    // otpArea.style.display = 'none';


    let countdownInterval;

    // Enable send OTP button if both name and email are filled
    [nameField, emailField].forEach(field => {
        field.addEventListener('input', () => {
            sendOtpBtn.disabled = !(nameField.value && emailField.value);
        });
    });
    // email validation
    function validateEmail(email) {
    // Regular expression for basic email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // List of allowed domains
    const allowedDomains = ['integramicro.com', 'integramicro.co.in', 'gmail.comm'];
    
    // Check if email matches the format
    if (!emailPattern.test(email)) {
        return "Invalid email format.";
    }
    
    // Extract the domain from the email
    const domain = email.split('@')[1];
    // Check if the domain is in the list of allowed domains
    if (!allowedDomains.includes(domain)) {
        return "Entered Email is not allowed. Please Use Integra Email Id";
    }
    return "validEmail";
}


    sendOtpBtn.addEventListener('click', sendOtp);
    validateOtpBtn.addEventListener('click', verifyOtp);

    async function sendOtp() {
        // Show spinner and disable button
        sendSpinner.style.display = 'inline-block';
        sendButtonText.textContent = 'Sending OTP...';
        otpField.value = '';
        sendOtpBtn.disabled = true;
        nameField.disabled = true;
        emailField.disabled = true;
        const name = nameField.value;
        const email = emailField.value;

        if (!name || !email) {
            // alert("Please enter both name and email.");
            toastr.error("Please enter both name and email.");
            resetSendOtpButton();
            return;
        }
        const validationMessage = validateEmail(email);
        if (validationMessage !== "validEmail") {
            // alert(validationMessage);
            toastr.error(validationMessage);
            resetSendOtpButton();
            return;
        }
        try {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbw5_DWeGtUZ8rjVukvAddNRLbrXnEPovlC6FSyyIjSg1ova1YzJ0uX07pgniR29OGBlBA/exec?function=sendOtp&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data.status === 'success') {
                localStorage.setItem('otpToken', data.otpToken);
                // alert("OTP sent to your email. Please enter it below.");
                toastr.success("OTP sent to your email. Please enter it below. It Will Valid For 5 minute");
                otpArea.style.display = 'inline-block';
                otpField.disabled = false;
                validateOtpBtn.disabled = false;
                startCountdown(timer);
            } else {
                // alert("Failed to send OTP. Please try again.");
                toastr.error("Failed to send OTP. Please try again.");
                resetSendOtpButton();
            }
        } catch (error) {
            // console.error("Error sending OTP:", error);
            // alert("Error sending OTP.");
            toastr.error("Error sending OTP.");
            resetSendOtpButton();
        }
    }

    async function verifyOtp() {
        // Show spinner and disable button
        validateSpinner.style.display = 'inline-block';
        verifyButtonText.textContent = 'Verifying OTP...';
        validateOtpBtn.disabled = true;

        const otp = otpField.value;
        const otpToken = localStorage.getItem('otpToken');
        const name = nameField.value;

        if (!otp) {
            toastr.warning("Please enter a valid OTP.");
            resetVerifyOtpButton();
            return;
        }
        if (otp.length < 6) {
            toastr.warning("OTP must be 6 digits long.");
            resetVerifyOtpButton();
            return;
        }
        if (!otpToken) {
            toastr.warning("OTP token is missing! Please Regenerate OTP.");
            resetVerifyOtpButton();
            return;
        }


        try {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbw5_DWeGtUZ8rjVukvAddNRLbrXnEPovlC6FSyyIjSg1ova1YzJ0uX07pgniR29OGBlBA/exec?function=verifyOtp&otp=${otp}&otpToken=${otpToken}&name=${name}`);
            const data = await response.json();

            if (data.status === 'success') {
                localStorage.setItem('sessionToken', data.sessionToken);
                localStorage.setItem('userRole', data.userRole);
                // console.log(data.sessionToken);
                // console.log(data.userRole);
                window.location.href = 'dashboard.html';
                // alert("OTP verified successfully. You are logged in!");
                toastr.success("OTP verified successfully. You are logged in!");
            } else if (data.status === 'expired' || data.attemptsLeft == 0) {
                // alert("OTP expired. Please request a new one.");
                toastr.error("OTP expired. Please request a new one.");
            } else if (data.status === 'invalid' && data.attemptsLeft >0) {
                // alert(`Invalid OTP. You have ${data.attemptsLeft} attempts left.`);
                toastr.error(`Invalid OTP. You have ${data.attemptsLeft} attempts left.`);
            } else {
                // alert("Failed to verify OTP. Please try again.");
                toastr.error("Failed to verify OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            // alert("Error verifying OTP.");
            toastr.error("Error verifying OTP.");
        } finally {
            resetVerifyOtpButton();
        }
    }

    function startCountdown(seconds) {
        let remainingTime = seconds;
        sendOtpBtn.disabled = true;
        sendButtonText.textContent = `Resend OTP (${remainingTime}s)`;
        sendSpinner.style.display = 'none';
        countdownInterval = setInterval(() => {
            remainingTime -= 1;
            sendButtonText.textContent = `Resend OTP (${remainingTime}s)`;

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                resetSendOtpButton(true);
            }
        }, 1000);
    }

    function resetSendOtpButton(isResend = false) {
        sendSpinner.style.display = 'none';
        sendOtpBtn.disabled = false;
        sendButtonText.textContent = isResend ? 'Resend OTP' : 'Send OTP';
        nameField.disabled = false;
        emailField.disabled = false;
    }

    function resetVerifyOtpButton() {
        validateSpinner.style.display = 'none';
        verifyButtonText.textContent = 'Verify OTP';
        validateOtpBtn.disabled = false;
    }

    // Check for debug
    // const otpToken = localStorage.getItem('otpToken');
    // const sessionToken = localStorage.getItem('sessionToken');
    // const userRole = localStorage.getItem('userRole');
    // console.log(sessionToken);
    // console.log(userRole);
    // console.log(otpToken);

});