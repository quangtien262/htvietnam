<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class KnowledgeBaseCategory extends Model
{
    protected $table = 'whmcs_kb_categories';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'sort_order',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Get parent category
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseCategory::class, 'parent_id');
    }

    /**
     * Get child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(KnowledgeBaseCategory::class, 'parent_id')->orderBy('sort_order');
    }

    /**
     * Get articles in this category
     */
    public function articles(): HasMany
    {
        return $this->hasMany(KnowledgeBaseArticle::class, 'category_id');
    }

    /**
     * Get published articles in this category
     */
    public function publishedArticles(): HasMany
    {
        return $this->articles()->published();
    }

    /**
     * Get article count
     */
    public function getArticleCountAttribute(): int
    {
        return $this->articles()->count();
    }

    /**
     * Get published article count
     */
    public function getPublishedArticleCountAttribute(): int
    {
        return $this->publishedArticles()->count();
    }

    /**
     * Scope for public categories
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for root categories (no parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get category tree (recursive)
     */
    public static function getTree(): array
    {
        return self::root()
            ->with('children.articles')
            ->orderBy('sort_order')
            ->get()
            ->toArray();
    }
}
