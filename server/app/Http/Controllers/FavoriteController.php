<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class FavoriteController extends Controller
{
    public function index()
    {
        $api_key = config('services.tmdb.api_key');
        $user = Auth::user();
        $favorites = $user->favorites;
        $details = [];

        foreach ($favorites as $favorite) {
            $apiUrl = 'https://api.themoviedb.org/3/' . $favorite->media_type . '/' . $favorite->media_id . '?api_key=' . $api_key;

            // このオブジェクト(response)は、APIのレスポンスだけでなく、他のHTTP情報ステータスコード、ヘッダー、クッキーなども持っている
            $response = Http::get($apiUrl);
            if ($response->successful()) {
                $details[] = array_merge($response->json(), ['media_type' => $favorite->media_type]);
            }
        }

        return response()->json($details);
    }

    public function toggleFavorite(Request $request)
    {
        $validatedData = $request->validate([
            'media_type' => 'required|string',
            'media_id' => 'required|integer',
        ]);

        $existingFavorite = Favorite::where('user_id', Auth::id())
            ->where('media_type', $validatedData['media_type'])
            ->where('media_id', $validatedData['media_id'])
            ->first();

        // お気に入りが存在した場合はデータを削除してreturn
        if ($existingFavorite) {
            $existingFavorite->delete();

            return response()->json([
                'status' => 'removed',
            ]);
        }

        Favorite::create([
            'user_id' => Auth::id(),
            'media_type' => $validatedData['media_type'],
            'media_id' => $validatedData['media_id'],
        ]);

        return response()->json([
            'status' => 'added',
        ]);
    }

    public function checkFavoriteStatus(Request $request)
    {
        $validatedData = $request->validate([
            'media_type' => 'required|string',
            'media_id' => 'required|integer',
        ]);

        $isFavorite = Favorite::where('user_id', Auth::id())
            ->where('media_type', $validatedData['media_type'])
            ->where('media_id', $validatedData['media_id'])
            ->exists();

        return response()->json($isFavorite);
    }
}
