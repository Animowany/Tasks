<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_task_with_default_status(): void
    {
        $response = $this->postJson('/api/tasks', [
            'title' => 'Zadanie testowe',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Zadanie testowe')
            ->assertJsonPath('data.status', Task::STATUS_TODO);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Zadanie testowe',
            'status' => Task::STATUS_TODO,
        ]);
    }

    public function test_can_list_tasks(): void
    {
        Task::factory()->count(2)->create();

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure(['data'])
            ->assertJsonCount(2, 'data');
    }

    public function test_can_update_task_status_with_valid_transition(): void
    {
        $task = Task::factory()->create(['status' => Task::STATUS_TODO]);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'status' => Task::STATUS_IN_PROGRESS,
            'position' => 0,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Task::STATUS_IN_PROGRESS);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => Task::STATUS_IN_PROGRESS,
        ]);
    }

    public function test_can_update_task_status_directly_to_done(): void
    {
        $task = Task::factory()->create(['status' => Task::STATUS_TODO]);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'status' => Task::STATUS_DONE,
            'position' => 0,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Task::STATUS_DONE);
    }

    public function test_can_update_task_position(): void
    {
        $task = Task::factory()->create([
            'status' => Task::STATUS_TODO,
            'position' => 0,
        ]);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'status' => Task::STATUS_TODO,
            'position' => 2,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.position', 2);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'position' => 2,
        ]);
    }

    public function test_can_delete_task(): void
    {
        $task = Task::factory()->create();

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
