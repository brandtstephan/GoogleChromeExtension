chrome.storage.sync.get(function(storage) {
    //When we click the button we fire an event and start this method, that just reloads the current website
	window.location.reload();
	//And then proceeds to send a message to the background to clear the storage
    chrome.runtime.sendMessage({
        message: 'clear'
    });
});