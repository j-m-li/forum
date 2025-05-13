<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'xmlrpc.php';
$user = get_authenticated_user();
if (!$user || empty($user['is_admin'])) {
    http_response_code(403);
    echo json_encode(["ok"=>false,"error"=>"adminOnly"]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $target = trim($data['username'] ?? '');
    if (!$target) {
        http_response_code(400);
        echo json_encode(["ok"=>false,"error"=>"missingUsername"]);
        exit;
    }
    if ($target === $user['username']) {
        http_response_code(400);
        echo json_encode(["ok"=>false,"error"=>"cannotDeleteOwnAccount"]);
        exit;
    }
    $userFile = "$dataDir/users/$target.json";
    if (!file_exists($userFile)) {
        http_response_code(404);
        echo json_encode(["ok"=>false,"error"=>"userNotFound"]);
        exit;
    }
    unlink($userFile);
    echo json_encode(["ok"=>true]);
    exit;
}
http_response_code(405);
echo json_encode(["ok"=>false,"error"=>"methodNotAllowed"]);
