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

        'executives' => [
            'executives.view',
            'executives.create',
            'executives.update',
            'executives.delete',
            'executives.activate',
            'executives.manage_profiles',
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

        'academic_periods' => [
            'academic_periods.view',
            'academic_periods.manage',
        ],

        'permits' => [
            'permits.view',
            'permits.issue',
            'permits.revoke',
        ],

        'permit_settings' => [
            'permit_settings.view',
            'permit_settings.update',
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

        'reports' => [
            'reports.view',
        ],

        'announcements' => [
            'announcements.view',
            'announcements.create',
            'announcements.update',
            'announcements.publish',
            'announcements.delete',
        ],

        'events' => [
            'events.view',
            'events.create',
            'events.update',
            'events.publish',
            'events.delete',
        ],

        'documents' => [
            'documents.view',
            'documents.create',
            'documents.update',
            'documents.publish',
            'documents.delete',
        ],

        'polls' => [
            'polls.view',
            'polls.create',
            'polls.update',
            'polls.publish',
            'polls.delete',
            'polls.vote',
            'polls.view_results',
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
            'executives.view',
            'executives.create',
            'executives.update',
            'executives.delete',
            'executives.activate',
            'executives.manage_profiles',
            'roles.view',
            'roles.manage',
            'students.view',
            'students.create',
            'students.update',
            'students.delete',
            'students.import',
            'students.activate_account',
            'academic_periods.view',
            'academic_periods.manage',
            'permits.view',
            'permits.issue',
            'permits.revoke',
            'permit_settings.view',
            'permit_settings.update',
            'nfc_cards.view',
            'nfc_cards.manage',
            'verification.perform',
            'verification.view_logs',
            'payments.view',
            'payments.manage',
            'settings.view',
            'settings.update',
            'audit_logs.view',
            'reports.view',
            'announcements.view',
            'announcements.create',
            'announcements.update',
            'announcements.publish',
            'announcements.delete',
            'events.view',
            'events.create',
            'events.update',
            'events.publish',
            'events.delete',
            'documents.view',
            'documents.create',
            'documents.update',
            'documents.publish',
            'documents.delete',
            'polls.view',
            'polls.create',
            'polls.update',
            'polls.publish',
            'polls.delete',
            'polls.vote',
            'polls.view_results',
        ],

        'staff' => [
            'dashboard.view',
            'students.view',
            'students.update',
            'academic_periods.view',
            'permits.view',
            'permits.issue',
            'permits.revoke',
            'nfc_cards.view',
            'verification.perform',
            'verification.view_logs',
            'payments.view',
            'settings.view',
            'reports.view',
            'announcements.view',
            'events.view',
            'documents.view',
            'polls.view',
        ],

        'student' => [
            'dashboard.view',
            'permits.view',
            'payments.view',
            'polls.view',
            'polls.vote',
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
