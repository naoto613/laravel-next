<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
      return [
          'content' => $this->faker->paragraph,
          'rating' => $this->faker->numberBetween(1, 5),
          'user_id' => User::factory(),
          'media_id' => $this->faker->randomNumber(),
          'media_type' => $this->faker->word,
      ];
    }
}
