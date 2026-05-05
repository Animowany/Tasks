<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\TaskRepositoryInterface;

class TaskService
{
    private TaskRepositoryInterface $repository;

    public function __construct(TaskRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function listTasks(): iterable
    {
        return $this->repository->all();
    }

    public function getTask(int $id): ?Task
    {
        return $this->repository->find($id);
    }

    public function createTask(array $data): Task
    {
        $data['status'] = $data['status'] ?? Task::STATUS_TODO;
        $data['position'] = $data['position'] ?? $this->nextPositionForStatus($data['status']);

        return $this->repository->create($data);
    }

    public function updateTask(Task $task, array $data): Task
    {
        if (isset($data['status']) && !$this->canTransition($data['status'])) {
            throw new \InvalidArgumentException(
                sprintf('Invalid status transition from "%s" to "%s".', $task->status, $data['status'])
            );
        }

        if (isset($data['status']) && $data['status'] !== $task->status && !isset($data['position'])) {
            $data['position'] = $this->nextPositionForStatus($data['status']);
        }

        return $this->repository->update($task, $data);
    }

    public function deleteTask(Task $task): bool
    {
        return $this->repository->delete($task);
    }

    private function canTransition(string $nextStatus): bool
    {
        $validStatuses = [Task::STATUS_TODO, Task::STATUS_IN_PROGRESS, Task::STATUS_DONE];
        return in_array($nextStatus, $validStatuses, true);
    }

    private function nextPositionForStatus(string $status): int
    {
        if (Task::getConnectionResolver() === null) {
            return 0;
        }

        return ((int) Task::where('status', $status)->max('position')) + 1;
    }
}
