(function(){
    //This code gets injected on the website we visit and works as part of it
    //When we send a message to the background page, we send it from the current tab that we are on
    //This way the background can get the information of the website to work with
    chrome.runtime.sendMessage({
    	message: 'content'
    });
}());
