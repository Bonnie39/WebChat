    
document.addEventListener('DOMContentLoaded', function () {
    const displayNameBlock = document.getElementById('display-name-block');
    const usernameInput = document.getElementById('username');
    const confirmUsernameButton = document.getElementById('confirm-username');
    const usernameErrorText = document.getElementById('error-text');

    const usernameCookie = getCookie('username');
    window.userDisplayName = usernameCookie;

    if (usernameCookie) {
        usernameInput.value = usernameCookie;
        displayNameBlock.style.display = 'none';
        // Sign in anonymously with Firebase Auth
        signInAnonymously(auth)
            .then((userCredential) => {
                const user = userCredential.user;
                //console.log("Anonymous user signed in:", user.uid);
            })
            .catch((error) => {
                console.error("Error signing in anonymously:", error);
            });
    } else {
        // Blur and darken bg
        document.body.style.overflow = 'hidden';
        displayNameBlock.style.position = 'fixed';
        displayNameBlock.style.top = '0';
        displayNameBlock.style.left = '0';
        displayNameBlock.style.width = '100vw';
        displayNameBlock.style.height = '100vh';
        displayNameBlock.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        confirmUsernameButton.style.display = 'block'; // Show the Confirm button
        usernameErrorText.style.visibility = 'hidden';
    }

    confirmUsernameButton.addEventListener('click', function () {
        const username = usernameInput.value;
        if (username.trim() !== "") { // Validate that the username is not an empty string
            // Save username as a cookie
            setCookie('username', username, 365);
            signInAnonymously(auth)
            .then((userCredential) => {
                const user = userCredential.user;
                //console.log("Anonymous user signed in:", user.uid);
            })
            .catch((error) => {
                console.error("Error signing in anonymously:", error);
            });

            // Hide display name block and Confirm button
            displayNameBlock.style.display = 'none';
            confirmUsernameButton.style.display = 'none';

            // Allow scrolling again
            document.body.style.overflow = 'auto';
        } else {
            // Oopsie daisy
            console.error('Username cannot be empty.');
            usernameErrorText.style.visibility = 'visible';
            setTimeout(function () {
                usernameErrorText.style.visibility = 'hidden';
            }, 1250);
        }
    });

    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
    
    function getCookie(name) {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
    
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(cookieName)) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
    
        return '';
    }
});