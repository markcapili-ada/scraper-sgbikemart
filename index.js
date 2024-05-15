import puppeteer from "puppeteer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import GoogleSheetsAPI from "./GoogleSheetsAPI.js";

var BIKES = [];
(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  var page = await browser.newPage();

  // Navigate the page to a URL
  const domain = "https://sgbikemart.com.sg";

  try {
    // MAIN LOOP
    fs.readFile("bikes.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return;
      }

      if (data) {
        BIKES = JSON.parse(data);
        // console.log(BIKES);
      } else {
        console.log("JSON file is empty");
      }
    });

    for (let pageNum = 1; pageNum <= 30; pageNum++) {
      let success = false;

      while (!success) {
        try {
          await scraperProcess(page, browser, pageNum, domain);
          success = true;
        } catch (error) {
          console.log("Error in page number: ", pageNum, error);
          success = false;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  await browser.close();
})();

async function scraperProcess(page, browser, pageNum, domain) {
  page = await browser.newPage();
  await page.waitForTimeout(3000);
  await page.goto(
    `https://sgbikemart.com.sg/listing/usedbikes/listing/?page=${pageNum}&sort_by=newest`,
    { timeout: 5000 }
  );

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  var usedBikesRefs = [];
  for (let index = 0; index < 20; index++) {
    var selector1 = `body > section.main-content > div > div > div.col-lg-9 > div:nth-child(${
      3 + index
    }) > div > div.col-md-9.d-flex.flex-column.align-content-end > div.card-body.pb-2.pe-2.d-flex > div > div.col-3.text-end.d-flex.flex-column > div.d-block.w-100 > a`;
    console.log(selector1);
    const href = await page.$eval(selector1, (element) =>
      element.getAttribute("href")
    );

    var postedOn = `body > section.main-content > div > div > div.col-lg-9 > div:nth-child(${
      index + 3
    }) > div > div.col-md-9.d-flex.flex-column.align-content-end > div.card-body.pb-2.pe-2.d-flex > div > div.col-9.d-flex > div > div:nth-child(6) > div > div:nth-child(1) > small`;

    await page.waitForSelector(postedOn);
    var postedOnData = await page.$eval(
      postedOn,
      (element) => element.textContent
    );
    usedBikesRefs.push({
      href: href,
      postedOn: postedOnData.match(/\d{2}\/\d{2}\/\d{4}/)[0],
    });
  }

  console.log(usedBikesRefs);
  await page.waitForTimeout(3000);

  var bikeName =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-header.py-4 > h2";
  var listingType =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(1) > td.value";
  var brand =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(2) > td.value > a";
  var engineCapacity =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(4) > td.value";
  var classification =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(5) > td.value > a";
  var regDate =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(6) > td.value";
  var CEOexpiryDate =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(7) > td.value";
  var milleage =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(8) > td.value";
  var noOfOwners =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(9) > td.value";
  var typeOfVehicle =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-body.p-0 > div > table > tbody > tr:nth-child(10) > td.value > a";
  var price =
    "body > section.main-content > div > div > div.col-lg-9 > div.row.g-3 > div:nth-child(2) > div > div.card-footer.border-top-0.py-3 > h2";
  var address =
    "#bike-contacts > div.card-body.p-0.pt-2 > table > tbody > tr:nth-child(2) > td:nth-child(2) > a";

  const clickToViewContact = (addressAvailable, numContact) => {
    if (addressAvailable === 1) {
      return `#bike-contacts > div.card-body.p-0.pt-2 > div:nth-child(1) > table > tbody > tr > td:nth-child(2) > div > strong > span > a`;
    } else {
      return `#bike-contacts > div.card-body.p-0.pt-2 > div:nth-child(${addressAvailable}) > table > tbody > tr:nth-child(${numContact}) > td:nth-child(2) > div > strong > span > a`;
    }
  };
  const contactNumber = (addressAvailable, numContact) => {
    return `#bike-contacts > div.card-body.p-0.pt-2 > div:nth-child(${addressAvailable}) > table > tbody > tr:nth-child(${numContact}) > td:nth-child(2) > div > strong`;
  };
  const contactName = (addressAvailable, numContact) => {
    return `#bike-contacts > div.card-body.p-0.pt-2 > div:nth-child(${addressAvailable}) > table > tbody > tr:nth-child(${numContact}) > td:nth-child(1)`;
  };

  for (let index = 0; index < 20; index++) {
    console.log(`Page: ${pageNum} Item: ${index + 1}`);
    var gotoBikePageSuccess = false;
    page = await browser.newPage();
    while (!gotoBikePageSuccess) {
      try {
        console.log(`${domain}${usedBikesRefs[index].href}`);
        if (
          checkIfBikePermalinkExist(
            BIKES,
            `${domain}${usedBikesRefs[index].href}`
          )
        ) {
          console.log("Bike already exists in the database 1");
          gotoBikePageSuccess = true;
          continue;
        }
        await page.waitForTimeout(3000);

        await page.goto(domain + usedBikesRefs[index].href, {
          timeout: 10000,
        });
        await page.setViewport({ width: 1080, height: 1024 });

        await page.waitForSelector(bikeName);
        var bikeNameData = await page.$eval(
          bikeName,
          (element) => element.textContent
        );

        await page.waitForSelector(listingType);
        var listingTypeData = await page.$eval(
          listingType,
          (element) => element.textContent
        );

        await page.waitForSelector(brand);
        var brandData = await page.$eval(
          brand,
          (element) => element.textContent
        );

        await page.waitForSelector(engineCapacity);
        var engineCapacityData = await page.$eval(
          engineCapacity,
          (element) => element.textContent
        );

        await page.waitForSelector(classification);
        var classificationData = await page.$eval(
          classification,
          (element) => element.textContent
        );

        await page.waitForSelector(regDate);
        var regDateData = await page.$eval(
          regDate,
          (element) => element.textContent
        );

        await page.waitForSelector(CEOexpiryDate);
        var CEOexpiryDateData = await page.$eval(
          CEOexpiryDate,
          (element) => element.textContent
        );

        await page.waitForSelector(milleage);
        var milleageData = await page.$eval(
          milleage,
          (element) => element.textContent
        );

        await page.waitForSelector(noOfOwners);
        var noOfOwnersData = await page.$eval(
          noOfOwners,
          (element) => element.textContent
        );

        await page.waitForSelector(typeOfVehicle);
        var typeOfVehicleData = await page.$eval(
          typeOfVehicle,
          (element) => element.textContent
        );

        await page.waitForSelector(price);
        var priceData = await page.$eval(
          price,
          (element) => element.textContent
        );
        var addressData = "Not Available";
        try {
          await page.waitForSelector(address, { timeout: 5000 });
          addressData = await page.$eval(
            address,
            (element) => element.textContent
          );
        } catch (error) {
          console.log(error);
        }

        // FOR PHONE NUMBERS:

        var contacts = [];
        try {
          for (let i = 1; i <= 2; i++) {
            var isAddressDataAvailable =
              addressData === "Not Available" ? 1 : 3;

            await page.waitForSelector(
              clickToViewContact(isAddressDataAvailable, i),
              { timeout: 5000 }
            );
            await page.click(clickToViewContact(isAddressDataAvailable, i));
            await page.waitForTimeout(3000);

            await page.waitForSelector(
              contactNumber(isAddressDataAvailable, i),
              { timeout: 5000 }
            );
            var contactNumberData = await page.$eval(
              contactNumber(isAddressDataAvailable, i),
              (element) => element.textContent
            );
            await page.waitForSelector(contactName(isAddressDataAvailable, i), {
              timeout: 5000,
            });
            var contactNameData = await page.$eval(
              contactName(isAddressDataAvailable, i),
              (element) => element.textContent
            );
            contacts.push({
              contactName: contactNameData.replace(/\n/g, ""),
              contactNumber: contactNumberData,
            });
          }
        } catch (error) {
          console.log(error);
        }

        // FOR PHONE NUMBERS(end)
        var bike = {
          id: uuidv4(),
          bikeName: bikeNameData,
          listingType: listingTypeData,
          brand: brandData.replace(/\n/g, ""),
          engineCapacity: engineCapacityData,
          classification: classificationData.replace(/\n/g, ""),
          regDate: regDateData.replace(/\n/g, ""),
          CEOexpiryDate: CEOexpiryDateData.replace(/\n/g, ""),
          milleage: milleageData,
          noOfOwners: noOfOwnersData.replace(/\n/g, ""),
          typeOfVehicle: typeOfVehicleData.replace(/\n/g, ""),
          price: priceData.replace(/\n/g, ""),
          permalink: domain + usedBikesRefs[index].href,
          postedOn: usedBikesRefs[index].postedOn,
          address: addressData.replace(/\n/g, ""),
          contacts: contacts,
        };
        console.log(bike);

        if (!checkIfBikeExist(BIKES, bike)) {
          BIKES.push(bike);
          await addBikeToSheet([
            [
              bike.id,
              bike.bikeName,
              bike.listingType,
              bike.brand,
              bike.engineCapacity,
              bike.classification,
              bike.regDate,
              bike.CEOexpiryDate.match(/\d{2}\/\d{2}\/\d{4}/)[0],
              bike.milleage,
              bike.noOfOwners,
              bike.typeOfVehicle,
              bike.price,
              bike.permalink,
              bike.postedOn,
              bike.address,
              JSON.stringify(bike.contacts),
            ],
          ]);
          // await page.screenshot({
          //   path: `./screenshots/screenshot-${pageNum}-${index + 1}.png`,
          // });
          fs.writeFile("bikes.json", JSON.stringify(BIKES), (err) => {
            if (err) {
              console.error("Error writing JSON file:", err);
            } else {
              console.log("Bikes data saved to bikes.json");
            }
          });
        } else {
          console.log("Bike already exists in the database 2");
        }

        gotoBikePageSuccess = true;
      } catch (error) {
        console.log(error);
        gotoBikePageSuccess = false;
      }
    }
  }
}

async function addBikeToSheet(values) {
  const credentialsPath = "credentials.json";
  const tokenPath = "token.json";
  const spreadsheetId = "1vhIxaHDq15uLbBlTCUEy1lm8uZULBUdKwgyqgquBGJA"; // Replace with your spreadsheet ID

  const googleSheets = new GoogleSheetsAPI();

  // Define the range and values you want to append
  const range = "data";

  // Append the data to the sheet
  googleSheets.addData(range, values);
}

function checkIfBikeExist(bikes, bike) {
  for (let i = 0; i < bikes.length; i++) {
    if (bikes[i].permalink === bike.permalink) {
      return true;
    }
  }
  return false;
}

function checkIfBikePermalinkExist(bikes, permalink) {
  for (let i = 0; i < bikes.length; i++) {
    if (bikes[i].permalink === permalink) {
      return true;
    }
  }
  return false;
}
