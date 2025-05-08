<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'utils.php';
$threads = [];
$threadsDir = "$dataDir/threads";
if (is_dir($threadsDir)) {
    foreach (glob("$threadsDir/*.json") as $file) {
        $threads[] = json_decode(file_get_contents($file), true);
    }
    usort($threads, fn($a,$b)=>$b['created_at'] <=> $a['created_at']);
}
echo json_encode(["ok"=>true, "threads"=>$threads]);
