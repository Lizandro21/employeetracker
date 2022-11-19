const inquirer = require("inquirer");
const mysql = require('mysql2')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password1',
  database: 'company_db'
});
require('console.table');
//just my promt message for when you start the app
const promptMessages = {
    viewDepartments: "View Your Employees by Department",
    viewManagers: "View Your Employees by Managers",
    viewEmployees: "View All Of Your Employees",
    viewAllRoles: "View All Working Roles",
    addEmployee: "Add a New Employee",
    removeEmployee: "Remove a Employee",
    updateRole: "Update Role of an Employee",
    updateManager: "Update the Manager",
    exit: "Exit"
  };
//main function for the app that lets you pick what you want to do
  function prompt() {
    inquirer.prompt({
        name: 'action',
        type: "list",
        message: "Please pick an action of what you want to view.",
        choices: [
            promptMessages.viewDepartments,
            promptMessages.viewManagers,
            promptMessages.viewEmployees,
            promptMessages.viewAllRoles,
            promptMessages.addEmployee,
            promptMessages.removeEmployee,
            promptMessages.updateRole,
            promptMessages.exit
        ]
    }).then((selection) => {
        console.log('Selected:', selection);
        switch(selection.action) {
          case promptMessages.viewDepartments:
            viewDepartments();
            break;
            case promptMessages.viewEmployees:
                viewEmployees();
                break;
            case promptMessages.viewManagers:
              viewManagers();
              break;
            case promptMessages.addEmployee:
              addEmployee();
              break;
            case promptMessages.removeEmployee:
              remove('delete');
              break;
            case promptMessages.updateRole:
              remove('role');
              break;
            case promptMessages.viewAllRoles:
              viewAllRoles();
              break;
            case promptMessages.exit:
              connection.end();
              break;
        }
    });
}
//you can view all your employees by department if you pick this action
  function viewDepartments() {
  const query = `SELECT department.name AS department, role.title, employee.id, employee.first_name, employee.last_name
  FROM employee
  LEFT JOIN role ON (role.id = employee.role_id)
  LEFT JOIN department ON (department.id = role.department_id)
  ORDER BY department.name;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log('YOU ARE VIEWING BY DEPARTMENT');
    console.log('\n');
    console.table(res);
    prompt();
  });
}
//you can view all your employees by the manager
 function viewManagers() {
  const query = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, department.name AS department, employee.id, employee.first_name, employee.last_name, role.title
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
  INNER JOIN department ON (department.id = role.department_id)
  ORDER BY manager;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log(res)
    console.log('YOU ARE VIEWING BY MANAGER');
    console.log('\n');
    console.table(res);
    prompt();
  });
}
//you can view all your employees in total, puts them in a table also showing the name, id, title, salary and the manager they have
  function viewEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('YOU ARE VIEWING EMPLOYEES');
        console.log('\n');
        console.table(res);
        prompt();
    });
}
//this lets you view all the roles you can asign an employee
  function viewAllRoles() {
    const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department.name AS department
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY role.title;`;
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.log('YOU ARE VIEWING ALL THE ROLES');
      console.log('\n');
      console.table(res);
      prompt();
    });
}
//this just adds a new employee to the database
  async function addEmployee() {
    const newEmpl = await inquirer.prompt(getName());
    connection.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
        {
          name: 'role',
          type: 'list',
          choices: () => res.map(res => res.title),
          message: 'Please enter the employee role - '
        }
      ]);
      let roleId;
      for (const row of res) {
        if (row.title === role) {
          roleId = row.id;
          continue;
        }
      }
      connection.query('SELECT * FROM employee', async (err, res) => {
        if (err) throw err;
        let choices = res.map(res => `${res.first_name} ${res.last_name}`);
        choices.push('none');
        let { manager } = await inquirer.prompt([
          {
            name: 'manager',
            type: 'list',
            choices: choices,
            message: 'Pick the employee manager please -  '
          }
        ]);
        let managerId;
        let managerName;
        if (manager === 'none') {
          managerId = null;
        } else {
          for (const data of res) {
            data.fullName = `${data.first_name} ${data.last_name}`;
            if (data.fullName === manager) {
              managerId = data.id;
              managerName = data.fullName;
              console.log(managerId);
              console.log(managerName);
              continue;
            }
          }
        }
        console.log('Employee succesfully added! Please review following information to double check!');
        connection.query(
          'INSERT INTO employee SET ?',
          {
            first_name: newEmpl.first,
            last_name: newEmpl.last,
            role_id: roleId,
            manager_id: parseInt(managerId)
          },
          (err) => {
            if (err) throw err;
            prompt();
          }
        );
      });
    });
  };
//this will remove from database
  function remove(input) {
    const promptQ = 
    {
      yes: "Yes Remove!",
      no: "No Remove!"
    };
    inquirer.prompt([
      {
        name: "action",
        type: "list",
        message: "Enter the same employee ID here please. Do you know your employee ID?",
        choices: [promptQ.yes, promptQ.no]
      }
    ]).then(answer => {
      if (input === 'delete' && answer.action === "yes") removeEmployee();
      else if (input === 'role' && answer.action === "yes") updateRole();
      else viewEmployees();
    });
  };
//this will remove employeee from database
  async function removeEmployee() {
    const answer = await inquirer.prompt([
      {
        name: "first",
        type: "input",
        message: "Type the ID of the employee you would like to remove - "
      }
    ]);
    connection.query('DELETE FROM employee WHERE ?',
      {
        id: answer.first
      },
      function (err) {
        if (err) throw err;
      }
    )
    console.log('Succesfully terminated employee.');
    prompt();
  };
//this is used to get your employees ID
  function askId() {
    return ([
      {
        name: "name",
        type: "input",
        message: "What is this employees ID - "
      }
    ]);
  }  
//this is used to update your employees roles
  async function updateRole() {
    const employeeId = await inquirer.prompt(askId());
    connection.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
        {
          name: 'role',
          type: 'list',
          choices: () => res.map(res => res.title),
          message: 'What is this employees Role - '
        }
      ]);
      let roleId;
      for (const row of res) {
        if (row.title === role) {
          roleId = row.id;
          continue;
        }
      }
      connection.query(`UPDATE employee 
        SET role_id = ${roleId}
        WHERE employee.id = ${employeeId.name}`, async (err) => {
        if (err) throw err;
        console.log('Role has been updated..')
        prompt();
      });
    });
  }
//this is used to get your employeees names
  function getName() {
    return ([
      {
        name: "first",
        type: "input",
        message: "Please enter the first name here - "
      },
      {
        name: "last",
        type: "input",
        message: "Please enter the last name here - "
      }
    ]);
  }
  //just the promt function being called
  prompt()