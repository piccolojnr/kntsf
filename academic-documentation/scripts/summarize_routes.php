<?php

$jsonPath = dirname(__DIR__) . '/.route-list.json';
$routes = json_decode(file_get_contents($jsonPath), true);

$groups = [
    'Public portal and self-service' => [],
    'Operations dashboard (web)' => [],
    'Mobile API (/api/mobile)' => [],
    'Health and account setup' => [],
];

foreach ($routes as $route) {
    $uri = $route['uri'] ?? '';
    $method = $route['method'] ?? 'GET';
    if (is_array($method)) {
        $method = implode('|', $method);
    }

    $name = $route['name'] ?? '';
    $line = "{$method} | {$uri} | {$name}";

    if (str_starts_with($uri, 'api/mobile')) {
        $groups['Mobile API (/api/mobile)'][] = $line;
    } elseif (
        $uri === '/'
        || str_contains($uri, 'public')
        || str_starts_with($uri, 'permit-request')
    ) {
        $groups['Public portal and self-service'][] = $line;
    } elseif (str_starts_with($uri, 'health/') || str_starts_with($uri, 'account/')) {
        $groups['Health and account setup'][] = $line;
    } else {
        $groups['Operations dashboard (web)'][] = $line;
    }
}

foreach ($groups as $title => $lines) {
    sort($lines);
    echo "## {$title}\n\n";
    echo '| Method | URI | Route name |' . "\n";
    echo '| --- | --- | --- |' . "\n";
    foreach ($lines as $line) {
        [$m, $u, $n] = array_pad(explode(' | ', $line, 3), 3, '');
        echo "| {$m} | `{$u}` | {$n} |\n";
    }
    echo "\n";
}
