<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'utils.php';
$query = strtolower(trim($_GET['q'] ?? ''));
$threadId = $_GET['thread_id'] ?? null;
if (!$query) {
    http_response_code(400);
    echo json_encode(["ok"=>false,"error"=>"missingSearchQuery"]);
    exit;
}
$results = [];
if ($threadId) {
    // Search only in one thread
    $postsDir = "$dataDir/posts/$threadId";
    if (is_dir($postsDir)) {
        foreach (glob("$postsDir/*.json") as $file) {
            $post = json_decode(file_get_contents($file), true);
            if (strpos(strtolower($post['content']), $query) !== false) {
                $post['thread_id'] = $threadId;
                $results[] = $post;
            }
        }
    }
} else {
    // Search all threads
    $postsBase = "$dataDir/posts";
    foreach (glob("$postsBase/*") as $threadDir) {
        if (!is_dir($threadDir)) continue;
        $threadId = basename($threadDir);
        foreach (glob("$threadDir/*.json") as $file) {
            $post = json_decode(file_get_contents($file), true);
            if (strpos(strtolower($post['content']), $query) !== false) {
                $post['thread_id'] = $threadId;
                $results[] = $post;
            }
        }
    }
}
usort($results, fn($a,$b)=>$b['created_at'] <=> $a['created_at']);
echo json_encode(["ok"=>true, "results"=>$results]);
