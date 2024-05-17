import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import GoogleSheetsAPI from "./GoogleSheetsAPI.js";
const googleSheets = new GoogleSheetsAPI();
var BIKES = [];

async function runScraperProcess() {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-extensions",
    ],
    headless: "new",
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  // const browser = await puppeteer.launch();
  // var page = await browser.newPage();
  // await page.setViewport({ width: 1080, height: 1024 });
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
    for (let pageNum = 1; pageNum <= 10; pageNum++) {
      let success = false;

      while (!success) {
        try {
          await new Promise((r) => setTimeout(r, 10000));
          var page = await browser.newPage();
          await page.setViewport({ width: 1080, height: 1024 });
          await scraperProcess(page, pageNum, domain, browser);

          success = true;
          await page.close();
        } catch (error) {
          console.log("Error in page number: ", pageNum, error);
          await page.close();
          success = false;
        }
      }
    }
    await browser.close();
  } catch (error) {
    console.log("Error on main loop:  ", error);
  }
}

async function scraperProcess(page, pageNum, domain, browser) {
  // page = await browser.newPage();
  await new Promise((r) => setTimeout(r, 3000));
  await page.goto(
    `https://sgbikemart.com.sg/listing/usedbikes/listing/?page=${pageNum}&sort_by=newest`,
    { waitUntil: "networkidle2", timeout: 60000 }
  );

  // Set screen size

  // GETTING ALL THE BIKES HREF
  var usedBikesRefs = [];
  for (let index = 0; index < 20; index++) {
    var selector1 = `body > section.main-content > div > div > div.col-lg-9 > div:nth-child(${
      3 + index
    }) > div > div.col-md-9.d-flex.flex-column.align-content-end > div.card-body.pb-2.pe-2.d-flex > div > div.col-3.text-end.d-flex.flex-column > div.d-block.w-100 > a`;

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

  await page.close();

  console.log(usedBikesRefs);
  await new Promise((r) => setTimeout(r, 3000));

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
        await new Promise((r) => setTimeout(r, 3000));
        try {
          var page = await browser.newPage();
          await page.goto(domain + usedBikesRefs[index].href, {
            waitUntil: "networkidle2",
            timeout: 60000,
          });
        } catch (error) {
          console.log("Error navigating on a page: ", error);
          gotoBikePageSuccess = false;
          await page.close();
          continue;
        }

        var bikeNameData = await getTextContent(page, bikeName);
        var listingTypeData = await getTextContent(page, listingType);
        var brandData = await getTextContent(page, brand);
        var engineCapacityData = await getTextContent(page, engineCapacity);
        var classificationData = await getTextContent(page, classification);
        var regDateData = await getTextContent(page, regDate);
        var COEexpiryDateData = await getTextContent(page, COEexpiryDate);
        var milleageData = await getTextContent(page, milleage);
        var noOfOwnersData = await getTextContent(page, noOfOwners);
        var typeOfVehicleData = await getTextContent(page, typeOfVehicle);
        var priceData = await getTextContent(page, price);
        var addressData = await getTextContent(page, address);
        var companyNameData = await getTextContent(page, companyName);

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
            await new Promise((r) => setTimeout(r, 3000));

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
        await page.close();
      } catch (error) {
        console.log("Error on element data fetch: ", error);
        gotoBikePageSuccess = false;
      }
    }
  }
}

async function addBikeToSheet(values) {
  // Define the range and values you want to append
  const range = "data";
  // Append the data to the sheet
  await googleSheets.addData(range, values);
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

async function getTextContent(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    return await page.$eval(selector, (element) => element.textContent.trim());
  } catch (error) {
    console.error(
      `Error fetching text content for selector: ${selector}`,
      error
    );
    return "Not Available";
  }
}

export default runScraperProcess;
