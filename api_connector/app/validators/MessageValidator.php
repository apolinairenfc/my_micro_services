<?php

declare(strict_types=1);

namespace App\Validators;

final class MessageValidator
{
    public static function validateContent(array $data): array
    {
        $errors = [];
        $content = (string) ($data['content'] ?? '');
        $length = strlen($content);

        if ($length < 1 || $length > 2000) {
            $errors[] = ['field' => 'content', 'message' => 'Content must be 1..2000 characters.'];
        }

        return $errors;
    }
}
