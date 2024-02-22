$(document).ready(function () {
  var table = $("#example").DataTable({
    ajax: "objects.json",
    columns: [
      { data: "id" },
      {
        data: "task",
        createdCell: function (td, cellData, rowData, row, col) {
          $(td).css("cursor", "pointer");
          $(td).on("click", function () {
            openEditForm(rowData);
          });
        },
      },
      { data: "story" ,
       "render": function(data, type, row) {
       
        var storyClass = getStoryClass(data);
        return '<p class="' + storyClass + '">' + data + '</p>';
    }
  },
      { data: "assignee" },
      { data: 'priority',
      "render": function(data, type, row) {
          var priorityClass = getPriorityClass(data);
          return '<p class="' + priorityClass + '">' + data + '</p>';
      }
  },
      { data: "start_date" },
      { data: "end_date" },
      { data: "spend_time" },
      { data: "status",
      "render": function(data, type, row) {
        var statusClass = getStatusClass(data);
        return '<p class="' + statusClass + '">' + data + '</p>';
    } },
    ],
  });
});

//     Function to map status values to class names
function getStoryClass(story) {
  switch (story) {
      case 'story':
          return 'story';
      case 'bug':
          return 'bug';
      default:
          return 'default-status';
  }
}




function getStatusClass(status) {
  switch (status) {
      case 'progress':
          return 'progress';
      case 'completed':
          return 'completed';
      case 'pending':
          return 'pending';
          case 'open':
            return 'open';
      default:
          return 'default-status';
  }
}
// Function to map priority values to class names
function getPriorityClass(priority) {
  switch (priority) {
      case 'high':
          return 'high-priority';
      case 'medium':
          return 'medium-priority';
      case 'low':
          return 'low-priority';
      default:
          return 'default-priority';
  }
}

function openEditForm(rowData) {
  document.getElementById("task").value = rowData.task;
  document.getElementById("story").value = rowData.story;
  document.getElementById("assignee").value = rowData.assignee;
  document.getElementById("priority").value = rowData.priority;
  document.getElementById("start_date").value = rowData.start_date;
  document.getElementById("end_date").value = rowData.end_date;
  document.getElementById("spend_time").value = rowData.spend_time;
  document.getElementById("status").value = rowData.status;

  $("#myModal").modal("show");

  // ---------------Set up a click event handler for the submit button
  $("#submit")
    .off("click")
    .on("click", function () {
      //----------------Read the JSON file to get the data
      $.getJSON("objects.json", function (data) {
        if (data.data) {
          //---------------- Check if we are editing an existing task or adding a new one
          if (rowData.id) {
            //--------------- Find the task with the given ID
            const taskData = data.data.find((task) => task.id === rowData.id);

            if (taskData) {
              //---------------- Update the task data with the edited values
              updateTaskData(taskData);
              clearForm();
              // --------------Hide the modal
              $("#myModal").modal("hide");

              // Save the updated data to the JSON file
              saveDataToJsonFile(data);
              clearForm();
            }
          } else {
            console.log(data);
          }
        }
      }).fail(function () {
        alert("Error reading file");
      });
    });
}

function submitTask() {
  const task = document.getElementById("task").value;
  const story = document.getElementById("story").value;
  const assignee = document.getElementById("assignee").value;
  const priority = document.getElementById("priority").value;
  const startDate = document.getElementById("start_date").value;
  const endDate = document.getElementById("end_date").value;
  const spendTime = document.getElementById("spend_time").value;
  const status = document.getElementById("status").value;

  ///----------------task should contain mandatiory----------------
  if (!task) {
    $("#errorMessage").text("Task Name is required.");
    $("#error-assignee").text(
      "Assignee is required. Please select an assignee."
    );
    $("#errorMessage").css("display", "block");
    return;
  }
  //-------------------task also only alphabetic values----------
  const isAlphabeticWithSpaces = /^[a-zA-Z\s]+$/;

  if (!isAlphabeticWithSpaces.test(task)) {
    $("#errorMessage").text(
      "Task Name should contain only alphanumeric values"
    );
    $("#errorMessage").css("display", "block");
    return;
  } else {
    $("#errorMessage").text("");
    $("#errorMessage").css("display", "none");
  }
  //----------------assign value validation-----------------
  const assigneeDropdown = $("#assignee");
  const selectedAssignee = assigneeDropdown.val();

  if (selectedAssignee === "") {
    $("#error-assignee").css("display", "block");
    return;
  } else {
    $("#error-assignee").text("");
    $("#error-assignee").css("display", "none");
  }
  ///---------------------start date validation----------------
  if (!startDate) {
    $("#error-start_date").text("Start Date is required.");
    $("#error-start_date").css("display", "block");
    return;
  } else {
    $("#error-start_date").text("");
    $("#error-start_date").css("display", "none");
  }
  //-----------------------end date validation--------------
  if (!endDate) {
    $("#error-end_date").text("End Date is required.");
    $("#error-end_date").css("display", "block");
    return;
  } else {
    $("#error-end_date").text("");
    $("#error-end_date").css("display", "none");
  }
  if (startDate > endDate) {
    document.getElementById("error-end_date").textContent = "End Date is graterthan  Start Date.";
    document.getElementById("error-end_date").style.display = "block";
    return;
  } else {
    document.getElementById("error-end_date").textContent = "";
    document.getElementById("error-end_date").style.display = "none";
  }

  const newTask = {
    task,
    story,
    assignee,
    priority,
    start_date: startDate,
    end_date: endDate,
    spend_time: spendTime,
    status,
  };
  //----------------------------model hide --------------------------
  $("#myModal").modal("hide");

  // Use $.getJSON instead of $.get for JSON data
  $.getJSON("objects.json", function (data) {
    console.dir("EXISTING FILE DATA");
    console.dir(data);

    if (!data.data) {
      data.data = [];
    }

    // Find the highest 'id' value in the existing data
    const highestId = data.data.reduce(
      (maxId, task) => Math.max(maxId, task.id),
      0
    );

    // Increment the highest 'id'
    const nextId = highestId + 1;

    // Assign the next 'id' to the new task
    newTask.id = nextId;

    // Push the new task to the existing data
    data.data.push(newTask);

    console.dir("NEW FILE DATA");
    console.dir(data);

    // Use $.post to write the updated data back to the server
    $.post("/write-json", data, function (response) {
      alert(response);

      // Reload the DataTable to reflect the changes
      $("#example").DataTable().ajax.reload();
    });
  }).fail(function () {
    alert("Error reading file");
  });
}

function updateTaskData(taskData) {
  // Update the task data with the edited values
  taskData.task = document.getElementById("task").value;
  taskData.story = document.getElementById("story").value;
  taskData.assignee = document.getElementById("assignee").value;
  taskData.priority = document.getElementById("priority").value;
  taskData.start_date = document.getElementById("start_date").value;
  taskData.end_date = document.getElementById("end_date").value;
  taskData.spend_time = document.getElementById("spend_time").value;
  taskData.status = document.getElementById("status").value;
}

function saveDataToJsonFile(data) {
  // Use $.post to write the updated data back to the server
  $.post("/write-json", data, function (response) {
    alert(response);
  });
}

function clearForm() {
  // Clear the form elements
  // document.getElementById("taskId").value = "";
  document.getElementById("task").value = "";
  document.getElementById("story").value = "";
  document.getElementById("assignee").value = "";
  document.getElementById("priority").value = "";
  document.getElementById("start_date").value = "";
  document.getElementById("end_date").value = "";
  document.getElementById("spend_time").value = "";
  document.getElementById("status").value = "";
}


