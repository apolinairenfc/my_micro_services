<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class User extends Model
{
    protected $table = 'users';

    protected $fillable = [
        'username',
        'email',
        'password_hash',
    ];

    protected $hidden = [
        'password_hash',
    ];

    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'createdAt' => $this->created_at ? $this->created_at->format('c') : null,
            'updatedAt' => $this->updated_at ? $this->updated_at->format('c') : null,
        ];
    }
}
