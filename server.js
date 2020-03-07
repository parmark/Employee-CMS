var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306, 
    user: "root", 
    password: "rootroot",
    database: "employee_db"
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id" + connection.threadId);
    start();
})

function start() {
    inquirer.prompt([
        {
            type: "list", 
            name: "action", 
            message: "What would you like to do?",
            choices: ["Add ...", "Exit"]
        }
    ]).then(answer => {
        switch(answer.action) {
            case "Add ...":
                add();
                break;
            case "Exit":
                console.log("Goodbye")
                connection.end()
                break;
        }
    })
}

async function add() {
    const { action } = await inquirer.prompt([
        {
            type: "list", 
            name: "action", 
            message: "What would you like to add?",
            choices: ["Department", "Role", "Employee"]
        }
    ])
    
    switch(action) {
        case "Department":
            addDept();
            break;
        case "Role":
            addRole();
            break;
        case "Employee":
            addEmp();
            break;
    }
}

async function addDept() {
    const { name } = await inquirer.prompt([
        {
            type: "input", 
            name: "name", 
            message: "What is name of the new department?",
        }
    ]);

    console.log(name)

    connection.query("INSERT INTO department SET ?", 
    {
        name: name
    },
    function(err) {
        if (err) throw err;
        console.log("New department added!")
        start();
    })
}

async function addRole() {
    start();
}

async function addEmp() {
    start();
}