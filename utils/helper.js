var axios = require("axios");
require('dotenv').config();
const API_KEY = process.env.DB_API_KEY;

class Helper {
  static async getMoviesData(page) {
    return new Promise((resolve, reject) => {
      var config = {
        method: "get",
          url : `https://api.themoviedb.org/3/trending/movie/week?language=en-US&page=${page}&api_key=${API_KEY}`,
        headers: {},
      };
      axios(config)
        .then(function (response) {
          resolve(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
    });
  }

 
}
module.exports = Helper;
