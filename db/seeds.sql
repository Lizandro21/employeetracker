INSERT INTO department (name)
VALUES
('Legal'),
('Analytics'),
('Marketing'),
('Sales');



INSERT INTO role (title, salary, department_id)
VALUES 
("Marketing Head", 80000000, 3), 
("Assistant Marketer", 1000, 3), 
("Analytics Head", 200000, 2), 
("Analytics Assistant", 2000, 2),
("Legal Head", 200000, 1), 
("Legal Assistance", 2000, 1),
("Sales Head", 240000, 4),
("Sales Assistance", 2400, 4);



INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Cristiano', 'Ronaldo', 1, NULL),
('Joa', 'John', 2, 1),
('Monty', 'John', 3, NULL),
('Mia', 'Pamla', 4, 3),
('cuscus', 'amir', 5, NULL),
('john', 'travolta', 6, 5),
('Cutler', 'Jay', 7, NULL),
('Obama', 'Barrack', 8,7);