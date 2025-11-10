<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeBaseArticleAttachment extends Model
{
    protected $table = 'whmcs_kb_article_attachments';

    protected $fillable = [
        'article_id',
        'filename',
        'original_filename',
        'file_path',
        'mime_type',
        'file_size',
        'download_count',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'download_count' => 'integer',
    ];

    /**
     * Get article
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseArticle::class, 'article_id');
    }

    /**
     * Increment download count
     */
    public function incrementDownloads(): void
    {
        $this->increment('download_count');
    }

    /**
     * Get file size in human readable format
     */
    public function getFormattedFileSize(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
