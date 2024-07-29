function toggleMenu(button) {
            button.classList.toggle("change");
            document.querySelector('.nav').classList.toggle('show');
        }

        function readMore(button) {
            const content = button.previousElementSibling;
            content.classList.toggle('show-more');
            if (content.classList.contains('show-more')) {
                button.textContent = 'Read Less';
            } else {
                button.textContent = 'Read More';
            }
        }