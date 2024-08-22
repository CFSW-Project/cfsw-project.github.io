function readMore(button) {
            const content = button.previousElementSibling;
            content.classList.toggle('show-more');
            
        }
        
        
        function tryItYourself(button) {
    // Show or hide the "Try it Yourself" section
    const tryItSection = button.nextElementSibling;
    if (tryItSection.style.display === "none" || !tryItSection.style.display) {
        tryItSection.style.display = "grid";
    } else {
        tryItSection.style.display = "none";
    }
}

function runCode(button) {
    // Get the code from the textarea
    const codeEditor = button.previousElementSibling;
    const code = codeEditor.value;
    
    // Get the iframe and write the code into it
    const iframe = button.nextElementSibling;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write('<style>' + code + '</style><div class="example">Example Text</div>');
    iframeDoc.close();
}
        