<?php

namespace Tests\Unit;

use App\Models\Review;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_review_belongs_to_a_user()
    {
        $user = User::factory()->create();
        $review = Review::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $review->user);
    }

    // public function test_a_review_has_many_comments()
    // {
    //     $review = Review::factory()->create();
    //     $comment1 = Comment::factory()->create(['review_id' => $review->id]);
    //     $comment2 = Comment::factory()->create(['review_id' => $review->id]);

    //     $this->assertCount(2, $review->comments);
    // }
}