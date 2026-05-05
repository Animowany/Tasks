<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaskRequest;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function __construct(private TaskService $service)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->service->listTasks()], 200);
    }

    public function store(TaskRequest $request): JsonResponse
    {
        $task = $this->service->createTask($request->validated());

        return response()->json(['data' => $task], 201);
    }

    public function show(int $id): JsonResponse
    {
        $task = $this->service->getTask($id);

        if (! $task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        return response()->json(['data' => $task], 200);
    }

    public function update(TaskRequest $request, int $id): JsonResponse
    {
        $task = $this->service->getTask($id);

        if (! $task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        try {
            $task = $this->service->updateTask($task, $request->validated());
        } catch (\InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['data' => $task], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $task = $this->service->getTask($id);

        if (! $task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        $this->service->deleteTask($task);

        return response()->json(null, 204);
    }
}
