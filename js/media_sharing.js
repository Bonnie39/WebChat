document.getElementById('add-image-button').addEventListener('click', function() {
    // Create a file input element
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.setAttribute('style', 'display: none');

    // Trigger a click event on the file input
    input.click();

    // Add change event listener to handle selected files
    input.addEventListener('change', function() {
        var selectedFiles = input.files;
        var maxFiles = 4;

        if (selectedFiles.length > maxFiles) {
            alert('Please select up to ' + maxFiles + ' image files.');
            // Clear the file input
            input.value = '';
        } else {
            // Handle the selected files (you can process or display them as needed)
            console.log(selectedFiles);
        }
    });
});