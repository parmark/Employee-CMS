var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

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
            choices: ["Add ...", "View ...","Exit"]
        }
    ]).then(answer => {
        switch(answer.action) {
            case "Add ...":
                add();
                break;
            case "View ...":
                view();
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
    const { title, salary, department } = await inquirer.prompt([
        {
            type: "input", 
            name: "title", 
            message: "What is title of the new role?",
        },
        {
            type: "input", 
            name: "salary", 
            message: "What is salary of the new role?",
        }, 
        {
            type: "list", 
            name: "department", 
            message: "Which department does this role belong to?",
            choices: getDepartments
        }
    ]);

    connection.query("INSERT INTO role SET ?", 
    {
        title: title,
        salary: salary,
        department_id: await getDepartmentID(department)
    },
    function(err) {
        if (err) throw err;
        console.log("New role added!")
        start();
    })
}

function getDepartmentID(department) {
    return new Promise(function(resolve, reject) {
        connection.query(`SELECT id FROM department WHERE name = "${department}"`, function(err, res) {
            if (err) throw err;
            console.log(res[0].id)
            resolve(res[0].id);
        })
    })
}

function getDepartments() { 
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM department", function(err, res) {
            if (err) throw err;
            console.log(res)
            resolve(res);
        })
    })
}

async function addEmp() {
    const { firstName, lastName, role, manager } = await inquirer.prompt([
        {
            type: "input", 
            name: "firstName", 
            message: "What is this employee's first name?",
        },
        {
            type: "input", 
            name: "lastName", 
            message: "What is this employee's last name?",
        }, 
        {
            type: "list", 
            name: "role", 
            message: "What is this employee's role?",
            choices: getRoles
        },
        {
            type: "list", 
            name: "manager", 
            message: "Who is this employee's manager?",
            choices: getManagers
        }
    ]);

    connection.query("INSERT INTO employee SET ?", 
    {
        first_name: firstName,
        last_name: lastName,
        role_id: await getRoleID(role),
        manager_id: await getManagerID(manager)
    },
    function(err) {
        if (err) throw err;
        console.log("New employee added!");
        start();
    });
}

function getRoleID(role) {
    return new Promise(function(resolve, reject) {
        connection.query(`SELECT id FROM role WHERE title = "${role}"`, function(err, res) {
            if (err) throw err;
            resolve(res[0].id);
        })
    })
}

function getManagerID(manager) {
    if (manager !== "None") {
        names = manager.split(" ")
        return new Promise(function(resolve, reject) {
            connection.query(`SELECT id FROM employee WHERE first_name = "${names[0]}" AND last_name = "${names[1]}"`, function(err, res) {
                if (err) throw err;
                resolve(res[0].id);
            })
        })
    }
}

function getRoles() {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM role", function(err, res) {
            if (err) throw err;
            resolve(res.map(element => element.title));
        })
    })
}

function getManagers() {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM employee", function(err, res) {
            if (err) throw err;
            res = res.map(element => String(element.first_name) + " " + String(element.last_name))
            res.push("None")
            resolve(res);
        })
    })
}

async function view() {
    const { table } = await inquirer.prompt([
        {
            type: "list", 
            name: "table", 
            message: "What would you like to view?",
            choices: ["Department", "Role", "Employee"]
        }
    ])
    
    connection.query(`SELECT * FROM ${table}`, function(err, res) {
        if (err) throw err;
        console.table(res);
        start();
    })
}
