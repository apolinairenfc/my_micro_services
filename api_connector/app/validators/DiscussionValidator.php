<?php

declare(strict_types=1);

namespace App\Validators;

final class DiscussionValidator
{
    public static function validateCreate(array $data): array
    {
        $errors = [];
        $title = trim((string) ($data['title'] ?? ''));
        $userIds = $data['userIds'] ?? null;

        if ($title === '' || strlen($title) < 3 || strlen($title) > 120) {
            $errors[] = ['field' => 'title', 'message' => 'Title must be 3..120 characters.'];
        }

        if ($userIds !== null) {
            $userIdError = self::validateUserIds($userIds);
            if ($userIdError !== null) {
                $errors[] = ['field' => 'userIds', 'message' => $userIdError];
            }
        }

        return $errors;
    }

    public static function validateUpdate(array $data): array
    {
        $errors = [];

        if (array_key_exists('title', $data)) {
            $title = trim((string) $data['title']);
            if ($title === '' || strlen($title) < 3 || strlen($title) > 120) {
                $errors[] = ['field' => 'title', 'message' => 'Title must be 3..120 characters.'];
            }
        }

        if (array_key_exists('userIds', $data)) {
            $userIdError = self::validateUserIds($data['userIds']);
            if ($userIdError !== null) {
                $errors[] = ['field' => 'userIds', 'message' => $userIdError];
            }
        }

        if ($errors === [] && !array_key_exists('title', $data) && !array_key_exists('userIds', $data)) {
            $errors[] = ['field' => 'body', 'message' => 'At least one field is required.'];
        }

        return $errors;
    }

    public static function normalizeUserIds(array $userIds, int $userId): array
    {
        $normalized = $userIds;
        $normalized[] = $userId;

        $normalized = array_values(array_unique(array_filter($normalized, static function ($value) {
            return is_int($value) && $value > 0;
        })));

        return $normalized;
    }

    private static function validateUserIds($userIds): ?string
    {
        if (!is_array($userIds)) {
            return 'userIds must be an array.';
        }

        if (count($userIds) < 1) {
            return 'userIds must contain at least one element.';
        }

        foreach ($userIds as $id) {
            if (!is_int($id) || $id <= 0) {
                return 'Each userId must be an integer greater than 0.';
            }
        }

        return null;
    }
}
