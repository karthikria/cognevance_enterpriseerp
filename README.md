# Enterprise ERP System

An Enterprise Resource Planning (ERP) application designed to manage essential business operations through a centralized web-based system. The project uses a React frontend, Spring Boot backend, and PostgreSQL database.

## Features

- **Authentication and Authorization** — Secure user authentication and role-based access.
- **Employee Management** — Manage employee-related information.
- **Product Management** — Maintain product records.
- **Sales Management** — Manage and track sales information.
- **Dashboard** — Access business data through a centralized dashboard.
- **REST API** — Communicate between the frontend and backend using REST endpoints.
- **Database Integration** — Persist application data using PostgreSQL.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Java, Spring Boot |
| Database | PostgreSQL |
| Build Tool | Maven |
| API Communication | REST API |
| IDE | Eclipse |
| Version Control | Git and GitHub |

## Project Structure

```text
enterprise-erp/
├── frontend/                 # React frontend
├── src/
│   └── main/
│       ├── java/             # Spring Boot source code
│       └── resources/
│           └── application.properties
├── pom.xml                   # Maven configuration
├── .gitignore
└── README.md
```



## Prerequisites

- Java version compatible with the project configuration
- Node.js and npm
- PostgreSQL
- Maven or the Maven Wrapper
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/karthikria/cognevance_enterpriseerp.git
cd cognevance_enterpriseerp
```

### 2. Configure PostgreSQL

Create a PostgreSQL database named `enterprise_erp`.

Configure your local database connection in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:1406/enterprise_erp
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

Set `DB_PASSWORD` to your local PostgreSQL password using your operating system's environment-variable settings. Do not commit passwords or other secrets to GitHub.

### 3. Run the backend

Open the project in Eclipse and run the main Spring Boot application class.

Alternatively, from the backend project directory, use:

```bash
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

### 4. Run the frontend

Open a terminal in the frontend directory:

```bash
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

*Use the actual frontend directory and available npm scripts from your repository.*

## API Endpoints

The application includes API areas for authentication, employees, products, and sales.

| Endpoint | Purpose |
|---|---|
| `/api/auth/register` | User registration |
| `/api/employees` | Employee operations |
| `/api/products` | Product operations |
| `/api/sales` | Sales operations |

The exact supported HTTP methods and authorization requirements depend on the controller and Spring Security configuration.

## Running the Application

1. Start PostgreSQL.
2. Start the Spring Boot backend.
3. Start the React frontend.
4. Open the frontend URL in your browser.
5. Register or log in, then explore the available modules.

## Troubleshooting

- **Database connection failed:** Verify PostgreSQL is running, the port is `1406`, and the database name and credentials are correct.
- **401 Unauthorized:** Check authentication, token handling, and endpoint authorization.
- **CORS errors:** Verify the Spring Boot CORS configuration allows the frontend origin.
- **Frontend dependencies missing:** Run `npm install` in the frontend directory.

## Deployment

This project is intended to run locally during development. Cloud deployment is not required.

## screenshots
### login page
![1](https://github.com/user-attachments/assets/bc18c433-9f50-4308-b7e8-99c0b60b1676)
### dashboard page
![2](https://github.com/user-attachments/assets/b0de1109-bfc1-433e-8cfd-159dc74027a5)
### Employee page
![3](https://github.com/user-attachments/assets/3588304c-cdca-44d4-8041-4bbac7376995)
### Inventory page
![4](https://github.com/user-attachments/assets/033e2f3c-82ab-4d79-998e-a3d2d330d9a1)
### Sales page
![5](https://github.com/user-attachments/assets/81a14c08-16d1-4ece-9cc2-68d626127fdf)
### Finance page
![6](https://github.com/user-attachments/assets/5e5e414f-64ba-46d2-ae57-bcd796a28e5c)
### Analytics page
![7](https://github.com/user-attachments/assets/e6b1ec6b-b4c5-41dc-87ed-f6224fb6eaa8)
![8](https://github.com/user-attachments/assets/8ad15285-e52e-4ec9-9cdc-48d80ee894fb)

## Future Enhancements

- Reporting and analytics
- Inventory management
- Employee attendance and payroll
- Improved dashboard visualizations
- Automated testing and validation

## Author

**Karthik S**

---


