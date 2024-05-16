import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import GoogleSheetsAPI from "./GoogleSheetsAPI.js";
const googleSheets = new GoogleSheetsAPI();
var BIKES = [];

async function runScraperProcess() {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-features=site-per-process",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  // const browser = await puppeteer.launch();
  var page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });
  // Navigate the page to a URL
  const domain = "https://sgbikemart.com.sg";

  try {
    // MAIN LOOP
    const lastRow = await googleSheets.getLastRow("data");
    var allData = await googleSheets.getAllData(`data!A2:Q${lastRow + 1}`);
    BIKES = allData.map((bike) => {
      return {
        id: bike[0],
        bikeName: bike[1],
        listingType: bike[2],
        brand: bike[3],
        engineCapacity: bike[4],
        classification: bike[5],
        regDate: bike[6],
        COEexpiryDate: bike[7],
        milleage: bike[8],
        noOfOwners: bike[9],
        typeOfVehicle: bike[10],
        price: bike[11],
        permalink: bike[12],
        postedOn: bike[13],
        address: bike[14],
        companyName: bike[15],
        contacts: JSON.parse(bike[16]),
      };
    });
    for (let pageNum = 1; pageNum <= 30; pageNum++) {
      let success = false;

      while (!success) {
        try {
          await scraperProcess(page, pageNum, domain);
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
}

async function scraperProcess(page, pageNum, domain) {
  // page = await browser.newPage();
  await page.waitForTimeout(3000);
  await page.goto(
    `https://sgbikemart.com.sg/listing/usedbikes/listing/?page=${pageNum}&sort_by=newest`,
    { timeout: 30000 }
  );

  // Set screen size

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
  var COEexpiryDate =
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

  var companyName =
    "#bike-contacts > div.card-body.p-0.pt-2 > table > tbody > tr:nth-child(1) > td:nth-child(2) > a.clear.text-start.company-name > strong";

  for (let index = 0; index < 20; index++) {
    console.log(`Page: ${pageNum} Item: ${index + 1}`);
    var gotoBikePageSuccess = false;

    while (!gotoBikePageSuccess) {
      // await page.close();
      // page = await browser.newPage();
      // await page.setViewport({ width: 1080, height: 1024 });
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
          timeout: 30000,
        });

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

        await page.waitForSelector(COEexpiryDate);
        var COEexpiryDateData = await page.$eval(
          COEexpiryDate,
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
        var companyNameData = "Not Available";
        try {
          await page.waitForSelector(companyName, { timeout: 5000 });
          companyNameData = await page.$eval(
            companyName,
            (element) => element.textContent
          );
        } catch (error) {
          console.log(error);
        }

        // FOR PHONE NUMBERS:

        var contacts = [];

        for (let i = 1; i <= 2; i++) {
          try {
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
          } catch (error) {
            console.log("Error on phone numbers: ", error);
          }
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
          COEexpiryDate: COEexpiryDateData.replace(/\n/g, ""),
          milleage: milleageData,
          noOfOwners: noOfOwnersData.replace(/\n/g, ""),
          typeOfVehicle: typeOfVehicleData.replace(/\n/g, ""),
          price: priceData.replace(/\n/g, ""),
          permalink: domain + usedBikesRefs[index].href,
          postedOn: usedBikesRefs[index].postedOn,
          address: addressData.replace(/\n/g, ""),
          companyName: companyNameData,
          contacts: contacts,
        };
        console.log(bike);

        if (!checkIfBikeExist(BIKES, bike)) {
          try {
            await addBikeToSheet([
              [
                bike.id,
                bike.bikeName,
                bike.listingType,
                bike.brand,
                bike.engineCapacity,
                bike.classification,
                bike.regDate,
                bike.COEexpiryDate.match(/\d{2}\/\d{2}\/\d{4}/)[0],
                bike.milleage,
                bike.noOfOwners,
                bike.typeOfVehicle,
                bike.price,
                bike.permalink,
                bike.postedOn,
                bike.address,
                bike.companyName,
                JSON.stringify(bike.contacts),
              ],
            ]);
            BIKES.push(bike);
          } catch (error) {
            console.log("Pushing to sheet went wrong: ", error);
          }

          // await page.screenshot({
          //   path: `./screenshots/screenshot-${pageNum}-${index + 1}.png`,
          // });
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

export default runScraperProcess;
