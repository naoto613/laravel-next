import axios from 'axios'

export default async function handler(req, res) {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=ja-JP`)
    res.status(200).json(response.data)
  } catch (e) {
    console.error(e)
  }
}