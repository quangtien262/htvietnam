<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubcriber extends Model
{
    protected $table = 'newsletter_subcribers';

    protected $fillable = [
        'email',
        'status',
    ];
}
