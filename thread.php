<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
$method = $_SERVER['REQUEST_METHOD'];
require_once 'utils.php';

// GET: fetch thread and posts
if ($method === 'GET') {
    $threadId = $_GET['id'] ?? '';
    if (!$threadId) {
        http_response_code(400);
        echo json_encode(["ok"=>false,"error"=>"missingId"]);
        exit;
    }
    $threadFile = "$dataDir/threads/$threadId.json";
    if (!file_exists($threadFile)) {
        http_response_code(404);
        echo json_encode(["ok"=>false,"error"=>"threadNotFound"]);
        exit;
    }
    $thread = json_decode(file_get_contents($threadFile), true);
    $postsDir = "$dataDir/posts/$threadId";
    $posts = [];
    if (is_dir($postsDir)) {
        foreach (glob("$postsDir/*.json") as $file) {
            $posts[] = json_decode(file_get_contents($file), true);
        }
        usort($posts, fn($a,$b)=>$a['created_at'] <=> $b['created_at']);
    }
    echo json_encode(["ok"=>true, "thread"=>$thread, "posts"=>$posts]);
    exit;
}

// POST: add reply
if ($method === 'POST') {
    $user = get_authenticated_user();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["ok"=>false,"error"=>"notAuthenticated"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
    $threadId = $data['thread_id'] ?? '';
    $content = trim($data['content'] ?? '');
    if (!$threadId || !$content) {
        http_response_code(400);
        echo json_encode(["ok"=>false,"error"=>"missingTheadIdOrContent"]);
        exit;
    }
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
    mail($admin_email, "new post on forum: " . $user['username'], $content);
    echo json_encode(["ok"=>true]);
    exit;
}

// DELETE: delete post (must send JSON body with thread_id, post_id)
if ($method === 'DELETE') {
    $user = get_authenticated_user();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["ok"=>false,"error"=>"missingUsername"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
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
    $post = json_decode(file_get_contents($postFile), true);
    if ($post['author'] !== $user['username']) {
        http_response_code(403);
        echo json_encode(["ok"=>false,"error"=>"notPostAuthor"]);
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

http_response_code(405);
echo json_encode(["ok"=>false,"error"=>"methodNotAllowed"]);
exit;
