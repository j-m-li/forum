<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'xmlrpc.php';
$usersDir = "$dataDir/users/";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    $userFile = $usersDir . $username . '.json';
    if (file_exists($userFile)) {
        $user = json_decode(file_get_contents($userFile), true);
        if (password_verify($password, $user['password'])) {
            $token = bin2hex(random_bytes(16));
            $user['token'] = $token;
            file_put_contents($userFile, json_encode($user, JSON_PRETTY_PRINT));
            header("X-Auth-User: $username");
            header("X-Auth-Token: $token");
            echo json_encode(["ok" => true, "username" => $username, "token" => $token]);
            exit;
        }
    }
    http_response_code(403);
    echo json_encode(["ok" => false, "error" => "invalidCredentials"]);
    exit;
}
