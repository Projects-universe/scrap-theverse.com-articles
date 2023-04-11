require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const puppeteer = require("puppeteer");
const fs = require("fs");
const schedule = require("node-schedule")

const Model = require('./dataModel')
// import { Parser } from "@json2csv/plainjs";
// const { Parser } = require('@json2csv/plainjs')
const app = express()

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("database connected")
})

const saveToDatabase = async (jsonArray) => {
    jsonArray.forEach(async obj => {
        const data = await Model.create({
            ...obj
        })
    })
}

const scrap = async () => {
    try {
      const url = "https://www.theverge.com/reviews";
      // const url = "https://www.theverge.com";
  
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(60000);
      await page.goto(url);
  
      const data = await page.evaluate((url) => {
        /*
         Data for different pages
         */
          const placables = JSON.parse(
            document.querySelector("#__NEXT_DATA__").innerHTML
          ).props.pageProps.entityProps.hydration.responses[0].data.entryGroup
            .hubPage.placements;
            let dataObjs = placables.map(item => {
  
                return item.placeable.__typename === 'Entry' ? {
                    type: item.placeable.type,
                    title: item.placeable.title,
                    url: item.placeable.url,
                    authorName: item.placeable.author.fullName,
                    // contributors: item.placeable.contributors,
                    publishDate: item.placeable.publishDate,
                    originalPublishDate: item.placeable.originalPublishDate
                } : null
            })
          console.log(dataObjs);
          return dataObjs;
  
  
        // code to get categories
  
  
        // const nav_items = JSON.parse(
        //   document.querySelector("#__NEXT_DATA__").innerHTML
        // ).props.pageProps.hydration.responses[0].data.cellData.prestoComponentData.nav_items;
  
        // const dataObjs = nav_items.map((nav_item) => {
        //   return {
        //     title: nav_item.title,
        //     url: nav_item.url,
        //     subItems: [
        //       ...nav_item.sub_items.map((item) => ({
        //         title: item.title,
        //         url: url + item.url,
        //       })),
        //     ],
        //   };
        // });
        // return dataObjs;
  
  
      }, url);
      // sending the data to database
      saveToDatabase(data)
  
      console.log(data.length);
  
      // saves locally
      fs.writeFile("reviews.json", JSON.stringify(data), (err) => {
        if (err) {
          throw err;
          console.log(err);
        }
      });
  
      await browser.close();
    } catch (err) {
      console.log(err);
    }
  };
//   scrap();

  const job = schedule.scheduleJob('0 23 * * *', function () {
    scrap()
  })
//   job()
  


app.listen(process.env.PORT, () => {
    console.log("server is running")
})


