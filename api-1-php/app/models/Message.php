<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'discussion_id',
        'user_id',
        'content',
    ];

    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'discussionId' => $this->discussion_id,
            'userId' => $this->user_id,
            'content' => $this->content,
            'createdAt' => $this->created_at ? $this->created_at->format('c') : null,
            'updatedAt' => $this->updated_at ? $this->updated_at->format('c') : null,
        ];
    }
}
