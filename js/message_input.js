document.addEventListener('DOMContentLoaded', function () {
    const messageInput = document.getElementById('message');

    messageInput.addEventListener('input', function (event) {
        if (event.inputType === 'insertParagraph' && event.data === null) {
            // This is triggered when "Shift" + "Enter" is pressed
            event.preventDefault();

            // Insert a newline character at the current cursor position
            const cursorPosition = messageInput.selectionStart;
            const currentValue = messageInput.value;
            const newValue =
                currentValue.substring(0, cursorPosition) +
                '\n' +
                currentValue.substring(cursorPosition);

            messageInput.value = newValue;

            // Adjust the cursor position to the end of the inserted newline
            messageInput.selectionStart = cursorPosition + 1;
            messageInput.selectionEnd = cursorPosition + 1;
        }
    });
});
