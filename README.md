# www.barreltreasure.com

## Getting Started

### Database Connection

Ensure a proper database connection by setting the correct database URI within the `/config/db.js` file. You will need to create an account with Mongodb.com

### Installation

Follow these steps to get started:

1. **Clone the repository:**
    ```
    git clone https://github.com/gaforss/project.git
    cd project
    ```

2. **Install dependencies:**
    ```
    npm install, npm install mongoose
    ```

3. **Set up the database connection:**
    Edit `/config/db.js` with your MongoDB URI.

4. **Start the application:**
    ```
    npm start

    Login: test@test.com // test
    ```

## Project Structure

BarrelTreasure is an Express and MongoDB-based application designed for wine enthusiasts. It enables users to manage wine collections, locate bottles, pair your food with the perfect wine within your collection, etc. The application utilizes Passport for user authentication.

The project is structured as follows:

- `index.js`: Entry point for the express web application
- `routes/`: Route handlers for various functionalities
- `models/`: Database models for wines, users, and other entities
- `controllers/`: Logic handling for different routes and functionalities
- `config/`: Configuration files including MongoDB connection setup and authentication management
- `middlewares/`: Custom middleware functions like error handling and activity logging
- `public/`: Frontend files including HTML, CSS, and JavaScript for different pages

The Ask: 

Within Dashboard > 'Manage Wine' Dropdown from Menu > 'Pair My Food' Tab (http://localhost:3000/pairmyfood)

The objective is to create a feature that suggests wine pairings for specific dishes chosen by the specific user. 

This feature will consider criteria like food type, specific items, flavor profile, and price range. 

The aim is to enhance the users' dining experience by offering wine recommendations from their own collection of existing wine (/collectiion) that complement their selected dishes. To achieve this, an algorithm will be implemented, leveraging established wine pairing principles. It will filter wine options from a catalog based on different attributes, ensuring a personalized selection that matches the user's preferences.

Instead of modifying the schema, we should modify the query logic to filter wines based on the user-selected food criteria. When a user selects certain foods, the server-side logic will construct a query to filter wines that complement those foods.


Main pages relevant to this:

Front-end: /public > /pairmyfood
Backend: /controllers > /wineController.js (Starts at Line 85)

The routes should already be correctly built
/routes > /wines.js (Line 49) 



## Database Structure

### Collections

- **`activitylogs`**: Activity logs specific to each logged-in user
- **`users`**: Contains authenticated user data
  - Example:
    ```json
    {
      "_id": "",
      "username": "",
      "email": "",
      "password": "",
      "isNewAccount": false
    }
    ```
- **`wine_catalog`**: Tracks added, edited, and deleted wines based on logged-in users
  - Example:
    ```json
    {
      "_id": "658f3e7a6ce982cfe7637d4e",
      "name": "Shafer Vineyards Hillside Select Cabernet Sauvignon",
      "region": "California",
      "price": 329,
      "year": 2015,
      "varietal": "Cabernet Sauvignon",
      "type": "Red",
      "winery": "Shafer Vineyards",
      "country": "United States",
      "size": "750ml",
      "owner": ""
    }
    ```
- **`wine_database`**: Global list of wines in the database
  - Example:
    ```json
    {
      "_id": "659047c67a2aacfa814e67b6",
      "name": "Schieferkopf, Lieu Dit Buehl Riesling",
      "winery": "Schieferkopf",
      "varietal": "Lieu Dit Buehl Riesling",
      "country": "France",
      "region": "NA",
      "type": "White"
    }
    ```