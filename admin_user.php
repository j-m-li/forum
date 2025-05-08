<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//
header("Content-Type: application/json");
require_once 'utils.php';
$user = get_authenticated_user();
if (!$user || empty($user['is_admin'])) {
    http_response_code(403);
    echo json_encode(["ok"=>false,"error"=>"adminOnly"]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $target = trim($data['username'] ?? '');
    $action = $data['action'] ?? '';
    if (!$target || !in_array($action, ['promote','demote'])) {
        http_response_code(400);
        echo json_encode(["ok"=>false,"error"=>"missingParams"]);
        exit;
    }
    $userFile = "$dataDir/users/$target.json";
    if (!file_exists($userFile)) {
        http_response_code(404);
        echo json_encode(["ok"=>false,"error"=>"userNotFound"]);
        exit;
    }
    $ud = json_decode(file_get_contents($userFile), true);
    if ($action == 'promote') $ud['is_admin'] = true;
    else unset($ud['is_admin']);
    file_put_contents($userFile, json_encode($ud, JSON_PRETTY_PRINT));
    echo json_encode(["ok"=>true]);
    exit;
}
http_response_code(405);
echo json_encode(["ok"=>false,"error"=>"methodNotAllowed"]);
