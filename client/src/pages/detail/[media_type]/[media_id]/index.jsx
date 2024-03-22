import AppLayout from '@/components/Layouts/AppLayout'
import laravelAxios from '@/lib/laravelAxios'
import {
  Box,
  Card,
  CardContent,
  Container,
  Fab,
  Grid,
  Rating,
  IconButton,
  TextareaAutosize,
  Tooltip,
  Typography,
  Modal,
  Button,
  ButtonGroup,
} from '@mui/material'
import axios from 'axios'
import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import StarIcon from '@mui/icons-material/Star'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useAuth } from '@/hooks/auth'

const Detail = ({ detail, media_type, media_id }) => {
  const [open, setOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(0)
  const [averageRating, setAverageRating] = useState(null)
  const [editMode, setEditMode] = useState(null) // 編集中のレビューIDを保持します
  const [editedContent, setEditedContent] = useState('') // 編集中のレビュー内容
  const [editedRating, setEditedRating] = useState(0) // 編集中のレビューの星の数
  const [isFavorited, setIsFavorited] = useState(false)

  const { user } = useAuth({ middleware: 'auth' })

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  //初回マウント時にレビューとお気に入り登録ステータスを取得
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [reviewResponse, favoriteResponse] = await Promise.all([
          laravelAxios.get(`/api/reviews/${media_type}/${media_id}`),
          laravelAxios.get(`/api/favorites/status`, {
            params: {
              media_type: media_type,
              media_id: media_id,
            },
          }),
        ])

        //一度fetchedReviewsに格納しているのは確実に値を代入するため
        const fetchedReviews = reviewResponse.data
        setReviews(fetchedReviews)

        // 星の数を計算する関数
        updateAverageRating(fetchedReviews)

        setIsFavorited(favoriteResponse.data)
      } catch (err) {
        console.error(err.fetchedReviews)
      }
    }

    fetchReviews()
  }, [media_type, media_id])

  //モーダルウィンドウのレビューを入力したときの処理
  const handleReviewChange = e => {
    setReview(e.target.value)
  }

  // 引数を二つ取っているのはMUIのRaitingコンポーネントのonChangeイベントは2つの引数を渡す仕様になっているためです
  const handleRatingChange = (_, newValue) => {
    setRating(newValue)
  }

  // ボタンの有効/無効の状態を判定する関数
  const isButtonDisabled = (rating, content) => {
    return !rating || !content.trim()
  }

  const isReviewButtonDisabled = isButtonDisabled(rating, review)
  const isEditButtonDisabled = isButtonDisabled(editedRating, editedContent)

  //レビュー送信ボタンを押したときの処理
  const handleSubmit = async () => {
    //バックエンドのTrimStrings（Kernel.php記載）のおかげでトリムの処理はされるが念のためフロントでもトリムしています
    const trimmedReview = review.trim()
    handleClose()

    try {
      const response = await laravelAxios.post(`/api/reviews`, {
        content: trimmedReview,
        rating: rating,
        media_type: media_type,
        media_id: media_id,
      })
      setRating(0)
      setReview('')

      const newReview = response.data

      setReviews([...reviews, newReview])

      //updateAverageRatingの引数に代入用の定数を定義
      const updatedReviews = [...reviews, newReview]
      updateAverageRating(updatedReviews)
    } catch (error) {
      console.log(error.response)
    }
  }

  //星の数を計算する関数
  const updateAverageRating = updateReviews => {
    if (updateReviews.length > 0) {
      //レビューの星の数の合計値を計算
      const totalRating = updateReviews.reduce(
        (acc, review) => acc + review.rating,
        0,
      )
      const average = (totalRating / updateReviews.length).toFixed(1)
      setAverageRating(average)
    } else {
      setAverageRating(null)
    }
  }

  //レビュー削除ボタンを押したときの処理
  const handleDelete = async id => {
    if (window.confirm('レビューを削除してもよろしいですか？')) {
      try {
        const response = await laravelAxios.delete(`api/review/${id}`)
        console.log('ステータスコード:', response.status) // 正常なレスポンスのステータスコードを表示

        //フロントエンドの状態も更新します
        const filteredReview = reviews.filter(review => review.id !== id)
        setReviews(filteredReview)

        //星の数を計算する関数
        updateAverageRating(filteredReview)
      } catch (err) {
        console.error(err.response)
      }
    }
  }

  //レビュー編集ボタンを押したときの処理
  const handleEdit = review => {
    setEditMode(review.id)
    setEditedContent(review.content)
    setEditedRating(review.rating)
  }

  //レビュー編集確定ボタンを押したときの処理
  const handleConfirmEdit = async reviewId => {
    try {
      const response = await laravelAxios.put(`api/review/${reviewId}`, {
        content: editedContent,
        rating: editedRating,
      })

      const updatedReview = response.data

      // 更新が成功したら、フロントエンドの状態も更新します
      const updatedReviews = reviews.map(review => {
        if (review.id == reviewId) {
          return {
            ...review,
            content: updatedReview.content,
            rating: updatedReview.rating,
          }
        }
        return review
      })

      setReviews(updatedReviews)

      // 編集モードを終了します
      setEditMode(null)
    } catch (err) {
      console.error(err.response)
    }
  }

  //お気に入りボタンを押したときの処理
  const handleToggleFavorite = async () => {
    try {
      const response = await laravelAxios.post(`api/favorites/`, {
        media_type: media_type,
        media_id: media_id,
      })

      //フロント更新
      setIsFavorited(response.data.status === 'added')
    } catch (err) {
      console.error(err.response)
    }
  }

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

              <Box
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
              </Box>

              <IconButton
                onClick={handleToggleFavorite}
                style={{
                  color: isFavorited ? '#F067A6' : 'white',
                  backgroundColor: '#0d253f',
                }}>
                <FavoriteIcon />
              </IconButton>

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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          レビュー一覧
        </Typography>

        {/* reviewsが存在している場合にのみレビュー一覧を表示 */}
        {reviews.length > 0 && (
          <Grid container spacing={3}>
            {reviews.map(review => (
              <Grid item xs={12} key={review.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {review.user.name}
                    </Typography>
                    {editMode == review.id ? (
                      <>
                        <Rating
                          name={`rating-${review.id}`}
                          value={editedRating}
                          onChange={(event, newValue) =>
                            setEditedRating(newValue)
                          }
                        />
                        <Box mb={1}>
                          <TextareaAutosize
                            value={editedContent}
                            style={{
                              width: '100%',
                            }}
                            onChange={e => setEditedContent(e.target.value)}
                          />
                        </Box>
                      </>
                    ) : (
                      <>
                        <Rating
                          name="read-only"
                          value={review.rating}
                          readOnly
                        />
                        <Link
                          href={`/detail/${media_type}/${media_id}/review/${review.id}`}>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                            gutterBottom
                            paragraph>
                            {review.content}
                          </Typography>
                        </Link>
                      </>
                    )}
                    {/* オプショナルチェイニング(?マーク)を使うことでloginUserが初期値のnullまたはundifindでもエラーが発生しない */}
                    {user?.id === review.user.id && (
                      //ボタンエリア
                      <Grid container justifyContent="flex-end">
                        <ButtonGroup>
                          {editMode === review.id ? (
                            <Button
                              onClick={() => handleConfirmEdit(review.id)}
                              disabled={isEditButtonDisabled}>
                              編集確定
                            </Button>
                          ) : (
                            <>
                              <Button onClick={() => handleEdit(review)}>
                                編集
                              </Button>

                              <Button
                                color="error"
                                onClick={() => handleDelete(review.id)}>
                                削除
                              </Button>
                            </>
                          )}
                        </ButtonGroup>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* レビュー追加ボタン */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 5,
        }}>
        {/* aria-labelは機能の意味を伝えるためにある。機能としては意味はない */}
        <Tooltip title="レビューを追加" aria-label="レビューを投稿する">
          <Fab
            style={{
              background: '#1976d2',
              color: 'white',
            }}
            onClick={handleOpen}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* モーダルウィンドウ */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}>
          <Typography variant="h6" component="h2">
            レビューを書く
          </Typography>
          <Rating
            required
            name="simple-controlled"
            value={rating}
            onChange={handleRatingChange}
          />
          <TextareaAutosize
            required
            minRows={5}
            placeholder="レビュー内容"
            style={{ width: '100%', marginTop: '10px' }}
            value={review}
            onChange={handleReviewChange}
          />
          <Button
            variant="outlined"
            color="primary"
            style={{
              marginTop: '10px',
            }}
            onClick={handleSubmit}
            disabled={isReviewButtonDisabled}>
            レビュー投稿
          </Button>
        </Box>
      </Modal>
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
