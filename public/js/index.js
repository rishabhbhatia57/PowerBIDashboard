// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

let models = window["powerbi-client"].models;
let reportContainer = $("#report-container").get(0);

let newsettingD = {
  panes: {
    filters: {
      visible: false
    },
    pageNavigation: { visible: false },
  },
  layoutType: models.LayoutType.MobileLandscape
}

let newsettingM = {
  panes: {
    filters: {
      visible: false
    },
    pageNavigation: { visible: false },
  },
  layoutType: models.LayoutType.MobilePortrait
}

let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
    let newSettings = newsettingD

    if (isMobile) { //this returns true or false
        newSettings = newsettingM
    }

// Initialize iframe for embedding report
powerbi.bootstrap(reportContainer, { 
  type: "report",
  hostname: "https://app.powerbi.com",
  settings: newSettings
});

const filterOnIs_MIS_Admin = {
  $schema: "http://powerbi.com/product/schema#basic",
  target: {
    table: "Is_MIS_Admin",
    column: "Is_MIS_Admin",
  },
  operator: "AND",
  values: [1],
};

const filterOnSlicerTable = {
  $schema: "http://powerbi.com/product/schema#basic",
  target: {
    table: "SlicerTable",
    column: "Sales_Team_Member",
  },
  operator: "AND",
  values: [""],
};

// AJAX request to get the report details from the API and pass it to the UI
$.ajax({
  type: "GET",
  url: "/getEmbedToken",
  dataType: "json",
  success: function (embedData) {
    var URL = embedData.embedUrl[0].embedUrl;

    // Create a config object with type of the object, Embed details and Token Type
    let reportLoadConfig = {
      type: "report",
      tokenType: models.TokenType.Embed,
      accessToken: embedData.accessToken,
      filters: [filterOnIs_MIS_Admin, filterOnSlicerTable],

      // Use other embed report config based on the requirement. We have used the first one for demo purpose
      embedUrl: URL,
      settings: newSettings

      // Enable this setting to remove gray shoulders from embedded report
      // settings: {
      //     background: models.BackgroundType.Transparent
      // }
    };

    // Use the token expiry to regenerate Embed token for seamless end user experience
    // Refer https://aka.ms/RefreshEmbedToken
    tokenExpiry = embedData.expiry;

    // Embed Power BI report when Access token and Embed URL are available
    let report = powerbi.embed(reportContainer, reportLoadConfig);

    // Clear any other loaded handler events
    report.off("loaded");

    // Triggers when a report schema is successfully loaded
    report.on("loaded", function () {
      console.log("Report load successful");
    });

    // Clear any other rendered handler events
    report.off("rendered");

    // Triggers when a report is successfully embedded in UI
    report.on("rendered", function () {
      console.log("Report render successful");
    });

    // Clear any other error handler events
    report.off("error");

    // Handle embed errors
    report.on("error", function (event) {
      let errorMsg = event.detail;
      console.error(errorMsg);
      return;
    });
  },

  error: function (err) {
    // Show error container
    let errorContainer = $(".error-container");
    $(".embed-container").hide();
    errorContainer.show();

    // Get the error message from err object
    let errMsg = JSON.parse(err.responseText)["error"];

    // Split the message with \r\n delimiter to get the errors from the error message
    let errorLines = errMsg.split("\r\n");

    // Create error header
    let errHeader = document.createElement("p");
    let strong = document.createElement("strong");
    let node = document.createTextNode("Error Details:");

    // Get the error container
    let errContainer = errorContainer.get(0);

    // Add the error header in the container
    strong.appendChild(node);
    errHeader.appendChild(strong);
    errContainer.appendChild(errHeader);

    // Create <p> as per the length of the array and append them to the container
    errorLines.forEach((element) => {
      let errorContent = document.createElement("p");
      let node = document.createTextNode(element);
      errorContent.appendChild(node);
      errContainer.appendChild(errorContent);
    });
  },
});


// window.addEventListener('resize', async ()=>{
//   //write a function to detect the screen size
//   let isMobile=await isMobileScreen(); 
  
//   let newSettings = {
//       layoutType: models.LayoutType.MobileLandscape
//   }; 
  
//   if(isMobile){ //this returns true or false
//       newSettings = {
//           layoutType: models.LayoutType.MobilePortrait
//       };
//       report.updateSettings(newSettings);//update the report settings
//   }else{
//       report.updateSettings(newSettings); //update the report settings
//   }});
