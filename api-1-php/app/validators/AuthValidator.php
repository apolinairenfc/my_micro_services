<?php

declare(strict_types=1);

namespace App\Validators;

final class AuthValidator
{
    public static function validateRegister(array $data): array
    {
        $errors = [];

        $username = trim((string) ($data['username'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $passwordConfirm = (string) ($data['passwordConfirm'] ?? '');

        if ($username === '' || strlen($username) < 3 || strlen($username) > 50) {
            $errors[] = ['field' => 'username', 'message' => 'Username must be 3..50 characters.'];
        }

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = ['field' => 'email', 'message' => 'Email is invalid.'];
        }

        if ($password === '' || strlen($password) < 8) {
            $errors[] = ['field' => 'password', 'message' => 'Password must be at least 8 characters.'];
        }

        if ($password !== $passwordConfirm) {
            $errors[] = ['field' => 'passwordConfirm', 'message' => 'Password confirmation does not match.'];
        }

        return $errors;
    }

    public static function validateLogin(array $data): array
    {
        $errors = [];

        $login = trim((string) ($data['login'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($login === '') {
            $errors[] = ['field' => 'login', 'message' => 'Login is required.'];
        }

        if ($password === '') {
            $errors[] = ['field' => 'password', 'message' => 'Password is required.'];
        }

        return $errors;
    }
}
