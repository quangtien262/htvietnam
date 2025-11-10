<?php

namespace App\Models\Whmcs;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class KnowledgeBaseArticle extends Model
{
    protected $table = 'whmcs_kb_articles';

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'author_id',
        'is_published',
        'published_at',
        'view_count',
        'helpful_count',
        'unhelpful_count',
        'tags',
        'related_articles',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'view_count' => 'integer',
        'helpful_count' => 'integer',
        'unhelpful_count' => 'integer',
        'tags' => 'array',
        'related_articles' => 'array',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->title);
            }
        });
    }

    /**
     * Get category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseCategory::class, 'category_id');
    }

    /**
     * Get author
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get votes
     */
    public function votes(): HasMany
    {
        return $this->hasMany(KnowledgeBaseArticleVote::class, 'article_id');
    }

    /**
     * Get attachments
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(KnowledgeBaseArticleAttachment::class, 'article_id');
    }

    /**
     * Increment view count
     */
    public function incrementViews(): void
    {
        $this->increment('view_count');
    }

    /**
     * Mark as helpful
     */
    public function markAsHelpful(?int $userId = null, ?string $ipAddress = null): void
    {
        KnowledgeBaseArticleVote::updateOrCreate(
            [
                'article_id' => $this->id,
                'user_id' => $userId,
            ],
            [
                'is_helpful' => true,
                'ip_address' => $ipAddress,
            ]
        );

        $this->recalculateVotes();
    }

    /**
     * Mark as unhelpful
     */
    public function markAsUnhelpful(?int $userId = null, ?string $ipAddress = null): void
    {
        KnowledgeBaseArticleVote::updateOrCreate(
            [
                'article_id' => $this->id,
                'user_id' => $userId,
            ],
            [
                'is_helpful' => false,
                'ip_address' => $ipAddress,
            ]
        );

        $this->recalculateVotes();
    }

    /**
     * Recalculate vote counts
     */
    protected function recalculateVotes(): void
    {
        $this->helpful_count = $this->votes()->where('is_helpful', true)->count();
        $this->unhelpful_count = $this->votes()->where('is_helpful', false)->count();
        $this->save();
    }

    /**
     * Get helpfulness percentage
     */
    public function getHelpfulnessPercentage(): float
    {
        $total = $this->helpful_count + $this->unhelpful_count;
        
        if ($total === 0) {
            return 0;
        }

        return ($this->helpful_count / $total) * 100;
    }

    /**
     * Publish article
     */
    public function publish(): void
    {
        $this->is_published = true;
        $this->published_at = now();
        $this->save();
    }

    /**
     * Unpublish article
     */
    public function unpublish(): void
    {
        $this->is_published = false;
        $this->save();
    }

    /**
     * Scope for published articles
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->whereNotNull('published_at');
    }

    /**
     * Scope for recent articles
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope for popular articles (by views)
     */
    public function scopePopular($query, int $limit = 10)
    {
        return $query->orderBy('view_count', 'desc')->limit($limit);
    }

    /**
     * Scope for most helpful articles
     */
    public function scopeMostHelpful($query, int $limit = 10)
    {
        return $query->orderBy('helpful_count', 'desc')->limit($limit);
    }

    /**
     * Search articles
     */
    public function scopeSearch($query, string $searchTerm)
    {
        return $query->whereFullText(['title', 'content', 'excerpt'], $searchTerm);
    }
}
