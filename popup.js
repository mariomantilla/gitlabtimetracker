let toggleButton = document.getElementById("toggleTimer");
let elapsedTimeLabel = document.getElementById("totalTime");

let elapsedTime = 0;

let currentTaskId;
let elapsedTimeUpdaterInterval;
let timersInformation = {};

chrome.storage.sync.get(null, (data) => {
    Object.assign(timersInformation, data.timersInformation);
    currentTaskId = data.currentTaskId;
    if (currentTaskId) {
        document.getElementById("taskName").innerHTML = timersInformation[currentTaskId].name;
        elapsedTime += timersInformation[currentTaskId].elapsedTime
        elapsedTimeLabel.innerHTML = formatElapsedTime(elapsedTime);
        document.getElementById("hasCurrentTask").style.display = "";
        document.getElementById("hasntCurrentTask").style.display = "none";
    }
    if (data.currentSlotStartedAt) {
        elapsedTime += Math.round((new Date() - new Date(data.currentSlotStartedAt)) / 1000);
        toggleButton.innerHTML = 'Stop!'
        elapsedTimeUpdaterInterval = setInterval(updateElapsedTime, 1000);
    } else {
        toggleButton.innerHTML = 'Start!'
        if (elapsedTimeUpdaterInterval) clearInterval(elapsedTimeUpdaterInterval);
    }
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        let gitlabMatch = /gitlab\.com\/.*\/issues\/([0-9]+)/gi.exec(tab.url)
        if (gitlabMatch) {
            let id = parseInt(gitlabMatch[1]);
            if (id == currentTaskId) return;
            let name = new RegExp("(.*) \\(#" + gitlabMatch[1] + "\\).*", "gi").exec(tab.title)[1];
            document.getElementById("detectedTaskName").innerHTML = name;
            document.getElementById("taskDetected").style.display = "";
            document.getElementById("addDetectedTask").addEventListener("click", () => {
                timersInformation[id] = {
                    name: name,
                    elapsedTime: 0
                };
                chrome.storage.sync.set({ "timersInformation": timersInformation, "currentTaskId": id }, () => {
                    window.location.reload();
                });
            });
        }
    });
});

handleNewTimingState = async() => {
    chrome.storage.sync.get("currentSlotStartedAt", ({ currentSlotStartedAt }) => {
        if (currentSlotStartedAt) {
            let totalElapsedTime = Math.round((new Date() - new Date(currentSlotStartedAt)) / 1000);
            timersInformation[currentTaskId].elapsedTime += totalElapsedTime;
            chrome.storage.sync.set({ "timersInformation": timersInformation });
            chrome.storage.sync.set({ "currentSlotStartedAt": null });
            toggleButton.innerHTML = 'Start!'
            if (elapsedTimeUpdaterInterval) clearInterval(elapsedTimeUpdaterInterval);
        } else {
            let startedAt = new Date();
            chrome.storage.sync.set({ "currentSlotStartedAt": startedAt.valueOf() });
            toggleButton.innerHTML = 'Stop!'
            elapsedTimeUpdaterInterval = setInterval(updateElapsedTime, 1000);
            chrome.storage.sync.set({ "timersInformation": timersInformation });
        }
    });
}

toggleButton.addEventListener("click", handleNewTimingState);
document.getElementById("goToConfigButton").addEventListener("click", () => { chrome.runtime.openOptionsPage() });

function updateElapsedTime() {
    elapsedTime++;
    elapsedTimeLabel.innerHTML = formatElapsedTime(elapsedTime);
}