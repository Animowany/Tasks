<?php

namespace Tests\Unit;

use App\Models\Task;
use App\Repositories\TaskRepositoryInterface;
use App\Services\TaskService;
use PHPUnit\Framework\TestCase;

class TaskServiceTest extends TestCase
{
    public function test_valid_status_transition_is_allowed(): void
    {
        $task = new Task(['title' => 'Example', 'status' => Task::STATUS_TODO]);

        $repository = new class implements TaskRepositoryInterface {
            public function all(): iterable
            {
                return [];
            }

            public function find(int $id): ?Task
            {
                return null;
            }

            public function create(array $data): Task
            {
                return new Task($data);
            }

            public function update(Task $task, array $data): Task
            {
                $task->fill($data);

                return $task;
            }

            public function delete(Task $task): bool
            {
                return true;
            }
        };

        $service = new TaskService($repository);
        $updated = $service->updateTask($task, ['status' => Task::STATUS_IN_PROGRESS]);

        $this->assertSame(Task::STATUS_IN_PROGRESS, $updated->status);
    }

    public function test_direct_status_transition_to_done_is_allowed(): void
    {
        $task = new Task(['title' => 'Example', 'status' => Task::STATUS_TODO]);

        $repository = new class implements TaskRepositoryInterface {
            public function all(): iterable
            {
                return [];
            }

            public function find(int $id): ?Task
            {
                return null;
            }

            public function create(array $data): Task
            {
                return new Task($data);
            }

            public function update(Task $task, array $data): Task
            {
                $task->fill($data);

                return $task;
            }

            public function delete(Task $task): bool
            {
                return true;
            }
        };

        $service = new TaskService($repository);
        $updated = $service->updateTask($task, ['status' => Task::STATUS_DONE]);

        $this->assertSame(Task::STATUS_DONE, $updated->status);
    }
}
