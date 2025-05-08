<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = get_authenticated_user();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["ok" => false, "error" => "notAuthenticated"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
    $current = $data['current_password'] ?? '';
    $new = $data['new_password'] ?? '';
    $new2 = $data['new_password2'] ?? '';
    if (!$current || !$new || !$new2) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "allFieldsRequired"]);
        exit;
    } elseif (!password_verify($current, $user['password'])) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "currentPasswordIncorrect"]);
        exit;
    } elseif ($new !== $new2) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "passwordMismatch"]);
        exit;
    } elseif (strlen($new) < 4) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "passwordTooShort"]);
        exit;
    }
    $user['password'] = password_hash($new, PASSWORD_DEFAULT);
    $userFile = "$GLOBALS[dataDir]/users/{$user['username']}.json";
    file_put_contents($userFile, json_encode($user, JSON_PRETTY_PRINT));
    echo json_encode(["ok" => true, "message" => "Password changed successfully."]);
    exit;
}
