import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  var domain = "https://sgbikemart.com.sg";
  await page.goto(
    "https://sgbikemart.com.sg/listing/usedbikes/listing/?page=1&"
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
    // console.log(href);
    usedBikesRefs.push(href);
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
  var bikes = [];
  for (let index = 0; index < 20; index++) {
    await page.goto(domain + usedBikesRefs[index]);
    await page.waitForTimeout(3000);

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
    var brandData = await page.$eval(brand, (element) => element.textContent);

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
    var priceData = await page.$eval(price, (element) => element.textContent);

    var bike = {
      bikeName: bikeNameData,
      listingType: listingTypeData,
      brand: brandData,
      engineCapacity: engineCapacityData,
      classification: classificationData,
      regDate: regDateData,
      CEOexpiryDate: CEOexpiryDateData,
      milleage: milleageData,
      noOfOwners: noOfOwnersData,
      typeOfVehicle: typeOfVehicleData,
      price: priceData,
      permalink: domain + usedBikesRefs[index],
    };
    console.log(bike);
    bikes.push(bike);
    await page.screenshot({ path: `./screenshots/screenshot${index}.png` });
  }

  await browser.close();
})();
