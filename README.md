
## Getting Started

These instructions will help you set up and run the project on your local machine.

### Prerequisites

- Node.js
- MySQL Database
- Git

### Installation

1. **Download the Project**

    Clone the repository to your local machine:

2. **Import Database**

    - Download the SQL file from `Download Folder` and import it into your local MySQL database.

3. **Set Up Environment Variables**

    Create a `.env` file in the project root directory and set the following environment variables:

    ```plaintext
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_DATABASE=growsimple
    DB_API_KEY=
    ```

4. **Install Dependencies**

    Open your command prompt in the project location and run the following command to install all necessary libraries:

    ```shell
    npm install
    ```

5. **Fetch Trending Movies Data**

    Run the following command to fetch trending movies data from an API and store it into the MySQL database:

    ```shell
    node main.js
    ```

    Note: `setTimeOut` function is used to manage the rate limit of APIs.

6. **Start the Server**

    Run the following command to start the server at PORT 3000 using Express:

    ```shell
    node server.js
    ```

## API Endpoints

1. **Register**
   
    - Endpoint: `/register`
    - Method: POST
    - Description: Requires `username` and `password`  in body to verify the user. Includes validation.

2. **Login**
   
    - Endpoint: `/login`
    - Method: POST
    - Description:  Requires `username` and `password`  in body to verify the user and returns a JWT token with a time limit of 1 hour.

3. **Movie List**

    - Endpoint: `/movielist`
    - Method: GET
    - Description: Requires `Authorization` token in Header to verify the user and returns a list of movie data with a limit of 20. For the next page, mention the page number in parameters (`?page=2`).

4. **Movie Ratings**

    - Endpoint: `/movieRatings`
    - Method: GET
    - Description: Open endpoint to get a list of movie ratings with a limit of 20. For the next page, mention the page number in parameters (`?page=2`).

5. **Update Rating**

    - Endpoint: `/update-rating`
    - Method: POST
    - Description: Takes `movieId` and `rating` from the user and updates the rating with the overall rating and increases vote_count by 1. Requires `Authorization` token in Header to verify the user


