(function(){
    //local variable
    var listOfPages = [];

    //Function used to trim a URL file to only get out the name of the page
    function getUrlName(url) {
        //We store the URL
        var urlName = url,
            //We split it where the points are
            stringArray = urlName.split('.');

        //We check if it posseses a www
        if (stringArray[0].search('www') > -1) {
            //If it does, we only save the second part of our array
            urlName = stringArray[1];
        } else {
            //If not we save the first part of the array
            urlName = stringArray[0];
        }

        //With help of the method removeSubstrings using some regex we cut the first part of the URL
        //If it contains http, https, etc...
        //And return the name of the page
        return removeSubstrings(urlName, ['http://', 'https://','ftp://','^http://']);
    }

    function removeSubstrings(string, substrings) {
        for (var i = 0; i < substrings.length - 1; i++) {
                string = string.replace(substrings[i], '');
        }
        return string;
    }
    //function to store the data on the chrome storage
    function store(data) {
        chrome.storage.sync.set(data);
    }

    //we set a listener to check if messages are arriving
    chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
        //If a message comes, we take the URL of the page
        var url       = sender.url,
            //We trim it
            urlName   = getUrlName(url),
            pageIndex = null;

        //If the message contains the word 'clear'
        if (response.message === 'clear') {
            //We call the clear function of chrome.storage and reset the values of our local variable
            chrome.storage.sync.clear(function() {
                listOfPages = [];
                //And we push it back as an empty object into the storage
                store({
                    listOfPages: listOfPages,
                });
                console.log('clear');
            });
        //If the message comes from the content script
        } else if (response.message === 'content') {

            //We get the values stored on the chrome storage,
            //This methods are asynchronous, meaning they don't wait for the data to get excetuted
            //To give them synchronization we work with the data directly inside of the callback function

            chrome.storage.sync.get(function(storage) {

                //We evaluate the object inside the store, if theres something, we clone it into our storage
                if (storage.hasOwnProperty('listOfPages') && storage.listOfPages) {
                    // listOfPages = storage.listOfPages; // This is incorrect, we are just putting a point in the storage
                    //We clone the object on our local listOfPages
                    listOfPages = JSON.parse(JSON.stringify(storage.listOfPages, null));
                }

                //it sets if the site is active, and updates the time we have spend on the website
                for (var i = 0; i < listOfPages.length; i++) {
                    if (listOfPages[i].site === urlName) {
                        listOfPages[i].isActive = true;
                        listOfPages[i].timeOnPage += (new Date().getTime() - listOfPages[i].timestamp);
                        listOfPages[i].timestamp = new Date().getTime(); // Everytime it gets activated, we update the timestamp
                    } else {
                        if (listOfPages[i].isActive) { // When it gets deactivated it updates the time
                            listOfPages[i].timeOnPage += (new Date().getTime() - listOfPages[i].timestamp);
                        }
                        listOfPages[i].isActive = false;
                    }
                }
                //The method some is used to iterate through an array of items and return true if the conditions are fulfilled.
                if (listOfPages.some(function(page, index) {
                    // if listOfPages already has the URL stored, save that index and return true
                    if (page.site === urlName) {
                        pageIndex = index;
                        return true;
                    } 
                })) {
                    //When it returns true, takes that index and increase the number of visits
                    //The element visit isn't implemented on the charts and was used for debugging porpouse
                    listOfPages[pageIndex].visits++;
                } else { 
                    //If the page doesn't existe, we create it
                        listOfPages.push({
                            //The name of the website
                            site: urlName,
                            //Number of visits
                            visits: 1,
                            //If it is active
                            isActive: true,
                            //Everytime we create or update a page, we update the timestamp
                            //Used to calculated the time spent
                            timestamp: new Date().getTime(),
                            timeOnPage: 0
                        });
                    // }
                }

                console.log('listOfPages:', listOfPages);

                //We refresh the information on our storage
                store({
                    listOfPages: listOfPages
                });

            });
        }

    });
})();


