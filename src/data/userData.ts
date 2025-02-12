import { AllUsers } from "../types/types";

const Users: AllUsers[] = [
  // Employees
  { id: "NSSF001", username: "tom@nssf.com", department: "IT", role: "employee" },
  { id: "NSSF002", username: "david@nssf.com", department: "HR", role: "employee" },
  { id: "NSSF003", username: "cisco@nssf.com", department: "Finance", role: "employee" },
  { id: "NSSF004", username: "sarah@nssf.com", department: "Operations", role: "employee" },
  { id: "NSSF005", username: "tate@nssf.com", department: "Marketing", role: "employee" },
  { id: "NSSF006", username: "joe@nssf.com", department: "Sales", role: "employee" },

  // Problem Solvers
  {
    id: "NSSF007",
    username: "JohnDoe",
    email: "johndoe@gmail.com",
    department: "IT",
    contact: "0756123456",
    role: "problem_solver",
  },
  {
    id: "NSSF008",
    username: "AlexSmith",
    email: "alexsimth@gmail.com",
    department: "HR",
    contact: "0788123456",
    role: "problem_solver",
  },
  {
    id: "NSSF009",
    username: "DanaWhite",
    email: "danawhite@gmail.com",
    department: "Finance",
    contact: "0701123456",
    role: "problem_solver",
  },
  {
    id: "NSSF010",
    username: "JoeRogan",
    email: "joerogan@gmail.com",
    department: "Operations",
    contact: "0726123488",
    role: "problem_solver",
  },
  {
    id: "NSSF011",
    username: "ShawnRyan",
    email: "shawnryan@gmail.com",
    department: "Marketing",
    contact: "0726123478",
    role: "problem_solver",
  },
  {
    id: "NSSF012",
    username: "JaneDoe",
    email: "janedoe@gmail.com",
    department: "Sales",
    contact: "0726123400",
    role: "problem_solver",
  },

  // Admin
  {
    id: "NSSF013",
    username: "AndyCooks",
    department: "IT",
    email: "smith@nssf.com",
    role: "admin",
  },
];

export default Users;
