<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $statuses = implode(',', Task::statuses());

        return match ($this->method()) {
            'POST' => [
                'title' => ['required', 'string', 'max:255'],
                'status' => ['sometimes', 'string', 'in:'.$statuses],
                'position' => ['sometimes', 'integer', 'min:0'],
            ],
            'PUT', 'PATCH' => [
                'title' => ['sometimes', 'required', 'string', 'max:255'],
                'status' => ['sometimes', 'required', 'string', 'in:'.$statuses],
                'position' => ['sometimes', 'required', 'integer', 'min:0'],
            ],
            default => [],
        };
    }
}
