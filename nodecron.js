import cron from "node-cron";
import axios from "axios";

cron.schedule("*/5 * * * *", () => {
  axios
    .get("https://scraper-sgbikemart.onrender.com/")
    .then((response) => {
      console.log(
        "Successfully pinged https://scraper-sgbikemart.onrender.com/"
      );
    })
    .catch((error) => {
      console.error("Error pinging example.com: ", error);
    });
});
