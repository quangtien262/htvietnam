<?php

namespace App\Models\Whmcs;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeBaseArticleVote extends Model
{
    protected $table = 'whmcs_kb_article_votes';

    protected $fillable = [
        'article_id',
        'user_id',
        'ip_address',
        'is_helpful',
    ];

    protected $casts = [
        'is_helpful' => 'boolean',
    ];

    /**
     * Get article
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseArticle::class, 'article_id');
    }

    /**
     * Get user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
