fetch('data.json')
    .then(response => response.json())
    .then(data => {
        let postsSection = document.getElementById("posts-section");

        data.posts.forEach(postData => {
            let postDiv = document.createElement("div");
            postDiv.classList.add("post", postData.user.replace(" ", "-"));
            postDiv.setAttribute('data-post-id', postData.id);

            let postHeaderDiv = document.createElement("div");
            postHeaderDiv.classList.add("post-header");

            let userThumb = document.createElement("img");
            userThumb.classList.add("user-thumb");
            userThumb.src = "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";
            userThumb.alt = postData.user;
            postHeaderDiv.appendChild(userThumb);

            let userDetailsDiv = document.createElement("div");
            userDetailsDiv.classList.add("user-details");

            let userName = document.createElement("strong");
            userName.classList.add("name");
            userName.textContent = postData.user;
            userDetailsDiv.appendChild(userName);

            let userDepartment = document.createElement("span");
            userDepartment.classList.add("department");
            userDepartment.textContent = data.users.find(user => user.name + " " + user.lastName === postData.user).department;
            userDetailsDiv.appendChild(userDepartment);

            postHeaderDiv.appendChild(userDetailsDiv);
            postDiv.appendChild(postHeaderDiv);


            // Main Post Content #################################################################################### //

            function parseNewlines(text) {
                return text.replace(/\n/g, "<br>");
            }

            // Post content. If `posts.content` ends with `.jpg` or `.png` create `img` element, otherwise create `p` element.
            let postContent;
            if (postData.content.endsWith(".jpg") || postData.content.endsWith(".png")) {
                postContent = document.createElement("img");
                postContent.src = postData.content;
                postContent.alt = "post";
            } else {
                postContent = document.createElement("div");
                postContent.innerHTML = marked.parse(parseNewlines(postData.content));
            }
            postContent.classList.add("post-content");
            postDiv.appendChild(postContent);


            // Buttons: Like, Comment, Save ######################################################################### //


            let postFooterDiv = document.createElement("div");
            postFooterDiv.classList.add("post-footer");

            let buttonsDiv = document.createElement("div");
            buttonsDiv.classList.add("buttons");

            let likeBtn = document.createElement("div");
            likeBtn.classList.add("post-btn");
            let likeSpan = document.createElement("span");
            likeSpan.classList.add("like");
            likeBtn.appendChild(likeSpan);
            buttonsDiv.appendChild(likeBtn);

            likeBtn.addEventListener('click', function() {
                handleLike(postData, likeBtn);
                likeSpan.classList.toggle('active');
            });

            let comnBtn = document.createElement("div");
            comnBtn.classList.add("post-btn");
            let comnSpan = document.createElement("span");
            comnSpan.classList.add("comn");
            comnBtn.appendChild(comnSpan);
            buttonsDiv.appendChild(comnBtn);

            comnBtn.addEventListener('click', function() {
                if(commentInputDiv.style.display === "none" || !commentInputDiv.style.display) {
                    commentInputDiv.style.display = "flex";
                } else {
                    commentInputDiv.style.display = "none";
                }
            });

            let spacerDiv = document.createElement("div");
            spacerDiv.classList.add("spacer");
            buttonsDiv.appendChild(spacerDiv);

            let saveBtn = document.createElement("div");
            saveBtn.classList.add("post-btn");
            let saveSpan = document.createElement("span");
            saveSpan.classList.add("save");
            saveBtn.appendChild(saveSpan);
            buttonsDiv.appendChild(saveBtn);

            postFooterDiv.appendChild(buttonsDiv);

            // Likes ################################################################################################ //



            // Displays the amount of likes. Format: "Liked by <strong>{number of likes}</strong> people".
            let likesDiv = document.createElement("div");
            likesDiv.classList.add("likes");
            let likesStrong = document.createElement("strong");
            likesStrong.textContent = postData.likes;
            let textBefore = document.createTextNode("Liked by ");
            let textAfter = document.createTextNode(" people");
            likesDiv.appendChild(textBefore);
            likesDiv.appendChild(likesStrong);
            likesDiv.appendChild(textAfter);
            postFooterDiv.appendChild(likesDiv);


            function handleLike(postData, likeBtn) {
                if (!loggedInUser) {
                    console.error("User must be logged in to like a post.");
                    return;
                }

                // Toggle the like
                if (likeBtn.getAttribute('data-liked') === 'true') {
                    postData.likes--;
                    likeBtn.setAttribute('data-liked', 'false');
                } else {
                    postData.likes++;
                    likeBtn.setAttribute('data-liked', 'true');
                }

                // Update the likes on the server
                fetch(`http://localhost:3000/posts/${postData.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        likes: postData.likes
                    })
                })
                    .then(response => response.json())
                    .then(updatedPost => {
                        console.log("Post likes updated:", updatedPost);

                        // Update the likes display on the page
                        const likesDiv = postDiv.querySelector('.likes');
                        const likesStrong = likesDiv.querySelector("strong");
                        likesStrong.textContent = postData.likes; // Update to show the number of likes
                    })
                    .catch(error => {
                        console.error("Error updating post likes:", error);
                    });
            }


            // Comments ############################################################################################# //


            let commentsDiv = document.createElement("div");
            commentsDiv.classList.add("comments");

            postData.comments.forEach(comment => {
                let commentP = document.createElement("p");

                let commentUser = document.createElement("strong");
                commentUser.textContent = comment.user;
                commentP.appendChild(commentUser);

                let commentText = document.createTextNode(" " + comment.content);
                commentP.appendChild(commentText);

                commentsDiv.appendChild(commentP);
            });
            postFooterDiv.appendChild(commentsDiv);



            // Time Stamp ########################################################################################### //


            let timeSpan = document.createElement("span");
            timeSpan.classList.add("time");
            timeSpan.textContent = new Date().toLocaleTimeString();
            postFooterDiv.appendChild(timeSpan);

            postDiv.appendChild(postFooterDiv);

            postsSection.appendChild(postDiv);


            // Add comments ######################################################################################### //


            let commentInputDiv = document.createElement("div");
            commentInputDiv.classList.add("comment-input-div");

            let commentInput = document.createElement("input");
            commentInput.type = "text";
            commentInput.placeholder = "Add a comment...";
            commentInput.classList.add("comment-input");

            let submitCommentBtn = document.createElement("button");
            submitCommentBtn.innerText = "Post";
            submitCommentBtn.classList.add("submit-comment");

            commentInputDiv.appendChild(commentInput);
            commentInputDiv.appendChild(submitCommentBtn);
            postFooterDiv.appendChild(commentInputDiv);

            submitCommentBtn.addEventListener("click", function() {
                let commentText = commentInput.value.trim();
                let currentDate = new Date();
                let formattedDate = currentDate.toLocaleDateString('en-GB') + " " + currentDate.toLocaleTimeString();
            
                if(commentText) {

                    const newComment = {
                        user: loggedInUser ? loggedInUser.name + " " + loggedInUser.lastName : "Anonymous",
                        content: commentText,
                        timeCreated: formattedDate
                    };

                    postData.comments.push(newComment);

                    fetch(`http://localhost:3000/posts/${postData.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            comments: postData.comments
                        })
                    })
                        .then(response => response.json())
                        .then(updatedPost => {
                            console.log("Post updated:", updatedPost);
                        })
                        .catch(error => {
                            console.error("Error updating post:", error);
                        });


                    let commentP = document.createElement("p");
                    let commentUser = document.createElement("strong");


            
                    // Use the logged-in user's name for the comment
                    commentUser.textContent = loggedInUser ? loggedInUser.name + " " + loggedInUser.lastName : "Anonymous";
                    commentP.appendChild(commentUser);
            
                    let commentTextNode = document.createTextNode(" " + commentText);
                    commentP.appendChild(commentTextNode);
            
                    commentsDiv.appendChild(commentP);
                    commentInput.value = ''; // Clear the input after submission
            
                    // Hide the comment input after posting a comment
                    commentInputDiv.style.display = "none";


                }
            });
        });
    })
    .catch(error => console.error('Error:', error));

    let userData;
    let loggedInUser;

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            userData = data.users;
        })
        .catch(error => console.error('Error:', error));

    document.getElementById("loginButton").addEventListener('click', function() {
        loggedInUser = userData[0];

        document.getElementById("loggedInUserName").textContent = loggedInUser.name + " " + loggedInUser.lastName;
        document.getElementById("loggedInUserDepartment").textContent = loggedInUser.department;
        document.getElementById("loggedInUserDetails").style.display = "block";

        console.log("Logged in as " + loggedInUser.name + " " + loggedInUser.lastName);
    });


