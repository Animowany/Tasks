<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'status' => Task::STATUS_TODO,
        ];
    }

    public function inProgress(): static
    {
        return $this->state(fn () => ['status' => Task::STATUS_IN_PROGRESS]);
    }

    public function done(): static
    {
        return $this->state(fn () => ['status' => Task::STATUS_DONE]);
    }
}
