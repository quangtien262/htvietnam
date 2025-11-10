<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class Client extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_clients';

    protected $fillable = [
        'user_id', 'company_name', 'email', 'phone', 'address',
        'city', 'state', 'country', 'zip', 'status', 
        'credit_balance', 'currency', 'tax_info'
    ];

    protected $casts = [
        'tax_info' => 'array',
        'credit_balance' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ClientSession::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ClientNote::class);
    }

    public function emailLogs(): HasMany
    {
        return $this->hasMany(EmailLog::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function addCredit(float $amount): void
    {
        $this->increment('credit_balance', $amount);
    }

    public function deductCredit(float $amount): void
    {
        $this->decrement('credit_balance', $amount);
    }
}
