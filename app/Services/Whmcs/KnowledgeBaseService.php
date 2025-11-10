<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\KnowledgeBaseArticle;
use App\Models\Whmcs\KnowledgeBaseArticleAttachment;
use App\Models\Whmcs\KnowledgeBaseCategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class KnowledgeBaseService
{
    /**
     * Create category
     */
    public function createCategory(array $data): KnowledgeBaseCategory
    {
        return KnowledgeBaseCategory::create($data);
    }

    /**
     * Update category
     */
    public function updateCategory(int $id, array $data): ?KnowledgeBaseCategory
    {
        $category = KnowledgeBaseCategory::find($id);

        if (!$category) {
            return null;
        }

        $category->update($data);

        return $category->fresh();
    }

    /**
     * Delete category
     */
    public function deleteCategory(int $id): bool
    {
        $category = KnowledgeBaseCategory::find($id);

        if (!$category) {
            return false;
        }

        // Check if has articles
        if ($category->articles()->exists()) {
            throw new \Exception('Cannot delete category with articles');
        }

        // Move child categories to parent
        if ($category->children()->exists()) {
            $category->children()->update(['parent_id' => $category->parent_id]);
        }

        $category->delete();

        return true;
    }

    /**
     * Get category tree
     */
    public function getCategoryTree(): array
    {
        return KnowledgeBaseCategory::getTree();
    }

    /**
     * Create article
     */
    public function createArticle(array $data, int $authorId): KnowledgeBaseArticle
    {
        $data['author_id'] = $authorId;

        if (!isset($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        // Auto-generate excerpt if not provided
        if (!isset($data['excerpt']) && isset($data['content'])) {
            $data['excerpt'] = Str::limit(strip_tags($data['content']), 200);
        }

        $article = KnowledgeBaseArticle::create($data);

        // Auto-publish if requested
        if (isset($data['is_published']) && $data['is_published']) {
            $article->publish();
        }

        return $article;
    }

    /**
     * Update article
     */
    public function updateArticle(int $id, array $data): ?KnowledgeBaseArticle
    {
        $article = KnowledgeBaseArticle::find($id);

        if (!$article) {
            return null;
        }

        // Update excerpt if content changed but excerpt not provided
        if (isset($data['content']) && !isset($data['excerpt'])) {
            $data['excerpt'] = Str::limit(strip_tags($data['content']), 200);
        }

        $article->update($data);

        // Handle publish status change
        if (isset($data['is_published'])) {
            if ($data['is_published'] && !$article->is_published) {
                $article->publish();
            } elseif (!$data['is_published'] && $article->is_published) {
                $article->unpublish();
            }
        }

        return $article->fresh();
    }

    /**
     * Delete article
     */
    public function deleteArticle(int $id): bool
    {
        $article = KnowledgeBaseArticle::find($id);

        if (!$article) {
            return false;
        }

        // Delete attachments
        foreach ($article->attachments as $attachment) {
            $this->deleteAttachment($attachment->id);
        }

        $article->delete();

        return true;
    }

    /**
     * Search articles
     */
    public function searchArticles(string $query, bool $publishedOnly = true): array
    {
        $articles = KnowledgeBaseArticle::query()
            ->with(['category', 'author'])
            ->search($query);

        if ($publishedOnly) {
            $articles->published();
        }

        return $articles->get()->toArray();
    }

    /**
     * Get popular articles
     */
    public function getPopularArticles(int $limit = 10, bool $publishedOnly = true): array
    {
        $query = KnowledgeBaseArticle::with(['category', 'author'])->popular($limit);

        if ($publishedOnly) {
            $query->published();
        }

        return $query->get()->toArray();
    }

    /**
     * Get recent articles
     */
    public function getRecentArticles(int $days = 30, int $limit = 10, bool $publishedOnly = true): array
    {
        $query = KnowledgeBaseArticle::with(['category', 'author'])
            ->recent($days)
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($publishedOnly) {
            $query->published();
        }

        return $query->get()->toArray();
    }

    /**
     * Get most helpful articles
     */
    public function getMostHelpfulArticles(int $limit = 10, bool $publishedOnly = true): array
    {
        $query = KnowledgeBaseArticle::with(['category', 'author'])->mostHelpful($limit);

        if ($publishedOnly) {
            $query->published();
        }

        return $query->get()->toArray();
    }

    /**
     * Upload attachment
     */
    public function uploadAttachment(int $articleId, UploadedFile $file): KnowledgeBaseArticleAttachment
    {
        $article = KnowledgeBaseArticle::findOrFail($articleId);

        $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('kb_attachments', $filename, 'public');

        $attachment = KnowledgeBaseArticleAttachment::create([
            'article_id' => $articleId,
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return $attachment;
    }

    /**
     * Delete attachment
     */
    public function deleteAttachment(int $id): bool
    {
        $attachment = KnowledgeBaseArticleAttachment::find($id);

        if (!$attachment) {
            return false;
        }

        // Delete file from storage
        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $attachment->delete();

        return true;
    }

    /**
     * Get statistics
     */
    public function getStatistics(): array
    {
        $totalCategories = KnowledgeBaseCategory::count();
        $publicCategories = KnowledgeBaseCategory::public()->count();

        $totalArticles = KnowledgeBaseArticle::count();
        $publishedArticles = KnowledgeBaseArticle::published()->count();
        $draftArticles = $totalArticles - $publishedArticles;

        $totalViews = KnowledgeBaseArticle::sum('view_count');
        $totalVotes = KnowledgeBaseArticle::sum('helpful_count') + KnowledgeBaseArticle::sum('unhelpful_count');

        $recentArticles = KnowledgeBaseArticle::recent(30)->count();

        // Most viewed category
        $mostViewedCategory = KnowledgeBaseCategory::withCount('articles')
            ->with('articles')
            ->get()
            ->sortByDesc(function ($category) {
                return $category->articles->sum('view_count');
            })
            ->first();

        return [
            'total_categories' => $totalCategories,
            'public_categories' => $publicCategories,
            'total_articles' => $totalArticles,
            'published_articles' => $publishedArticles,
            'draft_articles' => $draftArticles,
            'total_views' => $totalViews,
            'total_votes' => $totalVotes,
            'recent_articles_30_days' => $recentArticles,
            'most_viewed_category' => $mostViewedCategory ? [
                'id' => $mostViewedCategory->id,
                'name' => $mostViewedCategory->name,
                'views' => $mostViewedCategory->articles->sum('view_count'),
            ] : null,
        ];
    }

    /**
     * Vote on article
     */
    public function voteArticle(int $articleId, bool $isHelpful, ?int $userId = null, ?string $ipAddress = null): void
    {
        $article = KnowledgeBaseArticle::findOrFail($articleId);

        if ($isHelpful) {
            $article->markAsHelpful($userId, $ipAddress);
        } else {
            $article->markAsUnhelpful($userId, $ipAddress);
        }
    }

    /**
     * Increment article views
     */
    public function incrementArticleViews(int $articleId): void
    {
        $article = KnowledgeBaseArticle::find($articleId);

        if ($article) {
            $article->incrementViews();
        }
    }
}
