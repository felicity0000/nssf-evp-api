export type User = {
    id: string;
    username: string;
    department: string;
    role: "employee" | "admin";  // Enum for the role
    email?: string;  // Optional fields for specific roles
    contact?: string;  // Optional fields for specific roles
  };
  
  // Alternatively, you can define specific types for each role
  export type Employee = User & {
    role: "employee";
  };
  
  export type Admin = User & {
    role: "admin";
  };
  
  // Union type for all users
  export type AllUsers = Employee | Admin;

  // UserType.ts
export type UserType = {
    id: string;
    username: string;
    department: string;
    role: "employee" | "problem_solver" | "admin";
    email?: string;
    contact?: string;
  };

  export type FeedbackType = {
    title: string;
    department: string;
    concern: string;
    possibleSolution: string;
    validity: {
      startDate: string; // This will be in ISO 8601 format (e.g., "2025-02-09T14:48:00.000Z")
      endDate: string;   // This will also be in ISO 8601 format
    };
    isAnonymous: boolean;
    assignedTo: string;
    name?: string;
    status: string;
    likes: number;
    dislikes: number;
    userId: string;
    createdAt: string; // Timestamps returned by MongoDB (ISO 8601 format)
    updatedAt: string; // Timestamps returned by MongoDB (ISO 8601 format)
  };
  
  