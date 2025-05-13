<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'xmlrpc.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = get_authenticated_user();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["ok" => false, "error" => "notAuthenticated"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
    $title = trim($data['title'] ?? '');
    $content = trim($data['content'] ?? '');
    if (!$title || !$content) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "titleContentRequired"]);
        exit;
    }
    $threadId = uniqid();
    $threadsDir = "$dataDir/threads";
    if (!is_dir($threadsDir)) mkdir($threadsDir, 0777, true);
    $threadFile = "$threadsDir/$threadId.json";
    $threadData = [
        'id' => $threadId,
        'title' => $title,
        'author' => $user['username'],
        'created_at' => time()
    ];
    file_put_contents($threadFile, json_encode($threadData, JSON_PRETTY_PRINT));
    $postsDir = "$dataDir/posts/$threadId";
    if (!is_dir($postsDir)) mkdir($postsDir, 0777, true);
    $postId = uniqid();
    $postData = [
        'id' => $postId,
        'thread_id' => $threadId,
        'author' => $user['username'],
        'content' => $content,
        'created_at' => time()
    ];
    file_put_contents("$postsDir/$postId.json", json_encode($postData, JSON_PRETTY_PRINT));
    echo json_encode(["ok" => true, "thread_id" => $threadId]);
    exit;
}
http_response_code(405);
echo json_encode(["ok"=>false,"error"=>"methodNotAllowed"]);
