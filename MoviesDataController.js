const Helper = require("./utils/helper");
const FileWorker = require("./workers/FileWorker");

class MoviesDataController {
    static async insertMovieData() {
        try {
            let results = [];
            let page = 1;
            const maxPages = 500;

            async function fetchAndInsertData() {
                if (page > maxPages) {
                    try {
                        await FileWorker.insertMovieBulk(results);
                        console.log("All Done");
                    } catch (error) {
                        console.error("Error inserting data:", error);
                    }
                    return;
                }

                try {
                    const data = await Helper.getMoviesData(page);
                    const totalPage = Math.min(JSON.parse(data).total_pages, maxPages);
                    const arrayOfResults = JSON.parse(data).results;

                    arrayOfResults.forEach((item) => {
                        const tempObj = {
                            adult: item.adult,
                            backdrop_path: item.backdrop_path,
                            movie_id: item.id,
                            title: item.title,
                            original_language: item.original_language,
                            original_title: item.original_title,
                            overview: JSON.stringify(item.overview),
                            poster_path: item.poster_path,
                            media_type: item.media_type,
                            genre_ids: JSON.stringify(item.genre_ids),
                            popularity: item.popularity,
                            release_date: item.release_date,
                            video: item.video,
                            vote_average: item.vote_average,
                            vote_count: item.vote_count,
                        };
                        results.push(tempObj);
                    });

                    page++;
                    console.log("Results length: " + results.length);

                    setTimeout(fetchAndInsertData, 200); // Wait for 200ms before the next iteration
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }

            fetchAndInsertData();
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    }
}

module.exports = MoviesDataController;
