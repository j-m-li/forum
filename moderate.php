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
    $action = $data['action'] ?? '';
    if ($action === "delete_thread") {
        $threadId = $data['thread_id'] ?? '';
        if (!$threadId) {
            http_response_code(400);
            echo json_encode(["ok"=>false,"error"=>"missingThreadId"]);
            exit;
        }
        $threadFile = "$dataDir/threads/$threadId.json";
        $postsDir = "$dataDir/posts/$threadId";
        if (file_exists($threadFile)) unlink($threadFile);
        if (is_dir($postsDir)) {
            foreach (glob("$postsDir/*.json") as $postFile) unlink($postFile);
            rmdir($postsDir);
        }
        echo json_encode(["ok"=>true]);
        exit;
    }
    if ($action === "delete_post") {
        $threadId = $data['thread_id'] ?? '';
        $postId = $data['post_id'] ?? '';
        if (!$threadId || !$postId) {
            http_response_code(400);
            echo json_encode(["ok"=>false,"error"=>"missingPostId"]);
            exit;
        }
        $postFile = "$dataDir/posts/$threadId/$postId.json";
        if (!file_exists($postFile)) {
            http_response_code(404);
            echo json_encode(["ok"=>false,"error"=>"postNotFound"]);
            exit;
        }
        $postsDir = "$dataDir/posts/$threadId";
        $allPosts = glob("$postsDir/*.json");
        usort($allPosts, function($a, $b) {
            return filemtime($a) <=> filemtime($b);
        });
        if (count($allPosts) > 0 && realpath($allPosts[0]) === realpath($postFile)) {
            http_response_code(400);
            echo json_encode(["ok"=>false,"error"=>"cannotDeleteFirstPost"]);
            exit;
        }
        unlink($postFile);
        echo json_encode(["ok"=>true]);
        exit;
    }
    http_response_code(400);
    echo json_encode(["ok"=>false,"error"=>"invalidAction"]);
    exit;
}
http_response_code(405);
echo json_encode(["ok"=>false,"error"=>"methodNotAllowed"]);
