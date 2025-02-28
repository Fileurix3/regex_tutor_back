# regex_tutor_back

This app is a simplified version of leetcode, but for regex

## Main Stack

The core technologies used in this project are:

- [**NestJs**](https://nestjs.com/): To create an API for the application.
- [**MongoDB**](https://www.mongodb.com/try/download/community): NoSQL database.
- [**Docker**](https://www.docker.com/): To containerize and build the entire project using **docker-compose**.
- [**Swagger**](https://swagger.io/): For the documentation api.
- [**jest**](https://jestjs.io/) + [**supertest**](https://github.com/ladjs/supertest#readme): To test this project.

---

## Installation

Follow these steps to set up and run the project:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Fileurix3/regex_tutor_back.git
   ```

2. **Navigate to the Project Folder**

   ```bash
   cd regex_tutor_back
   ```

3. **Add a `.env` File**

   Create a `.env` file in the root directory with the following parameters:

   ```env
   PORT="3000"
   JWT_SECRET="regex_tutor_back"

   MONGO_URI="mongodb://mongoRegex:27017/regex_tutor_back"
   ```

4. **Run the Project Using Docker Compose**

   ```bash
   docker compose up
   ```

---

to see the documentation for this api application, launch this application and go to the `http://localhost:3000/api/docs` page.
