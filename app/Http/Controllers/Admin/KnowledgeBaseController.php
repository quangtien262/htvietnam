<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\KnowledgeBaseArticle;
use App\Models\Whmcs\KnowledgeBaseCategory;
use App\Services\Whmcs\KnowledgeBaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KnowledgeBaseController extends Controller
{
    protected KnowledgeBaseService $kbService;

    public function __construct(KnowledgeBaseService $kbService)
    {
        $this->kbService = $kbService;
    }

    /**
     * Get all categories
     */
    public function categories(): JsonResponse
    {
        $categories = KnowledgeBaseCategory::with('children')->root()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Create category
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:whmcs_kb_categories,slug',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:whmcs_kb_categories,id',
            'sort_order' => 'integer',
            'is_public' => 'boolean',
        ]);

        try {
            $category = $this->kbService->createCategory($validated);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update category
     */
    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'slug' => 'string|max:255|unique:whmcs_kb_categories,slug,' . $id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:whmcs_kb_categories,id',
            'sort_order' => 'integer',
            'is_public' => 'boolean',
        ]);

        try {
            $category = $this->kbService->updateCategory($id, $validated);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Delete category
     */
    public function deleteCategory(int $id): JsonResponse
    {
        try {
            $result = $this->kbService->deleteCategory($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get all articles
     */
    public function articles(Request $request): JsonResponse
    {
        $query = KnowledgeBaseArticle::with(['category', 'author'])->orderBy('created_at', 'desc');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->has('published_only')) {
            $query->published();
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $articles = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $articles,
        ]);
    }

    /**
     * Get article details
     */
    public function showArticle(int $id): JsonResponse
    {
        $article = KnowledgeBaseArticle::with(['category', 'author', 'attachments'])->find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $article,
        ]);
    }

    /**
     * Create article
     */
    public function storeArticle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:whmcs_kb_categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:whmcs_kb_articles,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'is_published' => 'boolean',
            'tags' => 'nullable|array',
            'related_articles' => 'nullable|array',
        ]);

        try {
            $article = $this->kbService->createArticle($validated, $request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $article->load(['category', 'author']),
                'message' => 'Article created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update article
     */
    public function updateArticle(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'exists:whmcs_kb_categories,id',
            'title' => 'string|max:255',
            'slug' => 'string|max:255|unique:whmcs_kb_articles,slug,' . $id,
            'content' => 'string',
            'excerpt' => 'nullable|string',
            'is_published' => 'boolean',
            'tags' => 'nullable|array',
            'related_articles' => 'nullable|array',
        ]);

        try {
            $article = $this->kbService->updateArticle($id, $validated);

            if (!$article) {
                return response()->json([
                    'success' => false,
                    'message' => 'Article not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $article->load(['category', 'author']),
                'message' => 'Article updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Delete article
     */
    public function deleteArticle(int $id): JsonResponse
    {
        try {
            $result = $this->kbService->deleteArticle($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Article not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Article deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Search articles
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:3',
            'published_only' => 'boolean',
        ]);

        $results = $this->kbService->searchArticles(
            $validated['query'],
            $validated['published_only'] ?? true
        );

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->kbService->getStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get popular articles
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $publishedOnly = $request->input('published_only', true);

        $articles = $this->kbService->getPopularArticles($limit, $publishedOnly);

        return response()->json([
            'success' => true,
            'data' => $articles,
        ]);
    }

    /**
     * Get recent articles
     */
    public function recent(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $limit = $request->input('limit', 10);
        $publishedOnly = $request->input('published_only', true);

        $articles = $this->kbService->getRecentArticles($days, $limit, $publishedOnly);

        return response()->json([
            'success' => true,
            'data' => $articles,
        ]);
    }

    /**
     * Upload attachment
     */
    public function uploadAttachment(Request $request, int $articleId): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        try {
            $attachment = $this->kbService->uploadAttachment($articleId, $validated['file']);

            return response()->json([
                'success' => true,
                'data' => $attachment,
                'message' => 'Attachment uploaded successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Delete attachment
     */
    public function deleteAttachment(int $id): JsonResponse
    {
        try {
            $result = $this->kbService->deleteAttachment($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attachment not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Attachment deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Vote on article
     */
    public function vote(Request $request, int $articleId): JsonResponse
    {
        $validated = $request->validate([
            'is_helpful' => 'required|boolean',
        ]);

        try {
            $this->kbService->voteArticle(
                $articleId,
                $validated['is_helpful'],
                $request->user()?->id,
                $request->ip()
            );

            return response()->json([
                'success' => true,
                'message' => 'Vote recorded successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Increment article views
     */
    public function incrementViews(int $articleId): JsonResponse
    {
        try {
            $this->kbService->incrementArticleViews($articleId);

            return response()->json([
                'success' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
