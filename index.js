
const db = require('./db');
const inquirer=require('inquirer')

module.exports.add =async(title) => {
    const list = await db.read()
    list.push({ title, done: false })
    db.write(list)
}

module.exports.clear = async () => {
    await db.write([])
}

function markAsDone(list,index) {
    list[index].done = true
    db.write(list)
}
function markAsUndone(list,index) {
    list[index].done = false
    db.write(list)
}
function updateTitle(list,index) {
    inquirer.prompt({
        type: 'input',
        name: 'title',
        message: "新的标题",
        default:list[index].title
    }).then(answer => {
        list[index].title = answer.title
        db.write(list)
    })
}
function remove(list,index) {
    list.splice(index, 1)
    db.write(list)
}
function askForAction(list, index) {
    const actions = {
        markAsUndone,
        markAsDone,
        remove,
        updateTitle
    }
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: '请选择操作',
        choices: [
            { name: '退出', value: 'quit' },
            { name: '已完成', value: 'markAsDone' },
            { name: '未完成', value: 'markAsUndone' },
            { name: '删除', value: 'remove' },
            {name:'改标题',value:'updateTitle'}
        ]
    }).then(answer2 => {
        const action = actions[answer2.action]
        action && action(list,index)
    })
} 

function askForCreateTasks(list) {
    inquirer.prompt({
        type: 'input',
        name: 'title',
        message: "输入任务标题",
    }).then(answer => {
        list.push({
            title: answer.title,
            done:false
        })
        db.write(list)
    })
}
function printTasks(list) {
    inquirer.prompt ({
        type: 'list',
        message: '请选择你想操作的任务 \n',
        name: 'index',
        choices: [{name:'退出',value:'-1'},...list.map((task, index) => {
            return {name:`${task.done ? '[x]' : '[_]'} ${index + 1} -${task.title}`,value:index.toString()} 
        }),{name:'+创建任务',value:'-2'}]
    }).then(answer => {
        const index=parseInt(answer.index)
        if (index >= 0) {
            askForAction(list,index)
        }
         else if(index===-2){
           askForCreateTasks(list)
        }
    })
}


module.exports.showAll = async () => {
    //读取之前的任务
    const list = await db.read()
    //打印之前的任务
    printTasks(list)
}