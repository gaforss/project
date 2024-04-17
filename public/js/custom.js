//js/custom.js
const wineForm = document.getElementById("wineForm");

// DISPLAY WINE ON /COLLECTION INTO DATATABLES
$(document).ready(async function () {
  const wineTable = $("#wineTable").DataTable({
    ajax: {
      url: "/wines",
      dataSrc: "",
    },
    columns: [
      {
        data: null,
        render: function (data, type, row) {
          return `<input type="checkbox" class="wine-checkbox" data-id="${row._id}">`;
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          const editVarietal = data.varietal.trim().toLowerCase();
          const winePrice = parseFloat(data.price);
          const wineYear = parseInt(data.year);

          let drinkWindowStart, drinkWindowEnd;

          switch (editVarietal) {
            case "sauvignon blanc":
              if (winePrice < 25) {
                drinkWindowStart = wineYear + 1;
                drinkWindowEnd = wineYear + 3;
              } else {
                drinkWindowStart = wineYear + 2;
                drinkWindowEnd = wineYear + 6;
              }
              break;

            case "chardonnay":
              if (winePrice < 40) {
                drinkWindowStart = wineYear + 3;
                drinkWindowEnd = wineYear + 6;
              } else {
                drinkWindowStart = wineYear + 5;
                drinkWindowEnd = wineYear + 10;
              }
              break;

            case "pinot noir":
              if (data.region.toLowerCase() === "oregon" && winePrice < 40) {
                drinkWindowStart = wineYear + 4;
                drinkWindowEnd = wineYear + 8;
              } else if ((data.region.toLowerCase() === "united states" || data.region.toLowerCase() === "france") && winePrice < 40) {
                drinkWindowStart = wineYear + 6;
                drinkWindowEnd = wineYear + 10;
              } else if (winePrice < 80) {
                drinkWindowStart = wineYear + 8;
                drinkWindowEnd = wineYear + 15;
              } else if (winePrice < 120) {
                drinkWindowStart = wineYear + 9;
                drinkWindowEnd = wineYear + 19;
              } else {
                drinkWindowStart = wineYear + 10;
                drinkWindowEnd = wineYear + 25;
              }
              break;

            case "cabernet sauvignon":
              if (winePrice < 40) {
                drinkWindowStart = wineYear + 5;
                drinkWindowEnd = wineYear + 9;
              } else if (winePrice < 80) {
                drinkWindowStart = wineYear + 8;
                drinkWindowEnd = wineYear + 15;
              } else if (winePrice < 120) {
                drinkWindowStart = wineYear + 9;
                drinkWindowEnd = wineYear + 19;
              } else {
                drinkWindowStart = wineYear + 10;
                drinkWindowEnd = wineYear + 25;
              }
              break;

            case "sparkling":
              if (winePrice < 40) {
                drinkWindowStart = wineYear + 2;
                drinkWindowEnd = wineYear + 4;
              } else if (winePrice < 80) {
                drinkWindowStart = wineYear + 3;
                drinkWindowEnd = wineYear + 7;
              } else if (winePrice < 120) {
                drinkWindowStart = wineYear + 4;
                drinkWindowEnd = wineYear + 9;
              } else {
                drinkWindowStart = wineYear + 4;
                drinkWindowEnd = wineYear + 15;
              }
              break;

            default:
              if (winePrice < 40) {
                drinkWindowStart = wineYear + 1;
                drinkWindowEnd = wineYear + 4;
              } else {
                drinkWindowStart = wineYear + 2;
                drinkWindowEnd = wineYear + 7;
              }
              break;
          }

          let alertIcon = "";

          if (drinkWindowStart < 2024) {
            if (drinkWindowEnd < 2024) {
              alertIcon = '<i class="fa fa-exclamation-triangle text-warning"></i>';
              drinkWindowStart = "Past Prime";
              drinkWindowEnd = "Drink Now";
            } else {
              drinkWindowStart = "Now";
            }
          }

          const drinkWindowSpan = document.getElementById("wineDrinkWindow");
          drinkWindowSpan.innerHTML = `${drinkWindowStart} - ${drinkWindowEnd}`;

          return `${alertIcon} ${row.name}`;
        },
      },

      {
        data: "price",
        className: "hide-on-mobile",
      },
      {
        data: "year",
        className: "hide-on-mobile",
      },
      {
        data: "winery",
        className: "hide-on-mobile",
      },
      {
        data: "region",
        className: "hide-on-mobile",
      },
      {
        data: "country",
        className: "hide-on-mobile",
      },
      {
        data: null,
        render: function (data, type, row) {
          return `<button class="btn btn-info btn-edit"><i class="fa fa-pencil"></i></button>`;
        },
      },
    ],
    searching: true,
    ordering: true,
    paging: false,
    scrollCollapse: true,
    scrollY: "350px",
  });

  // DISPLAY WINE MARKED AS CONSUMED ON /HISTORY INTO DATATABLES
   const wineHistory = $("#wineHistory").DataTable({
      ajax: {
          url: "/wines/history",
          dataSrc: "",
          error: function(xhr, error, thrown) {
              console.error("DataTables AJAX Error:", error);
              console.log("XHR:", xhr);
              if (xhr.responseJSON && xhr.responseJSON.message) {
                  alert("Error: " + xhr.responseJSON.message);
              } else {
                  alert("An error occurred while fetching data.");
              }
          },
      },
      columns: [
          { 
              data: null, 
              render: (data, type, row) => `<input type="checkbox" class="wine-checkbox" data-id="${row._id}">` 
          }, 
          { data: "name" }, 
          { data: "year" }, 
          { 
              data: "consumed", 
              render: (data) => {
                  console.log("Consumed data:", data);
                  return data ? new Date(data).toLocaleDateString() : "";
          }
          }, 
          { 
              data: "liked", 
              render: (data) => data ? '<i class="fa fa-thumbs-up thumbs-up"></i>' : '<i class="fa fa-thumbs-down thumbs-down"></i>'
          }
      ],
      searching: true,
      ordering: true,
      paging: false,
      scrollCollapse: true,
      scrollY: "350px",
  });


  // MODAL DISPLAY AFTER CHOOSING WINE IN SEARCH
  const displayWineDetails = (wine) => {
    $("#wineName").text(wine.name);
    $("#wineRegion").text(wine.region);
    $("#wineType").text(wine.type);
    $("#wineWinery").text(wine.winery);
    $("#wineCountry").text(wine.country);
    $("#wineYear").val(wine.year);
    $("#winePrice").val(wine.price);
    $("#wineVarietal").val(wine.varietal);
    $("#wineSize").val(wine.size);
    $("#wineDepth").val(wine.depth);
    $("#wineHeight").val(wine.height);
    $("#wineRow").val(wine.row);

    $("#wineDetailsModal").modal("show");

    var wineType = wine.type.trim().toLowerCase();
    var heroImage = $(".hero-image img");

    // Switch statement for wine type
    switch (wineType) {
      case "white":
        heroImage.attr("src", "/img/hero/white.png");
        break;
      case "red":
        heroImage.attr("src", "/img/hero/red.png");
        break;
      case "rose":
        heroImage.attr("src", "/img/hero/rose.png");
        break;
      default:
        heroImage.attr("src", "/img/hero/default.png");
    }

    var wineType = wine.type.trim().toLowerCase();
    var pairingImages = $(".pairing-image img");

    const curatedPairingImages = {
      white: ["/img/pairings/salmon_and_tuna.png", "/img/pairings/pasta.png", "/img/pairings/mushrooms.png", "/img/pairings/vegetarian.png"],
      red: ["/img/pairings/beef.png", "/img/pairings/lamb.png", "/img/pairings/mature_and_hard_cheese.png", "/img/pairings/poultry.png"],
      rose: ["/img/pairings/poultry.png", "/img/pairings/salmon_and_tuna.png", "/img/pairings/mature_and_hard_cheese.png", "/img/pairings/vegetarian.png"],
    };

    // Set the pairing images based on wine type
    console.log("Wine Type:", wineType);
    pairingImages.each(function (index) {
      $(this).attr("src", curatedPairingImages[wineType][index] || "/img/pairings/default.png");
    });

    const country = $("#wineCountry").text().trim();

    const countryCodes = {
      Afghanistan: "af",
      Albania: "al",
      Algeria: "dz",
      Andorra: "ad",
      Angola: "ao",
      Argentina: "ar",
      Armenia: "am",
      Australia: "au",
      Austria: "at",
      Azerbaijan: "az",
      Bahrain: "bh",
      Bangladesh: "bd",
      Belarus: "by",
      Belgium: "be",
      Belize: "bz",
      Benin: "bj",
      Bhutan: "bt",
      Bolivia: "bo",
      "Bosnia and Herzegovina": "ba",
      Botswana: "bw",
      Brazil: "br",
      Brunei: "bn",
      Bulgaria: "bg",
      "Burkina Faso": "bf",
      Burundi: "bi",
      Cambodia: "kh",
      Cameroon: "cm",
      Canada: "ca",
      "Cape Verde": "cv",
      "Central African Republic": "cf",
      Chad: "td",
      Chile: "cl",
      China: "cn",
      Colombia: "co",
      Comoros: "km",
      "Costa Rica": "cr",
      Croatia: "hr",
      Cuba: "cu",
      Cyprus: "cy",
      "Czech Republic": "cz",
      Denmark: "dk",
      Djibouti: "dj",
      "Dominican Republic": "do",
      "East Timor (Timor-Leste)": "tl",
      Ecuador: "ec",
      Egypt: "eg",
      "El Salvador": "sv",
      "Equatorial Guinea": "gq",
      Eritrea: "er",
      Estonia: "ee",
      Ethiopia: "et",
      Fiji: "fj",
      Finland: "fi",
      France: "fr",
      Gabon: "ga",
      Gambia: "gm",
      Georgia: "ge",
      Germany: "de",
      Ghana: "gh",
      Greece: "gr",
      Guatemala: "gt",
      Guinea: "gn",
      "Guinea-Bissau": "gw",
      Guyana: "gy",
      Haiti: "ht",
      Honduras: "hn",
      Hungary: "hu",
      Iceland: "is",
      India: "in",
      Indonesia: "id",
      Iran: "ir",
      Iraq: "iq",
      Ireland: "ie",
      Israel: "il",
      Italy: "it",
      Jamaica: "jm",
      Japan: "jp",
      Jordan: "jo",
      Kazakhstan: "kz",
      Kenya: "ke",
      Kiribati: "ki",
      Kuwait: "kw",
      Kyrgyzstan: "kg",
      Laos: "la",
      Latvia: "lv",
      Lebanon: "lb",
      Lesotho: "ls",
      Liberia: "lr",
      Libya: "ly",
      Liechtenstein: "li",
      Lithuania: "lt",
      Luxembourg: "lu",
      "Macedonia (FYROM)": "mk",
      Madagascar: "mg",
      Malawi: "mw",
      Malaysia: "my",
      Maldives: "mv",
      Mali: "ml",
      Malta: "mt",
      "Marshall Islands": "mh",
      Mauritania: "mr",
      Mauritius: "mu",
      Mexico: "mx",
      Micronesia: "fm",
      Moldova: "md",
      Monaco: "mc",
      Mongolia: "mn",
      Montenegro: "me",
      Morocco: "ma",
      Mozambique: "mz",
      "Myanmar (Burma)": "mm",
      Namibia: "na",
      Nauru: "nr",
      Nepal: "np",
      Netherlands: "nl",
      "New Zealand": "nz",
      Nicaragua: "ni",
      Niger: "ne",
      Nigeria: "ng",
      "North Korea": "kp",
      Norway: "no",
      Oman: "om",
      Pakistan: "pk",
      Palau: "pw",
      Palestine: "ps",
      Panama: "pa",
      "Papua New Guinea": "pg",
      Paraguay: "py",
      Peru: "pe",
      Philippines: "ph",
      Poland: "pl",
      Portugal: "pt",
      Qatar: "qa",
      Romania: "ro",
      Russia: "ru",
      Rwanda: "rw",
      "Saint Kitts and Nevis": "kn",
      "Saint Lucia": "lc",
      "Saint Vincent and the Grenadines": "vc",
      Samoa: "ws",
      "San Marino": "sm",
      "São Tomé and Príncipe": "st",
      "Saudi Arabia": "sa",
      Senegal: "sn",
      Serbia: "rs",
      Seychelles: "sc",
      "Sierra Leone": "sl",
      Singapore: "sg",
      Slovakia: "sk",
      Slovenia: "si",
      "Solomon Islands": "sb",
      Somalia: "so",
      "South Africa": "za",
      "South Korea": "kr",
      "South Sudan": "ss",
      Spain: "es",
      "Sri Lanka": "lk",
      Sudan: "sd",
      Suriname: "sr",
      Swaziland: "sz",
      Sweden: "se",
      Switzerland: "ch",
      Syria: "sy",
      Taiwan: "tw",
      Tajikistan: "tj",
      Tanzania: "tz",
      Thailand: "th",
      Togo: "tg",
      Tonga: "to",
      "Trinidad and Tobago": "tt",
      Tunisia: "tn",
      Turkey: "tr",
      Turkmenistan: "tm",
      Tuvalu: "tv",
      Uganda: "ug",
      Ukraine: "ua",
      "United Arab Emirates": "ae",
      "United Kingdom": "gb",
      "United States": "us",
      Uruguay: "uy",
      Uzbekistan: "uz",
      Vanuatu: "vu",
      "Vatican City": "va",
      Venezuela: "ve",
      Vietnam: "vn",
      Yemen: "ye",
      Zambia: "zm",
      Zimbabwe: "zw",
    };

    const countryCode = countryCodes[country];

    $("#countryFlag").html(`<span class="flag-icon flag-icon-${countryCode.toLowerCase()}"></span>`);

    $("#addToCatalogBtn")
      .off("click")
      .on("click", async function () {
        try {
          const wineName = $("#wineName").text();
          const wineRegion = $("#wineRegion").text();
          const winePrice = $("#winePrice").val();
          const wineYear = $("#wineYear").val();
          const wineVarietal = $("#wineVarietal").val();
          const wineType = $("#wineType").text();
          const wineWinery = $("#wineWinery").text();
          const wineCountry = $("#wineCountry").text();
          const wineSize = $("#wineSize").val();
          const wineDepth = $("#wineDepth").val();
          const wineHeight = $("#wineHeight").val();
          const wineRow = $("#wineRow").val();
          const wineQuantity = $("#wineQuantity").val();

          if (wineQuantity < 0) {
            alert("Quantity cannot be negative.");
            return;
          }

          if (!winePrice || !wineYear || !wineVarietal || !wineSize || !wineQuantity) {
            alert("Please fill in all editable fields, including quantity.");
            return;
          }

          const response = await $.ajax({
            url: "/wines/addToCatalogByName",
            method: "POST",
            data: {
              name: wineName,
              region: wineRegion,
              price: winePrice,
              year: wineYear,
              varietal: wineVarietal,
              type: wineType,
              winery: wineWinery,
              country: wineCountry,
              size: wineSize,
              depth: wineDepth,
              height: wineHeight,
              row: wineRow,
              quantity: wineQuantity,
            },
          });

          console.log("Received wine details:", response);

          const searchQuery = $("#searchInput").val().trim();
          if (searchQuery.length > 0) {
            fetchWines(searchQuery);
          }

          wineTable.ajax.reload();

          $("#wineDetailsModal").modal("hide");
        } catch (error) {
          console.error("Error fetching wine details:", error);
        }
      });
  };

  // UPDATE WINE FROM DATATABLES IN /COLLECTION
  const handleWineEditing = (wineData) => {
    console.log("Handling wine editing:", wineData);
    console.log("Reached handleWineEditing in custom.js");
    console.log("Content of wineData:", wineData);

    // Redraw the DataTable
    $("#wineTable").DataTable().draw();

    // Add this line to log a message after redrawing
    console.log("DataTable redrawn successfully");
  };

  const updateWineDetails = async (wineId) => {
    const formData = {
      name: $("#editName").text(),
      region: $("#editRegion").text(),
      price: $("#editPrice").val(),
      year: $("#editYear").val(),
      varietal: $("#editVarietal").val(),
      type: $("#editType").text(),
      winery: $("#editWinery").text(),
      country: $("#editCountry").text(),
      size: $("#editSize").val(),
      depth: $("#editDepth").val(),
      height: $("#editHeight").val(),
      row: $("#editRow").val(),
    };

    console.log("Wine ID:", wineId);
    console.log("Request URL:", `/wines/${wineId}`);

    try {
      const response = await axios.put(`/wines/${wineId}`, formData);
      console.log("Wine updated successfully:", response.data);

      $("#editWineModal").modal("hide");
      $("#wineTable").DataTable().ajax.reload(); // Add this line to redraw the DataTable
    } catch (error) {
      console.error("Error updating wine:", error);
      // Handle error, display message or take appropriate action
    }
  };

  // Event listener for form submission
  let editFormData;

  // Event listener for form submission
  $("#editWineModal").on("submit", "#editWineForm", async function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Log to check if the event listener reaches this point
    console.log("Reached form submission event listener in custom.js");

    console.log(editFormData);

    // Get the original data before making changes
    const originalData = {
      name: editFormData.name,
      region: editFormData.region,
      price: editFormData.price,
      year: editFormData.year,
      varietal: editFormData.varietal,
      type: editFormData.type,
      winery: editFormData.winery,
      country: editFormData.country,
      size: editFormData.size,
      depth: editFormData.depth,
      height: editFormData.height,
      row: editFormData.row,
    };

    // Log to check the original data
    console.log("Original Data:", originalData);

    // Compare the original data with the form data
    const formData = {
      name: $("#editName").text(),
      region: $("#editRegion").text(),
      price: $("#editPrice").val(),
      year: $("#editYear").val(),
      varietal: $("#editVarietal").val(),
      type: $("#editType").text(),
      winery: $("#editWinery").text(),
      country: $("#editCountry").text(),
      size: $("#editSize").val(),
      depth: $("#editDepth").val(),
      height: $("#editHeight").val(),
      row: $("#editRow").val(),
    };
    const isDataChanged = compareData(originalData, formData);

    console.log(isDataChanged);

    // Check if any changes were made
    if (!isDataChanged) {
      console.log("No changes detected. Form not submitted.");
      return;
    }

    try {
      console.log("editing data");
      console.log(editFormData);
      // Call updateWineDetails to trigger the PUT request for updating wine details
      await updateWineDetails(editFormData._id);

      // Log to check if updateWineDetails is completing successfully
      console.log("updateWineDetails completed successfully");

      // Call handleWineEditing to process the edited wine data
      handleWineEditing(editFormData);

      // Move the modal show inside this block
      $("#editWineModal").modal("show");
    } catch (error) {
      console.error("Error updating wine details:", error);
      // Handle error, display message, or take appropriate action
    }
  });

  // Function to compare data
  const compareData = (originalData, formData) => {
    // Compare each property and return true if any changes are detected
    return JSON.stringify(originalData) !== JSON.stringify(formData);
  };

  // Event listener for "Mark as Consumed" button
  $("#markAsConsumedBtn").on("click", function () {
    const dateConsumed = $("#dateConsumed").val();
    const liked = $("#liked").is(":checked");

    if (!dateConsumed) {
      alert("Please select a date for consumption.");
      return;
    }

    const selectedRow = $(this).closest("tr");
    const wineDataTable = $("#wineTable").DataTable();
    const selectedIndex = wineDataTable.row(selectedRow).index();
    const wineData = wineDataTable.row(selectedIndex).data(); // Get the selected wine's data

    if (wineData && wineData._id) {
      handleWineConsumption(wineDataTable, selectedRow, wineData, dateConsumed, liked);
    } else {
      console.error("Error: Unable to retrieve wine data.");
    }
  });

  // Check if #wineHistory has an existing DataTable instance
  if (!$.fn.DataTable.isDataTable("#wineHistory")) {
    // If not, initialize DataTable on #wineHistory
    const wineHistoryTable = $("#wineHistory").DataTable({
      // Your configuration options for history table
    });
  }

  const handleWineConsumption = async (wineDataTable, selectedRow, data, dateConsumed, liked) => {
    try {
      console.log("Data received for consumption:", editFormData);

      if (editFormData && editFormData._id) {
        const wineId = editFormData._id;
        const consumptionData = {
          wineIds: [wineId],
          dateConsumed,
          liked,
        };

        console.log("Consumption data:", consumptionData);

        try {
          // Send AJAX POST request to mark wine as consumed
          const response = await axios.post(`/wines/${wineId}/consume`, consumptionData);
          console.log("Response from wine update:", response);

          if (response.data.success) {
            console.log("Wine marked as consumed successfully.");

            // Filter out the consumed wine from collection datatable using the DataTables API
            wineDataTable
              .rows(function (idx, rowData, node) {
                return rowData._id === wineId;
              })
              .remove()
              .draw();
            //   65c0f2dbd5849fa42afbb82f Fritz Haag, Brauneberger Juffer Riesling Auslese, Mosel

            // Add the consumed wine to history datatable
            wineHistoryTable.row.add(response.data.data).draw();

            // Hide the edit modal
            $("#editWineModal").modal("hide");
          } else {
            console.error("Error marking wine as consumed:", response.data.message);
          }
        } catch (error) {
          console.error("Error marking wine as consumed:", error);
        }
      } else {
        console.error("Error: Unable to process wine consumption, invalid data.");
      }
    } catch (error) {
      console.error("Error handling wine consumption:", error);
    }
  };

  $("#wineTable tbody").on("click", ".btn-edit", function (e) {
    e.stopPropagation();

    const data = wineTable.row($(this).parents("tr")).data();
    editFormData = data;

    $("#editName").text(data.name);
    $("#editRegion").text(data.region);
    $("#editType").text(data.type);
    $("#editWinery").text(data.winery);
    $("#editCountry").text(data.country);

    $("#editPrice").val(data.price);
    $("#editYear").val(data.year);
    $("#editVarietal").val(data.varietal);
    $("#editSize").val(data.size);
    $("#editDepth").val(data.depth);
    $("#editHeight").val(data.height);
    $("#editRow").val(data.row);

    const wineType = data.type.trim().toLowerCase();
    const heroImage = $(".hero-image img");

    if (wineType === "white") {
      heroImage.attr("src", "/img/hero/white.png");
    } else if (wineType === "red") {
      heroImage.attr("src", "/img/hero/red.png");
    } else if (wineType === "rose") {
      heroImage.attr("src", "/img/hero/rose.png");
    } else {
      heroImage.attr("src", "/img/hero/default.png");
    }

    const pairingImages = $(".pairing-image img");
    pairingImages.attr("src", "/img/pairings/default.png");

    const curatedPairingImages = {
      white: ["/img/pairings/salmon_and_tuna.png", "/img/pairings/pasta.png", "/img/pairings/mushrooms.png", "/img/pairings/vegetarian.png", "/img/pairings/salmon_and_tuna.png", "/img/pairings/pasta.png", "/img/pairings/mushrooms.png", "/img/pairings/vegetarian.png"],
      red: ["/img/pairings/beef.png", "/img/pairings/lamb.png", "/img/pairings/mature_and_hard_cheese.png", "/img/pairings/poultry.png", "/img/pairings/beef.png", "/img/pairings/lamb.png", "/img/pairings/mature_and_hard_cheese.png", "/img/pairings/poultry.png"],

      rose: ["/img/pairings/poultry.png", "/img/pairings/salmon_and_tuna.png", "/img/pairings/mature_and_hard_cheese.png", "/img/pairings/vegetarian.png", "/img/pairings/poultry.png", "/img/pairings/salmon_and_tuna.png", "/img/pairings/mature_and_hard_cheese.png", "/img/pairings/vegetarian.png"],
    };

    console.log("Wine Type:", wineType);
    pairingImages.each(function (index) {
      const defaultImagePath = curatedPairingImages[wineType] ? curatedPairingImages[wineType][index] : "/img/pairings/default.png";
      $(this).attr("src", defaultImagePath);
    });

    const editVarietal = data.varietal.trim().toLowerCase();
    const winePrice = parseFloat(data.price);
    const wineYear = parseInt(data.year);

    let drinkWindowStart, drinkWindowEnd;

    switch (editVarietal) {
      case "sauvignon blanc":
        if (winePrice < 25) {
          drinkWindowStart = wineYear + 1;
          drinkWindowEnd = wineYear + 3;
        } else {
          drinkWindowStart = wineYear + 2;
          drinkWindowEnd = wineYear + 6;
        }
        break;

      case "chardonnay":
        if (winePrice < 40) {
          drinkWindowStart = wineYear + 3;
          drinkWindowEnd = wineYear + 6;
        } else {
          drinkWindowStart = wineYear + 5;
          drinkWindowEnd = wineYear + 10;
        }
        break;

      case "pinot noir":
        if (data.region.toLowerCase() === "oregon" && winePrice < 40) {
          drinkWindowStart = wineYear + 4;
          drinkWindowEnd = wineYear + 8;
        } else if ((data.region.toLowerCase() === "united states" || data.region.toLowerCase() === "france") && winePrice < 40) {
          drinkWindowStart = wineYear + 6;
          drinkWindowEnd = wineYear + 10;
        } else if (winePrice < 80) {
          drinkWindowStart = wineYear + 8;
          drinkWindowEnd = wineYear + 15;
        } else if (winePrice < 120) {
          drinkWindowStart = wineYear + 9;
          drinkWindowEnd = wineYear + 19;
        } else {
          drinkWindowStart = wineYear + 10;
          drinkWindowEnd = wineYear + 25;
        }
        break;

      case "cabernet sauvignon":
        if (winePrice < 40) {
          drinkWindowStart = wineYear + 5;
          drinkWindowEnd = wineYear + 9;
        } else if (winePrice < 80) {
          drinkWindowStart = wineYear + 8;
          drinkWindowEnd = wineYear + 15;
        } else if (winePrice < 120) {
          drinkWindowStart = wineYear + 9;
          drinkWindowEnd = wineYear + 19;
        } else {
          drinkWindowStart = wineYear + 10;
          drinkWindowEnd = wineYear + 25;
        }
        break;

      case "sparkling":
        if (winePrice < 40) {
          drinkWindowStart = wineYear + 2;
          drinkWindowEnd = wineYear + 4;
        } else if (winePrice < 80) {
          drinkWindowStart = wineYear + 3;
          drinkWindowEnd = wineYear + 7;
        } else if (winePrice < 120) {
          drinkWindowStart = wineYear + 4;
          drinkWindowEnd = wineYear + 9;
        } else {
          drinkWindowStart = wineYear + 4;
          drinkWindowEnd = wineYear + 15;
        }
        break;

      default:
        if (winePrice < 40) {
          drinkWindowStart = wineYear + 1;
          drinkWindowEnd = wineYear + 4;
        } else {
          drinkWindowStart = wineYear + 2;
          drinkWindowEnd = wineYear + 7;
        }
        break;
    }

    let alertIcon = "";

    if (drinkWindowStart < 2024) {
      if (drinkWindowEnd < 2024) {
        drinkWindowStart = `<i class="fa fa-exclamation-triangle"></i>`;
        drinkWindowEnd = "Drink Now";
      } else {
        drinkWindowStart = "Now";
      }
    }

    const drinkWindowSpan = document.getElementById("wineDrinkWindow");
    drinkWindowSpan.innerHTML = `${drinkWindowStart} - ${drinkWindowEnd}`;
    console.log(`Drink Window: ${drinkWindowStart} - ${drinkWindowEnd}`);

    // $("#editWineModal").off("submit", "#editWineForm");

    // $("#editWineModal").on("submit", "#editWineForm", function (event) {
    //   event.preventDefault();
    //   handleWineEditing(data);
    //   console.log("Form submitted from manual check");
    // });

    $("#editWineModal").modal("show");
  });

  // FETCH WINES FROM SEARCH BAR
  const fetchWines = async (query) => {
    try {
      const response = await $.ajax({
        url: "/wines/search",
        method: "GET",
        data: {
          name: query,
        },
      });

      console.log("Received wines:", response);
      renderWines(response);
    } catch (error) {
      console.error("Error fetching wines:", error);
    }
  };

  const renderWines = (wines) => {
    const wineList = $("#wineList");
    wineList.empty();

    if (!wines || wines.length === 0) {
      wineList.append("<div>No wines found</div>");
      return;
    }

    wines.forEach((wine) => {
      const wineContainer = $("<div>").addClass("wine-item");

      const nameElement = $("<div>").html(`<strong>${wine.name}</strong>`);
      wineContainer.append(nameElement);

      const details = [];

      if (wine.type && wine.type !== "NA") {
        details.push(wine.type);
      }
      if (wine.region && wine.region !== "NA") {
        details.push(wine.region);
      }
      if (wine.country && wine.country !== "NA") {
        details.push(wine.country);
      }

      if (details.length > 0) {
        const detailElement = $("<div>").html(`<small>${details.join(", ")}</small>`);
        wineContainer.append(detailElement);
      }

      wineList.append(wineContainer);
    });

    $(".wine-item").on("click", function () {
      const wineIndex = $(this).index();
      displayWineDetails(wines[wineIndex]);
    });
  };

  $("#searchInput").on("input", function (event) {
    const searchQuery = $(this).val().trim();
    const wineList = $("#wineList");

    if (searchQuery.length > 0) {
      console.log("Search query submitted:", searchQuery);
      fetchWines(searchQuery);
    } else {
      wineList.empty();
    }
  });

  $("#searchInput").on("typeahead:select", function (ev, wine) {
    displayWineDetails(wine);
  });

  $("#searchInput").on("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      return false;
    }
  });

  // FETCH & LOG ACTIVITY STREAM
  fetch("/dashboard/activity-logs")
    .then((response) => response.json())
    .then((logs) => {
      const logsList = document.getElementById("logs-list");
      logsList.innerHTML = "";

      const logsByDate = {};

      logs.forEach((log) => {
        const date = new Date(log.timestamp).toDateString();
        if (!logsByDate[date]) {
          logsByDate[date] = [];
        }

        logsByDate[date].push(log);
      });

      Object.keys(logsByDate).forEach((date) => {
        const dateHeading = document.createElement("h4");
        dateHeading.textContent = date;
        logsList.appendChild(dateHeading);

        logsByDate[date].forEach((log) => {
          const logItem = document.createElement("li");

          function formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString();
          }

          let logMessage = "";

          if (log.action === "added") {
            logMessage += `<i class="fa fa-check-circle"></i>`;
          } else if (log.action === "deleted") {
            logMessage += `<i class="fa fa-trash"></i>`;
          } else if (log.action === "consumed") {
            logMessage += `<i class="fa fa-glass"></i>`;
          } else {
            logMessage += `<i class="fa fa-pencil"></i>`;
          }

          logMessage += ` ${log.wineName} has been ${log.action} within your collection<br>`;
          logMessage += `On ${formatTimestamp(log.timestamp)}`;

          logItem.innerHTML = logMessage;
          logItem.classList.add("list-group-item");

          logsList.appendChild(logItem);
        });
      });

      logsList.style.overflowY = "scroll";
      logsList.style.maxHeight = "220px";
    })
    .catch((error) => {
      console.error("Error fetching logs:", error);
    });

  // DELETE MULTIPLE SELECTED BUTTON
  $("#selectAllCheckbox").click(function () {
    $(".wine-checkbox").prop("checked", this.checked);
  });

  $("#bulkDeleteBtn").on("click", async function () {
    const selectedWines = [];

    $(".wine-checkbox:checked").each(function () {
      const wineId = $(this).data("id");
      selectedWines.push(wineId);
    });

    if (selectedWines.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedWines.length} selected wines?`)) {
        try {
          const promises = selectedWines.map(async (wineId) => {
            try {
              const response = await axios.delete(`/wines/${wineId}`);
              return response.status === 200;
            } catch (error) {
              console.error(error);
              return false;
            }
          });

          const results = await Promise.all(promises);

          if (results.every((result) => result === true)) {
            // Refresh the DataTable after successful deletion
            $("#wineTable").DataTable().ajax.reload();
          } else {
            alert("Some deletions were unsuccessful. Please try again.");
          }
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      alert("Please select wines to delete.");
    }
  });

  // DELETE ONE WINE BUTTON
  $("#wineTable tbody").on("click", ".btn-delete", async function (e) {
    e.preventDefault();
    e.stopPropagation();

    const row = wineTable.row($(this).parents("tr"));
    const data = row.data();

    if (confirm("Are you sure you want to delete this wine?")) {
      try {
        const response = await axios.delete(`/wines/${data._id}`);
        console.log(response.data);

        if (response.status === 200) {
          row.remove().draw();
        } else {
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  $("#wineTable tbody").on("click", "tr", function (e) {
    if (e.target.className !== "btn btn-danger btn-delete") {
      e.stopPropagation();
    }
  });

  wineTable.ajax.reload();

  $("#wineTable").on("click", "tbody tr", async function () {
    const row = wineTable.row(this);
    const data = row.data();

    if (confirm("Are you sure you want to delete this wine?")) {
      try {
        const response = await axios.delete(`/wines/${data._id}`);
        console.log(response.data);

        if (response.status === 200) {
          row.remove().draw();
        } else {
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  // FETCH USERNAME
  async function fetchUserData() {
    try {
      const response = await fetch("/api/user"); // Your endpoint to fetch user data
      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  async function updateFirstnamePlaceholder() {
    try {
      const userData = await fetchUserData();

      if (userData && userData.firstName) {
        const firstName = userData.firstName;
        document.getElementById("firstnamePlaceholder").textContent = `Hello, ${firstName}`;
        document.getElementById("firstnamePlaceholder").style.fontSize = "18px";
      } else if (userData && !userData.firstName) {
        console.error("First name not found in user data:", userData);
        document.getElementById("firstnamePlaceholder").textContent = "No first name available";
      } else {
        console.error("Invalid user data:", userData);
        document.getElementById("firstnamePlaceholder").textContent = "Error fetching data";
      }
    } catch (error) {
      console.error("Error updating first name placeholder:", error);
      document.getElementById("firstnamePlaceholder").textContent = "Error fetching data";
    }
  }

  updateFirstnamePlaceholder();

  // UPDATE PROFILE DETAILS FOR LOGGED IN USER
  async function loadProfileImage(imageSrc, imageElementId) {
    try {
      const response = await fetch(imageSrc);
      if (!response.ok) {
        throw new Error("Failed to fetch the image");
      }
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      const imageElement = document.getElementById(imageElementId);
      if (imageElement) {
        imageElement.src = objectURL;
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  }

  async function updateProfile(event) {
    event.preventDefault();

    const form = document.getElementById("profileForm");
    const formData = new FormData(form);
    const fileInput = document.getElementById("profileImage").files[0];

    formData.append("profileImage", fileInput);

    try {
      const response = await fetch("/auth/updateProfile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchAndPopulateUserData();
        console.log("Profile updated successfully");
        window.location.href = "/editprofile"; // Redirect to the profile edit page
      } else {
        const errorData = await response.json();
        console.error("Profile update failed:", errorData.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }

  // FETCH USER DATA & POPULATE CLIENT-SIDE
  async function fetchAndPopulateUserData() {
    try {
      const userDataResponse = await fetch("/api/user");
      const userData = await userDataResponse.json();

      if (userData) {
        const firstNameElement = document.getElementById("firstName");
        if (firstNameElement) {
          firstNameElement.value = userData.firstName || "";
        }

        const lastNameElement = document.getElementById("lastName");
        if (lastNameElement) {
          lastNameElement.value = userData.lastName || "";
        }

        const emailElement = document.getElementById("email");
        if (emailElement) {
          emailElement.value = userData.email || "";
        }

        const profileImageElementId = "profileImageElement";
        const profileImagePath = userData.profileImage || "default-profile-image.png";

        const profileImageElement = document.getElementById(profileImageElementId);
        if (profileImageElement) {
          profileImageElement.onerror = function () {
            // Set a default image in case the profile image fails to load
            profileImageElement.src = userData.profileImage || "/uploads/default-profile-image.png";
          };
          loadProfileImage(profileImagePath, profileImageElementId);
        }
      } else {
        console.error("User data not available");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  window.addEventListener("load", fetchAndPopulateUserData);

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profileForm");
    form.addEventListener("submit", updateProfile);
  });

  // ANALYTICS
  // FETCH WINE & SP500 DATA TO DASHBOARD CHART
  $(document).ready(async function () {
    try {
      const wineStockDataResponse = await fetch("/stock/dashboard");
      const sp500DataResponse = await fetch("/sp500/dashboard");

      if (!wineStockDataResponse.ok || !sp500DataResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const wineStockData = await wineStockDataResponse.json();
      const sp500Data = await sp500DataResponse.json();

      const chartData = {
        categories: wineStockData.map((item) => item.date),
        wineStock: wineStockData.map((item) => item.value),
        sp500: sp500Data.map((item) => item.value),
      };

      var options = {
        chart: {
          type: "area",
          toolbar: {
            show: false,
          },
        },
        series: [
          {
            name: "Wine Stock Index",
            data: chartData.wineStock,
            color: "#293846", // Blue color
          },
          {
            name: "Global Equity Index",
            data: chartData.sp500,
            color: "#944444", // Green color
          },
        ],
        dataLabels: {
          enabled: false,
        },

        yaxis: {
          labels: {
            formatter: function (value) {
              return value.toFixed(2) + "%";
            },
          },
        },
        xaxis: {
          type: "datetime",
          labels: {
            show: true,
          },
          categories: chartData.categories,
        },
      };

      var chart = new ApexCharts(document.querySelector("#wineStockChart"), options);
      chart.render();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });

  // GET TOTAL PRICE OF WINE
  async function getTotalWineValue() {
    try {
      const response = await fetch("/wines/totalWineValue"); // Fetch total wine value from backend
      const data = await response.json();
      const totalValueElement = document.getElementById("totalValue");

      if (totalValueElement) {
        const formattedTotalValue = `$${data.totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        totalValueElement.innerText = formattedTotalValue;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const totalValueElement = document.getElementById("totalValue");
      if (totalValueElement) {
        totalValueElement.innerText = "Error fetching data";
      }
    }
  }

  await getTotalWineValue();

  // PURCHASE PRICE DISTRIBUTION SCATTER GRAPH
  fetch("/wines/price-distribution")
    .then((response) => response.json())
    .then((data) => {
      const labels = Object.keys(data).map((priceRange) => {
        const range = priceRange.split("-");
        if (range.length === 1) {
          return `$${range[0]}+`;
        } else {
          return `$${range[0]}-$${range[1]}`;
        }
      });

      const values = Object.values(data);

      const scatterData = labels.map((label, index) => ({
        x: parseFloat(label.replace("$", "").replace("+", "")),
        y: values[index],
      }));

      const options = {
        chart: {
          type: "scatter",
          toolbar: {
            show: false,
          },
        },
        series: [
          {
            name: "Price Distribution",
            data: scatterData,
          },
        ],
        xaxis: {
          type: "numeric",
          labels: {
            formatter: function (val) {
              return `$${parseFloat(val).toFixed(1)}`;
            },
            style: {
              colors: "#fff", // X-axis text color
            },
          },
        },
        yaxis: {
          title: {
            style: {
              color: "#fff", // Y-axis title color
            },
          },
          labels: {
            formatter: function (val) {
              return val.toFixed(0);
            },
            style: {
              colors: "#fff", // Y-axis labels color
            },
          },
        },
        markers: {
          size: 10, // Adjust the marker size as needed
          colors: "#944444",
        },
        grid: {
          show: false, // Set show to false to remove grid lines
        },
        tooltip: {
          enabled: false,
        },
      };

      var chart = new ApexCharts(document.querySelector("#scatterChart"), options);
      chart.render();
    })
    .catch((error) => console.error("Error fetching data:", error));

  // WINE COUNTRY DISTRIBUTION GRAPH
  fetch("/wines/country-distribution")
    .then((response) => response.json())
    .then((data) => {
      const countries = Object.keys(data);
      const counts = Object.values(data);

      const options = {
        chart: {
          type: "bar",
          toolbar: {
            show: false,
          },
        },
        tooltip: {
          enabled: false,
        },
        series: [
          {
            name: "Wine Country Distribution",
            data: counts,
          },
        ],
        xaxis: {
          categories: countries, // Fix the variable name here
          labels: {
            rotate: -45,
            hideOverlappingLabels: false,
            style: {
              colors: "#fff", // Change X-axis text color here
            },
            trim: false,
          },
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return val.toFixed(0);
            },
            style: {
              colors: "#fff", // Change Y-axis text color here
            },
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "70%",
            colors: {
              ranges: [
                {
                  from: 0,
                  to: 1,
                  color: "#732222",
                },
                {
                  from: 2,
                  to: 3,
                  color: "#853030",
                },
                {
                  from: 4,
                  to: 5,
                  color: "#944444",
                },
                {
                  from: 6,
                  to: 10,
                  color: "#b05d5d",
                },
                {
                  from: 11,
                  to: 20,
                  color: "#c47070",
                },
                {
                  from: 21,
                  to: 40,
                  color: "#de8383",
                },
                {
                  from: 41,
                  to: 60,
                  color: "#ee4540",
                },
                {
                  from: 61,
                  to: 90,
                  color: "#b7372a",
                },
                {
                  from: 91,
                  to: 150,
                  color: "#8f2514",
                },
                {
                  from: 151,
                  to: 400,
                  color: "#fcbb69",
                },
              ],
            },
          },
        },
        dataLabels: {
          enabled: true,
        },
        legend: {
          show: false,
        },
        grid: {
          show: false,
          borderColor: false,
          strokeDashArray: 4,
          padding: {
            bottom: 0,
          },
        },
      };

      var chart = new ApexCharts(document.querySelector("#columnChart"), options);
      chart.render();
    })
    .catch((error) => console.error("Error fetching data:", error));

  // FETCH WINE VARIETIES
  fetch("/wines/variety-distribution")
    .then((response) => response.json())
    .then((data) => {
      const countries = Object.keys(data);
      const counts = Object.values(data);

      const options = {
        chart: {
          type: "bar",
          toolbar: {
            show: false,
          },
        },
        tooltip: {
          enabled: false,
        },
        series: [
          {
            name: "Wine Variety Distribution",
            data: counts,
          },
        ],
        xaxis: {
          categories: countries, // Fix the variable name here
          labels: {
            rotate: -45,
            hideOverlappingLabels: false,
            style: {
              colors: "#fff", // Change X-axis text color here
            },
            trim: false,
          },
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return val.toFixed(0);
            },
            style: {
              colors: "#fff", // Change Y-axis text color here
            },
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "70%",
            colors: {
              ranges: [
                {
                  from: 0,
                  to: 1,
                  color: "#732222",
                },
                {
                  from: 2,
                  to: 3,
                  color: "#853030",
                },
                {
                  from: 4,
                  to: 5,
                  color: "#944444",
                },
                {
                  from: 6,
                  to: 10,
                  color: "#b05d5d",
                },
                {
                  from: 11,
                  to: 20,
                  color: "#c47070",
                },
                {
                  from: 21,
                  to: 40,
                  color: "#de8383",
                },
                {
                  from: 41,
                  to: 60,
                  color: "#ee4540",
                },
                {
                  from: 61,
                  to: 90,
                  color: "#b7372a",
                },
                {
                  from: 91,
                  to: 150,
                  color: "#8f2514",
                },
                {
                  from: 151,
                  to: 400,
                  color: "#fcbb69",
                },
              ],
            },
          },
        },
        dataLabels: {
          enabled: true,
        },
        legend: {
          show: false,
        },
        grid: {
          show: false,
          borderColor: false,
          strokeDashArray: 4,
          padding: {
            bottom: 0,
          },
        },
      };

      var chart = new ApexCharts(document.querySelector("#wineVarietyChart"), options);
      chart.render();
    })
    .catch((error) => console.error("Error fetching data:", error));

  // FETCH PRICE PER BOTTLE (PRICE / BOTTLES)
  async function getPricePerBottle() {
    try {
      const response = await axios.get("/wines/price-per-bottle");
      const pricePerBottle = response.data.pricePerBottle;

      console.log("Price per bottle (raw):", pricePerBottle);

      // Check if the retrieved value can be converted to a number
      const parsedPrice = parseFloat(pricePerBottle);
      if (!isNaN(parsedPrice)) {
        const formattedPrice = parsedPrice.toFixed(2);
        console.log("Price per bottle (formatted):", formattedPrice);

        const pricePerBottleElement = document.getElementById("pricePerBottle");
        if (pricePerBottleElement) {
          pricePerBottleElement.textContent = `$${formattedPrice}`;
        } else {
          console.error('Element with ID "pricePerBottle" not found.');
        }
      } else {
        console.error("Value cannot be converted to a number.");
        const pricePerBottleElement = document.getElementById("pricePerBottle");
        if (pricePerBottleElement) {
          pricePerBottleElement.textContent = "N/A";
        } else {
          console.error('Element with ID "pricePerBottle" not found.');
        }
      }
    } catch (error) {
      console.error("Error fetching price per bottle:", error);
      const pricePerBottleElement = document.getElementById("pricePerBottle");
      if (pricePerBottleElement) {
        pricePerBottleElement.textContent = "N/A";
      } else {
        console.error('Element with ID "pricePerBottle" not found.');
      }
    }
  }

  await getPricePerBottle();

  // Edit wine
  $("#wineTable tbody").on("click", ".btn-edit", function () {
    const data = wineTable.row($(this).parents("tr")).data();
  });
});

// Update JavaScript section
$(document).ready(function () {
  $("#wineForm").submit(function (event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = {
      name: $("#name").val(),
      region: $("#region").val(),
      price: $("#price").val(),
      year: $("#year").val(),
      varietal: $("#varietal").val(),
      type: $("#type").val(),
      winery: $("#winery").val(),
      country: $("#country").val(),
      size: $("#size").val(),
      depth: $("#depth").val(),
      height: $("#height").val(),
      row: $("#row").val(),
    };

    axios
      .post("/api/wines", formData)
      .then(function (response) {
        console.log("Wine added successfully:", response.data);
        $("#addWineModal").modal("hide");
      })
      .catch(function (error) {
        console.error("Error adding wine:", error);
      });
  });
});

async function fetchTotalWines() {
  try {
    const response = await axios.get("/wines/totalCount");
    const totalWines = response.data.totalWineCount;
    document.getElementById("totalWines").textContent = totalWines;
  } catch (error) {
    console.error("Error fetching total count of wines:", error);
  }
}

window.onload = fetchTotalWines;

// ADD NEW WINES TO THE DATABASE
wineForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const region = document.getElementById("region").value;
  const price = document.getElementById("price").value;
  const year = document.getElementById("year").value;
  const varietal = document.getElementById("varietal").value;
  const type = document.getElementById("type").value;
  const winery = document.getElementById("winery").value;
  const country = document.getElementById("country").value;
  const size = document.getElementById("size").value;
  const depth = document.getElementById("depth").value;
  const height = document.getElementById("height").value;
  const row = document.getElementById("row").value;

  try {
    const response = await axios.post("/wines", {
      name,
      region,
      price,
      year,
      varietal,
      type,
      winery,
      country,
      size,
    });
    console.log(response.data);

    $("#wineTable").DataTable().ajax.reload();
  } catch (error) {
    console.error(error);
  }
});

// CSV IMPORT
const handleCSVUpload = async (event) => {
  event.preventDefault();

  try {
    const csvUploadForm = document.getElementById("csvUploadForm").dropzone;
    csvUploadForm.processQueue();

    // Use the 'complete' event instead of 'success'
    csvUploadForm.on("complete", function () {
      console.log("CSV upload completed.");

      const wineTable = $("#wineTable").DataTable();

      wineTable.ajax.reload(null, false);

      // Reload the page
      location.reload();
    });

    csvUploadForm.on("error", function (file, errorMessage) {
      console.error("Error uploading CSV:", errorMessage);
    });
  } catch (error) {
    console.error("Error uploading CSV:", error);
  }
};

// LOGIN
$(document).ready(function () {
  $("#loginForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    var formData = {
      email: $("input[name=email]").val(),
      password: $("input[name=password]").val(),
    };

    // AJAX POST request to the backend
    $.ajax({
      type: "POST",
      url: "/auth/custom-login", // Change this URL to your backend login route
      data: formData,
      success: function (response, status, xhr) {
        // Check the status code of the response
        if (xhr.status === 200) {
          // Redirect to dashboard only on successful login
          console.log("Login successful");
          window.location.replace("/dashboard"); // Redirect to the dashboard or homepage
        } else {
          // Handle other status codes
          console.error("Login failed with status code:", xhr.status);
          // Handle invalid credentials or other errors
          alert("Invalid credentials. Please try again.");
        }
      },
      error: function (xhr, status, error) {
        // Handle error, e.g., display an error message
        console.error("Login failed:", error);
        alert("Login failed. Please try again.");
      },
    });
  });
});

function updateStockTicker() {
  const lastUpdate = localStorage.getItem("lastUpdate");
  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day

  const cachedData = JSON.parse(localStorage.getItem("stockData"));

  // Check if a day has passed since the last update or if no data is cached
  if (!cachedData || !lastUpdate || now - lastUpdate > oneDay) {
    axios
      .get("/tickers")
      .then((response) => {
        const stockData = response.data;

        if (stockData.STZ && stockData.LVMUY && stockData.PDRDF && stockData.DEO) {
          localStorage.setItem("stockData", JSON.stringify(stockData));
          localStorage.setItem("lastUpdate", now);
          console.log("Data stored in cache:", stockData);
          displayStockData(stockData);
        } else {
          console.error("Incomplete stock data received:", stockData);
        }
      })
      .catch((error) => {
        console.error("Error fetching stock data:", error);
      });
  } else {
    console.log("Retrieved cached data:", cachedData);
    displayStockData(cachedData);
  }
}

function displayStockData(stockData) {
  updateStockItem("stockDataSTZ", stockData.STZ);
  updateStockItem("stockDataLVMUY", stockData.LVMUY);
  updateStockItem("stockDataPDRDF", stockData.PDRDF);
  updateStockItem("stockDataDEO", stockData.DEO);
}

// Define a mapping of stock symbols to their names or tickers
const stockSymbolMapping = {
  STZ: "Constellation Brands, Inc.",
  LVMUY: "LVMH Moet Hennessy Louis Vuitton SA",
  PDRDF: "Pernod Ricard SA",
  DEO: "Diageo plc",
};

function updateStockItem(itemId, data) {
  const dailyChange = parseFloat(data.close) - parseFloat(data.open);
  const changePercent = ((dailyChange / parseFloat(data.open)) * 100).toFixed(2);

  // Get the stock name or ticker from the mapping
  const stockName = stockSymbolMapping[data.symbol] || "Unknown Stock";

  const stockListItem = `
                <h2 class="no-margins">$${data.close}</h2>
                <small>${stockName}</small>
                <div class="stat-percent">Daily ${changePercent}% <i class="fa ${dailyChange < 0 ? "fa-level-down" : "fa-level-up"}"></i></div>
            `;

  document.getElementById(itemId).innerHTML = stockListItem;
}

updateStockTicker();
