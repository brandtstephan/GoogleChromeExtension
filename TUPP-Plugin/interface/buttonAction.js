//Method to clear the information, it calls the method clearRequest via tabs
function clear() {
    chrome.tabs.executeScript(null, {
        file: "interface/clearRequest.js"
    });
}
var colors = [];

function createChart() {
    //Local variables
	var data = [], labels = [];

	for (var i = 0; i < window.listOfPages.length; i++) {
	    //We iterate through our pages and we only pick the first 5 pages
	    if(i == 5){
	        break;
        }
        //We push everything on our variables, which will then be pushed into the chart data structur
        //Time passed in seconds

		data.push(window.listOfPages[i].timeOnPage / 1000);
		labels.push(window.listOfPages[i].site);
		colors.push(colors[i]);
	}
	//Creates a chart with retrieving the canvas
    //And with the data gathered
	window.myChart = new Chart(window.ctx , {
	    type: 'bar',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: '',
	            data: data, //Time in seconds
	            backgroundColor: colors,
	            borderColor: colors,
	            borderWidth: 1
	        }]
	    },
	    options: {
            title: {
                display: true,
				fontColor: 'white',
                text: 'This graph displays time spent browsing.',

            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                callbacks:{
                	label: function(tooltipItems,data){
                	    //No more than updating the tooltip labels (When we hover the mouse over the bars)
                        // to display a hh:mm:ss time format with the help of a helper function
                          return data.datasets[tooltipItems.datasetIndex].label = convertMillisecondsToDigitalClock(data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index] * 1000).clock;

					}
                }

            },
			footerFontStyle:'normal'
        }
	});
	//Updates the chart
	updateChart();

}

function updateChart() {
	chrome.storage.sync.get(function(storage) {
        var data = [], color1 = [], labels = [];
        //Similar to creating a chart

        //We retrieve the information from the storage
        window.listOfPages = storage.listOfPages;

        //We sort the data from the page most visited to the least visited
        sortData(window.listOfPages);

        for (var i = 0; i < window.listOfPages.length; i++) {
            //Only allows the top 5 pages to be displayed and updated
            if(i == 5){
                break;
            }

            //We push the changes on our variables, again time on seconds
            data.push(window.listOfPages[i].timeOnPage/1000);
            labels.push(window.listOfPages[i].site);
            color1.push(colors[i]);

        }
        //We push everything on the already created chart structure
        window.myChart.data.labels = labels;
        window.myChart.data.datasets[0].data = data;
        window.myChart.data.datasets[0].backgroundColor = color1;
        window.myChart.data.datasets[0].borderColor = color1;

        //We call the update method of the chart
        window.myChart.update();

        //With a timeout of 1 second we update with recursion
		setTimeout(function() {
			updateChart();
		}, 1000);
	});
}

//We add a listener to the pop up
document.addEventListener('DOMContentLoaded', function(){

    //We we open the pop up we retrieve our canvas
    //For our chart to use
    window.ctx = document.getElementById("myChart");

    //We get our clear button and attach a listener
   	var clearButton = document.getElementById('clearButton');
   	clearButton.addEventListener('click', function() {
   	    //We click, it calls the method clear
        clear();
        //Resets the valu of our listOfPages
        window.listOfPages = null;

        //And reloads again after 4 seconds to let the backend enough time to update the data
        setTimeout(function() {
            window.location.reload();
        }, 4000);
    });

	chrome.storage.sync.get(function(storage) {
	    //We get the information from the storage
        //And we store it on our global variable
		window.listOfPages = storage.listOfPages;
		//We pick a random number
        //Happens everything we refresh our pop up
        randomColor(window.listOfPages.length, colors);
        //And then we create the chart
		createChart();
	});

});

//Helper method to change time from milliseconds to hours, minutes seconds or clock
function convertMillisecondsToDigitalClock(ms) {
    hours = Math.floor(ms / 3600000), // 1 Hour = 36000 Milliseconds
        minutes = Math.floor((ms % 3600000) / 60000), // 1 Minutes = 60000 Milliseconds
        seconds = Math.floor(((ms % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
    return {
        hours : hours,
        minutes : minutes,
        seconds : seconds,
        clock : hours + "h:" + minutes + "m:" + seconds + "s"
    };
}
//Random color array with the number of allows pages to be displayed at any time
var randomColor = function(numPages, colorArray) {
    for(var i = 0; i < numPages;i++){
        colorArray[i] = 'rgba(' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + ('0.3') + ')';
    }
}

//Simple bubble sort method
function sortData(list)
{
    var swapped;
    do {
        swapped = false;
        for (var i=0; i < list.length-1; i++) {
            if (list[i+1].timeOnPage > list[i].timeOnPage) {
                var temp = list[i+1];
                list[i+1] = list[i];
                list[i] = temp;
                swapped = true;
            }
        }
    } while (swapped);
}
