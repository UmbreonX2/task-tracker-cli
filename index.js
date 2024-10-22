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

function taskList() {
  const tasks = JSON.parse(fs.readFileSync(filePath))

  if (tasks.length == 0) {
    console.log('Não existem metas cadastradas')
    return 
  }

  tasks.forEach(task => {
    console.log(`Descrição: ${task.description}`)
  });
}

switch (command) {
  case 'add':
    addTask(args.join(' '))
    break;
  case 'list':
    taskList();
    break;
  default:
    console.log('Unknown command');
    break;
}