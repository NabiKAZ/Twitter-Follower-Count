// ==UserScript==
// @name         Twitter Follower Count
// @namespace    https://github.com/NabiKAZ/Twitter-Follower-Count
// @version      0.1.0
// @description  Display the number of followers of Twitter users
// @author       Nabi K.A.Z. <nabikaz@gmail.com> | www.nabi.ir | @NabiKAZ
// @match        https://twitter.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Array to store all users
    var allUsers = [];

    // Save references to the original methods
    var originalSend = XMLHttpRequest.prototype.send;

    // Override the send method
    XMLHttpRequest.prototype.send = function() {
        // Save a reference to the current instance
        var xhr = this;

        // Add an event listener to the load event
        xhr.addEventListener('load', function() {
            // Parse the response text as JSON
            var responseJSON = JSON.parse(xhr.responseText);

            // Extract user data from the response
            var users = getNames(responseJSON, 'screen_name');

            // Iterate over the users
            users.forEach(function(user) {
                // Check if the user object contains the required properties
                if (!user.hasOwnProperty('name') || !user.hasOwnProperty('screen_name') || !user.hasOwnProperty('followers_count') || !user.hasOwnProperty('friends_count')) return;

                // Check if the user is already in the allUsers array
                var isDuplicate = allUsers.some(item => item.screen_name === user.screen_name);
                if (!isDuplicate) {
                    // Add the user to the allUsers array
                    allUsers.push({
                        'name': user.name,
                        'screen_name': user.screen_name,
                        'followers_count': user.followers_count,
                        'formated_followers_count': formatNumber(user.followers_count).toLocaleString('en-US'),
                        'friends_count': user.friends_count,
                    });
                }
            });
        });

        // Call the original send method
        originalSend.apply(xhr, arguments);

    };

    // Recursive function to extract names from an object
    function getNames(obj, name, result = []) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if ("object" == typeof(obj[key])) {
                    getNames(obj[key], name, result);
                } else if (key == name) {
                    result.push(obj);
                }
            }
        }
        return result;
    }

    function formatNumber(number){
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        } else {
            return number.toString();
        }
    }

    // Main function to update follower count on Twitter profiles
    function main() {
        allUsers.forEach(function(user) {
            // Find the profile links of the user
            var linkElements = document.querySelectorAll('a[href="/' + user.screen_name + '"]');

            // Iterate over the profile links
            linkElements.forEach(function(linkElement) {
                // Check if the count element already exists
                var countElement = linkElement.querySelector('span.count-follower');
                if (countElement) return;

                // Find the parent element of the link
                var parentElement = linkElement.parentNode;
                if (!parentElement) return;

                // Find the image element in the parent element
                var imgElement = parentElement.querySelector('img[draggable=true]');
                if (!imgElement) return;

                // Update styles of parent
                parentElement.style.overflow = 'inherit';
                parentElement.style.clipPath = 'none';

                // Find and update style of closest parent element
                var closestElement = parentElement.closest('ul');
                if (closestElement) {
                    closestElement.style.overflow = 'inherit';
                }

                // Create and append the count element
                var newSpanElement = document.createElement('span');
                newSpanElement.className = 'count-follower';
                newSpanElement.innerText = user.formated_followers_count;
                newSpanElement.style.position = 'absolute';
                newSpanElement.style.bottom = '-2px';
                newSpanElement.style.left = '50%';
                newSpanElement.style.transform = 'translate(-50%)';
                newSpanElement.style.fontFamily = '"TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
                newSpanElement.style.fontSize = '8px';
                newSpanElement.style.fontWeight = '1000';
                newSpanElement.style.whiteSpace = 'nowrap';
                newSpanElement.style.color = 'rgb(113, 118, 123)';
                newSpanElement.style.backgroundColor = '#16181C';
                newSpanElement.style.border = '1px solid #16181C';
                newSpanElement.style.borderRadius = '9999px';
                newSpanElement.style.padding = '0px 4px 1px';

                // Append the count element to the link element
                linkElement.appendChild(newSpanElement);

            });
        });
    }

    // Call the main function on scroll event
    document.addEventListener("scroll", (event) => {
        main();
    });

    // Call the main function on page load
    window.addEventListener('load', () => {
        main();
    }, false);

})();
