#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'tasks.json')

if(!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]))
}

const [,, command, ...args] = process.argv

function addTask(description) {
  const tasks = JSON.parse(fs.readFileSync(filePath));

  const newTask = {
    id: tasks.length + 1,
    description: description,
    status: 'todo',
    createAt: new Date(),
    updateAt: new Date()
  };

  tasks.push(newTask)

  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
  console.log(`Task added successfully (ID: ${newTask.id})`)
}

function taskList(status) {
  const tasks = JSON.parse(fs.readFileSync(filePath))

  if (tasks.length == 0) {
    console.log('There are no tasks registered')
    return 
  }

  if (!['done', 'progress', 'todo', '', undefined].includes(status)) {
    console.log('Status inválido');
    return;
  }

  const filteredTasks = tasks.filter(task => {
    if(status === '') return true;
    return task.status == status;
  })

  filteredTasks.forEach(task => {
    console.log(`Descrição: ${task.description}`)
  });
}

function deleteTask() {
  const tasks = JSON.parse(fs.readFileSync(filePath))

  const deleteTask = Number(process.argv[3])

  let taskFound = false;

  tasks.forEach(task => {
    if(deleteTask === task.id){
      taskFound = true;
    }
  })

  if(!taskFound) {
    console.log('Não existe essa tarefa')
  }

  const newTasks = tasks.filter(newArrayTasks => newArrayTasks.id != deleteTask) 
  
  fs.writeFileSync(filePath, JSON.stringify(newTasks, null, 2))
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

switch (command) {
  case 'add':
    addTask(args.join(' '))
    break;
  case 'list':
    taskList(args.join(' '));
    break;
  case 'delete':
    deleteTask();
    break;
  case 'update':
    updateTask(args.slice(1).join(' '))
    break;
  case 'mark-in-progress':
    taskProgress()
    break;
  case 'mark-done':
    taskDone()
  break
  case 'help':
    needHelp()
    break;
  default:
    console.log('Unknown command. Type **task-cli help** to get help.');
    break;
}