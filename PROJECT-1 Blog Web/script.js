document.addEventListener("DOMContentLoaded", () => {

    const searchBar = document.getElementById("search");
    const posts = document.querySelectorAll(".post");

    const navTexts = ["post-i", "post-ii", "post-iii"]; 
    const navMap = {
        "post-i": "post1",
        "post-ii": "post2",
        "post-iii": "post3"
    };

    searchBar.addEventListener("input", () => {
        const text = searchBar.value.toLowerCase().trim();
        let found = false;

        posts.forEach(post => {

            const content = post.innerText.toLowerCase();
            const idMatch = post.id.toLowerCase().includes(text);

            const navMatch = navTexts.some(nav => {
                if (nav.includes(text)) {
                    return navMap[nav] === post.id;
                }
                return false;
            });

            if (content.includes(text) || idMatch || navMatch) {
                post.style.display = "block";
                found = true;
            } else {
                post.style.display = "none";
            }
        });
    });

    const forms = document.querySelectorAll('.commentForm');

    forms.forEach((form, index) => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = form.querySelector('input').value;
            const comment = form.querySelector('textarea').value;
            const commentBox = posts[index].querySelector('.comments');

            const newComment = document.createElement('p');
            newComment.innerHTML = `<strong>${name}:</strong> ${comment}`;
            newComment.style.background = "#e0f7f6";
            newComment.style.padding = "8px";
            newComment.style.borderRadius = "5px";
            newComment.style.marginTop = "5px";

            commentBox.appendChild(newComment);

            form.reset();
        });
    });

});
