let trackedTasksTable = document.getElementById("trackedTasksTable");

let currentTaskId;
let timersInformation = {}
chrome.storage.sync.get(null, (data) => {
    currentTaskId = data.currentTaskId;
    Object.assign(timersInformation, data.timersInformation);
    for (id in timersInformation) {
        trackedTasksTable.innerHTML += `
            <tr>
                <td>${id}</td>
                <td>${timersInformation[id].name}</td>
                <td>${formatElapsedTime(timersInformation[id].elapsedTime)}</td>
                <td style="white-space:nowrap;">
                    <i class="material-icons selectTaskButton taskAction" data-id="${id}">${currentTaskId==id?"check_box":"check_box_outline_blank"}</i>
                    <i class="material-icons deleteTaskButton taskAction" data-id="${id}">delete</i>
                </td>
            <tr>
        `
    }
    document.querySelectorAll('.selectTaskButton').forEach((item) => {
        item.addEventListener("click", selectCurrentTask);
    });
    document.querySelectorAll('.deleteTaskButton').forEach((item) => {
        item.addEventListener("click", deleteTask);
    });
});

function selectCurrentTask() {
    chrome.storage.sync.set({ "currentTaskId": this.dataset.id }, () => { window.location.reload(); });
}

function deleteTask() {
    delete timersInformation[this.dataset.id]
    chrome.storage.sync.set({ "timersInformation": timersInformation }, () => { window.location.reload(); });
}


document.getElementById("addClassButton").addEventListener('click', () => {
    let id = parseInt(document.getElementById("task_id").value);
    let name = document.getElementById("task_name").value;
    timersInformation[id] = {
        name: name,
        elapsedTime: 0
    }
    chrome.storage.sync.set({ "timersInformation": timersInformation }, () => { window.location.reload(); });
})