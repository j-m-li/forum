<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

$admin_email = "info@site-suisse.ch";

$dataDir = dirname(__DIR__) . '/data';
function get_authenticated_user() {
    $headers = getallheaders();
    $username = $headers['X-Auth-User'] ?? '';
    $token = $headers['X-Auth-Token'] ?? '';
    if (!$username || !$token) return false;
    $userFile = "$GLOBALS[dataDir]/users/$username.json";
    if (!file_exists($userFile)) return false;
    $user = json_decode(file_get_contents($userFile), true);
    if (!isset($user['token']) || $user['token'] !== $token) return false;
    return $user;
}
?>
