<?php

declare(strict_types=1);

namespace App\Validators;

final class MessageValidator
{
    public static function validateCreate(array $data): array
    {
        $errors = [];

        $discussionId = trim((string) ($data['discussionId'] ?? ''));
        $content = (string) ($data['content'] ?? '');

        if ($discussionId === '') {
            $errors[] = ['field' => 'discussionId', 'message' => 'Discussion ID is required.'];
        }

        $contentLength = strlen($content);
        if ($contentLength < 1 || $contentLength > 2000) {
            $errors[] = ['field' => 'content', 'message' => 'Content must be 1..2000 characters.'];
        }

        return $errors;
    }

    public static function validateUpdate(array $data): array
    {
        $errors = [];

        if (!array_key_exists('content', $data)) {
            $errors[] = ['field' => 'content', 'message' => 'Content is required.'];
            return $errors;
        }

        $content = (string) $data['content'];
        $contentLength = strlen($content);
        if ($contentLength < 1 || $contentLength > 2000) {
            $errors[] = ['field' => 'content', 'message' => 'Content must be 1..2000 characters.'];
        }

        return $errors;
    }
}
