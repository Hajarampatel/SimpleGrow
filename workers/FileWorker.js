const pool = require("./database");

const TABLE = "movies";
const TABLE2 = "user_data";
class FileWorker {
    static async insertMovieBulk(data) {
        let status = true;
        try {
            let size = data.length;
            let count = 1;
            let mainArr = [];
            for (let i = 0; i < size; i++) {
                mainArr.push(Object.values(data[i]));
                if (count % 2000 == 0) {
                    // console.log("mainArr" + mainArr);
                    const query = `INSERT IGNORE INTO ${TABLE} ( adult, backdrop_path,movie_id, title, original_language, original_title, overview, poster_path, media_type, genre_ids, popularity, release_date, video, vote_average, vote_count) VALUES ?;`;
                    const result = await pool.query(query, [mainArr]);
                    //console.log(mainArr)
                    mainArr = [];
                }
                count++;
            }
            if (mainArr.length > 0) {
                // console.log("mainArr" + mainArr);
                const query = `INSERT IGNORE INTO ${TABLE} ( adult, backdrop_path,movie_id, title, original_language, original_title, overview, poster_path, media_type, genre_ids, popularity, release_date, video, vote_average, vote_count) VALUES ?;`;
                const result = await pool.query(query, [mainArr]);
            }
            console.log("Movies Data indserted in database");
        } catch (error) {
            console.log(error.stack);
            status = false;
        }
    }

    static async userLogin(username) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM ${TABLE2} WHERE username = ?`;
            pool.query(query, [username], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    static async userRegister(username, password) {
        return new Promise((resolve, reject) => {
            const insertQuery =
                "INSERT INTO user_data (username, password) VALUES (?, ?)";
            pool.query(insertQuery, [username, password], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    static async getMovieRating(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT vote_average, vote_count FROM ${TABLE} WHERE movie_id = ?`;
            pool.query(query, [id], (error, results) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log(results);
                    resolve(results);
                }
            });
        });
    }
    static async updateMovieRating(id, vote_average, vote_count) {
        return new Promise((resolve, reject) => {
            const query = `UPDATE ${TABLE} SET vote_average = ${vote_average} , vote_count = ${vote_count}  WHERE movie_id = ?`;
            pool.query(query, [id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    static async getMovieList(pageNumber) {
        const pageSize = 20;
        return new Promise(async (resolve, reject) => {
            const query = `SELECT COUNT(*) as total FROM ${TABLE}`;
            const countResult = await  pool.query(query);
            // console.log( "countResult"+countResult)
            const totalMovies = countResult[0].total;

            // Calculate the total number of pages
            const totalPages = Math.ceil(totalMovies / pageSize);

            // Ensure the page number is within bounds
            if (pageNumber < 1) {
                pageNumber = 1;
            } else if (pageNumber > totalPages) {
                pageNumber = totalPages;
            }

            // Calculate the offset based on the page number and page size
            const offset = (pageNumber - 1) * pageSize;
            const query2 = "SELECT * FROM movies LIMIT ?, ?";
            pool.query(query2, [offset, pageSize], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ pageNumber : pageNumber, results: results});
                }
            });
        });
    }


    
    static async getMovieRatings(pageNumber) {
        const pageSize = 20;
        return new Promise(async (resolve, reject) => {
            const query = `SELECT COUNT(*) as total FROM ${TABLE}`;
            const countResult = await  pool.query(query);
            // console.log( "countResult"+countResult)
            const totalMovies = countResult[0].total;

            // Calculate the total number of pages
            const totalPages = Math.ceil(totalMovies / pageSize);

            // Ensure the page number is within bounds
            if (pageNumber < 1) {
                pageNumber = 1;
            } else if (pageNumber > totalPages) {
                pageNumber = totalPages;
            }

            // Calculate the offset based on the page number and page size
            const offset = (pageNumber - 1) * pageSize;
            const query2 = "SELECT movie_id, original_title, vote_average FROM movies ORDER BY vote_average LIMIT ?, ?";
            pool.query(query2, [offset, pageSize], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    let data = results;
                    for(let a=0; a<data.length; a++){
                        if(data[a].vote_average === 0 || data[a].vote_average === null) data[a].vote_average = 'NA';
                    }

                    resolve({ pageNumber : pageNumber, results: data});
                }
            });
        });
    }
}

module.exports = FileWorker;
