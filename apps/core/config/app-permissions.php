<?php

return [
    'permissions' => [
        'dashboard' => [
            'dashboard.view',
        ],

        'users' => [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
        ],

        'roles' => [
            'roles.view',
            'roles.manage',
        ],

        'students' => [
            'students.view',
            'students.create',
            'students.update',
            'students.delete',
            'students.import',
            'students.activate_account',
        ],

        'permits' => [
            'permits.view',
            'permits.issue',
            'permits.revoke',
        ],

        'nfc_cards' => [
            'nfc_cards.view',
            'nfc_cards.manage',
        ],

        'verification' => [
            'verification.perform',
            'verification.view_logs',
        ],

        'payments' => [
            'payments.view',
            'payments.manage',
        ],

        'settings' => [
            'settings.view',
            'settings.update',
        ],

        'audit_logs' => [
            'audit_logs.view',
        ],
    ],

    'roles' => [
        'super_admin' => ['*'],

        'admin' => [
            'dashboard.view',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'roles.view',
            'roles.manage',
            'students.view',
            'students.create',
            'students.update',
            'students.delete',
            'students.import',
            'students.activate_account',
            'permits.view',
            'permits.issue',
            'permits.revoke',
            'nfc_cards.view',
            'nfc_cards.manage',
            'verification.perform',
            'verification.view_logs',
            'payments.view',
            'payments.manage',
            'settings.view',
            'settings.update',
            'audit_logs.view',
        ],

        'staff' => [
            'dashboard.view',
            'students.view',
            'students.update',
            'permits.view',
            'permits.issue',
            'permits.revoke',
            'nfc_cards.view',
            'verification.perform',
            'verification.view_logs',
            'payments.view',
            'settings.view',
        ],

        'student' => [
            'dashboard.view',
            'permits.view',
            'payments.view',
            'settings.view',
            'settings.update',
        ],
    ],

    'super_admin' => [
        'name' => env('SUPER_ADMIN_NAME'),
        'email' => env('SUPER_ADMIN_EMAIL'),
        'password' => env('SUPER_ADMIN_PASSWORD'),
    ],
];
