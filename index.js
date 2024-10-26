#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { select, input, checkbox } = require('@inquirer/prompts');

const filePath = path.join(__dirname, 'tasks.json')

// const [,, command, ...args] = process.argv

let tasks = [];

function loadTask() {
  if(!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]))
  }
  tasks = JSON.parse(fs.readFileSync(filePath));
}

function saveTask() {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
}

async function addTask() {
  const description = await input({
    message: 'Enter task description:'
  });

  if(tasks.length == 0) {
    mensagem = 'A meta não pode ser vazia.'
    return
  }

  tasks.push ({
    id: tasks.length + 1,
    description: description,
    status: 'todo',
    createAt: new Date(),
    updateAt: new Date()
  });

  console.log(`Task added successfully (ID: ${tasks.length})`)
}

async function taskList() {
  if (tasks.length == 0) {
    console.log('There are no tasks registered')
    return 
  }
  
  const status = await select({
    message: 'Choose the task you want to list:',
    choices:[
      {
        name: 'All list',
        value: 'all'
      },
      {
        name: 'List only the tasks to do',
        value: 'todo'
      },
      {
        name: 'List only the tasks in progress',
        value: 'progress'
      },
      {
        name: 'List only the tasks to done',
        value: 'done'
      }]
  })

  const filteredTasks = tasks.filter(task => {
    if(status === 'all') return true;
    return task.status == status;
  })

  filteredTasks.forEach(task => {
    console.log(`Descrição: ${task.description}`)
  });
}

async function deleteTask() {
  if (tasks.length == 0) {
    console.log('There are no tasks registered')
    return 
  }

  const tasksMarked = tasks
  .filter(task => task.status !== 'done')
  .map((task) => {
    return{ 
      description: task.description, 
      checked: false, 
      id: task.id}
  })

  console.log(tasksMarked)

  const tasksDelete = await checkbox({
    message: 'Choose the tasks to delete',
    choices: tasksMarked.map(task => ({ 
      value: task.id,           
      name: task.description,           
      checked: task.checked         
    })),
    instructions: false
  })

  if(tasksDelete.length == 0){ 
    console.log('No tasks to delete')
    return
  }
  
  tasksDelete.forEach(taskDelete =>
    tasks = tasks.filter(task => {
      return task.id != taskDelete
    })
  )

  console.log("Task(s) deleted successfully")
}

function updateTask(description) {
  const tasks = JSON.parse(fs.readFileSync(filePath))

  const updateTask = Number(process.argv[3])

  if(isNaN(updateTask) || !description) {
    console.log('Forneça um ID válido ou descrição válida. Exemplo: tas-cli 1 "Nova descrição"')
    return
  }

  let taskFound = false;

  tasks.forEach(task => {
    if(updateTask === task.id) {
      task.description = description
      task.updateAt = new Date()
      taskFound = true
    }    
  })

  const taskExists = !taskFound ? 'Não existe essa tarefa' : 'Description of tasks update sucess.'

  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2))
  console.log(taskExists)

}

function needHelp() {
  console.log('Commands: \n' +
    '1. Add a new task: task-cli add "New task"\n' +
    '2. List task: task-cli list\n' + 
    '3. Delete a task: task-cli delete ID\n' + 
    '4. Update a task with ID and description: task-cli update ID "New description"'
)}

function taskProgress() {
  const tasks = JSON.parse(fs.readFileSync(filePath))

  const taskId = Number(process.argv[3])

  if(!taskId) {
    console.log("Please insert a number: 'task-cli mark-in-progress 1'")
    return
  }

  let taskFound = false

  tasks.forEach(task => {
    if(task.id === taskId) {
      task.status = "progress"
      taskFound = true
    }
  })

  const taskExists = !taskFound ? "This task doens't exist" : "Task status changed to progress"

  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2))
  console.log(taskExists)
}

function taskDone() {
  const tasks = JSON.parse(fs.readFileSync(filePath))

  const taskId = Number(process.argv[3])

  if (!taskId) {
    console.log("Please insert a number: 'task-cli mark-done 1'")
    return
  }

  let taskFound = false

  tasks.forEach(task => {
    if(task.id == taskId) {
      task.status = 'done'
      taskFound = true
    }
  })

  const taskExists = !taskFound ? "This task doens't exist" : "Task status changed to done"

  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2))
  console.log(taskExists)
}

const start = async () => {
  await loadTask()

  while(true) {
    saveTask()

    const command = await select({
      message: "Choose a command:",
      choices: [
        {
          name: 'Manage Task',
          value: 'manage-tasks'
        },
        {
          name: 'Help',
          value: 'help'
        },
        {
          name: 'Exit',
          value: 'exit'
        }]
    })
    
    switch (command) {
      case 'manage-tasks':
        await manageTaskMenu()
      break
      case 'help':
        await needHelp()
        break;
      case 'exit':
        console.log('See you later');
        return
      default:
        console.log('Unknowm command.');
    }
  }
  
  async function manageTaskMenu() {
    const command = await select({
      message: "Task Management:",
      choices: [
        {
          name: 'Add Task',
          value: 'add'
        },
        {
          name: 'List Task',
          value: 'list'
        },
        {
          name: 'Delete Task',
          value: 'delete'
        },
        {
          name: 'Update Task',
          value: 'update'
        },
        {
          name: 'Mark Task as Done',
          value: 'mark-done'
        },
        {
          name: 'Mark Task as In Progress',
          value: 'mark-in-progress'
        },
        {
          name: 'Back To Main Menu',
          value: 'back'
        }]
    })
    
    switch (command) {
      case 'add':
        await addTask()
        break;
      case 'list':
        await taskList();
        break;
      case 'delete':
        await deleteTask();
        break;
      case 'update':
        await updateTask()
        break;
      case 'mark-in-progress':
        await taskProgress()
        break;
      case 'mark-done':
        await taskDone()
      break
      case 'back':
        return
    }
  }
}

start()

