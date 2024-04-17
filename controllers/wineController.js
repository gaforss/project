//controllers/wineController.js
const { Wine, WineDatabase } = require("../models/wine");
const ActivityLog = require("../models/activityLog");
const activityLogger = require("../middlewares/activityLogger");
const csv = require("csv-parser");
const fs = require("fs");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");

// Create a new wine associated with the logged-in user
exports.createWine = async (req, res) => {
  try {
    const newWine = await Wine.create({
      name: req.body.name,
      region: req.body.region,
      price: req.body.price,
      year: req.body.year,
      varietal: req.body.varietal,
      type: req.body.type,
      winery: req.body.winery,
      country: req.body.country,
      size: req.body.size,
      owner: req.user._id,
      depth: req.body.depth,
      height: req.body.height,
      row: req.body.row,
    });

    await ActivityLog.create({
      owner: req.user._id,
      action: "added",
      collection: "wine",
      wineId: newWine._id,
      wineName: newWine.name,
    });

    res.status(201).json(newWine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all wines associated with the logged-in user
exports.getAllWines = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id, consumed: false });
    console.log(wines);
    res.json(wines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing wine by logged in user
exports.updateWine = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedWine = await Wine.findOneAndUpdate(
      { _id: id, owner: req.user._id }, // Make sure only the owner can update their wine
      req.body,
      { new: true }
    );
    if (!updatedWine) {
      return res.status(404).json({ message: "Wine not found" });
    }

    // Log activity for wine update
    await ActivityLog.create({
      owner: req.user._id,
      action: "updated",
      collection: "wine",
      wineId: updatedWine._id, // Include the updated wine's ID
      wineName: updatedWine.name, // Include the name for quick reference
    });

    res.json(updatedWine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const foodTypeMapping = {
    meat: ['Cabernet Sauvignon', 'Merlot', 'Syrah', 'Beef', 'Lamb', 'Pork', 'Chicken'],
    seafood: ['Chardonnay', 'Pinot Noir', 'Sauvignon Blanc', 'Salmon', 'Tuna', 'Shrimp'],
    vegetables: ['Sauvignon Blanc', 'Chardonnay', 'Pinot Noir', 'Broccoli', 'Spinach', 'Asparagus'],
    pasta: ['Sangiovese', 'Chianti', 'Merlot', 'Spaghetti', 'Fettuccine', 'Lasagna'],
    cheese: ['Cabernet Sauvignon', 'Merlot', 'Syrah', 'Cheddar', 'Gouda', 'Brie'],
    dessert: ['Port', 'Merlot', 'Cabernet Sauvignon', 'Chocolate Cake', 'Cheesecake', 'Apple Pie']
};

exports.pairWinesWithFood = async (req, res) => {
    try {
        // Extract user ID from the request body
        const { userId, foodType, specificFood, flavorProfile, priceRange } = req.body;

        // Debugging: Print the entire req.body object to see its structure
        console.log('Request Body:', req.body);

        // Ensure that userId is present and correctly structured
        if (!userId) {
            console.log('Error: User ID is undefined.');
            return res.status(400).json({ error: "User ID is missing." });
        }

        // Convert userId to ObjectId format
        const userIdObjectId = mongoose.Types.ObjectId(userId);

        // Check if priceRange is defined
        if (!priceRange) {
            console.log('Error: Price Range is undefined.');
            return res.status(400).json({ error: "Price Range is missing." });
        }

        // Retrieve all wines owned by the user
        console.log('Retrieving wines owned by the user...');
        const userWines = await Wine.find({ owner: userIdObjectId });
        console.log('Found', userWines.length, 'wines owned by the user.');

        // Filter wines based on price range
        console.log('Filtering wines based on price range...');
        const matchedWines = userWines.filter(wine => wine.price <= priceRange.max && wine.price >= priceRange.min);
        console.log('Found', matchedWines.length, 'wines within the specified price range.');

        // Further filter wines based on food type, specific food, and flavor profile
        console.log('Filtering wines based on food type, specific food, and flavor profile...');
        const potentialPairings = matchedWines.filter(wine => {
            const matchingAttributes = foodTypeMapping[foodType.toLowerCase()];
            return matchingAttributes.some(attr =>
                wine.varietal.toLowerCase().includes(attr.toLowerCase()) ||
                wine.flavorProfile.toLowerCase().includes(attr.toLowerCase()) ||
                wine.type.toLowerCase().includes(attr.toLowerCase())
            );
        });

        console.log('Found', potentialPairings.length, 'potential pairings.');

        if (potentialPairings.length === 0) {
            console.log('No wines found matching the criteria.');
            return res.status(404).json({ error: 'No wines found matching the criteria' });
        }

        // Return potential pairings to the client
        res.json(potentialPairings);
    } catch (error) {
        console.error('Error pairing wines with food:', error);
        res.status(500).json({ error: 'Failed to pair wines with food' });
    }
};



// UPDATE PROFILE DETAILS INC. PROFILE IMAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Define the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate unique filenames with original extensions
  },
});
const upload = multer({ storage: storage }).single("profileImage");

exports.updateProfile = async (req, res, next) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error("Error uploading image:", err);
        return res.status(500).json({ error: "Error uploading image" });
      }

      if (req.isAuthenticated()) {
        const { firstName, lastName } = req.body;

        // Ensure both firstName and lastName are present in the request body
        if (!firstName || !lastName) {
          return res.status(400).json({ error: "Both first name and last name are required." });
        }

        const userId = req.user._id;

        // Get the file path or URL where the image is saved (assuming it's in the 'public/uploads' directory)
        const imagePath = req.file ? "/uploads/" + req.file.filename : "";

        // Update user details in the database, including the image path
        const updatedUser = await User.findByIdAndUpdate(userId, { firstName, lastName, profileImage: imagePath }, { new: true });

        if (!updatedUser) {
          return res.status(404).json({ error: "User not found." });
        }

        // Redirect to the profile page upon successful update
        return res.redirect("/editprofile"); // Adjust the URL as needed
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a wine by ID (only if the user is the owner)
exports.deleteWine = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedWine = await Wine.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!deletedWine) {
      return res.status(404).json({ message: "Wine not found" });
    }

    // Log activity for wine deletion
    await ActivityLog.create({
      owner: req.user._id,
      action: "deleted",
      collection: "wine",
      wineId: deletedWine._id, // Include the deleted wine's ID
      wineName: deletedWine.name, // Include the name for quick reference
    });

    res.json({ message: "Wine deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHistoryData = async (req, res, next) => {
  try {
    console.log("Fetching history data...");

    const historyData = await Wine.find({ owner: req.user._id, consumed: true });

    console.log("History data fetched successfully:", historyData);

    // Respond with the fetched history data
    res.status(200).json(historyData);
  } catch (error) {
    // Handle errors appropriately, log them, and respond with an internal server error
    console.error("Error fetching history data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.markAsConsumed = async (req, res, next) => {
  try {
    console.log("Received request to mark wine as consumed:", req.body);

    const { wineIds, dateConsumed, liked } = req.body;

    // Validate required parameters
    if (!wineIds || !dateConsumed || typeof liked === "undefined") {
      console.log("Invalid request body. Missing required parameters.");
      return res.status(400).json({ success: false, message: "Invalid request body. Missing required parameters." });
    }

    // Find the wines by IDs and owner
    const wines = await Wine.find({ _id: { $in: wineIds }, owner: req.user._id });

    if (!wines || wines.length === 0) {
      console.log("Wines not found or user does not have permission.");
      return res.status(404).json({ success: false, message: "Wines not found or you do not have permission to mark them as consumed." });
    }

    for (const wine of wines) {
      wine.consumed = true;
      wine.dateConsumed = dateConsumed;
      wine.liked = liked;

      await wine.save();

      await ActivityLog.create({
        owner: req.user._id,
        action: "consumed",
        collection: "wine",
        wineId: wine._id,
        wineName: wine.name,
      });
    }

    console.log("Wine(s) marked as consumed successfully.");

    res.status(200).json({ success: true, message: "Wine(s) marked as consumed successfully" });
  } catch (error) {
    // Handle errors appropriately, log them, and respond with an internal server error
    console.error("Error marking wine(s) as consumed:", error);
    res.status(500).json({ success: false, message: "Internal server error. Failed to mark wine(s) as consumed." });
  }
};

// GET WINE DETAILS BY ID
exports.getWineDetailsById = async (req, res) => {
  const wineId = req.params.id;

  try {
    const selectedWine = await WineDatabase.findById(wineId);

    if (!selectedWine) {
      return res.status(404).json({ error: "Wine not found in WineDatabase" });
    }

    res.status(200).json(selectedWine);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wine details", message: error.message });
  }
};


// Search Wines
exports.searchWines = async (req, res) => {
  const searchParams = req.query;
  const queryConditions = buildSearchQuery(searchParams);

  try {
    const wines = await WineDatabase.find(queryConditions).limit(10);

    if (!wines || wines.length === 0) {
      return res.status(404).json({ message: "No wines found matching the search criteria" });
    }

    res.json(formatResponse(wines));
  } catch (error) {
    console.error("Error fetching wines:", error);
    res.status(500).json({ error: "Error fetching wines", message: error.message });
  }
};

// Function to build search query conditions
const buildSearchQuery = (searchParams) => {
  const queryConditions = {};

  if (searchParams.name) {
    queryConditions.name = { $regex: searchParams.name, $options: "i" };
  }
  if (searchParams.region) {
    queryConditions.region = { $regex: searchParams.region, $options: "i" };
  }
  if (searchParams.varietal) {
    queryConditions.varietal = { $regex: searchParams.varietal, $options: "i" };
  }
  if (searchParams.price) {
    queryConditions.price = { $gte: parseFloat(searchParams.price) };
  }
  if (searchParams.year) {
    queryConditions.year = { $gte: parseFloat(searchParams.year) };
  }
  if (searchParams.type) {
    queryConditions.type = { $regex: searchParams.type, $options: "i" };
  }
  if (searchParams.winery) {
    queryConditions.winery = { $regex: searchParams.winery, $options: "i" };
  }
  if (searchParams.country) {
    queryConditions.country = { $regex: searchParams.country, $options: "i" };
  }
  if (searchParams.size) {
    queryConditions.size = { $regex: searchParams.size, $options: "i" };
  }

  return queryConditions;
};

// Function to format response
const formatResponse = (wines) => {
  return wines.map((wine) => ({
    name: wine.name,
    region: wine.region,
    varietal: wine.varietal,
    price: wine.price,
    year: wine.year,
    type: wine.type,
    winery: wine.winery,
    country: wine.country,
    size: wine.size,
    // Include other necessary fields...
  }));
};

// Autocomplete search for wines in wine_catalog collection
exports.autocompleteWines = async (req, res) => {
  try {
    let query = req.query.q;
    const owner = req.user._id;

    if (typeof query !== "string") {
      query = String(query);

      if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Invalid query format", message: "Query must be a non-empty string" });
      }
    }

    const stringConditions = {
      owner: owner,
      $or: [{ name: { $regex: query, $options: "i" } }, { region: { $regex: query, $options: "i" } }, { price: { $regex: query, $options: "i" } }, { year: { $regex: query, $options: "i" } }, { varietal: { $regex: query, $options: "i" } }, { type: { $regex: query, $options: "i" } }, { winery: { $regex: query, $options: "i" } }, { country: { $regex: query, $options: "i" } }, { size: { $regex: query, $options: "i" } }],
    };

    const stringBasedWines = await Wine.find(stringConditions).limit(10);

    const formattedData = stringBasedWines.map((wine) => ({
      name: wine.name,
      region: wine.region,
      price: wine.price,
      year: wine.year,
      varietal: wine.varietal,
      type: wine.type,
      winery: wine.winery,
      country: wine.country,
      size: wine.size,
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Autocomplete error", message: error.message });
  }
};

// ADD WINE TO LOGGEDIN USER'S WINE COLLECTION
exports.addWineToCatalogByName = async (req, res) => {
  try {
    const { name, region, price, year, varietal, type, winery, country, size, depth, height, row, quantity } = req.body;

    if (!price || !varietal || !year || !size || !quantity) {
      return res.status(400).json({ error: "Please fill in all editable fields, including quantity." });
    }

    const winesToAdd = [];
    for (let i = 0; i < quantity; i++) {
      const wineToAdd = {
        name: name || "",
        region: region || "",
        price,
        year,
        varietal,
        type: type || "",
        winery: winery || "",
        country: country || "",
        size,
        depth,
        height,
        row,
        owner: req.user._id,
      };
      winesToAdd.push(wineToAdd);
    }

    // Add the wines to the wine_catalog collection
    const savedWines = await Wine.insertMany(winesToAdd);

    // Log activity for adding wines
    savedWines.forEach(async (savedWine) => {
      await ActivityLog.create({
        owner: req.user._id,
        action: "added",
        collection: "wine",
        wineId: savedWine._id,
        wineName: savedWine.name,
      });
    });

    res.status(200).json(savedWines);
  } catch (error) {
    console.error("Error adding wine to wine_catalog:", error);
    res.status(500).json({ error: "Failed to add wine(s) to wine_catalog", message: error.message });
  }
};

// GET TOTAL PRICE FOR LOGGED IN USER WINE COLLECTION
exports.getTotalWineValue = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id, consumed: false }, "price");
    const totalValue = wines.reduce((acc, wine) => acc + wine.price, 0);
    res.json({ totalValue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate the total count of wines belonging to the logged-in user
exports.getTotalWineCount = async (req, res) => {
  try {
    const totalCount = await Wine.countDocuments({ owner: req.user._id, consumed: false });
    res.json({ totalWineCount: totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PURCHASE PRICE DISTRIBUTION CHART
exports.getWinePriceDistribution = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id, consumed: false }, "price");

    const priceRanges = {
      "0-50": 0,
      "51-100": 0,
      "101-250": 0,
      "251-500": 0,
      "501-1000": 0,
      "1000+": 0,
    };

    wines.forEach((wine) => {
      const price = wine.price;

      if (price >= 0 && price <= 50) {
        priceRanges["0-50"]++;
      } else if (price >= 51 && price <= 100) {
        priceRanges["51-100"]++;
      } else if (price >= 101 && price <= 250) {
        priceRanges["101-250"]++;
      } else if (price >= 251 && price <= 500) {
        priceRanges["251-500"]++;
      } else if (price >= 501 && price <= 1000) {
        priceRanges["501-1000"]++;
      } else {
        priceRanges["1000+"]++;
      }
    });

    res.json(priceRanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// COUNTRY DISTRIBUTION CHART
exports.getWineCountryDistribution = async (req, res) => {
  try {
    const countryDistribution = await Wine.aggregate([
      { $match: { owner: req.user._id, consumed: false } }, // Filter by owner ID
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, // Optional: Sort by count in descending order
    ]);

    const formattedData = countryDistribution.reduce((acc, country) => {
      acc[country._id] = country.count;
      return acc;
    }, {});

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching country distribution:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get the average price per bottle of wines
exports.getPricePerBottle = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id, consumed: false }, "price");
    const prices = wines.map((wine) => wine.price); // Extract prices into an array

    // Get the price per bottle by finding the average of all prices
    const pricePerBottle = prices.length ? prices.reduce((acc, price) => acc + price, 0) / prices.length : 0;

    res.json({ pricePerBottle: pricePerBottle.toFixed(2) }); // Return the price per bottle
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate wine variety distribution
exports.getWineVarietyDistribution = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id, consumed: false }, "varietal");

    const varietyCounts = {};

    wines.forEach((wine) => {
      const variety = wine.varietal;

      if (!varietyCounts[variety]) {
        varietyCounts[variety] = 1;
      } else {
        varietyCounts[variety]++;
      }
    });

    res.json(varietyCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FUNCTION TO HANDLE BULK CSV IMPORT
exports.importCSV = async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== "text/csv") {
      return res.status(400).json({ error: "Please upload a CSV file." });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", async (data) => {
        results.push(data);
        data.owner = req.user._id;

        try {
          const newWine = new Wine(data);
          await newWine.save();
        } catch (wineSaveError) {
          console.error("Error saving wine:", wineSaveError);
        }
      })
      .on("end", () => {
        res.status(200).send("CSV data imported successfully");
      });
  } catch (err) {
    console.error("Error importing CSV data:", err);
    res.status(500).send("Error importing CSV data.");
  }
};

// Fetch logs for the current user
exports.getActivityLogs = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find({ owner: req.user._id }).sort({ timestamp: -1 }).limit(10);

    res.json(activityLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get cellar data associated with the logged-in user
exports.getCellarData = async (req, res) => {
  try {
    const cellarData = await Wine.find({
      owner: req.user._id,
      consumed: false,
      depth: { $exists: true, $ne: null },
      row: { $exists: true, $ne: null },
      height: { $exists: true, $ne: null },
    });

    console.log("Cellar Data:", cellarData);
    res.status(200).json(cellarData);
  } catch (error) {
    console.error("Error fetching cellar data:", error);
    res.status(500).json({ error: "Failed to fetch cellar data", message: error.message });
  }
};

// Update the position of a wine
exports.updateWinePosition = async (req, res) => {
  console.log("updateWinePosition function called");
  try {
    // Log the incoming request body for debugging
    console.log("Request Body:", req.body);
    console.log("Wines found:", wines);

    // Destructure relevant data from the request body
    const { sourceIndex, destinationIndex, wineId, row, height, depth } = req.body;

    // Convert source and destination indices to numeric values
    const numericSourceIndex = parseInt(sourceIndex, 10);
    const numericDestinationIndex = parseInt(destinationIndex, 10);

    // Validate numeric indices
    if (isNaN(numericSourceIndex) || isNaN(numericDestinationIndex) || numericSourceIndex < 0 || numericDestinationIndex < 0) {
      return res.status(400).json({ error: "Invalid source or destination index" });
    }

    // Retrieve source and destination wines from the database
    const sourceWine = await Wine.findOne({ _id: wineId, owner: req.user._id });
    const destinationWine = await Wine.findOne({ owner: req.user._id }).skip(numericDestinationIndex);

    // Check if wines are found
    if (!sourceWine || !destinationWine) {
      return res.status(404).json({ error: "Wine not found for the logged-in user" });
    }

    // Log values for debugging
    console.log("Source Wine:", sourceWine);
    console.log("Destination Wine:", destinationWine);
    console.log("Source Index:", numericSourceIndex);
    console.log("Destination Index:", numericDestinationIndex);
    console.log("Wine ID:", wineId);
    console.log("Row:", row);
    console.log("Height:", height);
    console.log("Depth:", depth);

    // Update source wine
    console.log("Updated Source Wine:", {
      depth: destinationWine.depth,
      row: destinationWine.row,
      height: destinationWine.height,
    });

    // Update source wine in the database
    await Wine.updateOne(
      { _id: sourceWine._id, owner: req.user._id },
      {
        depth: destinationWine.depth,
        row: destinationWine.row,
        height: destinationWine.height,
      }
    );

    console.log("Wine saved:", wine);

    // Update destination wine
    console.log("Updating Destination Wine:", {
      depth: depth,
      row: row,
      height: height,
    });

    // Update destination wine in the database
    await Wine.updateOne(
      { _id: destinationWine._id, owner: req.user._id },
      {
        depth: depth,
        row: row,
        height: height,
      }
    );

    // Send a success response to the client
    res.status(200).json({ message: "Position updated successfully" });
  } catch (error) {
    // Handle errors and send an error response to the client
    console.error("Error updating position:", error);
    res.status(500).json({ error: "Failed to update position", message: error.message });
  }
};
