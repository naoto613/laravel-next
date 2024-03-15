import AppLayout from '@/components/Layouts/AppLayout'
import {
  Box,
  Container,
  Grid,
  IconButton,
  Rating,
  Typography,
} from '@mui/material'
import axios from 'axios'
import Head from 'next/head'
import React from 'react'

const Detail = ({ detail, media_type, media_id }) => {
  return (
    <AppLayout
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Detail
        </h2>
      }>
      <Head>
        <title>Laravel - Detail</title>
      </Head>
      <Box
        sx={{
          height: { xs: 'auto', md: '70vh' }, // 高さを調整
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden', // コンテンツのはみ出しを防ぐ
        }}>
        <Box
          component="div"
          sx={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${detail.backdrop_path})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(25px)',
            },
          }}
        />

        <Container sx={{ zIndex: 1 }}>
          <Grid
            container
            spacing={3}
            alignItems="center"
            justifyContent="center">
            {/* 画像 */}
            <Grid
              item
              md={5}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}>
              <img
                src={`https://image.tmdb.org/t/p/original/${detail.poster_path}`}
                alt={detail.title || detail.name}
                style={{
                  width: '70%',
                  // filter: 'blur(25px)',
                }}
              />
            </Grid>
            {/* 情報 */}
            <Grid item md={7} sx={{ color: 'white' }}>
              <Typography variant="h4" gutterBottom>
                {detail.title || detail.name}
              </Typography>

              {/* <Box
            gap={2}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1,
            }}>
            <Rating
              //nameは無くてもよい
              name="average-rating"
              //parseFloatは数値としてパースしたものを設定します。
              value={parseFloat(averageRating)}
              precision={0.5}
              readOnly
              emptyIcon={<StarIcon style={{ color: 'white' }} />}
            />
            <Typography
              sx={{
                ml: 1,
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}>
              {averageRating}
            </Typography>
          </Box> */}

              {/* <IconButton
            onClick={handleToggleFavorite}
            style={{
              color: isFavorited ? '#F067A6' : 'white',
              backgroundColor: '#0d253f',
            }}>
            <FavoriteIcon />
          </IconButton> */}

              <Typography paragraph>
                {detail.overview.length > 100
                  ? `${detail.overview.substring(0, 100)}...`
                  : detail.overview}
              </Typography>

              <Typography variant="h6">
                {media_type == 'movie'
                  ? `公開日: ${detail.release_date}`
                  : `初回放送日: ${detail.first_air_date}`}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </AppLayout>
  )
}

export async function getServerSideProps(context) {
  const { media_type, media_id } = context.params

  try {
    // 日本語のデータを取得
    const jpResponse = await axios.get(
      `https://api.themoviedb.org/3/${media_type}/${media_id}?api_key=${process.env.TMDB_API_KEY}&language=ja-JP`,
    )

    let combinedData = { ...jpResponse.data }

    // overviewが空である場合は英語のデータを取得
    if (!jpResponse.data.overview) {
      const enResponse = await axios.get(
        `https://api.themoviedb.org/3/${media_type}/${media_id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`,
      )

      combinedData.overview = enResponse.data.overview // 英語のoverviewをセット
    }
    return {
      props: { detail: combinedData, media_type, media_id },
    }
  } catch (error) {
    return { notFound: true } // エラーが発生した場合は404ページを表示
  }
}
export default Detail
