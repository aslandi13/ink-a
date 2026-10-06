<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectDetailResource;
use App\Http\Resources\ProjectListResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::query()
            ->where('is_published', true)
            ->when(
                $request->string('category')->isNotEmpty(),
                fn ($query) => $query->where('category', $request->string('category'))
            )
            ->orderBy('sort_order')
            ->paginate($request->integer('per_page', 9));

        return response()->json([
            'data' => ProjectListResource::collection($projects->items()),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    public function showInCategory(string $locale, string $category, string $slug): JsonResponse
    {
        $project = Project::query()
            ->where('category', $category)
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'data' => new ProjectDetailResource($project),
        ]);
    }

    public function show(string $locale, string $slug): JsonResponse
    {
        $project = Project::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->firstOrFail();

        return response()->json([
            'data' => new ProjectDetailResource($project),
        ]);
    }
}
